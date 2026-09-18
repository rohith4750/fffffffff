import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Phone,
  CheckCircle2,
  Receipt,
  Download,
  UploadCloud,
  Sparkles,
  X,
  Lock,
  Navigation,
  RotateCw,
  QrCode,
  Compass,
  MessageSquare,
  Share2,
  Store,
  Calendar,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  Users,
  User as UserIcon,
  CreditCard,
  Check,
  ArrowLeft,
  FileText,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { getCurrentGpsLocation } from '../../services/geolocationService';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { generateCollectionReceiptPDF } from '../../services/receiptGenerator';
import confetti from 'canvas-confetti';
import { Customer, Loan } from '../../types';
import { AgentPinLogin } from './AgentPinLogin';

type AgentScreen = 'DASHBOARD' | 'RECORD_PAYMENT' | 'CUSTOMER_DETAILS';
type BottomNavTab = 'dashboard' | 'customers' | 'collections' | 'profile';

export const AgentMobileView: React.FC = () => {
  const {
    currentUser,
    customers,
    loans,
    recordCollection,
    cloudinaryConfig,
    resetToSampleData,
  } = useFinance();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<AgentScreen>('DASHBOARD');
  const [activeBottomTab, setActiveBottomTab] = useState<BottomNavTab>('dashboard');

  // Selected entities for Details / Collection
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [activeLoan, setActiveLoan] = useState<Loan | null>(null);

  // Payment Form States
  const [collectAmount, setCollectAmount] = useState<number>(1200);
  const [amountPreset, setAmountPreset] = useState<'FULL' | 'HALF' | 'CUSTOM'>('FULL');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI'>('CASH');
  const [sendWhatsApp, setSendWhatsApp] = useState<boolean>(true);
  const [remarks, setRemarks] = useState<string>('Customer paid in cash');
  const [proofImageUrl, setProofImageUrl] = useState<string | undefined>();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);

  // Modals
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showRouteMapModal, setShowRouteMapModal] = useState(false);
  const [showGovernanceAccordion, setShowGovernanceAccordion] = useState(false);
  const [recentReceipt, setRecentReceipt] = useState<any | null>(null);

  // Filtered collections & loans for this agent
  const myAssignedCustomers = customers.filter(
    (c) => c.assignedAgentId === currentUser.id || currentUser.role === 'ADMIN'
  );

  // Today target statistics matching design
  const targetAmount = 45000;
  const targetCollected = 28500;
  const targetPercent = Math.round((targetCollected / targetAmount) * 100); // 63%

  const cashPhysical = 22000;
  const cashUpi = 6500;

  if (!isUnlocked) {
    return <AgentPinLogin onSuccess={() => setIsUnlocked(true)} />;
  }

  // Navigation handlers
  const handleOpenCustomerDetails = (customer: Customer, loan?: Loan) => {
    setActiveCustomer(customer);
    const customerLoan = loan || loans.find((l) => l.customerId === customer.id && (l.status === 'ACTIVE' || l.status === 'OVERDUE'));
    setActiveLoan(customerLoan || null);
    setCurrentScreen('CUSTOMER_DETAILS');
  };

  const handleOpenRecordPayment = (customer: Customer, loan?: Loan, customAmount?: number) => {
    setActiveCustomer(customer);
    const customerLoan = loan || loans.find((l) => l.customerId === customer.id && (l.status === 'ACTIVE' || l.status === 'OVERDUE'));
    setActiveLoan(customerLoan || null);

    const defaultDue = customAmount || (customerLoan ? Math.round(customerLoan.principalAmount / customerLoan.tenureCount + customerLoan.principalAmount * (customerLoan.interestRate / 100)) : 1200);
    setCollectAmount(defaultDue);
    setAmountPreset('FULL');
    setRemarks(`Customer paid in cash`);
    setCurrentScreen('RECORD_PAYMENT');
  };

  const handlePresetSelect = (preset: 'FULL' | 'HALF' | 'CUSTOM') => {
    setAmountPreset(preset);
    if (!activeLoan) return;
    const fullInstallment = Math.round(
      activeLoan.principalAmount / activeLoan.tenureCount +
        activeLoan.principalAmount * (activeLoan.interestRate / 100)
    ) || 1200;

    if (preset === 'FULL') {
      setCollectAmount(fullInstallment);
    } else if (preset === 'HALF') {
      setCollectAmount(Math.round(fullInstallment / 2));
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const res = await uploadToCloudinary(file, cloudinaryConfig);
    setProofImageUrl(res.url);
    setIsUploadingPhoto(false);
  };

  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer) return;

    setIsCollecting(true);
    try {
      const gps = await getCurrentGpsLocation();
      const loanToUse = activeLoan || loans.find((l) => l.customerId === activeCustomer.id) || loans[0];

      const savedCollection = await recordCollection({
        loanId: loanToUse.id,
        amount: collectAmount,
        paymentMethod: paymentMethod === 'CASH' ? 'CASH' : 'UPI',
        latitude: gps.latitude,
        longitude: gps.longitude,
        accuracyMeters: gps.accuracy,
        locationAddress: gps.address || activeCustomer.address,
        deviceInfo: `${navigator.platform} Mobile Agent App v2.4`,
        remarks: remarks || (paymentMethod === 'CASH' ? 'Customer paid in cash' : 'Paid via UPI QR'),
        proofImageUrl,
      });

      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#10b981', '#f59e0b'],
      });

      setRecentReceipt({
        collection: savedCollection,
        customer: activeCustomer,
        loan: loanToUse,
        agent: currentUser,
        sendWhatsApp,
      });

      setCurrentScreen('DASHBOARD');
    } catch (err) {
      alert('Payment collection error: ' + err);
    } finally {
      setIsCollecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/40 sm:py-6 flex justify-center">
      {/* Mobile Device Mockup Container */}
      <div className="w-full max-w-md bg-white text-slate-900 sm:rounded-[36px] shadow-2xl overflow-hidden flex flex-col relative border border-slate-200/80 min-h-[92vh]">
        
        {/* ========================================================================= */}
        {/* SCREEN 1: DASHBOARD / ASSIGNED QUEUE */}
        {/* ========================================================================= */}
        {currentScreen === 'DASHBOARD' && (
          <div className="flex-1 overflow-y-auto pb-24 p-4 space-y-4 animate-in fade-in">
            {/* Top Agent Profile Header */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-bold text-base text-slate-900">{currentUser.name || 'Rajesh Kumar'}</h2>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Field Agent • {currentUser.assignedArea || 'North Route'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    resetToSampleData();
                    confetti({ particleCount: 30, spread: 50, origin: { y: 0.2 } });
                  }}
                  title="Refresh Queue"
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsUnlocked(false)}
                  title="Lock Agent App"
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  <Lock className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Dark Navy Today's Target Card */}
            <div className="bg-[#111827] text-white rounded-[26px] p-5 shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    TODAY'S TARGET
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-white tracking-tight">₹{targetCollected.toLocaleString('en-IN')}</span>
                    <span className="text-slate-400 text-sm font-semibold">/ ₹{targetAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#2563eb] text-white text-xs font-bold shadow-sm">
                  {targetPercent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5">
                <div
                  className="bg-[#22c55e] h-full rounded-full transition-all duration-1000 shadow-sm"
                  style={{ width: `${targetPercent}%` }}
                ></div>
              </div>

              {/* Stats row */}
              <div className="pt-3 border-t border-slate-800 flex justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Collected</div>
                  <div className="text-2xl font-black text-white">12</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400 font-medium">Pending</div>
                  <div className="text-2xl font-black text-white">6</div>
                </div>
              </div>
            </div>

            {/* Action Buttons: Scan QR & Route Map */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowQrScanner(true)}
                className="py-3 px-4 rounded-2xl bg-[#1d4ed8] hover:bg-blue-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan QR to Collect</span>
              </button>

              <button
                onClick={() => setShowRouteMapModal(true)}
                className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Route Map</span>
              </button>
            </div>

            {/* Assigned Queue Section Header */}
            <div className="flex items-center justify-between pt-1">
              <h3 className="font-extrabold text-base text-slate-900">Assigned Queue</h3>
              <span className="text-xs text-slate-500 font-medium">Nearest first</span>
            </div>

            {/* Queue List Cards */}
            <div className="space-y-3">
              
              {/* Card 1: Ramesh Patel (Due Today) */}
              {(() => {
                const ramesh = myAssignedCustomers.find((c) => c.name.includes('Ramesh')) || myAssignedCustomers[0];
                return (
                  <div
                    onClick={() => ramesh && handleOpenCustomerDetails(ramesh)}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition cursor-pointer space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{ramesh?.name || 'Ramesh Patel'}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Sector 14, Main Market • 0.4 km</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-900">₹1,200</span>
                      </div>
                    </div>

                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 pt-1"
                    >
                      <a
                        href={`tel:${ramesh?.mobile || '+919820144521'}`}
                        className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition flex items-center justify-center"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://maps.google.com/?q=${ramesh?.latitude || 19.0330},${ramesh?.longitude || 73.0297}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition flex items-center justify-center"
                      >
                        <Navigation className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => ramesh && handleOpenRecordPayment(ramesh, undefined, 1200)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-black hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Collect ₹1,200</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Card 2: Priya Sharma (OVERDUE) */}
              {(() => {
                const priya = myAssignedCustomers.find((c) => c.name.includes('Priya')) || myAssignedCustomers[1];
                return (
                  <div
                    onClick={() => priya && handleOpenCustomerDetails(priya)}
                    className="p-4 rounded-2xl bg-white border-l-4 border-l-[#dc2626] border-y border-r border-slate-200/90 shadow-sm hover:shadow-md transition cursor-pointer space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{priya?.name || 'Priya Sharma'}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                            OVERDUE
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Block C, Green Park • 1.2 km</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-[#dc2626]">₹4,500</span>
                      </div>
                    </div>

                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 pt-1"
                    >
                      <a
                        href={`tel:${priya?.mobile || '+919849123456'}`}
                        className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition flex items-center justify-center"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://maps.google.com/?q=${priya?.latitude || 19.0380},${priya?.longitude || 73.0320}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition flex items-center justify-center"
                      >
                        <Navigation className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => priya && handleOpenRecordPayment(priya, undefined, 4500)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#b91c1c] hover:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Collect ₹4,500</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Card 3: Ankit Verma (COMPLETED TODAY) */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">Ankit Verma</h4>
                    <p className="text-[11px] text-slate-400">Paid 09:42 AM • Receipt #7019</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-600">₹850</span>
                </div>
              </div>

              {/* Card 4: Sunita Devi */}
              {(() => {
                const sunita = myAssignedCustomers.find((c) => c.name.includes('Sunita')) || myAssignedCustomers[3];
                return (
                  <div
                    onClick={() => sunita && handleOpenCustomerDetails(sunita)}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition cursor-pointer space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{sunita?.name || 'Sunita Devi'}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Subhash Nagar Lane 3 • 2.8 km</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-900">₹1,500</span>
                      </div>
                    </div>

                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 pt-1"
                    >
                      <a
                        href={`tel:${sunita?.mobile || '+919618023456'}`}
                        className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition flex items-center justify-center"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://maps.google.com/?q=${sunita?.latitude || 19.0450},${sunita?.longitude || 73.0400}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition flex items-center justify-center"
                      >
                        <Navigation className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => sunita && handleOpenRecordPayment(sunita, undefined, 1500)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-black hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Collect ₹1,500</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Bottom Cash in Hand Container */}
            <div className="bg-[#eff6ff] rounded-[24px] p-4 border border-blue-100/90 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-900">Cash in Hand</h4>
                <span className="text-xs text-slate-500 font-medium">HDFC Branch #12</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-blue-100/60 shadow-sm">
                  <div className="text-[11px] font-semibold text-slate-500">Physical Cash</div>
                  <div className="text-xl font-black text-slate-900 mt-1">₹{cashPhysical.toLocaleString('en-IN')}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-blue-100/60 shadow-sm">
                  <div className="text-[11px] font-semibold text-slate-500">UPI Payments</div>
                  <div className="text-xl font-black text-slate-900 mt-1">₹{cashUpi.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 2: RECORD PAYMENT */}
        {/* ========================================================================= */}
        {currentScreen === 'RECORD_PAYMENT' && (
          <div className="flex-1 overflow-y-auto pb-24 p-4 space-y-4 animate-in fade-in">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentScreen('DASHBOARD')}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                    P.
                  </div>
                  <h2 className="font-bold text-base text-slate-900">Record Payment</h2>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                  alt="Agent"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
            </div>

            {/* Active Collection Header */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-600 tracking-wider">ACTIVE COLLECTION</span>
                <span className="text-slate-500 font-medium">ID: #{activeCustomer?.customerCode?.slice(-4) || '8821'}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                {activeCustomer?.name || 'Ramesh Patel'}
              </h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900">₹{collectAmount.toLocaleString('en-IN')}</span>
                <span className="text-rose-600 font-bold text-sm">Due Today</span>
              </div>
            </div>

            <form onSubmit={handleExecutePayment} className="space-y-4 pt-1">
              {/* Card 1: Collection Amount */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                <label className="block text-xs font-semibold text-slate-600">Collection Amount</label>
                
                <div className="bg-[#eff6ff] rounded-xl p-3 flex items-center justify-between border border-blue-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-900">₹</span>
                    <input
                      type="number"
                      required
                      min="100"
                      value={collectAmount}
                      onChange={(e) => {
                        setCollectAmount(Number(e.target.value));
                        setAmountPreset('CUSTOM');
                      }}
                      className="bg-transparent font-black text-2xl text-slate-900 focus:outline-none w-48"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCollectAmount(0)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Preset Chips */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handlePresetSelect('FULL')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                      amountPreset === 'FULL'
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-blue-50 hover:bg-blue-100 text-slate-800'
                    }`}
                  >
                    Full (₹1,200)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetSelect('HALF')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                      amountPreset === 'HALF'
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-blue-50 hover:bg-blue-100 text-slate-800'
                    }`}
                  >
                    Half (₹600)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmountPreset('CUSTOM')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                      amountPreset === 'CUSTOM'
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-blue-50 hover:bg-blue-100 text-slate-800'
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {/* Card 2: Payment Method */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                <label className="block text-xs font-semibold text-slate-600">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      paymentMethod === 'CASH'
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-blue-50 hover:bg-blue-100 text-slate-800'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      paymentMethod === 'UPI'
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-blue-50 hover:bg-blue-100 text-slate-800'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>UPI / Online</span>
                  </button>
                </div>
              </div>

              {/* Card 3: GPS Location Verification */}
              <div className="p-3.5 rounded-2xl bg-[#eff6ff] border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-800">
                    GPS Location verified ({activeCustomer?.address ? activeCustomer.address.split(',')[0] : 'Shop 14, Main Market'})
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">10:15 AM</span>
              </div>

              {/* Card 4: Remarks */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Customer paid in cash"
                  className="w-full text-xs font-medium text-slate-800 focus:outline-none bg-transparent"
                />
              </div>

              {/* Cloudinary Photo Proof (Optional) */}
              <label className="flex items-center justify-between p-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-slate-600 font-medium">
                    {isUploadingPhoto ? 'Uploading to Cloudinary...' : proofImageUrl ? 'Receipt Photo Attached' : 'Capture Receipt Photo (Optional)'}
                  </span>
                </div>
                {proofImageUrl && (
                  <img src={proofImageUrl} alt="Proof" className="w-8 h-8 rounded-lg object-cover" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isUploadingPhoto}
                  className="hidden"
                />
              </label>

              {/* Bottom Sticky Action Area */}
              <div className="pt-2 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={sendWhatsApp}
                    onChange={(e) => setSendWhatsApp(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="text-emerald-600">💬</span>
                    <span>Send WhatsApp receipt to {activeCustomer?.name?.split(' ')[0] || 'Ramesh'}</span>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isCollecting}
                  className="w-full py-3.5 px-4 rounded-2xl bg-black hover:bg-slate-900 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                >
                  {isCollecting ? (
                    <span>Verifying GPS & Recording...</span>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4" />
                      <span>Confirm ₹{collectAmount.toLocaleString('en-IN')} Payment & Send Receipt</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 3: CUSTOMER DETAILS */}
        {/* ========================================================================= */}
        {currentScreen === 'CUSTOMER_DETAILS' && (
          <div className="flex-1 overflow-y-auto pb-24 p-4 space-y-4 animate-in fade-in">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentScreen('DASHBOARD')}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                    P.
                  </div>
                  <h2 className="font-bold text-base text-slate-900">Customer Details</h2>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                  alt="Agent"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
            </div>

            {/* Customer Profile Card */}
            <div className="p-4 rounded-[26px] bg-white border border-slate-200/90 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activeCustomer?.photoUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200'}
                    alt={activeCustomer?.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                  />
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{activeCustomer?.name || 'Ramesh Patel'}</h3>
                    <p className="text-xs text-slate-500 font-medium">{activeCustomer?.mobile || '+91 98201 44521'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${activeCustomer?.mobile || '+919820144521'}`}
                    className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://wa.me/${activeCustomer?.mobile?.replace(/\D/g, '') || '919820144521'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-blue-50 text-emerald-600 hover:bg-emerald-50 transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                <Store className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{activeCustomer?.address || 'Shop 14, Main Market, Sector 14, Navi Mumbai'}</span>
              </div>

              {/* Directions & Distance Pill */}
              <a
                href={`https://maps.google.com/?q=${activeCustomer?.latitude || 19.0330},${activeCustomer?.longitude || 73.0297}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-[#eff6ff] text-blue-600 hover:bg-blue-100 transition flex items-center justify-between text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  <span>Directions & Map</span>
                </div>
                <span className="text-slate-500 font-medium">0.4 km away</span>
              </a>
            </div>

            {/* Financial Overview Card */}
            <div className="p-4 rounded-[26px] bg-white border border-slate-200/90 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Financial Overview</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  {activeLoan?.loanCode || 'Loan #LN-2024-88'}
                </span>
              </div>

              {/* Outstanding Balance Block */}
              <div className="p-4 rounded-2xl bg-[#eff6ff] border border-blue-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    OUTSTANDING BALANCE
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1">
                    <span>⏰</span>
                    <span>₹1,200 Due Today</span>
                  </span>
                </div>

                <div className="text-3xl font-black text-slate-900">
                  ₹{(activeLoan?.principalOutstanding ? activeLoan.principalOutstanding + activeLoan.interestOutstanding : 9600).toLocaleString('en-IN')}.00
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Repaid ₹14,400 of ₹24,000</span>
                    <span className="text-blue-600">60% Paid</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full w-[60%] transition-all duration-700"></div>
                  </div>
                </div>
              </div>

              {/* Sub Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-[#eff6ff] border border-blue-100">
                  <div className="text-[11px] font-semibold text-slate-500">Weekly Installment</div>
                  <div className="text-lg font-black text-blue-600 mt-0.5">₹1,200</div>
                  <div className="text-[10px] text-slate-400 font-medium">Due cadence: Weekly</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#eff6ff] border border-blue-100">
                  <div className="text-[11px] font-semibold text-slate-500">Loan Tenure</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">20 Weeks</div>
                  <div className="text-[10px] text-slate-400 font-medium">Week 12 of 20</div>
                </div>
              </div>
            </div>

            {/* Installment Schedule Card */}
            <div className="p-4 rounded-[26px] bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Installment Schedule</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">Week 12 of 20</span>
              </div>

              {/* Schedule Items List matching Screenshot 3 */}
              <div className="space-y-2.5 pt-1">
                {/* Item 12: Due Today */}
                <div className="p-3 rounded-2xl bg-[#eff6ff] border-l-4 border-l-blue-600 border-y border-r border-blue-100 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      12
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Installment #12</div>
                      <div className="text-[11px] text-slate-500">Due Today (24 Oct)</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900 text-sm">₹1,200</div>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                      Due Today
                    </span>
                  </div>
                </div>

                {/* Item 11: Paid */}
                <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0">
                      11
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-xs">Installment #11</div>
                      <div className="text-[11px] text-slate-400">Paid on 17 Oct 2024</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-700 text-sm">₹1,200</div>
                    <div className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                      <Check className="w-3 h-3 stroke-[3]" /> Paid
                    </div>
                  </div>
                </div>

                {/* Item 10: Paid */}
                <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0">
                      10
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-xs">Installment #10</div>
                      <div className="text-[11px] text-slate-400">Paid on 10 Oct 2024</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-700 text-sm">₹1,200</div>
                    <div className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                      <Check className="w-3 h-3 stroke-[3]" /> Paid
                    </div>
                  </div>
                </div>

                {/* Item 09: Paid */}
                <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0">
                      09
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-xs">Installment #09</div>
                      <div className="text-[11px] text-slate-400">Paid on 03 Oct 2024</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-700 text-sm">₹1,200</div>
                    <div className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                      <Check className="w-3 h-3 stroke-[3]" /> Paid
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loan Details & Governance (Accordion) */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <button
                type="button"
                onClick={() => setShowGovernanceAccordion(!showGovernanceAccordion)}
                className="w-full flex items-center justify-between text-xs font-extrabold text-slate-800"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Loan Details & Governance</span>
                </div>
                {showGovernanceAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showGovernanceAccordion && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span>Borrower Code:</span>
                    <span className="font-mono font-bold text-slate-900">{activeCustomer?.customerCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Aadhaar UID:</span>
                    <span className="font-mono text-slate-800">{activeCustomer?.aadhaarNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guarantor:</span>
                    <span className="font-medium text-slate-800">{activeCustomer?.guarantorName} ({activeCustomer?.guarantorRelationship})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Penalty Rate:</span>
                    <span className="text-slate-800 font-semibold">₹50/Day on overdue installments</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => activeCustomer && handleOpenRecordPayment(activeCustomer, activeLoan || undefined, 1200)}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-[#1d4ed8] hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>Collect ₹1,200 Payment</span>
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `Customer Statement - ${activeCustomer?.name}`,
                      text: `Outstanding balance for ${activeCustomer?.name}: ₹9,600. Due today: ₹1,200.`,
                    }).catch(() => {});
                  } else {
                    alert('Sharing customer overview link');
                  }
                }}
                className="p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FIXED BOTTOM NAVIGATION BAR */}
        {/* ========================================================================= */}
        <div className="absolute bottom-0 inset-x-0 bg-white border-t border-slate-200/90 py-2.5 px-6 flex items-center justify-between z-20 shadow-lg">
          <button
            onClick={() => {
              setActiveBottomTab('dashboard');
              setCurrentScreen('DASHBOARD');
            }}
            className={`flex flex-col items-center gap-1 transition ${
              activeBottomTab === 'dashboard' ? 'text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px]">Dashboard</span>
          </button>

          <button
            onClick={() => {
              setActiveBottomTab('customers');
              const ramesh = myAssignedCustomers[0];
              if (ramesh) handleOpenCustomerDetails(ramesh);
            }}
            className={`flex flex-col items-center gap-1 transition ${
              activeBottomTab === 'customers' ? 'text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px]">Customers</span>
          </button>

          <button
            onClick={() => {
              setActiveBottomTab('collections');
              setCurrentScreen('DASHBOARD');
            }}
            className={`flex flex-col items-center gap-1 relative transition ${
              activeBottomTab === 'collections' ? 'text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Receipt className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                8
              </span>
            </div>
            <span className="text-[10px]">Collections</span>
          </button>

          <button
            onClick={() => {
              setActiveBottomTab('profile');
              alert(`Agent: ${currentUser.name}\nTerritory: ${currentUser.assignedArea}\nPIN: ${currentUser.pinCode}`);
            }}
            className={`flex flex-col items-center gap-1 transition ${
              activeBottomTab === 'profile' ? 'text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px]">Profile</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODAL: QR CODE SCANNER */}
        {/* ========================================================================= */}
        {showQrScanner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-sm rounded-[32px] bg-slate-900 border border-slate-800 shadow-2xl p-6 text-center text-white space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-bold text-base flex items-center gap-2 text-white">
                  <QrCode className="w-5 h-5 text-blue-400" />
                  Scan Borrower QR
                </h3>
                <button
                  onClick={() => setShowQrScanner(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative w-64 h-64 mx-auto rounded-2xl bg-black/60 border-2 border-blue-500 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-x-4 top-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-bounce"></div>
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=CUST-1001-RAMESH-PATEL"
                  alt="QR Code"
                  className="w-44 h-44 opacity-90 rounded-lg"
                />
              </div>

              <p className="text-xs text-slate-300">
                Align borrower QR passbook within frame to auto-load customer profile.
              </p>

              <button
                onClick={() => {
                  setShowQrScanner(false);
                  const ramesh = myAssignedCustomers.find((c) => c.name.includes('Ramesh')) || myAssignedCustomers[0];
                  if (ramesh) handleOpenRecordPayment(ramesh, undefined, 1200);
                }}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg"
              >
                Simulate QR Match &rarr; Ramesh Patel
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: ROUTE MAP NAVIGATION */}
        {/* ========================================================================= */}
        {showRouteMapModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md rounded-[32px] bg-slate-900 border border-slate-800 shadow-2xl p-6 text-white space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-bold text-base flex items-center gap-2 text-white">
                  <Compass className="w-5 h-5 text-blue-400" />
                  Optimized Route Map
                </h3>
                <button
                  onClick={() => setShowRouteMapModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {myAssignedCustomers.map((c, idx) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/40">
                        {idx + 1}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-white">{c.name}</h5>
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{c.address}</p>
                      </div>
                    </div>
                    <a
                      href={`https://maps.google.com/?q=${c.latitude},${c.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
                    >
                      Navigate
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: SUCCESS THERMAL RECEIPT */}
        {/* ========================================================================= */}
        {recentReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-sm rounded-[32px] bg-white border border-slate-200 shadow-2xl p-6 text-center text-slate-900 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>

              <h3 className="font-black text-lg text-slate-900">Payment Collected!</h3>
              <p className="text-xs text-emerald-600 font-bold">
                Receipt #{recentReceipt.collection.receiptNumber}
              </p>

              {recentReceipt.sendWhatsApp && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 border border-emerald-200">
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp receipt sent to {recentReceipt.customer.name}</span>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer</span>
                  <span className="font-bold text-slate-900">{recentReceipt.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Loan Code</span>
                  <span className="font-mono font-bold text-blue-600">{recentReceipt.loan.loanCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Paid</span>
                  <span className="font-black text-emerald-600 text-sm">
                    ₹{recentReceipt.collection.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400">
                  GPS: {recentReceipt.collection.latitude}, {recentReceipt.collection.longitude}
                </div>
              </div>

              <div className="space-y-2 pt-2">
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
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-blue-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Receipt</span>
                </button>

                <button
                  onClick={() => setRecentReceipt(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Done / Next Customer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
