import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

export default function RandomNumberGenerator() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [unique, setUnique] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [mode, setMode] = useState<'number' | 'coin' | 'dice'>('number');

  const [error, setError] = useState<string | null>(null);

  // Cryptographically secure random integer in [min, max]
  const secureRandom = (lo: number, hi: number): number => {
    const range = hi - lo + 1;
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return lo + (array[0] % range);
  };

  const generate = () => {
    setError(null);
    if (mode === 'coin') {
      setResults(Array.from({ length: count }, () => secureRandom(0, 1)));
      return;
    }
    if (mode === 'dice') {
      setResults(Array.from({ length: count }, () => secureRandom(1, 6)));
      return;
    }
    if (min > max) { setError('Min must be less than or equal to Max'); return; }
    if (unique && (max - min + 1) < count) {
      setError(`Cannot generate ${count} unique numbers from range ${min}-${max} (only ${max - min + 1} possible values)`);
      return;
    }
    if (unique) {
      const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min);
      // Fisher-Yates shuffle with crypto random
      for (let i = pool.length - 1; i > 0; i--) {
        const j = secureRandom(0, i);
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      setResults(pool.slice(0, count));
    } else {
      setResults(Array.from({ length: count }, () => secureRandom(min, max)));
    }
  };

  const coinLabels = ['Heads', 'Tails'];
  const diceEmojis = ['', '\u2680', '\u2681', '\u2682', '\u2683', '\u2684', '\u2685'];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {([['number', 'Number'], ['coin', 'Coin Flip'], ['dice', 'Dice Roll']] as const).map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setResults([]); }} className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === m ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}>
            {label}
          </button>
        ))}
      </div>

      {mode === 'number' && (
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700">Min</label>
            <input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} className="w-28 rounded-lg border border-surface-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700">Max</label>
            <input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} className="w-28 rounded-lg border border-surface-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700">Count</label>
            <input type="number" min={1} max={1000} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-24 rounded-lg border border-surface-200 px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} className="rounded border-surface-300" />
            Unique only
          </label>
        </div>
      )}

      {(mode === 'coin' || mode === 'dice') && (
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Count</label>
          <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-24 rounded-lg border border-surface-200 px-3 py-2 text-sm" />
        </div>
      )}

      <button onClick={generate} className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700">
        {mode === 'number' ? 'Generate' : mode === 'coin' ? 'Flip!' : 'Roll!'}
      </button>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {results.length > 0 && (
        <div>
          {mode === 'number' && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm text-surface-500">{results.length} result{results.length > 1 ? 's' : ''}</span>
                <CopyButton text={results.join(', ')} />
              </div>
              {results.length === 1 ? (
                <div className="rounded-xl border border-primary-200 bg-primary-50 p-8 text-center">
                  <p className="text-6xl font-bold text-primary-700 font-mono">{results[0]}</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {results.map((n, i) => (
                    <span key={i} className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-1.5 font-mono text-sm font-bold">{n}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {mode === 'coin' && (
            <div className="flex flex-wrap gap-3 justify-center">
              {results.map((r, i) => (
                <div key={i} className={`flex h-16 w-16 items-center justify-center rounded-full border-2 text-sm font-bold ${r === 0 ? 'border-yellow-400 bg-yellow-50 text-yellow-700' : 'border-surface-300 bg-surface-100 text-surface-600'}`}>
                  {coinLabels[r]}
                </div>
              ))}
            </div>
          )}

          {mode === 'dice' && (
            <div className="flex flex-wrap gap-3 justify-center">
              {results.map((r, i) => (
                <div key={i} className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-surface-300 bg-white text-4xl shadow-sm">
                  {diceEmojis[r]}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
