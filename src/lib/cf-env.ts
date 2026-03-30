/**
 * Get Cloudflare Worker environment bindings.
 * Works with Astro v6 + @astrojs/cloudflare adapter.
 */
let _env: any = null;

export async function getCfEnv(locals?: any): Promise<any> {
  if (_env) return _env;

  try {
    const mod = await import('cloudflare:workers');
    _env = mod.env;
    return _env;
  } catch {}

  if (locals?.runtime?.env) {
    _env = locals.runtime.env;
    return _env;
  }

  return {};
}
