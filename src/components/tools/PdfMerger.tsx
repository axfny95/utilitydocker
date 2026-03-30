import { useState } from 'react';
import FileDownloader from '../shared/FileDownloader';

export default function PdfMerger() {
  const [files, setFiles] = useState<{ name: string; data: ArrayBuffer }[]>([]);
  const [merged, setMerged] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const loaded = await Promise.all(
      newFiles.map(async (f) => ({ name: f.name, data: await f.arrayBuffer() }))
    );
    setFiles((prev) => [...prev, ...loaded]);
    setMerged(null);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMerged(null);
  };

  const moveFile = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= files.length) return;
    const copy = [...files];
    [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
    setFiles(copy);
    setMerged(null);
  };

  const merge = async () => {
    if (files.length < 2) { setError('Add at least 2 PDF files'); return; }
    setProcessing(true);
    setError(null);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        let pdf;
        try {
          pdf = await PDFDocument.load(file.data);
        } catch {
          setError(`"${file.name}" is not a valid PDF file.`);
          setProcessing(false);
          return;
        }
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const bytes = await mergedPdf.save();
      setMerged(new Blob([bytes], { type: 'application/pdf' }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to merge PDFs');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={addFiles}
          className="block w-full text-sm text-surface-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
        />
      </div>

      {files.length > 0 && (
        <div className="rounded-lg border border-surface-200">
          {files.map((file, i) => (
            <div key={i} className="flex items-center justify-between border-b border-surface-100 px-4 py-2 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-surface-400">#{i + 1}</span>
                <span className="text-sm text-surface-700">{file.name}</span>
                <span className="text-xs text-surface-400">({(file.data.byteLength / 1024).toFixed(0)} KB)</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => moveFile(i, -1)} disabled={i === 0} className="rounded p-1 text-surface-400 hover:bg-surface-100 disabled:opacity-30">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                </button>
                <button onClick={() => moveFile(i, 1)} disabled={i === files.length - 1} className="rounded p-1 text-surface-400 hover:bg-surface-100 disabled:opacity-30">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <button onClick={() => removeFile(i)} className="rounded p-1 text-surface-400 hover:text-red-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="flex gap-2">
        <button
          onClick={merge}
          disabled={files.length < 2 || processing}
          className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {processing ? 'Merging...' : `Merge ${files.length} PDFs`}
        </button>
        {merged && <FileDownloader data={merged} filename="merged.pdf" label="Download Merged PDF" />}
      </div>
    </div>
  );
}
