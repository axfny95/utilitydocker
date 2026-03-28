import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function UuidGenerator() {
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>(() => [generateUUID()]);
  const [uppercase, setUppercase] = useState(false);
  const [noDashes, setNoDashes] = useState(false);

  const generate = () => {
    setUuids(Array.from({ length: count }, generateUUID));
  };

  const format = (uuid: string) => {
    let result = noDashes ? uuid.replace(/-/g, '') : uuid;
    return uppercase ? result.toUpperCase() : result;
  };

  const allFormatted = uuids.map(format).join('\n');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Count</label>
          <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="rounded-lg border border-surface-200 px-3 py-2 text-sm">
            {[1, 5, 10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="rounded border-surface-300" />
          Uppercase
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={noDashes} onChange={(e) => setNoDashes(e.target.checked)} className="rounded border-surface-300" />
          No dashes
        </label>
        <button onClick={generate} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          Generate
        </button>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm text-surface-500">{uuids.length} UUID{uuids.length > 1 ? 's' : ''} (v4)</span>
          <CopyButton text={allFormatted} label={uuids.length > 1 ? 'Copy All' : 'Copy'} />
        </div>
        <div className="max-h-80 overflow-auto rounded-lg border border-surface-200 bg-surface-50">
          {uuids.map((uuid, i) => (
            <div key={i} className="flex items-center justify-between border-b border-surface-100 px-3 py-2 last:border-b-0">
              <code className="font-mono text-sm">{format(uuid)}</code>
              {uuids.length > 1 && <CopyButton text={format(uuid)} label="" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
