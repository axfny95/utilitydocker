import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
  'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
  'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
  'explicabo', 'nemo', 'ipsam', 'quia', 'voluptas', 'aspernatur', 'aut', 'odit',
  'fugit', 'consequuntur', 'magni', 'dolores', 'eos', 'ratione', 'sequi', 'nesciunt',
];

function randomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function generateSentence(minWords: number = 5, maxWords: number = 15): string {
  const count = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
  const words = Array.from({ length: count }, randomWord);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}

function generateParagraph(minSentences: number = 3, maxSentences: number = 7): string {
  const count = minSentences + Math.floor(Math.random() * (maxSentences - minSentences + 1));
  return Array.from({ length: count }, () => generateSentence()).join(' ');
}

function generate(type: string, count: number, startWithLorem: boolean): string {
  let result: string;
  switch (type) {
    case 'words': {
      const words = Array.from({ length: count }, randomWord);
      if (startWithLorem && count >= 2) {
        words[0] = 'lorem';
        words[1] = 'ipsum';
      }
      result = words.join(' ');
      break;
    }
    case 'sentences':
      result = Array.from({ length: count }, () => generateSentence()).join(' ');
      break;
    case 'paragraphs':
    default:
      result = Array.from({ length: count }, () => generateParagraph()).join('\n\n');
      break;
  }
  if (startWithLorem && type !== 'words') {
    result = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + result.slice(result.indexOf('.') + 2);
  }
  return result;
}

export default function LoremIpsumGenerator() {
  const [type, setType] = useState('paragraphs');
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState(() => generate('paragraphs', 3, true));

  const regenerate = () => setOutput(generate(type, count, startWithLorem));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border border-surface-200 px-3 py-2 text-sm">
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Count</label>
          <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value)))} className="w-24 rounded-lg border border-surface-200 px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={startWithLorem} onChange={(e) => setStartWithLorem(e.target.checked)} className="rounded border-surface-300" />
          <span className="text-sm text-surface-700">Start with "Lorem ipsum..."</span>
        </label>
        <button onClick={regenerate} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          Generate
        </button>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm text-surface-500">
            {output.split(/\s+/).filter(Boolean).length} words | {output.length} characters
          </span>
          <CopyButton text={output} />
        </div>
        <textarea
          value={output}
          readOnly
          className="h-64 w-full rounded-lg border border-surface-200 bg-surface-50 p-4 text-sm leading-relaxed"
        />
      </div>
    </div>
  );
}
