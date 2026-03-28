import { useState, useRef, useEffect } from 'react';
import { createSandboxHtml } from '../../lib/sandbox';

interface SavedTool {
  id: string;
  title: string;
  description: string;
  created_at: number;
}

export default function ToolBuilderChat() {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [savedTools, setSavedTools] = useState<SavedTool[]>([]);
  const [iframeHeight, setIframeHeight] = useState(400);
  const [showCode, setShowCode] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    fetch('/api/tool-builder/list').then((r) => r.json()).then((d) => {
      if (d.tools) setSavedTools(d.tools);
    }).catch(() => {});

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'resize') setIframeHeight(Math.min(e.data.height + 32, 800));
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const generate = async () => {
    if (!prompt.trim()) return;
    setStatus('generating');
    setError('');
    setGeneratedCode('');

    try {
      const res = await fetch('/api/tool-builder/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Generation failed');
        setStatus('error');
        return;
      }

      setGeneratedCode(data.code);
      setGeneratedTitle(data.title);
      setGeneratedDescription(data.description);
      setRemaining(data.remaining);
      setStatus('done');
    } catch {
      setError('Network error');
      setStatus('error');
    }
  };

  const save = async () => {
    if (!generatedCode) return;
    try {
      const res = await fetch('/api/tool-builder/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: generatedTitle, description: generatedDescription, prompt, code: generatedCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setSavedTools((prev) => [{ id: data.id, title: generatedTitle, description: generatedDescription, created_at: Date.now() / 1000 }, ...prev]);
      }
    } catch {}
  };

  const sandboxHtml = generatedCode ? createSandboxHtml(generatedCode) : '';

  return (
    <div className="space-y-6">
      {/* Prompt input */}
      <div>
        <label className="mb-2 block text-sm font-medium text-surface-700">Describe the tool you want</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: A color contrast checker that takes two hex colors and shows the contrast ratio, WCAG compliance level (AA/AAA), and a preview of text on the background color."
          rows={4}
          maxLength={2000}
          className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <div className="mt-1 flex items-center justify-between text-xs text-surface-400">
          <span>{prompt.length}/2000</span>
          {remaining !== null && <span>{remaining} generations remaining this month</span>}
        </div>
      </div>

      <button
        onClick={generate}
        disabled={!prompt.trim() || status === 'generating'}
        className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {status === 'generating' ? (
          <span className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Generating tool...
          </span>
        ) : 'Generate Tool'}
      </button>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Generated tool preview */}
      {status === 'done' && generatedCode && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-surface-900">{generatedTitle}</h3>
              <p className="text-sm text-surface-500">{generatedDescription}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowCode(!showCode)} className="rounded-lg border border-surface-200 px-3 py-1.5 text-sm text-surface-600 hover:bg-surface-50">
                {showCode ? 'Preview' : 'View Code'}
              </button>
              <button onClick={save} className="rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700">
                Save Tool
              </button>
            </div>
          </div>

          {showCode ? (
            <pre className="max-h-96 overflow-auto rounded-lg border border-surface-200 bg-surface-50 p-4 font-mono text-xs">
              {generatedCode}
            </pre>
          ) : (
            <div className="overflow-hidden rounded-lg border border-surface-200">
              <iframe
                ref={iframeRef}
                sandbox="allow-scripts"
                srcDoc={sandboxHtml}
                className="w-full border-0"
                style={{ height: `${iframeHeight}px` }}
                title="Tool Preview"
              />
            </div>
          )}
        </div>
      )}

      {/* Saved tools */}
      {savedTools.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-surface-700">Your Saved Tools ({savedTools.length})</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {savedTools.map((tool) => (
              <div key={tool.id} className="rounded-lg border border-surface-200 bg-white p-4">
                <h4 className="font-medium text-surface-900">{tool.title}</h4>
                <p className="mt-1 text-xs text-surface-500">{tool.description}</p>
                <p className="mt-2 text-xs text-surface-400">
                  {new Date(tool.created_at * 1000).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Examples */}
      <div className="rounded-lg border border-surface-200 bg-surface-50 p-4">
        <h3 className="mb-2 text-sm font-medium text-surface-700">Ideas to try</h3>
        <div className="flex flex-wrap gap-2">
          {[
            'A Fibonacci sequence generator with visualization',
            'A color contrast checker for WCAG compliance',
            'A mortgage vs rent comparison calculator',
            'A character frequency analyzer for any text',
            'A binary to ASCII art converter',
            'A CSS flexbox playground with live preview',
          ].map((idea) => (
            <button key={idea} onClick={() => setPrompt(idea)} className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-xs text-surface-600 hover:bg-surface-100">
              {idea}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
