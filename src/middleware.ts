import { defineMiddleware } from 'astro:middleware';
import { getSession } from './lib/session';
import { getUserById, getActiveSubscription } from './lib/db';

export const onRequest = defineMiddleware(async (context, next) => {
  // Default: no user, not premium
  context.locals.user = null;
  context.locals.session = null;
  context.locals.isPremium = false;

  // Only run auth checks on server-rendered pages/API routes
  // Static pages don't go through middleware
  try {
    const env = context.locals.runtime?.env;
    if (!env?.SESSIONS || !env?.DB) {
      return next();
    }

    const cookieHeader = context.request.headers.get('cookie');
    const sessionResult = await getSession(env.SESSIONS, cookieHeader);

    if (sessionResult) {
      const dbUser = await getUserById(env.DB, sessionResult.session.userId);
      if (dbUser) {
        context.locals.user = {
          id: dbUser.id,
          email: dbUser.email,
          emailVerified: dbUser.email_verified === 1,
          stripeCustomerId: dbUser.stripe_customer_id,
          createdAt: dbUser.created_at,
        };
        context.locals.session = sessionResult.session;

        // Check premium status
        const sub = await getActiveSubscription(env.DB, dbUser.id);
        if (sub && sub.current_period_end && sub.current_period_end > Math.floor(Date.now() / 1000)) {
          context.locals.isPremium = true;
        }
      }
    }
  } catch (error) {
    // Auth failure should never block page rendering
    console.error('[middleware] Auth error:', error);
  }

  return next();
});
