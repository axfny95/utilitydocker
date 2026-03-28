import type { APIRoute } from 'astro';
import { generateTool, MAX_GENERATIONS_PER_MONTH } from '../../../lib/tool-builder';
import { countTodayGenerations } from '../../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  // Auth check
  if (!locals.user) {
    return json({ error: 'Not authenticated' }, 401);
  }

  // Premium check
  if (!locals.isPremium) {
    return json({ error: 'Premium subscription required' }, 403);
  }

  // Rate limit check (monthly)
  const db = locals.runtime.env.DB;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthStartUnix = Math.floor(monthStart.getTime() / 1000);

  const monthCount = await db
    .prepare('SELECT COUNT(*) as count FROM ai_generations WHERE user_id = ? AND created_at > ?')
    .bind(locals.user.id, monthStartUnix)
    .first<{ count: number }>();

  if ((monthCount?.count || 0) >= MAX_GENERATIONS_PER_MONTH) {
    return json({
      error: `Monthly generation limit reached (${MAX_GENERATIONS_PER_MONTH}/month). Resets on the 1st.`,
      remaining: 0,
    }, 429);
  }

  // Validate input
  const { prompt } = await request.json();
  if (!prompt || typeof prompt !== 'string' || prompt.length > 2000) {
    return json({ error: 'Prompt is required (max 2000 characters)' }, 400);
  }

  // Generate
  const apiKey = import.meta.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return json({ error: 'AI service not configured' }, 500);
  }

  try {
    const result = await generateTool(prompt, apiKey);

    // Log generation for tracking
    const id = crypto.randomUUID().replace(/-/g, '');
    await db
      .prepare('INSERT INTO ai_generations (id, user_id, prompt_tokens, completion_tokens, model, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, locals.user.id, result.tokensUsed.prompt, result.tokensUsed.completion, 'claude-sonnet-4-20250514', Math.floor(Date.now() / 1000))
      .run();

    const remaining = MAX_GENERATIONS_PER_MONTH - (monthCount?.count || 0) - 1;

    return json({
      code: result.code,
      title: result.title,
      description: result.description,
      remaining,
    });
  } catch (error) {
    console.error('[tool-builder/generate]', error);
    return json({ error: error instanceof Error ? error.message : 'Generation failed' }, 500);
  }
};

function json(data: unknown, status: number = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
