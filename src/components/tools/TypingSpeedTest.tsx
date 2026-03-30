import { useState, useEffect, useRef } from 'react';

const TEXTS = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump. The five boxing wizards jump quickly.",
  "Programming is the art of telling another human what one wants the computer to do. Good code is its own best documentation. First solve the problem then write the code.",
  "In the beginning there was nothing. Then someone said let there be light, and there was still nothing but now you could see it. Technology is best when it brings people together.",
  "Every great developer you know got there by solving problems they were unqualified to solve until they actually did it. The best error message is the one that never shows up.",
  "The web is more a social creation than a technical one. I designed it for a social effect to help people work together and not as a technical toy. The ultimate goal is to support and improve our web existence.",
];

export default function TypingSpeedTest() {
  const [status, setStatus] = useState<'ready' | 'typing' | 'done'>('ready');
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [errors, setErrors] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const start = () => {
    const t = TEXTS[Math.floor(Math.random() * TEXTS.length)];
    setText(t);
    setInput('');
    setErrors(0);
    setStatus('typing');
    setStartTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleInput = (value: string) => {
    if (status !== 'typing') return;
    setInput(value);

    // Count errors
    let errs = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== text[i]) errs++;
    }
    setErrors(errs);

    // Check completion
    if (value.length >= text.length) {
      setEndTime(Date.now());
      setStatus('done');
    }
  };

  const elapsed = status === 'done' ? (endTime - startTime) / 1000 : status === 'typing' ? (Date.now() - startTime) / 1000 : 0;
  const words = input.trim().split(/\s+/).filter(Boolean).length;
  const wpm = elapsed > 0 ? Math.round((words / elapsed) * 60) : 0;
  const accuracy = input.length > 0 ? Math.round(((input.length - errors) / input.length) * 100) : 100;
  const cpm = elapsed > 0 ? Math.round((input.length / elapsed) * 60) : 0;

  // Live timer
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    if (status !== 'typing') return;
    const interval = setInterval(() => forceUpdate((n) => n + 1), 200);
    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className="space-y-6">
      {status === 'ready' && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-8 text-center">
          <h3 className="text-xl font-bold text-surface-900">Ready to test your typing speed?</h3>
          <p className="mt-2 text-surface-600">Type the displayed text as quickly and accurately as you can.</p>
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
          <div className="rounded-lg border border-surface-200 bg-white p-4 font-mono text-lg leading-relaxed">
            {[...text].map((char, i) => {
              let className = 'text-surface-300';
              if (i < input.length) {
                className = input[i] === char ? 'text-green-600' : 'bg-red-100 text-red-600';
              } else if (i === input.length) {
                className = 'bg-primary-100 text-primary-700 border-b-2 border-primary-500';
              }
              return <span key={i} className={className}>{char}</span>;
            })}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            disabled={status === 'done'}
            className="w-full rounded-lg border border-surface-200 bg-surface-50 px-4 py-3 font-mono text-lg focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder={status === 'typing' ? 'Start typing...' : ''}
            autoComplete="off"
            spellCheck={false}
          />

          {status === 'done' && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
              <p className="text-2xl font-bold text-green-700">Test Complete!</p>
              <p className="mt-2 text-surface-600">{wpm} WPM with {accuracy}% accuracy in {Math.floor(elapsed)} seconds</p>
              <button onClick={start} className="mt-4 rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700">Try Again</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
