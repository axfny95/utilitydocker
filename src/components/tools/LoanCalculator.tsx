import { useState, useMemo } from 'react';

export default function LoanCalculator() {
  const [amount, setAmount] = useState('10000');
  const [rate, setRate] = useState('5.5');
  const [term, setTerm] = useState('36');
  const [termUnit, setTermUnit] = useState<'months' | 'years'>('months');

  const result = useMemo(() => {
    const principal = parseFloat(amount);
    const annualRate = parseFloat(rate);
    const months = termUnit === 'years' ? parseFloat(term) * 12 : parseFloat(term);
    if (!principal || !annualRate || !months || principal <= 0 || months <= 0) return null;

    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate <= 0) return null;
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    if (denominator === 0 || !isFinite(denominator)) return null;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / denominator;
    const totalPaid = payment * months;
    const totalInterest = totalPaid - principal;

    // Amortization summary
    const schedule: { month: number; payment: number; principal: number; interest: number; balance: number }[] = [];
    let balance = principal;
    for (let i = 1; i <= months; i++) {
      const interest = balance * monthlyRate;
      const principalPart = payment - interest;
      balance -= principalPart;
      if (i <= 12 || i === months || i % 12 === 0) {
        schedule.push({ month: i, payment, principal: principalPart, interest, balance: Math.max(0, balance) });
      }
    }

    return { payment, totalPaid, totalInterest, months, schedule };
  }, [amount, rate, term, termUnit]);

  const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Loan Amount</label>
          <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">$</span><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-lg border border-surface-200 py-2.5 pl-7 pr-3 text-sm font-mono" /></div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Interest Rate (%)</label>
          <input type="number" step={0.1} value={rate} onChange={(e) => setRate(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm font-mono" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Loan Term</label>
          <input type="number" value={term} onChange={(e) => setTerm(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm font-mono" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Term Unit</label>
          <select value={termUnit} onChange={(e) => setTermUnit(e.target.value as 'months' | 'years')} className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm">
            <option value="months">Months</option>
            <option value="years">Years</option>
          </select>
        </div>
      </div>

      {result && (
        <>
          <div className="rounded-xl border border-primary-200 bg-primary-50 p-6 text-center">
            <p className="text-sm text-surface-600">Monthly Payment</p>
            <p className="text-4xl font-bold text-primary-700 font-mono">{fmt(result.payment)}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-center">
              <p className="font-mono font-bold">{fmt(parseFloat(amount))}</p>
              <p className="text-xs text-surface-500">Principal</p>
            </div>
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-center">
              <p className="font-mono font-bold text-red-600">{fmt(result.totalInterest)}</p>
              <p className="text-xs text-surface-500">Total Interest</p>
            </div>
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-center">
              <p className="font-mono font-bold">{fmt(result.totalPaid)}</p>
              <p className="text-xs text-surface-500">Total Paid</p>
            </div>
          </div>

          <details className="rounded-lg border border-surface-200">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-surface-700">Amortization Schedule</summary>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-surface-50"><tr><th className="px-3 py-2 text-left">Month</th><th className="px-3 py-2 text-right">Payment</th><th className="px-3 py-2 text-right">Principal</th><th className="px-3 py-2 text-right">Interest</th><th className="px-3 py-2 text-right">Balance</th></tr></thead>
                <tbody className="divide-y divide-surface-100">
                  {result.schedule.map((row) => (
                    <tr key={row.month}><td className="px-3 py-1.5">{row.month}</td><td className="px-3 py-1.5 text-right font-mono">{fmt(row.payment)}</td><td className="px-3 py-1.5 text-right font-mono">{fmt(row.principal)}</td><td className="px-3 py-1.5 text-right font-mono">{fmt(row.interest)}</td><td className="px-3 py-1.5 text-right font-mono">{fmt(row.balance)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </div>
  );
}
