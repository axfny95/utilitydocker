/**
 * Generates a sandboxed HTML page for running AI-generated React components.
 * Uses Babel standalone to transform JSX at runtime.
 * The output runs inside an iframe with sandbox="allow-scripts" (no allow-same-origin).
 */

export function createSandboxHtml(componentCode: string): string {
  // Strip import statements and export default
  const cleanCode = componentCode
    .replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '')
    .replace(/^import\s+\{[^}]*\}\s+from\s+['"].*?['"];?\s*$/gm, '')
    .replace(/export\s+default\s+function\s+/, 'function __Component__')
    .replace(/export\s+default\s+/, 'const __Component__ = ');

  // Escape backticks and ${} in the code for the template literal
  const escapedCode = cleanCode
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://unpkg.com/react@19/umd/react.production.min.js" crossorigin><\/script>
  <script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js" crossorigin><\/script>
  <script src="https://unpkg.com/@babel/standalone@7/babel.min.js" crossorigin><\/script>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 16px; margin: 0; background: white; }
    .error { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 8px; font-size: 14px; white-space: pre-wrap; }
    .loading { text-align: center; padding: 40px; color: #64748b; }
  </style>
</head>
<body>
  <div id="root"><div class="loading">Loading tool preview...</div></div>
  <script type="text/babel" data-type="module">
    const { useState, useEffect, useRef, useMemo, useCallback, createElement } = React;

    try {
      ${cleanCode}

      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(<__Component__ />);

      // Auto-resize iframe
      const observer = new ResizeObserver(() => {
        window.parent.postMessage({ type: 'resize', height: document.body.scrollHeight }, '*');
      });
      observer.observe(document.body);
    } catch (err) {
      document.getElementById('root').innerHTML =
        '<div class="error"><strong>Error rendering tool:</strong><br>' + err.message + '</div>';
    }
  <\/script>
</body>
</html>`;
}
