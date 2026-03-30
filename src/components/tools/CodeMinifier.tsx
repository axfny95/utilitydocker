import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

type Language = 'html' | 'css' | 'js';

function minifyHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s+>/g, '>')
    .replace(/<\s+/g, '<')
    .trim();
}

function minifyCss(css: string): string {
  let result = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};:,>~+])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/\s*!important/g, '!important')
    .trim();
  // Restore spaces around + and - inside calc() expressions
  result = result.replace(/calc\([^)]+\)/g, match => match.replace(/([+-])/g, ' $1 '));
  return result;
}

function minifyJs(js: string): string {
  // Basic JS minification (removes comments and unnecessary whitespace)
  return js
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};:,=+\-*/<>!&|?()])\s*/g, '$1')
    .replace(/\s*\n\s*/g, '')
    .trim();
}

export default function CodeMinifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState<Language>('html');

  const minify = () => {
    switch (language) {
      case 'html': setOutput(minifyHtml(input)); break;
      case 'css': setOutput(minifyCss(input)); break;
      case 'js': setOutput(minifyJs(input)); break;
    }
  };

  const inputSize = new Blob([input]).size;
  const outputSize = new Blob([output]).size;
  const savings = inputSize > 0 ? Math.round((1 - outputSize / inputSize) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {(['html', 'css', 'js'] as const).map((lang) => (
          <button key={lang} onClick={() => { setLanguage(lang); setOutput(''); }} className={`rounded-lg px-4 py-2 text-sm font-medium uppercase ${language === lang ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}>
            {lang}
          </button>
        ))}
        <button onClick={minify} className="ml-auto rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Minify</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Input ({language.toUpperCase()})</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Paste your ${language.toUpperCase()} code...`} className="h-64 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" spellCheck={false} />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-surface-700">Minified Output</label>
            {output && <CopyButton text={output} />}
          </div>
          <textarea value={output} readOnly className="h-64 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-xs" spellCheck={false} />
        </div>
      </div>

      {output && (
        <div className="flex gap-4 text-sm text-surface-500">
          <span>Input: {inputSize} bytes</span>
          <span>Output: {outputSize} bytes</span>
          <span className={savings > 0 ? 'text-green-600 font-medium' : ''}>{savings > 0 ? `-${savings}% saved` : 'No reduction'}</span>
        </div>
      )}
    </div>
  );
}
