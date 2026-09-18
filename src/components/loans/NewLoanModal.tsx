import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { LoanType, PenaltyType } from '../../types';
import { X, Banknote, Calculator, ShieldAlert } from 'lucide-react';
import { calculateExpectedInterest } from '../../services/financeEngine';

interface Props {
  onClose: () => void;
}

export const NewLoanModal: React.FC<Props> = ({ onClose }) => {
  const { customers, agents, createLoan } = useFinance();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [loanType, setLoanType] = useState<LoanType>('WEEKLY');
  const [principalAmount, setPrincipalAmount] = useState<number>(20000);
  const [interestRate, setInterestRate] = useState<number>(2); // 2% weekly or 5% monthly
  const [tenureCount, setTenureCount] = useState<number>(10); // 10 weeks or 12 months
  const [assignedAgentId, setAssignedAgentId] = useState(agents[0]?.id || 'USR-AGT-01');
  const [penaltyType, setPenaltyType] = useState<PenaltyType>('DAILY_FIXED');
  const [penaltyRateOrAmount, setPenaltyRateOrAmount] = useState<number>(50);

  // Live Interest math calculations
  const expectedInterest = calculateExpectedInterest(
    principalAmount,
    interestRate,
    loanType,
    tenureCount
  );
  const totalRepayment = principalAmount + expectedInterest;
  const installmentAmount = Math.round(totalRepayment / tenureCount);

  // Quick preset loader
  const handleLoanTypeChange = (type: LoanType) => {
    setLoanType(type);
    if (type === 'WEEKLY') {
      setPrincipalAmount(20000);
      setInterestRate(2); // 2% per week
      setTenureCount(10); // 10 weeks
      setPenaltyType('DAILY_FIXED');
      setPenaltyRateOrAmount(50);
    } else {
      setPrincipalAmount(50000);
      setInterestRate(5); // 5% per month
      setTenureCount(6); // 6 months
      setPenaltyType('DAILY_FIXED');
      setPenaltyRateOrAmount(50);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createLoan({
      customerId,
      loanType,
      principalAmount,
      interestRate,
      tenureCount,
      assignedAgentId,
      penaltyType,
      penaltyRateOrAmount,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create New Loan Proposal</h2>
              <p className="text-xs text-slate-400">
                Weekly & Monthly finance interest schedules & penalty settings
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

        <form onSubmit={handleCreate} className="mt-6 space-y-6">
          {/* Loan Scheme Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Finance Scheme
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleLoanTypeChange('WEEKLY')}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  loanType === 'WEEKLY'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="text-xs font-bold text-emerald-400">Weekly Finance</div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  Formula: Principal &times; Weekly Rate (e.g. 2% / week)
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleLoanTypeChange('MONTHLY')}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  loanType === 'MONTHLY'
                    ? 'bg-teal-600/20 border-teal-500 text-white shadow-lg'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="text-xs font-bold text-teal-400">Monthly Finance</div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  Formula: Principal &times; Monthly Rate (e.g. 5% / month)
                </div>
              </button>
            </div>
          </div>

          {/* Customer & Agent Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Customer *
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.customerCode}) - {c.mobile}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Collection Agent *
              </label>
              <select
                value={assignedAgentId}
                onChange={(e) => setAssignedAgentId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} ({ag.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Principal, Rate, Tenure Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Principal Amount (INR) *
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Interest Rate ({loanType === 'WEEKLY' ? '% Weekly' : '% Monthly'}) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tenure ({loanType === 'WEEKLY' ? 'Weeks' : 'Months'}) *
              </label>
              <input
                type="number"
                min="1"
                max="52"
                value={tenureCount}
                onChange={(e) => setTenureCount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Penalty Rules */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mb-2">
              <ShieldAlert className="w-4 h-4" /> Overdue & Penalty Configuration
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Penalty Policy</label>
                <select
                  value={penaltyType}
                  onChange={(e) => setPenaltyType(e.target.value as PenaltyType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="DAILY_FIXED">Fixed Daily Penalty (e.g. ₹50/day)</option>
                  <option value="MONTHLY_PERCENTAGE">Monthly Percentage Penalty (e.g. 2%/month)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {penaltyType === 'DAILY_FIXED' ? 'Penalty Amount per Day (INR)' : 'Penalty Rate % per Month'}
                </label>
                <input
                  type="number"
                  value={penaltyRateOrAmount}
                  onChange={(e) => setPenaltyRateOrAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Real-time Calculation Summary Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-3">
              <Calculator className="w-4 h-4" /> Loan Repayment Projection
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Principal</span>
                <span className="font-bold text-white">₹{principalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Total Interest</span>
                <span className="font-bold text-emerald-400">₹{expectedInterest.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Total Repayment</span>
                <span className="font-bold text-white">₹{totalRepayment.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Per Installment</span>
                <span className="font-bold text-teal-300">₹{installmentAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
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
              Generate Loan Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
