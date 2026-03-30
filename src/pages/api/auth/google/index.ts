import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ redirect, locals, request }) => {
  // Try multiple ways to access the env
  const runtime = locals.runtime || {};
  const env = runtime.env || {};
  const clientId = (env as any).GOOGLE_CLIENT_ID;

  if (!clientId) {
    // Debug: show what's available
    const envKeys = Object.keys(env);
    return new Response(
      JSON.stringify({
        error: 'Google login not configured',
        availableEnvKeys: envKeys,
        hasRuntime: !!locals.runtime,
        runtimeKeys: Object.keys(runtime),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
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
