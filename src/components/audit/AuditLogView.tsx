import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ShieldAlert, Search, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);

    const matchesModule = moduleFilter === 'ALL' || log.module === moduleFilter;

    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-emerald-400" />
            Audit Logging & Compliance Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable tracking of financial operations, loan approvals, collections, and security events
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Audit Logging Active (Non-Repudiation)</span>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, user, IP address, details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">All System Modules</option>
          <option value="CUSTOMERS">Customers KYC</option>
          <option value="LOANS">Loan Lifecycle</option>
          <option value="COLLECTIONS">Collections & GPS</option>
          <option value="SYSTEM">System & Config</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700/80">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Module / Action</th>
                <th className="py-3 px-4">Audit Details</th>
                <th className="py-3 px-4 text-right">Device & IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {format(new Date(log.timestamp), 'dd MMM yyyy, HH:mm:ss')}
                  </td>

                  <td className="py-3 px-4 font-semibold text-white">
                    {log.userName}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.module === 'LOANS'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : log.module === 'COLLECTIONS'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-200 leading-relaxed max-w-sm">
                    {log.details}
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-[10px] text-slate-400">
                    <div>{log.device}</div>
                    <div className="text-emerald-400 font-bold">{log.ipAddress}</div>
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
