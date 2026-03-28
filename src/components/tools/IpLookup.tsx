import { useState, useEffect } from 'react';
import CopyButton from '../shared/CopyButton';

interface IpInfo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  timezone?: string;
  postal?: string;
}

export default function IpLookup() {
  const [info, setInfo] = useState<IpInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lookupIp, setLookupIp] = useState('');

  const fetchIp = async (ip?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = ip ? `https://ipinfo.io/${ip}/json` : 'https://ipinfo.io/json';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch IP info');
      const data = await res.json();
      setInfo(data);
    } catch {
      // Fallback to simpler API
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        setInfo({ ip: data.ip });
      } catch {
        setError('Unable to determine your IP address. This may be blocked by your browser or ad blocker.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIp(); }, []);

  const handleLookup = () => {
    if (lookupIp.trim()) fetchIp(lookupIp.trim());
  };

  const fields = info ? [
    { label: 'IP Address', value: info.ip },
    { label: 'City', value: info.city },
    { label: 'Region', value: info.region },
    { label: 'Country', value: info.country },
    { label: 'Location', value: info.loc },
    { label: 'Organization', value: info.org },
    { label: 'Timezone', value: info.timezone },
    { label: 'Postal Code', value: info.postal },
  ].filter((f) => f.value) : [];

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-center py-8">
          <div className="tool-skeleton mx-auto h-8 w-48 rounded-lg mb-2" />
          <p className="text-sm text-surface-500">Detecting your IP address...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>
      )}

      {info && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-6 text-center">
          <p className="text-sm text-surface-600">Your IP Address</p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <p className="text-3xl font-bold font-mono text-primary-700">{info.ip}</p>
            <CopyButton text={info.ip} />
          </div>
          {info.city && info.country && (
            <p className="mt-2 text-surface-600">{[info.city, info.region, info.country].filter(Boolean).join(', ')}</p>
          )}
        </div>
      )}

      {fields.length > 1 && (
        <div className="rounded-lg border border-surface-200">
          {fields.map((field) => (
            <div key={field.label} className="flex items-center justify-between border-b border-surface-100 px-4 py-3 last:border-0">
              <span className="text-sm text-surface-600">{field.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium">{field.value}</span>
                <CopyButton text={field.value!} label="" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lookup another IP */}
      <div>
        <label className="mb-1 block text-sm font-medium text-surface-700">Look up another IP</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={lookupIp}
            onChange={(e) => setLookupIp(e.target.value)}
            placeholder="e.g., 8.8.8.8"
            className="flex-1 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 font-mono text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          />
          <button onClick={handleLookup} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            Lookup
          </button>
          <button onClick={() => { setLookupIp(''); fetchIp(); }} className="rounded-lg border border-surface-200 px-4 py-2 text-sm text-surface-600 hover:bg-surface-50">
            My IP
          </button>
        </div>
      </div>
    </div>
  );
}
