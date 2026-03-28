import { useState, useRef } from 'react';

export default function VideoToGif() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'processing' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [fps, setFps] = useState('10');
  const [width, setWidth] = useState('480');
  const [startTime, setStartTime] = useState('0');
  const [duration, setDuration] = useState('5');
  const ffmpegRef = useRef<any>(null);

  const loadFfmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    setStatus('loading');
    setProgress('Loading GIF processor...');
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

  const convert = async () => {
    if (!file) return;
    try {
      const ffmpeg = await loadFfmpeg();
      setStatus('processing');
      setProgress('Reading video...');

      const { fetchFile } = await import('@ffmpeg/util');
      await ffmpeg.writeFile('input', await fetchFile(file));

      setProgress('Creating GIF...');
      const args = [
        '-i', 'input',
        '-ss', startTime,
        '-t', duration,
        '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
        '-loop', '0',
        'output.gif',
      ];
      await ffmpeg.exec(args);

      setProgress('Preparing download...');
      const data = await ffmpeg.readFile('output.gif');
      const blob = new Blob([data], { type: 'image/gif' });
      setResultUrl(URL.createObjectURL(blob));
      setStatus('done');
    } catch (e) {
      setStatus('error');
      setProgress(e instanceof Error ? e.message : 'Conversion failed');
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = file ? file.name.replace(/\.[^.]+$/, '.gif') : 'output.gif';
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Converts video to GIF in your browser. Keep clips short (under 10 seconds) for best results. Files never leave your device.
      </div>

      <input type="file" accept="video/*" onChange={(e) => { setFile(e.target.files?.[0] || null); setResultUrl(null); setStatus('idle'); }} className="block w-full text-sm text-surface-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100" />

      {file && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 px-4 py-3 text-sm">
          <strong>{file.name}</strong> — {(file.size / (1024 * 1024)).toFixed(1)} MB
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs text-surface-600">Start Time (sec)</label>
          <input type="number" min={0} value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-surface-600">Duration (sec)</label>
          <input type="number" min={1} max={30} value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-surface-600">FPS</label>
          <select value={fps} onChange={(e) => setFps(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm">
            <option value="5">5 (smaller)</option>
            <option value="10">10 (balanced)</option>
            <option value="15">15 (smooth)</option>
            <option value="24">24 (film)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-surface-600">Width (px)</label>
          <select value={width} onChange={(e) => setWidth(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm">
            <option value="320">320</option>
            <option value="480">480</option>
            <option value="640">640</option>
            <option value="800">800</option>
          </select>
        </div>
      </div>

      <button onClick={convert} disabled={!file || status === 'loading' || status === 'processing'} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
        {status === 'loading' ? 'Loading...' : status === 'processing' ? 'Converting...' : 'Create GIF'}
      </button>

      {(status === 'loading' || status === 'processing') && (
        <div className="rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-700 flex items-center gap-2">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary-600" />{progress}
        </div>
      )}

      {status === 'done' && resultUrl && (
        <div className="space-y-3">
          <img src={resultUrl} alt="Generated GIF" className="max-h-80 rounded-lg border border-surface-200" />
          <button onClick={download} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700">Download GIF</button>
        </div>
      )}

      {status === 'error' && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{progress}</div>}
    </div>
  );
}
