import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AuditLog,
  CloudinaryConfig,
  Collection,
  Customer,
  CustomerStatus,
  LedgerEntry,
  Loan,
  LoanType,
  PaymentMethod,
  PenaltyType,
  User,
  UserRole,
  AppNotification,
} from '../types';
import {
  SEED_AUDIT_LOGS,
  SEED_COLLECTIONS,
  SEED_CUSTOMERS,
  SEED_LEDGER,
  SEED_LOANS,
  SEED_USERS,
} from '../services/seedData';
import {
  calculateExpectedInterest,
  calculatePaymentDistribution,
  computeOverdueAndPenalty,
  generateSchedule,
  isLoanClosable,
} from '../services/financeEngine';
import { getCloudinaryConfig, saveCloudinaryConfig } from '../services/cloudinaryService';
import {
  apiCreateAgent,
  apiCreateCustomer,
  apiFetchAgents,
  apiFetchCustomers,
  apiPinLogin,
  apiRecordCollection,
  apiResetAgentPin,
  checkApiHealth,
} from '../services/apiService';
import { format } from 'date-fns';

interface FinanceContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  allUsers: User[];
  agents: User[];
  isApiConnected: boolean;
  refreshBackendData: () => Promise<void>;

  // Agent Management (Admin Controls)
  createAgent: (data: {
    name: string;
    mobile: string;
    pinCode: string;
    assignedArea?: string;
    targetDailyCollection?: number;
    avatar?: string;
  }) => Promise<User>;
  updateAgent: (id: string, updates: Partial<User>) => void;
  resetAgentPin: (id: string, newPin: string) => Promise<void>;
  verifyAgentPin: (pin: string) => Promise<User | null>;

  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'documents'>) => Promise<Customer>;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  updateCustomerStatus: (id: string, status: CustomerStatus) => void;
  addCustomerDocument: (customerId: string, doc: { type: any; url: string; publicId?: string }) => void;

  // Loans
  loans: Loan[];
  createLoan: (data: {
    customerId: string;
    loanType: LoanType;
    principalAmount: number;
    interestRate: number;
    tenureCount: number;
    assignedAgentId: string;
    penaltyType: PenaltyType;
    penaltyRateOrAmount: number;
  }) => Loan;
  approveLoan: (loanId: string) => void;
  disburseLoan: (loanId: string) => void;

  // Collections
  collections: Collection[];
  recordCollection: (data: {
    loanId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
    locationAddress?: string;
    deviceInfo?: string;
    remarks: string;
    proofImageUrl?: string;
  }) => Promise<Collection>;

  // Ledger & Audit
  ledger: LedgerEntry[];
  auditLogs: AuditLog[];
  logAction: (action: string, module: AuditLog['module'], details: string) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;

  // Cloudinary
  cloudinaryConfig: CloudinaryConfig;
  updateCloudinaryConfig: (config: CloudinaryConfig) => void;

  // Helpers
  resetToSampleData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('finflow_users');
    return saved ? JSON.parse(saved) : SEED_USERS;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [currentUser, setCurrentUser] = useState<User>(() => users[0] || SEED_USERS[0]);
  const [isApiConnected, setIsApiConnected] = useState<boolean>(false);

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('finflow_customers');
    return saved ? JSON.parse(saved) : SEED_CUSTOMERS;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('finflow_loans');
    return saved ? JSON.parse(saved) : SEED_LOANS;
  });

  const [collections, setCollections] = useState<Collection[]>(() => {
    const saved = localStorage.getItem('finflow_collections');
    return saved ? JSON.parse(saved) : SEED_COLLECTIONS;
  });

  const [ledger, setLedger] = useState<LedgerEntry[]>(() => {
    const saved = localStorage.getItem('finflow_ledger');
    return saved ? JSON.parse(saved) : SEED_LEDGER;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('finflow_audit');
    return saved ? JSON.parse(saved) : SEED_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'NOTIF-1',
      userId: 'USR-AGT-01',
      title: 'Collection Due Today',
      message: 'Ramesh Babu Goud (CUST-1001) weekly installment of INR 2,400 is scheduled today.',
      type: 'DUE_SOON',
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'NOTIF-2',
      userId: 'USR-ADM-01',
      title: 'Overdue Alert',
      message: 'Lakshmi Devi (CUST-1002) is 8 days overdue. Penalty applied.',
      type: 'OVERDUE',
      read: false,
      createdAt: new Date().toISOString(),
    },
  ]);

  const [cloudinaryConfig, setCloudinaryConfigState] = useState<CloudinaryConfig>(getCloudinaryConfig);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('finflow_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('finflow_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('finflow_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('finflow_collections', JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    localStorage.setItem('finflow_ledger', JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem('finflow_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Initial Backend Health Check & Hydration
  const refreshBackendData = async () => {
    const healthy = await checkApiHealth();
    setIsApiConnected(healthy);

    if (healthy) {
      const apiCusts = await apiFetchCustomers();
      if (apiCusts && apiCusts.length > 0) setCustomers(apiCusts);

      const apiAgts = await apiFetchAgents();
      if (apiAgts && apiAgts.length > 0) {
        setUsers((prev) => {
          const admin = prev.find((u) => u.role === 'ADMIN');
          return admin ? [admin, ...apiAgts] : apiAgts;
        });
      }
    }
  };

  useEffect(() => {
    refreshBackendData();
    const interval = setInterval(async () => {
      const healthy = await checkApiHealth();
      setIsApiConnected(healthy);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Keep current user updated when switching roles
  useEffect(() => {
    if (currentRole === 'ADMIN') {
      const admin = users.find((u) => u.role === 'ADMIN');
      if (admin) setCurrentUser(admin);
    } else {
      const agent = users.find((u) => u.role === 'AGENT');
      if (agent) setCurrentUser(agent);
    }
  }, [currentRole, users]);

  // Periodic Overdue recalculation
  useEffect(() => {
    setLoans((prevLoans) =>
      prevLoans.map((loan) => {
        if (loan.status === 'ACTIVE' || loan.status === 'OVERDUE') {
          const { daysOverdue, calculatedPenalty, isOverdue } = computeOverdueAndPenalty(loan);
          if (isOverdue && loan.status !== 'OVERDUE') {
            return {
              ...loan,
              status: 'OVERDUE',
              daysOverdue,
              penaltyOutstanding: calculatedPenalty,
            };
          }
        }
        return loan;
      })
    );
  }, []);

  const logAction = (action: string, module: AuditLog['module'], details: string) => {
    const newLog: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userName: `${currentUser.name} (${currentUser.role})`,
      action,
      module,
      details,
      timestamp: new Date().toISOString(),
      device: navigator.userAgent.includes('Mobile') ? 'Mobile Web / Agent GPS' : 'Desktop Browser',
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const updateCloudinaryConfig = (config: CloudinaryConfig) => {
    setCloudinaryConfigState(config);
    saveCloudinaryConfig(config);
    logAction('UPDATED_CLOUDINARY_CONFIG', 'SYSTEM', `Cloudinary Cloud Name set to: ${config.cloudName}`);
  };

  // Agent Management
  const createAgent = async (data: {
    name: string;
    mobile: string;
    pinCode: string;
    assignedArea?: string;
    targetDailyCollection?: number;
    avatar?: string;
  }): Promise<User> => {
    const agentSeq = users.filter((u) => u.role === 'AGENT').length + 1;
    const newAgent: User = {
      id: `USR-AGT-${String(agentSeq).padStart(2, '0')}`,
      name: data.name,
      mobile: data.mobile,
      pinCode: data.pinCode,
      role: 'AGENT',
      status: 'ACTIVE',
      assignedArea: data.assignedArea || 'General Collection Territory',
      targetDailyCollection: data.targetDailyCollection || 25000,
      avatar:
        data.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };

    // Call Backend API asynchronously
    apiCreateAgent(data).catch(() => {});

    setUsers((prev) => [...prev, newAgent]);
    logAction(
      'AGENT_CREATED',
      'AGENTS',
      `Created new Field Agent: ${newAgent.name} (${newAgent.id}) with PIN and target ₹${newAgent.targetDailyCollection?.toLocaleString()}`
    );
    return newAgent;
  };

  const updateAgent = (id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
    logAction('AGENT_UPDATED', 'AGENTS', `Updated agent profile for ${id}`);
  };

  const resetAgentPin = async (id: string, newPin: string) => {
    apiResetAgentPin(id, newPin).catch(() => {});
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, pinCode: newPin } : u))
    );
    logAction('AGENT_PIN_RESET', 'AGENTS', `Reset quick login PIN for agent ID: ${id}`);
  };

  const verifyAgentPin = async (pin: string): Promise<User | null> => {
    // Try backend API PIN verification
    const apiResult = await apiPinLogin(pin);
    if (apiResult) return apiResult;

    // Fallback to local store verification
    const found = users.find((u) => u.role === 'AGENT' && u.pinCode === pin && u.status === 'ACTIVE');
    return found || null;
  };

  // Customers
  const addCustomer = async (
    data: Omit<Customer, 'id' | 'createdAt' | 'documents'>
  ): Promise<Customer> => {
    const nextCode = `CUST-${1000 + customers.length + 1}`;
    const newCust: Customer = {
      ...data,
      id: nextCode,
      customerCode: nextCode,
      documents: [],
      createdAt: new Date().toISOString(),
    };

    // Call Backend API
    apiCreateCustomer(data).catch(() => {});

    setCustomers((prev) => [newCust, ...prev]);
    logAction('CUSTOMER_CREATED', 'CUSTOMERS', `Created new customer: ${newCust.name} (${newCust.customerCode})`);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    logAction('CUSTOMER_UPDATED', 'CUSTOMERS', `Updated customer details for ID: ${id}`);
  };

  const updateCustomerStatus = (id: string, status: CustomerStatus) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    logAction('CUSTOMER_STATUS_CHANGED', 'CUSTOMERS', `Status for ${id} changed to ${status}`);
  };

  const addCustomerDocument = (
    customerId: string,
    doc: { type: any; url: string; publicId?: string }
  ) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            documents: [
              ...c.documents,
              {
                id: `DOC-${Date.now().toString().slice(-4)}`,
                type: doc.type,
                url: doc.url,
                publicId: doc.publicId,
                uploadedAt: new Date().toISOString(),
              },
            ],
          };
        }
        return c;
      })
    );
    logAction('DOCUMENT_UPLOADED', 'CUSTOMERS', `Uploaded ${doc.type} for customer ${customerId}`);
  };

  // Loans
  const createLoan = (data: {
    customerId: string;
    loanType: LoanType;
    principalAmount: number;
    interestRate: number;
    tenureCount: number;
    assignedAgentId: string;
    penaltyType: PenaltyType;
    penaltyRateOrAmount: number;
  }): Loan => {
    const loanSeq = loans.length + 1;
    const loanCode = `LN-${data.loanType === 'WEEKLY' ? 'W' : 'M'}-2026-${String(loanSeq).padStart(3, '0')}`;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const totalInterest = calculateExpectedInterest(
      data.principalAmount,
      data.interestRate,
      data.loanType,
      data.tenureCount
    );

    const schedule = generateSchedule(
      data.principalAmount,
      data.interestRate,
      data.loanType,
      data.tenureCount,
      todayStr
    );

    const newLoan: Loan = {
      id: loanCode,
      loanCode,
      customerId: data.customerId,
      loanType: data.loanType,
      principalAmount: data.principalAmount,
      interestRate: data.interestRate,
      totalInterestExpected: totalInterest,
      totalAmountExpected: data.principalAmount + totalInterest,
      tenureCount: data.tenureCount,
      startDate: todayStr,
      dueDate: schedule[schedule.length - 1].dueDate,
      status: 'PENDING',
      assignedAgentId: data.assignedAgentId,
      schedule,
      principalOutstanding: data.principalAmount,
      interestOutstanding: totalInterest,
      penaltyOutstanding: 0,
      totalCollected: 0,
      penaltyType: data.penaltyType,
      penaltyRateOrAmount: data.penaltyRateOrAmount,
      daysOverdue: 0,
      createdAt: new Date().toISOString(),
    };

    setLoans((prev) => [newLoan, ...prev]);
    logAction('LOAN_CREATED', 'LOANS', `Created loan application ${loanCode} for INR ${data.principalAmount}`);
    return newLoan;
  };

  const approveLoan = (loanId: string) => {
    setLoans((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, status: 'APPROVED' } : l))
    );
    logAction('LOAN_APPROVED', 'LOANS', `Loan ${loanId} approved by admin`);
  };

  const disburseLoan = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              status: 'ACTIVE',
              disbursedDate: format(new Date(), 'yyyy-MM-dd'),
            }
          : l
      )
    );

    const newTx: LedgerEntry = {
      id: `LED-${Date.now().toString().slice(-5)}`,
      transactionCode: `TX-DISB-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString(),
      type: 'DISBURSEMENT',
      account: 'LOAN_DISBURSEMENT_ACCOUNT',
      debit: loan.principalAmount,
      credit: 0,
      referenceId: loan.id,
      description: `Disbursement of ${loan.loanCode} for INR ${loan.principalAmount}`,
    };

    setLedger((prev) => [newTx, ...prev]);
    logAction('LOAN_DISBURSED', 'LOANS', `Disbursed INR ${loan.principalAmount} for loan ${loan.loanCode}`);
  };

  // Collections Engine
  const recordCollection = async (data: {
    loanId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
    locationAddress?: string;
    deviceInfo?: string;
    remarks: string;
    proofImageUrl?: string;
  }): Promise<Collection> => {
    const loan = loans.find((l) => l.id === data.loanId);
    if (!loan) throw new Error('Loan not found');

    const customer = customers.find((c) => c.id === loan.customerId);

    // Strict priority allocation: Penalty -> Interest -> Principal
    const distribution = calculatePaymentDistribution(
      data.amount,
      loan.penaltyOutstanding,
      loan.interestOutstanding,
      loan.principalOutstanding
    );

    const newPenaltyOutstanding = Math.max(0, loan.penaltyOutstanding - distribution.penaltyPaid);
    const newInterestOutstanding = Math.max(0, loan.interestOutstanding - distribution.interestPaid);
    const newPrincipalOutstanding = Math.max(0, loan.principalOutstanding - distribution.principalPaid);
    const newTotalCollected = loan.totalCollected + data.amount;

    const closable = isLoanClosable(
      newPrincipalOutstanding,
      newInterestOutstanding,
      newPenaltyOutstanding
    );

    const receiptNumber = `REC-2026-${String(collections.length + 1).padStart(4, '0')}`;

    const newCollection: Collection = {
      id: `COL-2026-${String(collections.length + 1).padStart(3, '0')}`,
      receiptNumber,
      loanId: loan.id,
      customerId: loan.customerId,
      agentId: currentUser.id,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentDistribution: distribution,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracyMeters: data.accuracyMeters || 8,
      locationAddress: data.locationAddress || 'Field Collection GPS Tagged',
      deviceInfo: data.deviceInfo || navigator.userAgent,
      remarks: data.remarks,
      proofImageUrl: data.proofImageUrl,
      collectedAt: new Date().toISOString(),
    };

    // Asynchronously submit to Backend API
    apiRecordCollection({
      loanId: loan.id,
      customerId: loan.customerId,
      agentId: currentUser.id,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracyMeters: data.accuracyMeters,
      locationAddress: data.locationAddress,
      deviceInfo: data.deviceInfo,
      remarks: data.remarks,
      proofImageUrl: data.proofImageUrl,
    }).catch(() => {});

    // Update Loan State
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id === loan.id) {
          return {
            ...l,
            penaltyOutstanding: newPenaltyOutstanding,
            interestOutstanding: newInterestOutstanding,
            principalOutstanding: newPrincipalOutstanding,
            totalCollected: newTotalCollected,
            status: closable ? 'CLOSED' : (newPenaltyOutstanding > 0 ? 'OVERDUE' : 'ACTIVE'),
          };
        }
        return l;
      })
    );

    setCollections((prev) => [newCollection, ...prev]);

    // Create Detailed Ledger Transactions
    const newLedgerEntries: LedgerEntry[] = [];
    const timestamp = new Date().toISOString();

    if (distribution.penaltyPaid > 0) {
      newLedgerEntries.push({
        id: `LED-${Date.now().toString().slice(-4)}-1`,
        transactionCode: `TX-PEN-${receiptNumber}`,
        date: timestamp,
        type: 'COLLECTION_PENALTY',
        account: 'PENALTY_INCOME_ACCOUNT',
        debit: 0,
        credit: distribution.penaltyPaid,
        referenceId: newCollection.id,
        description: `Penalty collection ${receiptNumber} on ${loan.loanCode}`,
      });
    }

    if (distribution.interestPaid > 0) {
      newLedgerEntries.push({
        id: `LED-${Date.now().toString().slice(-4)}-2`,
        transactionCode: `TX-INT-${receiptNumber}`,
        date: timestamp,
        type: 'COLLECTION_INTEREST',
        account: 'INTEREST_INCOME_ACCOUNT',
        debit: 0,
        credit: distribution.interestPaid,
        referenceId: newCollection.id,
        description: `Interest collection ${receiptNumber} on ${loan.loanCode}`,
      });
    }

    if (distribution.principalPaid > 0) {
      newLedgerEntries.push({
        id: `LED-${Date.now().toString().slice(-4)}-3`,
        transactionCode: `TX-PRIN-${receiptNumber}`,
        date: timestamp,
        type: 'COLLECTION_PRINCIPAL',
        account: 'PRINCIPAL_RECOVERY_ACCOUNT',
        debit: 0,
        credit: distribution.principalPaid,
        referenceId: newCollection.id,
        description: `Principal recovery ${receiptNumber} on ${loan.loanCode}`,
      });
    }

    setLedger((prev) => [...newLedgerEntries, ...prev]);

    // Audit Log
    logAction(
      'COLLECTION_ADDED',
      'COLLECTIONS',
      `Collected INR ${data.amount.toLocaleString()} from ${customer?.name || loan.customerId} (Penalty: ${distribution.penaltyPaid}, Int: ${distribution.interestPaid}, Prin: ${distribution.principalPaid}) GPS: ${data.latitude}, ${data.longitude}`
    );

    return newCollection;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const resetToSampleData = () => {
    localStorage.clear();
    setUsers(SEED_USERS);
    setCustomers(SEED_CUSTOMERS);
    setLoans(SEED_LOANS);
    setCollections(SEED_COLLECTIONS);
    setLedger(SEED_LEDGER);
    setAuditLogs(SEED_AUDIT_LOGS);
    window.location.reload();
  };

  const agents = users.filter((u) => u.role === 'AGENT');

  return (
    <FinanceContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentUser,
        setCurrentUser,
        allUsers: users,
        agents,
        isApiConnected,
        refreshBackendData,
        createAgent,
        updateAgent,
        resetAgentPin,
        verifyAgentPin,
        customers,
        addCustomer,
        updateCustomer,
        updateCustomerStatus,
        addCustomerDocument,
        loans,
        createLoan,
        approveLoan,
        disburseLoan,
        collections,
        recordCollection,
        ledger,
        auditLogs,
        logAction,
        notifications,
        markNotificationAsRead,
        cloudinaryConfig,
        updateCloudinaryConfig,
        resetToSampleData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
