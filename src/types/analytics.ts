export type ToolEventName =
  | 'tool_used'
  | 'tool_result_copied'
  | 'tool_file_uploaded'
  | 'tool_file_downloaded'
  | 'premium_gate_hit'
  | 'email_captured';

export interface ToolEvent {
  event: ToolEventName;
  toolSlug: string;
  metadata?: Record<string, string | number>;
}

export interface AnalyticsConfig {
  ga4Id?: string;
  enableBeacon: boolean;
  trackingEndpoint: string;
}
