import { useState, useEffect } from 'react';

const STORAGE_KEY = 'fts_cookie_consent';

type ConsentStatus = 'pending' | 'accepted' | 'rejected';

export default function CookieConsent() {
  const [status, setStatus] = useState<ConsentStatus>('accepted'); // default to hide

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setStatus('pending');
    } else {
      setStatus(stored as ConsentStatus);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setStatus('accepted');
  };

  const reject = () => {
    localStorage.setItem(STORAGE_KEY, 'rejected');
    setStatus('rejected');
    // Disable analytics cookies
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
      });
    }
  };

  if (status !== 'pending') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-surface-200 bg-white p-4 shadow-lg sm:p-6">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <p className="text-sm text-surface-700">
            We use cookies for analytics and to improve your experience. Your tool data is never collected — all processing happens in your browser.{' '}
            <a href="/privacy" className="text-primary-600 underline hover:text-primary-700">
              Privacy Policy
            </a>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={reject}
            className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-50"
          >
            Reject
          </button>
          <button
            onClick={accept}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
