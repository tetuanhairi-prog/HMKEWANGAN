import React, { useState, useEffect, useMemo } from 'react';
import { 
  Scale, FileText, Table, Download, Upload, Power, 
  Filter, PlusCircle, Trash2, Printer, Copy, Search, AlertCircle, Pencil, Lock, LogOut,
  ArrowRightLeft, TrendingUp, TrendingDown, LayoutDashboard
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
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
      setTransactions(prev => [...prev, newTrans]);
    }
    setEditingTransaction(null);
    setModalMode('create');
  };

  const handleDeleteTransaction = (id: number) => {
    if (confirm('Padam transaksi ini?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setModalMode('edit');
    setIsAddModalOpen(true);
  };

  const handleAddInvoice = (inv: Omit<Invoice, 'id' | 'status' | 'date'>) => {
    const newInv: Invoice = {
      ...inv,
      id: Date.now(),
      status: 'unpaid',
      date: new Date().toISOString().split('T')[0]
    };
    setInvoices(prev => [...prev, newInv]);
  };

  const handleDeleteInvoice = (id: number) => {
    if (confirm('Padam invois ini?')) {
      setInvoices(prev => prev.filter(i => i.id !== id));
    }
  };

  const handlePayInvoice = (inv: Invoice) => {
    if (confirm(`Adakah ${inv.client} sudah membuat bayaran RM${inv.amount}?`)) {
      setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'paid' } : i));
      const newTrans: Transaction = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        type: 'in',
        account: 'Akaun Pejabat',
        amount: inv.amount,
        name: inv.client,
        category: 'Fee',
        details: `Bayaran Invois: ${inv.no}`
      };
      setTransactions(prev => [...prev, newTrans]);
    }
  };

  const handleExport = () => {
    localStorage.setItem('hma_last_backup', Date.now().toString());
    setShowBackupAlert(false);
    
    // Header format from image
    const headers = ["Tarikh", "Nama", "Butir-butir", "In", "Out", "Katagori"];
    let csvContent = headers.join(",") + "\n";
    
    transactions.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(t => {
      const dateParts = t.date.split('-');
      const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
      
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
    link.setAttribute("download", `REKOD_PETTY_CASH_${MONTHS[filterMonth].toUpperCase()}_${filterYear}.csv`);
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
        if (lines.length < 1) {
          alert("Fail kosong atau tidak sah.");
          return;
        }

        const newTrans: Transaction[] = [];
        const baseId = Date.now();
        
        // Detect delimiter (comma or semicolon)
        const firstLine = lines[0];
        const delimiter = firstLine.includes(';') ? ';' : ',';

        // Helper to clean and parse amount (handles RM, commas, quotes)
        const parseCurrency = (val: string) => {
          if (!val) return NaN;
          // Remove RM, commas, and quotes
          const sanitized = val.replace(/RM/gi, '').replace(/,/g, '').replace(/"/g, '').trim();
          return parseFloat(sanitized);
        };

        // Helper to parse DD/MM/YYYY or YYYY-MM-DD
        const parseDate = (dateStr: string) => {
          if (!dateStr) return null;
          const clean = dateStr.replace(/"/g, '').trim();
          
          // DD/MM/YYYY
          if (clean.includes('/')) {
            const parts = clean.split('/');
            if (parts.length === 3) {
              const d = parts[0].padStart(2, '0');
              const m = parts[1].padStart(2, '0');
              let y = parts[2];
              if (y.length === 2) y = `20${y}`;
              return `${y}-${m}-${d}`;
            }
          }
          // YYYY-MM-DD
          if (clean.includes('-')) {
            const parts = clean.split('-');
            if (parts.length === 3 && parts[0].length === 4) return clean;
          }
          return null;
        };

        for (let i = 0; i < lines.length; i++) {
          const rawLine = lines[i];
          // Use regex for CSV split to handle values inside quotes
          const regex = new RegExp(`${delimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`);
          const c = rawLine.split(regex).map(val => val.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          
          if (c.length < 5) continue;

          const dateStr = c[0];
          const parsedDate = parseDate(dateStr);
          
          // If the first column isn't a valid date, it might be a header or metadata row. Skip it.
          if (!parsedDate) continue;

          const name = c[1] || "";
          const details = c[2] || "";
          const inAmt = parseCurrency(c[3]);
          const outAmt = parseCurrency(c[4]);
          const category = c[5] || "Office";

          let finalAmt = 0;
          let type: 'in' | 'out' = 'in';

          if (!isNaN(inAmt) && inAmt !== 0) {
            finalAmt = Math.abs(inAmt);
            type = 'in';
          } else if (!isNaN(outAmt) && outAmt !== 0) {
            finalAmt = Math.abs(outAmt);
            type = 'out';
          } else {
            // No amount found in this row, skip it
            continue;
          }

          newTrans.push({
            id: baseId + i + Math.random(),
            date: parsedDate,
            account: "Akaun Pejabat",
            type: type,
            category: category,
            name: name,
            details: details,
            amount: finalAmt
          });
        }

        if (newTrans.length > 0) {
          setTransactions(prev => [...prev, ...newTrans]);
          alert(`${newTrans.length} rekod berjaya diimport!`);
        } else {
          alert("Tiada rekod sah dijumpai. Sila pastikan format Tarikh (DD/MM/YYYY) dan kolum In/Out mengandungi jumlah.");
        }
      } catch (err) {
        console.error("Import error:", err);
        alert("Ralat semasa membaca fail CSV. Sila pastikan format kolum: Tarikh, Nama, Butir-butir, In, Out, Katagori.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  const handleReset = () => {
    if (confirm("AMARAN: Ini akan memadam SEMUA data. Teruskan?")) {
      setTransactions([]);
      setInvoices([]);
      localStorage.removeItem('hma_db_trans');
      localStorage.removeItem('hma_db_invoices');
    }
  };

  // --- Auth View ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-500 border border-slate-200">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-gradient-to-tr from-indigo-600 to-indigo-400 p-5 rounded-[2rem] shadow-xl mb-6 ring-8 ring-indigo-50">
              <Lock className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Akses Sistem</h1>
            <p className="text-slate-500 font-semibold mt-1">Hairi Mustafa Associates</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative group">
              <input
                type="password"
                placeholder="Masukkan kata laluan"
                className={`w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 text-center text-xl tracking-[0.3em] font-black outline-none transition-all duration-300 ${
                  loginError 
                    ? 'border-rose-400 bg-rose-50 text-rose-700' 
                    : 'border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-8 focus:ring-indigo-500/10 text-slate-800'
                }`}
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setLoginError(''); }}
                autoFocus
              />
              {loginError && (
                <p className="text-center text-rose-600 text-sm mt-3 font-bold flex items-center justify-center gap-2 animate-pulse">
                  <AlertCircle className="w-4 h-4" /> {loginError}
                </p>
              )}
            </div>
            <button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4.5 rounded-2xl font-black text-lg transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] transform flex items-center justify-center gap-2"
            >
              Masuk Sekarang
            </button>
          </form>
          
          <div className="mt-12 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">
            &copy; {new Date().getFullYear()} HMA Management System
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] font-sans">
      <nav className="bg-slate-900 text-white shadow-2xl z-40 flex-none border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4 min-w-0">
              <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-indigo-500/20 shadow-lg flex-shrink-0">
                <Scale className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="truncate">
                <h1 className="font-black text-lg sm:text-xl tracking-tighter uppercase truncate leading-none">Hairi Mustafa Associates</h1>
                <p className="text-[10px] sm:text-xs font-bold text-indigo-400 uppercase tracking-widest mt-1 opacity-80">Legal Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4 overflow-x-auto no-scrollbar py-2">
              <button onClick={() => setIsInvoiceModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center gap-2 shrink-0">
                <FileText className="w-4 h-4" /> <span className="hidden sm:inline">Invois</span>
              </button>
              <button onClick={() => setIsStatementModalOpen(true)} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center gap-2 shrink-0">
                <ArrowRightLeft className="w-4 h-4" /> <span className="hidden sm:inline">Penyata</span>
              </button>
              <button onClick={() => setIsReportModalOpen(true)} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center gap-2 shrink-0">
                <Table className="w-4 h-4" /> <span className="hidden sm:inline">Laporan</span>
              </button>

              <div className="h-8 w-px bg-white/10 mx-2 shrink-0"></div>

              <div className="flex gap-1">
                <button onClick={handleExport} className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10" title="Eksport Fail (Ikut Format Hamparan)">
                  <Download className="w-5 h-5" />
                </button>
                <label className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 cursor-pointer" title="Import Fail (Ikut Format Hamparan)">
                  <Upload className="w-5 h-5" />
                  <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
                </label>
                <button onClick={handleReset} className="p-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded-xl transition-all border border-rose-600/20" title="Sistem Reset">
                  <Power className="w-5 h-5" />
                </button>
                <button onClick={handleLogout} className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl transition-all border border-white/10" title="Log Keluar">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {showBackupAlert && (
        <div className="bg-amber-500 text-white px-6 py-2.5 text-center shadow-2xl text-xs sm:text-sm font-black uppercase tracking-widest flex items-center justify-center gap-4 animate-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5" />
          <span>Sila buat 'Backup' data (Eksport) hari ini.</span>
          <button onClick={handleExport} className="bg-white text-amber-600 px-4 py-1 rounded-lg text-[10px] hover:bg-amber-50 transition-colors">Backup Sekarang</button>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
          
          {/* Dashboard Summary Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden relative group">
              <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-20 h-20 text-emerald-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Jumlah Masuk</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{formatRM(totals.in)}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden relative group">
              <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <TrendingDown className="w-20 h-20 text-rose-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Jumlah Keluar</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{formatRM(totals.out)}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden relative group">
              <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-20 h-20 text-indigo-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Baki Bersih</p>
              <p className={`text-3xl font-black tracking-tighter ${totals.bal < 0 ? 'text-rose-600' : 'text-indigo-600'}`}>
                {formatRM(totals.bal)}
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 sticky top-0 z-30">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 flex-1">
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 flex-1 md:flex-none min-w-[200px]">
                <Filter className="w-4 h-4 text-indigo-500" strokeWidth={3} />
                <select 
                  className="bg-transparent font-black text-slate-800 focus:outline-none cursor-pointer text-xs uppercase tracking-wider w-full"
                  value={filterAccount}
                  onChange={(e) => setFilterAccount(e.target.value)}
                >
                  <option value="all">Semua Akaun</option>
                  {ACCOUNTS.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="flex gap-2">
                <select 
                  className="flex-1 md:flex-none bg-slate-50 border border-slate-100 text-slate-800 text-xs rounded-2xl px-5 py-3 font-black uppercase tracking-wider cursor-pointer outline-none hover:bg-slate-100 transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                  value={filterYear}
                  onChange={(e) => setFilterYear(parseInt(e.target.value))}
                >
                  {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select 
                  className="flex-1 md:flex-none bg-slate-50 border border-slate-100 text-slate-800 text-xs rounded-2xl px-5 py-3 font-black uppercase tracking-wider cursor-pointer outline-none hover:bg-slate-100 transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                >
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m.toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            <button 
              onClick={() => { setEditingTransaction(null); setModalMode('create'); setIsAddModalOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" /> Tambah Rekod
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 gap-4">
              <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-3">
                <Table className="w-4 h-4 text-indigo-500" /> Lejer Transaksi (Format Hamparan)
              </h2>
              <div className="relative w-full md:w-80">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  className="pl-12 w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 text-slate-700 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-5">Tarikh</th>
                    <th className="px-6 py-5">Nama</th>
                    <th className="px-6 py-5">Butir-butir</th>
                    <th className="px-6 py-5 text-right">In (RM)</th>
                    <th className="px-6 py-5 text-right">Out (RM)</th>
                    <th className="px-6 py-5 text-center">Katagori</th>
                    <th className="px-6 py-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-5 text-slate-500 text-xs font-black tracking-widest">{formatDate(t.date)}</td>
                      <td className="px-6 py-5 font-black text-slate-800 text-sm truncate max-w-[150px]">{t.name}</td>
                      <td className="px-6 py-5 text-[10px] text-slate-400 font-bold truncate max-w-[200px]">{t.details}</td>
                      <td className="px-6 py-5 text-right font-black text-emerald-600 text-base">
                        {t.type === 'in' ? formatRM(t.amount) : '—'}
                      </td>
                      <td className="px-6 py-5 text-right font-black text-rose-600 text-base">
                        {t.type === 'out' ? formatRM(t.amount) : '—'}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                          t.category === 'Office' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                          t.category === 'Dokumen' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          t.category === 'Fee' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          t.category === 'Mahkamah' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          {t.category}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => printReceipt(t)} className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-white border border-slate-100 transition-all shadow-sm">
                            <Printer className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEdit(t)} className="p-2.5 bg-slate-50 text-indigo-600 rounded-xl hover:bg-white border border-slate-100 transition-all shadow-sm">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteTransaction(t.id)} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all border border-rose-100 shadow-sm">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-200">
                          <Search className="w-16 h-16" />
                          <p className="text-lg font-black uppercase tracking-[0.2em]">Tiada rekod dijumpai</p>
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

      <TransactionFormModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleSaveTransaction} initialData={editingTransaction} mode={modalMode} />
      <InvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} invoices={invoices} onAddInvoice={handleAddInvoice} onDeleteInvoice={handleDeleteInvoice} onPayInvoice={handlePayInvoice} />
      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} transactions={transactions} year={filterYear} />
      <AccountStatementModal isOpen={isStatementModalOpen} onClose={() => setIsStatementModalOpen(false)} transactions={transactions} />
    </div>
  );
};

export default App;