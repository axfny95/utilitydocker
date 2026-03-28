import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

type Algorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

async function hashText(text: string, algorithm: Algorithm): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashFile(buffer: ArrayBuffer, algorithm: Algorithm): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<Algorithm, string>>({
    'SHA-1': '',
    'SHA-256': '',
    'SHA-384': '',
    'SHA-512': '',
  });
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [fileName, setFileName] = useState('');
  const [uppercase, setUppercase] = useState(false);

  const generateHashes = async (text: string) => {
    if (!text.trim()) {
      setHashes({ 'SHA-1': '', 'SHA-256': '', 'SHA-384': '', 'SHA-512': '' });
      return;
    }
    const algorithms: Algorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
    const results = await Promise.all(algorithms.map((alg) => hashText(text, alg)));
    const newHashes: Record<Algorithm, string> = { 'SHA-1': '', 'SHA-256': '', 'SHA-384': '', 'SHA-512': '' };
    algorithms.forEach((alg, i) => { newHashes[alg] = results[i]; });
    setHashes(newHashes);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const buffer = await file.arrayBuffer();
    const algorithms: Algorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
    const results = await Promise.all(algorithms.map((alg) => hashFile(buffer, alg)));
    const newHashes: Record<Algorithm, string> = { 'SHA-1': '', 'SHA-256': '', 'SHA-384': '', 'SHA-512': '' };
    algorithms.forEach((alg, i) => { newHashes[alg] = results[i]; });
    setHashes(newHashes);
  };

  const formatHash = (hash: string) => uppercase ? hash.toUpperCase() : hash;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('text')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'text' ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}
        >
          Text Input
        </button>
        <button
          onClick={() => setMode('file')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'file' ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}
        >
          File Input
        </button>
        <label className="ml-auto flex items-center gap-2 text-sm">
          <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="rounded border-surface-300" />
          Uppercase
        </label>
      </div>

      {mode === 'text' ? (
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); generateHashes(e.target.value); }}
          placeholder="Enter text to hash..."
          className="h-32 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          spellCheck={false}
        />
      ) : (
        <div>
          <input type="file" onChange={handleFileUpload} className="block w-full text-sm text-surface-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100" />
          {fileName && <p className="mt-2 text-sm text-surface-500">File: {fileName}</p>}
        </div>
      )}

      <div className="space-y-3">
        {(Object.entries(hashes) as [Algorithm, string][]).map(([alg, hash]) => (
          <div key={alg} className="rounded-lg border border-surface-200 bg-surface-50 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-surface-700">{alg}</span>
              {hash && <CopyButton text={formatHash(hash)} />}
            </div>
            <code className="block break-all text-xs text-surface-600">
              {hash ? formatHash(hash) : 'Enter text or upload a file to generate hashes'}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}
