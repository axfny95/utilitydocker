import { useState, useMemo } from 'react';

function analyze(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      readingTime: '0 min',
      speakingTime: '0 min',
      topKeywords: [] as { word: string; count: number; density: string }[],
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;

  const readingMinutes = Math.max(1, Math.ceil(words / 200));
  const speakingMinutes = Math.max(1, Math.ceil(words / 130));

  // Keyword density
  const wordList = trimmed.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const freq = new Map<string, number>();
  for (const w of wordList) {
    const clean = w.replace(/[^a-z0-9]/g, '');
    if (clean.length > 3) freq.set(clean, (freq.get(clean) || 0) + 1);
  }
  const topKeywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({
      word,
      count,
      density: ((count / Math.max(words, 1)) * 100).toFixed(1) + '%',
    }));

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    readingTime: `${readingMinutes} min`,
    speakingTime: `${speakingMinutes} min`,
    topKeywords,
  };
}

export default function WordCounter() {
  const [text, setText] = useState('');
  const stats = useMemo(() => analyze(text), [text]);

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing or paste your text here..."
        className="h-64 w-full rounded-lg border border-surface-200 p-4 text-base focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        autoFocus
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Words', value: stats.words },
          { label: 'Characters', value: stats.characters },
          { label: 'No Spaces', value: stats.charactersNoSpaces },
          { label: 'Sentences', value: stats.sentences },
          { label: 'Paragraphs', value: stats.paragraphs },
          { label: 'Reading Time', value: stats.readingTime },
          { label: 'Speaking Time', value: stats.speakingTime },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-center">
            <p className="text-2xl font-bold text-surface-900">{item.value}</p>
            <p className="text-xs text-surface-500">{item.label}</p>
          </div>
        ))}
      </div>

      {stats.topKeywords.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-surface-700">Top Keywords</h3>
          <div className="overflow-hidden rounded-lg border border-surface-200">
            <table className="w-full text-sm">
              <thead className="bg-surface-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-surface-500">Keyword</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-surface-500">Count</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-surface-500">Density</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {stats.topKeywords.map((kw) => (
                  <tr key={kw.word}>
                    <td className="px-3 py-2 font-mono">{kw.word}</td>
                    <td className="px-3 py-2 text-right">{kw.count}</td>
                    <td className="px-3 py-2 text-right">{kw.density}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
