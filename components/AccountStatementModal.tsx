
import React, { useState, useMemo } from 'react';
import { X, Printer, Search, Wallet, Calendar, ArrowRightLeft, TrendingUp, TrendingDown, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Transaction, ACCOUNTS, MONTHS } from '../types';
import { printAccountStatement, formatRM, formatDate } from '../utils/printUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

const AccountStatementModal: React.FC<Props> = ({ isOpen, onClose, transactions }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedAccount, setSelectedAccount] = useState(ACCOUNTS[0]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  if (!isOpen) return null;

  const { filteredTransactions, balanceBroughtForward, closingBalance, totalIn, totalOut } = useMemo(() => {
    let bf = 0;
    transactions.forEach(t => {
      if (t.account !== selectedAccount) return;
      const d = new Date(t.date);
      const tYear = d.getFullYear();
      const tMonth = d.getMonth();
      if (tYear < selectedYear || (tYear === selectedYear && tMonth < selectedMonth)) {
        if (t.type === 'in') bf += t.amount;
        else bf -= t.amount;
      }
    });

    const filtered = transactions.filter(t => {
      if (t.account !== selectedAccount) return false;
      const d = new Date(t.date);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let mIn = 0, mOut = 0;
    filtered.forEach(t => {
      if (t.type === 'in') mIn += t.amount;
      else mOut += t.amount;
    });

    return { filteredTransactions: filtered, balanceBroughtForward: bf, closingBalance: bf + mIn - mOut, totalIn: mIn, totalOut: mOut };
  }, [transactions, selectedAccount, selectedMonth, selectedYear]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      <div className="relative bg-[#F8FAFC] w-full max-w-6xl h-full sm:h-[90vh] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        
        <div className="flex justify-between items-center px-10 py-8 border-b bg-white shrink-0">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-500/20">
              <ArrowRightLeft className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none">Penyata Bulanan</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">{selectedAccount}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all group active:scale-90">
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
          </button>
        </div>

        <div className="bg-white border-b border-slate-100 p-8 shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Pilih Akaun Firma</label>
              <div className="relative group">
                <Wallet className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 group-focus-within:scale-110 transition-transform" />
                <select className="w-full pl-14 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer" value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
                  {ACCOUNTS.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Bulan</label>
                <div className="relative group">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 group-focus-within:scale-110 transition-transform" />
                  <select className="w-full pl-14 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer" value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                    {MONTHS.map((m, i) => <option key={i} value={i}>{m.toUpperCase()}</option>)}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tahun</label>
                <select className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black tracking-widest text-slate-700 outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                  {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <button onClick={() => printAccountStatement(selectedAccount, MONTHS[selectedMonth], selectedYear, filteredTransactions, balanceBroughtForward)} className="w-full bg-[#5D57E7] hover:bg-[#4E48D6] text-white py-4.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all">
                <Printer className="w-5 h-5" /> Cetak Penyata Rasmi
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 bg-slate-50/50">
           <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-1 h-full bg-slate-400"></div>
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Baki B/F</p>
             <p className="text-xl font-black text-slate-800 mt-2 tabular-nums">{formatRM(balanceBroughtForward)}</p>
           </div>
           <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
             <p className="text-[9px] font-black text-emerald-600/70 uppercase tracking-widest flex items-center gap-1.5">
               <TrendingUp className="w-3.5 h-3.5" /> Total Kredit
             </p>
             <p className="text-xl font-black text-emerald-700 mt-2 tabular-nums">{formatRM(totalIn)}</p>
           </div>
           <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
             <p className="text-[9px] font-black text-rose-600/70 uppercase tracking-widest flex items-center gap-1.5">
               <TrendingDown className="w-3.5 h-3.5" /> Total Debit
             </p>
             <p className="text-xl font-black text-rose-700 mt-2 tabular-nums">{formatRM(totalOut)}</p>
           </div>
           <div className="bg-[#5D57E7] p-6 rounded-[2rem] shadow-indigo-500/20 shadow-xl text-white relative overflow-hidden">
             <CheckCircle2 className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12" />
             <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest">Baki Akhir</p>
             <p className="text-xl font-black mt-2 tabular-nums">{formatRM(closingBalance)}</p>
           </div>
        </div>

        <div className="flex-1 overflow-hidden px-10 pb-10">
           <div className="h-full border border-slate-200 rounded-[2.5rem] overflow-hidden bg-white shadow-inner flex flex-col">
              <div className="overflow-y-auto flex-1 no-scrollbar">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50/80 sticky top-0 backdrop-blur-md z-10 border-b">
                    <tr>
                      <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Tarikh</th>
                      <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Keterangan Transaksi</th>
                      <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Kredit (+)</th>
                      <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Debit (-)</th>
                      <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Baki Semasa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr className="bg-slate-50/40">
                       <td colSpan={2} className="px-8 py-6 text-[10px] font-black text-slate-400 italic uppercase tracking-widest">Baki Bawa Hadapan (Brought Forward)</td>
                       <td className="px-8 py-6 text-right">-</td>
                       <td className="px-8 py-6 text-right">-</td>
                       <td className="px-8 py-6 text-right font-black text-slate-900 text-sm tabular-nums">{formatRM(balanceBroughtForward)}</td>
                    </tr>
                    
                    {(() => {
                      let currentRunning = balanceBroughtForward;
                      return filteredTransactions.map(t => {
                        if (t.type === 'in') currentRunning += t.amount;
                        else currentRunning -= t.amount;
                        return (
                          <tr key={t.id} className="hover:bg-indigo-50/20 transition-colors group">
                            <td className="px-8 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">{formatDate(t.date)}</td>
                            <td className="px-8 py-8">
                              <div className="font-black text-slate-800 text-sm tracking-tight">{t.name}</div>
                              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t.details} <span className="text-indigo-400 ml-1 opacity-60">• {t.category}</span></div>
                            </td>
                            <td className="px-8 py-8 text-right font-black text-emerald-600 text-base tabular-nums">{t.type === 'in' ? formatRM(t.amount) : '—'}</td>
                            <td className="px-8 py-8 text-right font-black text-rose-600 text-base tabular-nums">{t.type === 'out' ? formatRM(t.amount) : '—'}</td>
                            <td className="px-8 py-8 text-right font-black text-slate-900 text-base tabular-nums">{formatRM(currentRunning)}</td>
                          </tr>
                        );
                      });
                    })()}

                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-32 text-center">
                          <div className="flex flex-col items-center gap-4 text-slate-300">
                            <Search className="w-12 h-12 opacity-10" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Tiada Data Ditemui</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AccountStatementModal;
