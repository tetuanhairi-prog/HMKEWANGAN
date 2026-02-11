import React, { useState, useMemo } from 'react';
import { X, Printer, TrendingUp, TrendingDown, FileBarChart, PieChart, Activity, Layers, Calendar, ChevronDown } from 'lucide-react';
import { Transaction, MONTHS, ACCOUNTS, CATEGORIES } from '../types';
import { printYearlyReport, formatRM, printMonthlyCategoryReport } from '../utils/printUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  year: number;
}

const ReportModal: React.FC<Props> = ({ isOpen, onClose, transactions, year }) => {
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  if (!isOpen) return null;

  // Pemprosesan Data Berdasarkan Penapis
  const { displayData, grandTotalIn, grandTotalOut } = useMemo(() => {
    let tIn = 0;
    let tOut = 0;

    if (viewMode === 'yearly') {
      const data = MONTHS.map((monthName, index) => {
        let monthlyIn = 0;
        let monthlyOut = 0;
        transactions.forEach(t => {
          const d = new Date(t.date);
          const matchAcc = selectedAccount === 'all' || t.account === selectedAccount;
          if (d.getFullYear() === year && d.getMonth() === index && matchAcc) {
            if (t.type === 'in') monthlyIn += t.amount;
            else monthlyOut += t.amount;
          }
        });
        tIn += monthlyIn;
        tOut += monthlyOut;
        return { label: monthName, in: monthlyIn, out: monthlyOut, net: monthlyIn - monthlyOut };
      });
      return { displayData: data, grandTotalIn: tIn, grandTotalOut: tOut };
    } else {
      // Mod Bulanan: Ringkasan mengikut Katagori
      const categoryMap: { [key: string]: { in: number, out: number } } = {};
      
      // Ambil semua kategori unik yang ada dalam transaksi untuk bulan tersebut
      transactions.forEach(t => {
        const d = new Date(t.date);
        const matchAcc = selectedAccount === 'all' || t.account === selectedAccount;
        if (d.getFullYear() === year && d.getMonth() === selectedMonth && matchAcc) {
          if (!categoryMap[t.category]) categoryMap[t.category] = { in: 0, out: 0 };
          if (t.type === 'in') {
            categoryMap[t.category].in += t.amount;
            tIn += t.amount;
          } else {
            categoryMap[t.category].out += t.amount;
            tOut += t.amount;
          }
        }
      });

      const data = Object.keys(categoryMap).map(cat => ({
        label: cat,
        in: categoryMap[cat].in,
        out: categoryMap[cat].out,
        net: categoryMap[cat].in - categoryMap[cat].out
      })).sort((a, b) => b.in + b.out - (a.in + a.out));

      return { displayData: data, grandTotalIn: tIn, grandTotalOut: tOut };
    }
  }, [transactions, year, selectedAccount, viewMode, selectedMonth]);

  const handlePrint = () => {
    if (viewMode === 'yearly') {
      printYearlyReport(year, transactions, selectedAccount);
    } else {
      printMonthlyCategoryReport(year, selectedMonth, transactions, selectedAccount);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      <div className="relative bg-[#F5F7F9] w-full max-w-5xl h-full sm:h-[90vh] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center px-10 py-8 border-b bg-[#0A1128] text-white shrink-0">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-500/20">
              <FileBarChart className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-2xl font-black uppercase tracking-tighter text-white leading-none">Pusat Analisis Kewangan</p>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-1.5">
                {viewMode === 'yearly' ? `LAPORAN TAHUNAN ${year}` : `RINGKASAN ${MONTHS[selectedMonth].toUpperCase()} ${year}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/10 hover:bg-rose-500/20 hover:text-rose-400 rounded-2xl transition-all group active:scale-90">
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
          </button>
        </div>
        
        {/* Filters Bar */}
        <div className="bg-white border-b px-10 py-6 flex flex-wrap items-center gap-6 shrink-0 shadow-sm">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
            <button 
              onClick={() => setViewMode('yearly')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'yearly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Tahunan
            </button>
            <button 
              onClick={() => setViewMode('monthly')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'monthly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Bulanan
            </button>
          </div>

          <div className="h-8 w-px bg-slate-200"></div>

          <div className="relative group min-w-[200px]">
            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-10 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none cursor-pointer"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
            >
              <option value="all">Semua Akaun</option>
              {ACCOUNTS.map(acc => <option key={acc} value={acc}>{acc.toUpperCase()}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
          </div>

          {viewMode === 'monthly' && (
            <div className="relative group min-w-[180px] animate-in slide-in-from-left-4 duration-300">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-10 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none cursor-pointer"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {MONTHS.map((m, i) => <option key={i} value={i}>{m.toUpperCase()}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
            </div>
          )}

          <div className="flex-1"></div>

          <button onClick={handlePrint} className="bg-[#5D57E7] hover:bg-[#4E48D6] text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]">
            <Printer className="w-4.5 h-4.5" /> Cetak Laporan
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
          <div className="max-w-4xl mx-auto space-y-10">
            
            <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                  {viewMode === 'yearly' ? 'Penyata Untung Rugi Tahunan' : 'Ringkasan Aliran Tunai Bulanan'}
                </h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" /> 
                  Prestasi {selectedAccount === 'all' ? 'Firma Keseluruhan' : selectedAccount}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-[2.5rem] flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Terimaan (Kredit)</p>
                <p className="text-3xl font-black text-emerald-600 tracking-tighter tabular-nums">{formatRM(grandTotalIn)}</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-bl-[2.5rem] flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-rose-500" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Belanja (Debit)</p>
                <p className="text-3xl font-black text-rose-600 tracking-tighter tabular-nums">{formatRM(grandTotalOut)}</p>
              </div>
              <div className="bg-[#5D57E7] p-8 rounded-[2.5rem] shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-[2.5rem] flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-3">Untung/Rugi Bersih</p>
                <p className="text-3xl font-black tracking-tighter tabular-nums">{formatRM(grandTotalIn - grandTotalOut)}</p>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-700">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[#0A1128] text-white font-black uppercase text-[9px] tracking-[0.2em]">
                  <tr>
                    <th className="px-10 py-6">{viewMode === 'yearly' ? 'Analisis Mengikut Bulan' : 'Analisis Mengikut Katagori'}</th>
                    <th className="px-10 py-6 text-right">Pendapatan</th>
                    <th className="px-10 py-6 text-right">Belanja</th>
                    <th className="px-10 py-6 text-right">Untung/Rugi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {displayData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-10 py-8 font-black text-slate-700 uppercase text-[10px] tracking-[0.15em]">{row.label}</td>
                      <td className="px-10 py-8 text-right text-emerald-600 font-black text-lg tabular-nums">{formatRM(row.in)}</td>
                      <td className="px-10 py-8 text-right text-rose-600 font-black text-lg tabular-nums">{formatRM(row.out)}</td>
                      <td className={`px-10 py-8 text-right font-black text-lg tabular-nums ${row.net < 0 ? 'text-rose-700' : 'text-indigo-700'}`}>
                        {formatRM(row.net)}
                      </td>
                    </tr>
                  ))}
                  {displayData.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-10 py-24 text-center text-slate-300 font-black uppercase tracking-widest text-xs">
                        Tiada data transaksi dijumpai
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-200 uppercase tracking-widest text-[10px]">
                  <tr>
                    <td className="px-10 py-10">JUMLAH KESELURUHAN</td>
                    <td className="px-10 py-10 text-right text-emerald-600 text-2xl tabular-nums">{formatRM(grandTotalIn)}</td>
                    <td className="px-10 py-10 text-right text-rose-600 text-2xl tabular-nums">{formatRM(grandTotalOut)}</td>
                    <td className="px-10 py-10 text-right text-indigo-700 text-2xl tabular-nums">{formatRM(grandTotalIn - grandTotalOut)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="text-[9px] font-black text-slate-400 text-center uppercase tracking-[0.3em] py-10 opacity-50 italic">HMA Legal Management System • Financial Intelligence Unit</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;