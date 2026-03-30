import type { APIRoute } from 'astro';

export const prerender = false;

// Step 1: Redirect user to Google's OAuth consent screen
export const GET: APIRoute = async ({ redirect }) => {
  const clientId = import.meta.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return new Response('Google login not configured', { status: 500 });
  }

  const redirectUri = 'https://utilitydocker.com/api/auth/google/callback';
  const scope = 'openid email profile';
  const state = crypto.randomUUID();

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', scope);
  url.searchParams.set('state', state);
  url.searchParams.set('access_type', 'online');
  url.searchParams.set('prompt', 'select_account');

  return redirect(url.toString());
};
