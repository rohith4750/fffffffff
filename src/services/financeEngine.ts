import { Loan, LoanType, PaymentDistribution, ScheduleItem } from '../types';
import { addMonths, addWeeks, format } from 'date-fns';

/**
 * Calculates total expected interest based on loan type, principal, interest rate and tenure
 */
export function calculateExpectedInterest(
  principal: number,
  ratePercent: number,
  loanType: LoanType,
  tenureCount: number
): number {
  if (loanType === 'WEEKLY') {
    return Math.round(principal * (ratePercent / 100) * tenureCount);
  } else {
    return Math.round(principal * (ratePercent / 100) * tenureCount);
  }
}

/**
 * Generates an amortization / installment schedule for weekly or monthly finance
 */
export function generateSchedule(
  principal: number,
  ratePercent: number,
  loanType: LoanType,
  tenureCount: number,
  startDateStr: string
): ScheduleItem[] {
  const schedule: ScheduleItem[] = [];
  const baseDate = new Date(startDateStr);
  const principalPerInstallment = Math.round(principal / tenureCount);
  const interestPerInstallment = Math.round(principal * (ratePercent / 100));
  const totalInstallment = principalPerInstallment + interestPerInstallment;

  for (let i = 1; i <= tenureCount; i++) {
    const dueDate =
      loanType === 'WEEKLY'
        ? addWeeks(baseDate, i)
        : addMonths(baseDate, i);

    schedule.push({
      installmentNumber: i,
      dueDate: format(dueDate, 'yyyy-MM-dd'),
      expectedPrincipal: principalPerInstallment,
      expectedInterest: interestPerInstallment,
      totalDue: totalInstallment,
      paidAmount: 0,
      status: 'PENDING',
    });
  }

  return schedule;
}

/**
 * Payment distribution logic:
 * Priority 1: Penalty
 * Priority 2: Interest
 * Priority 3: Principal
 */
export function calculatePaymentDistribution(
  collectedAmount: number,
  outstandingPenalty: number,
  outstandingInterest: number,
  outstandingPrincipal: number
): PaymentDistribution {
  let remaining = collectedAmount;

  // 1. Penalty deduction
  const penaltyPaid = Math.min(remaining, outstandingPenalty);
  remaining -= penaltyPaid;

  // 2. Interest deduction
  const interestPaid = Math.min(remaining, outstandingInterest);
  remaining -= interestPaid;

  // 3. Principal deduction
  const principalPaid = Math.min(remaining, outstandingPrincipal);
  remaining -= principalPaid;

  return {
    penaltyPaid,
    interestPaid,
    principalPaid,
  };
}

/**
 * Calculates overdue days & dynamic penalty
 */
export function computeOverdueAndPenalty(
  loan: Loan,
  currentDateStr: string = format(new Date(), 'yyyy-MM-dd')
): { daysOverdue: number; calculatedPenalty: number; isOverdue: boolean } {
  if (loan.status === 'CLOSED' || loan.status === 'PENDING') {
    return { daysOverdue: 0, calculatedPenalty: loan.penaltyOutstanding, isOverdue: false };
  }

  const current = new Date(currentDateStr);
  const due = new Date(loan.dueDate);

  // Check if due date has passed
  const timeDiff = current.getTime() - due.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

  if (daysDiff <= 0) {
    return { daysOverdue: 0, calculatedPenalty: loan.penaltyOutstanding, isOverdue: false };
  }

  let penalty = loan.penaltyOutstanding;

  if (loan.penaltyType === 'DAILY_FIXED') {
    penalty = daysDiff * loan.penaltyRateOrAmount;
  } else if (loan.penaltyType === 'MONTHLY_PERCENTAGE') {
    const months = Math.max(1, Math.ceil(daysDiff / 30));
    penalty = Math.round(loan.principalOutstanding * (loan.penaltyRateOrAmount / 100) * months);
  }

  return {
    daysOverdue: daysDiff,
    calculatedPenalty: penalty,
    isOverdue: true,
  };
}

/**
 * Checks if a loan is eligible for closure
 */
export function isLoanClosable(
  principalOutstanding: number,
  interestOutstanding: number,
  penaltyOutstanding: number
): boolean {
  return principalOutstanding <= 0 && interestOutstanding <= 0 && penaltyOutstanding <= 0;
}
