import { type ReactNode } from 'react';
import { isPremiumUser } from '../../lib/premium';

interface Props {
  feature: string;
  toolSlug: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function PremiumGate({ feature, toolSlug, children, fallback }: Props) {
  if (isPremiumUser()) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred content preview */}
      <div className="pointer-events-none select-none blur-sm" aria-hidden="true">
        {fallback || (
          <div className="h-32 rounded-lg bg-surface-100" />
        )}
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-xl border border-primary-200 bg-white/95 p-6 text-center shadow-lg backdrop-blur-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-surface-900">Premium Feature</h3>
          <p className="mt-1 text-sm text-surface-600">
            {feature} is available with FreeToolStack Premium.
          </p>
          <a
            href="/pricing"
            className="mt-4 inline-block rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            Upgrade for $5/mo
          </a>
        </div>
      </div>
    </div>
  );
}
