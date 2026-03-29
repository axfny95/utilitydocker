import { useState, useRef, useEffect } from 'react';

export default function Stopwatch() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      const start = Date.now() - time;
      intervalRef.current = setInterval(() => setTime(Date.now() - start), 10);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const format = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
  };

  const start = () => setRunning(true);
  const stop = () => setRunning(false);
  const reset = () => { setRunning(false); setTime(0); setLaps([]); };
  const lap = () => setLaps([...laps, time]);

  const bestLap = laps.length > 1 ? Math.min(...laps.map((l, i) => i === 0 ? l : l - laps[i - 1])) : null;
  const worstLap = laps.length > 1 ? Math.max(...laps.map((l, i) => i === 0 ? l : l - laps[i - 1])) : null;

  return (
    <div className="space-y-6">
      {/* Display */}
      <div className="rounded-2xl border border-surface-200 bg-surface-50 p-8 text-center">
        <p className="font-mono text-7xl font-bold text-surface-900 tabular-nums">{format(time)}</p>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {!running ? (
          <button onClick={start} className="rounded-xl bg-green-600 px-8 py-3 text-lg font-medium text-white hover:bg-green-700">
            {time > 0 ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button onClick={stop} className="rounded-xl bg-red-600 px-8 py-3 text-lg font-medium text-white hover:bg-red-700">
            Stop
          </button>
        )}
        {running && (
          <button onClick={lap} className="rounded-xl border border-surface-300 px-6 py-3 text-lg font-medium text-surface-700 hover:bg-surface-50">
            Lap
          </button>
        )}
        {!running && time > 0 && (
          <button onClick={reset} className="rounded-xl border border-surface-300 px-6 py-3 text-lg font-medium text-surface-700 hover:bg-surface-50">
            Reset
          </button>
        )}
      </div>

      {/* Laps */}
      {laps.length > 0 && (
        <div className="max-h-64 overflow-auto rounded-lg border border-surface-200">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-surface-500">Lap</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-surface-500">Split</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-surface-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {[...laps].reverse().map((lapTime, idx) => {
                const i = laps.length - 1 - idx;
                const split = i === 0 ? lapTime : lapTime - laps[i - 1];
                const isBest = laps.length > 1 && split === bestLap;
                const isWorst = laps.length > 1 && split === worstLap;
                return (
                  <tr key={i} className={isBest ? 'bg-green-50' : isWorst ? 'bg-red-50' : ''}>
                    <td className="px-4 py-2 font-medium">Lap {i + 1}</td>
                    <td className={`px-4 py-2 text-right font-mono ${isBest ? 'text-green-600 font-bold' : isWorst ? 'text-red-600' : ''}`}>{format(split)}</td>
                    <td className="px-4 py-2 text-right font-mono text-surface-500">{format(lapTime)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
