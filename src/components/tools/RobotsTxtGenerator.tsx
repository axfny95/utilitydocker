import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

interface Rule {
  userAgent: string;
  allow: string[];
  disallow: string[];
  crawlDelay?: number;
}

const PRESETS: Record<string, Rule[]> = {
  'allow-all': [{ userAgent: '*', allow: ['/'], disallow: [], crawlDelay: undefined }],
  'block-all': [{ userAgent: '*', allow: [], disallow: ['/'], crawlDelay: undefined }],
  'standard': [
    { userAgent: '*', allow: ['/'], disallow: ['/admin/', '/api/', '/private/', '/*.json$'], crawlDelay: undefined },
  ],
  'wordpress': [
    { userAgent: '*', allow: ['/'], disallow: ['/wp-admin/', '/wp-includes/', '/wp-content/plugins/', '/trackback/', '/feed/', '/?s='], crawlDelay: undefined },
  ],
};

export default function RobotsTxtGenerator() {
  const [rules, setRules] = useState<Rule[]>(PRESETS['standard']);
  const [sitemapUrl, setSitemapUrl] = useState('https://example.com/sitemap.xml');
  const [host, setHost] = useState('');

  const updateRule = (index: number, field: keyof Rule, value: unknown) => {
    setRules((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const addRule = () => {
    setRules([...rules, { userAgent: '*', allow: ['/'], disallow: [], crawlDelay: undefined }]);
  };

  const removeRule = (index: number) => {
    if (rules.length <= 1) return;
    setRules(rules.filter((_, i) => i !== index));
  };

  const addPath = (ruleIndex: number, type: 'allow' | 'disallow') => {
    setRules((prev) => prev.map((r, i) =>
      i === ruleIndex ? { ...r, [type]: [...r[type], '/new-path/'] } : r
    ));
  };

  const updatePath = (ruleIndex: number, type: 'allow' | 'disallow', pathIndex: number, value: string) => {
    setRules((prev) => prev.map((r, i) =>
      i === ruleIndex ? { ...r, [type]: r[type].map((p, pi) => (pi === pathIndex ? value : p)) } : r
    ));
  };

  const removePath = (ruleIndex: number, type: 'allow' | 'disallow', pathIndex: number) => {
    setRules((prev) => prev.map((r, i) =>
      i === ruleIndex ? { ...r, [type]: r[type].filter((_, pi) => pi !== pathIndex) } : r
    ));
  };

  const output = [
    ...rules.flatMap((rule) => [
      `User-agent: ${rule.userAgent}`,
      ...rule.allow.map((p) => `Allow: ${p}`),
      ...rule.disallow.map((p) => `Disallow: ${p}`),
      ...(rule.crawlDelay ? [`Crawl-delay: ${rule.crawlDelay}`] : []),
      '',
    ]),
    ...(sitemapUrl ? [`Sitemap: ${sitemapUrl}`] : []),
    ...(host ? [`Host: ${host}`] : []),
  ].join('\n').trim();

  const downloadFile = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <span className="mb-2 block text-sm font-medium text-surface-700">Quick Presets</span>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => setRules(preset)}
              className="rounded-lg border border-surface-200 px-3 py-1.5 text-sm capitalize text-surface-600 hover:bg-surface-50"
            >
              {key.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Rules */}
      {rules.map((rule, ri) => (
        <div key={ri} className="rounded-lg border border-surface-200 bg-surface-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-surface-700">Rule {ri + 1}</span>
            {rules.length > 1 && (
              <button onClick={() => removeRule(ri)} className="text-sm text-red-500 hover:text-red-700">Remove</button>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs text-surface-600">User-Agent</label>
            <input type="text" value={rule.userAgent} onChange={(e) => updateRule(ri, 'userAgent', e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-1.5 font-mono text-sm" />
          </div>

          {(['allow', 'disallow'] as const).map((type) => (
            <div key={type}>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs capitalize text-surface-600">{type} Paths</label>
                <button onClick={() => addPath(ri, type)} className="text-xs text-primary-600 hover:text-primary-700">+ Add</button>
              </div>
              {rule[type].map((path, pi) => (
                <div key={pi} className="mb-1 flex items-center gap-2">
                  <input type="text" value={path} onChange={(e) => updatePath(ri, type, pi, e.target.value)} className="flex-1 rounded-lg border border-surface-200 px-3 py-1.5 font-mono text-sm" />
                  <button onClick={() => removePath(ri, type, pi)} className="text-surface-400 hover:text-red-500 text-sm">x</button>
                </div>
              ))}
            </div>
          ))}

          <div>
            <label className="mb-1 block text-xs text-surface-600">Crawl Delay (seconds, optional)</label>
            <input type="number" min={0} value={rule.crawlDelay || ''} onChange={(e) => updateRule(ri, 'crawlDelay', e.target.value ? Number(e.target.value) : undefined)} className="w-32 rounded-lg border border-surface-200 px-3 py-1.5 text-sm" placeholder="None" />
          </div>
        </div>
      ))}

      <button onClick={addRule} className="rounded-lg border border-surface-200 px-4 py-2 text-sm text-surface-600 hover:bg-surface-50">
        + Add Rule Group
      </button>

      {/* Sitemap & Host */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Sitemap URL</label>
          <input type="url" value={sitemapUrl} onChange={(e) => setSitemapUrl(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" placeholder="https://example.com/sitemap.xml" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Host (optional)</label>
          <input type="text" value={host} onChange={(e) => setHost(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" placeholder="example.com" />
        </div>
      </div>

      {/* Output */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-medium text-surface-700">robots.txt</label>
          <div className="flex gap-2">
            <CopyButton text={output} />
            <button onClick={downloadFile} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm font-medium text-surface-700 hover:bg-surface-50">
              Download
            </button>
          </div>
        </div>
        <pre className="rounded-lg border border-surface-200 bg-surface-50 p-4 font-mono text-sm">{output}</pre>
      </div>
    </div>
  );
}
