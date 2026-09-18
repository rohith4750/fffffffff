import React from 'react';
import {
  LayoutDashboard,
  Users,
  Banknote,
  Receipt,
  MapPin,
  FileText,
  BarChart3,
  ShieldAlert,
  Smartphone,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export type ActiveTab =
  | 'overview'
  | 'customers'
  | 'loans'
  | 'collections'
  | 'gps-map'
  | 'ledger'
  | 'reports'
  | 'audit-logs'
  | 'agent-field';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const { currentRole, loans, customers } = useFinance();

  const overdueCount = loans.filter((l) => l.status === 'OVERDUE').length;
  const pendingApprovals = loans.filter((l) => l.status === 'PENDING').length;

  const adminNavItems = [
    { id: 'overview', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customer KYC & Docs', icon: Users, badge: customers.length },
    { id: 'loans', label: 'Loans & Disbursals', icon: Banknote, badge: pendingApprovals > 0 ? `${pendingApprovals} New` : undefined, badgeColor: 'bg-amber-500/20 text-amber-400' },
    { id: 'collections', label: 'Field Collections', icon: Receipt },
    { id: 'gps-map', label: 'GPS Live Tracking', icon: MapPin },
    { id: 'ledger', label: 'General Ledger', icon: FileText },
    { id: 'reports', label: 'P&L & Analytics', icon: BarChart3 },
    { id: 'audit-logs', label: 'Audit Trail & Security', icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between border-r border-slate-800 bg-slate-900/60 p-4">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {currentRole === 'ADMIN' ? 'Administration & Operations' : 'Field Operations'}
          </div>

          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Field Switcher Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-emerald-500/20 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">Agent Field Portal</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Simulate a field agent with GPS auto-capture and instant collection receipting.
          </p>
          <button
            onClick={() => setActiveTab('agent-field')}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'agent-field'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-lg'
                : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/30'
            }`}
          >
            Launch Field Mode
          </button>
        </div>
      </div>

      {/* Overdue Warning pill at bottom */}
      {overdueCount > 0 && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
          <div className="font-bold text-rose-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            {overdueCount} Overdue Loans
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Penalties auto-accrued according to policy.
          </p>
        </div>
      )}
    </aside>
  );
};
