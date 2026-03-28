import { useState, useRef, useEffect } from 'react';

const SIZES = [16, 32, 48, 64, 128, 180, 192, 512];

export default function FaviconGenerator() {
  const [text, setText] = useState('F');
  const [bgColor, setBgColor] = useState('#3b82f6');
  const [textColor, setTextColor] = useState('#ffffff');
  const [borderRadius, setBorderRadius] = useState(20);
  const [fontSize, setFontSize] = useState(70);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 512;
    canvas.width = size;
    canvas.height = size;

    // Background with rounded corners
    const radius = (borderRadius / 100) * (size / 2);
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fillStyle = bgColor;
    ctx.fill();

    // Text
    ctx.fillStyle = textColor;
    ctx.font = `bold ${(fontSize / 100) * size}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.slice(0, 2), size / 2, size / 2 + size * 0.03);
  };

  useEffect(draw, [text, bgColor, textColor, borderRadius, fontSize]);

  const downloadSize = (targetSize: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const offscreen = document.createElement('canvas');
    offscreen.width = targetSize;
    offscreen.height = targetSize;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(canvas, 0, 0, targetSize, targetSize);

    offscreen.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `favicon-${targetSize}x${targetSize}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const downloadIco = () => {
    // Download 32x32 as PNG (true .ico generation requires complex binary format)
    downloadSize(32);
  };

  const downloadAll = () => {
    SIZES.forEach((size) => {
      setTimeout(() => downloadSize(size), size * 2); // stagger downloads
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700">Letter(s) (1-2 chars)</label>
            <input type="text" maxLength={2} value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-lg font-bold" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">Background</label>
              <div className="flex items-center gap-2">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 w-10 cursor-pointer rounded border border-surface-200" />
                <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 rounded-lg border border-surface-200 px-2 py-1 font-mono text-sm" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">Text Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-10 w-10 cursor-pointer rounded border border-surface-200" />
                <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="flex-1 rounded-lg border border-surface-200 px-2 py-1 font-mono text-sm" />
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700">Corner Radius: {borderRadius}%</label>
            <input type="range" min={0} max={50} value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700">Font Size: {fontSize}%</label>
            <input type="range" min={30} max={100} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          <canvas ref={canvasRef} className="h-32 w-32 rounded-lg border border-surface-200 shadow-sm" />
          <div className="flex flex-wrap items-center gap-2">
            {[16, 32, 64].map((s) => (
              <div key={s} className="flex flex-col items-center">
                <canvas ref={(el) => {
                  if (el && canvasRef.current) {
                    const ctx = el.getContext('2d');
                    if (ctx) { el.width = s; el.height = s; ctx.drawImage(canvasRef.current, 0, 0, s, s); }
                  }
                }} className="border border-surface-200" style={{ width: s, height: s }} />
                <span className="text-xs text-surface-400">{s}px</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-surface-700">Download Sizes</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button key={size} onClick={() => downloadSize(size)} className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs text-surface-600 hover:bg-surface-50">
              {size}x{size}
            </button>
          ))}
          <button onClick={downloadAll} className="rounded-lg bg-primary-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-primary-700">
            Download All Sizes
          </button>
        </div>
      </div>
    </div>
  );
}
