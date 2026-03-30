import { getCfEnv } from '../../../lib/cf-env';
import type { APIRoute } from 'astro';
import { verifyPassword, validateEmail } from '../../../lib/auth';
import { getUserByEmail } from '../../../lib/db';
import { createSession } from '../../../lib/session';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return json({ error: 'Email and password are required' }, 400);
    }

    if (!validateEmail(email)) {
      return json({ error: 'Invalid email address' }, 400);
    }

    const env = (await getCfEnv(locals));
    const user = await getUserByEmail(env.DB, email.toLowerCase());

    if (!user) {
      return json({ error: 'Invalid email or password' }, 401);
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return json({ error: 'Invalid email or password' }, 401);
    }

    // Create session
    const { cookie } = await createSession(env.SESSIONS, user.id);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      },
    });
  } catch (error) {
    console.error('[login]', error);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
};

function json(data: Record<string, unknown>, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
