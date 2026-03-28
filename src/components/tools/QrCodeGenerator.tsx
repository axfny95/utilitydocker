import { useState, useRef, useEffect } from 'react';
import CopyButton from '../shared/CopyButton';

// Minimal QR code generation using Canvas API
// For production, we'd use the `qrcode` npm package, but this works for MVP
function drawQR(canvas: HTMLCanvasElement, text: string, size: number, fgColor: string, bgColor: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = size;
  canvas.height = size;

  // Clear with background color
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // For a proper QR code, we need a library.
  // This placeholder draws a centered text message.
  // The actual QR library will be loaded lazily.
  ctx.fillStyle = fgColor;
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('QR Preview', size / 2, size / 2);
  ctx.font = '10px monospace';
  ctx.fillText('(install qrcode package)', size / 2, size / 2 + 20);
}

export default function QrCodeGenerator() {
  const [text, setText] = useState('https://freetoolstack.com');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrLib, setQrLib] = useState<any>(null);

  // Dynamically import QR library
  useEffect(() => {
    import('qrcode').then((mod) => setQrLib(mod.default || mod)).catch(() => {
      // Library not available, use placeholder
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !text.trim()) return;

    if (qrLib) {
      qrLib.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
      });
    } else {
      drawQR(canvas, text, size, fgColor, bgColor);
    }
  }, [text, size, fgColor, bgColor, qrLib]);

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrcode.png';
    a.click();
  };

  const downloadSVG = () => {
    if (!qrLib) return;
    qrLib.toString(text, { type: 'svg', width: size, margin: 2, color: { dark: fgColor, light: bgColor } })
      .then((svg: string) => {
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'qrcode.svg';
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700">Content</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter URL or text..."
              className="h-24 w-full rounded-lg border border-surface-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700">Size: {size}px</label>
            <input type="range" min={128} max={512} step={32} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">Foreground</label>
              <div className="flex items-center gap-2">
                <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="h-10 w-10 cursor-pointer rounded border border-surface-200" />
                <input type="text" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 font-mono text-sm" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">Background</label>
              <div className="flex items-center gap-2">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 w-10 cursor-pointer rounded border border-surface-200" />
                <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 font-mono text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <canvas ref={canvasRef} className="rounded-lg border border-surface-200 shadow-sm" />
          <div className="mt-4 flex gap-2">
            <button onClick={downloadPNG} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
              Download PNG
            </button>
            {qrLib && (
              <button onClick={downloadSVG} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50">
                Download SVG
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
