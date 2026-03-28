import type { APIRoute } from 'astro';
import { verifyUserEmail } from '../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const token = url.searchParams.get('token');
  if (!token) {
    return new Response(JSON.stringify({ error: 'Missing token' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const verified = await verifyUserEmail(locals.runtime.env.DB, token);
  if (!verified) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
