import type { APIRoute } from 'astro';
import { getUserFavorites, addFavorite } from '../../../lib/db';

export const prerender = false;

function json(data: unknown, status: number = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) return json({ error: 'Not authenticated' }, 401);
  const favorites = await getUserFavorites(locals.runtime.env.DB, locals.user.id);
  return json({ favorites: favorites.map((f) => f.tool_slug) });
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return json({ error: 'Not authenticated' }, 401);

  const { toolSlug } = await request.json();
  if (!toolSlug || typeof toolSlug !== 'string') return json({ error: 'Invalid tool slug' }, 400);

  await addFavorite(locals.runtime.env.DB, locals.user.id, toolSlug);
  return json({ ok: true });
};
