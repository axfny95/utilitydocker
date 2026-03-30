import { useState, useRef, useEffect } from 'react';

export default function BarcodeGenerator() {
  const [text, setText] = useState('UTILITYDOCKER-2026');
  const [format, setFormat] = useState('CODE128');
  const [showText, setShowText] = useState(true);
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [barcodeLib, setBarcodeLib] = useState<any>(null);

  // Load JsBarcode library
  useEffect(() => {
    import('jsbarcode').then((mod) => setBarcodeLib(() => mod.default || mod)).catch(() => setError('Barcode library failed to load'));
  }, []);

  useEffect(() => {
    if (!barcodeLib || !svgRef.current || !text.trim()) return;
    setError(null);
    try {
      barcodeLib(svgRef.current, text, {
        format,
        width,
        height,
        displayValue: showText,
        fontSize: 14,
        margin: 10,
        background: '#ffffff',
        lineColor: '#000000',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input for this barcode format');
    }
  }, [barcodeLib, text, format, showText, width, height]);

  const download = () => {
    if (!svgRef.current) return;
    // Convert SVG to PNG via Canvas
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `barcode-${text}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const downloadSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode-${text}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-surface-700">Barcode Content</label>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm font-mono" placeholder="Enter text or number" />
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-xs text-surface-600">Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)} className="rounded-lg border border-surface-200 px-3 py-2 text-sm">
            <option value="CODE128">Code 128 (default)</option>
            <option value="CODE39">Code 39</option>
            <option value="EAN13">EAN-13</option>
            <option value="EAN8">EAN-8</option>
            <option value="UPC">UPC-A</option>
            <option value="ITF14">ITF-14</option>
            <option value="pharmacode">Pharmacode</option>
          </select>
        </div>
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

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="flex justify-center rounded-lg border border-surface-200 bg-white p-4">
        <svg ref={svgRef} />
      </div>

      <div className="flex gap-2">
        <button onClick={download} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700">Download PNG</button>
        <button onClick={downloadSvg} className="rounded-lg border border-surface-200 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50">Download SVG</button>
      </div>

      <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-xs text-surface-500">
        <strong>Formats:</strong> Code 128 accepts any text. Code 39 accepts uppercase + digits. EAN-13 requires 12-13 digits. UPC requires 11-12 digits.
      </div>
    </div>
  );
}
