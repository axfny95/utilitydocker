import { useState, useEffect } from 'react';

interface Props {
  toolSlug?: string;
}

export default function EmailCapture({ toolSlug }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('fts_email_captured') === 'true') {
      setHidden(true);
    }
  }, []);

  if (hidden) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: toolSlug || 'general' }),
      });

      if (res.ok) {
        setStatus('success');
        setMessage('Thanks for subscribing! Check your email to confirm.');
        localStorage.setItem('fts_email_captured', 'true');
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <svg className="mx-auto h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <p className="mt-2 font-medium text-green-800">{message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary-100 bg-gradient-to-r from-primary-50 to-blue-50 p-6">
      <h3 className="text-lg font-semibold text-surface-900">Get notified about new tools</h3>
      <p className="mt-1 text-sm text-surface-600">
        We launch new free tools every week. No spam, unsubscribe anytime.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="flex-1 rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {status === 'error' && (
        <p className="mt-2 text-sm text-red-600">{message}</p>
      )}
    </div>
  );
}
