import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  SEED_AUDIT_LOGS,
  SEED_COLLECTIONS,
  SEED_CUSTOMERS,
  SEED_LEDGER,
  SEED_LOANS,
  SEED_USERS,
} from '../services/seedData.js';

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// In-Memory Database Store (with full CRUD sync)
let dbUsers = [...SEED_USERS];
let dbCustomers = [...SEED_CUSTOMERS];
let dbLoans = [...SEED_LOANS];
let dbCollections = [...SEED_COLLECTIONS];
let dbLedger = [...SEED_LEDGER];
let dbAuditLogs = [...SEED_AUDIT_LOGS];

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'FinFlow Finance REST API',
    version: '2.4.0',
    timestamp: new Date().toISOString(),
  });
});

// --- AUTHENTICATION & PIN VERIFICATION ---
app.post('/api/auth/pin-login', (req: Request, res: Response) => {
  try {
    const { pinCode } = req.body;
    if (!pinCode) {
      return res.status(400).json({ error: 'PIN is required' });
    }

    const agent = dbUsers.find((u) => u.pinCode === String(pinCode) && u.status === 'ACTIVE');

    if (!agent) {
      return res.status(401).json({ error: 'Invalid PIN or inactive agent account' });
    }

    const log = {
      id: `AUD-${Date.now()}`,
      userId: agent.id,
      userName: `${agent.name} (${agent.role})`,
      action: 'AGENT_PIN_LOGIN',
      module: 'SYSTEM' as const,
      details: `Field agent logged in via 4-digit PIN on ${req.headers['user-agent'] || 'Mobile Device'}`,
      timestamp: new Date().toISOString(),
      device: `${req.headers['user-agent'] || 'Mobile App'}`,
      ipAddress: req.ip || '127.0.0.1',
    };
    dbAuditLogs.unshift(log);

    res.json({ success: true, user: agent });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- CUSTOMERS CRUD ---
app.get('/api/customers', (_req: Request, res: Response) => {
  res.json(dbCustomers);
});

app.post('/api/customers', (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newCustomer = {
      id: `CUST-${Date.now().toString().slice(-4)}`,
      customerCode: `CUST-${Date.now().toString().slice(-4)}`,
      status: 'ACTIVE' as const,
      documents: [],
      createdAt: new Date().toISOString(),
      ...data,
    };
    dbCustomers.unshift(newCustomer);
    res.status(201).json(newCustomer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- AGENTS CRUD ---
app.get('/api/agents', (_req: Request, res: Response) => {
  const agents = dbUsers.filter((u) => u.role === 'AGENT');
  res.json(agents);
});

app.post('/api/agents', (req: Request, res: Response) => {
  try {
    const { name, mobile, pinCode, assignedArea, targetDailyCollection, avatar } = req.body;
    const newAgent = {
      id: `USR-AGT-${Date.now().toString().slice(-4)}`,
      name,
      mobile,
      pinCode: pinCode || '1234',
      role: 'AGENT' as const,
      status: 'ACTIVE' as const,
      assignedArea: assignedArea || 'General Territory',
      targetDailyCollection: Number(targetDailyCollection) || 25000,
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };
    dbUsers.push(newAgent);
    res.status(201).json(newAgent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/agents/:id/pin', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPin } = req.body;
    const agent = dbUsers.find((u) => u.id === id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    agent.pinCode = String(newPin);
    res.json({ success: true, message: 'Agent PIN updated successfully', user: agent });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- LOANS CRUD ---
app.get('/api/loans', (_req: Request, res: Response) => {
  res.json(dbLoans);
});

// --- COLLECTIONS & DISTRIBUTION ---
app.get('/api/collections', (_req: Request, res: Response) => {
  res.json(dbCollections);
});

app.post('/api/collections', (req: Request, res: Response) => {
  try {
    const {
      loanId,
      amount,
      paymentMethod,
      latitude,
      longitude,
      accuracyMeters,
      locationAddress,
      deviceInfo,
      remarks,
      proofImageUrl,
    } = req.body;

    const loan = dbLoans.find((l) => l.id === loanId);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const colAmount = Number(amount);
    let rem = colAmount;

    // 1. Penalty
    const penaltyPaid = Math.min(rem, loan.penaltyOutstanding || 0);
    rem -= penaltyPaid;

    // 2. Interest
    const interestPaid = Math.min(rem, loan.interestOutstanding || 0);
    rem -= interestPaid;

    // 3. Principal
    const principalPaid = Math.min(rem, loan.principalOutstanding || 0);
    rem -= principalPaid;

    // Update balances
    loan.penaltyOutstanding -= penaltyPaid;
    loan.interestOutstanding -= interestPaid;
    loan.principalOutstanding -= principalPaid;
    loan.totalCollected += colAmount;

    const newCollection = {
      id: `COL-${Date.now()}`,
      receiptNumber: `REC-${Date.now().toString().slice(-4)}`,
      loanId,
      customerId: loan.customerId,
      agentId: loan.assignedAgentId,
      amount: colAmount,
      paymentMethod: paymentMethod || 'CASH',
      paymentDistribution: {
        penaltyPaid,
        interestPaid,
        principalPaid,
      },
      latitude: latitude || 19.033,
      longitude: longitude || 73.029,
      accuracyMeters: accuracyMeters || 5,
      locationAddress: locationAddress || 'Field Collection Address',
      deviceInfo: deviceInfo || 'Mobile Agent App v2.4',
      remarks: remarks || 'Collection recorded',
      proofImageUrl,
      collectedAt: new Date().toISOString(),
    };

    dbCollections.unshift(newCollection);
    res.status(201).json(newCollection);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- LEDGER & AUDIT LOGS ---
app.get('/api/ledger', (_req: Request, res: Response) => {
  res.json(dbLedger);
});

app.get('/api/audit-logs', (_req: Request, res: Response) => {
  res.json(dbAuditLogs);
});

// Start Server on 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ FinFlow REST API Backend running on http://0.0.0.0:${PORT}`);
});
