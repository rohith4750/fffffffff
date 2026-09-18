import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  MapPin,
  Phone,
  CheckCircle2,
  Receipt,
  Download,
  UploadCloud,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { getCurrentGpsLocation } from '../../services/geolocationService';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { calculatePaymentDistribution } from '../../services/financeEngine';
import { generateCollectionReceiptPDF } from '../../services/receiptGenerator';
import confetti from 'canvas-confetti';
import { Customer, Loan, PaymentMethod } from '../../types';

export const AgentMobileView: React.FC = () => {
  const {
    currentUser,
    customers,
    loans,
    collections,
    recordCollection,
    cloudinaryConfig,
  } = useFinance();

  // Assigned customers and active loans for current agent
  const assignedCustomers = customers.filter(
    (c) => c.assignedAgentId === currentUser.id
  );

  const activeAssignedLoans = loans.filter((l) =>
    assignedCustomers.some((c) => c.id === l.customerId) && (l.status === 'ACTIVE' || l.status === 'OVERDUE')
  );

  // Agent Daily Target
  const target = currentUser.targetDailyCollection || 25000;
  const todayStr = new Date().toISOString().slice(0, 10);
  const myTodayCollections = collections.filter(
    (c) => c.agentId === currentUser.id && c.collectedAt.startsWith(todayStr)
  );
  const todayCollectedSum = myTodayCollections.reduce((acc, c) => acc + c.amount, 0);
  const progressPercent = Math.min(100, Math.round((todayCollectedSum / target) * 100));

  // Quick Collect State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(2400);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [remarks, setRemarks] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState<string | undefined>();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);

  // Receipt popup state after collection
  const [recentReceipt, setRecentReceipt] = useState<any | null>(null);

  const handleOpenCollectModal = (customer: Customer, loan: Loan) => {
    setSelectedCustomer(customer);
    setSelectedLoan(loan);
    // Suggest default installment
    const installmentDue = Math.round(
      loan.principalAmount / loan.tenureCount + loan.principalAmount * (loan.interestRate / 100)
    );
    setCollectAmount(installmentDue);
    setRemarks(`Installment payment collected from ${customer.name}`);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const res = await uploadToCloudinary(file, cloudinaryConfig);
    setProofImageUrl(res.url);
    setIsUploadingPhoto(false);
  };

  const handleExecuteCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan || !selectedCustomer) return;

    setIsCollecting(true);
    try {
      // 1. Auto capture GPS coordinates
      const gps = await getCurrentGpsLocation();

      // 2. Record collection with distribution
      const savedCollection = await recordCollection({
        loanId: selectedLoan.id,
        amount: collectAmount,
        paymentMethod,
        latitude: gps.latitude,
        longitude: gps.longitude,
        accuracyMeters: gps.accuracy,
        locationAddress: gps.address,
        deviceInfo: `${navigator.platform} Mobile Agent App v2.4`,
        remarks: remarks || 'Field collection on time',
        proofImageUrl,
      });

      // 3. Trigger victory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#14b8a6', '#06b6d4'],
      });

      // 4. Open instant digital receipt
      setRecentReceipt({
        collection: savedCollection,
        customer: selectedCustomer,
        loan: selectedLoan,
        agent: currentUser,
      });

      // Close modal
      setSelectedCustomer(null);
      setSelectedLoan(null);
    } catch (err) {
      alert('Error recording collection: ' + err);
    } finally {
      setIsCollecting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-16">
      {/* Agent Header Profile Card */}
      <div className="glass-card rounded-3xl p-5 border-emerald-500/20 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
              alt={currentUser.name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-base text-white">{currentUser.name}</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Agent ID: <strong className="text-slate-200">{currentUser.id}</strong></span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">GPS Active</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Total</span>
            <span className="text-xl font-black text-emerald-400">
              ₹{todayCollectedSum.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Target Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-300">Daily Target Completion</span>
            <span className="text-emerald-400">{progressPercent}% (₹{todayCollectedSum.toLocaleString()} / ₹{target.toLocaleString()})</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Due Customer List Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Assigned Collection Queue ({activeAssignedLoans.length})
          </h3>
          <p className="text-[11px] text-slate-400">
            Field route with one-tap payment collection & GPS verification
          </p>
        </div>
      </div>

      {/* Assigned Customers Cards */}
      <div className="space-y-3">
        {activeAssignedLoans.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-slate-400 text-xs">
            No pending collections assigned to you today.
          </div>
        ) : (
          activeAssignedLoans.map((loan) => {
            const customer = assignedCustomers.find((c) => c.id === loan.customerId);
            if (!customer) return null;

            const isOverdue = loan.status === 'OVERDUE';
            const installmentAmount = Math.round(
              loan.principalAmount / loan.tenureCount +
                loan.principalAmount * (loan.interestRate / 100)
            );

            return (
              <div
                key={loan.id}
                className={`glass-card rounded-2xl p-4.5 border transition-all ${
                  isOverdue
                    ? 'border-rose-500/40 bg-rose-950/20'
                    : 'border-slate-800 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={customer.photoUrl}
                      alt={customer.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{customer.name}</h4>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isOverdue
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {isOverdue ? `${loan.daysOverdue}D OVERDUE` : `${loan.loanType}`}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-xs">{customer.address}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        Loan: <span className="text-emerald-400">{loan.loanCode}</span> • Prin Bal: ₹{loan.principalOutstanding.toLocaleString()}
                        {loan.penaltyOutstanding > 0 && (
                          <span className="text-rose-400 font-bold ml-1.5">
                            (Pen: ₹{loan.penaltyOutstanding})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">Due Installment</span>
                    <span className="text-sm font-black text-white">
                      ₹{installmentAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${customer.mobile}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Call Borrower</span>
                  </a>

                  <button
                    onClick={() => handleOpenCollectModal(customer, loan)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Collect Payment &rarr;</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Collection Modal */}
      {selectedCustomer && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  Field Collection Entry
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedCustomer.name} ({selectedLoan.loanCode})
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setSelectedLoan(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteCollection} className="mt-4 space-y-4">
              {/* Amount Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Collected Amount (INR) *
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  step="100"
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-lg font-black text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Payment Allocation Simulation Preview */}
              {(() => {
                const dist = calculatePaymentDistribution(
                  collectAmount,
                  selectedLoan.penaltyOutstanding,
                  selectedLoan.interestOutstanding,
                  selectedLoan.principalOutstanding
                );
                return (
                  <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">
                      Automatic 3-Tier Allocation Preview
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-slate-800">
                        <span className="text-[10px] text-rose-400 block font-semibold">1. Penalty</span>
                        <span className="font-mono font-bold text-white">₹{dist.penaltyPaid}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-800">
                        <span className="text-[10px] text-teal-400 block font-semibold">2. Interest</span>
                        <span className="font-mono font-bold text-white">₹{dist.interestPaid}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-800">
                        <span className="text-[10px] text-emerald-400 block font-semibold">3. Principal</span>
                        <span className="font-mono font-bold text-white">₹{dist.principalPaid}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CASH', 'UPI', 'BANK_TRANSFER'] as PaymentMethod[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMethod(mode)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                        paymentMethod === mode
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Proof Upload (Cloudinary) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Collection Proof Photo (Optional)
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500 bg-slate-800/40 cursor-pointer transition">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-slate-300">
                      {isUploadingPhoto ? 'Uploading to Cloudinary...' : proofImageUrl ? 'Photo Attached' : 'Capture or Upload Receipt'}
                    </span>
                  </div>
                  {proofImageUrl && (
                    <img src={proofImageUrl} alt="proof" className="w-7 h-7 rounded object-cover" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Field Agent Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid in cash at shop location"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* GPS Stamp Notice */}
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>GPS coordinates & device stamp will be auto-attached for audit compliance.</span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isCollecting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-xl shadow-emerald-500/25 transition flex items-center justify-center gap-2"
              >
                {isCollecting ? (
                  <span>Verifying GPS & Saving...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Generate Receipt</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Digital Thermal Receipt Modal */}
      {recentReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="font-extrabold text-lg text-white">Payment Collected!</h3>
            <p className="text-xs text-emerald-400 font-semibold mt-0.5">
              Receipt #{recentReceipt.collection.receiptNumber}
            </p>

            <div className="my-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer</span>
                <span className="font-bold text-white">{recentReceipt.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Loan Code</span>
                <span className="font-mono text-emerald-400">{recentReceipt.loan.loanCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Paid</span>
                <span className="font-black text-emerald-400 text-sm">
                  ₹{recentReceipt.collection.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-700/80 text-[10px] text-slate-400">
                GPS: {recentReceipt.collection.latitude}, {recentReceipt.collection.longitude}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  const doc = generateCollectionReceiptPDF(
                    recentReceipt.collection,
                    recentReceipt.customer,
                    recentReceipt.loan,
                    recentReceipt.agent
                  );
                  doc.save(`Receipt_${recentReceipt.collection.receiptNumber}.pdf`);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Receipt</span>
              </button>

              <button
                onClick={() => setRecentReceipt(null)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Done / Next Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
