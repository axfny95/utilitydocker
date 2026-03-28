import type { APIRoute } from 'astro';
import { createCheckoutSession } from '../../../lib/stripe';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const origin = new URL(request.url).origin;
    const priceId = import.meta.env.STRIPE_PRICE_ID_MONTHLY;

    if (!priceId) {
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const { url } = await createCheckoutSession({
      priceId,
      successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/checkout/cancel`,
      customerEmail: locals.user.email,
    });

    return new Response(JSON.stringify({ url }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('[stripe/create-checkout]', error);
    return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
