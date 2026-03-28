import { useState, useEffect } from 'react';
import CopyButton from '../shared/CopyButton';

export default function UnixTimestampConverter() {
  const [timestamp, setTimestamp] = useState(() => Math.floor(Date.now() / 1000));
  const [dateString, setDateString] = useState('');
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [mode, setMode] = useState<'to-date' | 'to-timestamp'>('to-date');

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  const date = new Date(timestamp * 1000);
  const isValid = !isNaN(date.getTime());

  const convertDateToTimestamp = (str: string) => {
    setDateString(str);
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      setTimestamp(Math.floor(d.getTime() / 1000));
    }
  };

  const setNow = () => {
    const now = Math.floor(Date.now() / 1000);
    setTimestamp(now);
    setDateString(new Date(now * 1000).toISOString().slice(0, 19));
  };

  const formats = isValid ? [
    { label: 'UTC', value: date.toUTCString() },
    { label: 'ISO 8601', value: date.toISOString() },
    { label: 'Local', value: date.toLocaleString() },
    { label: 'Date Only', value: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
    { label: 'Time Only', value: date.toLocaleTimeString() },
    { label: 'Relative', value: getRelativeTime(timestamp, currentTime) },
    { label: 'Milliseconds', value: String(timestamp * 1000) },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Current time */}
      <div className="rounded-lg border border-primary-100 bg-primary-50 p-4 text-center">
        <span className="text-sm text-surface-600">Current Unix Timestamp: </span>
        <span className="font-mono text-lg font-bold text-primary-700">{currentTime}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setMode('to-date')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'to-date' ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}
        >
          Timestamp → Date
        </button>
        <button
          onClick={() => setMode('to-timestamp')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'to-timestamp' ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}
        >
          Date → Timestamp
        </button>
        <button onClick={setNow} className="ml-auto rounded-lg border border-surface-200 px-3 py-2 text-sm text-surface-600 hover:bg-surface-50">
          Use Now
        </button>
      </div>

      {mode === 'to-date' ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Unix Timestamp (seconds)</label>
          <input
            type="number"
            value={timestamp}
            onChange={(e) => setTimestamp(Number(e.target.value))}
            className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Date & Time</label>
          <input
            type="datetime-local"
            value={dateString || new Date(timestamp * 1000).toISOString().slice(0, 19)}
            onChange={(e) => convertDateToTimestamp(e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-surface-600">Unix Timestamp:</span>
            <code className="font-mono text-lg font-bold text-primary-700">{timestamp}</code>
            <CopyButton text={String(timestamp)} />
          </div>
        </div>
      )}

      {isValid && mode === 'to-date' && (
        <div className="space-y-2">
          {formats.map((f) => (
            <div key={f.label} className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 px-4 py-2">
              <span className="text-sm text-surface-600">{f.label}</span>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm">{f.value}</code>
                <CopyButton text={f.value} label="" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isValid && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Invalid timestamp</div>}
    </div>
  );
}

function getRelativeTime(ts: number, now: number): string {
  const diff = now - ts;
  const abs = Math.abs(diff);
  const suffix = diff > 0 ? 'ago' : 'from now';
  if (abs < 60) return `${abs} seconds ${suffix}`;
  if (abs < 3600) return `${Math.floor(abs / 60)} minutes ${suffix}`;
  if (abs < 86400) return `${Math.floor(abs / 3600)} hours ${suffix}`;
  if (abs < 2592000) return `${Math.floor(abs / 86400)} days ${suffix}`;
  if (abs < 31536000) return `${Math.floor(abs / 2592000)} months ${suffix}`;
  return `${Math.floor(abs / 31536000)} years ${suffix}`;
}
