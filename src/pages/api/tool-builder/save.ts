import { getCfEnv } from '../../../lib/cf-env';
import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return json({ error: 'Not authenticated' }, 401);
  if (!locals.isPremium) return json({ error: 'Premium required' }, 403);

  const { title, description, prompt, code, isPublic } = await request.json();
  if (!title || !prompt || !code) return json({ error: 'Missing required fields' }, 400);

  const db = (await getCfEnv(locals)).DB;
  const id = crypto.randomUUID().replace(/-/g, '');
  const shareSlug = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  // Default to public (1). User must explicitly set private (0).
  const publicFlag = isPublic === false ? 0 : 1;

  await db
    .prepare('INSERT INTO custom_tools (id, user_id, title, description, prompt, generated_code, is_public, share_slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, locals.user.id, title, description || '', prompt, code, publicFlag, shareSlug)
    .run();

  return json({ id, shareSlug, isPublic: publicFlag === 1 });
};

function json(data: unknown, status: number = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
