import React, { useState, useMemo } from 'react';
import { X, Printer, Search, Wallet, Calendar, ArrowRightLeft, TrendingUp, TrendingDown, ChevronDown, CheckCircle2, FileText, Info } from 'lucide-react';
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
    }).sort((a, b) => new Date(a.date).getTime() - new Date(a.date).getTime());

    let mIn = 0, mOut = 0;
    filtered.forEach(t => {
      if (t.type === 'in') mIn += t.amount;
      else mOut += t.amount;
    });

    return { filteredTransactions: filtered, balanceBroughtForward: bf, closingBalance: bf + mIn - mOut, totalIn: mIn, totalOut: mOut };
  }, [transactions, selectedAccount, selectedMonth, selectedYear]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-[#F5F7F9] w-full max-w-6xl h-full sm:h-[90vh] sm:rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-12 duration-500">
        
        {/* Header Area */}
        <div className="flex justify-between items-center px-12 py-10 border-b bg-white shrink-0">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/30">
              <ArrowRightLeft className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none">Penyata Akaun Bulanan</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{selectedAccount}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">• {MONTHS[selectedMonth]} {selectedYear}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end px-8 border-r-2 border-slate-100 mr-2">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Baki Bawa Hadapan</span>
               <span className="text-2xl font-black text-amber-600 tabular-nums tracking-tighter">{formatRM(balanceBroughtForward)}</span>
            </div>
            <button onClick={onClose} className="p-4 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all group active:scale-90">
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white border-b border-slate-100 p-10 shrink-0 shadow-sm z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2">Pilih Akaun</label>
              <div className="relative group">
                <Wallet className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 group-focus-within:rotate-12 transition-transform" strokeWidth={2.5} />
                <select className="w-full pl-16 pr-12 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer shadow-inner" value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
                  {ACCOUNTS.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2">Bulan</label>
                <div className="relative group">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 group-focus-within:rotate-12 transition-transform" strokeWidth={2.5} />
                  <select className="w-full pl-16 pr-12 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer shadow-inner" value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                    {MONTHS.map((m, i) => <option key={i} value={i}>{m.toUpperCase()}</option>)}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2">Tahun</label>
                <div className="relative group">
                   <select className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black tracking-widest text-slate-700 outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer shadow-inner" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                    {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                </div>
              </div>
            </div>

            <button onClick={() => printAccountStatement(selectedAccount, MONTHS[selectedMonth], selectedYear, filteredTransactions, balanceBroughtForward)} className="w-full bg-[#5D57E7] hover:bg-[#4E48D6] text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all">
              <Printer className="w-5.5 h-5.5" strokeWidth={2.5} /> Cetak Penyata Rasmi
            </button>
          </div>
        </div>

        {/* Dynamic Summary Cards */}
        <div className="p-10 grid grid-cols-2 lg:grid-cols-4 gap-6 shrink-0 bg-slate-50/50">
           <div className="bg-white p-8 rounded-[2.5rem] border-2 border-amber-100 shadow-xl shadow-amber-500/5 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
             <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Baki B/F</p>
             <p className="text-3xl font-black text-amber-700 mt-3 tabular-nums tracking-tighter">{formatRM(balanceBroughtForward)}</p>
           </div>
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/50 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
             <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest flex items-center gap-2">
               <TrendingUp className="w-4 h-4" strokeWidth={3} /> Kredit (+)
             </p>
             <p className="text-2xl font-black text-emerald-700 mt-3 tabular-nums">{formatRM(totalIn)}</p>
           </div>
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/50 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-2 h-full bg-rose-500"></div>
             <p className="text-[10px] font-black text-rose-600/70 uppercase tracking-widest flex items-center gap-2">
               <TrendingDown className="w-4 h-4" strokeWidth={3} /> Debit (-)
             </p>
             <p className="text-2xl font-black text-rose-700 mt-3 tabular-nums">{formatRM(totalOut)}</p>
           </div>
           <div className="bg-[#5D57E7] p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/30 text-white relative overflow-hidden group">
             <CheckCircle2 className="absolute -right-6 -bottom-6 w-28 h-28 opacity-10 rotate-12 transition-transform duration-1000 group-hover:rotate-45" />
             <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">Baki Akhir</p>
             <p className="text-2xl font-black mt-3 tabular-nums tracking-tighter">{formatRM(closingBalance)}</p>
           </div>
        </div>

        {/* Ledger View */}
        <div className="flex-1 overflow-hidden px-12 pb-12">
           <div className="h-full border border-slate-200 rounded-[3rem] overflow-hidden bg-white shadow-2xl flex flex-col border border-white">
              <div className="overflow-y-auto flex-1 no-scrollbar">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50/80 sticky top-0 backdrop-blur-md z-10 border-b border-slate-100">
                    <tr>
                      <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kronologi</th>
                      <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Butiran Transaksi</th>
                      <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Masuk (+)</th>
                      <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Keluar (-)</th>
                      <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Baki</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {/* B/F Row */}
                    <tr className="bg-slate-50/30">
                       <td className="px-10 py-8 flex items-center gap-3">
                         <div className="w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                         <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest">Mula</span>
                       </td>
                       <td className="px-10 py-8">
                         <div className="flex items-center gap-2">
                           <Info className="w-4 h-4 text-amber-400" />
                           <span className="text-[11px] font-black text-amber-600 italic uppercase tracking-widest">Baki Bawa Hadapan (Brought Forward)</span>
                         </div>
                       </td>
                       <td className="px-10 py-8 text-right text-slate-100">—</td>
                       <td className="px-10 py-8 text-right text-slate-100">—</td>
                       <td className="px-10 py-8 text-right font-black text-amber-700 text-lg tabular-nums tracking-tight">{formatRM(balanceBroughtForward)}</td>
                    </tr>
                    
                    {(() => {
                      let currentRunning = balanceBroughtForward;
                      return filteredTransactions.map(t => {
                        if (t.type === 'in') currentRunning += t.amount;
                        else currentRunning -= t.amount;
                        return (
                          <tr key={t.id} className="hover:bg-indigo-50/30 transition-all duration-300 group">
                            <td className="px-10 py-10">
                              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{formatDate(t.date)}</span>
                            </td>
                            <td className="px-10 py-10">
                              <div className="font-black text-slate-900 text-base tracking-tight group-hover:text-indigo-600 transition-colors">{t.name}</div>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60 group-hover:opacity-100">{t.details}</span>
                                <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">• {t.category}</span>
                              </div>
                            </td>
                            <td className="px-10 py-10 text-right font-black text-emerald-600 text-xl tabular-nums tracking-tighter">{t.type === 'in' ? formatRM(t.amount) : '—'}</td>
                            <td className="px-10 py-10 text-right font-black text-rose-600 text-xl tabular-nums tracking-tighter">{t.type === 'out' ? formatRM(t.amount) : '—'}</td>
                            <td className="px-10 py-10 text-right font-black text-slate-900 text-xl tabular-nums tracking-tighter">{formatRM(currentRunning)}</td>
                          </tr>
                        );
                      });
                    })()}

                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-48 text-center">
                          <div className="flex flex-col items-center gap-8 text-slate-200">
                            <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100">
                              <Search className="w-16 h-16 opacity-10" strokeWidth={1} />
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-[0.5em] opacity-40">TIADA REKOD DITEMUI</p>
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