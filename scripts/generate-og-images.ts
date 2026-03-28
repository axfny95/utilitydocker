/**
 * Build-time OG image generator.
 * Creates an SVG-based OG image for each tool in public/og/.
 * Run: npx tsx scripts/generate-og-images.ts
 *
 * For PNG conversion (better social platform support),
 * install satori + @resvg/resvg-js and update this script.
 * SVGs work as a starting point but some platforms prefer PNG.
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const TOOLS_DIR = join(import.meta.dirname, '..', 'src', 'content', 'tools');
const OUTPUT_DIR = join(import.meta.dirname, '..', 'public', 'og');

interface ToolFrontmatter {
  title: string;
  category: string;
  description: string;
}

function parseFrontmatter(content: string): ToolFrontmatter | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = match[1];
  const title = fm.match(/title:\s*"([^"]+)"/)?.[1] || '';
  const category = fm.match(/category:\s*"([^"]+)"/)?.[1] || '';
  const description = fm.match(/description:\s*"([^"]+)"/)?.[1] || '';
  return { title, category, description };
}

const CATEGORY_COLORS: Record<string, string> = {
  'Developer Tools': '#3b82f6',
  'Text Tools': '#8b5cf6',
  'Security Tools': '#10b981',
  'SEO Tools': '#f59e0b',
  'Generator Tools': '#ec4899',
  'Image Tools': '#06b6d4',
  'PDF Tools': '#ef4444',
  'Legal Tools': '#6366f1',
};

function generateSvg(tool: ToolFrontmatter): string {
  const color = CATEGORY_COLORS[tool.category] || '#3b82f6';
  const title = tool.title.length > 35 ? tool.title.substring(0, 32) + '...' : tool.title;
  const desc = tool.description.length > 80 ? tool.description.substring(0, 77) + '...' : tool.description;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f8fafc"/>
  <rect x="0" y="0" width="1200" height="8" fill="${color}"/>
  <rect x="60" y="60" width="1080" height="510" rx="16" fill="white" stroke="#e2e8f0" stroke-width="1"/>
  <text x="100" y="160" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="bold" fill="#0f172a">${escapeXml(title)}</text>
  <text x="100" y="220" font-family="system-ui, sans-serif" font-size="22" fill="#64748b">${escapeXml(desc)}</text>
  <rect x="100" y="260" width="160" height="32" rx="16" fill="${color}20"/>
  <text x="180" y="282" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="${color}" text-anchor="middle">${escapeXml(tool.category)}</text>
  <line x1="100" y1="340" x2="1100" y2="340" stroke="#e2e8f0" stroke-width="1"/>
  <text x="100" y="400" font-family="system-ui, sans-serif" font-size="18" fill="#94a3b8">100% Free | No Signup | Client-Side Processing</text>
  <text x="100" y="500" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="bold" fill="${color}">FreeToolStack</text>
  <text x="100" y="535" font-family="system-ui, sans-serif" font-size="16" fill="#94a3b8">freetoolstack.com</text>
</svg>`;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const files = await readdir(TOOLS_DIR);
  const mdxFiles = files.filter((f) => f.endsWith('.mdx'));

  let count = 0;
  for (const file of mdxFiles) {
    const content = await readFile(join(TOOLS_DIR, file), 'utf-8');
    const fm = parseFrontmatter(content);
    if (!fm) continue;

    const slug = file.replace('.mdx', '');
    const svg = generateSvg(fm);
    await writeFile(join(OUTPUT_DIR, `${slug}.svg`), svg);
    count++;
  }

  console.log(`Generated ${count} OG images in public/og/`);
}

main().catch(console.error);
