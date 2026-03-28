import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

interface FormData {
  companyName: string;
  websiteUrl: string;
  email: string;
  country: string;
  collectsEmail: boolean;
  collectsName: boolean;
  collectsAnalytics: boolean;
  collectsCookies: boolean;
  collectsPayment: boolean;
  usesGoogleAnalytics: boolean;
  usesStripe: boolean;
  usesCloudflare: boolean;
  hasNewsletter: boolean;
}

const DEFAULT: FormData = {
  companyName: '',
  websiteUrl: '',
  email: '',
  country: 'US',
  collectsEmail: true,
  collectsName: true,
  collectsAnalytics: true,
  collectsCookies: true,
  collectsPayment: false,
  usesGoogleAnalytics: true,
  usesStripe: false,
  usesCloudflare: true,
  hasNewsletter: false,
};

function generatePolicy(data: FormData): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const dataTypes: string[] = [];
  if (data.collectsEmail) dataTypes.push('email addresses');
  if (data.collectsName) dataTypes.push('names');
  if (data.collectsAnalytics) dataTypes.push('usage analytics and IP addresses');
  if (data.collectsCookies) dataTypes.push('cookie data');
  if (data.collectsPayment) dataTypes.push('payment information');

  const services: string[] = [];
  if (data.usesGoogleAnalytics) services.push('Google Analytics (usage analytics)');
  if (data.usesStripe) services.push('Stripe (payment processing)');
  if (data.usesCloudflare) services.push('Cloudflare (hosting and CDN)');

  return `# Privacy Policy

**Last updated:** ${date}

## Introduction

${data.companyName || '[Company Name]'} ("we", "us", or "our") operates ${data.websiteUrl || '[Website URL]'} (the "Service"). This Privacy Policy explains how we collect, use, and protect your information when you use our Service.

## Information We Collect

We collect the following types of information:

${dataTypes.map((t) => `- ${t}`).join('\n')}

## How We Use Your Information

We use the information we collect to:

- Provide, operate, and maintain our Service
- Improve, personalize, and expand our Service
- Communicate with you, including for customer service and updates
- Process transactions (if applicable)
- Monitor and analyze usage and trends

${
  services.length > 0
    ? `## Third-Party Services

We use the following third-party services:

${services.map((s) => `- ${s}`).join('\n')}

These services may collect information used to identify you. Please refer to the privacy policies of these third-party services for more details.`
    : ''
}

${
  data.collectsCookies
    ? `## Cookies

We use cookies and similar tracking technologies to track activity on our Service. Cookies are small data files stored on your device. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, some features of our Service may not function properly without cookies.`
    : ''
}

${
  data.hasNewsletter
    ? `## Newsletter

If you subscribe to our newsletter, we will use your email address to send you updates. You can unsubscribe at any time by clicking the unsubscribe link in any email we send.`
    : ''
}

## Data Security

We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.

## Data Retention

We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.

${
  data.country === 'US'
    ? `## Your Rights (CCPA)

If you are a California resident, you have the right to:

- Know what personal data we collect about you
- Request deletion of your personal data
- Opt out of the sale of personal data (we do not sell personal data)
- Non-discrimination for exercising your rights`
    : `## Your Rights (GDPR)

If you are a resident of the European Economic Area (EEA), you have the following data protection rights:

- Right to access your personal data
- Right to rectification of inaccurate data
- Right to erasure ("right to be forgotten")
- Right to restrict processing
- Right to data portability
- Right to object to processing

To exercise these rights, please contact us at the email below.`
}

## Children's Privacy

Our Service does not address anyone under the age of 13. We do not knowingly collect personal data from children under 13.

## Changes to This Privacy Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.

## Contact Us

If you have any questions about this Privacy Policy, please contact us at **${data.email || '[email address]'}**.

---

*This privacy policy was generated using FreeToolStack's Privacy Policy Generator. This document is provided as a template and should be reviewed by a legal professional before use. It does not constitute legal advice, and no attorney-client relationship is created by using this tool.*`;
}

export default function PrivacyPolicyGenerator() {
  const [form, setForm] = useState<FormData>(DEFAULT);
  const [output, setOutput] = useState('');
  const [step, setStep] = useState(1);

  const update = (key: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const generate = () => {
    setOutput(generatePolicy(form));
    setStep(3);
  };

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step >= s ? 'bg-primary-600 text-white' : 'bg-surface-200 text-surface-500'
              }`}
            >
              {s}
            </div>
            {s < 3 && <div className={`h-0.5 w-8 ${step > s ? 'bg-primary-600' : 'bg-surface-200'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-surface-900">Basic Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">Company / Website Name</label>
              <input type="text" value={form.companyName} onChange={(e) => update('companyName', e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" placeholder="Acme Inc." />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">Website URL</label>
              <input type="url" value={form.websiteUrl} onChange={(e) => update('websiteUrl', e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" placeholder="https://example.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">Contact Email</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" placeholder="privacy@example.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">Primary Jurisdiction</label>
              <select value={form.country} onChange={(e) => update('country', e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm">
                <option value="US">United States (CCPA)</option>
                <option value="EU">European Union (GDPR)</option>
              </select>
            </div>
          </div>
          <button onClick={() => setStep(2)} className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700">
            Next: Data Collection
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-surface-900">Data Collection & Services</h3>
          <div className="space-y-3">
            <p className="text-sm font-medium text-surface-700">What data do you collect?</p>
            {[
              { key: 'collectsEmail', label: 'Email addresses' },
              { key: 'collectsName', label: 'Names' },
              { key: 'collectsAnalytics', label: 'Usage analytics & IP addresses' },
              { key: 'collectsCookies', label: 'Cookies' },
              { key: 'collectsPayment', label: 'Payment information' },
              { key: 'hasNewsletter', label: 'Newsletter subscriptions' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2">
                <input type="checkbox" checked={form[key as keyof FormData] as boolean} onChange={(e) => update(key as keyof FormData, e.target.checked)} className="rounded border-surface-300" />
                <span className="text-sm text-surface-700">{label}</span>
              </label>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-surface-700">Third-party services used?</p>
            {[
              { key: 'usesGoogleAnalytics', label: 'Google Analytics' },
              { key: 'usesStripe', label: 'Stripe (payments)' },
              { key: 'usesCloudflare', label: 'Cloudflare (hosting/CDN)' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2">
                <input type="checkbox" checked={form[key as keyof FormData] as boolean} onChange={(e) => update(key as keyof FormData, e.target.checked)} className="rounded border-surface-300" />
                <span className="text-sm text-surface-700">{label}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="rounded-lg border border-surface-200 px-6 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50">
              Back
            </button>
            <button onClick={generate} className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700">
              Generate Privacy Policy
            </button>
          </div>
        </div>
      )}

      {step === 3 && output && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-surface-900">Your Privacy Policy</h3>
            <div className="flex gap-2">
              <CopyButton text={output} label="Copy Markdown" />
              <button onClick={() => { setStep(1); setOutput(''); }} className="rounded-lg border border-surface-200 px-3 py-1.5 text-sm font-medium text-surface-700 hover:bg-surface-50">
                Start Over
              </button>
            </div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <strong>Disclaimer:</strong> This is a template generated for informational purposes only. It does not constitute legal advice. No attorney-client relationship is created. Please consult a licensed attorney before using this document.
          </div>
          <pre className="max-h-96 overflow-auto rounded-lg border border-surface-200 bg-surface-50 p-4 text-sm">{output}</pre>
        </div>
      )}
    </div>
  );
}
