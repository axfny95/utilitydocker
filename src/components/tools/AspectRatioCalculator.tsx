import { useState } from 'react';

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

const PRESETS = [
  { label: '16:9 (YouTube, HDTV)', w: 1920, h: 1080 },
  { label: '4:3 (Classic TV)', w: 1024, h: 768 },
  { label: '1:1 (Square, Instagram)', w: 1080, h: 1080 },
  { label: '9:16 (TikTok, Reels)', w: 1080, h: 1920 },
  { label: '21:9 (Ultrawide)', w: 2560, h: 1080 },
  { label: '3:2 (Photography)', w: 1500, h: 1000 },
  { label: '4:5 (Instagram Portrait)', w: 1080, h: 1350 },
  { label: '2:1 (Twitter Header)', w: 1500, h: 750 },
];

export default function AspectRatioCalculator() {
  const [width, setWidth] = useState('1920');
  const [height, setHeight] = useState('1080');
  const [locked, setLocked] = useState(true);
  const [newWidth, setNewWidth] = useState('');
  const [newHeight, setNewHeight] = useState('');

  const w = parseInt(width) || 0;
  const h = parseInt(height) || 0;
  const g = w && h ? gcd(w, h) : 1;
  const ratioW = w / g;
  const ratioH = h / g;
  const decimal = h ? (w / h).toFixed(4) : '0';

  const calcNewHeight = (nw: string) => {
    setNewWidth(nw);
    if (locked && w && h) {
      const val = parseInt(nw);
      if (!isNaN(val)) setNewHeight(String(Math.round(val * h / w)));
    }
  };

  const calcNewWidth = (nh: string) => {
    setNewHeight(nh);
    if (locked && w && h) {
      const val = parseInt(nh);
      if (!isNaN(val)) setNewWidth(String(Math.round(val * w / h)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Width (px)</label>
          <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-3 text-lg font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Height (px)</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-3 text-lg font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
        </div>
      </div>

      {w > 0 && h > 0 && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-6 text-center">
          <p className="text-sm text-surface-600">Aspect Ratio</p>
          <p className="text-4xl font-bold text-primary-700">{ratioW}:{ratioH}</p>
          <p className="mt-1 text-sm text-surface-500">Decimal: {decimal}</p>
        </div>
      )}

      {/* Visual preview */}
      {w > 0 && h > 0 && (
        <div className="flex justify-center">
          <div
            className="border-2 border-primary-300 bg-primary-100 rounded-lg flex items-center justify-center"
            style={{
              width: `${Math.min(300, 300 * (w / Math.max(w, h)))}px`,
              height: `${Math.min(200, 200 * (h / Math.max(w, h)))}px`,
            }}
          >
            <span className="text-xs text-primary-600">{w} x {h}</span>
          </div>
        </div>
      )}

      {/* Resize calculator */}
      <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-surface-700">Resize with same ratio</h3>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} className="rounded border-surface-300" />
            Lock ratio
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-surface-600">New Width</label>
            <input type="number" value={newWidth} onChange={(e) => calcNewHeight(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 font-mono text-sm" placeholder="Enter width" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-surface-600">New Height</label>
            <input type="number" value={newHeight} onChange={(e) => calcNewWidth(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 font-mono text-sm" placeholder="Enter height" />
          </div>
        </div>
      </div>

      {/* Presets */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-surface-700">Common Aspect Ratios</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {PRESETS.map((p) => (
            <button key={p.label} onClick={() => { setWidth(String(p.w)); setHeight(String(p.h)); }} className="rounded-lg border border-surface-200 px-3 py-2 text-left text-sm text-surface-600 hover:bg-surface-50">
              <span className="font-medium">{p.label}</span>
              <span className="ml-2 text-xs text-surface-400">{p.w}x{p.h}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
