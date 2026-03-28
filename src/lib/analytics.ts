type ToolEventName =
  | 'tool_used'
  | 'tool_result_copied'
  | 'tool_file_uploaded'
  | 'tool_file_downloaded'
  | 'premium_gate_hit'
  | 'email_captured';

interface ToolEvent {
  event: ToolEventName;
  toolSlug: string;
  metadata?: Record<string, string | number>;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(e: ToolEvent) {
  // 1. Send to our own analytics endpoint (Cloudflare Analytics Engine)
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon('/api/track', JSON.stringify(e));
  }

  // 2. Forward to Google Analytics 4 if loaded
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', e.event, {
      tool_slug: e.toolSlug,
      ...e.metadata,
    });
  }
}

export function trackToolUse(toolSlug: string) {
  trackEvent({ event: 'tool_used', toolSlug });
}

export function trackCopy(toolSlug: string) {
  trackEvent({ event: 'tool_result_copied', toolSlug });
}

export function trackFileUpload(toolSlug: string, fileSize: number) {
  trackEvent({ event: 'tool_file_uploaded', toolSlug, metadata: { file_size: fileSize } });
}

export function trackFileDownload(toolSlug: string, format: string) {
  trackEvent({ event: 'tool_file_downloaded', toolSlug, metadata: { format } });
}

export function trackPremiumGate(toolSlug: string, feature: string) {
  trackEvent({ event: 'premium_gate_hit', toolSlug, metadata: { feature } });
}

export function trackEmailCapture(toolSlug: string) {
  trackEvent({ event: 'email_captured', toolSlug });
}
