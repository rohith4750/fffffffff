import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'FinFlow Finance API',
    version: '2.4.0',
    timestamp: new Date().toISOString(),
  });
});

// --- AUTHENTICATION & PIN VERIFICATION ---
app.post('/api/auth/pin-login', async (req: Request, res: Response) => {
  try {
    const { pinCode } = req.body;
    if (!pinCode) {
      return res.status(400).json({ error: 'PIN is required' });
    }

    const agent = await prisma.user.findFirst({
      where: {
        pinCode: String(pinCode),
        status: 'ACTIVE',
      },
    });

    if (!agent) {
      return res.status(401).json({ error: 'Invalid PIN or inactive agent account' });
    }

    // Log login action
    await prisma.auditLog.create({
      data: {
        userId: agent.id,
        userName: `${agent.name} (${agent.role})`,
        action: 'AGENT_PIN_LOGIN',
        module: 'SYSTEM',
        details: `Field agent logged in via 4-digit PIN on ${req.headers['user-agent'] || 'Mobile App'}`,
        ipAddress: req.ip || '127.0.0.1',
      },
    });

    res.json({ success: true, user: agent });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- CUSTOMERS KYC API ---
app.get('/api/customers', async (_req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        documents: true,
        assignedAgent: { select: { id: true, name: true, mobile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const count = await prisma.customer.count();
    const customerCode = `CUST-${1000 + count + 1}`;

    const customer = await prisma.customer.create({
      data: {
        id: customerCode,
        customerCode,
        name: data.name,
        mobile: data.mobile,
        address: data.address,
        occupation: data.occupation,
        aadhaarNumber: data.aadhaarNumber,
        panNumber: data.panNumber,
        photoUrl: data.photoUrl,
        latitude: data.latitude,
        longitude: data.longitude,
        guarantorName: data.guarantorName,
        guarantorMobile: data.guarantorMobile,
        guarantorAddress: data.guarantorAddress,
        guarantorRelationship: data.guarantorRelationship,
        assignedAgentId: data.assignedAgentId,
        status: data.status || 'ACTIVE',
      },
    });

    res.status(201).json(customer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- FIELD AGENTS API ---
app.get('/api/agents', async (_req: Request, res: Response) => {
  try {
    const agents = await prisma.user.findMany({
      where: { role: 'AGENT' },
      orderBy: { createdAt: 'asc' },
    });
    res.json(agents);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agents', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const count = await prisma.user.count({ where: { role: 'AGENT' } });
    const userCode = `USR-AGT-${String(count + 1).padStart(2, '0')}`;

    const agent = await prisma.user.create({
      data: {
        id: userCode,
        userCode,
        name: data.name,
        mobile: data.mobile,
        pinCode: data.pinCode,
        role: 'AGENT',
        status: data.status || 'ACTIVE',
        assignedArea: data.assignedArea,
        targetDailyCollection: data.targetDailyCollection || 25000,
        avatar: data.avatar,
      },
    });

    res.status(201).json(agent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/agents/:id/pin', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPin } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: { pinCode: String(newPin) },
    });

    res.json({ success: true, agent: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- LOANS API ---
app.get('/api/loans', async (_req: Request, res: Response) => {
  try {
    const loans = await prisma.loan.findMany({
      include: {
        customer: true,
        assignedAgent: { select: { id: true, name: true } },
        schedules: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(loans);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/loans', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const count = await prisma.loan.count();
    const loanCode = `LN-${data.loanType === 'WEEKLY' ? 'W' : 'M'}-2026-${String(count + 1).padStart(3, '0')}`;

    const totalInterestExpected =
      data.principalAmount * (data.interestRate / 100) * data.tenureCount;
    const totalAmountExpected = data.principalAmount + totalInterestExpected;

    const loan = await prisma.loan.create({
      data: {
        id: loanCode,
        loanCode,
        customerId: data.customerId,
        assignedAgentId: data.assignedAgentId,
        loanType: data.loanType,
        principalAmount: data.principalAmount,
        interestRate: data.interestRate,
        totalInterestExpected,
        totalAmountExpected,
        tenureCount: data.tenureCount,
        startDate: new Date(),
        dueDate: new Date(Date.now() + data.tenureCount * (data.loanType === 'WEEKLY' ? 7 : 30) * 86400000),
        status: 'PENDING',
        principalOutstanding: data.principalAmount,
        interestOutstanding: totalInterestExpected,
        penaltyOutstanding: 0,
        totalCollected: 0,
        penaltyType: data.penaltyType || 'DAILY_FIXED',
        penaltyRateOrAmount: data.penaltyRateOrAmount || 50,
      },
    });

    res.status(201).json(loan);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- COLLECTIONS API (With GPS verification & Double-Entry Ledger) ---
app.post('/api/collections', async (req: Request, res: Response) => {
  try {
    const {
      loanId,
      customerId,
      agentId,
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

    const loan = await prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // 3-Tier Allocation: Penalty -> Interest -> Principal
    let remaining = Number(amount);
    const penaltyPaid = Math.min(remaining, Number(loan.penaltyOutstanding));
    remaining -= penaltyPaid;

    const interestPaid = Math.min(remaining, Number(loan.interestOutstanding));
    remaining -= interestPaid;

    const principalPaid = Math.min(remaining, Number(loan.principalOutstanding));

    const count = await prisma.collection.count();
    const receiptNumber = `REC-2026-${String(count + 1).padStart(4, '0')}`;

    const collection = await prisma.collection.create({
      data: {
        id: `COL-2026-${String(count + 1).padStart(3, '0')}`,
        receiptNumber,
        loanId,
        customerId,
        agentId,
        amount,
        paymentMethod: paymentMethod || 'CASH',
        penaltyPaid,
        interestPaid,
        principalPaid,
        latitude,
        longitude,
        accuracyMeters: accuracyMeters || 8,
        locationAddress,
        deviceInfo,
        remarks,
        proofImageUrl,
      },
    });

    // Update Loan Balances
    const newPrincipalOutstanding = Math.max(0, Number(loan.principalOutstanding) - principalPaid);
    const newInterestOutstanding = Math.max(0, Number(loan.interestOutstanding) - interestPaid);
    const newPenaltyOutstanding = Math.max(0, Number(loan.penaltyOutstanding) - penaltyPaid);
    const isClosed =
      newPrincipalOutstanding === 0 && newInterestOutstanding === 0 && newPenaltyOutstanding === 0;

    await prisma.loan.update({
      where: { id: loanId },
      data: {
        principalOutstanding: newPrincipalOutstanding,
        interestOutstanding: newInterestOutstanding,
        penaltyOutstanding: newPenaltyOutstanding,
        totalCollected: { increment: amount },
        status: isClosed ? 'CLOSED' : (newPenaltyOutstanding > 0 ? 'OVERDUE' : 'ACTIVE'),
      },
    });

    // Double-Entry Ledger Transaction
    if (principalPaid > 0) {
      await prisma.ledgerEntry.create({
        data: {
          transactionCode: `TX-PRIN-${receiptNumber}`,
          type: 'COLLECTION_PRINCIPAL',
          account: 'PRINCIPAL_RECOVERY_ACCOUNT',
          credit: principalPaid,
          referenceId: collection.id,
          description: `Principal collection on ${loan.loanCode}`,
        },
      });
    }

    if (interestPaid > 0) {
      await prisma.ledgerEntry.create({
        data: {
          transactionCode: `TX-INT-${receiptNumber}`,
          type: 'COLLECTION_INTEREST',
          account: 'INTEREST_INCOME_ACCOUNT',
          credit: interestPaid,
          referenceId: collection.id,
          description: `Interest collection on ${loan.loanCode}`,
        },
      });
    }

    res.status(201).json({
      collection,
      distribution: { penaltyPaid, interestPaid, principalPaid },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- GENERAL LEDGER API ---
app.get('/api/ledger', async (_req: Request, res: Response) => {
  try {
    const entries = await prisma.ledgerEntry.findMany({
      orderBy: { date: 'desc' },
    });
    res.json(entries);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- AUDIT LOGS API ---
app.get('/api/audit-logs', async (_req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
    });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`⚡ FinFlow Express API Server running on port ${PORT}`);
  });
}

export default app;
