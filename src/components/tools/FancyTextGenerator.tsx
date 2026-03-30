import { useState } from 'react';

const STYLES: { name: string; map: Record<string, string> | ((c: string) => string) }[] = [
  { name: 'Bold', map: (c) => { const n = c.charCodeAt(0); if (n >= 65 && n <= 90) return String.fromCodePoint(0x1D400 + n - 65); if (n >= 97 && n <= 122) return String.fromCodePoint(0x1D41A + n - 97); if (n >= 48 && n <= 57) return String.fromCodePoint(0x1D7CE + n - 48); return c; } },
  { name: 'Italic', map: (c) => { const n = c.charCodeAt(0); if (n >= 65 && n <= 90) return String.fromCodePoint(0x1D434 + n - 65); if (n >= 97 && n <= 122) return String.fromCodePoint(0x1D44E + n - 97); return c; } },
  { name: 'Bold Italic', map: (c) => { const n = c.charCodeAt(0); if (n >= 65 && n <= 90) return String.fromCodePoint(0x1D468 + n - 65); if (n >= 97 && n <= 122) return String.fromCodePoint(0x1D482 + n - 97); return c; } },
  { name: 'Monospace', map: (c) => { const n = c.charCodeAt(0); if (n >= 65 && n <= 90) return String.fromCodePoint(0x1D670 + n - 65); if (n >= 97 && n <= 122) return String.fromCodePoint(0x1D68A + n - 97); if (n >= 48 && n <= 57) return String.fromCodePoint(0x1D7F6 + n - 48); return c; } },
  { name: 'Script', map: (c) => { const scriptExceptions: Record<string, number> = { B: 0x212C, E: 0x2130, F: 0x2131, H: 0x210B, I: 0x2110, L: 0x2112, M: 0x2133, R: 0x211B }; if (scriptExceptions[c]) return String.fromCodePoint(scriptExceptions[c]); const n = c.charCodeAt(0); if (n >= 65 && n <= 90) return String.fromCodePoint(0x1D49C + n - 65); if (n >= 97 && n <= 122) return String.fromCodePoint(0x1D4B6 + n - 97); return c; } },
  { name: 'Double-Struck', map: (c) => { const n = c.charCodeAt(0); if (n >= 65 && n <= 90) return String.fromCodePoint(0x1D538 + n - 65); if (n >= 97 && n <= 122) return String.fromCodePoint(0x1D552 + n - 97); if (n >= 48 && n <= 57) return String.fromCodePoint(0x1D7D8 + n - 48); return c; } },
  { name: 'Circled', map: (c) => { const n = c.charCodeAt(0); if (n >= 65 && n <= 90) return String.fromCodePoint(0x24B6 + n - 65); if (n >= 97 && n <= 122) return String.fromCodePoint(0x24D0 + n - 97); return c; } },
  { name: 'Fullwidth', map: (c) => { const n = c.charCodeAt(0); if (n >= 33 && n <= 126) return String.fromCodePoint(0xFF01 + n - 33); return c; } },
  { name: 'Upside Down', map: (c) => { const flipMap: Record<string, string> = { a: '\u0250', b: 'q', c: '\u0254', d: 'p', e: '\u01DD', f: '\u025F', g: '\u0183', h: '\u0265', i: '\u0131', j: '\u027E', k: '\u029E', l: 'l', m: '\u026F', n: 'u', o: 'o', p: 'd', q: 'b', r: '\u0279', s: 's', t: '\u0287', u: 'n', v: '\u028C', w: '\u028D', x: 'x', y: '\u028E', z: 'z', A: '\u2200', B: 'B', C: '\u0186', D: 'D', E: '\u018E', F: '\u2132', G: '\u2141', H: 'H', I: 'I', J: '\u017F', K: 'K', L: '\u02E5', M: 'W', N: 'N', O: 'O', P: '\u0500', Q: 'Q', R: 'R', S: 'S', T: '\u2534', U: '\u2229', V: '\u039B', W: 'M', X: 'X', Y: '\u2144', Z: 'Z', '1': '\u0196', '2': '\u1105', '3': '\u0190', '4': '\u3123', '5': '\u03DB', '6': '9', '7': '\u3125', '8': '8', '9': '6', '0': '0', '.': '\u02D9', ',': "'", '?': '\u00BF', '!': '\u00A1', "'": ',', '"': '\u201E', '(': ')', ')': '(' }; return flipMap[c] || c; } },
  { name: 'Strikethrough', map: (c) => c + '\u0336' },
  { name: 'Underline', map: (c) => c + '\u0332' },
];

function applyStyle(text: string, style: typeof STYLES[0]): string {
  const mapped = style.name === 'Upside Down'
    ? [...text].reverse().map((c) => (typeof style.map === 'function' ? style.map(c) : c)).join('')
    : [...text].map((c) => (typeof style.map === 'function' ? style.map(c) : c)).join('');
  return mapped;
}

export default function FancyTextGenerator() {
  const [input, setInput] = useState('Hello World');
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, name: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(name);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-surface-700">Your Text</label>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type something..." className="w-full rounded-lg border border-surface-200 px-3 py-3 text-lg focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
      </div>

      {input && (
        <div className="space-y-2">
          {STYLES.map((style) => {
            const result = applyStyle(input, style);
            return (
              <button key={style.name} onClick={() => copy(result, style.name)} className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:bg-surface-50 ${copied === style.name ? 'border-green-300 bg-green-50' : 'border-surface-200'}`}>
                <div>
                  <span className="text-xs text-surface-500">{style.name}</span>
                  <p className="text-lg">{result}</p>
                </div>
                <span className="text-xs text-surface-400">{copied === style.name ? 'Copied!' : 'Click to copy'}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
