import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Award,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { collections, loans, agents, customers } = useFinance();

  const [activeReportTab, setActiveReportTab] = useState<'DAILY' | 'MONTHLY' | 'AGENTS'>('DAILY');

  // Daily Calculations
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCollections = collections.filter((c) => c.collectedAt.startsWith(todayStr));
  const todayCash = todayCollections
    .filter((c) => c.paymentMethod === 'CASH')
    .reduce((sum, c) => sum + c.amount, 0);
  const todayUPI = todayCollections
    .filter((c) => c.paymentMethod === 'UPI')
    .reduce((sum, c) => sum + c.amount, 0);
  const todayBank = todayCollections
    .filter((c) => c.paymentMethod === 'BANK_TRANSFER')
    .reduce((sum, c) => sum + c.amount, 0);
  const todayTotal = todayCash + todayUPI + todayBank;

  // Monthly P&L Calculations
  const totalInterestEarned = collections.reduce(
    (sum, c) => sum + c.paymentDistribution.interestPaid,
    0
  );
  const totalPenaltyEarned = collections.reduce(
    (sum, c) => sum + c.paymentDistribution.penaltyPaid,
    0
  );
  const totalGrossIncome = totalInterestEarned + totalPenaltyEarned;

  const totalDisbursed = loans
    .filter((l) => l.status !== 'PENDING')
    .reduce((sum, l) => sum + l.principalAmount, 0);
  const totalPrincipalRecovered = collections.reduce(
    (sum, c) => sum + c.paymentDistribution.principalPaid,
    0
  );
  const totalPrincipalAtRisk = loans
    .filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE')
    .reduce((sum, l) => sum + l.principalOutstanding, 0);

  // Agent Performance Calculations
  const agentStats = agents.map((agent) => {
    const agentCollections = collections.filter((c) => c.agentId === agent.id);
    const totalCollected = agentCollections.reduce((sum, c) => sum + c.amount, 0);
    const assignedLoans = loans.filter((l) => l.assignedAgentId === agent.id);
    const assignedCustomers = customers.filter((c) => c.assignedAgentId === agent.id);

    return {
      agent,
      collectionCount: agentCollections.length,
      totalCollected,
      assignedLoansCount: assignedLoans.length,
      assignedCustomersCount: assignedCustomers.length,
      targetAchievementRate: Math.min(
        100,
        Math.round((totalCollected / (agent.targetDailyCollection || 25000)) * 100)
      ),
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Financial Intelligence & Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Profit & Loss statement, Cash vs UPI splits, and Field Agent Performance
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveReportTab('DAILY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeReportTab === 'DAILY' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Daily Reports
          </button>
          <button
            onClick={() => setActiveReportTab('MONTHLY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeReportTab === 'MONTHLY' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            P&L Statement
          </button>
          <button
            onClick={() => setActiveReportTab('AGENTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeReportTab === 'AGENTS' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Agent Scorecard
          </button>
        </div>
      </div>

      {/* DAILY VIEW */}
      {activeReportTab === 'DAILY' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-5 border-emerald-500/30">
              <span className="text-xs text-emerald-300 font-semibold">Today's Total Collection</span>
              <div className="text-2xl font-black text-emerald-400 mt-2">
                ₹{todayTotal.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">{todayCollections.length} field receipts today</div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <span className="text-xs text-slate-400 font-semibold">Cash Collections</span>
              <div className="text-2xl font-black text-white mt-2">
                ₹{todayCash.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {todayTotal > 0 ? Math.round((todayCash / todayTotal) * 100) : 0}% of today's total
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <span className="text-xs text-slate-400 font-semibold">UPI / QR Collections</span>
              <div className="text-2xl font-black text-teal-300 mt-2">
                ₹{todayUPI.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {todayTotal > 0 ? Math.round((todayUPI / todayTotal) * 100) : 0}% of today's total
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <span className="text-xs text-slate-400 font-semibold">Bank Transfers</span>
              <div className="text-2xl font-black text-sky-300 mt-2">
                ₹{todayBank.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Direct NEFT/IMPS</div>
            </div>
          </div>
        </div>
      )}

      {/* MONTHLY P&L VIEW */}
      {activeReportTab === 'MONTHLY' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income & Revenue Card */}
            <div className="glass-card rounded-2xl p-6 border-emerald-500/20">
              <h3 className="font-bold text-base text-white flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Revenue & Net Interest Yield
              </h3>
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center py-2.5 border-b border-slate-800">
                  <span className="text-slate-300 font-medium">Interest Earned from Weekly Loans</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ₹{totalInterestEarned.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-800">
                  <span className="text-slate-300 font-medium">Penalty & Late Fee Collections</span>
                  <span className="font-mono font-bold text-teal-300">
                    ₹{totalPenaltyEarned.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 bg-emerald-950/40 px-3 rounded-xl border border-emerald-500/30">
                  <span className="font-bold text-white text-sm">TOTAL GROSS INCOME</span>
                  <span className="font-mono font-black text-emerald-400 text-base">
                    ₹{totalGrossIncome.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Portfolio Health & Capital Deployed */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold text-base text-white flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-sky-400" />
                Portfolio Capital Summary
              </h3>
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center py-2.5 border-b border-slate-800">
                  <span className="text-slate-300 font-medium">Total Capital Disbursed</span>
                  <span className="font-mono font-bold text-white">
                    ₹{totalDisbursed.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-800">
                  <span className="text-slate-300 font-medium">Principal Recovered Back</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ₹{totalPrincipalRecovered.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 bg-slate-800/80 px-3 rounded-xl border border-slate-700">
                  <span className="font-bold text-white text-sm">ACTIVE PRINCIPAL IN FIELD</span>
                  <span className="font-mono font-black text-rose-400 text-base">
                    ₹{totalPrincipalAtRisk.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AGENTS SCORECARD */}
      {activeReportTab === 'AGENTS' && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-bold text-base text-white flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-400" />
            Field Agent Collection Leaderboard & Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agentStats.map(({ agent, collectionCount, totalCollected, targetAchievementRate }) => (
              <div
                key={agent.id}
                className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={agent.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                    alt={agent.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/40"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-white">{agent.name}</h4>
                    <div className="text-xs text-slate-400">{agent.id} • Mobile: {agent.mobile}</div>
                    <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                      {collectionCount} Successful Collections
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-emerald-400">
                    ₹{totalCollected.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400">Target: ₹{agent.targetDailyCollection?.toLocaleString()}</div>
                  <div className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    {targetAchievementRate}% Target
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
