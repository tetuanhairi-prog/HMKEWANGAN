import React, { useState, useEffect } from 'react';
import { 
  X, AlertCircle, Calendar, Wallet, User, Tag, 
  ArrowUpCircle, ArrowDownCircle, Check, CreditCard, Bookmark, MessageSquare, CheckCircle2
} from 'lucide-react';
import { ACCOUNTS, CATEGORIES, Transaction } from '../types';
import { formatDate } from '../utils/printUtils';

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
    if (!data.date) newErrors.date = "Tarikh transaksi diperlukan.";
    
    const amt = parseFloat(data.amount);
    if (!data.amount) newErrors.amount = "Sila masukkan jumlah (RM).";
    else if (isNaN(amt) || amt <= 0) newErrors.amount = "Jumlah mestilah lebih daripada RM 0.00.";
    
    if (!data.name.trim()) newErrors.name = "Sila masukkan nama pembayar atau penerima.";
    else if (data.name.trim().length < 3) newErrors.name = "Nama mestilah sekurang-kurangnya 3 aksara.";
    
    if (!data.category.trim()) newErrors.category = "Sila pilih atau taip kategori transaksi.";
    
    return newErrors;
  };

  const handleChange = (field: Extract<keyof typeof formData, string>, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    if (touched[field]) {
      const currentErrors = validate(newData);
      setErrors(prev => ({ ...prev, [field]: currentErrors[field] || '' }));
    }
  };

  const handleBlur = (field: Extract<keyof typeof formData, string>) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const currentErrors = validate(formData);
    setErrors(prev => ({ ...prev, [field]: currentErrors[field] || '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    
    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    if (Object.keys(validationErrors).length === 0) {
      onSave({
        ...formData,
        amount: parseFloat(formData.amount) || 0
      });
      onClose();
    }
  };

  const isIncome = formData.type === 'in';
  const validationErrors = validate(formData);
  const isFormValid = Object.keys(validationErrors).length === 0;

  const getInputStatusClass = (field: Extract<keyof typeof formData, string>) => {
    if (!touched[field]) return "border-slate-100 focus:border-indigo-500 focus:ring-indigo-500/5";
    if (errors[field]) return "border-rose-500 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-500/10";
    return "border-emerald-500 bg-emerald-50/30 focus:border-emerald-500 focus:ring-emerald-500/10";
  };

  const theme = isIncome ? {
      accent: 'emerald',
      bg: 'bg-emerald-50/40',
      border: isFormValid ? 'border-emerald-500' : 'border-emerald-100',
      text: 'text-emerald-700',
      btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30'
  } : {
      accent: 'rose',
      bg: 'bg-rose-50/40',
      border: isFormValid ? 'border-rose-500' : 'border-rose-100',
      text: 'text-rose-700',
      btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30'
  };

  const commonCategories = isIncome 
    ? ["Legal Fee", "Retainer", "Consultation", "Reimbursement"]
    : ["Filing Fee", "Office Supplies", "Utilities", "Mileage", "Salary", "Rental", "Printing"];

  const inputBase = "w-full bg-slate-50 border-2 rounded-[1.25rem] px-6 py-4 pl-14 text-sm font-bold outline-none transition-all text-slate-800 shadow-inner placeholder:text-slate-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-xl h-full sm:h-auto sm:rounded-[3rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 flex flex-col max-h-[100dvh] sm:max-h-[95dvh] border border-white/20">
        
        <div className="px-10 py-8 flex justify-between items-center bg-white border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-5">
            <div className={`p-4 rounded-2xl shadow-lg ${isIncome ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-rose-600 shadow-rose-500/20'}`}>
              {isIncome ? <ArrowUpCircle className="w-6 h-6 text-white" strokeWidth={2.5} /> : <ArrowDownCircle className="w-6 h-6 text-white" strokeWidth={2.5} />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                {mode === 'edit' ? 'Kemaskini' : mode === 'copy' ? 'Salin' : 'Tambah'} Transaksi
              </h2>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-2 ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isIncome ? 'Terimaan (Credit)' : 'Perbelanjaan (Debit)'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all group">
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform" strokeWidth={3} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-10 no-scrollbar flex-1 bg-white">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner">
              <button
                type="button"
                onClick={() => handleChange('type', 'in')}
                className={`flex-1 py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all ${isIncome ? 'bg-white text-emerald-600 shadow-md ring-1 ring-emerald-500/10' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ArrowUpCircle className="w-4 h-4" /> Wang Masuk
              </button>
              <button
                type="button"
                onClick={() => handleChange('type', 'out')}
                className={`flex-1 py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all ${!isIncome ? 'bg-white text-rose-600 shadow-md ring-1 ring-rose-500/10' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ArrowDownCircle className="w-4 h-4" /> Wang Keluar
              </button>
            </div>

            <div className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center relative shadow-sm ${getInputStatusClass('amount')} ${theme.bg}`}>
              <label className={`text-[10px] font-black uppercase mb-5 tracking-[0.2em] ${theme.text}`}>Jumlah Transaksi (RM)</label>
              <div className="flex items-center w-full justify-center">
                <span className={`text-3xl font-black mr-4 ${errors.amount && touched.amount ? 'text-rose-300' : 'text-slate-300'}`}>RM</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="bg-transparent text-center text-5xl font-black outline-none tabular-nums text-slate-900 placeholder-slate-200 w-full max-w-[280px] tracking-tighter"
                  value={formData.amount}
                  onChange={e => handleChange('amount', e.target.value)}
                  onBlur={() => handleBlur('amount')}
                  autoFocus
                />
              </div>
              {errors.amount && touched.amount ? (
                <div className="mt-5 flex items-center gap-2 text-rose-600 text-[10px] font-black uppercase tracking-wider bg-white/50 px-4 py-2 rounded-xl shadow-sm border border-rose-100 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-3.5 h-3.5" strokeWidth={3} /> {errors.amount}
                </div>
              ) : touched.amount && formData.amount && (
                 <div className="mt-5 text-emerald-600 animate-in fade-in scale-90">
                    <CheckCircle2 className="w-6 h-6" strokeWidth={3} />
                 </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Tarikh Transaksi
                  </label>
                  {formData.date && (
                    <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-tighter">
                      {formatDate(formData.date)}
                    </span>
                  )}
                </div>
                <div className="relative group">
                  <input 
                    type="date" 
                    className={`${inputBase} ${getInputStatusClass('date')}`} 
                    value={formData.date} 
                    onChange={e => handleChange('date', e.target.value)} 
                    onBlur={() => handleBlur('date')}
                  />
                  <Calendar className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none ${errors.date && touched.date ? 'text-rose-400' : touched.date ? 'text-emerald-400' : 'text-slate-300'}`} />
                </div>
                {errors.date && touched.date && <p className="text-[9px] text-rose-600 font-black uppercase px-2 mt-1">{errors.date}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5" /> Akaun Firma
                </label>
                <div className="relative group">
                  <select
                    className={`${inputBase} ${getInputStatusClass('account')} appearance-none cursor-pointer`}
                    value={formData.account}
                    onChange={e => handleChange('account', e.target.value)}
                    onBlur={() => handleBlur('account')}
                  >
                    {ACCOUNTS.map(acc => <option key={acc} value={acc}>{acc.toUpperCase()}</option>)}
                  </select>
                  <CreditCard className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none ${touched.account ? 'text-emerald-400' : 'text-slate-300'}`} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Pembayar / Penerima
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Nama individu atau syarikat..." 
                  className={`${inputBase} ${getInputStatusClass('name')}`} 
                  value={formData.name} 
                  onChange={e => handleChange('name', e.target.value)} 
                  onBlur={() => handleBlur('name')} 
                />
                <User className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none ${errors.name && touched.name ? 'text-rose-400' : touched.name ? 'text-emerald-400' : 'text-slate-300'}`} />
                {touched.name && !errors.name && formData.name && <Check className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" strokeWidth={4} />}
              </div>
              {errors.name && touched.name && <p className="text-[9px] text-rose-600 font-black uppercase px-2 mt-1">{errors.name}</p>}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5" /> Kategori Transaksi
                </label>
                <div className="relative group">
                  <input 
                    list="categories" 
                    placeholder="Pilih atau masukkan kategori..." 
                    className={`${inputBase} ${getInputStatusClass('category')}`} 
                    value={formData.category} 
                    onChange={e => handleChange('category', e.target.value)} 
                    onBlur={() => handleBlur('category')} 
                  />
                  <Tag className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none ${errors.category && touched.category ? 'text-rose-400' : touched.category ? 'text-emerald-400' : 'text-slate-300'}`} />
                  <datalist id="categories">
                    {CATEGORIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                {errors.category && touched.category && <p className="text-[9px] text-rose-600 font-black uppercase px-2 mt-1">{errors.category}</p>}
              </div>
              
              <div className="flex flex-wrap gap-2.5 px-1">
                {commonCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { handleChange('category', cat); setTouched(t => ({ ...t, category: true })); }}
                    className={`text-[9px] font-black px-5 py-2.5 rounded-xl border-2 transition-all uppercase tracking-[0.15em] ${
                      formData.category === cat 
                        ? `${isIncome ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20' : 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-500/20'}`
                        : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" /> Nota Tambahan
              </label>
              <div className="relative group">
                <textarea
                  rows={2}
                  placeholder="Masukkan butiran terperinci transaksi jika ada..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.25rem] px-6 py-5 pl-14 text-sm font-bold outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 text-slate-800 resize-none shadow-inner placeholder:text-slate-300"
                  value={formData.details}
                  onChange={e => handleChange('details', e.target.value)}
                />
                <MessageSquare className="absolute left-5 top-6 w-5 h-5 text-slate-300 pointer-events-none group-focus-within:text-indigo-500 transition-colors" />
              </div>
            </div>

          </form>
        </div>

        <div className="p-8 border-t bg-slate-50/50 flex gap-4 shrink-0">
          <button onClick={onClose} className="flex-1 px-8 py-5 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm active:scale-95">
            Batal
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={!isFormValid}
            className={`flex-[2] px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] text-white flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl ${theme.btn} ${!isFormValid ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
          >
            <Check className="w-5 h-5" strokeWidth={3} />
            {mode === 'edit' ? 'Kemaskini Rekod' : mode === 'copy' ? 'Salin Rekod' : 'Simpan Transaksi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionFormModal;