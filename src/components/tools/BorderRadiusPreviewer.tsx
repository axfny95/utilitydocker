import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

export default function BorderRadiusPreviewer() {
  const [tl, setTl] = useState(16);
  const [tr, setTr] = useState(16);
  const [br, setBr] = useState(16);
  const [bl, setBl] = useState(16);
  const [linked, setLinked] = useState(true);
  const [size, setSize] = useState(200);
  const [bgColor, setBgColor] = useState('#3b82f6');

  const setAll = (value: number) => {
    setTl(value); setTr(value); setBr(value); setBl(value);
  };

  const handleChange = (corner: string, value: number) => {
    if (linked) { setAll(value); return; }
    switch (corner) {
      case 'tl': setTl(value); break;
      case 'tr': setTr(value); break;
      case 'br': setBr(value); break;
      case 'bl': setBl(value); break;
    }
  };

  const css = tl === tr && tr === br && br === bl
    ? `border-radius: ${tl}px;`
    : `border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`;

  const tailwind = tl === tr && tr === br && br === bl
    ? `rounded-[${tl}px]`
    : `rounded-tl-[${tl}px] rounded-tr-[${tr}px] rounded-br-[${br}px] rounded-bl-[${bl}px]`;

  const presets = [
    { label: 'None', v: [0, 0, 0, 0] },
    { label: 'Small', v: [4, 4, 4, 4] },
    { label: 'Medium', v: [8, 8, 8, 8] },
    { label: 'Large', v: [16, 16, 16, 16] },
    { label: 'XL', v: [24, 24, 24, 24] },
    { label: 'Full', v: [9999, 9999, 9999, 9999] },
    { label: 'Blob', v: [30, 70, 70, 30] },
    { label: 'Ticket', v: [16, 16, 0, 0] },
    { label: 'Drop', v: [50, 50, 50, 0] },
  ];

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex items-center justify-center rounded-xl border border-surface-200 bg-surface-50 p-12">
        <div
          style={{ width: size, height: size, backgroundColor: bgColor, borderRadius: `${tl}px ${tr}px ${br}px ${bl}px` }}
          className="transition-all duration-200"
        />
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-surface-700">Corners</span>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={linked} onChange={(e) => setLinked(e.target.checked)} className="rounded border-surface-300" />
            Link all corners
          </label>
        </div>

        {linked ? (
          <div>
            <label className="text-xs text-surface-600">All corners: {tl}px</label>
            <input type="range" min={0} max={200} value={tl} onChange={(e) => setAll(Number(e.target.value))} className="w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-surface-600">Top Left: {tl}px</label><input type="range" min={0} max={200} value={tl} onChange={(e) => handleChange('tl', Number(e.target.value))} className="w-full" /></div>
            <div><label className="text-xs text-surface-600">Top Right: {tr}px</label><input type="range" min={0} max={200} value={tr} onChange={(e) => handleChange('tr', Number(e.target.value))} className="w-full" /></div>
            <div><label className="text-xs text-surface-600">Bottom Left: {bl}px</label><input type="range" min={0} max={200} value={bl} onChange={(e) => handleChange('bl', Number(e.target.value))} className="w-full" /></div>
            <div><label className="text-xs text-surface-600">Bottom Right: {br}px</label><input type="range" min={0} max={200} value={br} onChange={(e) => handleChange('br', Number(e.target.value))} className="w-full" /></div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-surface-600">Box Size: {size}px</label><input type="range" min={50} max={400} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full" /></div>
          <div><label className="text-xs text-surface-600">Color</label><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-full rounded border border-surface-200 cursor-pointer" /></div>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button key={p.label} onClick={() => { setTl(p.v[0]); setTr(p.v[1]); setBr(p.v[2]); setBl(p.v[3]); }} className="rounded-lg border border-surface-200 px-3 py-1 text-xs text-surface-600 hover:bg-surface-50">{p.label}</button>
        ))}
      </div>

      {/* Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 px-4 py-2">
          <code className="font-mono text-sm">{css}</code>
          <CopyButton text={css} />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 px-4 py-2">
          <code className="font-mono text-sm">{tailwind}</code>
          <CopyButton text={tailwind} />
        </div>
      </div>
    </div>
  );
}
