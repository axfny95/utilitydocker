/**
 * Resend email client for FreeToolStack.
 * Handles newsletter subscriptions and transactional emails.
 * Activated when RESEND_API_KEY is configured in environment variables.
 *
 * Resend free tier: 3,000 emails/month, 100 emails/day.
 */

const RESEND_API_URL = 'https://api.resend.com';

interface ResendConfig {
  apiKey: string;
  audienceId?: string;
  fromEmail: string;
}

function getConfig(): ResendConfig | null {
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) return null;

  return {
    apiKey,
    audienceId: import.meta.env.RESEND_AUDIENCE_ID || '',
    fromEmail: import.meta.env.RESEND_FROM_EMAIL || 'hello@freetoolstack.com',
  };
}

export async function addSubscriber(email: string, source?: string): Promise<{ success: boolean; error?: string }> {
  const config = getConfig();
  if (!config) {
    console.log('[resend] Not configured, skipping subscriber add:', email, source);
    return { success: true };
  }

  if (!config.audienceId) {
    console.log('[resend] No audience ID configured, skipping:', email);
    return { success: true };
  }

  const response = await fetch(`${RESEND_API_URL}/audiences/${config.audienceId}/contacts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      unsubscribed: false,
      ...(source ? { first_name: source } : {}), // Store source in first_name field as metadata
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    return { success: false, error: error.message || 'Failed to subscribe' };
  }

  return { success: true };
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  const config = getConfig();
  if (!config) {
    console.log('[resend] Not configured, skipping email to:', params.to);
    return { success: true };
  }

  const response = await fetch(`${RESEND_API_URL}/emails`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.fromEmail,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    return { success: false, error: error.message || 'Failed to send email' };
  }

  return { success: true };
}

export async function sendWelcomeEmail(email: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Welcome to FreeToolStack!',
    html: `
      <h1>Welcome to FreeToolStack!</h1>
      <p>Thanks for subscribing. We'll send you updates when we launch new free tools.</p>
      <p>In the meantime, check out our <a href="https://freetoolstack.com/tools">full collection of tools</a>.</p>
      <p>— The FreeToolStack Team</p>
      <p style="font-size: 12px; color: #666;">
        <a href="https://freetoolstack.com/unsubscribe?email=${encodeURIComponent(email)}">Unsubscribe</a>
      </p>
    `,
  });
}
