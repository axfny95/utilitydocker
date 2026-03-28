import { useState, useEffect, useRef } from 'react';

type Phase = 'work' | 'break' | 'longBreak';

export default function PomodoroTimer() {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(4);

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Phase complete
            if (phase === 'work') {
              const newCompleted = completedSessions + 1;
              setCompletedSessions(newCompleted);
              if (newCompleted % sessionsUntilLongBreak === 0) {
                setPhase('longBreak');
                return longBreakMinutes * 60;
              } else {
                setPhase('break');
                return breakMinutes * 60;
              }
            } else {
              setPhase('work');
              return workMinutes * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, phase, completedSessions, workMinutes, breakMinutes, longBreakMinutes, sessionsUntilLongBreak]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const totalSeconds = phase === 'work' ? workMinutes * 60 : phase === 'break' ? breakMinutes * 60 : longBreakMinutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const reset = () => {
    setIsRunning(false);
    setPhase('work');
    setTimeLeft(workMinutes * 60);
    setCompletedSessions(0);
  };

  const skip = () => {
    setIsRunning(false);
    if (phase === 'work') {
      setCompletedSessions((prev) => prev + 1);
      setPhase('break');
      setTimeLeft(breakMinutes * 60);
    } else {
      setPhase('work');
      setTimeLeft(workMinutes * 60);
    }
  };

  const phaseColors = {
    work: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: 'bg-red-500' },
    break: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', bar: 'bg-green-500' },
    longBreak: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', bar: 'bg-blue-500' },
  };
  const colors = phaseColors[phase];

  return (
    <div className="space-y-6">
      {/* Timer display */}
      <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-8 text-center`}>
        <p className={`text-sm font-medium ${colors.text} uppercase tracking-wide`}>
          {phase === 'work' ? 'Focus Time' : phase === 'break' ? 'Short Break' : 'Long Break'}
        </p>
        <p className={`mt-2 font-mono text-7xl font-bold ${colors.text}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </p>
        <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-white/50">
          <div className={`h-full transition-all ${colors.bar}`} style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <button onClick={() => setIsRunning(!isRunning)} className={`rounded-xl px-8 py-3 text-lg font-medium text-white transition-colors ${isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary-600 hover:bg-primary-700'}`}>
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button onClick={skip} className="rounded-xl border border-surface-200 px-5 py-3 text-sm font-medium text-surface-600 hover:bg-surface-50">Skip</button>
        <button onClick={reset} className="rounded-xl border border-surface-200 px-5 py-3 text-sm font-medium text-surface-600 hover:bg-surface-50">Reset</button>
      </div>

      {/* Session count */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: sessionsUntilLongBreak }).map((_, i) => (
          <div key={i} className={`h-3 w-3 rounded-full ${i < completedSessions % sessionsUntilLongBreak ? 'bg-primary-600' : 'bg-surface-200'}`} />
        ))}
        <span className="ml-2 text-sm text-surface-500">{completedSessions} sessions completed</span>
      </div>

      {/* Settings */}
      <details className="rounded-lg border border-surface-200 bg-surface-50">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-surface-700">Timer Settings</summary>
        <div className="grid grid-cols-2 gap-4 px-4 pb-4 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-surface-600">Work (min)</label>
            <input type="number" min={1} max={120} value={workMinutes} onChange={(e) => { setWorkMinutes(Number(e.target.value)); if (!isRunning && phase === 'work') setTimeLeft(Number(e.target.value) * 60); }} className="w-full rounded-lg border border-surface-200 px-2 py-1 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-surface-600">Break (min)</label>
            <input type="number" min={1} max={60} value={breakMinutes} onChange={(e) => setBreakMinutes(Number(e.target.value))} className="w-full rounded-lg border border-surface-200 px-2 py-1 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-surface-600">Long Break (min)</label>
            <input type="number" min={1} max={60} value={longBreakMinutes} onChange={(e) => setLongBreakMinutes(Number(e.target.value))} className="w-full rounded-lg border border-surface-200 px-2 py-1 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-surface-600">Sessions to Long Break</label>
            <input type="number" min={2} max={10} value={sessionsUntilLongBreak} onChange={(e) => setSessionsUntilLongBreak(Number(e.target.value))} className="w-full rounded-lg border border-surface-200 px-2 py-1 text-sm" />
          </div>
        </div>
      </details>
    </div>
  );
}
