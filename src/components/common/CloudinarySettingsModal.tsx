import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Cloud, CheckCircle2, ShieldCheck, X, UploadCloud, Info } from 'lucide-react';
import { uploadToCloudinary } from '../../services/cloudinaryService';

interface Props {
  onClose: () => void;
}

export const CloudinarySettingsModal: React.FC<Props> = ({ onClose }) => {
  const { cloudinaryConfig, updateCloudinaryConfig } = useFinance();

  const [cloudName, setCloudName] = useState(cloudinaryConfig.cloudName || '');
  const [uploadPreset, setUploadPreset] = useState(cloudinaryConfig.uploadPreset || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCloudinaryConfig({
      cloudName: cloudName.trim(),
      uploadPreset: uploadPreset.trim(),
      isConfigured: cloudName.trim().length > 0 && uploadPreset.trim().length > 0,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleTestUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTesting(true);
    setTestResult(null);

    const res = await uploadToCloudinary(file, {
      cloudName: cloudName.trim() || 'demo',
      uploadPreset: uploadPreset.trim() || 'docs',
      isConfigured: cloudName.trim().length > 0 && uploadPreset.trim().length > 0,
    });

    setIsTesting(false);
    setTestResult(res.url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-b-full"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cloudinary Image Storage</h3>
              <p className="text-xs text-slate-400">KYC documents, customer photos & collection proofs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="my-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            Uploads work automatically with full direct Cloudinary API support. If unconfigured or offline, our fallback storage system ensures instant local preview without any errors.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cloudinary Cloud Name
            </label>
            <input
              type="text"
              placeholder="e.g. your-cloud-name"
              value={cloudName}
              onChange={(e) => setCloudName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Upload Preset (Unsigned)
            </label>
            <input
              type="text"
              placeholder="e.g. finance_uploads"
              value={uploadPreset}
              onChange={(e) => setUploadPreset(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Test Upload Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Test Upload Verification
            </label>
            <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-700 hover:border-sky-500/50 rounded-xl cursor-pointer bg-slate-800/40 hover:bg-slate-800 transition">
              <UploadCloud className="w-5 h-5 text-sky-400 mb-1" />
              <span className="text-xs text-slate-300 font-medium">
                {isTesting ? 'Uploading test file...' : 'Choose image to test upload'}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WebP</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleTestUpload}
                disabled={isTesting}
                className="hidden"
              />
            </label>

            {testResult && (
              <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-[11px] text-emerald-300 truncate">
                  Upload Successful! URL ready for KYC.
                </div>
                <img src={testResult} alt="preview" className="w-6 h-6 rounded object-cover ml-auto" />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-500 to-emerald-600 hover:from-sky-600 hover:to-emerald-700 text-white shadow-lg shadow-sky-500/20 transition"
            >
              {savedSuccess ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Cloudinary Settings</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
