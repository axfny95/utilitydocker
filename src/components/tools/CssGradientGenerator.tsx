import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

interface ColorStop {
  color: string;
  position: number;
}

export default function CssGradientGenerator() {
  const [type, setType] = useState<'linear' | 'radial'>('linear');
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<ColorStop[]>([
    { color: '#667eea', position: 0 },
    { color: '#764ba2', position: 100 },
  ]);

  const updateStop = (index: number, field: keyof ColorStop, value: string | number) => {
    setStops((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const addStop = () => {
    if (stops.length >= 6) return;
    const position = Math.round((stops[stops.length - 1].position + stops[0].position) / 2);
    setStops([...stops, { color: '#ffffff', position }]);
  };

  const removeStop = (index: number) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((_, i) => i !== index));
  };

  const stopsStr = stops
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(', ');

  const gradient = type === 'linear'
    ? `linear-gradient(${angle}deg, ${stopsStr})`
    : `radial-gradient(circle, ${stopsStr})`;

  const css = `background: ${gradient};`;

  const presets = [
    { name: 'Sunset', stops: [{ color: '#f093fb', position: 0 }, { color: '#f5576c', position: 100 }] },
    { name: 'Ocean', stops: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }] },
    { name: 'Forest', stops: [{ color: '#11998e', position: 0 }, { color: '#38ef7d', position: 100 }] },
    { name: 'Fire', stops: [{ color: '#f12711', position: 0 }, { color: '#f5af19', position: 100 }] },
    { name: 'Night', stops: [{ color: '#0f0c29', position: 0 }, { color: '#302b63', position: 50 }, { color: '#24243e', position: 100 }] },
    { name: 'Candy', stops: [{ color: '#fc5c7d', position: 0 }, { color: '#6a82fb', position: 100 }] },
  ];

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div
        className="flex h-48 items-center justify-center rounded-xl"
        style={{ background: gradient }}
      >
        <span className="rounded-lg bg-black/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
          Live Preview
        </span>
      </div>

      {/* Controls */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as 'linear' | 'radial')} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm">
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
          </select>
        </div>
        {type === 'linear' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700">Angle: {angle}deg</label>
            <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full" />
          </div>
        )}
      </div>

      {/* Color stops */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-surface-700">Color Stops</span>
          <button onClick={addStop} disabled={stops.length >= 6} className="rounded-lg border border-surface-200 px-3 py-1 text-sm text-surface-600 hover:bg-surface-50 disabled:opacity-50">
            + Add Stop
          </button>
        </div>
        {stops.map((stop, i) => (
          <div key={i} className="flex items-center gap-3">
            <input type="color" value={stop.color} onChange={(e) => updateStop(i, 'color', e.target.value)} className="h-10 w-10 cursor-pointer rounded border border-surface-200" />
            <input type="text" value={stop.color} onChange={(e) => updateStop(i, 'color', e.target.value)} className="w-24 rounded-lg border border-surface-200 px-2 py-1 font-mono text-sm" />
            <input type="range" min={0} max={100} value={stop.position} onChange={(e) => updateStop(i, 'position', Number(e.target.value))} className="flex-1" />
            <span className="w-10 text-right text-sm text-surface-500">{stop.position}%</span>
            {stops.length > 2 && (
              <button onClick={() => removeStop(i)} className="text-surface-400 hover:text-red-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Presets */}
      <div>
        <span className="mb-2 block text-sm font-medium text-surface-700">Presets</span>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setStops(preset.stops)}
              className="rounded-lg border border-surface-200 px-3 py-1.5 text-sm text-surface-600 hover:bg-surface-50"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* CSS Output */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-medium text-surface-700">CSS</label>
          <CopyButton text={css} />
        </div>
        <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm">{css}</pre>
      </div>
    </div>
  );
}
