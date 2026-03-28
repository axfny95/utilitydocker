const STORAGE_KEY = 'fts_premium_token';

interface PremiumPayload {
  sub: string;
  exp: number;
  plan: 'monthly' | 'yearly';
}

export function isPremiumUser(): boolean {
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem(STORAGE_KEY);
  if (!token) return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload: PremiumPayload = JSON.parse(atob(parts[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function setPremiumToken(token: string) {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearPremiumToken() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getPremiumPlan(): string | null {
  if (!isPremiumUser()) return null;
  try {
    const token = localStorage.getItem(STORAGE_KEY)!;
    const payload: PremiumPayload = JSON.parse(atob(token.split('.')[1]));
    return payload.plan;
  } catch {
    return null;
  }
}
