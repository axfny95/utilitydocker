import { useState } from 'react';

interface Props {
  toolSlug: string;
  initialStarred?: boolean;
  isLoggedIn?: boolean;
}

export default function StarButton({ toolSlug, initialStarred = false, isLoggedIn = false }: Props) {
  const [starred, setStarred] = useState(initialStarred);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!isLoggedIn) {
      window.location.href = `/login?redirect=/tools/${toolSlug}`;
      return;
    }

    setLoading(true);
    try {
      if (starred) {
        await fetch(`/api/favorites/${toolSlug}`, { method: 'DELETE' });
        setStarred(false);
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toolSlug }),
        });
        setStarred(true);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
        starred
          ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
          : 'border-surface-200 text-surface-500 hover:bg-surface-50 hover:text-amber-600'
      }`}
      title={starred ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={`h-4 w-4 ${starred ? 'fill-amber-400 text-amber-400' : 'fill-none text-current'}`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
      {starred ? 'Saved' : 'Save'}
    </button>
  );
}
