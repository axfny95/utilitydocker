import { useState } from 'react';

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

interface Thumbnail {
  label: string;
  url: string;
  resolution: string;
}

function getThumbnails(videoId: string): Thumbnail[] {
  return [
    { label: 'Max Resolution', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, resolution: '1280x720' },
    { label: 'Standard', url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, resolution: '640x480' },
    { label: 'High Quality', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, resolution: '480x360' },
    { label: 'Medium Quality', url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, resolution: '320x180' },
    { label: 'Default', url: `https://img.youtube.com/vi/${videoId}/default.jpg`, resolution: '120x90' },
  ];
}

export default function YoutubeThumbnailDownloader() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookup = () => {
    setError(null);
    const id = extractVideoId(url.trim());
    if (!id) {
      setError('Invalid YouTube URL. Paste a full video URL like https://youtube.com/watch?v=...');
      setVideoId(null);
      return;
    }
    setVideoId(id);
  };

  const thumbnails = videoId ? getThumbnails(videoId) : [];

  const downloadThumbnail = async (thumb: Thumbnail) => {
    try {
      const response = await fetch(thumb.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `youtube-thumbnail-${videoId}-${thumb.resolution}.jpg`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Direct download fallback
      window.open(thumb.url, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-surface-700">YouTube Video URL</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookup()}
            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            className="flex-1 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button onClick={lookup} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700">
            Get Thumbnails
          </button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {thumbnails.length > 0 && (
        <div className="space-y-4">
          {/* Main preview */}
          <div className="overflow-hidden rounded-lg border border-surface-200">
            <img
              src={thumbnails[0].url}
              alt="YouTube thumbnail"
              className="w-full"
              onError={(e) => { (e.target as HTMLImageElement).src = thumbnails[2].url; }}
            />
          </div>

          {/* All sizes */}
          <div className="grid gap-3 sm:grid-cols-2">
            {thumbnails.map((thumb) => (
              <div key={thumb.label} className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-surface-900">{thumb.label}</p>
                  <p className="text-xs text-surface-500">{thumb.resolution}</p>
                </div>
                <button
                  onClick={() => downloadThumbnail(thumb)}
                  className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm font-medium text-surface-700 hover:bg-surface-50"
                >
                  Download
                </button>
              </div>
            ))}
          </div>

          <p className="text-xs text-surface-400">
            Thumbnails are sourced from YouTube's public image CDN. Not all resolutions may be available for every video.
          </p>
        </div>
      )}
    </div>
  );
}
