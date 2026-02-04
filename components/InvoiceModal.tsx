import React, { useState } from 'react';
import { X, Printer, Trash2, Banknote, AlertCircle, Plus, Receipt, Check, FileText } from 'lucide-react';
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
    if (!data.no.trim()) newErrors.no = "No. Invois diperlukan";
    if (!data.client.trim()) newErrors.client = "Nama Pelanggan diperlukan";
    const amt = parseFloat(data.amount);
    if (!data.amount) newErrors.amount = "Jumlah diperlukan";
    else if (isNaN(amt) || amt <= 0) newErrors.amount = "Jumlah mesti positif";
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
    return `w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest transition-all duration-300 outline-none ${
      hasError 
        ? 'border-rose-300 bg-rose-50 text-rose-700 focus:ring-8 focus:ring-rose-500/10' 
        : isValid
            ? 'border-emerald-200 bg-emerald-50/30 text-slate-800 focus:border-emerald-500 focus:ring-8 focus:ring-emerald-500/10'
            : 'border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/10 text-slate-800 shadow-inner'
    }`;
  };

  const formValid = Object.keys(validate(formData)).length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-[#F8FAFC] w-full max-w-6xl h-full sm:h-[90vh] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        
        <div className="flex justify-between items-center px-10 py-8 border-b bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-500/20">
              <Receipt className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none">Pengurusan Invois</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Invoice Management System</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all group active:scale-90">
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-6 sm:p-10 flex flex-col md:flex-row gap-10">
          
          <div className="w-full md:w-[400px] bg-white p-8 rounded-[2.5rem] border border-slate-200 h-fit shrink-0 shadow-xl space-y-8 animate-in slide-in-from-left-4 duration-500 delay-100">
            <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-[0.25em] flex items-center gap-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div> Jana Invois Baru
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">No. Invois</label>
                <div className="relative">
                    <input placeholder="HMA-2024-001" className={getInputClass('no')} value={formData.no} onChange={e => handleChange('no', e.target.value)} onBlur={() => handleBlur('no')} />
                    {touched.no && !errors.no && <Check className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" strokeWidth={3} />}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Pelanggan</label>
                <div className="relative">
                    <input placeholder="Nama Pelanggan" className={getInputClass('client')} value={formData.client} onChange={e => handleChange('client', e.target.value)} onBlur={() => handleBlur('client')} />
                    {touched.client && !errors.client && <Check className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" strokeWidth={3} />}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Butiran Perkhidmatan</label>
                <textarea placeholder="Penerangan perkhidmatan..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest h-28 resize-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800 shadow-inner" value={formData.desc} onChange={e => handleChange('desc', e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Jumlah Bayaran (RM)</label>
                <div className="relative">
                    <input type="number" placeholder="0.00" className={`${getInputClass('amount')} text-lg`} value={formData.amount} onChange={e => handleChange('amount', e.target.value)} onBlur={() => handleBlur('amount')} />
                    {touched.amount && !errors.amount && <Check className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" strokeWidth={3} />}
                </div>
              </div>

              <button 
                onClick={handleSubmit} 
                disabled={!formValid}
                className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] mt-4 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${formValid ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                <Plus className="w-5 h-5" strokeWidth={3} /> Hasilkan Invois
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 animate-in slide-in-from-right-4 duration-500 delay-200">
            <div className="flex justify-between items-center mb-6 shrink-0">
               <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-[0.25em] flex items-center gap-3">
                 <div className="w-2 h-2 bg-indigo-500 rounded-full"></div> Senarai Invois Aktif
               </h3>
               <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-4 py-1.5 rounded-full">{invoices.length} Rekod</span>
            </div>
            
            <div className="flex-1 overflow-auto border border-slate-200 rounded-[3rem] bg-white shadow-2xl min-h-0 no-scrollbar">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[9px] tracking-[0.2em] sticky top-0 z-10 border-b">
                  <tr>
                    <th className="px-8 py-6">No. Invois</th>
                    <th className="px-8 py-6">Pelanggan</th>
                    <th className="px-8 py-6 text-right">Jumlah</th>
                    <th className="px-8 py-6 text-center">Status</th>
                    <th className="px-8 py-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.length > 0 ? [...invoices].map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                      <td className="px-8 py-8">
                        <span className="font-black text-[10px] text-slate-400 tracking-wider uppercase">{inv.no}</span>
                      </td>
                      <td className="px-8 py-8">
                         <div className="flex flex-col">
                           <span className="font-black text-slate-800 text-sm tracking-tight">{inv.client}</span>
                           <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{inv.desc}</span>
                         </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <span className="font-black text-slate-900 text-lg tabular-nums tracking-tight">{formatRM(inv.amount)}</span>
                      </td>
                      <td className="px-8 py-8 text-center">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' : 'bg-amber-50 text-amber-600 border-amber-100/50'}`}>
                          {inv.status === 'paid' ? 'DIBAYAR' : 'PENDING'}
                        </span>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => printInvoice(inv)} className="w-11 h-11 flex items-center justify-center text-indigo-600 bg-indigo-50 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100/50 shadow-sm" title="Cetak Invois">
                            <Printer className="w-5 h-5" />
                          </button>
                          {inv.status === 'unpaid' && (
                            <button onClick={() => onPayInvoice(inv)} className="w-11 h-11 flex items-center justify-center text-emerald-600 bg-emerald-50 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100/50 shadow-sm" title="Terima Bayaran">
                              <Banknote className="w-5 h-5" />
                            </button>
                          )}
                          <button onClick={() => onDeleteInvoice(inv.id)} className="w-11 h-11 flex items-center justify-center text-rose-500 bg-rose-50 rounded-2xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100/50 shadow-sm" title="Hapus">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-40 text-center">
                         <div className="flex flex-col items-center gap-4 text-slate-300">
                           <FileText className="w-16 h-16 opacity-10" />
                           <p className="font-black uppercase tracking-[0.4em] text-[10px] opacity-40">TIADA INVOIS DIJANA</p>
                         </div>
                      </td>
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