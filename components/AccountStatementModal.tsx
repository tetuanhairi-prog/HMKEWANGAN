import React, { useState, useMemo } from 'react';
import { X, Printer, Search, Wallet, Calendar, ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react';
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
    // 1. Calculate Balance Brought Forward (all transactions for this account BEFORE this month/year)
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

    // 2. Filter transactions for the current selection
    const filtered = transactions.filter(t => {
      if (t.account !== selectedAccount) return false;
      const d = new Date(t.date);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 3. Totals for current month
    let mIn = 0, mOut = 0;
    filtered.forEach(t => {
      if (t.type === 'in') mIn += t.amount;
      else mOut += t.amount;
    });

    return {
      filteredTransactions: filtered,
      balanceBroughtForward: bf,
      closingBalance: bf + mIn - mOut,
      totalIn: mIn,
      totalOut: mOut
    };
  }, [transactions, selectedAccount, selectedMonth, selectedYear]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-5xl h-full sm:h-[90vh] sm:rounded-3xl shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden border border-white/20">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b bg-indigo-600 text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white/20 rounded-xl">
               <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl font-black uppercase tracking-tight">Penyata Akaun</p>
              <p className="text-xs font-bold text-indigo-100/80 uppercase tracking-widest">Monthly Account Statement</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all group">
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Filters Area */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-6 shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Pilih Akaun</label>
              <div className="relative group">
                <Wallet className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <select 
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                >
                  {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Bulan</label>
                <div className="relative group">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <select 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  >
                    {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Tahun</label>
                <select 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <button 
                onClick={() => printAccountStatement(selectedAccount, MONTHS[selectedMonth], selectedYear, filteredTransactions, balanceBroughtForward)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
              >
                <Printer className="w-4 h-4" /> Cetak Penyata Rasmi
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 shrink-0 bg-white">
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Baki Bawa Hadapan</p>
             <p className="text-lg font-bold text-slate-700 mt-1">{formatRM(balanceBroughtForward)}</p>
           </div>
           <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
             <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest flex items-center gap-1">
               <TrendingUp className="w-3 h-3" /> Total Masuk
             </p>
             <p className="text-lg font-bold text-emerald-700 mt-1">{formatRM(totalIn)}</p>
           </div>
           <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
             <p className="text-[10px] font-black text-rose-600/70 uppercase tracking-widest flex items-center gap-1">
               <TrendingDown className="w-3 h-3" /> Total Keluar
             </p>
             <p className="text-lg font-bold text-rose-700 mt-1">{formatRM(totalOut)}</p>
           </div>
           <div className="bg-indigo-600 p-4 rounded-2xl shadow-indigo-100 shadow-xl text-white">
             <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Baki Akhir</p>
             <p className="text-lg font-bold mt-1">{formatRM(closingBalance)}</p>
           </div>
        </div>

        {/* Transactions Table */}
        <div className="flex-1 overflow-hidden px-4 sm:px-6 pb-6">
           <div className="h-full border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-inner flex flex-col">
              <div className="overflow-y-auto flex-1 no-scrollbar">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-100/80 sticky top-0 backdrop-blur-md z-10">
                    <tr>
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Tarikh</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Butiran Transaksi</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">Masuk (CR)</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">Keluar (DR)</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">Baki</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Baki Bawa Hadapan Row */}
                    <tr className="bg-slate-50/50">
                       <td colSpan={2} className="p-4 text-xs font-bold text-slate-500 italic">Baki Bawa Hadapan (B/F)</td>
                       <td className="p-4 text-right">-</td>
                       <td className="p-4 text-right">-</td>
                       <td className="p-4 text-right font-bold text-slate-800 text-xs">{formatRM(balanceBroughtForward)}</td>
                    </tr>
                    
                    {(() => {
                      let currentRunning = balanceBroughtForward;
                      return filteredTransactions.map(t => {
                        if (t.type === 'in') currentRunning += t.amount;
                        else currentRunning -= t.amount;
                        
                        return (
                          <tr key={t.id} className="hover:bg-indigo-50/30 transition-colors">
                            <td className="p-4 text-xs font-mono text-slate-500">{formatDate(t.date)}</td>
                            <td className="p-4">
                              <div className="font-bold text-slate-800">{t.name}</div>
                              <div className="text-[10px] text-slate-500 font-medium">{t.details} <span className="text-indigo-400">• {t.category}</span></div>
                            </td>
                            <td className="p-4 text-right font-bold text-emerald-600">{t.type === 'in' ? formatRM(t.amount) : '-'}</td>
                            <td className="p-4 text-right font-bold text-rose-600">{t.type === 'out' ? formatRM(t.amount) : '-'}</td>
                            <td className="p-4 text-right font-bold text-slate-700 text-xs">{formatRM(currentRunning)}</td>
                          </tr>
                        );
                      });
                    })()}

                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-300">
                            <Search className="w-8 h-8 opacity-20" />
                            <p className="text-sm italic font-medium">Tiada transaksi direkodkan untuk tempoh ini.</p>
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
