import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default function MetaTagGenerator() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState('');
  const [siteName, setSiteName] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [type, setType] = useState('website');
  const [robots, setRobots] = useState('index, follow');
  const [charset, setCharset] = useState('UTF-8');
  const [viewport, setViewport] = useState('width=device-width, initial-scale=1');

  const eTitle = escapeHtml(title);
  const eDesc = escapeHtml(description);
  const eUrl = escapeHtml(url);
  const eImage = escapeHtml(image);
  const eSiteName = escapeHtml(siteName);
  const eTwitter = escapeHtml(twitterHandle);

  const tags = [
    `<meta charset="${charset}" />`,
    `<meta name="viewport" content="${viewport}" />`,
    title && `<title>${eTitle}</title>`,
    description && `<meta name="description" content="${eDesc}" />`,
    robots && `<meta name="robots" content="${robots}" />`,
    '',
    '<!-- Open Graph -->',
    title && `<meta property="og:title" content="${eTitle}" />`,
    description && `<meta property="og:description" content="${eDesc}" />`,
    type && `<meta property="og:type" content="${type}" />`,
    url && `<meta property="og:url" content="${eUrl}" />`,
    image && `<meta property="og:image" content="${eImage}" />`,
    siteName && `<meta property="og:site_name" content="${eSiteName}" />`,
    '',
    '<!-- Twitter Card -->',
    `<meta name="twitter:card" content="summary_large_image" />`,
    title && `<meta name="twitter:title" content="${eTitle}" />`,
    description && `<meta name="twitter:description" content="${eDesc}" />`,
    image && `<meta name="twitter:image" content="${eImage}" />`,
    twitterHandle && `<meta name="twitter:site" content="${eTwitter}" />`,
  ].filter(Boolean).join('\n');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Page Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" placeholder="My Awesome Page" />
          <span className={`mt-1 block text-xs ${title.length > 60 ? 'text-red-500' : 'text-surface-400'}`}>{title.length}/60 characters</span>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Site Name</label>
          <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" placeholder="My Website" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-surface-700">Meta Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" placeholder="A brief description of your page..." />
          <span className={`mt-1 block text-xs ${description.length > 155 ? 'text-red-500' : 'text-surface-400'}`}>{description.length}/155 characters</span>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Page URL</label>
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" placeholder="https://example.com/page" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">OG Image URL</label>
          <input type="url" value={image} onChange={(e) => setImage(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" placeholder="https://example.com/image.png" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Twitter Handle</label>
          <input type="text" value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" placeholder="@yourhandle" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Page Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm">
            <option value="website">Website</option>
            <option value="article">Article</option>
            <option value="product">Product</option>
            <option value="profile">Profile</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Robots</label>
          <select value={robots} onChange={(e) => setRobots(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm">
            <option value="index, follow">Index, Follow (default)</option>
            <option value="noindex, follow">NoIndex, Follow</option>
            <option value="index, nofollow">Index, NoFollow</option>
            <option value="noindex, nofollow">NoIndex, NoFollow</option>
          </select>
        </div>
      </div>

      {/* SERP Preview */}
      {(title || description) && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-surface-700">Google SERP Preview</h3>
          <div className="rounded-lg border border-surface-200 bg-white p-4">
            <div className="text-sm text-green-700">{url || 'https://example.com'}</div>
            <div className="text-lg text-blue-700 hover:underline">{title || 'Page Title'}</div>
            <div className="text-sm text-surface-600">{description ? description.slice(0, 155) : 'Meta description will appear here...'}</div>
          </div>
        </div>
      )}

      {/* Output */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-medium text-surface-700">Generated Meta Tags</label>
          <CopyButton text={tags} label="Copy HTML" />
        </div>
        <pre className="max-h-80 overflow-auto rounded-lg border border-surface-200 bg-surface-50 p-4 text-xs">{tags}</pre>
      </div>
    </div>
  );
}
