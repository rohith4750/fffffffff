import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { FileText, Search, Download } from 'lucide-react';
import { format } from 'date-fns';

export const LedgerView: React.FC = () => {
  const { ledger } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [accountFilter, setAccountFilter] = useState<string>('ALL');

  const totalDebits = ledger.reduce((sum, item) => sum + item.debit, 0);
  const totalCredits = ledger.reduce((sum, item) => sum + item.credit, 0);

  const filteredLedger = ledger.filter((entry) => {
    const matchesSearch =
      entry.transactionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.account.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAccount = accountFilter === 'ALL' || entry.account === accountFilter;

    return matchesSearch && matchesAccount;
  });

  const exportCSV = () => {
    const headers = ['Transaction Code', 'Date', 'Type', 'Account', 'Debit (INR)', 'Credit (INR)', 'Description'];
    const rows = filteredLedger.map((e) => [
      e.transactionCode,
      e.date,
      e.type,
      e.account,
      e.debit,
      e.credit,
      `"${e.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinFlow_General_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-400" />
            Double-Entry Financial Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable transaction records for disbursements, interest earnings, penalty fees, and principal recoveries
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Ledger (CSV)</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-semibold">Total Disbursements (Debits)</div>
          <div className="text-xl font-black text-rose-400 mt-1">
            ₹{totalDebits.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Capital outflow for new loan issuances</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border-emerald-500/30">
          <div className="text-xs text-emerald-300 font-semibold">Total Recoveries & Income (Credits)</div>
          <div className="text-xl font-black text-emerald-400 mt-1">
            ₹{totalCredits.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Principal recovery + Interest & Penalty income</div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-semibold">Total Immutable Ledger Entries</div>
          <div className="text-xl font-black text-white mt-1">{ledger.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Strict double-entry accounting integrity</div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions, accounts, descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">All Ledger Accounts</option>
          <option value="LOAN_DISBURSEMENT_ACCOUNT">Loan Disbursement Account</option>
          <option value="INTEREST_INCOME_ACCOUNT">Interest Income Account</option>
          <option value="PRINCIPAL_RECOVERY_ACCOUNT">Principal Recovery Account</option>
          <option value="PENALTY_INCOME_ACCOUNT">Penalty Income Account</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700/80">
              <tr>
                <th className="py-3 px-4">Tx Code / Date</th>
                <th className="py-3 px-4">Account Head</th>
                <th className="py-3 px-4">Transaction Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Debit (₹)</th>
                <th className="py-3 px-4 text-right">Credit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLedger.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-mono">
                    <div className="font-bold text-white text-xs">{entry.transactionCode}</div>
                    <div className="text-[10px] text-slate-500">
                      {format(new Date(entry.date), 'dd MMM yyyy, hh:mm a')}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] font-bold text-slate-200">
                      {entry.account}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        entry.type === 'DISBURSEMENT'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : entry.type === 'COLLECTION_INTEREST'
                          ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                          : entry.type === 'COLLECTION_PENALTY'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {entry.type}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                    {entry.description}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                    {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN')}` : '-'}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    {entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN')}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
