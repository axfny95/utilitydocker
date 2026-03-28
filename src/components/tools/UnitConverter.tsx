import { useState, useMemo } from 'react';

type Category = 'length' | 'weight' | 'temperature' | 'volume' | 'area' | 'speed' | 'data' | 'time';

const UNITS: Record<Category, { name: string; units: { id: string; label: string; toBase: (v: number) => number; fromBase: (v: number) => number }[] }> = {
  length: {
    name: 'Length',
    units: [
      { id: 'mm', label: 'Millimeters', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'cm', label: 'Centimeters', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      { id: 'm', label: 'Meters', toBase: (v) => v, fromBase: (v) => v },
      { id: 'km', label: 'Kilometers', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'in', label: 'Inches', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      { id: 'ft', label: 'Feet', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { id: 'yd', label: 'Yards', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      { id: 'mi', label: 'Miles', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    ],
  },
  weight: {
    name: 'Weight',
    units: [
      { id: 'mg', label: 'Milligrams', toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
      { id: 'g', label: 'Grams', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'kg', label: 'Kilograms', toBase: (v) => v, fromBase: (v) => v },
      { id: 'lb', label: 'Pounds', toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
      { id: 'oz', label: 'Ounces', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
      { id: 't', label: 'Metric Tons', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'st', label: 'Stone', toBase: (v) => v * 6.35029, fromBase: (v) => v / 6.35029 },
    ],
  },
  temperature: {
    name: 'Temperature',
    units: [
      { id: 'c', label: 'Celsius', toBase: (v) => v, fromBase: (v) => v },
      { id: 'f', label: 'Fahrenheit', toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
      { id: 'k', label: 'Kelvin', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  volume: {
    name: 'Volume',
    units: [
      { id: 'ml', label: 'Milliliters', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'l', label: 'Liters', toBase: (v) => v, fromBase: (v) => v },
      { id: 'gal', label: 'Gallons (US)', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
      { id: 'qt', label: 'Quarts (US)', toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
      { id: 'pt', label: 'Pints (US)', toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176 },
      { id: 'cup', label: 'Cups (US)', toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
      { id: 'floz', label: 'Fluid Oz (US)', toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
      { id: 'tbsp', label: 'Tablespoons', toBase: (v) => v * 0.0147868, fromBase: (v) => v / 0.0147868 },
      { id: 'tsp', label: 'Teaspoons', toBase: (v) => v * 0.00492892, fromBase: (v) => v / 0.00492892 },
    ],
  },
  area: {
    name: 'Area',
    units: [
      { id: 'sqm', label: 'Square Meters', toBase: (v) => v, fromBase: (v) => v },
      { id: 'sqkm', label: 'Square Km', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { id: 'sqft', label: 'Square Feet', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
      { id: 'sqmi', label: 'Square Miles', toBase: (v) => v * 2.59e6, fromBase: (v) => v / 2.59e6 },
      { id: 'acre', label: 'Acres', toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
      { id: 'ha', label: 'Hectares', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
    ],
  },
  speed: {
    name: 'Speed',
    units: [
      { id: 'mps', label: 'Meters/sec', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kph', label: 'Km/hour', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      { id: 'mph', label: 'Miles/hour', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      { id: 'knot', label: 'Knots', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
      { id: 'fps', label: 'Feet/sec', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    ],
  },
  data: {
    name: 'Data',
    units: [
      { id: 'b', label: 'Bytes', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kb', label: 'Kilobytes', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
      { id: 'mb', label: 'Megabytes', toBase: (v) => v * 1048576, fromBase: (v) => v / 1048576 },
      { id: 'gb', label: 'Gigabytes', toBase: (v) => v * 1073741824, fromBase: (v) => v / 1073741824 },
      { id: 'tb', label: 'Terabytes', toBase: (v) => v * 1099511627776, fromBase: (v) => v / 1099511627776 },
    ],
  },
  time: {
    name: 'Time',
    units: [
      { id: 'ms', label: 'Milliseconds', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 's', label: 'Seconds', toBase: (v) => v, fromBase: (v) => v },
      { id: 'min', label: 'Minutes', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
      { id: 'hr', label: 'Hours', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      { id: 'day', label: 'Days', toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
      { id: 'wk', label: 'Weeks', toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
      { id: 'yr', label: 'Years', toBase: (v) => v * 31557600, fromBase: (v) => v / 31557600 },
    ],
  },
};

export default function UnitConverter() {
  const [category, setCategory] = useState<Category>('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [value, setValue] = useState('1');

  const cat = UNITS[category];
  const from = cat.units.find((u) => u.id === fromUnit) || cat.units[0];
  const to = cat.units.find((u) => u.id === toUnit) || cat.units[1];

  const result = useMemo(() => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    const base = from.toBase(num);
    const converted = to.fromBase(base);
    return converted % 1 === 0 ? converted.toString() : converted.toPrecision(10).replace(/\.?0+$/, '');
  }, [value, from, to]);

  const handleCategoryChange = (newCat: Category) => {
    setCategory(newCat);
    const units = UNITS[newCat].units;
    setFromUnit(units[0].id);
    setToUnit(units.length > 1 ? units[1].id : units[0].id);
  };

  const swap = () => { setFromUnit(toUnit); setToUnit(fromUnit); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(Object.entries(UNITS) as [Category, typeof UNITS[Category]][]).map(([key, val]) => (
          <button
            key={key}
            onClick={() => handleCategoryChange(key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              category === key ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-600 hover:bg-surface-50'
            }`}
          >
            {val.name}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-surface-700">From</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-lg font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="rounded-lg border border-surface-200 px-3 py-2 text-sm">
              {cat.units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>
        </div>

        <button onClick={swap} className="mb-1 rounded-lg border border-surface-200 p-2 text-surface-500 hover:bg-surface-50">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>

        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-surface-700">To</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={result}
              readOnly
              className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-lg font-mono font-bold text-primary-700"
            />
            <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="rounded-lg border border-surface-200 px-3 py-2 text-sm">
              {cat.units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {result && (
        <div className="rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 text-center text-lg">
          <span className="font-mono">{value} {from.label}</span>
          <span className="mx-2 text-surface-400">=</span>
          <span className="font-mono font-bold text-primary-700">{result} {to.label}</span>
        </div>
      )}

      {/* Quick reference table */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-surface-700">Quick Reference</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {cat.units.filter((u) => u.id !== fromUnit).map((u) => {
            const num = parseFloat(value);
            if (isNaN(num)) return null;
            const base = from.toBase(num);
            const conv = u.fromBase(base);
            const display = conv % 1 === 0 ? conv.toString() : conv.toPrecision(6).replace(/\.?0+$/, '');
            return (
              <div key={u.id} className="rounded-lg border border-surface-100 bg-surface-50 px-3 py-2 text-center">
                <div className="font-mono text-sm font-bold">{display}</div>
                <div className="text-xs text-surface-500">{u.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
