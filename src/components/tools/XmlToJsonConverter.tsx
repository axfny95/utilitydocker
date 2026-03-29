import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

function xmlToJson(xml: string): unknown {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const error = doc.querySelector('parsererror');
  if (error) throw new Error('Invalid XML: ' + error.textContent?.slice(0, 100));

  function nodeToObj(node: Element): unknown {
    const obj: Record<string, unknown> = {};

    // Attributes
    if (node.attributes.length > 0) {
      const attrs: Record<string, string> = {};
      for (const attr of Array.from(node.attributes)) {
        attrs[`@${attr.name}`] = attr.value;
      }
      Object.assign(obj, attrs);
    }

    // Child elements
    const children = Array.from(node.children);
    if (children.length === 0) {
      const text = node.textContent?.trim();
      if (Object.keys(obj).length === 0) return text || null;
      if (text) obj['#text'] = text;
    } else {
      for (const child of children) {
        const key = child.tagName;
        const value = nodeToObj(child);
        if (obj[key] !== undefined) {
          if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
          (obj[key] as unknown[]).push(value);
        } else {
          obj[key] = value;
        }
      }
    }

    return obj;
  }

  const root = doc.documentElement;
  return { [root.tagName]: nodeToObj(root) };
}

export default function XmlToJsonConverter() {
  const [xml, setXml] = useState('');
  const [json, setJson] = useState('');
  const [error, setError] = useState('');

  const convert = () => {
    setError('');
    try {
      const result = xmlToJson(xml);
      setJson(JSON.stringify(result, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed');
      setJson('');
    }
  };

  const loadSample = () => {
    setXml(`<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="fiction">
    <title>The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <year>1925</year>
    <price>10.99</price>
  </book>
  <book category="nonfiction">
    <title>Sapiens</title>
    <author>Yuval Noah Harari</author>
    <year>2011</year>
    <price>14.99</price>
  </book>
</bookstore>`);
    setJson('');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={convert} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Convert XML to JSON</button>
        <button onClick={loadSample} className="rounded-lg border border-surface-200 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50">Load Sample</button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">XML Input</label>
          <textarea value={xml} onChange={(e) => setXml(e.target.value)} placeholder="Paste XML here..." className="h-72 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm" spellCheck={false} />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-surface-700">JSON Output</label>
            {json && <CopyButton text={json} />}
          </div>
          <textarea value={json} readOnly className="h-72 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm" spellCheck={false} />
        </div>
      </div>
    </div>
  );
}
