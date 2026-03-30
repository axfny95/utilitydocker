import { getCfEnv } from '../../../lib/cf-env';
import type { APIRoute } from 'astro';
import { getUserCustomTools } from '../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const tools = await getUserCustomTools((await getCfEnv(locals)).DB, locals.user.id);
  return new Response(JSON.stringify({ tools }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
