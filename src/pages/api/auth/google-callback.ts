import type { APIRoute } from 'astro';
import { getUserByEmail, createUser } from '../../../lib/db';
import { createSession } from '../../../lib/session';
import { generateToken, hashPassword } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals, redirect }) => {
  const code = url.searchParams.get('code');
  if (!code) return redirect('/login?error=google_failed');

  const env = (locals.runtime?.env || {}) as Record<string, string>;
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return redirect('/login?error=google_not_configured');
  }

  const redirectUri = 'https://utilitydocker.com/api/auth/google-callback';

  try {
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
      console.error('[google] Token error:', await tokenRes.text());
      return redirect('/login?error=google_token_failed');
    }

    const tokens = await tokenRes.json();

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) return redirect('/login?error=google_userinfo_failed');

    const googleUser = await userRes.json();
    const email = googleUser.email?.toLowerCase();
    if (!email) return redirect('/login?error=no_email');

    const db = locals.runtime.env.DB;
    let user = await getUserByEmail(db, email);

    if (!user) {
      const pw = await hashPassword(generateToken());
      const userId = await createUser(db, email, pw, '');
      await db.prepare('UPDATE users SET email_verified = 1, email_verify_token = NULL WHERE id = ?').bind(userId).run();
      user = await getUserByEmail(db, email);
    }

    if (!user) return redirect('/login?error=create_failed');

    const { cookie } = await createSession(locals.runtime.env.SESSIONS, user.id);

    return new Response(null, {
      status: 302,
      headers: { Location: '/account', 'Set-Cookie': cookie },
    });
  } catch (error) {
    console.error('[google/callback]', error);
    return redirect('/login?error=google_failed');
  }
};
