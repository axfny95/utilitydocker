import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

interface Shadow {
  x: number; y: number; blur: number; spread: number; color: string; opacity: number; inset: boolean;
}

export default function BoxShadowGenerator() {
  const [shadows, setShadows] = useState<Shadow[]>([{ x: 4, y: 4, blur: 12, spread: 0, color: '#000000', opacity: 15, inset: false }]);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [boxColor, setBoxColor] = useState('#ffffff');
  const [borderRadius, setBorderRadius] = useState(12);

  const update = (index: number, field: keyof Shadow, value: number | string | boolean) => {
    setShadows((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const addShadow = () => setShadows([...shadows, { x: 0, y: 8, blur: 24, spread: -4, color: '#000000', opacity: 10, inset: false }]);
  const removeShadow = (i: number) => shadows.length > 1 && setShadows(shadows.filter((_, idx) => idx !== i));

  const toRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  const css = shadows.map((s) => `${s.inset ? 'inset ' : ''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${toRgba(s.color, s.opacity)}`).join(',\n    ');
  const fullCss = `box-shadow: ${css};`;
  const tailwind = `shadow-[${shadows.map((s) => `${s.inset ? 'inset_' : ''}${s.x}px_${s.y}px_${s.blur}px_${s.spread}px_${toRgba(s.color, s.opacity)}`).join(',')}]`;

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex items-center justify-center rounded-xl p-12" style={{ backgroundColor: bgColor }}>
        <div className="h-40 w-64 rounded-lg flex items-center justify-center text-sm text-surface-500" style={{ backgroundColor: boxColor, borderRadius: `${borderRadius}px`, boxShadow: css }} >
          Preview
        </div>
      </div>

      {/* Shadows */}
      {shadows.map((s, i) => (
        <div key={i} className="rounded-lg border border-surface-200 bg-surface-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-surface-700">Shadow {i + 1}</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={s.inset} onChange={(e) => update(i, 'inset', e.target.checked)} className="rounded border-surface-300" />Inset</label>
              {shadows.length > 1 && <button onClick={() => removeShadow(i)} className="text-xs text-red-500">Remove</button>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div><label className="text-xs text-surface-600">X: {s.x}px</label><input type="range" min={-50} max={50} value={s.x} onChange={(e) => update(i, 'x', Number(e.target.value))} className="w-full" /></div>
            <div><label className="text-xs text-surface-600">Y: {s.y}px</label><input type="range" min={-50} max={50} value={s.y} onChange={(e) => update(i, 'y', Number(e.target.value))} className="w-full" /></div>
            <div><label className="text-xs text-surface-600">Blur: {s.blur}px</label><input type="range" min={0} max={100} value={s.blur} onChange={(e) => update(i, 'blur', Number(e.target.value))} className="w-full" /></div>
            <div><label className="text-xs text-surface-600">Spread: {s.spread}px</label><input type="range" min={-50} max={50} value={s.spread} onChange={(e) => update(i, 'spread', Number(e.target.value))} className="w-full" /></div>
          </div>
          <div className="flex items-center gap-3">
            <input type="color" value={s.color} onChange={(e) => update(i, 'color', e.target.value)} className="h-8 w-8 rounded border border-surface-200 cursor-pointer" />
            <div className="flex-1"><label className="text-xs text-surface-600">Opacity: {s.opacity}%</label><input type="range" min={0} max={100} value={s.opacity} onChange={(e) => update(i, 'opacity', Number(e.target.value))} className="w-full" /></div>
          </div>
        </div>
      ))}

      <button onClick={addShadow} className="rounded-lg border border-surface-200 px-4 py-2 text-sm text-surface-600 hover:bg-surface-50">+ Add Shadow Layer</button>

      <div className="grid gap-4 sm:grid-cols-3">
        <div><label className="mb-1 block text-xs text-surface-600">Background</label><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 w-full rounded border border-surface-200 cursor-pointer" /></div>
        <div><label className="mb-1 block text-xs text-surface-600">Box Color</label><input type="color" value={boxColor} onChange={(e) => setBoxColor(e.target.value)} className="h-10 w-full rounded border border-surface-200 cursor-pointer" /></div>
        <div><label className="mb-1 block text-xs text-surface-600">Border Radius: {borderRadius}px</label><input type="range" min={0} max={50} value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value))} className="w-full" /></div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between"><label className="text-sm font-medium text-surface-700">CSS</label><CopyButton text={fullCss} /></div>
        <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm">{fullCss}</pre>
      </div>
    </div>
  );
}
