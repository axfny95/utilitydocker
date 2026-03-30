import { getCfEnv } from '../../../lib/cf-env';
import type { APIRoute } from 'astro';

export const prerender = false;

// Get a custom tool
export const GET: APIRoute = async ({ params, locals }) => {
  const db = (await getCfEnv(locals)).DB;
  const tool = await db
    .prepare('SELECT * FROM custom_tools WHERE id = ?')
    .bind(params.id)
    .first();

  if (!tool) return json({ error: 'Tool not found' }, 404);

  // If private, only the owner can view
  if (!tool.is_public && (!locals.user || locals.user.id !== tool.user_id)) {
    return json({ error: 'This tool is private' }, 403);
  }

  return json({ tool });
};

// Update a custom tool (visibility, title, description)
export const PUT: APIRoute = async ({ params, request, locals }) => {
  if (!locals.user) return json({ error: 'Not authenticated' }, 401);

  const db = (await getCfEnv(locals)).DB;
  const existing = await db
    .prepare('SELECT * FROM custom_tools WHERE id = ? AND user_id = ?')
    .bind(params.id, locals.user.id)
    .first();

  if (!existing) return json({ error: 'Tool not found or not yours' }, 404);

  const body = await request.json();
  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.title !== undefined) { updates.push('title = ?'); values.push(body.title); }
  if (body.description !== undefined) { updates.push('description = ?'); values.push(body.description); }
  if (body.isPublic !== undefined) { updates.push('is_public = ?'); values.push(body.isPublic ? 1 : 0); }

  if (updates.length === 0) return json({ error: 'Nothing to update' }, 400);

  updates.push('updated_at = ?');
  values.push(Math.floor(Date.now() / 1000));
  values.push(params.id);
  values.push(locals.user.id);

  await db
    .prepare(`UPDATE custom_tools SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`)
    .bind(...values)
    .run();

  return json({ ok: true });
};

// Delete a custom tool
export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!locals.user) return json({ error: 'Not authenticated' }, 401);

  await (await getCfEnv(locals)).DB
    .prepare('DELETE FROM custom_tools WHERE id = ? AND user_id = ?')
    .bind(params.id, locals.user.id)
    .run();

  return json({ ok: true });
};

function json(data: unknown, status: number = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
