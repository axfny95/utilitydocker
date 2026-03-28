import { useState, useRef, useEffect } from 'react';
import CopyButton from '../shared/CopyButton';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;
  return { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default function ColorPicker() {
  const [hex, setHex] = useState('#3b82f6');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rgb = hexToRgb(hex) || { r: 59, g: 130, b: 246 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const formats = [
    { label: 'HEX', value: hex.toUpperCase() },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: 'RGBA', value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` },
    { label: 'CSS', value: hex },
    { label: 'Tailwind', value: `[${hex}]` },
  ];

  // Complementary and related colors
  const complementary = `hsl(${(hsl.h + 180) % 360}, ${hsl.s}%, ${hsl.l}%)`;
  const shades = [20, 35, 50, 65, 80].map((l) => {
    const s2 = Math.min(hsl.s, 85);
    return `hsl(${hsl.h}, ${s2}%, ${l}%)`;
  });

  // Check if EyeDropper API is available
  const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

  const pickFromScreen = async () => {
    if (!hasEyeDropper) return;
    try {
      // @ts-expect-error - EyeDropper API
      const dropper = new window.EyeDropper();
      const result = await dropper.open();
      setHex(result.sRGBHex);
    } catch {
      // User cancelled
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700">Pick a Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                className="h-16 w-16 cursor-pointer rounded-lg border border-surface-200"
              />
              <input
                type="text"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                className="flex-1 rounded-lg border border-surface-200 px-3 py-2 font-mono text-lg"
                maxLength={7}
              />
              {hasEyeDropper && (
                <button onClick={pickFromScreen} className="rounded-lg border border-surface-200 px-3 py-2 text-sm text-surface-600 hover:bg-surface-50" title="Pick from screen">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* RGB sliders */}
          {(['r', 'g', 'b'] as const).map((channel) => (
            <div key={channel}>
              <label className="mb-1 flex justify-between text-xs text-surface-600">
                <span>{channel.toUpperCase()}</span>
                <span>{rgb[channel]}</span>
              </label>
              <input
                type="range"
                min={0}
                max={255}
                value={rgb[channel]}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  const newRgb = { ...rgb, [channel]: v };
                  setHex(`#${newRgb.r.toString(16).padStart(2, '0')}${newRgb.g.toString(16).padStart(2, '0')}${newRgb.b.toString(16).padStart(2, '0')}`);
                }}
                className="w-full"
                style={{
                  accentColor: channel === 'r' ? 'red' : channel === 'g' ? 'green' : 'blue',
                }}
              />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {/* Preview */}
          <div className="h-32 rounded-xl" style={{ backgroundColor: hex }} />

          {/* Color formats */}
          <div className="space-y-2">
            {formats.map((f) => (
              <div key={f.label} className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 px-3 py-2">
                <span className="text-xs font-medium text-surface-500 w-16">{f.label}</span>
                <code className="flex-1 font-mono text-sm">{f.value}</code>
                <CopyButton text={f.value} label="" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shades */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-surface-700">Shades</h3>
        <div className="flex overflow-hidden rounded-lg">
          {shades.map((shade, i) => (
            <div key={i} className="flex-1 p-3 text-center" style={{ backgroundColor: shade }}>
              <span className="text-xs font-mono" style={{ color: i < 2 ? 'white' : 'black', opacity: 0.7 }}>{shade}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
