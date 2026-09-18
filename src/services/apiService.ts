import {
  AuditLog,
  Collection,
  Customer,
  LedgerEntry,
  Loan,
  User,
} from '../types';

export const API_BASE = '/api';

/**
 * Check backend API health
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (res.ok) {
      const data = await res.json();
      return data.status === 'ok';
    }
  } catch {
    // Backend offline or running in standalone mode
  }
  return false;
}

/**
 * Verify Agent 4-digit PIN via API
 */
export async function apiPinLogin(pinCode: string): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/pin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinCode }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch (err) {
    console.warn('API PIN login error, using local fallback:', err);
  }
  return null;
}

/**
 * Fetch all customers from backend
 */
export async function apiFetchCustomers(): Promise<Customer[] | null> {
  try {
    const res = await fetch(`${API_BASE}/customers`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API fetch customers error:', err);
  }
  return null;
}

/**
 * Create customer via backend API
 */
export async function apiCreateCustomer(customerData: Partial<Customer>): Promise<Customer | null> {
  try {
    const res = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API create customer error:', err);
  }
  return null;
}

/**
 * Fetch all field agents
 */
export async function apiFetchAgents(): Promise<User[] | null> {
  try {
    const res = await fetch(`${API_BASE}/agents`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API fetch agents error:', err);
  }
  return null;
}

/**
 * Create agent with 4-digit PIN
 */
export async function apiCreateAgent(agentData: {
  name: string;
  mobile: string;
  pinCode: string;
  assignedArea?: string;
  targetDailyCollection?: number;
}): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agentData),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API create agent error:', err);
  }
  return null;
}

/**
 * Reset agent PIN via API
 */
export async function apiResetAgentPin(agentId: string, newPin: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/agents/${agentId}/pin`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPin }),
    });
    return res.ok;
  } catch (err) {
    console.warn('API reset PIN error:', err);
  }
  return false;
}

/**
 * Fetch all loans
 */
export async function apiFetchLoans(): Promise<Loan[] | null> {
  try {
    const res = await fetch(`${API_BASE}/loans`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API fetch loans error:', err);
  }
  return null;
}

/**
 * Record collection via backend API (with GPS & 3-tier distribution)
 */
export async function apiRecordCollection(payload: {
  loanId: string;
  customerId: string;
  agentId: string;
  amount: number;
  paymentMethod: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  locationAddress?: string;
  deviceInfo?: string;
  remarks?: string;
  proofImageUrl?: string;
}): Promise<Collection | null> {
  try {
    const res = await fetch(`${API_BASE}/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return data.collection;
    }
  } catch (err) {
    console.warn('API record collection error:', err);
  }
  return null;
}

/**
 * Fetch general ledger entries
 */
export async function apiFetchLedger(): Promise<LedgerEntry[] | null> {
  try {
    const res = await fetch(`${API_BASE}/ledger`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API fetch ledger error:', err);
  }
  return null;
}

/**
 * Fetch audit logs
 */
export async function apiFetchAuditLogs(): Promise<AuditLog[] | null> {
  try {
    const res = await fetch(`${API_BASE}/audit-logs`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API fetch audit logs error:', err);
  }
  return null;
}
