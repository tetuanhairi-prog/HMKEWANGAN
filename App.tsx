import React, { useState, useEffect, useMemo } from 'react';
import { 
  Scale, FileText, Table, Download, Upload, Power, 
  Filter, PlusCircle, Trash2, Printer, Copy, Search, AlertCircle, Pencil, Lock, LogOut,
  ArrowRightLeft
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
  
  // Data for editing (Copy function)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Backup Warning State
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
    // 7 days in ms
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

  const chartData = useMemo(() => {
    const mIn = Array(12).fill(0);
    const mOut = Array(12).fill(0);
    const categoryData: Record<string, number> = {};

    transactions.forEach(t => {
      const d = new Date(t.date);
      // Chart data respects Account filter but shows WHOLE YEAR for context
      if (d.getFullYear() === filterYear && (filterAccount === 'all' || t.account === filterAccount)) {
        const m = d.getMonth();
        if (t.type === 'in') {
          mIn[m] += t.amount;
        } else {
          mOut[m] += t.amount;
          categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
        }
      }
    });

    const barData = MONTHS.map((m, i) => ({
      name: m.substring(0, 3),
      Masuk: mIn[i],
      Keluar: mOut[i]
    }));

    const pieData = Object.keys(categoryData).map(key => ({
      name: key,
      value: categoryData[key]
    }));

    return { barData, pieData };
  }, [transactions, filterYear, filterAccount]);

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
      // Update existing
      setTransactions(prev => prev.map(tr => 
        tr.id === editingTransaction.id ? { ...t, id: editingTransaction.id } : tr
      ));
    } else {
      // Create new (or copy)
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

  const handleDuplicate = (t: Transaction) => {
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
    setInvoices(prev => [...prev, newInv]);
  };

  const handleDeleteInvoice = (id: number) => {
    if (confirm('Padam invois ini?')) {
      setInvoices(prev => prev.filter(i => i.id !== id));
    }
  };

  const handlePayInvoice = (inv: Invoice) => {
    if (confirm(`Adakah ${inv.client} sudah membuat bayaran RM${inv.amount}?`)) {
      // Update invoice
      setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'paid' } : i));
      
      // Add transaction
      const newTrans: Transaction = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        type: 'in',
        account: 'Akaun Pejabat', // Default
        amount: inv.amount,
        name: inv.client,
        category: 'Legal Fee',
        details: `Bayaran Invois: ${inv.no}`
      };
      setTransactions(prev => [...prev, newTrans]);
    }
  };

  const handleExport = () => {
    localStorage.setItem('hma_last_backup', Date.now().toString());
    setShowBackupAlert(false);
    
    let csv = "data:text/csv;charset=utf-8,Tarikh,Akaun,Jenis,Nama,Butiran,Jumlah\n";
    transactions.forEach(t => {
      csv += `${t.date},${t.account},${t.type},${t.name},${t.details},${t.amount}\n`;
    });
    
    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HMA_Backup_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const lines = content.split('\n');
      const newTrans: Transaction[] = [];
      
      // Skip header i=1
      for (let i = 1; i < lines.length; i++) {
        const c = lines[i].split(',');
        if (c.length < 6) continue;
        newTrans.push({
          id: Date.now() + Math.random(),
          date: c[0],
          account: c[1],
          type: c[2] as 'in' | 'out',
          name: c[3],
          details: c[4],
          amount: parseFloat(c[5]),
          category: 'Import'
        });
      }
      setTransactions(prev => [...prev, ...newTrans]);
      alert("Data berjaya diimport!");
    };
    reader.readAsText(file);
    // Reset input
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

  const PIE_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  // --- Auth View ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-500 border border-white/10">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-tr from-amber-400 to-amber-600 p-4 rounded-full shadow-lg mb-4 ring-4 ring-amber-100">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Akses Sistem</h1>
            <p className="text-sm text-gray-500 font-medium">Hairi Mustafa Associates</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input
                type="password"
                placeholder="Kata Laluan"
                className={`w-full border rounded-xl px-4 py-3.5 text-center text-lg tracking-widest outline-none transition-all duration-200 shadow-sm ${
                  loginError 
                    ? 'border-rose-300 bg-rose-50 focus:ring-4 focus:ring-rose-100' 
                    : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 text-gray-800'
                }`}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setLoginError('');
                }}
                autoFocus
              />
              {loginError && (
                <p className="text-center text-rose-600 text-sm mt-2 font-bold flex items-center justify-center gap-1 animate-pulse">
                  <AlertCircle className="w-4 h-4" /> {loginError}
                </p>
              )}
            </div>
            <button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 transform"
            >
              Masuk
            </button>
          </form>
          
          <div className="mt-8 text-center text-xs text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} HMA Management System
          </div>
        </div>
      </div>
    );
  }

  // --- Main View ---
  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-slate-900 text-white shadow-lg z-30 flex-none">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-gradient-to-tr from-amber-400 to-amber-600 p-2 rounded-xl text-slate-900 shadow-md flex-shrink-0">
                <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="truncate">
                <h1 className="font-bold text-base sm:text-lg tracking-wide hidden sm:block truncate">Hairi Mustafa Associates</h1>
                <h1 className="font-bold text-base sm:text-lg tracking-wide sm:hidden truncate">HMA System</h1>
                <p className="text-[10px] sm:text-xs text-gray-400 hidden xs:block">Sistem Kewangan & Invois</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 ml-2 overflow-x-auto no-scrollbar mask-linear pr-1">
              <button onClick={() => setIsInvoiceModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 shadow-sm border border-blue-500 whitespace-nowrap flex-shrink-0">
                <FileText className="w-4 h-4" /> <span className="hidden sm:inline">Invois</span>
              </button>
              
              <button onClick={() => setIsStatementModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 shadow-sm border border-indigo-500 whitespace-nowrap flex-shrink-0">
                <ArrowRightLeft className="w-4 h-4" /> <span className="hidden sm:inline">Penyata</span>
              </button>

              <button onClick={() => setIsReportModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-2 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 mr-1 sm:mr-2 shadow-sm border border-purple-500 whitespace-nowrap flex-shrink-0">
                <Table className="w-4 h-4" /> <span className="hidden sm:inline">Laporan</span>
              </button>

              <div className="h-6 w-px bg-slate-700 mx-0.5 sm:mx-1 flex-shrink-0"></div>

              <button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 sm:px-3 py-2 rounded-xl transition shadow-sm border border-emerald-500 flex-shrink-0" title="Backup (Export)">
                <Download className="w-4 h-4" />
              </button>
              <label className="bg-slate-700 hover:bg-slate-600 text-white px-2 sm:px-3 py-2 rounded-xl transition cursor-pointer border border-slate-600 shadow-sm flex-shrink-0" title="Import CSV">
                <Upload className="w-4 h-4" />
                <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
              </label>
              <button onClick={handleReset} className="bg-rose-600 hover:bg-rose-700 text-white px-2 sm:px-3 py-2 rounded-xl transition ml-1 sm:ml-2 shadow-sm border border-rose-500 flex-shrink-0" title="Reset Data">
                <Power className="w-4 h-4" />
              </button>
              <button onClick={handleLogout} className="bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white px-2 sm:px-3 py-2 rounded-xl transition ml-1 sm:ml-2 border border-slate-700 shadow-sm flex-shrink-0" title="Log Keluar">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Warning Banner */}
      {showBackupAlert && (
        <div className="bg-rose-600 text-white px-4 py-2 text-center shadow-md text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-300" />
            <span>PERINGATAN: Sila buat 'Backup' data (Eksport) sekarang.</span>
          </div>
          <button onClick={handleExport} className="underline text-yellow-200 hover:text-white">Klik Sini</button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-20">
          
          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-200 sticky top-0 z-20">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-indigo-50 px-3 py-2.5 rounded-xl border border-indigo-100 shadow-sm w-full sm:w-auto">
                <label className="text-xs font-bold text-indigo-800 uppercase flex items-center gap-1 whitespace-nowrap">
                  <Filter className="w-3 h-3" /> Papar:
                </label>
                <select 
                  className="bg-transparent font-bold text-indigo-900 focus:outline-none cursor-pointer text-sm w-full sm:w-auto"
                  value={filterAccount}
                  onChange={(e) => setFilterAccount(e.target.value)}
                >
                  <option value="all">SEMUA AKAUN</option>
                  {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 w-full sm:w-auto">
                <select 
                  className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-2.5 font-semibold cursor-pointer hover:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none shadow-sm w-full sm:w-auto"
                  value={filterYear}
                  onChange={(e) => setFilterYear(parseInt(e.target.value))}
                >
                  {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>

                <select 
                  className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-2.5 font-semibold cursor-pointer hover:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none shadow-sm w-full sm:w-auto"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                >
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>
            </div>

            <button 
              onClick={() => { 
                setEditingTransaction(null); 
                setModalMode('create');
                setIsAddModalOpen(true); 
              }}
              className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl shadow-lg transition-all font-bold text-sm flex items-center justify-center gap-2 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" /> Rekod Transaksi
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border-l-4 border-emerald-500 hover:shadow-md transition-shadow">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Jumlah Masuk</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1 sm:mt-2">{formatRM(totals.in)}</p>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border-l-4 border-rose-500 hover:shadow-md transition-shadow">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Jumlah Keluar</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1 sm:mt-2">{formatRM(totals.out)}</p>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border-l-4 border-indigo-500 hover:shadow-md transition-shadow">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Baki</p>
              <p className={`text-xl sm:text-2xl font-bold mt-1 sm:mt-2 ${totals.bal < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {formatRM(totals.bal)}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-4 sm:mb-6 flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-500" /> Aliran Tunai (Tahun {filterYear})
              </h3>
              <div className="h-56 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.barData}>
                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} tick={{fill: '#6b7280'}} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `RM${v/1000}k`} tick={{fill: '#6b7280'}} />
                    <RechartsTooltip 
                      formatter={(value: number) => formatRM(value)} 
                      contentStyle={{borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="Masuk" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Keluar" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-4 sm:mb-6 flex items-center gap-2">
                <Table className="w-4 h-4 text-purple-500" /> Pecahan Belanja
              </h3>
              <div className="h-56 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => formatRM(value)} contentStyle={{borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center bg-gray-50 gap-3 sm:gap-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2 self-start sm:self-center">
                <Table className="w-4 h-4 text-gray-500" /> Lejer
              </h2>
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari..."
                  className="pl-10 w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 text-gray-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3">Tarikh</th>
                    <th className="px-4 py-3">Akaun</th>
                    <th className="px-4 py-3">Butiran</th>
                    <th className="px-4 py-3 text-right">Masuk</th>
                    <th className="px-4 py-3 text-right">Keluar</th>
                    <th className="px-4 py-3 text-center">Dokumen</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">{formatDate(t.date)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">{t.account}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-800 text-sm">{t.name}</div>
                        <div className="text-xs text-gray-500">{t.details}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">
                        {t.type === 'in' ? formatRM(t.amount) : ''}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-rose-600">
                        {t.type === 'out' ? formatRM(t.amount) : ''}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => printReceipt(t)}
                          className="text-xs border px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 text-gray-600 transition-colors shadow-sm"
                        >
                          <Printer className="w-3 h-3 inline mr-1" /> Cetak
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center flex justify-center gap-2">
                        <button onClick={() => handleEdit(t)} className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 hover:text-yellow-700 transition-colors border border-yellow-200" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDuplicate(t)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors border border-blue-200" title="Salin">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteTransaction(t.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors border border-red-200" title="Padam">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500 italic">Tiada rekod dijumpai.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <TransactionFormModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
        mode={modalMode}
      />
      
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoices={invoices}
        onAddInvoice={handleAddInvoice}
        onDeleteInvoice={handleDeleteInvoice}
        onPayInvoice={handlePayInvoice}
      />

      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        transactions={transactions}
        year={filterYear}
      />

      <AccountStatementModal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
        transactions={transactions}
      />
    </div>
  );
};

export default App;
