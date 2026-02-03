import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Calendar, Wallet, User, Tag, FileText, ArrowUpCircle, ArrowDownCircle, Check, DollarSign } from 'lucide-react';
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
    if (!data.amount || isNaN(parseFloat(data.amount)) || parseFloat(data.amount) <= 0) {
      newErrors.amount = "Jumlah mesti lebih daripada 0";
    }
    if (!data.name.trim()) newErrors.name = "Nama diperlukan";
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
    setTouched({ date: true, amount: true, name: true });

    if (Object.keys(validationErrors).length === 0) {
      onSave({
        ...formData,
        amount: parseFloat(formData.amount) || 0
      });
      onClose();
    }
  };

  const getTitle = () => {
    if (mode === 'edit') return 'Kemaskini Transaksi';
    if (mode === 'copy') return 'Salin Transaksi';
    return 'Rekod Transaksi';
  };

  const isIncome = formData.type === 'in';
  
  const theme = isIncome ? {
      gradient: 'from-emerald-600 to-emerald-500',
      lightBg: 'bg-emerald-50',
      darkText: 'text-emerald-700',
      iconBg: 'bg-emerald-100',
      iconText: 'text-emerald-600',
      focusRing: 'focus:ring-emerald-500/10',
      focusBorder: 'focus:border-emerald-500',
      btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 focus:ring-emerald-500/20',
      pillActive: 'bg-emerald-600 text-white border-emerald-600 shadow-lg'
  } : {
      gradient: 'from-rose-600 to-rose-500',
      lightBg: 'bg-rose-50',
      darkText: 'text-rose-700',
      iconBg: 'bg-rose-100',
      iconText: 'text-rose-600',
      focusRing: 'focus:ring-rose-500/10',
      focusBorder: 'focus:border-rose-500',
      btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20 focus:ring-rose-500/20',
      pillActive: 'bg-rose-600 text-white border-rose-600 shadow-lg'
  };

  const commonCategories = isIncome 
    ? ["Legal Fee", "Retainer", "Consultation", "Reimbursement"]
    : ["Filing Fee", "Office Supplies", "Utilities", "Mileage", "Salary", "Rental", "Printing", "Refreshments"];

  const getInputClass = (field: string) => 
    `w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 pl-12 text-sm font-bold outline-none transition-all duration-300 ${
      errors[field] 
        ? 'border-rose-300 focus:border-rose-500 focus:bg-white focus:ring-8 focus:ring-rose-500/10 bg-rose-50 text-rose-700' 
        : `border-slate-100 ${theme.focusBorder} focus:bg-white focus:ring-8 ${theme.focusRing} text-slate-800`
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl h-full sm:h-auto sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-screen sm:max-h-[90vh]">
        
        <div className={`px-8 py-8 border-b flex justify-between items-center bg-gradient-to-r transition-all duration-500 shrink-0 ${theme.gradient}`}>
          <div className="flex items-center gap-4 text-white">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner">
              {isIncome ? <ArrowUpCircle className="w-8 h-8" strokeWidth={2.5} /> : <ArrowDownCircle className="w-8 h-8" strokeWidth={2.5} />}
            </div>
            <div>
              <p className="text-2xl font-black tracking-tighter uppercase">{getTitle()}</p>
              <p className="text-[10px] text-white/70 font-black uppercase tracking-[0.2em]">{isIncome ? 'Terimaan Wang' : 'Pembayaran / Belanja'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/20 rounded-2xl transition-all text-white active:scale-90">
            <X className="w-6 h-6" strokeWidth={3} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-8 no-scrollbar flex-1 bg-white">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="flex p-2 rounded-2xl bg-slate-100 border-2 border-slate-100">
              <button
                type="button"
                onClick={() => handleChange('type', 'in')}
                className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${isIncome ? 'bg-white text-emerald-600 shadow-xl scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ArrowUpCircle className="w-5 h-5" /> Wang Masuk
              </button>
              <button
                type="button"
                onClick={() => handleChange('type', 'out')}
                className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${!isIncome ? 'bg-white text-rose-600 shadow-xl scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ArrowDownCircle className="w-5 h-5" /> Wang Keluar
              </button>
            </div>

            <div className="space-y-3">
              <label className={`block text-xs font-black uppercase tracking-[0.2em] px-2 ${theme.darkText}`}>Jumlah Transaksi (RM)</label>
              <div className="relative group">
                <div className={`absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none p-2 rounded-xl transition-all ${theme.iconBg} ${theme.iconText} group-focus-within:scale-110`}>
                  <DollarSign className="w-6 h-6" strokeWidth={3} />
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full bg-slate-50 border-2 rounded-[1.5rem] p-6 pl-20 text-4xl font-black outline-none transition-all duration-300 placeholder-slate-200 ${
                    errors.amount 
                      ? 'border-rose-400 bg-rose-50 text-rose-800' 
                      : `border-slate-100 text-slate-900 ${theme.focusBorder} focus:bg-white focus:ring-8 ${theme.focusRing}`
                  }`}
                  value={formData.amount}
                  onChange={e => handleChange('amount', e.target.value)}
                  onBlur={() => handleBlur('amount')}
                />
              </div>
              {errors.amount && <p className="text-xs text-rose-600 mt-2 font-bold px-4 flex items-center gap-2 animate-bounce"><AlertCircle className="w-4 h-4" /> {errors.amount}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Tarikh</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input type="date" className={getInputClass('date')} value={formData.date} onChange={e => handleChange('date', e.target.value)} onBlur={() => handleBlur('date')} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Akaun Bank</label>
                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <select
                    className={`w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 pl-12 text-sm font-bold outline-none appearance-none cursor-pointer transition-all duration-300 border-slate-100 ${theme.focusBorder} focus:bg-white focus:ring-8 ${theme.focusRing} text-slate-800`}
                    value={formData.account}
                    onChange={e => handleChange('account', e.target.value)}
                  >
                    {ACCOUNTS.map(acc => <option key={acc} value={acc}>{acc.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Nama Pihak (Payer / Payee)</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input type="text" placeholder="Contoh: TNB / Ali Abu" className={getInputClass('name')} value={formData.name} onChange={e => handleChange('name', e.target.value)} onBlur={() => handleBlur('name')} />
              </div>
              {errors.name && <p className="text-xs text-rose-600 font-bold px-4 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {errors.name}</p>}
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Kategori Transaksi</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input list="categories" placeholder="Pilih atau taip..." className={getInputClass('category')} value={formData.category} onChange={e => handleChange('category', e.target.value)} />
                  <datalist id="categories">
                    {CATEGORIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 px-1">
                {commonCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleChange('category', cat)}
                    className={`text-[10px] font-black px-4 py-2 rounded-xl border-2 transition-all active:scale-95 uppercase tracking-widest ${
                      formData.category === cat 
                        ? theme.pillActive
                        : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Keterangan / Nota</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
                <textarea
                  rows={3}
                  placeholder="Nota tambahan..."
                  className={`w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 pl-12 text-sm font-bold outline-none transition-all duration-300 border-slate-100 ${theme.focusBorder} focus:bg-white focus:ring-8 ${theme.focusRing} text-slate-800 resize-none`}
                  value={formData.details}
                  onChange={e => handleChange('details', e.target.value)}
                />
              </div>
            </div>

          </form>
        </div>

        <div className="p-8 border-t bg-slate-50/50 flex flex-col sm:flex-row gap-3 z-10 shrink-0">
          <button onClick={onClose} className="flex-1 px-8 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all active:scale-95">Batal</button>
          <button onClick={handleSubmit} className={`flex-1 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all ${theme.btn}`}>
            <Check className="w-5 h-5" strokeWidth={3} /> {mode === 'edit' ? 'Kemaskini Data' : 'Simpan Rekod'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionFormModal;