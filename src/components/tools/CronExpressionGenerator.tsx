import { useState, useMemo } from 'react';
import CopyButton from '../shared/CopyButton';

const PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at midnight', value: '0 0 * * *' },
  { label: 'Every day at noon', value: '0 12 * * *' },
  { label: 'Every Monday at 9 AM', value: '0 9 * * 1' },
  { label: 'Every weekday at 9 AM', value: '0 9 * * 1-5' },
  { label: 'First of every month', value: '0 0 1 * *' },
  { label: 'Every Sunday at 3 AM', value: '0 3 * * 0' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return 'Invalid cron expression (need 5 fields)';

  const [minute, hour, dom, month, dow] = parts;

  let desc = 'Runs ';

  // Day of week
  if (dow === '*' && dom === '*') desc += 'every day';
  else if (dow === '1-5') desc += 'every weekday';
  else if (dow === '0,6') desc += 'every weekend';
  else if (dow !== '*') {
    const days = dow.split(',').map((d) => DAYS[parseInt(d)] || d);
    desc += `on ${days.join(', ')}`;
  } else if (dom !== '*') {
    desc += `on day ${dom} of the month`;
  }

  // Month
  if (month !== '*') {
    const months = month.split(',').map((m) => MONTHS[parseInt(m) - 1] || m);
    desc += ` in ${months.join(', ')}`;
  }

  // Time
  if (minute === '*' && hour === '*') desc += ' every minute';
  else if (minute.startsWith('*/')) desc += ` every ${minute.slice(2)} minutes`;
  else if (hour === '*') desc += ` at minute ${minute} of every hour`;
  else desc += ` at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

  return desc;
}

function getNextRuns(expr: string, count: number = 5): Date[] {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const runs: Date[] = [];
  const now = new Date();
  const check = new Date(now);
  check.setSeconds(0, 0);

  for (let i = 0; i < 525600 && runs.length < count; i++) { // max 1 year of minutes
    check.setMinutes(check.getMinutes() + 1);
    if (matchesCron(check, parts)) runs.push(new Date(check));
  }
  return runs;
}

function matchesCron(date: Date, parts: string[]): boolean {
  const [minute, hour, dom, month, dow] = parts;
  return matchField(minute, date.getMinutes()) &&
    matchField(hour, date.getHours()) &&
    matchField(dom, date.getDate()) &&
    matchField(month, date.getMonth() + 1) &&
    matchField(dow, date.getDay());
}

function matchField(field: string, value: number): boolean {
  if (field === '*') return true;
  return field.split(',').some((part) => {
    if (part.includes('/')) {
      const [, step] = part.split('/');
      return value % parseInt(step) === 0;
    }
    if (part.includes('-')) {
      const [min, max] = part.split('-').map(Number);
      return value >= min && value <= max;
    }
    return parseInt(part) === value;
  });
}

export default function CronExpressionGenerator() {
  const [expression, setExpression] = useState('0 9 * * 1-5');

  const description = useMemo(() => describeCron(expression), [expression]);
  const nextRuns = useMemo(() => getNextRuns(expression), [expression]);

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-surface-700">Cron Expression</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            className="flex-1 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 font-mono text-lg focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="* * * * *"
            spellCheck={false}
          />
          <CopyButton text={expression} />
        </div>
        <div className="mt-1 flex gap-2 font-mono text-xs text-surface-400">
          <span className="flex-1 text-center">minute</span>
          <span className="flex-1 text-center">hour</span>
          <span className="flex-1 text-center">day</span>
          <span className="flex-1 text-center">month</span>
          <span className="flex-1 text-center">weekday</span>
        </div>
      </div>

      <div className="rounded-lg border border-primary-100 bg-primary-50 px-4 py-3">
        <p className="text-sm font-medium text-primary-800">{description}</p>
      </div>

      {/* Presets */}
      <div>
        <label className="mb-2 block text-sm font-medium text-surface-700">Quick Presets</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setExpression(p.value)}
              className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs text-surface-600 hover:bg-surface-50"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Next runs */}
      {nextRuns.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-surface-700">Next {nextRuns.length} Runs</label>
          <div className="rounded-lg border border-surface-200">
            {nextRuns.map((run, i) => (
              <div key={i} className="flex items-center justify-between border-b border-surface-100 px-4 py-2 text-sm last:border-0">
                <span className="text-surface-500">#{i + 1}</span>
                <span className="font-mono">{run.toLocaleString()}</span>
                <span className="text-xs text-surface-400">
                  {getRelative(run)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reference */}
      <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 text-xs text-surface-600">
        <p className="font-medium">Syntax: <code className="font-mono">minute hour day month weekday</code></p>
        <p className="mt-1"><code>*</code> = any, <code>*/n</code> = every n, <code>1,3,5</code> = specific values, <code>1-5</code> = range</p>
        <p className="mt-1">Weekdays: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat</p>
      </div>
    </div>
  );
}

function getRelative(date: Date): string {
  const diff = date.getTime() - Date.now();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `in ${hours}h ${mins % 60}m`;
  const days = Math.floor(hours / 24);
  return `in ${days}d ${hours % 24}h`;
}
