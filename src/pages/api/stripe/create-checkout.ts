import type { APIRoute } from 'astro';
import { createCheckoutSession } from '../../../lib/stripe';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated' }, 401);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const plan = body.plan || 'premium_plus';

    const origin = new URL(request.url).origin;

    // Select price ID based on plan
    const priceId = plan === 'premium'
      ? import.meta.env.STRIPE_PRICE_ID_PREMIUM      // $5/mo
      : import.meta.env.STRIPE_PRICE_ID_PREMIUM_PLUS; // $7/mo

    if (!priceId) {
      return json({ error: 'Stripe not configured for this plan' }, 500);
    }

    const { url } = await createCheckoutSession({
      priceId,
      successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/checkout/cancel`,
      customerEmail: locals.user.email,
    });

    return json({ url });
  } catch (error) {
    console.error('[stripe/create-checkout]', error);
    return json({ error: 'Failed to create checkout session' }, 500);
  }
};

function json(data: Record<string, unknown>, status: number = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
