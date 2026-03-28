/**
 * Session management using Cloudflare KV.
 * Sessions are stored as JSON in KV with 30-day TTL.
 * Session ID is set as an HttpOnly secure cookie.
 */

const SESSION_COOKIE = 'fts_session';
const SESSION_TTL = 30 * 24 * 60 * 60; // 30 days in seconds
const REFRESH_INTERVAL = 60 * 60; // Update lastActiveAt every 1 hour

interface SessionData {
  userId: string;
  createdAt: number;
  lastActiveAt: number;
}

export async function createSession(
  kv: KVNamespace,
  userId: string,
): Promise<{ sessionId: string; cookie: string }> {
  const sessionId = crypto.randomUUID();
  const session: SessionData = {
    userId,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };

  await kv.put(`session:${sessionId}`, JSON.stringify(session), {
    expirationTtl: SESSION_TTL,
  });

  const cookie = `${SESSION_COOKIE}=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL}`;
  return { sessionId, cookie };
}

export async function getSession(
  kv: KVNamespace,
  cookieHeader: string | null,
): Promise<{ sessionId: string; session: SessionData } | null> {
  if (!cookieHeader) return null;

  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;

  const sessionId = match[1];
  const data = await kv.get(`session:${sessionId}`);
  if (!data) return null;

  const session: SessionData = JSON.parse(data);

  // Refresh lastActiveAt if stale (throttled to save KV writes)
  if (Date.now() - session.lastActiveAt > REFRESH_INTERVAL * 1000) {
    session.lastActiveAt = Date.now();
    await kv.put(`session:${sessionId}`, JSON.stringify(session), {
      expirationTtl: SESSION_TTL,
    });
  }

  return { sessionId, session };
}

export async function destroySession(
  kv: KVNamespace,
  cookieHeader: string | null,
): Promise<string> {
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
    if (match) {
      await kv.delete(`session:${match[1]}`);
    }
  }

  // Return a cookie that immediately expires
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
