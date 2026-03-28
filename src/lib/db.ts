/**
 * Cloudflare D1 database helpers.
 * Provides typed query wrappers for the UtilityDocker database.
 */

export interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  email_verified: number;
  email_verify_token: string | null;
  email_verify_expires: number | null;
  password_reset_token: string | null;
  password_reset_expires: number | null;
  stripe_customer_id: string | null;
  created_at: number;
  updated_at: number;
}

export interface DbSubscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  status: string;
  plan: string;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: number;
  created_at: number;
  updated_at: number;
}

export interface DbFavorite {
  user_id: string;
  tool_slug: string;
  created_at: number;
}

export interface DbCustomTool {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  prompt: string;
  generated_code: string;
  is_public: number;
  share_slug: string | null;
  generation_count: number;
  created_at: number;
  updated_at: number;
}

// User queries
export async function getUserByEmail(db: D1Database, email: string): Promise<DbUser | null> {
  return db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<DbUser>();
}

export async function getUserById(db: D1Database, id: string): Promise<DbUser | null> {
  return db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<DbUser>();
}

export async function createUser(
  db: D1Database,
  email: string,
  passwordHash: string,
  verifyToken: string,
): Promise<string> {
  const id = crypto.randomUUID().replace(/-/g, '');
  const expires = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24h
  await db
    .prepare(
      'INSERT INTO users (id, email, password_hash, email_verify_token, email_verify_expires) VALUES (?, ?, ?, ?, ?)',
    )
    .bind(id, email.toLowerCase(), passwordHash, verifyToken, expires)
    .run();
  return id;
}

export async function verifyUserEmail(db: D1Database, token: string): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const result = await db
    .prepare(
      'UPDATE users SET email_verified = 1, email_verify_token = NULL, email_verify_expires = NULL, updated_at = ? WHERE email_verify_token = ? AND email_verify_expires > ?',
    )
    .bind(now, token, now)
    .run();
  return (result.meta?.changes ?? 0) > 0;
}

// Subscription queries
export async function getActiveSubscription(
  db: D1Database,
  userId: string,
): Promise<DbSubscription | null> {
  return db
    .prepare("SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1")
    .bind(userId)
    .first<DbSubscription>();
}

export async function upsertSubscription(
  db: D1Database,
  userId: string,
  stripeSubId: string,
  status: string,
  periodEnd: number,
  cancelAtPeriodEnd: boolean,
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const id = crypto.randomUUID().replace(/-/g, '');
  await db
    .prepare(
      `INSERT INTO subscriptions (id, user_id, stripe_subscription_id, status, current_period_end, cancel_at_period_end, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(stripe_subscription_id) DO UPDATE SET
         status = excluded.status,
         current_period_end = excluded.current_period_end,
         cancel_at_period_end = excluded.cancel_at_period_end,
         updated_at = excluded.updated_at`,
    )
    .bind(id, userId, stripeSubId, status, periodEnd, cancelAtPeriodEnd ? 1 : 0, now)
    .run();
}

// Favorites queries
export async function getUserFavorites(db: D1Database, userId: string): Promise<DbFavorite[]> {
  const result = await db
    .prepare('SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC')
    .bind(userId)
    .all<DbFavorite>();
  return result.results;
}

export async function addFavorite(db: D1Database, userId: string, toolSlug: string): Promise<void> {
  await db
    .prepare('INSERT OR IGNORE INTO favorites (user_id, tool_slug) VALUES (?, ?)')
    .bind(userId, toolSlug)
    .run();
}

export async function removeFavorite(db: D1Database, userId: string, toolSlug: string): Promise<void> {
  await db.prepare('DELETE FROM favorites WHERE user_id = ? AND tool_slug = ?').bind(userId, toolSlug).run();
}

export async function isFavorite(db: D1Database, userId: string, toolSlug: string): Promise<boolean> {
  const row = await db
    .prepare('SELECT 1 FROM favorites WHERE user_id = ? AND tool_slug = ?')
    .bind(userId, toolSlug)
    .first();
  return row !== null;
}

// Custom tools queries
export async function getUserCustomTools(db: D1Database, userId: string): Promise<DbCustomTool[]> {
  const result = await db
    .prepare('SELECT * FROM custom_tools WHERE user_id = ? ORDER BY updated_at DESC')
    .bind(userId)
    .all<DbCustomTool>();
  return result.results;
}

export async function countTodayGenerations(db: D1Database, userId: string): Promise<number> {
  const todayStart = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
  const row = await db
    .prepare('SELECT COUNT(*) as count FROM ai_generations WHERE user_id = ? AND created_at > ?')
    .bind(userId, todayStart)
    .first<{ count: number }>();
  return row?.count ?? 0;
}
