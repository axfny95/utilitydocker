import { useState } from 'react';
import FileUploader from '../shared/FileUploader';

type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';

const FORMATS: { id: OutputFormat; label: string; ext: string }[] = [
  { id: 'image/png', label: 'PNG', ext: 'png' },
  { id: 'image/jpeg', label: 'JPEG', ext: 'jpg' },
  { id: 'image/webp', label: 'WebP', ext: 'webp' },
];

export default function ImageFormatConverter() {
  const [sourceFile, setSourceFile] = useState<{ name: string; url: string } | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png');
  const [quality, setQuality] = useState(90);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);

  const handleFile = (file: File) => {
    setSourceFile({ name: file.name, url: URL.createObjectURL(file) });
    setResult(null);
  };

  const convert = () => {
    if (!sourceFile) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // White background for JPEG (no transparency)
      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        setResult({ url: URL.createObjectURL(blob), size: blob.size });
      }, outputFormat, quality / 100);
    };
    img.src = sourceFile.url;
  };

  const download = () => {
    if (!result || !sourceFile) return;
    const fmt = FORMATS.find((f) => f.id === outputFormat)!;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = sourceFile.name.replace(/\.[^.]+$/, `.${fmt.ext}`);
    a.click();
  };

  return (
    <div className="space-y-4">
      {!sourceFile && (
        <FileUploader accept="image/*" maxSize={50 * 1024 * 1024} onFile={(file) => handleFile(file)} label="Drop an image to convert (PNG, JPG, WebP, GIF, BMP)" />
      )}

      {sourceFile && (
        <>
          <div className="flex items-center gap-4 rounded-lg border border-surface-200 bg-surface-50 p-3">
            <img src={sourceFile.url} alt="Source" className="h-20 w-20 rounded object-cover" />
            <div>
              <p className="font-medium text-surface-900">{sourceFile.name}</p>
              <button onClick={() => { setSourceFile(null); setResult(null); }} className="text-sm text-primary-600 hover:underline">Change image</button>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">Convert to</label>
              <div className="flex gap-2">
                {FORMATS.map((f) => (
                  <button key={f.id} onClick={() => setOutputFormat(f.id)} className={`rounded-lg px-4 py-2 text-sm font-medium ${outputFormat === f.id ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {outputFormat !== 'image/png' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-surface-700">Quality: {quality}%</label>
                <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-40" />
              </div>
            )}
            <button onClick={convert} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700">Convert</button>
          </div>

          {result && (
            <div className="space-y-3">
              <div className="rounded-lg border border-surface-200 bg-surface-50 p-2">
                <img src={result.url} alt="Converted" className="mx-auto max-h-64 rounded" />
              </div>
              <p className="text-sm text-surface-500">Output: {(result.size / 1024).toFixed(0)} KB</p>
              <button onClick={download} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700">
                Download {FORMATS.find((f) => f.id === outputFormat)!.label}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
