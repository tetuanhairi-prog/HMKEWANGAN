
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, TooltipProps
} from 'recharts';
import { Transaction, MONTHS, CATEGORIES } from '../types';
import { formatRM } from '../utils/printUtils';

interface Props {
  transactions: Transaction[];
  year: number;
  month: number;
}

const COLORS = [
  '#5D57E7', '#10B981', '#F59E0B', '#EF4444', 
  '#EC4899', '#8B5CF6', '#06B6D4', '#6366F1'
];

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b pb-1">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{entry.name}</span>
              </span>
              <span className="text-sm font-black text-slate-900 tabular-nums">
                {formatRM(entry.value || 0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const DashboardCharts: React.FC<Props> = ({ transactions, year, month }) => {
  // 1. Data untuk Carta Aliran Tunai (Tahunan)
  const cashFlowData = MONTHS.map((name, index) => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getFullYear() === year && d.getMonth() === index) {
        if (t.type === 'in') income += t.amount;
        else expense += t.amount;
      }
    });
    return { name: name.substring(0, 3).toUpperCase(), Terimaan: income, Belanja: expense };
  });

  // 2. Data untuk Carta Pecahan Perbelanjaan (Bulanan)
  const expenseDataMap: { [key: string]: number } = {};
  transactions.forEach(t => {
    const d = new Date(t.date);
    if (d.getFullYear() === year && d.getMonth() === month && t.type === 'out') {
      expenseDataMap[t.category] = (expenseDataMap[t.category] || 0) + t.amount;
    }
  });

  const expensePieData = Object.keys(expenseDataMap).map(cat => ({
    name: cat,
    value: expenseDataMap[cat]
  })).sort((a, b) => b.value - a.value).slice(0, 6); // Ambil top 6 kategori

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Carta Aliran Tunai */}
      <div className="bg-white p-10 rounded-[3.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white flex flex-col h-[450px]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Prestasi Tunai {year}</h3>
            <p className="text-xl font-black text-slate-900 tracking-tighter">Carta Aliran Tunai Tahunan</p>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 rounded-full bg-[#5D57E7]"></div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">In</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Out</span>
             </div>
          </div>
        </div>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 900, fill: '#94A3B8' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 900, fill: '#94A3B8' }} 
              />
              <Tooltip cursor={{ fill: '#F8FAFC' }} content={<CustomTooltip />} />
              <Bar 
                dataKey="Terimaan" 
                fill="#5D57E7" 
                radius={[6, 6, 0, 0]} 
                barSize={12} 
                animationDuration={1500}
              />
              <Bar 
                dataKey="Belanja" 
                fill="#EF4444" 
                radius={[6, 6, 0, 0]} 
                barSize={12} 
                animationDuration={1500}
                animationBegin={300}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Carta Pecahan Perbelanjaan */}
      <div className="bg-white p-10 rounded-[3.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white flex flex-col h-[450px]">
        <div className="mb-8">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Analisis Perbelanjaan {MONTHS[month].toUpperCase()}</h3>
          <p className="text-xl font-black text-slate-900 tracking-tighter">Pecahan Mengikut Kategori</p>
        </div>
        <div className="flex-1 w-full flex flex-col sm:flex-row items-center justify-center">
          <div className="w-full sm:w-1/2 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {expensePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={4} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full sm:w-1/2 space-y-3 pl-4">
             {expensePieData.map((entry, index) => (
               <div key={index} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[120px] group-hover:text-slate-900 transition-colors">{entry.name}</span>
                  </div>
                  <span className="text-[11px] font-black text-slate-900 tabular-nums">{formatRM(entry.value)}</span>
               </div>
             ))}
             {expensePieData.length === 0 && (
               <div className="flex flex-col items-center justify-center h-full py-12 text-slate-200">
                  <PieChart className="w-12 h-12 mb-4 opacity-10" />
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40 text-center">Tiada perbelanjaan direkodkan</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
