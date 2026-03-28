import { useState, useEffect } from 'react';
import CopyButton from '../shared/CopyButton';

export default function CountdownTimer() {
  const [targetDate, setTargetDate] = useState('');
  const [eventName, setEventName] = useState('');
  const [diff, setDiff] = useState<{ days: number; hours: number; minutes: number; seconds: number; total: number } | null>(null);

  useEffect(() => {
    if (!targetDate) { setDiff(null); return; }
    const update = () => {
      const target = new Date(targetDate).getTime();
      const now = Date.now();
      const total = target - now;
      if (total <= 0) {
        setDiff({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        return;
      }
      setDiff({
        days: Math.floor(total / 86400000),
        hours: Math.floor((total % 86400000) / 3600000),
        minutes: Math.floor((total % 3600000) / 60000),
        seconds: Math.floor((total % 60000) / 1000),
        total,
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const presets = [
    { label: 'New Year', date: `${new Date().getFullYear() + 1}-01-01T00:00` },
    { label: 'Tomorrow', date: new Date(Date.now() + 86400000).toISOString().slice(0, 16) },
    { label: 'Next Week', date: new Date(Date.now() + 604800000).toISOString().slice(0, 16) },
    { label: 'Next Month', date: new Date(Date.now() + 2592000000).toISOString().slice(0, 16) },
  ];

  const shareText = diff && eventName
    ? `${eventName}: ${diff.days}d ${diff.hours}h ${diff.minutes}m ${diff.seconds}s remaining`
    : '';

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Event Name (optional)</label>
          <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="My Birthday, Product Launch..." className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Target Date & Time</label>
          <input type="datetime-local" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button key={p.label} onClick={() => { setTargetDate(p.date); if (!eventName) setEventName(p.label); }} className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs text-surface-600 hover:bg-surface-50">
            {p.label}
          </button>
        ))}
      </div>

      {diff && (
        <>
          {eventName && <h2 className="text-center text-xl font-bold text-surface-900">{eventName}</h2>}

          {diff.total > 0 ? (
            <div className="grid grid-cols-4 gap-3">
              {[
                { value: diff.days, label: 'Days' },
                { value: diff.hours, label: 'Hours' },
                { value: diff.minutes, label: 'Minutes' },
                { value: diff.seconds, label: 'Seconds' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-primary-200 bg-primary-50 p-4 text-center">
                  <p className="text-4xl font-bold font-mono text-primary-700 sm:text-5xl">
                    {String(item.value).padStart(2, '0')}
                  </p>
                  <p className="mt-1 text-xs font-medium text-surface-600">{item.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
              <p className="text-3xl font-bold text-green-700">Time's Up!</p>
              {eventName && <p className="mt-2 text-green-600">{eventName} has arrived!</p>}
            </div>
          )}

          {diff.total > 0 && (
            <div className="text-center text-sm text-surface-500">
              That's {Math.floor(diff.total / 86400000).toLocaleString()} days, or{' '}
              {Math.floor(diff.total / 3600000).toLocaleString()} hours, or{' '}
              {Math.floor(diff.total / 60000).toLocaleString()} minutes
            </div>
          )}

          {shareText && <div className="text-center"><CopyButton text={shareText} label="Copy Countdown" /></div>}
        </>
      )}
    </div>
  );
}
