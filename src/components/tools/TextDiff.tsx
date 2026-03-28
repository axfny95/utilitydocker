import { useState, useMemo } from 'react';

interface DiffLine {
  type: 'same' | 'added' | 'removed';
  text: string;
  lineNum: { left?: number; right?: number };
}

function computeDiff(textA: string, textB: string): DiffLine[] {
  const linesA = textA.split('\n');
  const linesB = textB.split('\n');
  const result: DiffLine[] = [];

  // Simple LCS-based diff
  const m = linesA.length;
  const n = linesB.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (linesA[i - 1] === linesB[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  let i = m, j = n;
  const temp: DiffLine[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      temp.push({ type: 'same', text: linesA[i - 1], lineNum: { left: i, right: j } });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      temp.push({ type: 'added', text: linesB[j - 1], lineNum: { right: j } });
      j--;
    } else {
      temp.push({ type: 'removed', text: linesA[i - 1], lineNum: { left: i } });
      i--;
    }
  }

  return temp.reverse();
}

export default function TextDiff() {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');

  const diff = useMemo(() => {
    if (!textA && !textB) return [];
    return computeDiff(textA, textB);
  }, [textA, textB]);

  const stats = useMemo(() => ({
    added: diff.filter((d) => d.type === 'added').length,
    removed: diff.filter((d) => d.type === 'removed').length,
    unchanged: diff.filter((d) => d.type === 'same').length,
  }), [diff]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Original Text</label>
          <textarea
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            placeholder="Paste original text here..."
            className="h-48 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            spellCheck={false}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Modified Text</label>
          <textarea
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            placeholder="Paste modified text here..."
            className="h-48 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            spellCheck={false}
          />
        </div>
      </div>

      {diff.length > 0 && (
        <>
          <div className="flex gap-4 text-sm">
            <span className="rounded bg-green-100 px-2 py-1 text-green-700">+{stats.added} added</span>
            <span className="rounded bg-red-100 px-2 py-1 text-red-700">-{stats.removed} removed</span>
            <span className="rounded bg-surface-100 px-2 py-1 text-surface-600">{stats.unchanged} unchanged</span>
          </div>

          <div className="max-h-96 overflow-auto rounded-lg border border-surface-200">
            {diff.map((line, i) => (
              <div
                key={i}
                className={`flex font-mono text-sm ${
                  line.type === 'added' ? 'bg-green-50' : line.type === 'removed' ? 'bg-red-50' : ''
                }`}
              >
                <span className="w-8 shrink-0 select-none border-r border-surface-200 px-1 text-right text-xs text-surface-400 py-0.5">
                  {line.lineNum.left || ''}
                </span>
                <span className="w-8 shrink-0 select-none border-r border-surface-200 px-1 text-right text-xs text-surface-400 py-0.5">
                  {line.lineNum.right || ''}
                </span>
                <span className={`w-5 shrink-0 select-none text-center py-0.5 ${
                  line.type === 'added' ? 'text-green-600' : line.type === 'removed' ? 'text-red-600' : 'text-surface-300'
                }`}>
                  {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                </span>
                <span className="flex-1 whitespace-pre-wrap px-2 py-0.5">{line.text}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
