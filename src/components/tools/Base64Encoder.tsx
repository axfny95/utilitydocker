import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

export default function Base64Encoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState<string | null>(null);

  const process = (text: string, direction: 'encode' | 'decode') => {
    setError(null);
    if (!text.trim()) {
      setOutput('');
      return;
    }

    try {
      if (direction === 'encode') {
        // Handle Unicode properly
        const bytes = new TextEncoder().encode(text);
        const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
        setOutput(btoa(binary));
      } else {
        const binary = atob(text.trim());
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        setOutput(new TextDecoder().decode(bytes));
      }
    } catch (e) {
      setError(direction === 'decode' ? 'Invalid Base64 string' : 'Encoding failed');
      setOutput('');
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    process(value, mode);
  };

  const handleModeSwap = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    setInput(output);
    process(output, newMode);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setMode('encode'); process(input, 'encode'); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'encode' ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'
          }`}
        >
          Encode
        </button>
        <button
          onClick={() => { setMode('decode'); process(input, 'decode'); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'decode' ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'
          }`}
        >
          Decode
        </button>
        <button
          onClick={handleModeSwap}
          className="ml-auto rounded-lg border border-surface-200 px-3 py-2 text-sm text-surface-600 hover:bg-surface-50"
          title="Swap input and output"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">
            {mode === 'encode' ? 'Text Input' : 'Base64 Input'}
          </label>
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
            className="h-48 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            spellCheck={false}
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-surface-700">
              {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
            </label>
            {output && <CopyButton text={output} />}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Output will appear here..."
            className="h-48 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm"
            spellCheck={false}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {input && !error && (
        <div className="flex gap-4 text-sm text-surface-500">
          <span>Input: {new Blob([input]).size} bytes</span>
          <span>Output: {new Blob([output]).size} bytes</span>
          {mode === 'encode' && <span>Size increase: {output ? ((output.length / Math.max(input.length, 1) - 1) * 100).toFixed(0) : 0}%</span>}
        </div>
      )}
    </div>
  );
}
