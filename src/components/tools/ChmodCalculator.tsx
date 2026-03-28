import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

type PermBit = 'r' | 'w' | 'x';
type Role = 'owner' | 'group' | 'others';

const ROLES: Role[] = ['owner', 'group', 'others'];
const BITS: PermBit[] = ['r', 'w', 'x'];
const BIT_VALUES: Record<PermBit, number> = { r: 4, w: 2, x: 1 };

export default function ChmodCalculator() {
  const [perms, setPerms] = useState<Record<Role, Set<PermBit>>>({
    owner: new Set(['r', 'w', 'x']),
    group: new Set(['r', 'x']),
    others: new Set(['r', 'x']),
  });

  const toggle = (role: Role, bit: PermBit) => {
    setPerms((prev) => {
      const next = { ...prev, [role]: new Set(prev[role]) };
      if (next[role].has(bit)) next[role].delete(bit);
      else next[role].add(bit);
      return next;
    });
  };

  const getOctal = (role: Role): number => {
    let val = 0;
    perms[role].forEach((bit) => { val += BIT_VALUES[bit]; });
    return val;
  };

  const octal = `${getOctal('owner')}${getOctal('group')}${getOctal('others')}`;
  const symbolic = ROLES.map((role) => BITS.map((bit) => perms[role].has(bit) ? bit : '-').join('')).join('');
  const chmodCmd = `chmod ${octal} filename`;

  const setFromOctal = (val: string) => {
    if (val.length !== 3) return;
    const digits = val.split('').map(Number);
    if (digits.some((d) => isNaN(d) || d < 0 || d > 7)) return;
    const newPerms: Record<Role, Set<PermBit>> = { owner: new Set(), group: new Set(), others: new Set() };
    ROLES.forEach((role, i) => {
      if (digits[i] & 4) newPerms[role].add('r');
      if (digits[i] & 2) newPerms[role].add('w');
      if (digits[i] & 1) newPerms[role].add('x');
    });
    setPerms(newPerms);
  };

  const COMMON = [
    { octal: '755', desc: 'Owner: full, Others: read+execute (default for directories)' },
    { octal: '644', desc: 'Owner: read+write, Others: read (default for files)' },
    { octal: '777', desc: 'Everyone: full access (avoid in production)' },
    { octal: '600', desc: 'Owner only: read+write (private files)' },
    { octal: '700', desc: 'Owner only: full (private directories)' },
    { octal: '444', desc: 'Everyone: read only' },
  ];

  return (
    <div className="space-y-6">
      {/* Permission grid */}
      <div className="overflow-hidden rounded-lg border border-surface-200">
        <table className="w-full text-sm">
          <thead className="bg-surface-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-surface-600"></th>
              <th className="px-4 py-2 text-center font-medium text-surface-600">Read (4)</th>
              <th className="px-4 py-2 text-center font-medium text-surface-600">Write (2)</th>
              <th className="px-4 py-2 text-center font-medium text-surface-600">Execute (1)</th>
              <th className="px-4 py-2 text-center font-medium text-surface-600">Octal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {ROLES.map((role) => (
              <tr key={role}>
                <td className="px-4 py-3 font-medium capitalize text-surface-900">{role}</td>
                {BITS.map((bit) => (
                  <td key={bit} className="px-4 py-3 text-center">
                    <input type="checkbox" checked={perms[role].has(bit)} onChange={() => toggle(role, bit)} className="h-5 w-5 rounded border-surface-300 text-primary-600" />
                  </td>
                ))}
                <td className="px-4 py-3 text-center font-mono font-bold text-primary-700">{getOctal(role)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Result */}
      <div className="rounded-xl border border-primary-200 bg-primary-50 p-6 text-center space-y-2">
        <p className="text-sm text-surface-600">Permission</p>
        <p className="text-4xl font-bold font-mono text-primary-700">{octal}</p>
        <p className="font-mono text-surface-600">-{symbolic}</p>
        <div className="flex justify-center"><CopyButton text={chmodCmd} label="Copy command" /></div>
        <p className="font-mono text-sm text-surface-500">{chmodCmd}</p>
      </div>

      {/* Quick input */}
      <div>
        <label className="mb-1 block text-sm font-medium text-surface-700">Enter octal value</label>
        <input type="text" value={octal} onChange={(e) => setFromOctal(e.target.value)} maxLength={3} className="w-24 rounded-lg border border-surface-200 px-3 py-2 font-mono text-lg text-center" />
      </div>

      {/* Common permissions */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-surface-700">Common Permissions</h3>
        <div className="space-y-1">
          {COMMON.map((c) => (
            <button key={c.octal} onClick={() => setFromOctal(c.octal)} className="flex w-full items-center gap-3 rounded-lg border border-surface-100 px-3 py-2 text-left text-sm hover:bg-surface-50">
              <code className="font-mono font-bold text-primary-600">{c.octal}</code>
              <span className="text-surface-600">{c.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
