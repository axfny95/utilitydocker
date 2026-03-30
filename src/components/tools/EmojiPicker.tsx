import { useState, useMemo } from 'react';

const EMOJI_DATA: { category: string; emojis: string[] }[] = [
  { category: 'Smileys', emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🫡','🤐','🤨','😐','😑','😶','🫥','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐'] },
  { category: 'Gestures', emojis: ['👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','🫵','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🙏','✍️','💪'] },
  { category: 'People', emojis: ['👶','👧','🧒','👦','👩','🧑','👨','👩‍🦱','🧑‍🦱','👨‍🦱','👩‍🦰','🧑‍🦰','👨‍🦰','👱‍♀️','👱','👱‍♂️','👩‍🦳','🧑‍🦳','👨‍🦳','👩‍🦲','🧑‍🦲','👨‍🦲','🧔‍♀️','🧔','🧔‍♂️','👵','🧓','👴'] },
  { category: 'Animals', emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞'] },
  { category: 'Food', emojis: ['🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🥑','🍆','🥦','🥬','🥒','🌶️','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍞','🥐','🥖','🫓','🥨','🥯','🧇','🥞','🧈','🍕','🍔','🍟','🌭','🥪','🌮','🌯','🫔','🥙','🧆','🥚','🍳','🫕','🥘','🍲'] },
  { category: 'Travel', emojis: ['🚗','🚕','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🛵','🏍️','🛺','🚲','🛴','🚂','✈️','🚀','🛸','🚁','⛵','🚢','🏠','🏢','🏗️','🏭','🏰','🗼','🗽','⛪','🕌','🛕','🕍'] },
  { category: 'Objects', emojis: ['⌚','📱','💻','⌨️','🖥️','🖨️','🖱️','🖲️','💾','💿','📀','📷','📹','🎥','📞','☎️','📺','📻','🎙️','⏰','🔋','🔌','💡','🔦','🕯️','🪫','💰','💳','💎','⚖️','🔧','🔨','🪛','🔩','⚙️','🔗','📎','✂️','📐','📏','📌','📍','🗑️'] },
  { category: 'Symbols', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','⭐','🌟','✨','⚡','🔥','💯','✅','❌','❓','❗','➡️','⬅️','⬆️','⬇️','↩️','↪️','🔄','♻️','✳️','🔰','⭕','✔️','☑️','➕','➖','➗','✖️','♾️','💲','💱'] },
  { category: 'Flags', emojis: ['🏳️','🏴','🏁','🚩','🏳️‍🌈','🏳️‍⚧️','🇺🇸','🇬🇧','🇨🇦','🇦🇺','🇩🇪','🇫🇷','🇯🇵','🇰🇷','🇨🇳','🇮🇳','🇧🇷','🇲🇽','🇪🇸','🇮🇹','🇷🇺','🇳🇱','🇸🇪','🇳🇴','🇩🇰','🇫🇮','🇵🇱','🇹🇷','🇸🇦','🇦🇪'] },
];

export default function EmojiPicker() {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);

  const filtered = useMemo(() => {
    if (!search.trim()) return EMOJI_DATA;
    const q = search.toLowerCase();
    return EMOJI_DATA.map((cat) => ({
      ...cat,
      emojis: cat.category.toLowerCase().includes(q) ? cat.emojis : [],
    })).filter((cat) => cat.emojis.length > 0 || cat.category.toLowerCase().includes(q));
  }, [search]);

  const copy = async (emoji: string) => {
    await navigator.clipboard.writeText(emoji);
    setCopied(emoji);
    setRecent((prev) => [emoji, ...prev.filter((e) => e !== emoji)].slice(0, 20));
    setTimeout(() => setCopied(null), 1000);
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search emoji categories..."
        className="w-full rounded-lg border border-surface-200 bg-surface-50 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      />

      {recent.length > 0 && (
        <div>
          <h3 className="mb-1 text-xs font-medium text-surface-500">Recently Used</h3>
          <div className="flex flex-wrap gap-1">
            {recent.map((emoji, i) => (
              <button key={i} onClick={() => copy(emoji)} className="rounded-lg p-1.5 text-2xl hover:bg-surface-100 transition-colors" title="Click to copy">
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-h-96 overflow-auto space-y-4">
        {filtered.map((cat) => (
          <div key={cat.category}>
            <h3 className="mb-2 text-sm font-medium text-surface-700 sticky top-0 bg-white py-1">{cat.category}</h3>
            <div className="flex flex-wrap gap-0.5">
              {cat.emojis.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => copy(emoji)}
                  className={`rounded-lg p-1.5 text-2xl transition-all hover:bg-surface-100 hover:scale-125 ${copied === emoji ? 'bg-green-100 scale-125' : ''}`}
                  title="Click to copy"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {copied && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-center text-sm text-green-700">
          Copied {copied} to clipboard!
        </div>
      )}
    </div>
  );
}
