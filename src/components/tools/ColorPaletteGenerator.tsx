import { useState, useCallback } from 'react';
import CopyButton from '../shared/CopyButton';

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function generatePalette(baseHue: number, scheme: string): string[] {
  const hues: number[] = [];
  switch (scheme) {
    case 'analogous':
      hues.push(baseHue, (baseHue + 30) % 360, (baseHue + 60) % 360, (baseHue - 30 + 360) % 360, (baseHue - 60 + 360) % 360);
      break;
    case 'complementary':
      hues.push(baseHue, baseHue, (baseHue + 180) % 360, (baseHue + 180) % 360, baseHue);
      return hues.map((h, i) => hslToHex(h, 70, [35, 50, 45, 60, 75][i]));
    case 'triadic':
      hues.push(baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360, baseHue, (baseHue + 120) % 360);
      break;
    case 'split-complementary':
      hues.push(baseHue, (baseHue + 150) % 360, (baseHue + 210) % 360, baseHue, (baseHue + 180) % 360);
      break;
    case 'monochromatic':
    default:
      return [25, 35, 50, 65, 80].map((l) => hslToHex(baseHue, 70, l));
  }
  return hues.map((h) => hslToHex(h, 70, 50));
}

export default function ColorPaletteGenerator() {
  const [baseHue, setBaseHue] = useState(220);
  const [scheme, setScheme] = useState('monochromatic');
  const [palette, setPalette] = useState(() => generatePalette(220, 'monochromatic'));

  const regenerate = useCallback(() => {
    setPalette(generatePalette(baseHue, scheme));
  }, [baseHue, scheme]);

  const randomize = () => {
    const hue = Math.floor(Math.random() * 360);
    setBaseHue(hue);
    setPalette(generatePalette(hue, scheme));
  };

  const handleHueChange = (hue: number) => {
    setBaseHue(hue);
    setPalette(generatePalette(hue, scheme));
  };

  const handleSchemeChange = (s: string) => {
    setScheme(s);
    setPalette(generatePalette(baseHue, s));
  };

  const cssExport = palette.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n');
  const tailwindExport = palette.map((c, i) => `  '${(i + 1) * 100}': '${c}',`).join('\n');

  return (
    <div className="space-y-6">
      {/* Palette display */}
      <div className="flex overflow-hidden rounded-xl">
        {palette.map((color, i) => {
          const rgb = hexToRgb(color);
          const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
          return (
            <div
              key={i}
              className="flex flex-1 flex-col items-center justify-end p-4"
              style={{ backgroundColor: color, minHeight: '160px' }}
            >
              <span className={`font-mono text-sm font-medium ${luminance > 0.5 ? 'text-black/70' : 'text-white/90'}`}>
                {color.toUpperCase()}
              </span>
              <CopyButton text={color} label="" className={`mt-2 border-0 bg-transparent ${luminance > 0.5 ? 'text-black/50' : 'text-white/70'}`} />
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Base Hue: {baseHue}</label>
          <input
            type="range"
            min={0}
            max={359}
            value={baseHue}
            onChange={(e) => handleHueChange(Number(e.target.value))}
            className="w-full"
            style={{ background: `linear-gradient(to right, hsl(0,70%,50%), hsl(60,70%,50%), hsl(120,70%,50%), hsl(180,70%,50%), hsl(240,70%,50%), hsl(300,70%,50%), hsl(360,70%,50%))` }}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Color Scheme</label>
          <select
            value={scheme}
            onChange={(e) => handleSchemeChange(e.target.value)}
            className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm"
          >
            <option value="monochromatic">Monochromatic</option>
            <option value="analogous">Analogous</option>
            <option value="complementary">Complementary</option>
            <option value="triadic">Triadic</option>
            <option value="split-complementary">Split Complementary</option>
          </select>
        </div>
      </div>

      <button onClick={randomize} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
        Random Palette
      </button>

      {/* Export */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-surface-700">CSS Variables</label>
            <CopyButton text={`:root {\n${cssExport}\n}`} />
          </div>
          <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-xs">{`:root {\n${cssExport}\n}`}</pre>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-surface-700">Tailwind Config</label>
            <CopyButton text={`colors: {\n${tailwindExport}\n}`} />
          </div>
          <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-xs">{`colors: {\n${tailwindExport}\n}`}</pre>
        </div>
      </div>
    </div>
  );
}
