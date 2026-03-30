import { defineMiddleware } from 'astro:middleware';
import { getSession } from './lib/session';
import { getUserById, getActiveSubscription } from './lib/db';

export const onRequest = defineMiddleware(async (context, next) => {
  // Default: no user, not premium
  context.locals.user = null;
  context.locals.session = null;
  context.locals.isPremium = false;

  try {
    // Get Cloudflare env (Astro v6 way)
    let cfEnv: any;
    try {
      const mod = await import('cloudflare:workers');
      cfEnv = mod.env;
    } catch {
      cfEnv = (context.locals as any).runtime?.env;
    }

    if (!cfEnv?.SESSIONS || !cfEnv?.DB) {
      return next();
    }

    const cookieHeader = context.request.headers.get('cookie');
    const sessionResult = await getSession(cfEnv.SESSIONS, cookieHeader);

    if (sessionResult) {
      const dbUser = await getUserById(cfEnv.DB, sessionResult.session.userId);
      if (dbUser) {
        context.locals.user = {
          id: dbUser.id,
          email: dbUser.email,
          emailVerified: dbUser.email_verified === 1,
          stripeCustomerId: dbUser.stripe_customer_id,
          createdAt: dbUser.created_at,
        };
        context.locals.session = sessionResult.session;

        const sub = await getActiveSubscription(cfEnv.DB, dbUser.id);
        if (sub && sub.current_period_end && sub.current_period_end > Math.floor(Date.now() / 1000)) {
          context.locals.isPremium = true;
        }
      }
    }

    // Store env ref for other routes to use
    if (!context.locals.runtime) {
      (context.locals as any).runtime = { env: cfEnv };
    }
  } catch (error) {
    console.error('[middleware] Auth error:', error);
  }

  return next();
});
