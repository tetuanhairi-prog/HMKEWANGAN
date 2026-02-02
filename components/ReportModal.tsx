import React from 'react';
import { X, Printer } from 'lucide-react';
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
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b bg-purple-50 rounded-t-2xl">
          <p className="text-lg font-bold text-purple-800">Laporan Untung Rugi Tahunan</p>
          <button onClick={onClose} className="p-2 hover:bg-purple-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-purple-800" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between mb-6 items-center">
            <h3 className="text-2xl font-bold text-gray-800">Tahun {year}</h3>
            <button 
              onClick={() => printYearlyReport(year, transactions)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <Printer className="w-4 h-4" /> Cetak Laporan
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-800 text-white font-bold">
                <tr>
                  <th className="p-4">Bulan</th>
                  <th className="p-4 text-right">Pendapatan (Masuk)</th>
                  <th className="p-4 text-right">Perbelanjaan (Keluar)</th>
                  <th className="p-4 text-right">Untung/Rugi Bersih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-gray-700">
                {monthlyData.map((m, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900 font-sans">{m.name}</td>
                    <td className="p-4 text-right text-emerald-600 font-bold">{formatRM(m.in)}</td>
                    <td className="p-4 text-right text-rose-600 font-bold">{formatRM(m.out)}</td>
                    <td className={`p-4 text-right font-bold ${m.net < 0 ? 'text-rose-600' : 'text-indigo-600'}`}>
                      {formatRM(m.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-200">
                <tr>
                  <td className="p-4">JUMLAH BESAR</td>
                  <td className="p-4 text-right text-emerald-600">{formatRM(grandTotalIn)}</td>
                  <td className="p-4 text-right text-rose-600">{formatRM(grandTotalOut)}</td>
                  <td className="p-4 text-right text-indigo-700">{formatRM(grandTotalIn - grandTotalOut)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center italic">* Laporan ini merangkumi semua akaun yang didaftarkan dalam sistem.</p>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;