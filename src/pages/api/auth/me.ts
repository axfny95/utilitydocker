import { getCfEnv } from '../../../lib/cf-env';
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ user: null, isPremium: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      user: {
        id: locals.user.id,
        email: locals.user.email,
        emailVerified: locals.user.emailVerified,
        createdAt: locals.user.createdAt,
      },
      isPremium: locals.isPremium,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
};
