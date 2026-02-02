import { Transaction, Invoice, MONTHS } from '../types';

export const formatRM = (n: number) => "RM " + n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatDate = (s: string) => {
  const d = new Date(s);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

export const printReceipt = (t: Transaction) => {
  const isRec = t.type === 'in';
  const title = isRec ? "RESIT RASMI" : "BAUCAR BAYARAN";
  const color = isRec ? "#047857" : "#be123c";
  const footer = "Cetakan Komputer.";

  const win = window.open('', '', 'width=800,height=600');
  if (!win) return;

  win.document.write(`
      <html><head><title>${title}</title><style>
          body { font-family: 'Times New Roman', serif; padding: 40px; }
          .header { text-align: center; border-bottom: 2px solid ${color}; padding-bottom: 20px; }
          .firm { font-size: 22px; font-weight: bold; text-transform: uppercase; }
          .title { text-align: center; font-size: 18px; font-weight: bold; color: ${color}; margin: 30px 0; text-decoration: underline; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          td { padding: 8px; border-bottom: 1px solid #eee; font-size: 14px; }
          .lbl { font-weight: bold; width: 30%; }
          .total { text-align: right; font-size: 20px; font-weight: bold; padding: 10px; background: #f3f4f6; }
      </style></head><body>
          <div class="header"><div class="firm">HAIRI MUSTAFA ASSOCIATES</div><div>Peguam Syarie & Konsultan</div></div>
          <div class="title">${title}</div>
          <table>
              <tr><td class="lbl">Tarikh:</td><td>${formatDate(t.date)}</td></tr>
              <tr><td class="lbl">Rujukan/Akaun:</td><td>${t.account}</td></tr>
              <tr><td class="lbl">Kepada/Daripada:</td><td>${t.name}</td></tr>
              <tr><td class="lbl">Keterangan:</td><td>${t.details} (${t.category})</td></tr>
          </table>
          <div class="total">JUMLAH: ${formatRM(t.amount)}</div>
          <div style="margin-top:50px; text-align:center; font-size:12px; color:#666;">${footer}</div>
          <script>window.print();</script>
      </body></html>
  `);
  win.document.close();
};

export const printInvoice = (inv: Invoice) => {
  const title = "INVOIS / BILL";
  const color = "#2563eb";
  const footer = "Sila buat bayaran ke akaun: MAYBANK 55XXXXXX (Hairi Mustafa Associates)";

  const win = window.open('', '', 'width=800,height=600');
  if (!win) return;

  win.document.write(`
      <html><head><title>${title}</title><style>
          body { font-family: 'Times New Roman', serif; padding: 40px; }
          .header { text-align: center; border-bottom: 2px solid ${color}; padding-bottom: 20px; }
          .firm { font-size: 22px; font-weight: bold; text-transform: uppercase; }
          .title { text-align: center; font-size: 18px; font-weight: bold; color: ${color}; margin: 30px 0; text-decoration: underline; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          td { padding: 8px; border-bottom: 1px solid #eee; font-size: 14px; }
          .lbl { font-weight: bold; width: 30%; }
          .total { text-align: right; font-size: 20px; font-weight: bold; padding: 10px; background: #f3f4f6; }
      </style></head><body>
          <div class="header"><div class="firm">HAIRI MUSTAFA ASSOCIATES</div><div>Peguam Syarie & Konsultan</div></div>
          <div class="title">${title}</div>
          <table>
              <tr><td class="lbl">Tarikh:</td><td>${formatDate(inv.date)}</td></tr>
              <tr><td class="lbl">No. Invois:</td><td>${inv.no}</td></tr>
              <tr><td class="lbl">Kepada:</td><td>${inv.client}</td></tr>
              <tr><td class="lbl">Keterangan:</td><td>${inv.desc}</td></tr>
          </table>
          <div class="total">JUMLAH: ${formatRM(inv.amount)}</div>
          <div style="margin-top:50px; text-align:center; font-size:12px; color:#666;">${footer}</div>
          <script>window.print();</script>
      </body></html>
  `);
  win.document.close();
};

export const printYearlyReport = (year: number, transactions: Transaction[]) => {
  let totIn = 0, totOut = 0;
  const rows = MONTHS.map((monthName, i) => {
    let mIn = 0, mOut = 0;
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getFullYear() === year && d.getMonth() === i) {
        if (t.type === 'in') mIn += t.amount; else mOut += t.amount;
      }
    });
    totIn += mIn; totOut += mOut;
    const net = mIn - mOut;
    return `
      <tr>
        <td class="p-3 border-b">${monthName}</td>
        <td class="p-3 border-b text-right text-emerald-600">${formatRM(mIn)}</td>
        <td class="p-3 border-b text-right text-rose-600">${formatRM(mOut)}</td>
        <td class="p-3 border-b text-right font-bold ${net < 0 ? 'text-red-500' : 'text-indigo-600'}">${formatRM(net)}</td>
      </tr>
    `;
  }).join('');

  const win = window.open('', '', 'width=900,height=700');
  if (!win) return;

  win.document.write(`
    <html><head><title>Laporan Tahunan ${year}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    </head><body class="p-8 font-sans">
      <h1 class="text-2xl font-bold mb-6 text-gray-800">Laporan Untung Rugi Tahunan ${year}</h1>
      <table class="w-full text-sm text-left border border-gray-300">
        <thead class="bg-gray-800 text-white font-bold">
            <tr>
                <th class="p-3">Bulan</th>
                <th class="p-3 text-right">Pendapatan (Masuk)</th>
                <th class="p-3 text-right">Perbelanjaan (Keluar)</th>
                <th class="p-3 text-right">Untung/Rugi Bersih</th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot class="bg-gray-100 font-bold border-t-2 border-gray-300">
            <tr>
                <td class="p-3">JUMLAH BESAR</td>
                <td class="p-3 text-right text-emerald-600">${formatRM(totIn)}</td>
                <td class="p-3 text-right text-rose-600">${formatRM(totOut)}</td>
                <td class="p-3 text-right text-indigo-700">${formatRM(totIn - totOut)}</td>
            </tr>
        </tfoot>
    </table>
    <div class="mt-4 text-sm text-gray-500">Dicetak pada: ${new Date().toLocaleString()}</div>
    <script>setTimeout(()=>{window.print();},500);</script>
    </body></html>
  `);
  win.document.close();
};

