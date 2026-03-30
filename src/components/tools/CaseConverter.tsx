import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

type CaseType = 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant' | 'dot' | 'toggle';

function convert(text: string, caseType: CaseType): string {
  const words = text.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_\-.]+/g, ' ').split(/\s+/).filter(Boolean);
  switch (caseType) {
    case 'upper': return text.toUpperCase();
    case 'lower': return text.toLowerCase();
    case 'title': return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    case 'sentence': return text.toLowerCase().replace(/(^|\.\s+|!\s+|\?\s+)([a-z])/g, (m, p, c) => p + c.toUpperCase());
    case 'camel': return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    case 'pascal': return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    case 'snake': return words.map((w) => w.toLowerCase()).join('_');
    case 'kebab': return words.map((w) => w.toLowerCase()).join('-');
    case 'constant': return words.map((w) => w.toUpperCase()).join('_');
    case 'dot': return words.map((w) => w.toLowerCase()).join('.');
    case 'toggle': return text.split('').map((c) => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
    default: return text;
  }
}

const CASES: { type: CaseType; label: string; example: string }[] = [
  { type: 'upper', label: 'UPPER CASE', example: 'HELLO WORLD' },
  { type: 'lower', label: 'lower case', example: 'hello world' },
  { type: 'title', label: 'Title Case', example: 'Hello World' },
  { type: 'sentence', label: 'Sentence case', example: 'Hello world' },
  { type: 'camel', label: 'camelCase', example: 'helloWorld' },
  { type: 'pascal', label: 'PascalCase', example: 'HelloWorld' },
  { type: 'snake', label: 'snake_case', example: 'hello_world' },
  { type: 'kebab', label: 'kebab-case', example: 'hello-world' },
  { type: 'constant', label: 'CONSTANT_CASE', example: 'HELLO_WORLD' },
  { type: 'dot', label: 'dot.case', example: 'hello.world' },
  { type: 'toggle', label: 'tOGGLE cASE', example: 'hELLO wORLD' },
];

export default function CaseConverter() {
  const [input, setInput] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-surface-700">Input Text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste text to convert..."
          className="h-32 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {CASES.map(({ type, label }) => {
          const result = input ? convert(input, type) : '';
          return (
            <div key={type} className="rounded-lg border border-surface-200 bg-surface-50 p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-surface-600">{label}</span>
                {result && <CopyButton text={result} label="" />}
              </div>
              <p className="font-mono text-sm text-surface-900 break-words min-h-[1.5rem]">
                {result || <span className="text-surface-300">Result appears here</span>}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
