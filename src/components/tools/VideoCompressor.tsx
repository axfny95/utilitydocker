import { useState, useRef } from 'react';

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function VideoCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'processing' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [quality, setQuality] = useState('28');
  const [resolution, setResolution] = useState('720');
  const ffmpegRef = useRef<any>(null);

  const loadFfmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    setStatus('loading');
    setProgress('Loading video processor...');
    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const { toBlobURL } = await import('@ffmpeg/util');
    const ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  };

  const compress = async () => {
    if (!file) return;
    const allowedQualities = ['23', '28', '33'];
    const safeQuality = allowedQualities.includes(quality) ? quality : '28';
    const allowedResolutions = ['1080', '720', '480', '360'];
    const safeResolution = allowedResolutions.includes(resolution) ? resolution : '720';
    try {
      const ffmpeg = await loadFfmpeg();
      setStatus('processing');
      setProgress('Reading video...');

      const { fetchFile } = await import('@ffmpeg/util');
      await ffmpeg.writeFile('input', await fetchFile(file));

      setProgress('Compressing (this may take a while)...');
      await ffmpeg.exec([
        '-i', 'input',
        '-vf', `scale=-2:${safeResolution}`,
        '-crf', safeQuality,
        '-preset', 'fast',
        '-movflags', '+faststart',
        'output.mp4',
      ]);

      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data], { type: 'video/mp4' });
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
      setStatus('done');
    } catch (e) {
      setStatus('error');
      setProgress(e instanceof Error ? e.message : 'Compression failed. Try a smaller file.');
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = file ? `compressed-${file.name}` : 'compressed.mp4';
    a.click();
  };

  const savings = file && resultSize ? Math.round((1 - resultSize / file.size) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Compresses video files in your browser using ffmpeg.wasm. Best for files under 100MB. Nothing is uploaded to any server.
      </div>

      <input type="file" accept="video/*" onChange={(e) => { setFile(e.target.files?.[0] || null); setResultUrl(null); setStatus('idle'); }} className="block w-full text-sm text-surface-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100" />

      {file && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 px-4 py-3 text-sm">
          <strong>{file.name}</strong> — {formatSize(file.size)}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Quality (CRF: lower = better)</label>
          <select value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm">
            <option value="23">High (CRF 23, larger file)</option>
            <option value="28">Medium (CRF 28, balanced)</option>
            <option value="33">Low (CRF 33, smallest file)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Max Resolution</label>
          <select value={resolution} onChange={(e) => setResolution(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm">
            <option value="1080">1080p</option>
            <option value="720">720p</option>
            <option value="480">480p</option>
            <option value="360">360p</option>
          </select>
        </div>
      </div>

      <button onClick={compress} disabled={!file || status === 'loading' || status === 'processing'} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
        {status === 'loading' ? 'Loading...' : status === 'processing' ? 'Compressing...' : 'Compress Video'}
      </button>

      {(status === 'loading' || status === 'processing') && (
        <div className="rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-700 flex items-center gap-2">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary-600" />{progress}
        </div>
      )}

      {status === 'done' && resultUrl && file && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3">
              <p className="text-lg font-bold">{formatSize(file.size)}</p>
              <p className="text-xs text-surface-500">Original</p>
            </div>
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3">
              <p className="text-lg font-bold text-primary-600">{formatSize(resultSize)}</p>
              <p className="text-xs text-surface-500">Compressed</p>
            </div>
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3">
              <p className={`text-lg font-bold ${savings > 0 ? 'text-green-600' : 'text-red-600'}`}>{savings > 0 ? '-' : '+'}{Math.abs(savings)}%</p>
              <p className="text-xs text-surface-500">Savings</p>
            </div>
          </div>
          <video controls src={resultUrl} className="max-h-64 w-full rounded-lg" />
          <button onClick={download} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700">Download Compressed Video</button>
        </div>
      )}

      {status === 'error' && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{progress}</div>}
    </div>
  );
}
