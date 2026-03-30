import type { APIRoute } from 'astro';
import { getUserByEmail, createUser } from '../../../lib/db';
import { createSession } from '../../../lib/session';
import { generateToken, hashPassword } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals, redirect }) => {
  const code = url.searchParams.get('code');
  if (!code) return redirect('/login?error=no_code');

  let cfEnv: any;
  try {
    const mod = await import('cloudflare:workers');
    cfEnv = mod.env;
  } catch {
    cfEnv = (locals as any).runtime?.env || {};
  }

  const clientId = cfEnv.GOOGLE_CLIENT_ID;
  const clientSecret = cfEnv.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response(JSON.stringify({ error: 'Missing Google credentials' }), { status: 500 });
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: 'https://utilitydocker.com/api/auth/google-callback',
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return new Response(JSON.stringify({ error: 'token_failed', details: err }), { status: 500 });
    }

    const tokens = await tokenRes.json();

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: 'userinfo_failed' }), { status: 500 });
    }

    const googleUser = await userRes.json();
    const email = googleUser.email?.toLowerCase();
    if (!email) {
      return new Response(JSON.stringify({ error: 'no_email' }), { status: 500 });
    }

    const db = cfEnv.DB;
    const sessions = cfEnv.SESSIONS;

    let user = await getUserByEmail(db, email);

    if (!user) {
      const pw = await hashPassword(generateToken());
      const userId = await createUser(db, email, pw, '');
      await db.prepare('UPDATE users SET email_verified = 1, email_verify_token = NULL WHERE id = ?')
        .bind(userId).run();
      user = await getUserByEmail(db, email);
    }

    if (!user) {
      return new Response(JSON.stringify({ error: 'create_failed' }), { status: 500 });
    }

    const { cookie } = await createSession(sessions, user.id);

    return new Response(null, {
      status: 302,
      headers: { Location: '/account', 'Set-Cookie': cookie },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: 'callback_error', details: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
