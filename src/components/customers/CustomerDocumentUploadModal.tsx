import React, { useState } from 'react';
import { Customer } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { X, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { uploadToCloudinary } from '../../services/cloudinaryService';

interface Props {
  customer: Customer;
  onClose: () => void;
}

export const CustomerDocumentUploadModal: React.FC<Props> = ({ customer, onClose }) => {
  const { addCustomerDocument, cloudinaryConfig } = useFinance();

  const [docType, setDocType] = useState<'AADHAAR_FRONT' | 'AADHAAR_BACK' | 'PAN_CARD' | 'PHOTO' | 'AGREEMENT'>('AADHAAR_FRONT');
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const res = await uploadToCloudinary(file, cloudinaryConfig);
    addCustomerDocument(customer.id, {
      type: docType,
      url: res.url,
      publicId: res.publicId,
    });
    setIsUploading(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">
              Upload KYC Document ({customer.name})
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Document Category
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="AADHAAR_FRONT">Aadhaar Card (Front)</option>
              <option value="AADHAAR_BACK">Aadhaar Card (Back)</option>
              <option value="PAN_CARD">PAN Card</option>
              <option value="PHOTO">Customer Photo Verification</option>
              <option value="AGREEMENT">Signed Loan Agreement Proof</option>
            </select>
          </div>

          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl cursor-pointer bg-slate-800/40 hover:bg-slate-800 transition">
            <UploadCloud className="w-8 h-8 text-emerald-400 mb-2" />
            <span className="text-xs text-white font-semibold">
              {isUploading ? 'Uploading to Cloudinary...' : 'Click to select KYC document'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, PDF up to 10MB</span>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Document uploaded & attached to customer!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
