import type { APIRoute } from 'astro';

export const prerender = false;

// List all public community tools
export const GET: APIRoute = async ({ url, locals }) => {
  const db = locals.runtime.env.DB;
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  const tools = await db
    .prepare(`
      SELECT ct.id, ct.title, ct.description, ct.share_slug, ct.created_at, u.email as creator_email
      FROM custom_tools ct
      JOIN users u ON ct.user_id = u.id
      WHERE ct.is_public = 1
      ORDER BY ct.created_at DESC
      LIMIT ? OFFSET ?
    `)
    .bind(limit, offset)
    .all();

  const countResult = await db
    .prepare('SELECT COUNT(*) as total FROM custom_tools WHERE is_public = 1')
    .first<{ total: number }>();

  return new Response(JSON.stringify({
    tools: tools.results,
    total: countResult?.total || 0,
    page,
    totalPages: Math.ceil((countResult?.total || 0) / limit),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
