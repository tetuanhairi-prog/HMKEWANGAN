
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Scale, FileText, Download, Upload, RefreshCw,
  PlusCircle, Trash2, Printer, Copy, Search, AlertCircle, Pencil, Lock, LogOut,
  ArrowRightLeft, TrendingUp, TrendingDown, Check, Wallet, History,
  Layers, ChevronRight, Activity, Calendar as CalendarIcon, PieChart, Loader2, Cloud, CloudOff
} from 'lucide-react';
import { ACCOUNTS, MONTHS, Transaction, Invoice } from './types';
import { formatRM, formatDate, printReceipt } from './utils/printUtils';
import { supabase } from './supabase';

import TransactionFormModal from './components/TransactionFormModal';
import InvoiceModal from './components/InvoiceModal';
import ReportModal from './components/ReportModal';
import AccountStatementModal from './components/AccountStatementModal';
import DashboardCharts from './components/DashboardCharts';

const App: React.FC = () => {
  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('hma_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- Data State ---
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCloudConnected] = useState(!!supabase);

  // Filters
  const currentYear = new Date().getFullYear();
  const [filterYear, setFilterYear] = useState(currentYear);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterAccount, setFilterAccount] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'copy'>('create');
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showBackupAlert, setShowBackupAlert] = useState(false);

  // --- Data Fetching ---
  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      if (supabase) {
        const [transRes, invRes] = await Promise.all([
          supabase.from('transactions').select('*').order('date', { ascending: false }),
          supabase.from('invoices').select('*').order('date', { ascending: false })
        ]);

        if (transRes.error) throw transRes.error;
        if (invRes.error) throw invRes.error;

        setTransactions(transRes.data || []);
        setInvoices(invRes.data || []);
      } else {
        const localTrans = localStorage.getItem('hma_transactions');
        const localInvs = localStorage.getItem('hma_invoices');
        setTransactions(localTrans ? JSON.parse(localTrans) : []);
        setInvoices(localInvs ? JSON.parse(localInvs) : []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      const localTrans = localStorage.getItem('hma_transactions');
      const localInvs = localStorage.getItem('hma_invoices');
      setTransactions(localTrans ? JSON.parse(localTrans) : []);
      setInvoices(localInvs ? JSON.parse(localInvs) : []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (transactions.length > 0) localStorage.setItem('hma_transactions', JSON.stringify(transactions));
    if (invoices.length > 0) localStorage.setItem('hma_invoices', JSON.stringify(invoices));
  }, [transactions, invoices]);

  useEffect(() => {
    const lastBackup = localStorage.getItem('hma_last_backup');
    const now = Date.now();
    if (!lastBackup || (now - parseInt(lastBackup)) > 7 * 24 * 60 * 60 * 1000) {
      setShowBackupAlert(true);
    } else {
      setShowBackupAlert(false);
    }
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      const matchDate = d.getFullYear() === filterYear && d.getMonth() === filterMonth;
      const matchAcc = filterAccount === 'all' || t.account === filterAccount;
      const matchSearch = searchTerm === '' || 
        (t.name + t.details + t.account + t.category).toLowerCase().includes(searchTerm.toLowerCase());
      return matchDate && matchAcc && matchSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterYear, filterMonth, filterAccount, searchTerm]);

  const totals = useMemo(() => {
    let tIn = 0, tOut = 0;
    filteredTransactions.forEach(t => {
      if (t.type === 'in') tIn += t.amount;
      else tOut += t.amount;
    });
    return { in: tIn, out: tOut, bal: tIn - tOut };
  }, [filteredTransactions]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '025495') {
      setIsAuthenticated(true);
      sessionStorage.setItem('hma_auth', 'true');
      setLoginError('');
      setPasswordInput('');
    } else {
      setLoginError('Kata laluan tidak sah.');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('hma_auth');
  };

  const handleSaveTransaction = async (t: Omit<Transaction, 'id'>) => {
    const transactionId = modalMode === 'edit' && editingTransaction ? editingTransaction.id : Date.now();
    const newTransaction = { ...t, id: transactionId };

    try {
      if (supabase) {
        const { error } = await supabase.from('transactions').upsert(newTransaction);
        if (error) throw error;
      }
      
      if (modalMode === 'edit' && editingTransaction) {
        setTransactions(prev => prev.map(tr => tr.id === transactionId ? newTransaction : tr));
      } else {
        setTransactions(prev => [newTransaction, ...prev]);
      }
    } catch (error) {
      console.error(error);
      alert("Simpanan awan gagal. Data disimpan secara lokal.");
      setTransactions(prev => [newTransaction, ...prev.filter(tr => tr.id !== transactionId)]);
    } finally {
      setEditingTransaction(null);
      setModalMode('create');
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (confirm('Padam transaksi ini secara kekal?')) {
      try {
        if (supabase) {
          const { error } = await supabase.from('transactions').delete().eq('id', id);
          if (error) throw error;
        }
        setTransactions(prev => prev.filter(t => t.id !== id));
      } catch (error) {
        alert("Gagal memadam transaksi daripada awan.");
        setTransactions(prev => prev.filter(t => t.id !== id));
      }
    }
  };

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setModalMode('edit');
    setIsAddModalOpen(true);
  };

  const handleCopy = (t: Transaction) => {
    setEditingTransaction(t);
    setModalMode('copy');
    setIsAddModalOpen(true);
  };

  const handleAddInvoice = async (inv: Omit<Invoice, 'id' | 'status' | 'date'>) => {
    const newInv: Invoice = {
      ...inv,
      id: Date.now(),
      status: 'unpaid',
      date: new Date().toISOString().split('T')[0]
    };
    
    try {
      if (supabase) {
        const { error } = await supabase.from('invoices').insert(newInv);
        if (error) throw error;
      }
      setInvoices(prev => [newInv, ...prev]);
    } catch (error) {
      alert("Gagal menyimpan invois ke awan.");
      setInvoices(prev => [newInv, ...prev]);
    }
  };

  const handleDeleteInvoice = async (id: number) => {
    if (confirm('Padam invois ini secara kekal?')) {
      try {
        if (supabase) {
          const { error } = await supabase.from('invoices').delete().eq('id', id);
          if (error) throw error;
        }
        setInvoices(prev => prev.filter(inv => inv.id !== id));
      } catch (error) {
        alert("Gagal memadam invois.");
        setInvoices(prev => prev.filter(inv => inv.id !== id));
      }
    }
  };

  const handlePayInvoice = async (inv: Invoice) => {
    const transDate = new Date().toISOString().split('T')[0];
    const newTrans: Transaction = {
      id: Date.now(),
      date: transDate,
      type: 'in',
      account: "Akaun Pejabat",
      amount: inv.amount,
      name: inv.client,
      category: "Legal Fee",
      details: `Bayaran Invois: ${inv.no} - ${inv.desc}`
    };

    try {
      if (supabase) {
        const { error: invErr } = await supabase.from('invoices').update({ status: 'paid' }).eq('id', inv.id);
        if (invErr) throw invErr;
        const { error: transErr } = await supabase.from('transactions').insert(newTrans);
        if (transErr) throw transErr;
      }

      setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'paid' } : i));
      setTransactions(prev => [newTrans, ...prev]);
    } catch (error) {
      alert("Gagal memproses bayaran invois ke awan.");
      setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'paid' } : i));
      setTransactions(prev => [newTrans, ...prev]);
    }
  };

  const handleExport = () => {
    localStorage.setItem('hma_last_backup', Date.now().toString());
    setShowBackupAlert(false);
    
    const headers = ["Tarikh", "Nama", "Butir-butir", "In", "Out", "Katagori"];
    let csvContent = headers.join(",") + "\n";
    
    [...transactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(t => {
      const formattedDate = formatDate(t.date); 
      const row = [
        formattedDate,
        `"${t.name.replace(/"/g, '""')}"`,
        `"${t.details.replace(/"/g, '""')}"`,
        t.type === 'in' ? `"${t.amount.toFixed(2)}"` : "",
        t.type === 'out' ? `"${t.amount.toFixed(2)}"` : "",
        `"${t.category.replace(/"/g, '""')}"`
      ];
      csvContent += row.join(",") + "\n";
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `HMA_DATABASE_${formatDate(new Date()).replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const content = evt.target?.result as string;
        const lines = content.split(/\r?\n/).filter(line => line.trim() !== "");
        if (lines.length <= 1) return;

        const newTrans: Transaction[] = [];
        const baseId = Date.now();
        
        for (let i = 1; i < lines.length; i++) {
          const c = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          if (c.length < 5) continue;
          const cleanStr = (val: string) => (val || "").trim().replace(/^"|"$/g, '').replace(/""/g, '"');
          const cleanAmount = (val: string) => {
            if (!val) return NaN;
            const sanitized = val.replace(/RM/gi, '').replace(/,/g, '').trim();
            return parseFloat(sanitized);
          };
          const parseDateString = (dateStr: string) => {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              const d = parts[0].padStart(2, '0');
              const m = parts[1].padStart(2, '0');
              let y = parts[2];
              if (y.length === 2) y = `20${y}`;
              return `${y}-${m}-${d}`;
            }
            if (dateStr.includes('-')) {
               const isoParts = dateStr.split('-');
               if (isoParts[0].length === 4) return dateStr;
            }
            return null;
          };
          const parsedDate = parseDateString(cleanStr(c[0]));
          if (!parsedDate) continue;

          const inVal = cleanAmount(cleanStr(c[3]));
          const outVal = cleanAmount(cleanStr(c[4]));
          let type: 'in' | 'out' = isNaN(inVal) || inVal === 0 ? 'out' : 'in';
          let amount = type === 'in' ? inVal : outVal;

          newTrans.push({
            id: baseId + i,
            date: parsedDate,
            type,
            account: "Akaun Pejabat",
            amount: isNaN(amount) ? 0 : Math.abs(amount),
            name: cleanStr(c[1]),
            category: cleanStr(c[5]) || "Office",
            details: cleanStr(c[2])
          });
        }
        
        if (supabase) {
          const { error } = await supabase.from('transactions').insert(newTrans);
          if (error) throw error;
        }

        setTransactions(prev => [...newTrans, ...prev]);
        alert(`${newTrans.length} rekod berjaya diimport!`);
      } catch (err) {
        alert("Gagal membaca fail CSV.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A1128] flex flex-col items-center justify-center p-6 sm:p-4">
        <div className="bg-white p-12 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] w-full max-w-md animate-in fade-in zoom-in-95 border border-white/20">
          <div className="flex flex-col items-center mb-12">
            <div className="bg-gradient-to-tr from-[#5D57E7] to-[#8E89F2] p-8 rounded-[2.5rem] shadow-2xl mb-8 ring-[12px] ring-indigo-50">
              <Lock className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Sistem HMA</h1>
            <p className="text-slate-400 font-black mt-2 uppercase tracking-[0.3em] text-[10px]">Hairi Mustafa Associates</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Pengesahan Keselamatan</label>
              <input
                type="password"
                placeholder="••••••"
                className={`w-full bg-slate-50 border-2 rounded-[1.5rem] px-8 py-6 text-center text-2xl tracking-[0.5em] font-black outline-none transition-all ${loginError ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-[15px] focus:ring-indigo-500/5 text-slate-800'}`}
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setLoginError(''); }}
                autoFocus
              />
            </div>
            {loginError && <p className="text-center text-rose-600 text-[10px] font-black uppercase tracking-widest animate-pulse">{loginError}</p>}
            <button type="submit" className="w-full bg-[#5D57E7] hover:bg-[#4E48D6] text-white py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] transition-all shadow-2xl shadow-indigo-500/30 active:scale-[0.98]">Masuk Sistem</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F5F7F9] font-sans selection:bg-indigo-100 selection:text-indigo-700">
      <nav className="bg-[#0A1128] text-white shadow-[0_15px_50px_-15px_rgba(10,17,40,0.4)] z-40 flex-none px-8">
        <div className="max-w-7xl mx-auto h-24 flex items-center justify-between">
          <div className="flex items-center gap-5 group cursor-default">
            <div className="bg-indigo-600 p-3 rounded-[1.25rem] shadow-2xl shadow-indigo-500/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <Scale className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter uppercase leading-none">HMA Associates</h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] opacity-80">Legal Financial Cloud</p>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${isCloudConnected ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-50'}`}></div>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${isCloudConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isCloudConnected ? 'Connected' : 'Local Mode'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchData(true)} 
              className={`p-3.5 bg-slate-800/50 text-slate-300 hover:text-white rounded-[1rem] transition-all border border-slate-700/50 active:scale-95 shadow-sm mr-2 ${refreshing ? 'animate-spin text-indigo-400' : ''}`}
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex items-center gap-3 mr-4">
              <button onClick={() => setIsInvoiceModalOpen(true)} className="flex items-center gap-3 px-6 py-3.5 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-[1rem] border border-indigo-600/20 transition-all font-black uppercase text-[10px] tracking-widest active:scale-95 shadow-sm">
                <FileText className="w-4 h-4" /> Invois
              </button>
              <button onClick={() => setIsStatementModalOpen(true)} className="flex items-center gap-3 px-6 py-3.5 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-800 rounded-[1rem] transition-all border border-slate-700/50 font-black uppercase text-[10px] tracking-widest active:scale-95">
                <ArrowRightLeft className="w-4 h-4" /> Penyata
              </button>
              <button onClick={() => setIsReportModalOpen(true)} className="flex items-center gap-3 px-6 py-3.5 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-800 rounded-[1rem] transition-all border border-slate-700/50 font-black uppercase text-[10px] tracking-widest active:scale-95">
                <PieChart className="w-4 h-4" /> Laporan
              </button>
            </div>
            <div className="flex items-center gap-3 border-l border-white/10 pl-5">
              <button onClick={handleExport} className="p-3.5 bg-slate-800/50 text-slate-300 hover:text-white rounded-[1rem] transition-all border border-slate-700/50 active:scale-95 shadow-sm" title="Backup Database"><Download className="w-5 h-5" /></button>
              <label className="p-3.5 bg-slate-800/50 text-slate-300 hover:text-white rounded-[1rem] transition-all border border-slate-700/50 cursor-pointer active:scale-95 shadow-sm" title="Pulihkan Data">
                <Upload className="w-5 h-5" />
                <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
              </label>
              <button onClick={handleLogout} className="p-3.5 bg-rose-600/10 text-rose-400 hover:bg-rose-600 hover:text-white rounded-[1rem] transition-all border border-rose-600/20 ml-3 active:scale-95 shadow-sm" title="Log Keluar"><LogOut className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </nav>

      {showBackupAlert && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 shadow-2xl flex items-center justify-center gap-6 animate-in slide-in-from-top-full z-30">
          <div className="bg-white/20 p-2 rounded-lg animate-pulse">
            <AlertCircle className="w-5 h-5" strokeWidth={3} />
          </div>
          <span className="font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs">Sila buat salinan pangkalan data (Backup) hari ini.</span>
          <button onClick={handleExport} className="bg-white text-orange-600 px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-50 transition-all shadow-xl active:scale-95">Salin Sekarang</button>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-6 md:p-12 no-scrollbar">
        <div className="max-w-7xl mx-auto space-y-12 pb-32">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 bg-emerald-50 w-48 h-48 rounded-full group-hover:scale-125 transition-transform duration-1000 opacity-60"></div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><TrendingUp className="w-5 h-5" strokeWidth={3} /></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Terimaan Tunai</p>
                </div>
                <h2 className="text-5xl font-black text-emerald-600 tracking-tighter tabular-nums">{formatRM(totals.in)}</h2>
                <div className="mt-8 flex items-center gap-3">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 px-5 py-2 rounded-full border border-emerald-100">{MONTHS[filterMonth]} {filterYear}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 bg-rose-50 w-48 h-48 rounded-full group-hover:scale-125 transition-transform duration-1000 opacity-60"></div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl"><TrendingDown className="w-5 h-5" strokeWidth={3} /></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Perbelanjaan Kasar</p>
                </div>
                <h2 className="text-5xl font-black text-rose-600 tracking-tighter tabular-nums">{formatRM(totals.out)}</h2>
                <div className="mt-8 flex items-center gap-3">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-700 px-5 py-2 rounded-full border border-rose-100">{MONTHS[filterMonth]} {filterYear}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#5D57E7] to-[#4E48D6] p-10 rounded-[3.5rem] shadow-[0_30px_70px_-15px_rgba(93,87,231,0.5)] text-white relative overflow-hidden group">
               <div className="absolute -right-10 -bottom-10 bg-white/10 w-48 h-48 rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
               <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-white/20 text-white rounded-2xl backdrop-blur-md"><Wallet className="w-5 h-5" strokeWidth={3} /></div>
                  <p className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.3em]">Kecairan Semasa</p>
                </div>
                <h2 className="text-5xl font-black tracking-tighter tabular-nums">{formatRM(totals.bal)}</h2>
                <div className="mt-8 flex items-center gap-3">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 text-white px-5 py-2 rounded-full backdrop-blur-md border border-white/20">Baki Bersih</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Analytics Section */}
          {!loading && (
            <DashboardCharts 
              transactions={transactions} 
              year={filterYear} 
              month={filterMonth} 
            />
          )}

          {/* Filters & Actions Bar */}
          <div className="bg-white/90 backdrop-blur-3xl p-8 sm:p-10 rounded-[3.5rem] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.1)] border border-white/60 space-y-8 sticky top-6 z-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500 group-focus-within:scale-110 group-focus-within:rotate-12 transition-all"><Layers className="w-4.5 h-4.5" strokeWidth={2.5} /></div>
                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.25rem] px-16 py-5 font-black uppercase tracking-[0.2em] text-[10px] outline-none focus:border-indigo-500 focus:bg-white focus:ring-[15px] focus:ring-indigo-500/5 transition-all appearance-none cursor-pointer text-slate-700 shadow-inner" value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)}>
                  <option value="all">Semua Akaun Firma</option>
                  {ACCOUNTS.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
                </select>
                <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none rotate-90" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                   <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.25rem] px-8 py-5 font-black uppercase tracking-[0.2em] text-[10px] outline-none focus:border-indigo-500 focus:bg-white focus:ring-[15px] focus:ring-indigo-500/5 transition-all appearance-none cursor-pointer text-slate-700 shadow-inner" value={filterYear} onChange={(e) => setFilterYear(parseInt(e.target.value))}>
                    {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none rotate-90" />
                </div>
                <div className="relative group">
                  <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.25rem] px-8 py-5 font-black uppercase tracking-[0.2em] text-[10px] outline-none focus:border-indigo-500 focus:bg-white focus:ring-[15px] focus:ring-indigo-500/5 transition-all appearance-none cursor-pointer text-slate-700 shadow-inner" value={filterMonth} onChange={(e) => setFilterMonth(parseInt(e.target.value))}>
                    {MONTHS.map((m, i) => <option key={i} value={i}>{m.toUpperCase()}</option>)}
                  </select>
                  <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none rotate-90" />
                </div>
              </div>

              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"><Search className="w-4.5 h-4.5" strokeWidth={2.5} /></div>
                <input type="text" placeholder="CARI TRANSAKSI..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.25rem] px-16 py-5 text-[10px] font-black uppercase tracking-[0.25em] outline-none focus:border-indigo-500 focus:bg-white focus:ring-[15px] focus:ring-indigo-500/5 transition-all shadow-inner text-slate-800 placeholder:text-slate-300" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

            <button onClick={() => { setEditingTransaction(null); setModalMode('create'); setIsAddModalOpen(true); }} className="w-full bg-gradient-to-r from-[#5D57E7] to-[#4E48D6] hover:scale-[1.01] hover:shadow-[0_20px_60px_-10px_rgba(93,87,231,0.4)] text-white py-6 rounded-[1.75rem] shadow-2xl shadow-indigo-500/30 transition-all font-black uppercase tracking-[0.4em] text-[10px] flex items-center justify-center gap-4 active:scale-[0.98]">
              <PlusCircle className="w-6 h-6" strokeWidth={2.5} /> Tambah Rekod Kewangan Baru
            </button>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-[4rem] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.08)] border border-white overflow-hidden animate-in fade-in duration-1000 delay-300">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-48 gap-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" strokeWidth={3} />
                <p className="font-black text-slate-400 uppercase tracking-widest text-[11px]">Menyelaras Database...</p>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-[0.3em] border-b border-slate-100">
                    <tr>
                      <th className="px-12 py-10">Kronologi</th>
                      <th className="px-12 py-10">Butiran Transaksi</th>
                      <th className="px-12 py-10 text-right">Kredit (+)</th>
                      <th className="px-12 py-10 text-right">Debit (-)</th>
                      <th className="px-12 py-10 text-center">Katagori</th>
                      <th className="px-12 py-10 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50/50">
                    {filteredTransactions.map(t => (
                      <tr key={t.id} className="hover:bg-indigo-50/30 transition-all duration-500 group">
                        <td className="px-12 py-12">
                          <div className="flex items-center gap-4">
                             <div className={`w-3 h-3 rounded-full ${t.type === 'in' ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)]' : 'bg-rose-400 shadow-[0_0_15px_rgba(251,113,133,0.6)]'} group-hover:scale-125 transition-transform`}></div>
                             <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">{formatDate(t.date)}</span>
                          </div>
                        </td>
                        <td className="px-12 py-12">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 text-lg tracking-tight group-hover:text-indigo-600 transition-colors duration-300">{t.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] truncate max-w-[320px] mt-2 group-hover:text-slate-500">{t.details}</span>
                          </div>
                        </td>
                        <td className="px-12 py-12 text-right">
                          <span className={`font-black text-2xl tracking-tighter tabular-nums ${t.type === 'in' ? 'text-emerald-600' : 'text-slate-100'}`}>
                            {t.type === 'in' ? formatRM(t.amount) : '—'}
                          </span>
                        </td>
                        <td className="px-12 py-12 text-right">
                          <span className={`font-black text-2xl tracking-tighter tabular-nums ${t.type === 'out' ? 'text-rose-600' : 'text-slate-100'}`}>
                            {t.type === 'out' ? formatRM(t.amount) : '—'}
                          </span>
                        </td>
                        <td className="px-12 py-12 text-center">
                          <span className="px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 group-hover:shadow-lg group-hover:shadow-indigo-500/20 transition-all duration-500">
                            {t.category.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-12 py-12">
                          <div className="flex justify-center items-center gap-3 opacity-30 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-0 translate-x-4">
                            <button onClick={() => printReceipt(t)} className="w-12 h-12 flex items-center justify-center bg-white text-slate-500 hover:text-indigo-600 hover:shadow-2xl rounded-2xl transition-all border border-slate-100 active:scale-90" title="Cetak Resit"><Printer className="w-5.5 h-5.5" strokeWidth={2.5} /></button>
                            <button onClick={() => handleCopy(t)} className="w-12 h-12 flex items-center justify-center bg-white text-amber-500 hover:text-amber-600 hover:shadow-2xl rounded-2xl transition-all border border-slate-100 active:scale-90" title="Duplikasi"><Copy className="w-5.5 h-5.5" strokeWidth={2.5} /></button>
                            <button onClick={() => handleEdit(t)} className="w-12 h-12 flex items-center justify-center bg-white text-indigo-500 hover:text-indigo-600 hover:shadow-2xl rounded-2xl transition-all border border-slate-100 active:scale-90" title="Kemaskini"><Pencil className="w-5.5 h-5.5" strokeWidth={2.5} /></button>
                            <button onClick={() => handleDeleteTransaction(t.id)} className="w-12 h-12 flex items-center justify-center bg-white text-rose-500 hover:text-rose-600 hover:shadow-2xl rounded-2xl transition-all border border-slate-100 active:scale-90" title="Padam"><Trash2 className="w-5.5 h-5.5" strokeWidth={2.5} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-64 text-center">
                          <div className="flex flex-col items-center gap-8 text-slate-200">
                            <History className="w-24 h-24 opacity-10" strokeWidth={1} />
                            <p className="font-black uppercase tracking-[0.6em] text-[12px] opacity-40">ARKIB TRANSAKSI KOSONG</p>
                            <button onClick={() => { setEditingTransaction(null); setIsAddModalOpen(true); }} className="px-10 py-4 bg-slate-100 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest mt-4">Mulakan Rekod Pertama</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <TransactionFormModal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setEditingTransaction(null); setModalMode('create'); }} onSave={handleSaveTransaction} initialData={editingTransaction} mode={modalMode} />
      <InvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} invoices={invoices} onAddInvoice={handleAddInvoice} onDeleteInvoice={handleDeleteInvoice} onPayInvoice={handlePayInvoice} />
      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} transactions={transactions} year={filterYear} />
      <AccountStatementModal isOpen={isStatementModalOpen} onClose={() => setIsStatementModalOpen(false)} transactions={transactions} />
    </div>
  );
};

export default App;
