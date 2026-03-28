export function generateMetaDescription(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace) + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateCanonicalUrl(path: string, site: string = 'https://utilitydocker.com'): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${site}${cleanPath}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function generateToolOgImagePath(slug: string): string {
  return `/og/${slug}.png`;
}

export function estimateReadingTime(wordCount: number, wpm: number = 200): string {
  const minutes = Math.max(1, Math.ceil(wordCount / wpm));
  return `${minutes} min read`;
}
