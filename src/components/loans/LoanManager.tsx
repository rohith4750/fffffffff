import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Loan } from '../../types';
import {
  Banknote,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Lock,
} from 'lucide-react';

interface Props {
  onOpenNewLoan: () => void;
}

export const LoanManager: React.FC<Props> = ({ onOpenNewLoan }) => {
  const { loans, customers, agents, approveLoan, disburseLoan } = useFinance();

  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedLoanSchedule, setSelectedLoanSchedule] = useState<Loan | null>(null);

  const filteredLoans = loans.filter((l) => {
    const matchesType = typeFilter === 'ALL' || l.loanType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Banknote className="w-6 h-6 text-emerald-400" />
            Loan Management & Disbursals
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Weekly and monthly loan lifecycles, interest calculations, overdue tracking & schedules
          </p>
        </div>
        <button
          onClick={onOpenNewLoan}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create Loan Proposal</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Types (Weekly & Monthly)</option>
            <option value="WEEKLY">Weekly Finance Only</option>
            <option value="MONTHLY">Monthly Finance Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Lifecycle Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="ACTIVE">Active</option>
            <option value="OVERDUE">Overdue</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{filteredLoans.length}</span> loans
        </div>
      </div>

      {/* Loans Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700/80">
              <tr>
                <th className="py-3 px-4">Loan Code</th>
                <th className="py-3 px-4">Borrower Customer</th>
                <th className="py-3 px-4">Type / Rate</th>
                <th className="py-3 px-4">Principal & Interest</th>
                <th className="py-3 px-4">Outstanding Balances</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLoans.map((loan) => {
                const customer = customers.find((c) => c.id === loan.customerId);
                const agent = agents.find((a) => a.id === loan.assignedAgentId);

                return (
                  <tr key={loan.id} className="hover:bg-slate-800/30 transition">
                    {/* Loan Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{loan.loanCode}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Agent: {agent?.name.split(' ')[0] || 'Unassigned'}
                      </div>
                    </td>

                    {/* Borrower */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-100">{customer?.name || loan.customerId}</div>
                      <div className="text-[10px] text-slate-400">{customer?.mobile}</div>
                    </td>

                    {/* Type & Rate */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          loan.loanType === 'WEEKLY'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        }`}
                      >
                        {loan.loanType} ({loan.interestRate}%)
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {loan.tenureCount} {loan.loanType === 'WEEKLY' ? 'Weeks' : 'Months'}
                      </div>
                    </td>

                    {/* Principal & Interest */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">
                        ₹{loan.principalAmount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-emerald-400">
                        +₹{loan.totalInterestExpected.toLocaleString('en-IN')} Interest
                      </div>
                    </td>

                    {/* Outstanding */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">
                        ₹{loan.principalOutstanding.toLocaleString('en-IN')} Prin
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ₹{loan.interestOutstanding.toLocaleString('en-IN')} Int
                        {loan.penaltyOutstanding > 0 && (
                          <span className="text-rose-400 font-bold ml-1">
                            +₹{loan.penaltyOutstanding} Pen
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          loan.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : loan.status === 'OVERDUE'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : loan.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : loan.status === 'APPROVED'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {loan.status === 'OVERDUE' && <AlertTriangle className="w-3 h-3" />}
                        {loan.status === 'ACTIVE' && <CheckCircle2 className="w-3 h-3" />}
                        {loan.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {loan.status === 'CLOSED' && <Lock className="w-3 h-3" />}
                        <span>{loan.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedLoanSchedule(loan)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold transition"
                      >
                        Schedule
                      </button>

                      {loan.status === 'PENDING' && (
                        <button
                          onClick={() => approveLoan(loan.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold transition shadow-sm"
                        >
                          Approve
                        </button>
                      )}

                      {loan.status === 'APPROVED' && (
                        <button
                          onClick={() => disburseLoan(loan.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-[11px] font-bold transition shadow-sm"
                        >
                          Disburse
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Detail Modal */}
      {selectedLoanSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-base text-white">
                  Collection Schedule: {selectedLoanSchedule.loanCode}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedLoanSchedule.loanType} Finance • {selectedLoanSchedule.tenureCount} Installments
                </p>
              </div>
              <button
                onClick={() => setSelectedLoanSchedule(null)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="my-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Due Date</th>
                    <th className="py-2 px-3">Expected Principal</th>
                    <th className="py-2 px-3">Expected Interest</th>
                    <th className="py-2 px-3 text-right">Total Installment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {selectedLoanSchedule.schedule.map((item) => (
                    <tr key={item.installmentNumber} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-slate-400">
                        {item.installmentNumber}
                      </td>
                      <td className="py-2.5 px-3 font-mono">{item.dueDate}</td>
                      <td className="py-2.5 px-3">₹{item.expectedPrincipal.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 text-emerald-400">
                        ₹{item.expectedInterest.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-white">
                        ₹{item.totalDue.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setSelectedLoanSchedule(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
            >
              Close Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
