import { getCfEnv } from '../../../lib/cf-env';
import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user?.stripeCustomerId) {
    return new Response(JSON.stringify({ error: 'No subscription found' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const origin = new URL(request.url).origin;
    const res = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${(await getCfEnv(locals)).STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: locals.user.stripeCustomerId,
        return_url: `${origin}/account/billing`,
      }),
    });

    const session = await res.json();
    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('[stripe/portal]', error);
    return new Response(JSON.stringify({ error: 'Failed to create portal session' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
