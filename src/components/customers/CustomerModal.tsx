import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Customer, CustomerStatus } from '../../types';
import { X, Upload, MapPin, User, ShieldCheck, Check } from 'lucide-react';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { getCurrentGpsLocation } from '../../services/geolocationService';

interface Props {
  customer?: Customer | null;
  onClose: () => void;
}

export const CustomerModal: React.FC<Props> = ({ customer, onClose }) => {
  const { addCustomer, updateCustomer, agents, cloudinaryConfig } = useFinance();

  const [name, setName] = useState(customer?.name || '');
  const [mobile, setMobile] = useState(customer?.mobile || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [occupation, setOccupation] = useState(customer?.occupation || '');
  const [aadhaarNumber, setAadhaarNumber] = useState(customer?.aadhaarNumber || '');
  const [panNumber, setPanNumber] = useState(customer?.panNumber || '');
  const [photoUrl, setPhotoUrl] = useState(
    customer?.photoUrl ||
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  );
  const [latitude, setLatitude] = useState<number>(customer?.latitude || 17.4947);
  const [longitude, setLongitude] = useState<number>(customer?.longitude || 78.3996);
  const [guarantorName, setGuarantorName] = useState(customer?.guarantorName || '');
  const [guarantorMobile, setGuarantorMobile] = useState(customer?.guarantorMobile || '');
  const [guarantorAddress, setGuarantorAddress] = useState(customer?.guarantorAddress || '');
  const [guarantorRelationship, setGuarantorRelationship] = useState(
    customer?.guarantorRelationship || 'Brother'
  );
  const [assignedAgentId, setAssignedAgentId] = useState(
    customer?.assignedAgentId || (agents[0]?.id ?? 'USR-AGT-01')
  );
  const [status, setStatus] = useState<CustomerStatus>(customer?.status || 'ACTIVE');

  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [gpsTagSuccess, setGpsTagSuccess] = useState(false);

  const handleCaptureGps = async () => {
    setIsFetchingGps(true);
    const coords = await getCurrentGpsLocation();
    setLatitude(coords.latitude);
    setLongitude(coords.longitude);
    setIsFetchingGps(false);
    setGpsTagSuccess(true);
    setTimeout(() => setGpsTagSuccess(false), 2000);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const result = await uploadToCloudinary(file, cloudinaryConfig);
    setPhotoUrl(result.url);
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (customer) {
      updateCustomer(customer.id, {
        name,
        mobile,
        address,
        occupation,
        aadhaarNumber,
        panNumber,
        photoUrl,
        latitude,
        longitude,
        guarantorName,
        guarantorMobile,
        guarantorAddress,
        guarantorRelationship,
        assignedAgentId,
        status,
      });
    } else {
      await addCustomer({
        customerCode: '',
        name,
        mobile,
        address,
        occupation,
        aadhaarNumber,
        panNumber,
        photoUrl,
        latitude,
        longitude,
        guarantorName,
        guarantorMobile,
        guarantorAddress,
        guarantorRelationship,
        assignedAgentId,
        status,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {customer ? `Edit Customer: ${customer.customerCode}` : 'Customer KYC Registration'}
              </h2>
              <p className="text-xs text-slate-400">
                Personal details, Aadhaar/PAN, guarantor info & GPS location
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Section 1: Customer Profile & Photo */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> 1. Customer Personal & KYC Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Photo preview & upload */}
              <div className="sm:col-span-1 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <img
                  src={photoUrl}
                  alt="Customer"
                  className="w-24 h-24 rounded-2xl object-cover ring-2 ring-emerald-500/50 mb-3 shadow-lg"
                />
                <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs text-white font-semibold flex items-center gap-1.5 transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Uploading...' : 'Cloudinary Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Basic Fields */}
              <div className="sm:col-span-2 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Babu Goud"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Occupation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vegetable Merchant"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address & Government IDs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Residential / Shop Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Street, Landmark, City, Pincode"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  placeholder="4532 8891 0021"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  PAN Number
                </label>
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Customer Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="NEW">NEW</option>
                  <option value="BLOCKED">BLOCKED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: GPS Location Verification */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> 2. Customer Home/Shop GPS Geolocation
              </h3>
              <button
                type="button"
                onClick={handleCaptureGps}
                disabled={isFetchingGps}
                className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{isFetchingGps ? 'Locating...' : 'Auto Capture GPS'}</span>
                {gpsTagSuccess && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Guarantor & Agent Assignment */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> 3. Guarantor & Field Agent Assignment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Guarantor Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mahesh Goud"
                  value={guarantorName}
                  onChange={(e) => setGuarantorName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Guarantor Mobile
                </label>
                <input
                  type="tel"
                  placeholder="9876509988"
                  value={guarantorMobile}
                  onChange={(e) => setGuarantorMobile(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Guarantor Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. KPHB Phase 1, Hyderabad"
                  value={guarantorAddress}
                  onChange={(e) => setGuarantorAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Relationship with Customer
                </label>
                <input
                  type="text"
                  placeholder="e.g. Brother / Spouse / Father"
                  value={guarantorRelationship}
                  onChange={(e) => setGuarantorRelationship(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assigned Field Agent *
                </label>
                <select
                  value={assignedAgentId}
                  onChange={(e) => setAssignedAgentId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 transition"
            >
              {customer ? 'Update Customer Profile' : 'Complete KYC & Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
