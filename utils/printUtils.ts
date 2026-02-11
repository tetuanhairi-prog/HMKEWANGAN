
import { Transaction, Invoice, MONTHS } from '../types';

export const formatRM = (n: number) => "RM " + n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Memformat tarikh ke bentuk dd/mm/yyyy secara konsisten.
 */
export const formatDate = (s: string | Date | undefined): string => {
  if (!s) return "";
  
  let d: Date;

  if (s instanceof Date) {
    d = s;
  } else if (typeof s === 'string') {
    // Jika sudah dalam format dd/mm/yyyy, pulangkan terus
    if (s.match(/^\d{2}\/\d{2}\/\d{4}$/)) return s;
    
    // Kendalikan format ISO YYYY-MM-DD
    if (s.includes('-')) {
      const parts = s.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        d = new Date(s);
      }
    } else {
      d = new Date(s);
    }
  } else {
    return "";
  }

  if (isNaN(d.getTime())) return "";
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Memformat tarikh dan masa untuk kegunaan sistem/cetakan.
 */
const formatDateTime = (date: Date): string => {
  const dateStr = formatDate(date);
  const timeStr = date.toLocaleTimeString('en-MY', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });
  return `${dateStr} ${timeStr}`;
};

export const toISODate = (s: string): string => {
  if (!s) return "";
  const parts = s.split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return `${y}-${m}-${d}`;
  }
  return s;
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
          <div style="margin-top:10px; text-align:center; font-size:10px; color:#999;">Dijana pada: ${formatDateTime(new Date())}</div>
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
          <div style="margin-top:10px; text-align:center; font-size:10px; color:#999;">Dijana pada: ${formatDateTime(new Date())}</div>
          <script>window.print();</script>
      </body></html>
  `);
  win.document.close();
};

export const printYearlyReport = (year: number, transactions: Transaction[], accountFilter: string = 'all') => {
  let totIn = 0, totOut = 0;
  const rows = MONTHS.map((monthName, i) => {
    let mIn = 0, mOut = 0;
    transactions.forEach(t => {
      const d = new Date(t.date);
      const matchAcc = accountFilter === 'all' || t.account === accountFilter;
      if (d.getFullYear() === year && d.getMonth() === i && matchAcc) {
        if (t.type === 'in') mIn += t.amount; else mOut += t.amount;
      }
    });
    totIn += mIn; totOut += mOut;
    const net = mIn - mOut;
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${monthName}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #059669;">${formatRM(mIn)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #dc2626;">${formatRM(mOut)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: ${net < 0 ? '#dc2626' : '#4f46e5'};">${formatRM(net)}</td>
      </tr>
    `;
  }).join('');

  const win = window.open('', '', 'width=900,height=700');
  if (!win) return;

  win.document.write(`
    <html><head><title>Laporan Tahunan ${year}</title>
    <style>
      body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
      h1 { font-size: 24px; font-weight: 900; margin-bottom: 8px; text-transform: uppercase; }
      .sub { font-size: 14px; color: #64748b; margin-bottom: 40px; font-weight: bold; text-transform: uppercase; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #0f172a; color: white; text-align: left; padding: 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; }
      tfoot { background: #f8fafc; font-weight: bold; }
    </style>
    </head><body>
      <h1>Laporan Untung Rugi Tahunan ${year}</h1>
      <div class="sub">Akaun: ${accountFilter === 'all' ? 'KESELURUHAN FIRMA' : accountFilter}</div>
      <table>
        <thead>
            <tr>
                <th>Bulan</th>
                <th style="text-align: right;">Pendapatan</th>
                <th style="text-align: right;">Perbelanjaan</th>
                <th style="text-align: right;">Untung/Rugi</th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
            <tr>
                <td style="padding: 16px 12px;">JUMLAH BESAR</td>
                <td style="padding: 16px 12px; text-align: right; color: #059669;">${formatRM(totIn)}</td>
                <td style="padding: 16px 12px; text-align: right; color: #dc2626;">${formatRM(totOut)}</td>
                <td style="padding: 16px 12px; text-align: right; color: #4f46e5;">${formatRM(totIn - totOut)}</td>
            </tr>
        </tfoot>
    </table>
    <div style="margin-top: 40px; font-size: 10px; color: #94a3b8; font-style: italic;">Dicetak pada: ${formatDateTime(new Date())}</div>
    <script>window.print();</script>
    </body></html>
  `);
  win.document.close();
};

