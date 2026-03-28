import { useState, useMemo } from 'react';
import { marked } from 'marked';
import CopyButton from '../shared/CopyButton';

const SAMPLE = `# Welcome to the Markdown Editor

This is a **free online Markdown editor** with live preview.

## Features

- Real-time preview as you type
- Supports all standard Markdown syntax
- Copy HTML output with one click
- 100% client-side processing

## Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Table Example

| Feature | Status |
|---------|--------|
| Bold    | Supported |
| Links   | Supported |
| Images  | Supported |

> Markdown is a lightweight markup language that you can use to add formatting elements to plaintext documents.

Learn more at [UtilityDocker](/tools).
`;

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(SAMPLE);
  const [view, setView] = useState<'split' | 'editor' | 'preview'>('split');

  const html = useMemo(() => {
    try {
      return marked(markdown, { async: false }) as string;
    } catch {
      return '<p>Error rendering markdown</p>';
    }
  }, [markdown]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(['split', 'editor', 'preview'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                view === v ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-600 hover:bg-surface-50'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <CopyButton text={markdown} label="Copy MD" />
          <CopyButton text={html} label="Copy HTML" />
        </div>
      </div>

      <div className={`grid gap-4 ${view === 'split' ? 'lg:grid-cols-2' : ''}`}>
        {(view === 'split' || view === 'editor') && (
          <div>
            {view === 'split' && <label className="mb-1 block text-sm font-medium text-surface-700">Markdown</label>}
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="h-[500px] w-full rounded-lg border border-surface-200 bg-surface-50 p-4 font-mono text-sm leading-relaxed focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              spellCheck={false}
              placeholder="Write Markdown here..."
            />
          </div>
        )}
        {(view === 'split' || view === 'preview') && (
          <div>
            {view === 'split' && <label className="mb-1 block text-sm font-medium text-surface-700">Preview</label>}
            <div
              className="prose prose-sm h-[500px] max-w-none overflow-auto rounded-lg border border-surface-200 bg-white p-4"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>

      <div className="text-sm text-surface-500">
        {markdown.split(/\s+/).filter(Boolean).length} words | {markdown.length} characters
      </div>
    </div>
  );
}
