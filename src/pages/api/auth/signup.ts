import type { APIRoute } from 'astro';
import { hashPassword, generateToken, validateEmail, validatePassword } from '../../../lib/auth';
import { getUserByEmail, createUser } from '../../../lib/db';
import { sendEmail } from '../../../lib/resend';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return json({ error: 'Email and password are required' }, 400);
    }

    if (!validateEmail(email)) {
      return json({ error: 'Invalid email address' }, 400);
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return json({ error: passwordCheck.error }, 400);
    }

    const env = locals.runtime.env;

    // Check if user already exists
    const existing = await getUserByEmail(env.DB, email.toLowerCase());
    if (existing) {
      return json({ error: 'An account with this email already exists' }, 409);
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const verifyToken = generateToken();
    const userId = await createUser(env.DB, email, passwordHash, verifyToken);

    // Send verification email
    const verifyUrl = `${new URL(request.url).origin}/verify-email?token=${verifyToken}`;
    await sendEmail({
      to: email.toLowerCase(),
      subject: 'Verify your UtilityDocker account',
      html: `
        <h1>Welcome to UtilityDocker!</h1>
        <p>Click the link below to verify your email address:</p>
        <p><a href="${verifyUrl}" style="background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Verify Email</a></p>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create this account, you can safely ignore this email.</p>
      `,
    });

    return json({ ok: true, message: 'Account created. Check your email to verify.' });
  } catch (error) {
    console.error('[signup]', error);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
};

function json(data: Record<string, unknown>, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
