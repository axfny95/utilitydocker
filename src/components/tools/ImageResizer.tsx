import { useState, useRef } from 'react';
import FileUploader from '../shared/FileUploader';
import FileDownloader from '../shared/FileDownloader';

export default function ImageResizer() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [result, setResult] = useState<Blob | null>(null);
  const [format, setFormat] = useState('image/jpeg');
  const [fileName, setFileName] = useState('');

  const handleFile = (file: File) => {
    setFileName(file.name);
    setResult(null);
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = URL.createObjectURL(file);
  };

  const updateWidth = (w: number) => {
    setWidth(w);
    if (lockAspect && originalWidth) setHeight(Math.round((w / originalWidth) * originalHeight));
  };

  const updateHeight = (h: number) => {
    setHeight(h);
    if (lockAspect && originalHeight) setWidth(Math.round((h / originalHeight) * originalWidth));
  };

  const resize = () => {
    if (!image) return;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(image, 0, 0, width, height);
    canvas.toBlob((blob) => { if (blob) setResult(blob); }, format, 0.92);
  };

  const presets = [
    { label: '1920x1080', w: 1920, h: 1080 },
    { label: '1280x720', w: 1280, h: 720 },
    { label: '800x600', w: 800, h: 600 },
    { label: '512x512', w: 512, h: 512 },
    { label: '256x256', w: 256, h: 256 },
    { label: '150x150', w: 150, h: 150 },
  ];

  return (
    <div className="space-y-4">
      {!image && (
        <FileUploader accept="image/*" maxSize={50 * 1024 * 1024} onFile={(file) => handleFile(file)} label="Drop an image here to resize" />
      )}

      {image && (
        <>
          <div className="rounded-lg border border-surface-200 bg-surface-50 px-4 py-3 text-sm">
            <strong>{fileName}</strong> — Original: {originalWidth} x {originalHeight}px
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs text-surface-600">Width (px)</label>
              <input type="number" min={1} max={10000} value={width} onChange={(e) => updateWidth(Number(e.target.value))} className="w-28 rounded-lg border border-surface-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-surface-600">Height (px)</label>
              <input type="number" min={1} max={10000} value={height} onChange={(e) => updateHeight(Number(e.target.value))} className="w-28 rounded-lg border border-surface-200 px-3 py-2 text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={lockAspect} onChange={(e) => setLockAspect(e.target.checked)} className="rounded border-surface-300" />
              Lock aspect ratio
            </label>
            <div>
              <label className="mb-1 block text-xs text-surface-600">Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className="rounded-lg border border-surface-200 px-3 py-2 text-sm">
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button key={p.label} onClick={() => { if (lockAspect) { updateWidth(p.w); } else { setWidth(p.w); setHeight(p.h); } }} className="rounded-lg border border-surface-200 px-3 py-1 text-xs text-surface-600 hover:bg-surface-50">
                {p.label}
              </button>
            ))}
            <button onClick={() => { setWidth(Math.round(originalWidth / 2)); setHeight(Math.round(originalHeight / 2)); }} className="rounded-lg border border-surface-200 px-3 py-1 text-xs text-surface-600 hover:bg-surface-50">
              50%
            </button>
            <button onClick={() => { setWidth(Math.round(originalWidth / 4)); setHeight(Math.round(originalHeight / 4)); }} className="rounded-lg border border-surface-200 px-3 py-1 text-xs text-surface-600 hover:bg-surface-50">
              25%
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={resize} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700">
              Resize to {width} x {height}
            </button>
            {result && <FileDownloader data={result} filename={`resized-${width}x${height}-${fileName}`} />}
            <button onClick={() => { setImage(null); setResult(null); }} className="rounded-lg border border-surface-200 px-4 py-2 text-sm text-surface-600 hover:bg-surface-50">
              New Image
            </button>
          </div>
        </>
      )}
    </div>
  );
}
