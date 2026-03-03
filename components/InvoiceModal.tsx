import React, { useState } from 'react';
import { X, Printer, Trash2, Banknote, AlertCircle, Plus, Receipt, Check, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Invoice } from '../types';
import { printInvoice, formatRM, formatDate } from '../utils/printUtils';

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
    if (!data.no.trim()) newErrors.no = "No. Invois diperlukan untuk rujukan.";
    
    if (!data.client.trim()) newErrors.client = "Nama Pelanggan diperlukan.";
    else if (data.client.trim().length < 3) newErrors.client = "Nama Pelanggan mestilah sekurang-kurangnya 3 aksara.";
    
    const amt = parseFloat(data.amount);
    if (!data.amount) newErrors.amount = "Sila masukkan nilai invois.";
    else if (isNaN(amt) || amt <= 0) newErrors.amount = "Nilai mestilah positif.";
    
    return newErrors;
  };

  const handleChange = (field: Extract<keyof typeof formData, string>, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    if (touched[field]) {
      const errs = validate(newData);
      setErrors(prev => ({ ...prev, [field]: errs[field] || '' }));
    }
  };

  const handleBlur = (field: Extract<keyof typeof formData, string>) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errs = validate(formData);
    setErrors(prev => ({ ...prev, [field]: errs[field] || '' }));
  };

  const getInputClass = (field: Extract<keyof typeof formData, string>) => {
    const isTouched = touched[field];
    const hasError = !!errors[field];
    const base = "w-full bg-gradient-to-b from-slate-50 to-white border rounded-2xl px-6 py-4.5 text-xs font-black uppercase tracking-widest transition-all duration-300 outline-none shadow-sm hover:border-slate-300 placeholder:text-slate-400";
    
    if (hasError && isTouched) {
      return `${base} border-rose-400 from-rose-50 text-rose-900 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500`;
    }
    if (isTouched && !hasError && formData[field]) {
      return `${base} border-emerald-400 from-emerald-50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-800`;
    }
    return `${base} border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-800`;
  };

  const handleSubmit = () => {
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    
    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

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

  const formValid = Object.keys(validate(formData)).length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-[#F5F7F9] w-full max-w-6xl h-full sm:h-[90vh] sm:rounded-[3rem] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-white/20">
        
        <div className="flex justify-between items-center px-10 py-8 border-b bg-white shrink-0">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20">
              <Receipt className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none">Pengurusan Invois</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-2">HMA Billing & Receivables</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all group active:scale-90">
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-6 sm:p-10 flex flex-col md:flex-row gap-10">
          
          <div className="w-full md:w-[420px] bg-white p-10 rounded-[2.5rem] border border-slate-100 h-fit shrink-0 shadow-2xl space-y-8 animate-in slide-in-from-left-8 duration-500 delay-100 overflow-y-auto no-scrollbar">
            <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-[0.3em] flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(93,87,231,0.5)]"></div> Jana Invois Baru
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No. Invois</label>
                  {touched.no && !errors.no && formData.no && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
                <input placeholder="HMA-2024-XXX" className={getInputClass('no')} value={formData.no} onChange={e => handleChange('no', e.target.value)} onBlur={() => handleBlur('no')} />
                {errors.no && touched.no && <p className="text-[9px] text-rose-600 font-black uppercase px-2 animate-in fade-in">{errors.no}</p>}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pelanggan</label>
                  {touched.client && !errors.client && formData.client && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
                <input placeholder="Carian Nama Pelanggan..." className={getInputClass('client')} value={formData.client} onChange={e => handleChange('client', e.target.value)} onBlur={() => handleBlur('client')} />
                {errors.client && touched.client && <p className="text-[9px] text-rose-600 font-black uppercase px-2 animate-in fade-in">{errors.client}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Butiran Perkhidmatan</label>
                <textarea placeholder="Penerangan kes / tugasan..." className="w-full bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-2xl px-6 py-5 text-xs font-black uppercase tracking-widest h-28 resize-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all duration-300 text-slate-800 shadow-sm hover:border-slate-300 placeholder:text-slate-400" value={formData.desc} onChange={e => handleChange('desc', e.target.value)} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jumlah Bayaran (RM)</label>
                  {touched.amount && !errors.amount && formData.amount && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
                <input type="number" placeholder="0.00" className={`${getInputClass('amount')} text-lg`} value={formData.amount} onChange={e => handleChange('amount', e.target.value)} onBlur={() => handleBlur('amount')} />
                {errors.amount && touched.amount && <p className="text-[9px] text-rose-600 font-black uppercase px-2 animate-in fade-in">{errors.amount}</p>}
              </div>

              <button 
                onClick={handleSubmit} 
                disabled={!formValid}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] mt-6 transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 ${formValid ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30' : 'bg-slate-100 text-slate-300 cursor-not-allowed grayscale'}`}
              >
                <Plus className="w-5 h-5" strokeWidth={3} /> Hasilkan Invois
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 animate-in slide-in-from-right-8 duration-500 delay-200">
            <div className="flex justify-between items-center mb-6 px-4 shrink-0">
               <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-[0.3em] flex items-center gap-3">
                 <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div> Arkib Invois
               </h3>
               <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black text-indigo-500 uppercase bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full ring-2 ring-indigo-500/5">{invoices.length} Rekod Sedia Ada</span>
               </div>
            </div>
            
            <div className="flex-1 overflow-auto border border-slate-200 rounded-[3rem] bg-white shadow-2xl min-h-0 no-scrollbar">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50/80 backdrop-blur-sm text-slate-400 font-black uppercase text-[9px] tracking-[0.25em] sticky top-0 z-10 border-b">
                  <tr>
                    <th className="px-8 py-8">Tarikh</th>
                    <th className="px-8 py-8">Rujukan</th>
                    <th className="px-8 py-8">Pelanggan</th>
                    <th className="px-8 py-8 text-right">Nilai (RM)</th>
                    <th className="px-8 py-8 text-center">Status</th>
                    <th className="px-8 py-8 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.length > 0 ? [...invoices].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(inv => (
                    <tr key={inv.id} className="hover:bg-indigo-50/30 transition-all duration-300 group">
                      <td className="px-8 py-10">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(inv.date)}</span>
                      </td>
                      <td className="px-8 py-10">
                        <span className="font-black text-[11px] text-slate-400 tracking-widest uppercase">{inv.no}</span>
                      </td>
                      <td className="px-8 py-10">
                         <div className="flex flex-col">
                           <span className="font-black text-slate-900 text-base tracking-tight group-hover:text-indigo-600">{inv.client}</span>
                           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 truncate max-w-[200px]">{inv.desc}</span>
                         </div>
                      </td>
                      <td className="px-8 py-10 text-right">
                        <span className="font-black text-slate-900 text-xl tabular-nums tracking-tighter">{formatRM(inv.amount)}</span>
                      </td>
                      <td className="px-8 py-10 text-center">
                        <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border-2 shadow-sm ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' : 'bg-amber-50 text-amber-600 border-amber-100/50'}`}>
                          {inv.status === 'paid' ? 'DIBAYAR' : 'BELUM BAYAR'}
                        </span>
                      </td>
                      <td className="px-8 py-10">
                        <div className="flex justify-center gap-2.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => printInvoice(inv)} className="w-12 h-12 flex items-center justify-center text-indigo-600 bg-indigo-50 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 shadow-sm active:scale-90" title="Cetak Invois">
                            <Printer className="w-5 h-5" />
                          </button>
                          {inv.status === 'unpaid' && (
                            <button onClick={() => onPayInvoice(inv)} className="w-12 h-12 flex items-center justify-center text-emerald-600 bg-emerald-50 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shadow-sm active:scale-90" title="Terima Bayaran">
                              <Banknote className="w-5 h-5" />
                            </button>
                          )}
                          <button onClick={() => onDeleteInvoice(inv.id)} className="w-12 h-12 flex items-center justify-center text-rose-500 bg-rose-50 rounded-2xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100 shadow-sm active:scale-90" title="Hapus">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-48 text-center">
                         <div className="flex flex-col items-center gap-6 text-slate-200">
                           <FileText className="w-20 h-20 opacity-10" strokeWidth={1} />
                           <p className="font-black uppercase tracking-[0.5em] text-[11px] opacity-40">ARKIB INVOIS KOSONG</p>
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