import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals, redirect, request }) => {
  try {
    const code = url.searchParams.get('code');
    if (!code) return new Response('no code', { status: 400 });

    // Step 1: Get env
    let cfEnv: any;
    try {
      cfEnv = (await import('cloudflare:workers')).env;
    } catch {
      cfEnv = (locals as any).runtime?.env || {};
    }

    if (!cfEnv?.GOOGLE_CLIENT_ID) {
      return new Response('step1: no GOOGLE_CLIENT_ID', { status: 500 });
    }

    // Step 2: Exchange code
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: cfEnv.GOOGLE_CLIENT_ID,
        client_secret: cfEnv.GOOGLE_CLIENT_SECRET,
        redirect_uri: 'https://utilitydocker.com/api/auth/google-callback',
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      return new Response('step2: token failed - ' + await tokenRes.text(), { status: 500 });
    }

    const tokens = await tokenRes.json();

    // Step 3: Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) {
      return new Response('step3: userinfo failed', { status: 500 });
    }

    const googleUser = await userRes.json();
    const email = googleUser.email?.toLowerCase();
    if (!email) return new Response('step3: no email', { status: 500 });

    // Step 4: DB operations
    const { getUserByEmail, createUser } = await import('../../../lib/db');
    const { createSession } = await import('../../../lib/session');

    const db = cfEnv.DB;
    const sessions = cfEnv.SESSIONS;

    if (!db) return new Response('step4: no DB binding', { status: 500 });
    if (!sessions) return new Response('step4: no SESSIONS binding', { status: 500 });

    let user = await getUserByEmail(db, email);

    if (!user) {
      // Step 5: Create user (Google users get a simple hash — they use Google to login, never password)
      const simplePw = 'google-oauth-' + crypto.randomUUID();
      const userId = await createUser(db, email, simplePw, '');
      await db.prepare('UPDATE users SET email_verified = 1, email_verify_token = NULL WHERE id = ?')
        .bind(userId).run();
      user = await getUserByEmail(db, email);
    }

    if (!user) return new Response('step5: user creation failed', { status: 500 });

    // Step 6: Create session
    const { cookie } = await createSession(sessions, user.id);

    return new Response(null, {
      status: 302,
      headers: { Location: '/account', 'Set-Cookie': cookie },
    });
  } catch (error) {
    return new Response('catch: ' + (error instanceof Error ? error.message + '\n' + error.stack : String(error)), { status: 500 });
  }
};
