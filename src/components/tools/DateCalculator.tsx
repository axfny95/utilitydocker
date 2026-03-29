import { useState, useMemo } from 'react';

export default function DateCalculator() {
  const [mode, setMode] = useState<'between' | 'add'>('between');
  const [dateA, setDateA] = useState(new Date().toISOString().split('T')[0]);
  const [dateB, setDateB] = useState('');
  const [addDays, setAddDays] = useState(30);
  const [addWeeks, setAddWeeks] = useState(0);
  const [addMonths, setAddMonths] = useState(0);
  const [addYears, setAddYears] = useState(0);

  const betweenResult = useMemo(() => {
    if (!dateA || !dateB) return null;
    const a = new Date(dateA);
    const b = new Date(dateB);
    const diffMs = Math.abs(b.getTime() - a.getTime());
    const days = Math.floor(diffMs / 86400000);
    const weeks = Math.floor(days / 7);
    const months = Math.round(days / 30.44);
    const years = (days / 365.25).toFixed(1);
    const hours = days * 24;
    const minutes = hours * 60;
    return { days, weeks, months, years, hours, minutes };
  }, [dateA, dateB]);

  const addResult = useMemo(() => {
    if (!dateA) return null;
    const d = new Date(dateA);
    d.setFullYear(d.getFullYear() + addYears);
    d.setMonth(d.getMonth() + addMonths);
    d.setDate(d.getDate() + addDays + addWeeks * 7);
    return d;
  }, [dateA, addDays, addWeeks, addMonths, addYears]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button onClick={() => setMode('between')} className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'between' ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}>Days Between Dates</button>
        <button onClick={() => setMode('add')} className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'add' ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}>Add/Subtract Days</button>
      </div>

      {mode === 'between' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">Start Date</label>
              <input type="date" value={dateA} onChange={(e) => setDateA(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">End Date</label>
              <input type="date" value={dateB} onChange={(e) => setDateB(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm" />
            </div>
          </div>
          {betweenResult && (
            <div className="rounded-xl border border-primary-200 bg-primary-50 p-6 text-center">
              <p className="text-4xl font-bold text-primary-700">{betweenResult.days.toLocaleString()}</p>
              <p className="mt-1 text-lg text-surface-600">days</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-2 text-center"><p className="font-bold">{betweenResult.weeks}</p><p className="text-xs text-surface-500">weeks</p></div>
                <div className="rounded-lg bg-white p-2 text-center"><p className="font-bold">{betweenResult.months}</p><p className="text-xs text-surface-500">months</p></div>
                <div className="rounded-lg bg-white p-2 text-center"><p className="font-bold">{betweenResult.years}</p><p className="text-xs text-surface-500">years</p></div>
                <div className="rounded-lg bg-white p-2 text-center"><p className="font-bold">{betweenResult.hours.toLocaleString()}</p><p className="text-xs text-surface-500">hours</p></div>
              </div>
            </div>
          )}
        </>
      )}

      {mode === 'add' && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700">Start Date</label>
            <input type="date" value={dateA} onChange={(e) => setDateA(e.target.value)} className="w-full max-w-xs rounded-lg border border-surface-200 px-3 py-2.5 text-sm" />
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <div><label className="mb-1 block text-xs text-surface-600">Days</label><input type="number" value={addDays} onChange={(e) => setAddDays(Number(e.target.value))} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-xs text-surface-600">Weeks</label><input type="number" value={addWeeks} onChange={(e) => setAddWeeks(Number(e.target.value))} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-xs text-surface-600">Months</label><input type="number" value={addMonths} onChange={(e) => setAddMonths(Number(e.target.value))} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-xs text-surface-600">Years</label><input type="number" value={addYears} onChange={(e) => setAddYears(Number(e.target.value))} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" /></div>
          </div>
          {addResult && (
            <div className="rounded-xl border border-primary-200 bg-primary-50 p-6 text-center">
              <p className="text-3xl font-bold text-primary-700">
                {addResult.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
