import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { DashboardOverview } from './components/admin/DashboardOverview';
import { CustomerList } from './components/customers/CustomerList';
import { CustomerModal } from './components/customers/CustomerModal';
import { AgentManagementView } from './components/admin/AgentManagementView';
import { LoanManager } from './components/loans/LoanManager';
import { NewLoanModal } from './components/loans/NewLoanModal';
import { CollectionList } from './components/collections/CollectionList';
import { AgentMobileView } from './components/agent/AgentMobileView';
import { GpsTrackingMap } from './components/maps/GpsTrackingMap';
import { LedgerView } from './components/ledger/LedgerView';
import { ReportsView } from './components/reports/ReportsView';
import { AuditLogView } from './components/audit/AuditLogView';

const MainContent: React.FC = () => {
  const { currentRole } = useFinance();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Modals state
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showNewLoanModal, setShowNewLoanModal] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar navigation */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {currentRole === 'AGENT' || activeTab === 'agent-field' ? (
            <AgentMobileView />
          ) : (
            <>
              {activeTab === 'overview' && (
                <DashboardOverview
                  setActiveTab={setActiveTab}
                  onOpenNewLoan={() => setShowNewLoanModal(true)}
                  onOpenNewCustomer={() => setShowNewCustomerModal(true)}
                />
              )}
              {activeTab === 'customers' && (
                <CustomerList onOpenNewCustomer={() => setShowNewCustomerModal(true)} />
              )}
              {activeTab === 'agents-management' && <AgentManagementView />}
              {activeTab === 'loans' && (
                <LoanManager onOpenNewLoan={() => setShowNewLoanModal(true)} />
              )}
              {activeTab === 'collections' && <CollectionList />}
              {activeTab === 'gps-map' && <GpsTrackingMap />}
              {activeTab === 'ledger' && <LedgerView />}
              {activeTab === 'reports' && <ReportsView />}
              {activeTab === 'audit-logs' && <AuditLogView />}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      {showNewCustomerModal && (
        <CustomerModal onClose={() => setShowNewCustomerModal(false)} />
      )}
      {showNewLoanModal && (
        <NewLoanModal onClose={() => setShowNewLoanModal(false)} />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <FinanceProvider>
      <MainContent />
    </FinanceProvider>
  );
};

export default App;
