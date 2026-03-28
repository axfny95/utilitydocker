import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

type Mode = 'single-space' | 'remove-all' | 'remove-empty' | 'add-br' | 'trim';

const MODES: { id: Mode; label: string; desc: string }[] = [
  { id: 'single-space', label: 'Replace with spaces', desc: 'Replace all line breaks with a single space' },
  { id: 'remove-all', label: 'Remove all', desc: 'Remove all line breaks completely (joins text)' },
  { id: 'remove-empty', label: 'Remove empty lines', desc: 'Keep single line breaks, remove blank lines' },
  { id: 'add-br', label: 'Add <br> tags', desc: 'Replace line breaks with HTML <br> tags' },
  { id: 'trim', label: 'Trim each line', desc: 'Remove leading and trailing whitespace from each line' },
];

export default function RemoveLineBreaks() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('single-space');

  const process = (text: string, m: Mode): string => {
    switch (m) {
      case 'single-space': return text.replace(/\r?\n/g, ' ').replace(/\s{2,}/g, ' ').trim();
      case 'remove-all': return text.replace(/\r?\n/g, '');
      case 'remove-empty': return text.split('\n').filter((line) => line.trim().length > 0).join('\n');
      case 'add-br': return text.replace(/\r?\n/g, '<br>\n');
      case 'trim': return text.split('\n').map((line) => line.trim()).join('\n');
    }
  };

  const output = input ? process(input, mode) : '';
  const inputLines = input.split('\n').length;
  const outputLines = output.split('\n').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button key={m.id} onClick={() => setMode(m.id)} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${mode === m.id ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`} title={m.desc}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <label className="font-medium text-surface-700">Input</label>
            <span className="text-surface-500">{inputLines} lines</span>
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste text with line breaks..." className="h-52 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <label className="font-medium text-surface-700">Output</label>
            <div className="flex items-center gap-2">
              <span className="text-surface-500">{outputLines} lines</span>
              {output && <CopyButton text={output} />}
            </div>
          </div>
          <textarea value={output} readOnly className="h-52 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm" />
        </div>
      </div>

      <p className="text-xs text-surface-400">{MODES.find((m) => m.id === mode)?.desc}</p>
    </div>
  );
}
