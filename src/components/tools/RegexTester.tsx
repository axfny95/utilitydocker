import { useState, useMemo } from 'react';
import CopyButton from '../shared/CopyButton';

interface Match {
  text: string;
  index: number;
  groups: string[];
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('The quick brown fox jumps over the lazy dog.\nThe Quick Brown Fox Jumps Over The Lazy Dog.');
  const [error, setError] = useState<string | null>(null);

  const { matches, highlighted } = useMemo(() => {
    if (!pattern.trim()) return { matches: [] as Match[], highlighted: testString };
    try {
      const regex = new RegExp(pattern, flags);
      setError(null);

      const found: Match[] = [];
      let match: RegExpExecArray | null;

      if (flags.includes('g')) {
        while ((match = regex.exec(testString)) !== null) {
          found.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          if (match[0].length === 0) regex.lastIndex++;
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          found.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      // Build highlighted string
      let hl = '';
      let lastEnd = 0;
      for (const m of found) {
        hl += escapeHtml(testString.slice(lastEnd, m.index));
        hl += `<mark class="bg-yellow-200 rounded px-0.5">${escapeHtml(m.text)}</mark>`;
        lastEnd = m.index + m.text.length;
      }
      hl += escapeHtml(testString.slice(lastEnd));

      return { matches: found, highlighted: hl };
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid regex');
      return { matches: [] as Match[], highlighted: testString };
    }
  }, [pattern, flags, testString]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-surface-700">Pattern</label>
          <div className="flex items-center rounded-lg border border-surface-200 bg-surface-50">
            <span className="pl-3 text-surface-400">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="flex-1 bg-transparent px-1 py-2 font-mono text-sm focus:outline-none"
              placeholder="[A-Z]\w+"
              spellCheck={false}
            />
            <span className="text-surface-400">/</span>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              className="w-12 bg-transparent px-1 py-2 font-mono text-sm focus:outline-none"
              placeholder="g"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-surface-700">Test String</label>
        <textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          className="h-32 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          spellCheck={false}
        />
      </div>

      {pattern && !error && (
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">
            Highlighted Matches ({matches.length} found)
          </label>
          <div
            className="rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </div>
      )}

      {matches.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Match Details</label>
          <div className="max-h-48 overflow-auto rounded-lg border border-surface-200">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-surface-500">#</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-surface-500">Match</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-surface-500">Index</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-surface-500">Groups</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {matches.map((m, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-surface-500">{i + 1}</td>
                    <td className="px-3 py-2 font-mono">{m.text}</td>
                    <td className="px-3 py-2">{m.index}</td>
                    <td className="px-3 py-2 font-mono text-xs">{m.groups.length ? m.groups.join(', ') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-surface-500">
        <span className="rounded bg-surface-100 px-2 py-1">g = global</span>
        <span className="rounded bg-surface-100 px-2 py-1">i = case-insensitive</span>
        <span className="rounded bg-surface-100 px-2 py-1">m = multiline</span>
        <span className="rounded bg-surface-100 px-2 py-1">s = dotAll</span>
        <span className="rounded bg-surface-100 px-2 py-1">u = unicode</span>
      </div>
    </div>
  );
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
