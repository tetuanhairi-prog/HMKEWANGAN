import React, { useState, useEffect, useMemo } from 'react';
import { 
  Scale, FileText, Table, Download, Upload, Power, 
  Filter, PlusCircle, Trash2, Printer, Copy, Search, AlertCircle, Pencil, Lock, LogOut,
  ArrowRightLeft, TrendingUp, TrendingDown, LayoutDashboard, Check, Wallet, History,
  Layers, ChevronRight, Activity
} from 'lucide-react';
import { ACCOUNTS, MONTHS, Transaction, Invoice } from './types';
import { formatRM, formatDate, printReceipt } from './utils/printUtils';

import TransactionFormModal from './components/TransactionFormModal';
import InvoiceModal from './components/InvoiceModal';
import ReportModal from './components/ReportModal';
import AccountStatementModal from './components/AccountStatementModal';

const App: React.FC = () => {
  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('hma_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- Data State ---
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('hma_db_trans');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('hma_db_invoices');
    return saved ? JSON.parse(saved) : [];
  });

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

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('hma_db_trans', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('hma_db_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    const lastBackup = localStorage.getItem('hma_last_backup');
    const now = Date.now();
    if (!lastBackup || (now - parseInt(lastBackup)) > 7 * 24 * 60 * 60 * 1000) {
      setShowBackupAlert(true);
    } else {
      setShowBackupAlert(false);
    }
  }, []);

  // --- Computed Data ---
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

  // --- Handlers ---
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

  const handleSaveTransaction = (t: Omit<Transaction, 'id'>) => {
    if (modalMode === 'edit' && editingTransaction) {
      setTransactions(prev => prev.map(tr => 
        tr.id === editingTransaction.id ? { ...t, id: editingTransaction.id } : tr
      ));
    } else {
      const newTrans = { ...t, id: Date.now() };
      setTransactions(prev => [newTrans, ...prev]);
    }
    setEditingTransaction(null);
    setModalMode('create');
  };

  const handleDeleteTransaction = (id: number) => {
    if (confirm('Padam transaksi ini secara kekal?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
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

  const handleAddInvoice = (inv: Omit<Invoice, 'id' | 'status' | 'date'>) => {
    const newInv: Invoice = {
      ...inv,
      id: Date.now(),
      status: 'unpaid',
      date: new Date().toISOString().split('T')[0]
    };
    setInvoices(prev => [newInv, ...prev]);
  };

  const handleDeleteInvoice = (id: number) => {
    if (confirm('Padam invois ini secara kekal?')) {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    }
  };

  const handlePayInvoice = (inv: Invoice) => {
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'paid' } : i));
    const newTrans: Transaction = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: 'in',
      account: "Akaun Pejabat",
      amount: inv.amount,
      name: inv.client,
      category: "Legal Fee",
      details: `Bayaran Invois: ${inv.no} - ${inv.desc}`
    };
    setTransactions(prev => [newTrans, ...prev]);
  };

  const handleExport = () => {
    localStorage.setItem('hma_last_backup', Date.now().toString());
    setShowBackupAlert(false);
    
    const headers = ["Tarikh", "Nama", "Butir-butir", "In", "Out", "Katagori"];
    let csvContent = headers.join(",") + "\n";
    
    // Sort transactions by date ascending for the export
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

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
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
            // dd/mm/yyyy
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              const d = parts[0].padStart(2, '0');
              const m = parts[1].padStart(2, '0');
              let y = parts[2];
              if (y.length === 2) y = `20${y}`;
              return `${y}-${m}-${d}`;
            }
            // yyyy-mm-dd
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
        setTransactions(prev => [...newTrans, ...prev]);
        alert(`${newTrans.length} rekod berjaya diimport!`);
      } catch (err) {
        alert("Gagal membaca fail CSV. Pastikan format adalah betul.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A1128] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 border border-slate-200">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-gradient-to-tr from-indigo-600 to-indigo-400 p-6 rounded-[2.5rem] shadow-xl mb-6 ring-8 ring-indigo-50">
              <Lock className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sistem HMA</h1>
            <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">Hairi Mustafa Associates</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative group">
              <input
                type="password"
                placeholder="Kata Laluan"
                className={`w-full bg-slate-50 border-2 rounded-2xl px-6 py-5 text-center text-xl tracking-[0.4em] font-black outline-none transition-all ${loginError ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-8 focus:ring-indigo-500/10 text-slate-800'}`}
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setLoginError(''); }}
                autoFocus
              />
            </div>
            {loginError && <p className="text-center text-rose-600 text-[10px] font-black uppercase tracking-widest animate-pulse">{loginError}</p>}
            <button type="submit" className="w-full bg-[#5D57E7] hover:bg-[#4E48D6] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl active:scale-[0.98]">Masuk Sekarang</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F0F2F5] font-sans selection:bg-indigo-100 selection:text-indigo-700">
      <nav className="bg-[#0A1128] text-white shadow-2xl z-40 flex-none px-6">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-default">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-indigo-500/30 shadow-lg group-hover:scale-110 transition-transform">
              <Scale className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tighter uppercase leading-none">Hairi Mustafa Associates</h1>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1 opacity-80">Legal Management System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 mr-4">
              <button onClick={() => setIsInvoiceModalOpen(true)} className="p-2.5 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 rounded-xl border border-indigo-600/10 transition-all active:scale-95" title="Invois"><FileText className="w-5 h-5" /></button>
              <button onClick={() => setIsStatementModalOpen(true)} className="p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700 active:scale-95" title="Penyata"><ArrowRightLeft className="w-5 h-5" /></button>
              <button onClick={() => setIsReportModalOpen(true)} className="p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700 active:scale-95" title="Laporan"><Table className="w-5 h-5" /></button>
            </div>
            <div className="h-8 w-px bg-white/10 mx-2 hidden lg:block"></div>
            <div className="flex items-center gap-2">
              <button onClick={handleExport} className="p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700 active:scale-95" title="Export CSV"><Download className="w-5 h-5" /></button>
              <label className="p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700 cursor-pointer active:scale-95" title="Import CSV">
                <Upload className="w-5 h-5" />
                <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
              </label>
              <button onClick={() => { if(confirm("Hapus semua data secara kekal?")) { setTransactions([]); setInvoices([]); } }} className="p-2.5 bg-rose-600/10 text-rose-500 hover:bg-rose-600/20 rounded-xl border border-rose-600/10 transition-all active:scale-95" title="Reset Data"><Power className="w-5 h-5" /></button>
              <button onClick={handleLogout} className="p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700 ml-2 active:scale-95" title="Log Keluar"><LogOut className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </nav>

      {showBackupAlert && (
        <div className="bg-[#F59E0B] text-white px-6 py-3 shadow-lg flex items-center justify-center gap-4 animate-in slide-in-from-top-4 z-30">
          <AlertCircle className="w-5 h-5 animate-bounce" />
          <span className="font-black uppercase tracking-widest text-[10px] sm:text-xs">Sila buat 'Backup' data (Eksport CSV) hari ini.</span>
          <button onClick={handleExport} className="bg-white text-[#F59E0B] px-6 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-amber-50 transition-colors shadow-sm">Backup Sekarang</button>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar">
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
          
          {/* Dashboard Summary Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-white/60 relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 bg-emerald-50 w-40 h-40 rounded-full group-hover:scale-125 transition-transform duration-700 opacity-60"></div>
              <div className="relative">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" /> Terimaan (In)
                </p>
                <h2 className="text-4xl font-black text-emerald-600 tracking-tighter tabular-nums">{formatRM(totals.in)}</h2>
                <div className="mt-6 flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full">{MONTHS[filterMonth]} {filterYear}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-white/60 relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 bg-rose-50 w-40 h-40 rounded-full group-hover:scale-125 transition-transform duration-700 opacity-60"></div>
              <div className="relative">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-rose-500" /> Perbelanjaan (Out)
                </p>
                <h2 className="text-4xl font-black text-rose-600 tracking-tighter tabular-nums">{formatRM(totals.out)}</h2>
                <div className="mt-6 flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-rose-100 text-rose-700 px-4 py-1.5 rounded-full">{MONTHS[filterMonth]} {filterYear}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#5D57E7] p-8 rounded-[3rem] shadow-[0_20px_40px_-10px_rgba(93,87,231,0.4)] text-white relative overflow-hidden group">
               <div className="absolute -right-6 -bottom-6 bg-white/10 w-40 h-40 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
               <div className="relative">
                <p className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> Baki Bersih
                </p>
                <h2 className="text-4xl font-black tracking-tighter tabular-nums">{formatRM(totals.bal)}</h2>
                <div className="mt-6 flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 text-white px-4 py-1.5 rounded-full backdrop-blur-md">Status Akaun</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Filters & Action Bar */}
          <div className="bg-white/80 backdrop-blur-2xl p-6 sm:p-8 rounded-[3rem] shadow-2xl border border-white/40 space-y-6 sticky top-4 z-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500 group-focus-within:scale-110 transition-transform"><Layers className="w-4 h-4" /></div>
                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-14 py-4 font-black uppercase tracking-widest text-[10px] outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer" value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)}>
                  <option value="all">Semua Akaun</option>
                  {ACCOUNTS.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer" value={filterYear} onChange={(e) => setFilterYear(parseInt(e.target.value))}>
                  {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer" value={filterMonth} onChange={(e) => setFilterMonth(parseInt(e.target.value))}>
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"><Search className="w-4 h-4" /></div>
                <input type="text" placeholder="CARI TRANSAKSI..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-14 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

            <button onClick={() => { setEditingTransaction(null); setModalMode('create'); setIsAddModalOpen(true); }} className="w-full bg-[#5D57E7] hover:bg-[#4E48D6] text-white py-5 rounded-[1.5rem] shadow-2xl shadow-indigo-500/30 transition-all font-black uppercase tracking-[0.35em] text-[10px] flex items-center justify-center gap-3 active:scale-[0.98]">
              <PlusCircle className="w-5 h-5" /> Tambah Rekod Transaksi Baru
            </button>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-[3rem] shadow-2xl border border-white overflow-hidden animate-in fade-in duration-700 delay-200">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                <thead className="bg-slate-50/80 backdrop-blur-md text-slate-400 uppercase text-[10px] font-black tracking-[0.2em] border-b border-slate-100">
                  <tr>
                    <th className="px-10 py-8">Tarikh</th>
                    <th className="px-10 py-8">Nama / Butiran</th>
                    <th className="px-10 py-8 text-right">In (RM)</th>
                    <th className="px-10 py-8 text-right">Out (RM)</th>
                    <th className="px-10 py-8 text-center">Katagori</th>
                    <th className="px-10 py-8 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-indigo-50/40 transition-all duration-300 group">
                      <td className="px-10 py-10">
                        <div className="flex items-center gap-3">
                           <div className={`w-2.5 h-2.5 rounded-full ${t.type === 'in' ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.5)]'}`}></div>
                           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{formatDate(t.date)}</span>
                        </div>
                      </td>
                      <td className="px-10 py-10">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 text-sm tracking-tight group-hover:text-indigo-600 transition-colors">{t.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate max-w-[280px] mt-1">{t.details}</span>
                        </div>
                      </td>
                      <td className="px-10 py-10 text-right">
                        <span className={`font-black text-xl tracking-tighter tabular-nums ${t.type === 'in' ? 'text-emerald-600' : 'text-slate-200'}`}>
                          {t.type === 'in' ? formatRM(t.amount) : '—'}
                        </span>
                      </td>
                      <td className="px-10 py-10 text-right">
                        <span className={`font-black text-xl tracking-tighter tabular-nums ${t.type === 'out' ? 'text-rose-600' : 'text-slate-200'}`}>
                          {t.type === 'out' ? formatRM(t.amount) : '—'}
                        </span>
                      </td>
                      <td className="px-10 py-10 text-center">
                        <span className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                          {t.category.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-10 py-10">
                        <div className="flex justify-center items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => printReceipt(t)} className="w-11 h-11 flex items-center justify-center bg-slate-50 text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-lg rounded-2xl transition-all border border-slate-100 active:scale-90" title="Cetak Resit"><Printer className="w-5 h-5" /></button>
                          <button onClick={() => handleCopy(t)} className="w-11 h-11 flex items-center justify-center bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white hover:shadow-lg rounded-2xl transition-all border border-amber-100 active:scale-90" title="Salin"><Copy className="w-5 h-5" /></button>
                          <button onClick={() => handleEdit(t)} className="w-11 h-11 flex items-center justify-center bg-indigo-50 text-indigo-500 hover:bg-indigo-600 hover:text-white hover:shadow-lg rounded-2xl transition-all border border-indigo-100 active:scale-90" title="Edit"><Pencil className="w-5 h-5" /></button>
                          <button onClick={() => handleDeleteTransaction(t.id)} className="w-11 h-11 flex items-center justify-center bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white hover:shadow-lg rounded-2xl transition-all border border-rose-100 active:scale-90" title="Hapus"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-40 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-300">
                          <History className="w-16 h-16 opacity-10" />
                          <p className="font-black uppercase tracking-[0.4em] text-[10px] opacity-40">TIADA REKOD TRANSAKSI</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <TransactionFormModal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setEditingTransaction(null); setModalMode('create'); }} onSave={handleSaveTransaction} initialData={editingTransaction} mode={modalMode} />
      <InvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} invoices={invoices} onAddInvoice={handleAddInvoice} onDeleteInvoice={handleDeleteInvoice} onPayInvoice={handlePayInvoice} />
      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} transactions={transactions} year={filterYear} />
      <AccountStatementModal isOpen={isStatementModalOpen} onClose={() => setIsStatementModalOpen(false)} transactions={transactions} />
    </div>
  );
};

export default App;