export type UserRole = 'ADMIN' | 'AGENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  mobile: string;
  pinCode: string; // 4-digit quick agent PIN
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  assignedArea?: string;
  targetDailyCollection?: number;
  deviceToken?: string;
}

export type CustomerStatus = 'NEW' | 'ACTIVE' | 'BLOCKED' | 'CLOSED';

export interface CustomerDocument {
  id: string;
  type: 'AADHAAR_FRONT' | 'AADHAAR_BACK' | 'PAN_CARD' | 'PHOTO' | 'AGREEMENT' | 'OTHER';
  url: string;
  uploadedAt: string;
  publicId?: string; // Cloudinary public_id
}

export interface Customer {
  id: string;
  customerCode: string; // e.g. CUST-1001
  name: string;
  mobile: string;
  address: string;
  occupation: string;
  aadhaarNumber: string;
  panNumber: string;
  photoUrl: string;
  latitude: number;
  longitude: number;
  guarantorName: string;
  guarantorMobile: string;
  guarantorAddress: string;
  guarantorRelationship: string;
  assignedAgentId: string;
  status: CustomerStatus;
  documents: CustomerDocument[];
  createdAt: string;
}

export type LoanType = 'WEEKLY' | 'MONTHLY';
export type LoanStatus = 'PENDING' | 'APPROVED' | 'DISBURSED' | 'ACTIVE' | 'OVERDUE' | 'CLOSED';
export type PenaltyType = 'DAILY_FIXED' | 'MONTHLY_PERCENTAGE';

export interface ScheduleItem {
  installmentNumber: number;
  dueDate: string;
  expectedPrincipal: number;
  expectedInterest: number;
  totalDue: number;
  paidAmount: number;
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE';
  paidDate?: string;
}

export interface Loan {
  id: string;
  loanCode: string; // e.g. LN-W-2026-001
  customerId: string;
  loanType: LoanType;
  principalAmount: number; // e.g. ₹20,000 or ₹50,000
  interestRate: number; // % e.g. 2% weekly or 5% monthly
  totalInterestExpected: number;
  totalAmountExpected: number;
  tenureCount: number; // 10 weeks or 12 months
  disbursedDate?: string;
  startDate: string;
  dueDate: string;
  status: LoanStatus;
  assignedAgentId: string;
  schedule: ScheduleItem[];
  
  // Balances
  principalOutstanding: number;
  interestOutstanding: number;
  penaltyOutstanding: number;
  totalCollected: number;
  
  // Overdue Settings
  penaltyType: PenaltyType;
  penaltyRateOrAmount: number; // 50 (fixed ₹50/day) or 2 (2% monthly)
  daysOverdue: number;
  createdAt: string;
}

export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER';

export interface PaymentDistribution {
  penaltyPaid: number;
  interestPaid: number;
  principalPaid: number;
}

export interface Collection {
  id: string;
  receiptNumber: string; // REC-2026-0001
  loanId: string;
  customerId: string;
  agentId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDistribution: PaymentDistribution;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  locationAddress?: string;
  deviceInfo: string;
  remarks: string;
  proofImageUrl?: string; // Cloudinary photo proof
  collectedAt: string;
}

export interface LedgerEntry {
  id: string;
  transactionCode: string;
  date: string;
  type: 'DISBURSEMENT' | 'COLLECTION_PRINCIPAL' | 'COLLECTION_INTEREST' | 'COLLECTION_PENALTY' | 'PENALTY_ACCRUED';
  account: string;
  debit: number;
  credit: number;
  referenceId: string; // loanId or collectionId
  description: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: 'CUSTOMERS' | 'LOANS' | 'COLLECTIONS' | 'AGENTS' | 'REPORTS' | 'SYSTEM';
  details: string;
  timestamp: string;
  device: string;
  ipAddress: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'DUE_SOON' | 'OVERDUE' | 'COLLECTION_SUCCESS' | 'TARGET_REACHED' | 'SYSTEM';
  read: boolean;
  createdAt: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  apiKey?: string;
  isConfigured: boolean;
}