export const printAccountStatement = (account: string, month: string, year: number, transactions: Transaction[], broughtForward: number) => {
  let runningBalance = broughtForward;
  const rows = transactions.map(t => {
    if (t.type === 'in') runningBalance += t.amount;
    else runningBalance -= t.amount;
    
    return `
      <tr>
        <td class="p-2 border-b text-xs">${formatDate(t.date)}</td>
        <td class="p-2 border-b text-xs">
          <div class="font-bold">${t.name}</div>
          <div class="text-[10px] text-gray-500">${t.details}</div>
        </td>
        <td class="p-2 border-b text-right text-emerald-700 font-bold text-xs">${t.type === 'in' ? formatRM(t.amount) : '-'}</td>
        <td class="p-2 border-b text-right text-rose-700 font-bold text-xs">${t.type === 'out' ? formatRM(t.amount) : '-'}</td>
        <td class="p-2 border-b text-right font-bold text-xs">${formatRM(runningBalance)}</td>
      </tr>
    `;
  }).join('');

  const win = window.open('', '', 'width=900,height=700');
  if (!win) return;

  win.document.write(`
    <html><head><title>Penyata Akaun - ${account}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>@media print { .no-print { display: none; } }</style>
    </head><body class="p-8 font-sans bg-white">
      <div class="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
        <div>
          <h1 class="text-2xl font-black text-slate-900 uppercase">Penyata Akaun</h1>
          <p class="text-sm font-bold text-slate-600">${account}</p>
          <p class="text-xs text-slate-500">${month} ${year}</p>
        </div>
        <div class="text-right">
          <p class="text-lg font-bold text-slate-900">HAIRI MUSTAFA ASSOCIATES</p>
          <p class="text-xs text-slate-500">Peguam Syarie & Konsultan</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
           <p class="text-[10px] font-bold text-slate-500 uppercase">Baki Bawa Hadapan</p>
           <p class="text-lg font-bold text-slate-800">${formatRM(broughtForward)}</p>
        </div>
        <div class="bg-slate-900 p-3 rounded-lg border border-slate-900 text-white text-right">
           <p class="text-[10px] font-bold text-slate-400 uppercase">Baki Akhir</p>
           <p class="text-lg font-bold">${formatRM(runningBalance)}</p>
        </div>
      </div>

      <table class="w-full text-left border-collapse">
        <thead class="bg-slate-100 text-slate-700 uppercase text-[10px] font-black">
          <tr>
            <th class="p-2 border-b">Tarikh</th>
            <th class="p-2 border-b">Butiran Transaksi</th>
            <th class="p-2 border-b text-right">Kredit (Masuk)</th>
            <th class="p-2 border-b text-right">Debit (Keluar)</th>
            <th class="p-2 border-b text-right">Baki</th>
          </tr>
        </thead>
        <tbody>
          ${rows.length > 0 ? rows : '<tr><td colspan="5" class="p-8 text-center text-gray-400 italic">Tiada transaksi pada tempoh ini.</td></tr>'}
        </tbody>
      </table>

      <div class="mt-8 pt-4 border-t border-dashed border-slate-300 flex justify-between items-end">
        <p class="text-[10px] text-slate-400 font-medium italic">Penyata ini dijana oleh sistem pada: ${new Date().toLocaleString()}</p>
        <p class="text-xs font-bold text-slate-700">Mukasurat 1 dari 1</p>
      </div>

      <div class="mt-10 no-print flex justify-center">
        <button onclick="window.print()" class="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:scale-105 transition-transform">Cetak Sekarang</button>
      </div>

      <script>setTimeout(()=>{window.print();},500);</script>
    </body></html>
  `);
  win.document.close();
};
