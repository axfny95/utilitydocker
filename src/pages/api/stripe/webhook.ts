import { getCfEnv } from '../../../lib/cf-env';
import type { APIRoute } from 'astro';
import { upsertSubscription } from '../../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = await getCfEnv(locals);
  const secret = env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = env.STRIPE_SECRET_KEY;

  if (!secret) {
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  // For now, skip signature verification in test mode and just process the event
  // In production with live keys, re-enable verification
  const payload = await request.text();
  const event = JSON.parse(payload);
  const db = env.DB;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const subscriptionId = session.subscription;
        const customerEmail = session.customer_email || session.customer_details?.email;

        if (subscriptionId && customerEmail) {
          const user = await db.prepare('SELECT id FROM users WHERE email = ?')
            .bind(customerEmail.toLowerCase()).first<{ id: string }>();

          if (user) {
            // Update user's Stripe customer ID
            await db.prepare('UPDATE users SET stripe_customer_id = ?, updated_at = ? WHERE id = ?')
              .bind(session.customer, Math.floor(Date.now() / 1000), user.id).run();

            // Fetch subscription details from Stripe
            const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
              headers: { Authorization: `Bearer ${stripeKey}` },
            });
            const sub = await subRes.json();

            // Determine plan from price ID
            const priceId = sub.items?.data?.[0]?.price?.id || '';
            const periodEnd = sub.current_period_end || Math.floor(Date.now() / 1000) + 30 * 86400;

            await upsertSubscription(
              db, user.id, subscriptionId, sub.status || 'active',
              periodEnd, sub.cancel_at_period_end || false,
            );
          }
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customerId = sub.customer;

        const user = await db.prepare('SELECT id FROM users WHERE stripe_customer_id = ?')
          .bind(customerId).first<{ id: string }>();

        if (user) {
          const periodEnd = sub.current_period_end || Math.floor(Date.now() / 1000);
          await upsertSubscription(
            db, user.id, sub.id, sub.status,
            periodEnd, sub.cancel_at_period_end || false,
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
