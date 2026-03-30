import { useState, useMemo } from 'react';

export default function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState('300000');
  const [downPayment, setDownPayment] = useState('60000');
  const [interestRate, setInterestRate] = useState('6.5');
  const [loanTerm, setLoanTerm] = useState('30');
  const [propertyTax, setPropertyTax] = useState('3600');
  const [insurance, setInsurance] = useState('1200');

  const result = useMemo(() => {
    const principal = parseFloat(homePrice) - parseFloat(downPayment);
    const rate = parseFloat(interestRate) / 100 / 12;
    const payments = parseFloat(loanTerm) * 12;
    const taxMonthly = (parseFloat(propertyTax) || 0) / 12;
    const insMonthly = (parseFloat(insurance) || 0) / 12;

    if (principal <= 0 || payments <= 0 || isNaN(rate)) return null;
    if (rate <= 0) return null;

    const denominator = Math.pow(1 + rate, payments) - 1;
    if (denominator === 0 || !isFinite(denominator)) return null;
    const monthlyPrincipalInterest = principal * (rate * Math.pow(1 + rate, payments)) / denominator;
    const monthlyTotal = monthlyPrincipalInterest + taxMonthly + insMonthly;
    const totalPaid = monthlyPrincipalInterest * payments;
    const totalInterest = totalPaid - principal;

    return {
      monthlyPayment: monthlyTotal,
      principalInterest: monthlyPrincipalInterest,
      monthlyTax: taxMonthly,
      monthlyInsurance: insMonthly,
      totalPaid,
      totalInterest,
      principal,
      loanToValue: (principal / parseFloat(homePrice)) * 100,
    };
  }, [homePrice, downPayment, interestRate, loanTerm, propertyTax, insurance]);

  const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Home Price</label>
          <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">$</span><input type="number" value={homePrice} onChange={(e) => setHomePrice(e.target.value)} className="w-full rounded-lg border border-surface-200 py-2 pl-7 pr-3 text-sm font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" /></div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Down Payment</label>
          <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">$</span><input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} className="w-full rounded-lg border border-surface-200 py-2 pl-7 pr-3 text-sm font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" /></div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Interest Rate (%)</label>
          <input type="number" step={0.1} value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Loan Term (years)</label>
          <select value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm">
            <option value="15">15 years</option>
            <option value="20">20 years</option>
            <option value="30">30 years</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Annual Property Tax</label>
          <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">$</span><input type="number" value={propertyTax} onChange={(e) => setPropertyTax(e.target.value)} className="w-full rounded-lg border border-surface-200 py-2 pl-7 pr-3 text-sm font-mono" /></div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Annual Insurance</label>
          <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">$</span><input type="number" value={insurance} onChange={(e) => setInsurance(e.target.value)} className="w-full rounded-lg border border-surface-200 py-2 pl-7 pr-3 text-sm font-mono" /></div>
        </div>
      </div>

      {result && (
        <>
          <div className="rounded-xl border border-primary-200 bg-primary-50 p-6 text-center">
            <p className="text-sm text-surface-600">Monthly Payment</p>
            <p className="text-4xl font-bold text-primary-700 font-mono">{fmt(result.monthlyPayment)}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-center">
              <p className="font-mono font-bold">{fmt(result.principalInterest)}</p>
              <p className="text-xs text-surface-500">Principal & Interest</p>
            </div>
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-center">
              <p className="font-mono font-bold">{fmt(result.monthlyTax)}</p>
              <p className="text-xs text-surface-500">Property Tax</p>
            </div>
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-center">
              <p className="font-mono font-bold">{fmt(result.monthlyInsurance)}</p>
              <p className="text-xs text-surface-500">Insurance</p>
            </div>
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-center">
              <p className="font-mono font-bold">{result.loanToValue.toFixed(0)}%</p>
              <p className="text-xs text-surface-500">Loan-to-Value</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-center">
              <p className="font-mono font-bold text-lg">{fmt(result.principal)}</p>
              <p className="text-xs text-surface-500">Loan Amount</p>
            </div>
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-center">
              <p className="font-mono font-bold text-lg text-red-600">{fmt(result.totalInterest)}</p>
              <p className="text-xs text-surface-500">Total Interest</p>
            </div>
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-center">
              <p className="font-mono font-bold text-lg">{fmt(result.totalPaid)}</p>
              <p className="text-xs text-surface-500">Total Paid</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