export const printMonthlyCategoryReport = (year: number, month: number, transactions: Transaction[], accountFilter: string = 'all') => {
  const categoryMap: { [key: string]: { in: number, out: number } } = {};
  let totIn = 0, totOut = 0;

  transactions.forEach(t => {
    const d = new Date(t.date);
    const matchAcc = accountFilter === 'all' || t.account === accountFilter;
    if (d.getFullYear() === year && d.getMonth() === month && matchAcc) {
      if (!categoryMap[t.category]) categoryMap[t.category] = { in: 0, out: 0 };
      if (t.type === 'in') {
        categoryMap[t.category].in += t.amount;
        totIn += t.amount;
      } else {
        categoryMap[t.category].out += t.amount;
        totOut += t.amount;
      }
    }
  });

  const sortedCategories = Object.keys(categoryMap).sort((a, b) => 
    (categoryMap[b].in + categoryMap[b].out) - (categoryMap[a].in + categoryMap[a].out)
  );

  const rows = sortedCategories.map(cat => {
    const net = categoryMap[cat].in - categoryMap[cat].out;
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${cat.toUpperCase()}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #059669;">${formatRM(categoryMap[cat].in)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #dc2626;">${formatRM(categoryMap[cat].out)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: ${net < 0 ? '#dc2626' : '#4f46e5'};">${formatRM(net)}</td>
      </tr>
    `;
  }).join('');

  const win = window.open('', '', 'width=900,height=700');
  if (!win) return;

  win.document.write(`
    <html><head><title>Ringkasan Katagori - ${MONTHS[month]} ${year}</title>
    <style>
      body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
      h1 { font-size: 24px; font-weight: 900; margin-bottom: 8px; text-transform: uppercase; }
      .sub { font-size: 14px; color: #64748b; margin-bottom: 40px; font-weight: bold; text-transform: uppercase; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #0f172a; color: white; text-align: left; padding: 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; }
      tfoot { background: #f8fafc; font-weight: bold; }
    </style>
    </head><body>
      <h1>Ringkasan Katagori Bulanan</h1>
      <div class="sub">${MONTHS[month].toUpperCase()} ${year} | Akaun: ${accountFilter === 'all' ? 'KESELURUHAN FIRMA' : accountFilter}</div>
      <table>
        <thead>
            <tr>
                <th>Katagori</th>
                <th style="text-align: right;">Pendapatan</th>
                <th style="text-align: right;">Perbelanjaan</th>
                <th style="text-align: right;">Bersih</th>
            </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="4" style="text-align:center; padding: 40px; color: #94a3b8 italic;">Tiada transaksi dijumpai</td></tr>'}</tbody>
        <tfoot>
            <tr>
                <td style="padding: 16px 12px;">JUMLAH KESELURUHAN</td>
                <td style="padding: 16px 12px; text-align: right; color: #059669;">${formatRM(totIn)}</td>
                <td style="padding: 16px 12px; text-align: right; color: #dc2626;">${formatRM(totOut)}</td>
                <td style="padding: 16px 12px; text-align: right; color: #4f46e5;">${formatRM(totIn - totOut)}</td>
            </tr>
        </tfoot>
    </table>
    <div style="margin-top: 40px; font-size: 10px; color: #94a3b8; font-style: italic;">Dicetak pada: ${formatDateTime(new Date())}</div>
    <script>window.print();</script>
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
        <p class="text-[10px] text-slate-400 font-medium italic">Penyata ini dijana oleh sistem pada: ${formatDateTime(new Date())}</p>
        <p class="text-xs font-bold text-slate-700">Mukasurat 1 dari 1</p>
      </div>

      <div class="mt-10 no-print flex justify-center">
        <button onclick="window.print()" class="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:scale-105 transition-transform">Cetak Sekarang</button>
      </div>

      <script>window.print();</script>
    </body></html>
  `);
  win.document.close();
};
