import { getCfEnv } from '../../../lib/cf-env';
import type { APIRoute } from 'astro';
import { verifyWebhookSignature } from '../../../lib/stripe';
import { upsertSubscription } from '../../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const secret = import.meta.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  const payload = await request.text();
  const valid = await verifyWebhookSignature(payload, signature, secret);
  if (!valid) {
    return new Response('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(payload);
  const db = (await getCfEnv(locals)).DB;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const subscriptionId = session.subscription;
        const customerEmail = session.customer_email || session.customer_details?.email;

        if (subscriptionId && customerEmail) {
          // Find user by email and update stripe_customer_id
          const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(customerEmail.toLowerCase()).first<{ id: string }>();
          if (user) {
            await db.prepare('UPDATE users SET stripe_customer_id = ?, updated_at = ? WHERE id = ?')
              .bind(session.customer, Math.floor(Date.now() / 1000), user.id).run();

            // Fetch subscription details from Stripe
            const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
              headers: { Authorization: `Bearer ${import.meta.env.STRIPE_SECRET_KEY}` },
            });
            const sub = await subRes.json();

            await upsertSubscription(
              db, user.id, subscriptionId, sub.status,
              sub.current_period_end, sub.cancel_at_period_end,
            );
          }
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customerId = sub.customer;

        const user = await db.prepare('SELECT id FROM users WHERE stripe_customer_id = ?').bind(customerId).first<{ id: string }>();
        if (user) {
          await upsertSubscription(
            db, user.id, sub.id, sub.status,
            sub.current_period_end, sub.cancel_at_period_end,
          );
        }
        break;
      }
    }
  } catch (error) {
    console.error('[stripe/webhook]', error);
  }

  return new Response('OK', { status: 200 });
};
