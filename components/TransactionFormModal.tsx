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
  
  // Theme Configuration
  const theme = isIncome ? {
      gradient: 'from-emerald-600 to-emerald-500',
      lightBg: 'bg-emerald-50',
      darkText: 'text-emerald-700',
      iconBg: 'bg-emerald-100',
      iconText: 'text-emerald-600',
      focusRing: 'focus:ring-emerald-100',
      focusBorder: 'focus:border-emerald-500',
      btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 focus:ring-emerald-200',
      pillActive: 'bg-emerald-100 border-emerald-200 text-emerald-700'
  } : {
      gradient: 'from-rose-600 to-rose-500',
      lightBg: 'bg-rose-50',
      darkText: 'text-rose-700',
      iconBg: 'bg-rose-100',
      iconText: 'text-rose-600',
      focusRing: 'focus:ring-rose-100',
      focusBorder: 'focus:border-rose-500',
      btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200 focus:ring-rose-200',
      pillActive: 'bg-rose-100 border-rose-200 text-rose-700'
  };

  // Common categories for quick selection
  const commonCategories = isIncome 
    ? ["Legal Fee", "Retainer", "Consultation", "Reimbursement"]
    : ["Filing Fee", "Office Supplies", "Utilities", "Mileage", "Salary", "Rental", "Printing", "Refreshments"];

  const inputBaseClass = "w-full border rounded-xl p-2.5 text-sm outline-none transition-all pl-10 duration-200";
  const getInputClass = (field: string) => 
    `${inputBaseClass} ${
      errors[field] 
        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50' 
        : `border-gray-200 ${theme.focusBorder} focus:ring-2 ${theme.focusRing} bg-gray-50 focus:bg-white text-gray-700`
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg h-full sm:h-auto sm:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-screen sm:max-h-[90vh]">
        
        {/* Header */}
        <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b flex justify-between items-center bg-gradient-to-r transition-all duration-300 shrink-0 ${theme.gradient}`}>
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm shadow-sm hidden xs:block">
              {isIncome ? <ArrowUpCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : <ArrowDownCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
            </div>
            <div>
              <p className="text-base sm:text-lg font-bold leading-tight">{getTitle()}</p>
              <p className="text-[10px] sm:text-xs text-white/90 font-medium uppercase tracking-wider opacity-90">{isIncome ? 'Terimaan Wang (Income)' : 'Perbelanjaan (Expense)'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-gray-200 flex-1">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            
            {/* Type Toggle */}
            <div className="flex p-1 rounded-xl bg-gray-100 border border-gray-200">
              <button
                type="button"
                onClick={() => handleChange('type', 'in')}
                className={`flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${isIncome ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
              >
                <ArrowUpCircle className="w-4 h-4" /> Masuk
              </button>
              <button
                type="button"
                onClick={() => handleChange('type', 'out')}
                className={`flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${!isIncome ? 'bg-white text-rose-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
              >
                <ArrowDownCircle className="w-4 h-4" /> Keluar
              </button>
            </div>

            {/* Amount - Hero Input */}
            <div className="relative group">
              <label className={`block text-xs font-bold uppercase mb-2 ml-1 ${theme.darkText}`}>
                Jumlah Transaksi (RM)
              </label>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none p-1.5 rounded-lg ${theme.iconBg} ${theme.iconText}`}>
                    <DollarSign className="w-5 h-5" strokeWidth={3} />
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full border rounded-xl p-4 pl-14 text-2xl sm:text-3xl font-bold outline-none transition-all duration-200 placeholder-gray-300 ${
                    errors.amount 
                      ? 'border-rose-300 bg-rose-50 text-rose-800 focus:ring-4 focus:ring-rose-200' 
                      : `border-gray-200 text-gray-800 ${theme.focusBorder} focus:ring-4 ${theme.focusRing} bg-white`
                  }`}
                  value={formData.amount}
                  onChange={e => handleChange('amount', e.target.value)}
                  onBlur={() => handleBlur('amount')}
                />
              </div>
              {errors.amount && <p className="text-xs text-rose-600 mt-1 flex items-center font-medium px-1 animate-in slide-in-from-left-1"><AlertCircle className="w-3 h-3 mr-1"/>{errors.amount}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Tarikh</label>
                <div className="relative group">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  <input
                    type="date"
                    className={getInputClass('date')}
                    value={formData.date}
                    onChange={e => handleChange('date', e.target.value)}
                    onBlur={() => handleBlur('date')}
                  />
                </div>
                {errors.date && <p className="text-xs text-rose-600 flex items-center px-1"><AlertCircle className="w-3 h-3 mr-1"/>{errors.date}</p>}
              </div>

              {/* Account */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Akaun</label>
                <div className="relative group">
                  <Wallet className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  <select
                    className={`w-full border rounded-xl p-2.5 pl-10 text-sm font-medium outline-none appearance-none cursor-pointer transition-all duration-200 ${
                        `border-gray-200 bg-gray-50 focus:bg-white ${theme.focusBorder} focus:ring-2 ${theme.focusRing} text-gray-700`
                    }`}
                    value={formData.account}
                    onChange={e => handleChange('account', e.target.value)}
                  >
                    {ACCOUNTS.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                  </select>
                  <div className="absolute right-3 top-3 pointer-events-none">
                    <ArrowDownCircle className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nama (Payer / Payee)</label>
              <div className="relative group">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Contoh: Ali Bin Abu / TNB"
                  className={getInputClass('name')}
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                />
              </div>
              {errors.name && <p className="text-xs text-rose-600 flex items-center px-1"><AlertCircle className="w-3 h-3 mr-1"/>{errors.name}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Kategori</label>
              <div className="relative group">
                <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                <input
                  list="categories"
                  placeholder="Pilih atau taip kategori..."
                  className={getInputClass('category')}
                  value={formData.category}
                  onChange={e => handleChange('category', e.target.value)}
                />
                <datalist id="categories">
                  {CATEGORIES.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              
              {/* Quick Category Pills */}
              <div className="flex flex-wrap gap-2 mt-2 px-1">
                  {commonCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleChange('category', cat)}
                      className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border transition-all active:scale-95 ${
                        formData.category === cat 
                          ? `${theme.pillActive} shadow-sm`
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Butiran / Keterangan</label>
              <div className="relative group">
                <FileText className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Nota tambahan (pilihan)..."
                  className={getInputClass('details')}
                  value={formData.details}
                  onChange={e => handleChange('details', e.target.value)}
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 z-10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 hover:border-gray-400 transition-colors focus:ring-2 focus:ring-gray-200"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            type="submit"
            className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg flex items-center gap-2 transition-transform active:scale-95 focus:ring-4 focus:ring-opacity-50 ${theme.btn}`}
          >
            <Check className="w-4 h-4" /> {mode === 'edit' ? 'Kemaskini' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionFormModal;