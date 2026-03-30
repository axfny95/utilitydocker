import { useState, useRef } from 'react';
import FileUploader from '../shared/FileUploader';
import FileDownloader from '../shared/FileDownloader';

interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  savings: number;
  blob: Blob;
  previewUrl: string;
}

function compressImage(file: File, quality: number, maxWidth: number): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (maxWidth && width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const isPng = file.type === 'image/png';
      const mimeType = isPng && quality < 100 ? 'image/jpeg' : (isPng ? 'image/png' : 'image/jpeg');
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error('Compression failed'));
            return;
          }
          const previewUrl = URL.createObjectURL(blob);
          resolve({
            originalSize: file.size,
            compressedSize: blob.size,
            savings: Math.round((1 - blob.size / file.size) * 100),
            blob,
            previewUrl,
          });
        },
        mimeType,
        quality / 100
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function ImageCompressor() {
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(0);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setProcessing(true);
    setFileName(file.name);
    setOriginalPreview(URL.createObjectURL(file));

    try {
      const compressed = await compressImage(file, quality, maxWidth || Infinity);
      setResult(compressed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Compression failed');
    } finally {
      setProcessing(false);
    }
  };

  const recompress = async () => {
    if (!originalPreview) return;
    // Re-fetch the original file from the preview URL won't work
    // Instead, prompt user to re-upload
    setError('Please re-upload the image to apply new settings.');
  };

  return (
    <div className="space-y-6">
      {!result && (
        <FileUploader
          accept="image/jpeg,image/png,image/webp"
          maxSize={50 * 1024 * 1024}
          onFile={(file) => handleFile(file)}
          label="Drop an image here or click to upload (JPEG, PNG, WebP)"
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">
            Quality: {quality}%
          </label>
          <p className="mb-1 text-xs text-surface-400">Note: For PNG files, adjusting quality below 100% will convert output to JPEG.</p>
          <input
            type="range"
            min={10}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">
            Max Width (0 = original)
          </label>
          <input
            type="number"
            min={0}
            max={10000}
            step={100}
            value={maxWidth}
            onChange={(e) => setMaxWidth(Number(e.target.value))}
            className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm"
            placeholder="No limit"
          />
        </div>
      </div>

      {processing && (
        <div className="text-center text-sm text-surface-500">
          <div className="tool-skeleton mx-auto mb-2 h-32 w-32 rounded-lg" />
          Compressing...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3">
              <p className="text-lg font-bold text-surface-900">{formatSize(result.originalSize)}</p>
              <p className="text-xs text-surface-500">Original</p>
            </div>
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3">
              <p className="text-lg font-bold text-primary-600">{formatSize(result.compressedSize)}</p>
              <p className="text-xs text-surface-500">Compressed</p>
            </div>
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3">
              <p className={`text-lg font-bold ${result.savings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.savings > 0 ? '-' : '+'}{Math.abs(result.savings)}%
              </p>
              <p className="text-xs text-surface-500">Savings</p>
            </div>
          </div>

          {result.previewUrl && (
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-2">
              <img src={result.previewUrl} alt="Compressed preview" className="mx-auto max-h-64 rounded" />
            </div>
          )}

          <div className="flex gap-2">
            <FileDownloader
              data={result.blob}
              filename={`compressed-${fileName}`}
              label="Download Compressed Image"
            />
            <button
              onClick={() => { setResult(null); setOriginalPreview(null); }}
              className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50"
            >
              Compress Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
