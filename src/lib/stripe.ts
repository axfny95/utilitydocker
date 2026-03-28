/**
 * Stripe integration for UtilityDocker Premium.
 * Activated when Stripe keys are configured in environment variables.
 *
 * Flow:
 * 1. User clicks "Go Premium" on /pricing
 * 2. Client calls /api/create-checkout (creates Stripe Checkout Session)
 * 3. User completes payment on Stripe-hosted page
 * 4. Stripe redirects back with session_id
 * 5. /api/stripe-webhook receives checkout.session.completed
 * 6. We store subscription in KV and issue a JWT
 */

interface CreateCheckoutParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  priceIdMonthly: string;
  priceIdYearly: string;
}

export function getStripeConfig(): StripeConfig | null {
  const secretKey = import.meta.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;

  return {
    secretKey,
    webhookSecret: import.meta.env.STRIPE_WEBHOOK_SECRET || '',
    priceIdMonthly: import.meta.env.STRIPE_PRICE_ID_MONTHLY || '',
    priceIdYearly: import.meta.env.STRIPE_PRICE_ID_YEARLY || '',
  };
}

export async function createCheckoutSession(params: CreateCheckoutParams): Promise<{ url: string }> {
  const config = getStripeConfig();
  if (!config) throw new Error('Stripe is not configured');

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'payment_method_types[]': 'card',
      'line_items[0][price]': params.priceId,
      'line_items[0][quantity]': '1',
      mode: 'subscription',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      ...(params.customerEmail ? { customer_email: params.customerEmail } : {}),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create checkout session');
  }

  const session = await response.json();
  return { url: session.url };
}

export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  // Stripe webhook signature verification
  // In production, use the Stripe SDK or manual HMAC verification
  const encoder = new TextEncoder();
  const parts = signature.split(',');
  const timestamp = parts.find((p) => p.startsWith('t='))?.split('=')[1];
  const sig = parts.find((p) => p.startsWith('v1='))?.split('=')[1];

  if (!timestamp || !sig) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return expected === sig;
}
