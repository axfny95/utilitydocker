import { useState } from 'react';

interface ImageFile {
  name: string;
  url: string;
  width: number;
  height: number;
}

export default function JpgToPdfConverter() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [pageSize, setPageSize] = useState<'fit' | 'a4' | 'letter'>('a4');
  const [margin, setMargin] = useState(20);

  const addImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const loaded = await Promise.all(files.map((file) => new Promise<ImageFile>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ name: file.name, url: img.src, width: img.naturalWidth, height: img.naturalHeight });
      img.src = URL.createObjectURL(file);
    })));
    setImages((prev) => [...prev, ...loaded]);
  };

  const removeImage = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const moveImage = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const copy = [...images];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setImages(copy);
  };

  const convert = async () => {
    if (images.length === 0) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdf = await PDFDocument.create();

      const pageSizes = { a4: [595.28, 841.89], letter: [612, 792], fit: [0, 0] };

      for (const img of images) {
        const response = await fetch(img.url);
        const bytes = new Uint8Array(await response.arrayBuffer());

        let embedded;
        if (img.name.toLowerCase().endsWith('.png')) {
          embedded = await pdf.embedPng(bytes);
        } else {
          embedded = await pdf.embedJpg(bytes);
        }

        let pageWidth: number, pageHeight: number;
        if (pageSize === 'fit') {
          pageWidth = embedded.width + margin * 2;
          pageHeight = embedded.height + margin * 2;
        } else {
          [pageWidth, pageHeight] = pageSizes[pageSize];
        }

        const page = pdf.addPage([pageWidth, pageHeight]);
        const availW = pageWidth - margin * 2;
        const availH = pageHeight - margin * 2;
        const scale = Math.min(availW / embedded.width, availH / embedded.height, 1);
        const drawW = embedded.width * scale;
        const drawH = embedded.height * scale;

        page.drawImage(embedded, {
          x: margin + (availW - drawW) / 2,
          y: margin + (availH - drawH) / 2,
          width: drawW,
          height: drawH,
        });
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'images.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PDF conversion failed:', e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addImages} className="block w-full text-sm text-surface-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100" />

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {images.map((img, i) => (
            <div key={i} className="group relative rounded-lg border border-surface-200 overflow-hidden">
              <img src={img.url} alt={img.name} className="h-24 w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button onClick={() => moveImage(i, -1)} className="rounded bg-white/80 p-1 text-xs">&lt;</button>
                <button onClick={() => removeImage(i)} className="rounded bg-red-500 p-1 text-xs text-white">x</button>
                <button onClick={() => moveImage(i, 1)} className="rounded bg-white/80 p-1 text-xs">&gt;</button>
              </div>
              <div className="bg-surface-50 px-1 py-0.5 text-center text-[10px] text-surface-500 truncate">{i + 1}. {img.name}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Page Size</label>
          <select value={pageSize} onChange={(e) => setPageSize(e.target.value as any)} className="rounded-lg border border-surface-200 px-3 py-2 text-sm">
            <option value="a4">A4</option>
            <option value="letter">US Letter</option>
            <option value="fit">Fit to Image</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Margin (pt)</label>
          <input type="number" min={0} max={100} value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-20 rounded-lg border border-surface-200 px-3 py-2 text-sm" />
        </div>
        <button onClick={convert} disabled={images.length === 0 || processing} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
          {processing ? 'Converting...' : `Convert ${images.length} Image${images.length !== 1 ? 's' : ''} to PDF`}
        </button>
      </div>
    </div>
  );
}
