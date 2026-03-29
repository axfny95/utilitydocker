import { useState } from 'react';

interface Course {
  name: string;
  grade: string;
  credits: number;
}

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0,
};

export default function GpaCalculator() {
  const [courses, setCourses] = useState<Course[]>([
    { name: '', grade: 'A', credits: 3 },
    { name: '', grade: 'B+', credits: 3 },
    { name: '', grade: 'A-', credits: 4 },
    { name: '', grade: 'B', credits: 3 },
  ]);

  const addCourse = () => setCourses([...courses, { name: '', grade: 'A', credits: 3 }]);
  const removeCourse = (i: number) => courses.length > 1 && setCourses(courses.filter((_, idx) => idx !== i));
  const updateCourse = (i: number, field: keyof Course, value: string | number) => {
    setCourses(courses.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  };

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const totalPoints = courses.reduce((sum, c) => sum + (GRADE_POINTS[c.grade] || 0) * c.credits, 0);
  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  const gpaColor = gpa >= 3.5 ? 'text-green-600' : gpa >= 3.0 ? 'text-blue-600' : gpa >= 2.0 ? 'text-yellow-600' : 'text-red-600';
  const gpaLabel = gpa >= 3.7 ? 'Dean\'s List' : gpa >= 3.5 ? 'Honors' : gpa >= 3.0 ? 'Good Standing' : gpa >= 2.0 ? 'Satisfactory' : 'Academic Probation';

  return (
    <div className="space-y-4">
      {/* Course table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200 text-left">
              <th className="pb-2 text-xs font-medium text-surface-600">Course (optional)</th>
              <th className="pb-2 text-xs font-medium text-surface-600">Grade</th>
              <th className="pb-2 text-xs font-medium text-surface-600">Credits</th>
              <th className="pb-2 text-xs font-medium text-surface-600">Points</th>
              <th className="pb-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, i) => (
              <tr key={i} className="border-b border-surface-100">
                <td className="py-2 pr-2">
                  <input type="text" value={course.name} onChange={(e) => updateCourse(i, 'name', e.target.value)} placeholder={`Course ${i + 1}`} className="w-full rounded-lg border border-surface-200 px-2 py-1.5 text-sm" />
                </td>
                <td className="py-2 pr-2">
                  <select value={course.grade} onChange={(e) => updateCourse(i, 'grade', e.target.value)} className="rounded-lg border border-surface-200 px-2 py-1.5 text-sm">
                    {Object.keys(GRADE_POINTS).map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </td>
                <td className="py-2 pr-2">
                  <input type="number" min={0} max={12} value={course.credits} onChange={(e) => updateCourse(i, 'credits', Number(e.target.value))} className="w-20 rounded-lg border border-surface-200 px-2 py-1.5 text-sm" />
                </td>
                <td className="py-2 pr-2 font-mono text-surface-600">
                  {((GRADE_POINTS[course.grade] || 0) * course.credits).toFixed(1)}
                </td>
                <td className="py-2">
                  {courses.length > 1 && (
                    <button onClick={() => removeCourse(i)} className="text-surface-400 hover:text-red-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={addCourse} className="text-sm text-primary-600 hover:text-primary-700">+ Add Course</button>

      {/* Result */}
      <div className="rounded-xl border border-primary-200 bg-primary-50 p-6 text-center">
        <p className="text-sm text-surface-600">Your GPA</p>
        <p className={`text-5xl font-bold ${gpaColor}`}>{gpa.toFixed(2)}</p>
        <p className={`mt-1 text-sm font-medium ${gpaColor}`}>{gpaLabel}</p>
        <div className="mt-3 flex justify-center gap-4 text-sm text-surface-600">
          <span>{totalCredits} total credits</span>
          <span>{totalPoints.toFixed(1)} quality points</span>
        </div>
      </div>

      {/* GPA Scale Reference */}
      <details className="rounded-lg border border-surface-200 bg-surface-50">
        <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-surface-700">GPA Scale Reference</summary>
        <div className="grid grid-cols-4 gap-1 px-4 pb-4 sm:grid-cols-6">
          {Object.entries(GRADE_POINTS).map(([grade, points]) => (
            <div key={grade} className="rounded border border-surface-100 bg-white px-2 py-1 text-center text-xs">
              <span className="font-bold">{grade}</span> = {points.toFixed(1)}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
