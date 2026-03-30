import { getCfEnv } from '../../../lib/cf-env';
import type { APIRoute } from 'astro';
import { destroySession } from '../../../lib/session';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const cookieHeader = request.headers.get('cookie');
  const clearCookie = await destroySession((await getCfEnv(locals)).SESSIONS, cookieHeader);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearCookie,
    },
  });
};
