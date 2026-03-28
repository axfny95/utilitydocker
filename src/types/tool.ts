export interface ToolMeta {
  title: string;
  description: string;
  category: string;
  icon: string;
  component: string;
  keywords: string[];
  featured: boolean;
  premium: boolean;
  premiumFeatures: string[];
  relatedTools: string[];
  faq: { question: string; answer: string }[];
  howTo?: { steps: { name: string; text: string }[] };
  affiliateLinks: { label: string; url: string; description: string }[];
  publishedAt: Date;
  updatedAt?: Date;
  estimatedTime: string;
  usesWasm: boolean;
  usesServerApi: boolean;
}

export interface CategoryMeta {
  name: string;
  description: string;
  icon: string;
  order: number;
  color: string;
}
