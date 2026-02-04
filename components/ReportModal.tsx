
import React from 'react';
import { X, Printer, TrendingUp, TrendingDown, LayoutDashboard, FileBarChart, PieChart, Activity } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      <div className="relative bg-white w-full max-w-5xl h-full sm:h-[90vh] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        
        <div className="flex justify-between items-center px-10 py-8 border-b bg-[#0A1128] text-white shrink-0">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-500/20">
              <FileBarChart className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-2xl font-black uppercase tracking-tighter text-white leading-none">Laporan Prestasi</p>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-1.5">TAHUNAN {year}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/10 hover:bg-rose-500/20 hover:text-rose-400 rounded-2xl transition-all group active:scale-90">
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 no-scrollbar bg-slate-50/50">
          <div className="max-w-4xl mx-auto space-y-10">
            
            <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Penyata Untung Rugi</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" /> Ringkasan Prestasi Kewangan {year}
                </p>
              </div>
              <button onClick={() => printYearlyReport(year, transactions)} className="w-full sm:w-auto bg-[#5D57E7] hover:bg-[#4E48D6] text-white px-10 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.35em] flex items-center justify-center gap-3 transition-all shadow-2xl shadow-indigo-500/20 active:scale-[0.98]">
                <Printer className="w-5 h-5" /> Cetak Laporan Penuh
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-[2.5rem] flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pendapatan Bersih</p>
                <p className="text-3xl font-black text-emerald-600 tracking-tighter tabular-nums">{formatRM(grandTotalIn)}</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-bl-[2.5rem] flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-rose-500" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Perbelanjaan Operasi</p>
                <p className="text-3xl font-black text-rose-600 tracking-tighter tabular-nums">{formatRM(grandTotalOut)}</p>
              </div>
              <div className="bg-[#5D57E7] p-8 rounded-[2.5rem] shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-[2.5rem] flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-3">Untung/Rugi Akhir</p>
                <p className="text-3xl font-black tracking-tighter tabular-nums">{formatRM(grandTotalIn - grandTotalOut)}</p>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[#0A1128] text-white font-black uppercase text-[9px] tracking-[0.2em]">
                  <tr>
                    <th className="px-10 py-6">Analisis Mengikut Bulan</th>
                    <th className="px-10 py-6 text-right">Pendapatan</th>
                    <th className="px-10 py-6 text-right">Belanja</th>
                    <th className="px-10 py-6 text-right">Untung/Rugi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {monthlyData.map((m, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-10 py-8 font-black text-slate-700 uppercase text-[10px] tracking-[0.15em]">{m.name}</td>
                      <td className="px-10 py-8 text-right text-emerald-600 font-black text-lg tabular-nums">{formatRM(m.in)}</td>
                      <td className="px-10 py-8 text-right text-rose-600 font-black text-lg tabular-nums">{formatRM(m.out)}</td>
                      <td className={`px-10 py-8 text-right font-black text-lg tabular-nums ${m.net < 0 ? 'text-rose-700' : 'text-indigo-700'}`}>
                        {formatRM(m.net)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-200 uppercase tracking-widest text-[10px]">
                  <tr>
                    <td className="px-10 py-10">JUMLAH TAHUNAN</td>
                    <td className="px-10 py-10 text-right text-emerald-600 text-2xl tabular-nums">{formatRM(grandTotalIn)}</td>
                    <td className="px-10 py-10 text-right text-rose-600 text-2xl tabular-nums">{formatRM(grandTotalOut)}</td>
                    <td className="px-10 py-10 text-right text-indigo-700 text-2xl tabular-nums">{formatRM(grandTotalIn - grandTotalOut)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="text-[9px] font-black text-slate-400 text-center uppercase tracking-[0.3em] py-10 opacity-50 italic">HMA Legal Management System • Financial Audit Tool</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
