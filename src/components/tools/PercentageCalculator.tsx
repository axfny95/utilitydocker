import { useState } from 'react';

export default function PercentageCalculator() {
  const [mode, setMode] = useState<'of' | 'change' | 'is'>('of');
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const calc = () => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (isNaN(numA) || isNaN(numB)) return null;
    switch (mode) {
      case 'of': return (numA / 100) * numB; // What is A% of B?
      case 'change': return numB === 0 ? null : ((numA - numB) / Math.abs(numB)) * 100; // % change from B to A
      case 'is': return numB === 0 ? null : (numA / numB) * 100; // A is what % of B?
    }
  };

  const result = calc();
  const labels = {
    of: { a: 'Percentage (%)', b: 'of Number', question: `What is ${a || '?'}% of ${b || '?'}?`, answer: result !== null ? `${a}% of ${b} = ${result.toFixed(4).replace(/\.?0+$/, '')}` : '' },
    change: { a: 'New Value', b: 'Old Value', question: `% change from ${b || '?'} to ${a || '?'}?`, answer: result !== null ? `${result >= 0 ? '+' : ''}${result.toFixed(2)}% ${result >= 0 ? 'increase' : 'decrease'}` : '' },
    is: { a: 'Value', b: 'Total', question: `${a || '?'} is what % of ${b || '?'}?`, answer: result !== null ? `${a} is ${result.toFixed(4).replace(/\.?0+$/, '')}% of ${b}` : '' },
  };

  const l = labels[mode];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {([['of', 'X% of Y'], ['is', 'X is what % of Y'], ['change', '% Change']] as const).map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)} className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === m ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 text-center text-lg text-surface-600">
        {l.question}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">{l.a}</label>
          <input type="number" value={a} onChange={(e) => setA(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-3 text-lg font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Enter number" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">{l.b}</label>
          <input type="number" value={b} onChange={(e) => setB(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-3 text-lg font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Enter number" />
        </div>
      </div>

      {result !== null && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-6 text-center">
          <p className="text-2xl font-bold text-primary-700">{l.answer}</p>
        </div>
      )}

      {/* Common percentages quick calc */}
      {mode === 'of' && b && !isNaN(parseFloat(b)) && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-surface-700">Common Percentages of {b}</h3>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {[5, 10, 15, 20, 25, 30, 50, 75, 100, 150].map((pct) => (
              <div key={pct} className="rounded-lg border border-surface-100 bg-surface-50 px-2 py-2 text-center">
                <div className="text-xs text-surface-500">{pct}%</div>
                <div className="font-mono text-sm font-bold">{((pct / 100) * parseFloat(b)).toFixed(2).replace(/\.?0+$/, '')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
