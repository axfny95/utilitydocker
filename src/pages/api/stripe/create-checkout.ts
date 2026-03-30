import { getCfEnv } from '../../../lib/cf-env';
import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated' }, 401);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const plan = body.plan || 'premium_plus';
    const origin = new URL(request.url).origin;

    // Get env vars from Cloudflare Workers runtime
    const env = await getCfEnv(locals);

    // Single premium plan at $7/mo — use PREMIUM_PLUS price ID
    const priceId = env.STRIPE_PRICE_ID_PREMIUM_PLUS || env.STRIPE_PRICE_ID_PREMIUM;

    const stripeKey = env.STRIPE_SECRET_KEY;

    if (!priceId || !stripeKey) {
      return json({ error: 'Stripe not configured for this plan' }, 500);
    }

    // Create Stripe Checkout Session directly
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        mode: 'subscription',
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout/cancel`,
        customer_email: locals.user.email,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return json({ error: err.error?.message || 'Stripe error' }, 500);
    }

    const session = await response.json();
    return json({ url: session.url });
  } catch (error) {
    console.error('[stripe/create-checkout]', error);
    return json({ error: 'Failed to create checkout session' }, 500);
  }
};

function json(data: Record<string, unknown>, status: number = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
