import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [indentSize, setIndentSize] = useState(2);

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indentSize));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const validate = () => {
    try {
      JSON.parse(input);
      setError(null);
      setOutput('Valid JSON!');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const loadSample = () => {
    const sample = {
      name: 'UtilityDocker',
      version: '1.0.0',
      tools: ['JSON Formatter', 'Image Compressor', 'Word Counter'],
      config: {
        theme: 'light',
        language: 'en',
        features: { premium: false, ads: true },
      },
    };
    setInput(JSON.stringify(sample));
    setError(null);
    setOutput('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={format} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          Format
        </button>
        <button onClick={minify} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50">
          Minify
        </button>
        <button onClick={validate} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50">
          Validate
        </button>
        <button onClick={loadSample} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50">
          Load Sample
        </button>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-surface-600">Indent:</label>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            className="rounded-lg border border-surface-200 px-2 py-1 text-sm"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={1}>1 tab</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON here..."
            className="h-80 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            spellCheck={false}
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-surface-700">Output</label>
            {output && !error && <CopyButton text={output} />}
          </div>
          <textarea
            value={error ? '' : output}
            readOnly
            placeholder="Formatted output will appear here..."
            className="h-80 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm"
            spellCheck={false}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
