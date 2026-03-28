import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const tools = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/tools' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    category: z.string(),
    icon: z.string().default('wrench'),
    component: z.string(),
    keywords: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    premium: z.boolean().default(false),
    premiumFeatures: z.array(z.string()).default([]),
    relatedTools: z.array(z.string()).default([]),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).default([]),
    howTo: z.object({
      steps: z.array(z.object({
        name: z.string(),
        text: z.string(),
      })),
    }).optional(),
    affiliateLinks: z.array(z.object({
      label: z.string(),
      url: z.string().url(),
      description: z.string(),
    })).default([]),
    publishedAt: z.date(),
    updatedAt: z.date().optional(),
    estimatedTime: z.string().default('Instant'),
    usesWasm: z.boolean().default(false),
    usesServerApi: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    author: z.string().default('UtilityDocker Team'),
    publishedAt: z.date(),
    updatedAt: z.date().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    relatedTools: z.array(z.string()).default([]),
  }),
});

const categories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/categories' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    icon: z.string(),
    order: z.number(),
    color: z.string().default('#3b82f6'),
  }),
});

export const collections = { tools, blog, categories };
