import { useState, useEffect, useRef } from 'react';

const TEXTS = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.",
  "Programming is the art of telling another human what one wants the computer to do. Good code is its own best documentation.",
  "In the beginning there was nothing. Then someone said let there be light. Technology is best when it brings people together.",
  "Every great developer you know got there by solving problems they were unqualified to solve until they actually did it.",
  "The web is more a social creation than a technical one. The ultimate goal is to support and improve our web existence.",
];

export default function TypingSpeedTest() {
  const [status, setStatus] = useState<'ready' | 'typing' | 'done'>('ready');
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const start = () => {
    const t = TEXTS[Math.floor(Math.random() * TEXTS.length)];
    setText(t);
    setInput('');
    setErrorCount(0);
    setTotalKeystrokes(0);
    setStatus('typing');
    setStartTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleInput = (value: string) => {
    if (status !== 'typing') return;

    // Track keystrokes for accuracy (only count forward typing, not backspace)
    if (value.length > input.length) {
      setTotalKeystrokes((prev) => prev + (value.length - input.length));
      // Check if the new characters are wrong
      for (let i = input.length; i < value.length; i++) {
        if (i < text.length && value[i] !== text[i]) {
          setErrorCount((prev) => prev + 1);
        }
      }
    }

    setInput(value);

    // Check completion — user typed enough correct characters
    if (value.length >= text.length) {
      setEndTime(Date.now());
      setStatus('done');
    }
  };

  const elapsed = status === 'done' ? (endTime - startTime) / 1000 : status === 'typing' ? (Date.now() - startTime) / 1000 : 0;
  const correctChars = [...input].filter((c, i) => i < text.length && c === text[i]).length;
  const words = correctChars / 5; // Standard: 5 chars = 1 word
  const wpm = elapsed > 0 ? Math.round((words / elapsed) * 60) : 0;
  const accuracy = totalKeystrokes > 0 ? Math.round(((totalKeystrokes - errorCount) / totalKeystrokes) * 100) : 100;
  const cpm = elapsed > 0 ? Math.round((correctChars / elapsed) * 60) : 0;

  // Live timer
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    if (status !== 'typing') return;
    const interval = setInterval(() => forceUpdate((n) => n + 1), 200);
    return () => clearInterval(interval);
  }, [status]);

  // Render the target text with per-character coloring
  const renderText = () => {
    return [...text].map((char, i) => {
      let className = 'text-surface-300'; // Not yet typed

      if (i < input.length) {
        if (input[i] === char) {
          className = 'text-green-600'; // Correct
        } else {
          className = 'bg-red-100 text-red-600 rounded'; // Wrong — only THIS character is red
        }
      } else if (i === input.length) {
        className = 'bg-primary-100 text-primary-700 border-b-2 border-primary-500'; // Cursor
      }

      return <span key={i} className={className}>{char === ' ' && i < input.length && input[i] !== char ? '·' : char}</span>;
    });
  };

  return (
    <div className="space-y-6">
      {status === 'ready' && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-8 text-center">
          <h3 className="text-xl font-bold text-surface-900">Ready to test your typing speed?</h3>
          <p className="mt-2 text-surface-600">Type the displayed text as quickly and accurately as you can. Wrong characters are highlighted in red — keep typing, don't stop!</p>
          <button onClick={start} className="mt-4 rounded-lg bg-primary-600 px-8 py-3 font-medium text-white hover:bg-primary-700">
            Start Test
          </button>
        </div>
      )}

      {(status === 'typing' || status === 'done') && (
        <>
          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3">
              <p className="text-2xl font-bold text-primary-700">{wpm}</p>
              <p className="text-xs text-surface-500">WPM</p>
            </div>
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3">
              <p className={`text-2xl font-bold ${accuracy >= 95 ? 'text-green-600' : accuracy >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>{accuracy}%</p>
              <p className="text-xs text-surface-500">Accuracy</p>
            </div>
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3">
              <p className="text-2xl font-bold text-surface-900">{cpm}</p>
              <p className="text-xs text-surface-500">CPM</p>
            </div>
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3">
              <p className="text-2xl font-bold text-surface-900">{Math.floor(elapsed)}s</p>
              <p className="text-xs text-surface-500">Time</p>
            </div>
          </div>

          {/* Text to type */}
          <div className="rounded-lg border border-surface-200 bg-white p-4 font-mono text-lg leading-relaxed select-none">
            {renderText()}
          </div>

          {/* Input — use textarea for better long text handling */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            disabled={status === 'done'}
            rows={3}
            className="w-full rounded-lg border border-surface-200 bg-surface-50 px-4 py-3 font-mono text-lg focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
            placeholder={status === 'typing' ? 'Start typing here...' : ''}
            autoComplete="off"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />

          {status === 'typing' && (
            <p className="text-center text-xs text-surface-400">
              Errors: {errorCount} | Keystrokes: {totalKeystrokes} | Keep typing even if you make mistakes!
            </p>
          )}

          {status === 'done' && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
              <p className="text-2xl font-bold text-green-700">Test Complete!</p>
              <p className="mt-2 text-surface-600">{wpm} WPM with {accuracy}% accuracy ({errorCount} errors in {totalKeystrokes} keystrokes)</p>
              <button onClick={start} className="mt-4 rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700">Try Again</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
