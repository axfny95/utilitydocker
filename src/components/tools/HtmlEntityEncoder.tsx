import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

function encodeHtmlEntities(text: string): string {
  return text.replace(/[&<>"'`]/g, (char) => {
    const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' };
    return entities[char] || char;
  });
}

function encodeAllEntities(text: string): string {
  return [...text].map((char) => {
    const code = char.charCodeAt(0);
    if (code > 127 || /[&<>"'`]/.test(char)) return `&#${code};`;
    return char;
  }).join('');
}

function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

export default function HtmlEntityEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'encode-all' | 'decode'>('encode');

  const process = () => {
    switch (mode) {
      case 'encode': setOutput(encodeHtmlEntities(input)); break;
      case 'encode-all': setOutput(encodeAllEntities(input)); break;
      case 'decode': setOutput(decodeHtmlEntities(input)); break;
    }
  };

  const handleInput = (value: string) => {
    setInput(value);
    switch (mode) {
      case 'encode': setOutput(encodeHtmlEntities(value)); break;
      case 'encode-all': setOutput(encodeAllEntities(value)); break;
      case 'decode': setOutput(decodeHtmlEntities(value)); break;
    }
  };

  const COMMON_ENTITIES = [
    { char: '&', entity: '&amp;', name: 'Ampersand' },
    { char: '<', entity: '&lt;', name: 'Less than' },
    { char: '>', entity: '&gt;', name: 'Greater than' },
    { char: '"', entity: '&quot;', name: 'Double quote' },
    { char: "'", entity: '&#39;', name: 'Single quote' },
    { char: '\u00a9', entity: '&copy;', name: 'Copyright' },
    { char: '\u00ae', entity: '&reg;', name: 'Registered' },
    { char: '\u2122', entity: '&trade;', name: 'Trademark' },
    { char: '\u2014', entity: '&mdash;', name: 'Em dash' },
    { char: '\u2013', entity: '&ndash;', name: 'En dash' },
    { char: '\u00a0', entity: '&nbsp;', name: 'Non-breaking space' },
    { char: '\u2026', entity: '&hellip;', name: 'Ellipsis' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMode('encode')} className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'encode' ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}>Encode</button>
        <button onClick={() => setMode('encode-all')} className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'encode-all' ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}>Encode All</button>
        <button onClick={() => setMode('decode')} className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'decode' ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}>Decode</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">{mode.startsWith('encode') ? 'Raw HTML' : 'Encoded HTML'}</label>
          <textarea value={input} onChange={(e) => handleInput(e.target.value)} placeholder={mode.startsWith('encode') ? '<p>Hello "World" & more</p>' : '&lt;p&gt;Hello &amp; World&lt;/p&gt;'} className="h-40 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" spellCheck={false} />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-surface-700">{mode.startsWith('encode') ? 'Encoded' : 'Decoded'}</label>
            {output && <CopyButton text={output} />}
          </div>
          <textarea value={output} readOnly className="h-40 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm" spellCheck={false} />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-surface-700">Common HTML Entities</h3>
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-4">
          {COMMON_ENTITIES.map((e) => (
            <div key={e.entity} className="flex items-center justify-between rounded border border-surface-100 bg-surface-50 px-2 py-1 text-xs">
              <span className="font-mono">{e.entity}</span>
              <span className="text-surface-500">{e.char === '\u00a0' ? '(space)' : e.char}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
