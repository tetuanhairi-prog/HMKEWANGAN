import React, { useState, useEffect } from 'react';
import { 
  X, AlertCircle, Calendar, Wallet, User, Tag, 
  ArrowUpCircle, ArrowDownCircle, Check, CreditCard, Bookmark, MessageSquare
} from 'lucide-react';
import { ACCOUNTS, CATEGORIES, Transaction } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (t: Omit<Transaction, 'id'>) => void;
  initialData?: Transaction | null;
  mode?: 'create' | 'edit' | 'copy';
}

const TransactionFormModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'in' as 'in' | 'out',
    account: ACCOUNTS[0],
    amount: '',
    name: '',
    category: '',
    details: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        type: initialData.type,
        account: initialData.account,
        amount: initialData.amount.toString(),
        name: initialData.name,
        category: initialData.category,
        details: initialData.details
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'in',
        account: ACCOUNTS[0],
        amount: '',
        name: '',
        category: '',
        details: ''
      });
    }
    setErrors({});
    setTouched({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = (data: typeof formData) => {
    const newErrors: { [key: string]: string } = {};
    if (!data.date) newErrors.date = "Tarikh diperlukan";
    const amt = parseFloat(data.amount);
    if (!data.amount) newErrors.amount = "Jumlah diperlukan";
    else if (isNaN(amt) || amt <= 0) newErrors.amount = "Jumlah mesti positif";
    if (!data.name.trim()) newErrors.name = "Nama pihak diperlukan";
    if (!data.category.trim()) newErrors.category = "Kategori diperlukan";
    return newErrors;
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    if (touched[field as string]) {
      const currentErrors = validate(newData);
      setErrors(prev => ({ ...prev, [field as string]: currentErrors[field as string] || '' }));
    }
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field as string]: true }));
    const currentErrors = validate(formData);
    setErrors(prev => ({ ...prev, [field as string]: currentErrors[field as string] || '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setTouched({ date: true, amount: true, name: true, category: true });

    if (Object.keys(validationErrors).length === 0) {
      onSave({
        ...formData,
        amount: parseFloat(formData.amount) || 0
      });
      onClose();
    }
  };

  const isIncome = formData.type === 'in';
  
  const theme = isIncome ? {
      accent: 'emerald',
      color: '#10b981',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
  } : {
      accent: 'rose',
      color: '#f43f5e',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-700',
      btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
  };

  const commonCategories = isIncome 
    ? ["Legal Fee", "Retainer", "Consultation", "Reimbursement"]
    : ["Filing Fee", "Office Supplies", "Utilities", "Mileage", "Salary", "Rental", "Printing"];

  const inputBase = "w-full bg-slate-50 border-2 rounded-2xl px-5 py-3.5 pl-12 text-sm font-bold outline-none transition-all duration-200 shadow-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-xl h-full sm:h-auto sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col max-h-[100dvh] sm:max-h-[95dvh]">
        
        {/* Simple & Polished Header */}
        <div className="px-8 py-6 flex justify-between items-center bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl shadow-md ${isIncome ? 'bg-emerald-600' : 'bg-rose-600'}`}>
              {isIncome ? <ArrowUpCircle className="w-5 h-5 text-white" /> : <ArrowDownCircle className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight tracking-tight">
                {mode === 'edit' ? 'Kemaskini Rekod' : mode === 'copy' ? 'Salin Rekod' : 'Tambah Rekod Baru'}
              </h2>
              <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isIncome ? 'Terimaan (Income)' : 'Perbelanjaan (Expense)'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition-colors">
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-8 no-scrollbar flex-1 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Type Toggle */}
            <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => handleChange('type', 'in')}
                className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-2 transition-all ${isIncome ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
              >
                <ArrowUpCircle className="w-4 h-4" /> Wang Masuk
              </button>
              <button
                type="button"
                onClick={() => handleChange('type', 'out')}
                className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-2 transition-all ${!isIncome ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
              >
                <ArrowDownCircle className="w-4 h-4" /> Wang Keluar
              </button>
            </div>

            {/* Polished Amount Input Section */}
            <div className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center relative ${isIncome ? 'bg-emerald-50/40 border-emerald-100' : 'bg-rose-50/40 border-rose-100'}`}>
              <label className={`text-[10px] font-bold uppercase mb-4 tracking-wider ${isIncome ? 'text-emerald-700' : 'text-rose-700'}`}>Jumlah Transaksi (RM)</label>
              <div className="flex items-center w-full justify-center">
                <span className="text-2xl font-black text-slate-300 mr-3">RM</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="bg-transparent text-center text-5xl font-black outline-none tabular-nums text-slate-900 placeholder-slate-200 w-full max-w-[240px] tracking-tighter"
                  value={formData.amount}
                  onChange={e => handleChange('amount', e.target.value)}
                  onBlur={() => handleBlur('amount')}
                  autoFocus
                />
              </div>
              {errors.amount && touched.amount && (
                <div className="mt-4 flex items-center gap-1.5 text-rose-600 text-[10px] font-bold uppercase tracking-tight">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.amount}
                </div>
              )}
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-2 tracking-wide">
                  <Calendar className="w-3.5 h-3.5" /> Tarikh Transaksi
                </label>
                <div className="relative group">
                  <input 
                    type="date" 
                    className={`${inputBase} ${touched.date && !errors.date ? 'border-emerald-100 focus:border-emerald-500' : 'border-slate-100 focus:border-indigo-500'} focus:bg-white`} 
                    value={formData.date} 
                    onChange={e => handleChange('date', e.target.value)} 
                  />
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-2 tracking-wide">
                  <Wallet className="w-3.5 h-3.5" /> Akaun Terlibat
                </label>
                <div className="relative group">
                  <select
                    className={`${inputBase} border-slate-100 focus:border-indigo-500 appearance-none cursor-pointer focus:bg-white`}
                    value={formData.account}
                    onChange={e => handleChange('account', e.target.value)}
                  >
                    {ACCOUNTS.map(acc => <option key={acc} value={acc}>{acc.toUpperCase()}</option>)}
                  </select>
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Party Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-2 tracking-wide">
                <User className="w-3.5 h-3.5" /> Nama Pihak (Pembayar / Penerima)
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Masukkan nama penuh..." 
                  className={`${inputBase} ${touched.name && !errors.name ? 'border-emerald-100 focus:border-emerald-500' : 'border-slate-100 focus:border-indigo-500'} focus:bg-white`} 
                  value={formData.name} 
                  onChange={e => handleChange('name', e.target.value)} 
                  onBlur={() => handleBlur('name')} 
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
              </div>
              {errors.name && touched.name && <p className="text-[10px] text-rose-600 font-bold uppercase px-1 mt-1 tracking-tight">{errors.name}</p>}
            </div>

            {/* Category selection */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-2 tracking-wide">
                  <Bookmark className="w-3.5 h-3.5" /> Kategori
                </label>
                <div className="relative group">
                  <input 
                    list="categories" 
                    placeholder="Pilih atau taip kategori..." 
                    className={`${inputBase} ${touched.category && !errors.category ? 'border-emerald-100 focus:border-emerald-500' : 'border-slate-100 focus:border-indigo-500'} focus:bg-white`} 
                    value={formData.category} 
                    onChange={e => handleChange('category', e.target.value)} 
                    onBlur={() => handleBlur('category')} 
                  />
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                  <datalist id="categories">
                    {CATEGORIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {commonCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { handleChange('category', cat); setTouched(t => ({ ...t, category: true })); }}
                    className={`text-[9px] font-bold px-4 py-2 rounded-lg border-2 transition-all uppercase tracking-wide ${
                      formData.category === cat 
                        ? `${isIncome ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-rose-600 text-white border-rose-600 shadow-md'}`
                        : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Details area */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-2 tracking-wide">
                <MessageSquare className="w-3.5 h-3.5" /> Nota / Keterangan Lanjut
              </label>
              <div className="relative group">
                <textarea
                  rows={2}
                  placeholder="Masukkan nota tambahan jika ada..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 pl-12 text-sm font-bold outline-none transition-all focus:bg-white focus:border-indigo-500 text-slate-800 resize-none"
                  value={formData.details}
                  onChange={e => handleChange('details', e.target.value)}
                />
                <MessageSquare className="absolute left-4 top-5 w-4.5 h-4.5 text-slate-300" />
              </div>
            </div>

          </form>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t bg-slate-50 flex gap-4 shrink-0">
          <button onClick={onClose} className="flex-1 px-6 py-4 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm">
            Batal
          </button>
          <button 
            onClick={handleSubmit} 
            className={`flex-[2] px-6 py-4 rounded-xl font-bold text-[11px] uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${theme.btn} ${Object.keys(validate(formData)).length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Check className="w-4.5 h-4.5" />
            {mode === 'edit' ? 'Kemaskini Rekod' : mode === 'copy' ? 'Salin Rekod' : 'Simpan Transaksi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionFormModal;