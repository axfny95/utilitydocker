import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

function htmlToMarkdown(html: string): string {
  let md = html;
  // Headers
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');
  // Bold/italic
  md = md.replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, '**$2**');
  md = md.replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi, '*$2*');
  md = md.replace(/<(del|s|strike)[^>]*>(.*?)<\/\1>/gi, '~~$2~~');
  // Code
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n');
  // Links and images
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');
  // Lists
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<\/?[ou]l[^>]*>/gi, '\n');
  // Paragraphs and breaks
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n');
  md = md.replace(/<hr\s*\/?>/gi, '---\n\n');
  // Remove remaining tags
  md = md.replace(/<[^>]+>/g, '');
  // Decode entities
  md = md.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
  // Clean up whitespace
  md = md.replace(/\n{3,}/g, '\n\n').trim();
  return md;
}

export default function HtmlToMarkdown() {
  const [html, setHtml] = useState('');
  const [markdown, setMarkdown] = useState('');

  const convert = () => setMarkdown(htmlToMarkdown(html));

  const loadSample = () => {
    setHtml(`<h1>Welcome to UtilityDocker</h1>
<p>This is a <strong>bold</strong> and <em>italic</em> text example.</p>
<h2>Features</h2>
<ul>
  <li>Free online tools</li>
  <li>Client-side processing</li>
  <li>No signup required</li>
</ul>
<p>Visit <a href="https://utilitydocker.com">our website</a> for more.</p>
<blockquote>Your files never leave your device.</blockquote>`);
    setMarkdown('');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={convert} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Convert</button>
        <button onClick={loadSample} className="rounded-lg border border-surface-200 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50">Load Sample</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">HTML Input</label>
          <textarea value={html} onChange={(e) => setHtml(e.target.value)} placeholder="Paste HTML here..." className="h-72 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm" spellCheck={false} />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-surface-700">Markdown Output</label>
            {markdown && <CopyButton text={markdown} />}
          </div>
          <textarea value={markdown} readOnly className="h-72 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm" spellCheck={false} />
        </div>
      </div>
    </div>
  );
}
