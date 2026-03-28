import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

export default function UrlEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [encodeType, setEncodeType] = useState<'component' | 'full'>('component');
  const [error, setError] = useState<string | null>(null);

  const process = (text: string, direction: 'encode' | 'decode', type: 'component' | 'full') => {
    setError(null);
    if (!text.trim()) { setOutput(''); return; }
    try {
      if (direction === 'encode') {
        setOutput(type === 'component' ? encodeURIComponent(text) : encodeURI(text));
      } else {
        setOutput(type === 'component' ? decodeURIComponent(text) : decodeURI(text));
      }
    } catch {
      setError(direction === 'decode' ? 'Invalid encoded string' : 'Encoding failed');
      setOutput('');
    }
  };

  const handleInput = (value: string) => {
    setInput(value);
    process(value, mode, encodeType);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => { setMode('encode'); process(input, 'encode', encodeType); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'encode' ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}
        >
          Encode
        </button>
        <button
          onClick={() => { setMode('decode'); process(input, 'decode', encodeType); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'decode' ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}
        >
          Decode
        </button>
        <select
          value={encodeType}
          onChange={(e) => { const t = e.target.value as 'component' | 'full'; setEncodeType(t); process(input, mode, t); }}
          className="rounded-lg border border-surface-200 px-3 py-2 text-sm"
        >
          <option value="component">encodeURIComponent (recommended)</option>
          <option value="full">encodeURI (full URL)</option>
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Input</label>
          <textarea
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text or URL to encode...' : 'Enter encoded string to decode...'}
            className="h-40 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            spellCheck={false}
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-surface-700">Output</label>
            {output && <CopyButton text={output} />}
          </div>
          <textarea
            value={output}
            readOnly
            className="h-40 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm"
            spellCheck={false}
          />
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 text-sm text-surface-600">
        <strong>encodeURIComponent</strong> encodes all special characters including <code>: / ? # [ ] @ ! $ & ' ( ) * + , ; =</code>.
        <br />
        <strong>encodeURI</strong> preserves URL structure characters like <code>: / ? # [ ] @</code> and only encodes other special characters.
      </div>
    </div>
  );
}
