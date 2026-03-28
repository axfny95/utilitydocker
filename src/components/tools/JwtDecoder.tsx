import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT: must have 3 parts separated by dots');

  const decodeBase64Url = (str: string): string => {
    const padded = str.replace(/-/g, '+').replace(/_/g, '/');
    return atob(padded);
  };

  const header = JSON.parse(decodeBase64Url(parts[0]));
  const payload = JSON.parse(decodeBase64Url(parts[1]));
  const signature = parts[2];

  return { header, payload, signature };
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts * 1000);
  if (isNaN(date.getTime())) return String(ts);
  return `${date.toISOString()} (${date.toLocaleString()})`;
}

export default function JwtDecoder() {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decode = (value: string) => {
    setToken(value);
    if (!value.trim()) { setDecoded(null); setError(null); return; }
    try {
      setDecoded(decodeJwt(value));
      setError(null);
    } catch (e) {
      setDecoded(null);
      setError(e instanceof Error ? e.message : 'Invalid JWT');
    }
  };

  const isExpired = decoded?.payload?.exp ? (decoded.payload.exp as number) * 1000 < Date.now() : null;

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-surface-700">JWT Token</label>
        <textarea
          value={token}
          onChange={(e) => decode(e.target.value)}
          placeholder="Paste your JWT token here (eyJhbGciOi...)..."
          className="h-28 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 break-all"
          spellCheck={false}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {decoded && (
        <div className="space-y-4">
          {isExpired !== null && (
            <div className={`rounded-lg px-4 py-2 text-sm font-medium ${isExpired ? 'border border-red-200 bg-red-50 text-red-700' : 'border border-green-200 bg-green-50 text-green-700'}`}>
              {isExpired ? 'Token is expired' : 'Token is valid (not expired)'}
            </div>
          )}

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-surface-700">Header</label>
              <CopyButton text={JSON.stringify(decoded.header, null, 2)} />
            </div>
            <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm overflow-auto">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-surface-700">Payload</label>
              <CopyButton text={JSON.stringify(decoded.payload, null, 2)} />
            </div>
            <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm overflow-auto">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
            {/* Show interpreted timestamps */}
            {decoded.payload.iat && (
              <p className="mt-1 text-xs text-surface-500">Issued: {formatTimestamp(decoded.payload.iat as number)}</p>
            )}
            {decoded.payload.exp && (
              <p className="text-xs text-surface-500">Expires: {formatTimestamp(decoded.payload.exp as number)}</p>
            )}
            {decoded.payload.nbf && (
              <p className="text-xs text-surface-500">Not Before: {formatTimestamp(decoded.payload.nbf as number)}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700">Signature</label>
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3">
              <code className="font-mono text-xs text-surface-600 break-all">{decoded.signature}</code>
            </div>
            <p className="mt-1 text-xs text-surface-400">Note: Signature verification requires the secret/public key and is not performed client-side.</p>
          </div>
        </div>
      )}
    </div>
  );
}
