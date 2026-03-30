/**
 * Auto-submit new/updated tool URLs to search engines.
 * Run after deploy: npx tsx scripts/submit-to-search.ts
 *
 * Uses IndexNow API (Bing, Yandex, Seznam, Naver) for instant indexing.
 * Google Search Console API for Google (requires separate setup).
 *
 * Set INDEXNOW_KEY env var to enable.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const SITE_URL = 'https://utilitydocker.com';
const TOOLS_DIR = join(import.meta.dirname, '..', 'src', 'content', 'tools');
const BLOG_DIR = join(import.meta.dirname, '..', 'src', 'content', 'blog');
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '6a83efa3036dcd6135a8480d61885f25';

async function getToolUrls(): Promise<string[]> {
  const files = await readdir(TOOLS_DIR);
  return files
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => `${SITE_URL}/tools/${f.replace('.mdx', '')}`);
}

async function getBlogUrls(): Promise<string[]> {
  const files = await readdir(BLOG_DIR);
  return files
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => `${SITE_URL}/blog/${f.replace('.mdx', '')}`);
}

async function submitIndexNow(urls: string[]) {
  if (!INDEXNOW_KEY) {
    console.log('⚠ INDEXNOW_KEY not set. Set it to enable instant indexing.');
    console.log('  Get a key at: https://www.indexnow.org/');
    return;
  }

  console.log(`Submitting ${urls.length} URLs to IndexNow (Bing, Yandex)...`);

  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: 'utilitydocker.com',
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    }),
  });

  if (response.ok || response.status === 202) {
    console.log(`✓ IndexNow accepted ${urls.length} URLs`);
  } else {
    console.log(`✗ IndexNow error: ${response.status} ${await response.text()}`);
  }
}

async function submitGooglePing(urls: string[]) {
  // Google Ping API — simple ping for sitemap notification
  const sitemapUrl = `${SITE_URL}/sitemap-index.xml`;
  console.log('Pinging Google with updated sitemap...');

  const response = await fetch(
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
  );

  if (response.ok) {
    console.log('✓ Google pinged with sitemap URL');
  } else {
    console.log(`✗ Google ping failed: ${response.status}`);
  }
}

async function main() {
  const toolUrls = await getToolUrls();
  const blogUrls = await getBlogUrls();
  const staticUrls = [
    SITE_URL,
    `${SITE_URL}/tools`,
    `${SITE_URL}/blog`,
    `${SITE_URL}/pricing`,
    `${SITE_URL}/community`,
  ];

  const allUrls = [...staticUrls, ...toolUrls, ...blogUrls];

  console.log(`Found ${allUrls.length} URLs to submit:`);
  console.log(`  ${staticUrls.length} static pages`);
  console.log(`  ${toolUrls.length} tool pages`);
  console.log(`  ${blogUrls.length} blog posts`);
  console.log('');

  await submitIndexNow(allUrls);
  await submitGooglePing(allUrls);

  console.log('\nDone! URLs submitted to search engines.');
  console.log('For full Google indexing, also submit sitemap in Google Search Console:');
  console.log(`  ${SITE_URL}/sitemap-index.xml`);
}

main().catch(console.error);
