import { useState, useEffect } from 'react';

const TIMEZONES = [
  { id: 'America/New_York', label: 'New York', short: 'EST/EDT' },
  { id: 'America/Chicago', label: 'Chicago', short: 'CST/CDT' },
  { id: 'America/Denver', label: 'Denver', short: 'MST/MDT' },
  { id: 'America/Los_Angeles', label: 'Los Angeles', short: 'PST/PDT' },
  { id: 'America/Toronto', label: 'Toronto', short: 'EST/EDT' },
  { id: 'America/Sao_Paulo', label: 'Sao Paulo', short: 'BRT' },
  { id: 'Europe/London', label: 'London', short: 'GMT/BST' },
  { id: 'Europe/Paris', label: 'Paris', short: 'CET/CEST' },
  { id: 'Europe/Berlin', label: 'Berlin', short: 'CET/CEST' },
  { id: 'Europe/Moscow', label: 'Moscow', short: 'MSK' },
  { id: 'Asia/Dubai', label: 'Dubai', short: 'GST' },
  { id: 'Asia/Kolkata', label: 'Mumbai', short: 'IST' },
  { id: 'Asia/Shanghai', label: 'Shanghai', short: 'CST' },
  { id: 'Asia/Tokyo', label: 'Tokyo', short: 'JST' },
  { id: 'Asia/Seoul', label: 'Seoul', short: 'KST' },
  { id: 'Asia/Singapore', label: 'Singapore', short: 'SGT' },
  { id: 'Australia/Sydney', label: 'Sydney', short: 'AEST/AEDT' },
  { id: 'Pacific/Auckland', label: 'Auckland', short: 'NZST/NZDT' },
  { id: 'Pacific/Honolulu', label: 'Honolulu', short: 'HST' },
  { id: 'UTC', label: 'UTC', short: 'UTC' },
];

export default function WorldClock() {
  const [now, setNow] = useState(new Date());
  const [selected, setSelected] = useState<string[]>(['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney']);
  const [convertTime, setConvertTime] = useState('');
  const [convertFrom, setConvertFrom] = useState('UTC');

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTimezone = (tz: string) => {
    setSelected((prev) =>
      prev.includes(tz) ? prev.filter((t) => t !== tz) : [...prev, tz]
    );
  };

  const formatTime = (tz: string, date: Date = now) => {
    try {
      return date.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    } catch { return '--:--:--'; }
  };

  const formatDate = (tz: string, date: Date = now) => {
    try {
      return date.toLocaleDateString('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  const getOffset = (tz: string) => {
    try {
      const str = new Date().toLocaleString('en-US', { timeZone: tz, timeZoneName: 'shortOffset' });
      const match = str.match(/GMT([+-]\d{1,2}(?::\d{2})?)/);
      return match ? `UTC${match[1]}` : '';
    } catch { return ''; }
  };

  // Time conversion
  const convertedTimes = convertTime ? selected.map((tz) => {
    try {
      const [hours, minutes] = convertTime.split(':').map(Number);
      const d = new Date();
      // Set the time in the "from" timezone
      const fromDate = new Date(d.toLocaleString('en-US', { timeZone: convertFrom }));
      const localDate = new Date(d.toLocaleString('en-US'));
      const offset = localDate.getTime() - fromDate.getTime();
      const target = new Date(d);
      target.setHours(hours, minutes, 0, 0);
      target.setTime(target.getTime() + offset);
      return { tz, time: formatTime(tz, target), date: formatDate(tz, target) };
    } catch { return { tz, time: '--:--', date: '' }; }
  }) : [];

  return (
    <div className="space-y-6">
      {/* Live clocks */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {selected.map((tz) => {
          const info = TIMEZONES.find((t) => t.id === tz);
          return (
            <div key={tz} className="rounded-xl border border-surface-200 bg-white p-4 text-center">
              <p className="text-sm font-medium text-surface-900">{info?.label || tz}</p>
              <p className="text-2xl font-bold font-mono text-primary-700">{formatTime(tz)}</p>
              <p className="text-xs text-surface-500">{formatDate(tz)} | {getOffset(tz)}</p>
              <button onClick={() => toggleTimezone(tz)} className="mt-2 text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
          );
        })}
      </div>

      {/* Add timezone */}
      <div>
        <label className="mb-1 block text-sm font-medium text-surface-700">Add a timezone</label>
        <div className="flex flex-wrap gap-2">
          {TIMEZONES.filter((tz) => !selected.includes(tz.id)).map((tz) => (
            <button key={tz.id} onClick={() => toggleTimezone(tz.id)} className="rounded-lg border border-surface-200 px-2.5 py-1 text-xs text-surface-600 hover:bg-surface-50">
              {tz.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time converter */}
      <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 space-y-3">
        <h3 className="text-sm font-medium text-surface-700">Convert a specific time</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs text-surface-600">Time</label>
            <input type="time" value={convertTime} onChange={(e) => setConvertTime(e.target.value)} className="rounded-lg border border-surface-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-surface-600">In timezone</label>
            <select value={convertFrom} onChange={(e) => setConvertFrom(e.target.value)} className="rounded-lg border border-surface-200 px-3 py-2 text-sm">
              {TIMEZONES.map((tz) => <option key={tz.id} value={tz.id}>{tz.label}</option>)}
            </select>
          </div>
        </div>
        {convertedTimes.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {convertedTimes.map((ct) => (
              <div key={ct.tz} className="flex items-center justify-between rounded-lg border border-surface-100 bg-white px-3 py-2">
                <span className="text-sm text-surface-600">{TIMEZONES.find((t) => t.id === ct.tz)?.label || ct.tz}</span>
                <span className="font-mono text-sm font-bold">{ct.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
