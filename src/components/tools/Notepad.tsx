import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ud_notepad_content';

export default function Notepad() {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Load saved content
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setText(saved);
      setWordCount(saved.trim() ? saved.trim().split(/\s+/).length : 0);
      setCharCount(saved.length);
    }
  }, []);

  // Auto-save every 2 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, text);
      setSaved(true);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [text]);

  const handleChange = (value: string) => {
    setText(value);
    setSaved(false);
    setWordCount(value.trim() ? value.trim().split(/\s+/).length : 0);
    setCharCount(value.length);
  };

  const downloadTxt = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notepad.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    if (text.length > 0 && !confirm('Clear all text?')) return;
    setText('');
    localStorage.removeItem(STORAGE_KEY);
    setSaved(true);
    setWordCount(0);
    setCharCount(0);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-surface-500">
          <span className={`inline-block h-2 w-2 rounded-full ${saved ? 'bg-green-400' : 'bg-amber-400'}`} />
          {saved ? 'Saved' : 'Saving...'}
        </div>
        <div className="flex gap-2">
          <button onClick={downloadTxt} className="rounded-lg border border-surface-200 px-3 py-1.5 text-sm text-surface-600 hover:bg-surface-50">
            Download .txt
          </button>
          <button onClick={clearAll} className="rounded-lg border border-surface-200 px-3 py-1.5 text-sm text-surface-600 hover:bg-surface-50">
            Clear
          </button>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        className="h-96 w-full rounded-lg border border-surface-200 bg-white p-4 text-base leading-relaxed focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        placeholder="Start typing... Your notes are saved automatically to your browser."
        autoFocus
      />

      <div className="flex gap-4 text-xs text-surface-400">
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
        <span>{text === '' ? 0 : text.split('\n').length} {(text === '' ? 0 : text.split('\n').length) === 1 ? 'line' : 'lines'}</span>
        <span className="ml-auto">Auto-saved to browser storage</span>
      </div>
    </div>
  );
}
