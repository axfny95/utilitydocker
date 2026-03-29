import { useState, useRef, useEffect } from 'react';

export default function PlaceholderImageGenerator() {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(400);
  const [bgColor, setBgColor] = useState('#e2e8f0');
  const [textColor, setTextColor] = useState('#64748b');
  const [text, setText] = useState('');
  const [format, setFormat] = useState<'png' | 'svg'>('png');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const displayText = text || `${width} x ${height}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = Math.min(width, 1200);
    canvas.height = Math.min(height, 800);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const fontSize = Math.min(canvas.width / 10, canvas.height / 4, 48);
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayText, canvas.width / 2, canvas.height / 2);
  }, [width, height, bgColor, textColor, displayText]);

  const download = () => {
    if (format === 'svg') {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  <text x="50%" y="50%" font-family="system-ui,sans-serif" font-size="${Math.min(width / 10, height / 4, 48)}" font-weight="bold" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${displayText}</text>
</svg>`;
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `placeholder-${width}x${height}.svg`; a.click();
      URL.revokeObjectURL(url);
    } else {
      const fullCanvas = document.createElement('canvas');
      fullCanvas.width = width; fullCanvas.height = height;
      const ctx = fullCanvas.getContext('2d')!;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
      const fontSize = Math.min(width / 10, height / 4, 48);
      ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
      ctx.fillStyle = textColor; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(displayText, width / 2, height / 2);
      fullCanvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `placeholder-${width}x${height}.png`; a.click();
        URL.revokeObjectURL(url);
      });
    }
  };

  const presets = [
    { label: 'Social Post', w: 1200, h: 630 },
    { label: 'Banner', w: 1920, h: 400 },
    { label: 'Thumbnail', w: 300, h: 200 },
    { label: 'Avatar', w: 200, h: 200 },
    { label: 'HD', w: 1920, h: 1080 },
    { label: 'Mobile', w: 375, h: 812 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-4">
        <div><label className="mb-1 block text-xs text-surface-600">Width (px)</label><input type="number" min={10} max={4000} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" /></div>
        <div><label className="mb-1 block text-xs text-surface-600">Height (px)</label><input type="number" min={10} max={4000} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" /></div>
        <div><label className="mb-1 block text-xs text-surface-600">Background</label><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 w-full rounded border border-surface-200 cursor-pointer" /></div>
        <div><label className="mb-1 block text-xs text-surface-600">Text Color</label><input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-10 w-full rounded border border-surface-200 cursor-pointer" /></div>
      </div>

      <div><label className="mb-1 block text-xs text-surface-600">Custom Text (blank = dimensions)</label><input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder={`${width} x ${height}`} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" /></div>

      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button key={p.label} onClick={() => { setWidth(p.w); setHeight(p.h); }} className="rounded-lg border border-surface-200 px-3 py-1 text-xs text-surface-600 hover:bg-surface-50">{p.label} ({p.w}x{p.h})</button>
        ))}
      </div>

      <canvas ref={canvasRef} className="mx-auto max-w-full rounded-lg border border-surface-200" />

      <div className="flex gap-2">
        <select value={format} onChange={(e) => setFormat(e.target.value as 'png' | 'svg')} className="rounded-lg border border-surface-200 px-3 py-2 text-sm">
          <option value="png">PNG</option>
          <option value="svg">SVG</option>
        </select>
        <button onClick={download} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700">Download {width}x{height}</button>
      </div>
    </div>
  );
}
