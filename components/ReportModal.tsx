import React from 'react';
import { X, Printer, TrendingUp, TrendingDown, LayoutDashboard, FileBarChart } from 'lucide-react';
import { Transaction, MONTHS } from '../types';
import { printYearlyReport, formatRM } from '../utils/printUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  year: number;
}

const ReportModal: React.FC<Props> = ({ isOpen, onClose, transactions, year }) => {
  if (!isOpen) return null;

  let grandTotalIn = 0;
  let grandTotalOut = 0;

  const monthlyData = MONTHS.map((monthName, index) => {
    let monthlyIn = 0;
    let monthlyOut = 0;

    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getFullYear() === year && d.getMonth() === index) {
        if (t.type === 'in') monthlyIn += t.amount;
        else monthlyOut += t.amount;
      }
    });

    grandTotalIn += monthlyIn;
    grandTotalOut += monthlyOut;

    return { name: monthName, in: monthlyIn, out: monthlyOut, net: monthlyIn - monthlyOut };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-5xl h-full sm:h-[90vh] sm:rounded-[2.5rem] shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
        
        <div className="flex justify-between items-center px-8 py-8 border-b bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl shadow-inner backdrop-blur-md border border-white/10">
              <FileBarChart className="w-8 h-8" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-2xl font-black uppercase tracking-tighter">Laporan Untung Rugi</p>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest opacity-80">Tahunan {year}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all group active:scale-90">
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-slate-50/50">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Ringkasan Kewangan {year}</h3>
              <button 
                onClick={() => printYearlyReport(year, transactions)}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
              >
                <Printer className="w-5 h-5" /> Cetak Laporan Penuh
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-emerald-500" strokeWidth={3} /> Pendapatan
                </p>
                <p className="text-2xl font-black text-slate-800 tracking-tighter">{formatRM(grandTotalIn)}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <TrendingDown className="w-3 h-3 text-rose-500" strokeWidth={3} /> Perbelanjaan
                </p>
                <p className="text-2xl font-black text-slate-800 tracking-tighter">{formatRM(grandTotalOut)}</p>
              </div>
              <div className="bg-indigo-600 p-6 rounded-[2rem] shadow-xl shadow-indigo-500/20 text-white">
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <LayoutDashboard className="w-3 h-3" /> Untung Bersih
                </p>
                <p className="text-2xl font-black tracking-tighter">{formatRM(grandTotalIn - grandTotalOut)}</p>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-2xl overflow-hidden">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="p-6">Bulan</th>
                    <th className="p-6 text-right">Pendapatan</th>
                    <th className="p-6 text-right">Belanja</th>
                    <th className="p-6 text-right">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {monthlyData.map((m, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="p-6 font-black text-slate-700 uppercase text-xs tracking-wider">{m.name}</td>
                      <td className="p-6 text-right text-emerald-600 font-black text-base">{formatRM(m.in)}</td>
                      <td className="p-6 text-right text-rose-600 font-black text-base">{formatRM(m.out)}</td>
                      <td className={`p-6 text-right font-black text-base ${m.net < 0 ? 'text-rose-700' : 'text-indigo-700'}`}>
                        {formatRM(m.net)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-black text-slate-900 border-t-4 border-slate-100 uppercase tracking-widest text-[10px]">
                  <tr>
                    <td className="p-8">Jumlah Besar</td>
                    <td className="p-8 text-right text-emerald-600 text-lg">{formatRM(grandTotalIn)}</td>
                    <td className="p-8 text-right text-rose-600 text-lg">{formatRM(grandTotalOut)}</td>
                    <td className="p-8 text-right text-indigo-700 text-lg">{formatRM(grandTotalIn - grandTotalOut)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="text-[10px] font-black text-slate-400 text-center uppercase tracking-[0.2em] py-8">* Laporan ini merangkumi semua data yang didaftarkan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;