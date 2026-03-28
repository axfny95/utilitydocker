import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

const KEYWORDS = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'ON', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW', 'AS', 'IN', 'NOT', 'NULL', 'IS', 'LIKE', 'BETWEEN', 'EXISTS', 'HAVING', 'GROUP', 'BY', 'ORDER', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'WITH', 'RECURSIVE'];
const NEWLINE_BEFORE = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'WITH'];

function formatSql(sql: string, indent: number = 2): string {
  let formatted = sql.trim();
  // Normalize whitespace
  formatted = formatted.replace(/\s+/g, ' ');
  // Uppercase keywords
  for (const kw of KEYWORDS) {
    formatted = formatted.replace(new RegExp(`\\b${kw}\\b`, 'gi'), kw);
  }
  // Add newlines before major keywords
  for (const kw of NEWLINE_BEFORE) {
    formatted = formatted.replace(new RegExp(`\\s+${kw.replace(/\s+/g, '\\s+')}\\b`, 'gi'), `\n${kw}`);
  }
  // Indent after SELECT, SET, VALUES
  const lines = formatted.split('\n');
  const result: string[] = [];
  let indentLevel = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^\)/.test(trimmed)) indentLevel = Math.max(0, indentLevel - 1);
    result.push(' '.repeat(indentLevel * indent) + trimmed);
    if (/\($/.test(trimmed) || /^(SELECT|SET|VALUES)/i.test(trimmed)) indentLevel++;
    if (/^(FROM|WHERE)/i.test(trimmed)) indentLevel = Math.max(0, indentLevel - 1);
  }
  return result.join('\n');
}

function minifySql(sql: string): string {
  return sql.replace(/\s+/g, ' ').replace(/\s*([(),;])\s*/g, '$1').trim();
}

export default function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState(2);

  const format = () => setOutput(formatSql(input, indentSize));
  const minify = () => setOutput(minifySql(input));

  const loadSample = () => {
    setInput("SELECT u.id, u.name, u.email, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.active = 1 AND u.created_at > '2024-01-01' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 5 ORDER BY order_count DESC LIMIT 10;");
    setOutput('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={format} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Format</button>
        <button onClick={minify} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50">Minify</button>
        <button onClick={loadSample} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50">Load Sample</button>
        <select value={indentSize} onChange={(e) => setIndentSize(Number(e.target.value))} className="ml-auto rounded-lg border border-surface-200 px-2 py-1 text-sm">
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
        </select>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Input SQL</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste your SQL query..." className="h-64 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" spellCheck={false} />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between"><label className="text-sm font-medium text-surface-700">Output</label>{output && <CopyButton text={output} />}</div>
          <textarea value={output} readOnly className="h-64 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm" spellCheck={false} />
        </div>
      </div>
    </div>
  );
}
