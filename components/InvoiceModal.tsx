import React, { useState } from 'react';
import { X, Printer, Trash2, Banknote, AlertCircle, Plus } from 'lucide-react';
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
    if (!data.amount || isNaN(parseFloat(data.amount)) || parseFloat(data.amount) <= 0) {
      newErrors.amount = "Jumlah tidak sah";
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

  const getInputClass = (field: string) => 
    `w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 transition-all duration-200 ${
      errors[field] 
        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50' 
        : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-blue-100 text-gray-700'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-4xl h-full sm:h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b bg-blue-50 sm:rounded-t-2xl shrink-0">
          <p className="text-lg font-bold text-blue-800 flex items-center gap-2">
            Pengurusan Invois
          </p>
          <button onClick={onClose} className="p-2 hover:bg-blue-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-blue-800" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-4 sm:p-6 flex flex-col md:flex-row gap-4 sm:gap-6">
          
          {/* Form Section - Scrolls naturally on mobile within flex-1 if needed, or stays at top */}
          <div className="w-full md:w-1/3 bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 h-fit shrink-0 overflow-y-auto max-h-[40vh] md:max-h-full">
            <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
              <Plus className="w-4 h-4" /> Jana Invois Baru
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <input 
                  placeholder="No. Invois" 
                  className={getInputClass('no')}
                  value={formData.no}
                  onChange={e => handleChange('no', e.target.value)}
                  onBlur={() => handleBlur('no')}
                />
                {errors.no && <p className="text-xs text-rose-600 mt-1 flex items-center px-1"><AlertCircle className="w-3 h-3 mr-1"/>{errors.no}</p>}
              </div>
              
              <div>
                <input 
                  placeholder="Nama Pelanggan" 
                  className={getInputClass('client')}
                  value={formData.client}
                  onChange={e => handleChange('client', e.target.value)}
                  onBlur={() => handleBlur('client')}
                />
                {errors.client && <p className="text-xs text-rose-600 mt-1 flex items-center px-1"><AlertCircle className="w-3 h-3 mr-1"/>{errors.client}</p>}
              </div>

              <textarea 
                placeholder="Keterangan..." 
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm h-20 sm:h-24 resize-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-700"
                value={formData.desc}
                onChange={e => handleChange('desc', e.target.value)}
              />

              <div>
                <input 
                  type="number" 
                  placeholder="Jumlah (RM)" 
                  className={`${getInputClass('amount')} font-mono font-medium`}
                  value={formData.amount}
                  onChange={e => handleChange('amount', e.target.value)}
                  onBlur={() => handleBlur('amount')}
                />
                {errors.amount && <p className="text-xs text-rose-600 mt-1 flex items-center px-1"><AlertCircle className="w-3 h-3 mr-1"/>{errors.amount}</p>}
              </div>

              <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 mt-2 transition-all shadow-lg shadow-blue-200 active:scale-95">
                Buat Invois
              </button>
            </div>
          </div>

          {/* List Section - Takes remaining space */}
          <div className="w-full md:w-2/3 flex flex-col min-h-0 flex-1">
            <h3 className="font-bold text-gray-700 mb-2 sm:mb-4 text-sm uppercase tracking-wide shrink-0">Senarai Invois</h3>
            <div className="flex-1 overflow-auto border rounded-2xl bg-white shadow-sm scrollbar-thin scrollbar-thumb-gray-200 min-h-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-xs sticky top-0">
                  <tr>
                    <th className="p-3 sm:p-4 whitespace-nowrap">No. Invois</th>
                    <th className="p-3 sm:p-4 whitespace-nowrap">Pelanggan</th>
                    <th className="p-3 sm:p-4 text-right whitespace-nowrap">Jumlah</th>
                    <th className="p-3 sm:p-4 text-center whitespace-nowrap">Status</th>
                    <th className="p-3 sm:p-4 text-center whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...invoices].reverse().map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 sm:p-4 font-mono text-xs font-bold text-gray-600 whitespace-nowrap">{inv.no}</td>
                      <td className="p-3 sm:p-4 font-medium text-gray-800 whitespace-nowrap">{inv.client}</td>
                      <td className="p-3 sm:p-4 text-right font-bold text-gray-700 whitespace-nowrap">{formatRM(inv.amount)}</td>
                      <td className="p-3 sm:p-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${inv.status === 'paid' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
                          {inv.status === 'paid' ? 'Dibayar' : 'Belum'}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 flex justify-center gap-2 whitespace-nowrap">
                        <button onClick={() => printInvoice(inv)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors" title="Cetak">
                          <Printer className="w-4 h-4" />
                        </button>
                        {inv.status === 'unpaid' && (
                          <button onClick={() => onPayInvoice(inv)} className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors" title="Bayar">
                            <Banknote className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => onDeleteInvoice(inv.id)} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors" title="Padam">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400 italic">Tiada inbois direkodkan.</td>
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