import { useState, useMemo } from 'react';

type UnitSystem = 'metric' | 'imperial';

export default function BmiCalculator() {
  const [system, setSystem] = useState<UnitSystem>('metric');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');

  const bmi = useMemo(() => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return null;

    let heightM: number;
    if (system === 'metric') {
      const h = parseFloat(height);
      if (isNaN(h) || h <= 0) return null;
      heightM = h / 100;
    } else {
      const ft = parseFloat(heightFt) || 0;
      const inches = parseFloat(heightIn) || 0;
      const totalInches = ft * 12 + inches;
      if (totalInches <= 0) return null;
      heightM = totalInches * 0.0254;
    }

    const weightKg = system === 'imperial' ? w * 0.453592 : w;
    return weightKg / (heightM * heightM);
  }, [weight, height, heightFt, heightIn, system]);

  const category = bmi !== null ? (
    bmi < 18.5 ? { label: 'Underweight', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' } :
    bmi < 25 ? { label: 'Normal', color: 'text-green-600', bg: 'bg-green-50 border-green-200' } :
    bmi < 30 ? { label: 'Overweight', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' } :
    { label: 'Obese', color: 'text-red-600', bg: 'bg-red-50 border-red-200' }
  ) : null;

  const ranges = [
    { label: 'Underweight', range: '< 18.5', color: 'bg-blue-200' },
    { label: 'Normal', range: '18.5 - 24.9', color: 'bg-green-400' },
    { label: 'Overweight', range: '25 - 29.9', color: 'bg-yellow-400' },
    { label: 'Obese', range: '30+', color: 'bg-red-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button onClick={() => setSystem('metric')} className={`rounded-lg px-4 py-2 text-sm font-medium ${system === 'metric' ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}>Metric (kg/cm)</button>
        <button onClick={() => setSystem('imperial')} className={`rounded-lg px-4 py-2 text-sm font-medium ${system === 'imperial' ? 'bg-primary-600 text-white' : 'border border-surface-200 text-surface-700 hover:bg-surface-50'}`}>Imperial (lb/ft)</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Weight ({system === 'metric' ? 'kg' : 'lbs'})</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={system === 'metric' ? '70' : '154'} className="w-full rounded-lg border border-surface-200 px-3 py-3 text-lg font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
        </div>
        {system === 'metric' ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700">Height (cm)</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" className="w-full rounded-lg border border-surface-200 px-3 py-3 text-lg font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">Feet</label>
              <input type="number" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} placeholder="5" className="w-full rounded-lg border border-surface-200 px-3 py-3 text-lg font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">Inches</label>
              <input type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} placeholder="9" className="w-full rounded-lg border border-surface-200 px-3 py-3 text-lg font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
          </div>
        )}
      </div>

      {bmi !== null && category && (
        <div className={`rounded-xl border p-6 text-center ${category.bg}`}>
          <p className="text-sm text-surface-600">Your BMI</p>
          <p className={`text-5xl font-bold ${category.color}`}>{bmi.toFixed(1)}</p>
          <p className={`mt-1 text-lg font-medium ${category.color}`}>{category.label}</p>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-medium text-surface-700">BMI Categories</h3>
        <div className="flex overflow-hidden rounded-lg">
          {ranges.map((r) => (
            <div key={r.label} className={`flex-1 p-3 text-center ${r.color}`}>
              <div className="text-xs font-bold text-white">{r.label}</div>
              <div className="text-xs text-white/80">{r.range}</div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-surface-400">BMI is a screening tool, not a diagnostic measure. It does not account for muscle mass, bone density, or overall body composition. Consult a healthcare professional for personalized health assessments.</p>
    </div>
  );
}
