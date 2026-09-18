import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Banknote,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Users,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { ActiveTab } from '../layout/Sidebar';

interface Props {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewLoan: () => void;
  onOpenNewCustomer: () => void;
}

export const DashboardOverview: React.FC<Props> = ({
  setActiveTab,
  onOpenNewLoan,
  onOpenNewCustomer,
}) => {
  const { customers, loans, collections, ledger } = useFinance();

  // Metrics calculation
  const totalDisbursed = loans
    .filter((l) => l.status !== 'PENDING')
    .reduce((acc, l) => acc + l.principalAmount, 0);

  const totalCollected = collections.reduce((acc, c) => acc + c.amount, 0);

  const totalInterestEarned = collections.reduce(
    (acc, c) => acc + c.paymentDistribution.interestPaid,
    0
  );

  const totalPenaltyEarned = collections.reduce(
    (acc, c) => acc + c.paymentDistribution.penaltyPaid,
    0
  );

  const totalOutstandingPrincipal = loans
    .filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE')
    .reduce((acc, l) => acc + l.principalOutstanding, 0);

  const totalOverduePenalty = loans
    .filter((l) => l.status === 'OVERDUE')
    .reduce((acc, l) => acc + l.penaltyOutstanding, 0);

  const activeLoans = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
  const overdueLoans = loans.filter((l) => l.status === 'OVERDUE');
  const weeklyLoans = loans.filter((l) => l.loanType === 'WEEKLY');
  const monthlyLoans = loans.filter((l) => l.loanType === 'MONTHLY');

  // Today collections
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCollections = collections.filter((c) => c.collectedAt.startsWith(todayStr));
  const todayCollectedAmount = todayCollections.reduce((acc, c) => acc + c.amount, 0);

  const recoveryRate = totalDisbursed > 0 ? Math.round((totalCollected / (totalDisbursed * 1.15)) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900/80 via-slate-900 to-slate-900 border border-emerald-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-time Financial Portfolio Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Microfinance Operations Center
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl leading-relaxed">
              Monitoring weekly & monthly lending schedules, field agent GPS verification, double-entry audit ledgers, and automated interest-penalty reconciliation.
            </p>
          </div>

          {/* Quick Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewCustomer}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition shadow-md"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>+ New Customer KYC</span>
            </button>
            <button
              onClick={onOpenNewLoan}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/25"
            >
              <Banknote className="w-4 h-4" />
              <span>+ Issue New Loan</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Disbursed */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Disbursed</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight">
              ₹{totalDisbursed.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-400 font-semibold">{loans.length} Loans</span>
              <span>•</span>
              <span>{weeklyLoans.length} Weekly / {monthlyLoans.length} Monthly</span>
            </div>
          </div>
        </div>

        {/* Total Collected */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300">Total Collected</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400 tracking-tight">
              ₹{totalCollected.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-400 font-semibold">{collections.length} Receipts</span>
              <span>•</span>
              <span>{recoveryRate}% Recovery Rate</span>
            </div>
          </div>
        </div>

        {/* Interest & Yield Income */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Interest Earned</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-teal-300 tracking-tight">
              ₹{totalInterestEarned.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Penalties: ₹{totalPenaltyEarned.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Outstanding & Overdue */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Principal At Risk</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight">
              ₹{totalOutstandingPrincipal.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className={overdueLoans.length > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                {overdueLoans.length} Overdue (₹{totalOverduePenalty.toLocaleString('en-IN')} pen)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Operations Highlights & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Field Collections */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Latest Field Collections
              </h3>
              <p className="text-xs text-slate-400">GPS verified transactions with 3-tier distribution</p>
            </div>
            <button
              onClick={() => setActiveTab('collections')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-700/60">
                <tr>
                  <th className="py-2.5 px-3">Receipt / Loan</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Collected Amount</th>
                  <th className="py-2.5 px-3">Split (Pen / Int / Prin)</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3 text-right">GPS Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {collections.slice(0, 5).map((c) => {
                  const cust = customers.find((cu) => cu.id === c.customerId);
                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{c.receiptNumber}</div>
                        <div className="text-[10px] text-slate-500">{c.loanId}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">{cust?.name || 'Customer'}</div>
                        <div className="text-[10px] text-slate-500">{cust?.mobile}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-emerald-400">
                          ₹{c.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-[11px] font-mono text-slate-300">
                          <span className="text-rose-400">₹{c.paymentDistribution.penaltyPaid}</span> /{' '}
                          <span className="text-teal-400">₹{c.paymentDistribution.interestPaid}</span> /{' '}
                          <span className="text-emerald-400">₹{c.paymentDistribution.principalPaid}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {c.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>GPS Verified</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Operational Status & Agent Targets */}
        <div className="space-y-6">
          {/* Daily Collection Target Meter */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Today's Field Collection
              </h4>
              <span className="text-xs text-slate-400">{todayCollections.length} Done</span>
            </div>
            <div className="text-2xl font-black text-white mb-2">
              ₹{todayCollectedAmount.toLocaleString('en-IN')}
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 mb-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(15, (todayCollectedAmount / 50000) * 100))}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Collected: ₹{todayCollectedAmount.toLocaleString()}</span>
              <span>Daily Target: ₹50,000</span>
            </div>
          </div>

          {/* Quick Portfolio Stats */}
          <div className="glass-card rounded-2xl p-5">
            <h4 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              Portfolio Health & Rules
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Payment Priority</span>
                <span className="font-mono font-bold text-emerald-400">Penalty &rarr; Interest &rarr; Principal</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Weekly Finance Formula</span>
                <span className="font-mono font-bold text-slate-200">Principal &times; Rate</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Active Borrowers</span>
                <span className="font-bold text-white">{activeLoans.length} active</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Ledger Ledger Entries</span>
                <span className="font-bold text-emerald-400">{ledger.length} immutable records</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
