import { useState, useRef, useEffect } from 'react';
import FileUploader from '../shared/FileUploader';

export default function ImageCropper() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState('');
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropW, setCropW] = useState(0);
  const [cropH, setCropH] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [preset, setPreset] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const presets = [
    { label: 'Free', w: 0, h: 0 },
    { label: '1:1 Square', w: 1, h: 1 },
    { label: '16:9', w: 16, h: 9 },
    { label: '4:3', w: 4, h: 3 },
    { label: '9:16 Story', w: 9, h: 16 },
    { label: '2:1 Banner', w: 2, h: 1 },
  ];

  const handleFile = (file: File) => {
    setFileName(file.name);
    setResult(null);
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setCropX(0);
      setCropY(0);
      setCropW(img.naturalWidth);
      setCropH(img.naturalHeight);
    };
    img.src = URL.createObjectURL(file);
  };

  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const scale = Math.min(500 / image.naturalWidth, 400 / image.naturalHeight, 1);
    canvas.width = image.naturalWidth * scale;
    canvas.height = image.naturalHeight * scale;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    // Draw crop overlay
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const sx = (cropX / image.naturalWidth) * canvas.width;
    const sy = (cropY / image.naturalHeight) * canvas.height;
    const sw = (cropW / image.naturalWidth) * canvas.width;
    const sh = (cropH / image.naturalHeight) * canvas.height;
    ctx.clearRect(sx, sy, sw, sh);
    ctx.drawImage(image, cropX, cropY, cropW, cropH, sx, sy, sw, sh);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, sw, sh);
  }, [image, cropX, cropY, cropW, cropH]);

  const applyPreset = (ratioW: number, ratioH: number) => {
    if (!image) return;
    if (ratioW === 0) { setCropX(0); setCropY(0); setCropW(image.naturalWidth); setCropH(image.naturalHeight); return; }
    const imgRatio = image.naturalWidth / image.naturalHeight;
    const cropRatio = ratioW / ratioH;
    if (imgRatio > cropRatio) {
      const w = Math.round(image.naturalHeight * cropRatio);
      setCropW(w); setCropH(image.naturalHeight); setCropX(Math.round((image.naturalWidth - w) / 2)); setCropY(0);
    } else {
      const h = Math.round(image.naturalWidth / cropRatio);
      setCropW(image.naturalWidth); setCropH(h); setCropX(0); setCropY(Math.round((image.naturalHeight - h) / 2));
    }
  };

  const crop = () => {
    if (!image) return;
    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    setResult(canvas.toDataURL('image/png'));
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result;
    a.download = `cropped-${fileName}`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {!image && <FileUploader accept="image/*" maxSize={50 * 1024 * 1024} onFile={(file) => handleFile(file)} label="Drop an image to crop" />}

      {image && (
        <>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button key={p.label} onClick={() => { setPreset(p.label); applyPreset(p.w, p.h); }} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${preset === p.label ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-600 hover:bg-surface-50'}`}>
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-surface-600">X: {cropX} | Y: {cropY}</label>
              <input type="range" min={0} max={image.naturalWidth - cropW} value={cropX} onChange={(e) => setCropX(Number(e.target.value))} className="w-full" />
              <input type="range" min={0} max={image.naturalHeight - cropH} value={cropY} onChange={(e) => setCropY(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-surface-600">W: {cropW} | H: {cropH}</label>
              <input type="range" min={10} max={image.naturalWidth} value={cropW} onChange={(e) => setCropW(Number(e.target.value))} className="w-full" />
              <input type="range" min={10} max={image.naturalHeight} value={cropH} onChange={(e) => setCropH(Number(e.target.value))} className="w-full" />
            </div>
          </div>

          <canvas ref={canvasRef} className="mx-auto rounded-lg border border-surface-200" />

          <div className="flex gap-2">
            <button onClick={crop} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700">Crop Image</button>
            <button onClick={() => { setImage(null); setResult(null); }} className="rounded-lg border border-surface-200 px-4 py-2 text-sm text-surface-600 hover:bg-surface-50">New Image</button>
          </div>

          {result && (
            <div className="space-y-3">
              <img src={result} alt="Cropped" className="mx-auto max-h-64 rounded-lg border border-surface-200" />
              <button onClick={download} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700">Download Cropped Image</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
