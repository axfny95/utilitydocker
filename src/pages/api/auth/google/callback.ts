import type { APIRoute } from 'astro';
import { getUserByEmail, createUser } from '../../../../lib/db';
import { createSession } from '../../../../lib/session';
import { generateToken } from '../../../../lib/auth';

export const prerender = false;

// Step 2: Handle Google's callback with auth code
export const GET: APIRoute = async ({ url, locals, redirect }) => {
  const code = url.searchParams.get('code');
  if (!code) {
    return redirect('/login?error=google_failed');
  }

  const clientId = import.meta.env.GOOGLE_CLIENT_ID;
  const clientSecret = import.meta.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = 'https://utilitydocker.com/api/auth/google/callback';

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      return redirect('/login?error=google_token_failed');
    }

    const tokens = await tokenRes.json();

    // Get user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) {
      return redirect('/login?error=google_userinfo_failed');
    }

    const googleUser = await userRes.json();
    const email = googleUser.email?.toLowerCase();

    if (!email) {
      return redirect('/login?error=no_email');
    }

    const env = locals.runtime.env;

    // Check if user already exists
    let user = await getUserByEmail(env.DB, email);

    if (!user) {
      // Create new user — Google users are auto-verified
      const randomPassword = generateToken(); // They won't use password login
      const { hashPassword } = await import('../../../../lib/auth');
      const passwordHash = await hashPassword(randomPassword);

      const userId = await createUser(env.DB, email, passwordHash, '');

      // Mark email as verified (Google already verified it)
      await env.DB.prepare('UPDATE users SET email_verified = 1, email_verify_token = NULL WHERE id = ?')
        .bind(userId)
        .run();

      user = await getUserByEmail(env.DB, email);
    }

    if (!user) {
      return redirect('/login?error=create_failed');
    }

    // Create session
    const { cookie } = await createSession(env.SESSIONS, user.id);

    return new Response(null, {
      status: 302,
      headers: {
        Location: '/account',
        'Set-Cookie': cookie,
      },
    });
  } catch (error) {
    console.error('[google/callback]', error);
    return redirect('/login?error=google_failed');
  }
};
