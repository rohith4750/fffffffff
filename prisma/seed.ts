import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for FinFlow Finance ERP...');

  // 1. Clean existing records (if any)
  try {
    await prisma.collection.deleteMany();
    await prisma.scheduleItem.deleteMany();
    await prisma.loan.deleteMany();
    await prisma.customerDocument.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.ledgerEntry.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.user.deleteMany();
  } catch (err) {
    console.log('Note: Tables may be empty, proceeding to seed...');
  }

  // 2. Seed Users (Admin & Field Agents with 4-Digit PINs)
  const admin = await prisma.user.create({
    data: {
      id: 'USR-ADM-01',
      userCode: 'USR-ADM-01',
      name: 'Rajesh Kumar Sharma',
      mobile: '9876543210',
      pinCode: '9999',
      role: 'ADMIN',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const agent1 = await prisma.user.create({
    data: {
      id: 'USR-AGT-01',
      userCode: 'USR-AGT-01',
      name: 'Suresh Reddy',
      mobile: '9848012345',
      pinCode: '1234',
      role: 'AGENT',
      status: 'ACTIVE',
      assignedArea: 'Kukatpally & KPHB Zone',
      targetDailyCollection: 25000,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      id: 'USR-AGT-02',
      userCode: 'USR-AGT-02',
      name: 'Vikram Singh',
      mobile: '9988776655',
      pinCode: '5678',
      role: 'AGENT',
      status: 'ACTIVE',
      assignedArea: 'Secunderabad & MG Road Zone',
      targetDailyCollection: 35000,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  });

  console.log(`✅ Seeded 3 Users (1 Admin, 2 Field Agents)`);

  // 3. Seed Customers
  const customer1 = await prisma.customer.create({
    data: {
      id: 'CUST-1001',
      customerCode: 'CUST-1001',
      name: 'Ramesh Babu Goud',
      mobile: '9876501122',
      address: 'Shop #14, Vegetable Market, Kukatpally, Hyderabad',
      occupation: 'Vegetable Vendor',
      aadhaarNumber: '4532 8891 0021',
      panNumber: 'ABCDE1234F',
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      latitude: 17.4947,
      longitude: 78.3996,
      guarantorName: 'Mahesh Goud',
      guarantorMobile: '9876509988',
      guarantorAddress: 'KPHB Phase 1, Hyderabad',
      guarantorRelationship: 'Brother',
      assignedAgentId: agent1.id,
      status: 'ACTIVE',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      id: 'CUST-1002',
      customerCode: 'CUST-1002',
      name: 'Lakshmi Devi',
      mobile: '9849123456',
      address: 'Flat 201, Shanti Nagar, Ameerpet, Hyderabad',
      occupation: 'Tailoring & Boutique Owner',
      aadhaarNumber: '7821 5490 3341',
      panNumber: 'FGHIJ5678K',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      latitude: 17.4375,
      longitude: 78.4482,
      guarantorName: 'Srinivas Rao',
      guarantorMobile: '9849129999',
      guarantorAddress: 'Ameerpet, Hyderabad',
      guarantorRelationship: 'Husband',
      assignedAgentId: agent1.id,
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Seeded Customers with KYC`);

  // 4. Seed Loans (Weekly & Monthly)
  const loan1 = await prisma.loan.create({
    data: {
      id: 'LN-W-2026-001',
      loanCode: 'LN-W-2026-001',
      customerId: customer1.id,
      assignedAgentId: agent1.id,
      loanType: 'WEEKLY',
      principalAmount: 20000,
      interestRate: 2.0,
      totalInterestExpected: 4000,
      totalAmountExpected: 24000,
      tenureCount: 10,
      disbursedDate: new Date('2026-08-01'),
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-10-10'),
      status: 'ACTIVE',
      principalOutstanding: 14000,
      interestOutstanding: 2800,
      penaltyOutstanding: 0,
      totalCollected: 7200,
    },
  });

  console.log(`✅ Seeded Loans`);

  // 5. Seed Ledger Entries
  await prisma.ledgerEntry.create({
    data: {
      transactionCode: 'TX-DISB-001',
      type: 'DISBURSEMENT',
      account: 'LOAN_DISBURSEMENT_ACCOUNT',
      debit: 20000,
      credit: 0,
      referenceId: loan1.id,
      description: 'Initial Disbursement for Ramesh Babu Goud',
    },
  });

  console.log(`✅ Seeded Double-Entry Ledger`);
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
