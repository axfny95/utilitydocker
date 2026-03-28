/**
 * Sliding-window rate limiter using Cloudflare KV.
 * Used for server-side API routes (grammar checker, AI tools, etc.)
 * Activated when the Cloudflare adapter is added for deployment.
 */

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

const LIMITS = {
  free: { requests: 10, windowSeconds: 60 },
  premium: { requests: 100, windowSeconds: 60 },
} as const;

export async function checkRateLimit(
  kv: KVNamespace,
  ip: string,
  toolSlug: string,
  isPremium: boolean,
): Promise<RateLimitResult> {
  const tier = isPremium ? 'premium' : 'free';
  const { requests: limit, windowSeconds } = LIMITS[tier];
  const key = `rl:${ip}:${toolSlug}`;

  const current = parseInt((await kv.get(key)) || '0', 10);

  if (current >= limit) {
    return { allowed: false, remaining: 0, resetAt: Date.now() + windowSeconds * 1000 };
  }

  await kv.put(key, String(current + 1), { expirationTtl: windowSeconds });

  return {
    allowed: true,
    remaining: limit - current - 1,
    resetAt: Date.now() + windowSeconds * 1000,
  };
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };
}
