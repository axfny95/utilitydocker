import { useState, useRef, useEffect } from 'react';

export default function TextToHandwriting() {
  const [text, setText] = useState('Hello! This is my handwritten note.\nUtilityDocker makes it easy.');
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState('#1a1a2e');
  const [bgColor, setBgColor] = useState('#fffef2');
  const [lineSpacing, setLineSpacing] = useState(2.0);
  const [tilt, setTilt] = useState(2);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lineHeightPx = fontSize * lineSpacing;
    const lines = text.split('\n');
    const marginLeft = 80;
    const marginTop = 50;
    const maxWidth = 720; // usable width

    // Word-wrap long lines
    const wrappedLines: string[] = [];
    const baseFont = `${fontSize}px 'Segoe Script', 'Comic Sans MS', cursive`;
    ctx.font = baseFont;

    for (const line of lines) {
      if (!line.trim()) { wrappedLines.push(''); continue; }
      const words = line.split(' ');
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && currentLine) {
          wrappedLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) wrappedLines.push(currentLine);
    }

    canvas.width = 800;
    canvas.height = Math.max(250, wrappedLines.length * lineHeightPx + marginTop + 60);

    // Paper background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ruled lines
    ctx.strokeStyle = '#d4d4d8';
    ctx.lineWidth = 0.5;
    for (let y = marginTop + lineHeightPx; y < canvas.height - 20; y += lineHeightPx) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(canvas.width - 40, y);
      ctx.stroke();
    }

    // Red margin line
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(marginLeft - 10, 0);
    ctx.lineTo(marginLeft - 10, canvas.height);
    ctx.stroke();

    // Draw handwriting text
    ctx.fillStyle = color;

    wrappedLines.forEach((line, lineIdx) => {
      const baseY = marginTop + (lineIdx + 1) * lineHeightPx;
      let x = marginLeft;

      // Set font BEFORE measuring
      const charFont = `${fontSize}px 'Segoe Script', 'Comic Sans MS', cursive`;
      ctx.font = charFont;

      for (const char of line) {
        // Measure width with the correct font set
        const charWidth = ctx.measureText(char).width;

        // Small random variations for handwriting effect
        const offsetY = (Math.random() - 0.5) * 2;
        const offsetX = (Math.random() - 0.5) * 0.5;
        const rotation = ((Math.random() - 0.5) * tilt * Math.PI) / 180;
        const sizeVar = fontSize + (Math.random() - 0.5) * 1;

        ctx.save();
        ctx.font = `${sizeVar}px 'Segoe Script', 'Comic Sans MS', cursive`;
        ctx.translate(x + offsetX, baseY + offsetY);
        ctx.rotate(rotation);
        ctx.fillText(char, 0, 0);
        ctx.restore();

        // Advance x by the measured character width plus small gap
        x += charWidth + 0.5;
      }
    });
  }, [text, fontSize, color, bgColor, lineSpacing, tilt]);

  const download = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'handwriting.png';
    a.click();
  };

  return (
    <div className="space-y-4">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="w-full rounded-lg border border-surface-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Type your text here..." />

      <div className="grid gap-4 sm:grid-cols-4">
        <div><label className="mb-1 block text-xs text-surface-600">Font Size: {fontSize}px</label><input type="range" min={14} max={40} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" /></div>
        <div><label className="mb-1 block text-xs text-surface-600">Ink Color</label><input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-full rounded border border-surface-200 cursor-pointer" /></div>
        <div><label className="mb-1 block text-xs text-surface-600">Paper Color</label><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 w-full rounded border border-surface-200 cursor-pointer" /></div>
        <div><label className="mb-1 block text-xs text-surface-600">Wobble: {tilt}</label><input type="range" min={0} max={8} value={tilt} onChange={(e) => setTilt(Number(e.target.value))} className="w-full" /></div>
      </div>

      <canvas ref={canvasRef} className="w-full rounded-lg border border-surface-200 shadow-sm" />

      <button onClick={download} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700">Download as PNG</button>
    </div>
  );
}
