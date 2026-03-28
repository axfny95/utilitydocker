export type PremiumPlan = 'monthly' | 'yearly';

export interface PremiumPayload {
  sub: string;
  exp: number;
  plan: PremiumPlan;
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  toolSlugs: string[];
}

export interface PremiumTier {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
}
