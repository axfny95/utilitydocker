import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ redirect, locals }) => {
  const env = (locals.runtime?.env || {}) as Record<string, string>;
  const clientId = env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return new Response('Google login not configured', { status: 500 });
  }

  const redirectUri = 'https://utilitydocker.com/api/auth/google/callback';

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', crypto.randomUUID());
  url.searchParams.set('access_type', 'online');
  url.searchParams.set('prompt', 'select_account');

  return redirect(url.toString());
};
