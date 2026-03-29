import { useState } from 'react';
import FileUploader from '../shared/FileUploader';
import CopyButton from '../shared/CopyButton';

export default function ImageToText() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'processing' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('eng');
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setText('');
    setError('');
    setStatus('loading');
    setProgress(0);

    try {
      setStatus('processing');
      const Tesseract = await import('tesseract.js');
      const { data } = await Tesseract.recognize(file, language, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100));
        },
      });
      setText(data.text.trim());
      setStatus('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'OCR processing failed');
      setStatus('error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        OCR runs in your browser via Tesseract.js. First use downloads a ~15MB language model. Your images never leave your device.
      </div>

      <div className="flex items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-lg border border-surface-200 px-3 py-2 text-sm">
            <option value="eng">English</option>
            <option value="spa">Spanish</option>
            <option value="fra">French</option>
            <option value="deu">German</option>
            <option value="ita">Italian</option>
            <option value="por">Portuguese</option>
            <option value="jpn">Japanese</option>
            <option value="chi_sim">Chinese (Simplified)</option>
            <option value="kor">Korean</option>
            <option value="ara">Arabic</option>
          </select>
        </div>
      </div>

      {status === 'idle' && (
        <FileUploader accept="image/*" maxSize={20 * 1024 * 1024} onFile={(file) => handleFile(file)} label="Drop a screenshot or photo to extract text" />
      )}

      {(status === 'loading' || status === 'processing') && (
        <div className="rounded-lg border border-primary-100 bg-primary-50 p-6 text-center">
          <div className="mx-auto mb-3 h-2 max-w-xs overflow-hidden rounded-full bg-primary-200">
            <div className="h-full bg-primary-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-primary-700">{status === 'loading' ? 'Loading OCR engine...' : `Recognizing text... ${progress}%`}</p>
        </div>
      )}

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {status === 'done' && (
        <div className="grid gap-4 lg:grid-cols-2">
          {preview && (
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-2">
              <img src={preview} alt="Source" className="mx-auto max-h-64 rounded" />
            </div>
          )}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-surface-700">Extracted Text</label>
              <CopyButton text={text} />
            </div>
            <textarea value={text} readOnly className="h-64 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm" />
            <p className="mt-1 text-xs text-surface-400">{text.split(/\s+/).filter(Boolean).length} words | {text.length} characters</p>
          </div>
        </div>
      )}

      {status === 'done' && (
        <button onClick={() => { setStatus('idle'); setPreview(null); setText(''); }} className="rounded-lg border border-surface-200 px-4 py-2 text-sm text-surface-600 hover:bg-surface-50">
          Process Another Image
        </button>
      )}
    </div>
  );
}
