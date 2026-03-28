import { useState } from 'react';

export default function PdfSplitter() {
  const [file, setFile] = useState<{ name: string; data: ArrayBuffer } | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [splitMode, setSplitMode] = useState<'each' | 'range'>('each');
  const [rangeInput, setRangeInput] = useState('1-3, 4-6');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const data = await f.arrayBuffer();
    setFile({ name: f.name, data });
    setError(null);

    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdf = await PDFDocument.load(data);
      setPageCount(pdf.getPageCount());
    } catch {
      setError('Failed to read PDF');
    }
  };

  const split = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const sourcePdf = await PDFDocument.load(file.data);

      if (splitMode === 'each') {
        for (let i = 0; i < sourcePdf.getPageCount(); i++) {
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(sourcePdf, [i]);
          newPdf.addPage(page);
          const bytes = await newPdf.save();
          downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `page-${i + 1}.pdf`);
        }
      } else {
        const ranges = parseRanges(rangeInput, sourcePdf.getPageCount());
        for (let ri = 0; ri < ranges.length; ri++) {
          const newPdf = await PDFDocument.create();
          const indices = ranges[ri].map((p) => p - 1);
          const pages = await newPdf.copyPages(sourcePdf, indices);
          pages.forEach((p) => newPdf.addPage(p));
          const bytes = await newPdf.save();
          downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `split-${ri + 1}.pdf`);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to split PDF');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="application/pdf"
        onChange={loadFile}
        className="block w-full text-sm text-surface-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
      />

      {file && pageCount > 0 && (
        <>
          <div className="rounded-lg border border-surface-200 bg-surface-50 px-4 py-3 text-sm">
            <strong>{file.name}</strong> — {pageCount} page{pageCount > 1 ? 's' : ''} ({(file.data.byteLength / 1024).toFixed(0)} KB)
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setSplitMode('each')}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${splitMode === 'each' ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}
              >
                Split Each Page
              </button>
              <button
                onClick={() => setSplitMode('range')}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${splitMode === 'range' ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}
              >
                Custom Ranges
              </button>
            </div>

            {splitMode === 'range' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-surface-700">Page Ranges (comma-separated)</label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="1-3, 4-6, 7"
                  className="w-full rounded-lg border border-surface-200 px-3 py-2 font-mono text-sm"
                />
                <p className="mt-1 text-xs text-surface-400">Each range creates a separate PDF. Use "1-3" for ranges, "5" for single pages.</p>
              </div>
            )}
          </div>

          <button
            onClick={split}
            disabled={processing}
            className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {processing ? 'Splitting...' : 'Split PDF'}
          </button>
        </>
      )}

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    </div>
  );
}

function parseRanges(input: string, maxPages: number): number[][] {
  return input.split(',').map((range) => {
    const trimmed = range.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(Number);
      const pages: number[] = [];
      for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) pages.push(i);
      return pages;
    }
    const page = Number(trimmed);
    return page >= 1 && page <= maxPages ? [page] : [];
  }).filter((r) => r.length > 0);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
