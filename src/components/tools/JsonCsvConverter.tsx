import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

function jsonToCsv(jsonStr: string): string {
  const data = JSON.parse(jsonStr);
  const arr = Array.isArray(data) ? data : [data];
  if (arr.length === 0) return '';
  const headers = [...new Set(arr.flatMap((obj) => Object.keys(obj)))];
  const escape = (val: unknown): string => {
    const str = val === null || val === undefined ? '' : String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const rows = arr.map((obj) => headers.map((h) => escape(obj[h])).join(','));
  return [headers.join(','), ...rows].join('\n');
}

function csvToJson(csv: string): string {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return '[]';
  const headers = parseCsvLine(lines[0]);
  const result = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  });
  return JSON.stringify(result, null, 2);
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export default function JsonCsvConverter() {
  const [mode, setMode] = useState<'json-to-csv' | 'csv-to-json'>('json-to-csv');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const convert = () => {
    setError(null);
    try {
      setOutput(mode === 'json-to-csv' ? jsonToCsv(input) : csvToJson(input));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed');
      setOutput('');
    }
  };

  const loadSample = () => {
    if (mode === 'json-to-csv') {
      setInput(JSON.stringify([
        { name: "Alice", age: 30, city: "New York", email: "alice@example.com" },
        { name: "Bob", age: 25, city: "London", email: "bob@example.com" },
        { name: "Charlie", age: 35, city: "Tokyo", email: "charlie@example.com" },
      ], null, 2));
    } else {
      setInput('name,age,city,email\nAlice,30,New York,alice@example.com\nBob,25,London,bob@example.com\nCharlie,35,Tokyo,charlie@example.com');
    }
    setOutput('');
  };

  const downloadOutput = () => {
    const ext = mode === 'json-to-csv' ? 'csv' : 'json';
    const mime = mode === 'json-to-csv' ? 'text/csv' : 'application/json';
    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => { setMode('json-to-csv'); setOutput(''); }} className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'json-to-csv' ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}>
          JSON → CSV
        </button>
        <button onClick={() => { setMode('csv-to-json'); setOutput(''); }} className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'csv-to-json' ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}>
          CSV → JSON
        </button>
        <button onClick={loadSample} className="ml-auto rounded-lg border border-surface-200 px-3 py-2 text-sm text-surface-600 hover:bg-surface-50">Load Sample</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">{mode === 'json-to-csv' ? 'JSON Input' : 'CSV Input'}</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === 'json-to-csv' ? 'Paste JSON array...' : 'Paste CSV data...'} className="h-64 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" spellCheck={false} />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-surface-700">{mode === 'json-to-csv' ? 'CSV Output' : 'JSON Output'}</label>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <button onClick={downloadOutput} className="rounded-lg border border-surface-200 px-3 py-1 text-sm text-surface-600 hover:bg-surface-50">Download</button>}
            </div>
          </div>
          <textarea value={output} readOnly className="h-64 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm" spellCheck={false} />
        </div>
      </div>

      <button onClick={convert} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700">Convert</button>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    </div>
  );
}
