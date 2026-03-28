import { useState, useRef } from 'react';

export default function VideoToMp3() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'processing' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [bitrate, setBitrate] = useState('192');
  const ffmpegRef = useRef<any>(null);

  const loadFfmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    setStatus('loading');
    setProgress('Loading audio processor (first time may take a moment)...');
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

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setResultUrl(null); setStatus('idle'); }
  };

  const convert = async () => {
    if (!file) return;
    try {
      const ffmpeg = await loadFfmpeg();
      setStatus('processing');
      setProgress('Reading file...');

      const { fetchFile } = await import('@ffmpeg/util');
      await ffmpeg.writeFile('input', await fetchFile(file));

      setProgress('Extracting audio...');
      await ffmpeg.exec(['-i', 'input', '-vn', '-b:a', `${bitrate}k`, '-f', 'mp3', 'output.mp3']);

      setProgress('Preparing download...');
      const data = await ffmpeg.readFile('output.mp3');
      const blob = new Blob([data], { type: 'audio/mp3' });
      setResultUrl(URL.createObjectURL(blob));
      setStatus('done');
    } catch (e) {
      setStatus('error');
      setProgress(e instanceof Error ? e.message : 'Conversion failed. Try a smaller file or different format.');
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = file ? file.name.replace(/\.[^.]+$/, '.mp3') : 'audio.mp3';
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        This tool extracts audio from video files entirely in your browser. Your files are never uploaded. Large files (100MB+) may be slow depending on your device.
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-surface-700">Select a video file</label>
        <input type="file" accept="video/*,audio/*" onChange={handleFile} className="block w-full text-sm text-surface-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100" />
      </div>

      {file && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 px-4 py-3 text-sm">
          <strong>{file.name}</strong> — {(file.size / (1024 * 1024)).toFixed(1)} MB
        </div>
      )}

      <div className="flex items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Audio Quality</label>
          <select value={bitrate} onChange={(e) => setBitrate(e.target.value)} className="rounded-lg border border-surface-200 px-3 py-2 text-sm">
            <option value="128">128 kbps (smaller file)</option>
            <option value="192">192 kbps (recommended)</option>
            <option value="256">256 kbps (high quality)</option>
            <option value="320">320 kbps (maximum)</option>
          </select>
        </div>
        <button onClick={convert} disabled={!file || status === 'loading' || status === 'processing'} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
          {status === 'loading' ? 'Loading...' : status === 'processing' ? 'Converting...' : 'Extract Audio'}
        </button>
      </div>

      {(status === 'loading' || status === 'processing') && (
        <div className="rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-700">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary-600" />
            {progress}
          </div>
        </div>
      )}

      {status === 'done' && resultUrl && (
        <div className="space-y-3">
          <audio controls src={resultUrl} className="w-full" />
          <button onClick={download} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700">
            Download MP3
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{progress}</div>
      )}
    </div>
  );
}
