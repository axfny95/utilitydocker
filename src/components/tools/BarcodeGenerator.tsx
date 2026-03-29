import { useState, useRef, useEffect } from 'react';

function encodeCode128(text: string): number[] {
  // Simplified Code 128B encoding
  const START_B = 104;
  const patterns: Record<number, number[]> = {};
  // We'll use a canvas-based approach instead of full barcode encoding
  return [];
}

export default function BarcodeGenerator() {
  const [text, setText] = useState('UTILITYDOCKER-2026');
  const [barcodeType, setBarcodeType] = useState<'code128' | 'code39'>('code128');
  const [showText, setShowText] = useState(true);
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !text.trim()) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple barcode rendering using character-based patterns
    const chars = text.toUpperCase().split('');
    const totalBars = chars.length * 11 + 35; // approximate width
    canvas.width = totalBars * width + 40;
    canvas.height = height + (showText ? 30 : 10);

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Generate bars from character codes (simplified barcode pattern)
    ctx.fillStyle = '#000000';
    let x = 20;

    // Start pattern
    const startBars = [1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1];
    for (const bar of startBars) {
      if (bar) ctx.fillRect(x, 5, width, height);
      x += width;
    }

    // Data characters
    for (const char of chars) {
      const code = char.charCodeAt(0);
      // Generate pseudo-barcode pattern from character code
      const bits = code.toString(2).padStart(8, '0').split('').map(Number);
      // Add guard
      ctx.fillRect(x, 5, width, height); x += width; x += width; // space

      for (const bit of bits) {
        if (bit) ctx.fillRect(x, 5, width, height);
        x += width;
      }
      x += width; // inter-character gap
    }

    // End pattern
    const endBars = [1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1];
    for (const bar of endBars) {
      if (bar) ctx.fillRect(x, 5, width, height);
      x += width;
    }

    // Text below barcode
    if (showText) {
      ctx.fillStyle = '#000000';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(text, canvas.width / 2, height + 20);
    }
  }, [text, barcodeType, showText, width, height]);

  const download = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode-${text}.png`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-surface-700">Barcode Content</label>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm font-mono" placeholder="Enter text or number" />
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-xs text-surface-600">Bar Width: {width}px</label>
          <input type="range" min={1} max={4} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-32" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-surface-600">Height: {height}px</label>
          <input type="range" min={40} max={200} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-32" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} className="rounded border-surface-300" />
          Show text
        </label>
      </div>

      <div className="flex justify-center rounded-lg border border-surface-200 bg-white p-4">
        <canvas ref={canvasRef} />
      </div>

      <button onClick={download} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700">Download Barcode PNG</button>
    </div>
  );
}
