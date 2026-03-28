import { useState, useRef, useEffect } from 'react';
import FileUploader from '../shared/FileUploader';

export default function WatermarkAdder() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState('');
  const [text, setText] = useState('UtilityDocker');
  const [fontSize, setFontSize] = useState(32);
  const [opacity, setOpacity] = useState(30);
  const [color, setColor] = useState('#ffffff');
  const [position, setPosition] = useState<'center' | 'bottom-right' | 'bottom-left' | 'tile'>('center');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = URL.createObjectURL(file);
  };

  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    ctx.drawImage(image, 0, 0);

    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity / 100;

    if (position === 'tile') {
      const metrics = ctx.measureText(text);
      const textW = metrics.width + 60;
      const textH = fontSize + 40;
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 6);
      for (let y = -canvas.height; y < canvas.height * 2; y += textH) {
        for (let x = -canvas.width; x < canvas.width * 2; x += textW) {
          ctx.fillText(text, x, y);
        }
      }
      ctx.restore();
    } else {
      const metrics = ctx.measureText(text);
      let x: number, y: number;
      if (position === 'center') {
        x = (canvas.width - metrics.width) / 2;
        y = canvas.height / 2 + fontSize / 3;
      } else if (position === 'bottom-right') {
        x = canvas.width - metrics.width - 20;
        y = canvas.height - 20;
      } else {
        x = 20;
        y = canvas.height - 20;
      }
      // Shadow for readability
      ctx.globalAlpha = (opacity / 100) * 0.5;
      ctx.fillStyle = '#000000';
      ctx.fillText(text, x + 2, y + 2);
      ctx.globalAlpha = opacity / 100;
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
    }
    ctx.globalAlpha = 1;
  }, [image, text, fontSize, opacity, color, position]);

  const download = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `watermarked-${fileName}`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {!image && <FileUploader accept="image/*" maxSize={50 * 1024 * 1024} onFile={(file) => handleFile(file)} label="Drop an image to add a watermark" />}

      {image && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">Watermark Text</label>
              <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">Position</label>
              <select value={position} onChange={(e) => setPosition(e.target.value as any)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm">
                <option value="center">Center</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="tile">Tile (Repeated)</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">Font Size: {fontSize}px</label>
              <input type="range" min={12} max={120} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">Opacity: {opacity}%</label>
              <input type="range" min={5} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">Color</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-surface-200" />
            </div>
          </div>

          <canvas ref={canvasRef} className="max-h-80 w-full rounded-lg border border-surface-200 object-contain" />

          <div className="flex gap-2">
            <button onClick={download} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700">Download Watermarked Image</button>
            <button onClick={() => { setImage(null); }} className="rounded-lg border border-surface-200 px-4 py-2 text-sm text-surface-600 hover:bg-surface-50">New Image</button>
          </div>
        </>
      )}
    </div>
  );
}
