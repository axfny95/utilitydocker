import { useState } from 'react';

export default function TipCalculator() {
  const [bill, setBill] = useState('');
  const [tipPercent, setTipPercent] = useState(18);
  const [people, setPeople] = useState(1);
  const [customTip, setCustomTip] = useState('');

  const billAmount = parseFloat(bill) || 0;
  const tip = billAmount * ((customTip ? parseFloat(customTip) : tipPercent) / 100);
  const total = billAmount + tip;
  const perPerson = people > 0 ? total / people : total;
  const tipPerPerson = people > 0 ? tip / people : tip;

  const presets = [10, 15, 18, 20, 25, 30];

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-surface-700">Bill Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-surface-400">$</span>
          <input type="number" value={bill} onChange={(e) => setBill(e.target.value)} placeholder="0.00" min={0} step={0.01} className="w-full rounded-lg border border-surface-200 py-3 pl-8 pr-3 text-2xl font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-surface-700">Tip Percentage</label>
        <div className="flex flex-wrap gap-2">
          {presets.map((pct) => (
            <button key={pct} onClick={() => { setTipPercent(pct); setCustomTip(''); }} className={`rounded-lg px-4 py-2 text-sm font-medium ${!customTip && tipPercent === pct ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}>
              {pct}%
            </button>
          ))}
          <input type="number" value={customTip} onChange={(e) => setCustomTip(e.target.value)} placeholder="Custom %" className="w-24 rounded-lg border border-surface-200 px-3 py-2 text-sm" min={0} max={100} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-surface-700">Split Between</label>
        <div className="flex items-center gap-3">
          <button onClick={() => setPeople(Math.max(1, people - 1))} className="rounded-lg border border-surface-200 px-3 py-2 text-lg hover:bg-surface-50">-</button>
          <span className="text-2xl font-bold w-8 text-center">{people}</span>
          <button onClick={() => setPeople(people + 1)} className="rounded-lg border border-surface-200 px-3 py-2 text-lg hover:bg-surface-50">+</button>
          <span className="text-sm text-surface-500">people</span>
        </div>
      </div>

      {billAmount > 0 && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-surface-600">Tip</span>
            <span className="text-xl font-bold font-mono">${tip.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center border-t border-primary-200 pt-4">
            <span className="text-surface-600 font-medium">Total</span>
            <span className="text-2xl font-bold font-mono text-primary-700">${total.toFixed(2)}</span>
          </div>
          {people > 1 && (
            <div className="border-t border-primary-200 pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-surface-600">Per person (total)</span>
                <span className="text-lg font-bold font-mono">${perPerson.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-surface-600">Per person (tip)</span>
                <span className="font-mono">${tipPerPerson.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
