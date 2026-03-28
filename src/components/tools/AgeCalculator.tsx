import { useState, useMemo } from 'react';

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  const result = useMemo(() => {
    if (!birthDate || !targetDate) return null;
    const birth = new Date(birthDate);
    const target = new Date(targetDate);
    if (isNaN(birth.getTime()) || isNaN(target.getTime())) return null;
    if (target < birth) return null;

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) { months--; days += new Date(target.getFullYear(), target.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }

    const totalDays = Math.floor((target.getTime() - birth.getTime()) / 86400000);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;

    const nextBirthday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= target) nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - target.getTime()) / 86400000);

    const dayOfWeek = birth.toLocaleDateString('en-US', { weekday: 'long' });
    const zodiac = getZodiac(birth.getMonth() + 1, birth.getDate());

    return { years, months, days, totalDays, totalWeeks, totalMonths, totalHours, daysUntilBirthday, dayOfWeek, zodiac };
  }, [birthDate, targetDate]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Date of Birth</label>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-3 text-lg focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Calculate Age On</label>
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-3 text-lg focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
        </div>
      </div>

      {result && (
        <>
          <div className="rounded-xl border border-primary-200 bg-primary-50 p-6 text-center">
            <p className="text-4xl font-bold text-primary-700">
              {result.years} <span className="text-lg font-normal text-surface-600">years</span>{' '}
              {result.months} <span className="text-lg font-normal text-surface-600">months</span>{' '}
              {result.days} <span className="text-lg font-normal text-surface-600">days</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total Years', value: result.years },
              { label: 'Total Months', value: result.totalMonths.toLocaleString() },
              { label: 'Total Weeks', value: result.totalWeeks.toLocaleString() },
              { label: 'Total Days', value: result.totalDays.toLocaleString() },
              { label: 'Total Hours', value: result.totalHours.toLocaleString() },
              { label: 'Next Birthday', value: `${result.daysUntilBirthday} days` },
              { label: 'Born On', value: result.dayOfWeek },
              { label: 'Zodiac Sign', value: result.zodiac },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-center">
                <p className="text-xl font-bold text-surface-900">{item.value}</p>
                <p className="text-xs text-surface-500">{item.label}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function getZodiac(month: number, day: number): string {
  const signs = [
    { sign: 'Capricorn', end: [1, 19] }, { sign: 'Aquarius', end: [2, 18] }, { sign: 'Pisces', end: [3, 20] },
    { sign: 'Aries', end: [4, 19] }, { sign: 'Taurus', end: [5, 20] }, { sign: 'Gemini', end: [6, 20] },
    { sign: 'Cancer', end: [7, 22] }, { sign: 'Leo', end: [8, 22] }, { sign: 'Virgo', end: [9, 22] },
    { sign: 'Libra', end: [10, 22] }, { sign: 'Scorpio', end: [11, 21] }, { sign: 'Sagittarius', end: [12, 21] },
    { sign: 'Capricorn', end: [12, 31] },
  ];
  for (const { sign, end } of signs) {
    if (month < end[0] || (month === end[0] && day <= end[1])) return sign;
  }
  return 'Capricorn';
}
