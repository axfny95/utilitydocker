import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

type Base = 2 | 8 | 10 | 16;

function convert(value: string, fromBase: Base): Record<Base, string> | null {
  try {
    const num = parseInt(value, fromBase);
    if (isNaN(num)) return null;
    return {
      2: num.toString(2),
      8: num.toString(8),
      10: num.toString(10),
      16: num.toString(16).toUpperCase(),
    };
  } catch {
    return null;
  }
}

const BASES: { base: Base; label: string; prefix: string; placeholder: string }[] = [
  { base: 2, label: 'Binary', prefix: '0b', placeholder: '1010' },
  { base: 8, label: 'Octal', prefix: '0o', placeholder: '12' },
  { base: 10, label: 'Decimal', prefix: '', placeholder: '10' },
  { base: 16, label: 'Hexadecimal', prefix: '0x', placeholder: 'A' },
];

export default function NumberBaseConverter() {
  const [input, setInput] = useState('42');
  const [fromBase, setFromBase] = useState<Base>(10);

  const results = convert(input, fromBase);

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-surface-700">Input</label>
        <div className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 rounded-lg border border-surface-200 bg-surface-50 px-3 py-3 font-mono text-lg focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" spellCheck={false} />
          <select value={fromBase} onChange={(e) => setFromBase(Number(e.target.value) as Base)} className="rounded-lg border border-surface-200 px-3 py-2 text-sm">
            {BASES.map((b) => <option key={b.base} value={b.base}>{b.label} (base {b.base})</option>)}
          </select>
        </div>
      </div>

      {results && (
        <div className="space-y-3">
          {BASES.map((b) => (
            <div key={b.base} className={`flex items-center justify-between rounded-lg border p-4 ${b.base === fromBase ? 'border-primary-200 bg-primary-50' : 'border-surface-200 bg-surface-50'}`}>
              <div>
                <span className="text-sm font-medium text-surface-600">{b.label}</span>
                <span className="ml-2 text-xs text-surface-400">base {b.base}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-surface-400">{b.prefix}</span>
                <code className="font-mono text-lg font-bold">{results[b.base]}</code>
                <CopyButton text={results[b.base]} label="" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!results && input && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Invalid number for base {fromBase}
        </div>
      )}

      <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 text-xs text-surface-600">
        <p><strong>Binary (base 2):</strong> Uses only 0 and 1. Common in computing and digital electronics.</p>
        <p><strong>Octal (base 8):</strong> Uses digits 0-7. Used in Unix file permissions.</p>
        <p><strong>Decimal (base 10):</strong> Standard number system we use daily.</p>
        <p><strong>Hexadecimal (base 16):</strong> Uses 0-9 and A-F. Common in programming for colors, memory addresses.</p>
      </div>
    </div>
  );
}
