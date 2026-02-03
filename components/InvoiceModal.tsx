import React, { useState } from 'react';
import { X, Printer, Trash2, Banknote, AlertCircle, Plus, Receipt, Check } from 'lucide-react';
import { Invoice } from '../types';
import { printInvoice, formatRM } from '../utils/printUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  onAddInvoice: (inv: Omit<Invoice, 'id' | 'status' | 'date'>) => void;
  onDeleteInvoice: (id: number) => void;
  onPayInvoice: (inv: Invoice) => void;
}

const InvoiceModal: React.FC<Props> = ({ isOpen, onClose, invoices, onAddInvoice, onDeleteInvoice, onPayInvoice }) => {
  const [formData, setFormData] = useState({
    no: '',
    client: '',
    desc: '',
    amount: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  if (!isOpen) return null;

  const validate = (data: typeof formData) => {
    const newErrors: { [key: string]: string } = {};
    if (!data.no.trim()) {
        newErrors.no = "No. Invois diperlukan";
    }
    if (!data.client.trim()) {
        newErrors.client = "Nama Pelanggan diperlukan";
    }
    
    const amt = parseFloat(data.amount);
    if (!data.amount) {
        newErrors.amount = "Jumlah diperlukan";
    } else if (isNaN(amt) || amt <= 0) {
        newErrors.amount = "Jumlah mesti positif";
    }
    return newErrors;
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    if (touched[field as string]) {
      const errs = validate(newData);
      setErrors(prev => ({ ...prev, [field as string]: errs[field as string] || '' }));
    }
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field as string]: true }));
    const errs = validate(formData);
    setErrors(prev => ({ ...prev, [field as string]: errs[field as string] || '' }));
  };

  const handleSubmit = () => {
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setTouched({ no: true, client: true, amount: true, desc: true });

    if (Object.keys(validationErrors).length === 0) {
      onAddInvoice({
        no: formData.no,
        client: formData.client,
        desc: formData.desc,
        amount: parseFloat(formData.amount)
      });
      setFormData({ no: '', client: '', desc: '', amount: '' });
      setErrors({});
      setTouched({});
    }
  };

  const getInputClass = (field: string) => {
    const isTouched = touched[field];
    const hasError = !!errors[field];
    const isValid = isTouched && !hasError;

    return `w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 text-sm font-bold transition-all duration-300 outline-none ${
      hasError 
        ? 'border-rose-300 bg-rose-50 text-rose-700 focus:ring-8 focus:ring-rose-500/10' 
        : isValid
            ? 'border-emerald-200 bg-emerald-50/30 text-slate-800 focus:border-emerald-500 focus:ring-8 focus:ring-emerald-500/10'
            : 'border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/10 text-slate-800'
    }`;
  };

  const formValid = Object.keys(validate(formData)).length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-6xl h-full sm:h-[90vh] sm:rounded-[2.5rem] shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
        
        <div className="flex justify-between items-center px-8 py-8 border-b bg-indigo-600 text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl shadow-inner backdrop-blur-md">
              <Receipt className="w-8 h-8" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-2xl font-black uppercase tracking-tighter">Pengurusan Invois</p>
              <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest opacity-80">Invoice Management System</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/20 rounded-2xl transition-all group active:scale-90">
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-6 sm:p-8 flex flex-col md:flex-row gap-8 bg-slate-50/30">
          
          <div className="w-full md:w-[350px] bg-white p-8 rounded-[2rem] border-2 border-slate-100 h-fit shrink-0 shadow-sm overflow-y-auto max-h-[40vh] md:max-h-full no-scrollbar">
            <h3 className="font-black text-slate-800 mb-6 text-xs uppercase tracking-[0.2em] flex items-center gap-3">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div> Jana Invois Baru
            </h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">No. Invois</label>
                <div className="relative">
                    <input placeholder="HMA-2024-001" className={getInputClass('no')} value={formData.no} onChange={e => handleChange('no', e.target.value)} onBlur={() => handleBlur('no')} />
                    {touched.no && !errors.no && <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" strokeWidth={3} />}
                </div>
                {errors.no && touched.no && <p className="text-[10px] text-rose-600 font-bold px-2 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.no}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Pelanggan</label>
                <div className="relative">
                    <input placeholder="Nama Pelanggan" className={getInputClass('client')} value={formData.client} onChange={e => handleChange('client', e.target.value)} onBlur={() => handleBlur('client')} />
                    {touched.client && !errors.client && <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" strokeWidth={3} />}
                </div>
                {errors.client && touched.client && <p className="text-[10px] text-rose-600 font-bold px-2 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.client}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Keterangan</label>
                <textarea placeholder="Penerangan invois..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold h-24 resize-none focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800" value={formData.desc} onChange={e => handleChange('desc', e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Jumlah (RM)</label>
                <div className="relative">
                    <input type="number" placeholder="0.00" className={`${getInputClass('amount')} font-black text-lg`} value={formData.amount} onChange={e => handleChange('amount', e.target.value)} onBlur={() => handleBlur('amount')} />
                    {touched.amount && !errors.amount && <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" strokeWidth={3} />}
                </div>
                {errors.amount && touched.amount && <p className="text-[10px] text-rose-600 font-bold px-2 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.amount}</p>}
              </div>

              <button 
                onClick={handleSubmit} 
                disabled={!formValid}
                className={`w-full py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest mt-4 transition-all shadow-xl active:scale-[0.98] ${formValid ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                Hasilkan Invois
              </button>
            </div>
          </div>

          <div className="w-full md:w-2/3 flex flex-col min-h-0 flex-1">
            <h3 className="font-black text-slate-800 mb-6 text-xs uppercase tracking-[0.2em] flex items-center gap-3 shrink-0">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div> Senarai Invois Aktif
            </h3>
            <div className="flex-1 overflow-auto border-2 border-slate-100 rounded-[2.5rem] bg-white shadow-xl min-h-0 no-scrollbar">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest sticky top-0 z-10">
                  <tr>
                    <th className="p-6">No. Invois</th>
                    <th className="p-6">Pelanggan</th>
                    <th className="p-6 text-right">Jumlah</th>
                    <th className="p-6 text-center">Status</th>
                    <th className="p-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[...invoices].reverse().map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-6 font-black text-xs text-slate-500 tracking-wider">{inv.no}</td>
                      <td className="p-6 font-black text-slate-800">{inv.client}</td>
                      <td className="p-6 text-right font-black text-slate-900 text-base">{formatRM(inv.amount)}</td>
                      <td className="p-6 text-center">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {inv.status === 'paid' ? 'DIBAYAR' : 'PENDING'}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => printInvoice(inv)} className="p-3 text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all border border-indigo-100" title="Cetak Invois">
                            <Printer className="w-4 h-4" />
                          </button>
                          {inv.status === 'unpaid' && (
                            <button onClick={() => onPayInvoice(inv)} className="p-3 text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100" title="Terima Bayaran">
                              <Banknote className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => onDeleteInvoice(inv.id)} className="p-3 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition-all border border-rose-100" title="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-32 text-center text-slate-300 uppercase font-black tracking-widest text-xs opacity-50">Tiada inbois direkodkan</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;