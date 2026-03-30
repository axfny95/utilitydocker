import { useState } from 'react';
import CopyButton from '../shared/CopyButton';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function InvoiceGenerator() {
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-001');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [currency, setCurrency] = useState('USD');

  const symbols: Record<string, string> = { USD: '$', EUR: '\u20AC', GBP: '\u00A3', CAD: 'CA$', AUD: 'A$' };
  const sym = symbols[currency] || '$';

  const addItem = () => setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => items.length > 1 && setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof LineItem, value: string | number) => {
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const fmt = (n: number) => `${sym}${n.toFixed(2)}`;

  const downloadPdf = async () => {
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
    const doc = await PDFDocument.create();
    const page = doc.addPage([595, 842]); // A4
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const { height } = page.getSize();

    let y = height - 50;

    // Header
    page.drawText(companyName || 'Your Company', { x: 50, y, font: bold, size: 18, color: rgb(0.15, 0.3, 0.85) });
    y -= 20;
    if (companyAddress) { page.drawText(companyAddress, { x: 50, y, font, size: 9, color: rgb(0.4, 0.4, 0.4) }); y -= 14; }

    page.drawText('INVOICE', { x: 430, y: height - 50, font: bold, size: 24, color: rgb(0.15, 0.3, 0.85) });
    page.drawText(`#${invoiceNumber}`, { x: 430, y: height - 72, font, size: 10 });
    page.drawText(`Date: ${invoiceDate}`, { x: 430, y: height - 86, font, size: 10 });
    if (dueDate) page.drawText(`Due: ${dueDate}`, { x: 430, y: height - 100, font, size: 10 });

    y -= 30;
    page.drawText('Bill To:', { x: 50, y, font: bold, size: 10 });
    y -= 16;
    if (clientName) { page.drawText(clientName, { x: 50, y, font, size: 10 }); y -= 14; }
    if (clientAddress) { page.drawText(clientAddress, { x: 50, y, font, size: 9, color: rgb(0.4, 0.4, 0.4) }); y -= 14; }

    // Table header
    y -= 20;
    page.drawRectangle({ x: 50, y: y - 4, width: 495, height: 20, color: rgb(0.93, 0.95, 0.97) });
    page.drawText('Description', { x: 55, y, font: bold, size: 9 });
    page.drawText('Qty', { x: 340, y, font: bold, size: 9 });
    page.drawText('Price', { x: 395, y, font: bold, size: 9 });
    page.drawText('Total', { x: 470, y, font: bold, size: 9 });
    y -= 20;

    // Items
    for (const item of items) {
      if (item.description) {
        const desc = item.description.length > 40 ? item.description.slice(0, 37) + '...' : item.description;
        page.drawText(desc, { x: 55, y, font, size: 9 });
        page.drawText(String(item.quantity), { x: 345, y, font, size: 9 });
        page.drawText(fmt(item.unitPrice), { x: 395, y, font, size: 9 });
        page.drawText(fmt(item.quantity * item.unitPrice), { x: 470, y, font, size: 9 });
        y -= 18;
      }
    }

    // Totals
    y -= 10;
    page.drawText('Subtotal:', { x: 395, y, font, size: 10 });
    page.drawText(fmt(subtotal), { x: 470, y, font, size: 10 });
    y -= 16;
    if (taxRate > 0) {
      page.drawText(`Tax (${taxRate}%):`, { x: 395, y, font, size: 10 });
      page.drawText(fmt(tax), { x: 470, y, font, size: 10 });
      y -= 16;
    }
    page.drawText('Total:', { x: 395, y, font: bold, size: 12 });
    page.drawText(fmt(total), { x: 470, y, font: bold, size: 12, color: rgb(0.15, 0.3, 0.85) });

    if (notes) {
      y -= 40;
      page.drawText('Notes:', { x: 50, y, font: bold, size: 10 });
      y -= 14;
      // Word-wrap notes into lines of ~80 chars
      const words = notes.split(' ');
      let line = '';
      for (const word of words) {
        if ((line + ' ' + word).trim().length > 80) {
          page.drawText(line.trim(), { x: 50, y, font, size: 9, color: rgb(0.4, 0.4, 0.4) });
          y -= 14;
          line = word;
        } else {
          line = line ? line + ' ' + word : word;
        }
      }
      if (line.trim()) {
        page.drawText(line.trim(), { x: 50, y, font, size: 9, color: rgb(0.4, 0.4, 0.4) });
      }
    }

    const bytes = await doc.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoiceNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-surface-700">Your Company</h3>
          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company Name" className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" />
          <input type="text" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Address" className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-surface-700">Bill To</h3>
          <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client Name" className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" />
          <input type="text" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="Client Address" className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div><label className="mb-1 block text-xs text-surface-600">Invoice #</label><input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" /></div>
        <div><label className="mb-1 block text-xs text-surface-600">Date</label><input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" /></div>
        <div><label className="mb-1 block text-xs text-surface-600">Due Date</label><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" /></div>
        <div><label className="mb-1 block text-xs text-surface-600">Currency</label><select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm">{Object.keys(symbols).map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
      </div>

      {/* Line items */}
      <div>
        <div className="mb-2 grid grid-cols-12 gap-2 text-xs font-medium text-surface-600">
          <span className="col-span-5">Description</span><span className="col-span-2">Qty</span><span className="col-span-2">Unit Price</span><span className="col-span-2">Total</span><span className="col-span-1"></span>
        </div>
        {items.map((item, i) => (
          <div key={i} className="mb-2 grid grid-cols-12 gap-2">
            <div className="col-span-5 relative">
              <input type="text" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} maxLength={40} placeholder="Service or product" className="w-full rounded-lg border border-surface-200 px-2 py-1.5 text-sm" />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-surface-400">{item.description.length}/40</span>
            </div>
            <input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} className="col-span-2 rounded-lg border border-surface-200 px-2 py-1.5 text-sm" />
            <input type="number" min={0} step={0.01} value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))} className="col-span-2 rounded-lg border border-surface-200 px-2 py-1.5 text-sm" />
            <span className="col-span-2 flex items-center text-sm font-mono">{fmt(item.quantity * item.unitPrice)}</span>
            <button onClick={() => removeItem(i)} className="col-span-1 text-surface-400 hover:text-red-500 text-sm">x</button>
          </div>
        ))}
        <button onClick={addItem} className="text-sm text-primary-600 hover:text-primary-700">+ Add Item</button>
      </div>

      <div className="flex items-end justify-between">
        <div className="w-48">
          <label className="mb-1 block text-xs text-surface-600">Tax Rate (%)</label>
          <input type="number" min={0} max={100} step={0.5} value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" />
        </div>
        <div className="text-right">
          <p className="text-sm text-surface-600">Subtotal: <span className="font-mono">{fmt(subtotal)}</span></p>
          {taxRate > 0 && <p className="text-sm text-surface-600">Tax ({taxRate}%): <span className="font-mono">{fmt(tax)}</span></p>}
          <p className="text-lg font-bold text-surface-900">Total: <span className="font-mono text-primary-700">{fmt(total)}</span></p>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-surface-600">Notes (optional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Payment terms, thank you message..." rows={2} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" />
      </div>

      <button onClick={downloadPdf} className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700">
        Download Invoice PDF
      </button>
    </div>
  );
}
