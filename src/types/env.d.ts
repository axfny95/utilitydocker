/// <reference types="astro/client" />

interface CloudflareEnv {
  DB: D1Database;
  SESSIONS: KVNamespace;
  RATE_LIMIT: KVNamespace;
}

interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  stripeCustomerId: string | null;
  createdAt: number;
}

interface SessionData {
  userId: string;
  createdAt: number;
  lastActiveAt: number;
}

declare namespace App {
  interface Locals {
    user: User | null;
    session: SessionData | null;
    isPremium: boolean;
    runtime: {
      env: CloudflareEnv;
    };
  }
}
