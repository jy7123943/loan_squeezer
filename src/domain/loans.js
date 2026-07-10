import { initialLoans, STORAGE_KEYS } from '../constants';
import { clamp, load, monthlyPaymentByMonths, monthsBetween } from '../utils';

export function createLoan() {
  const now = new Date();
  return {
    id: `loan-${Date.now()}`,
    name: "",
    principal: 0,
    rate: 0,
    type: "mortgage",
    method: "equalPayment",
    payDay: 15,
    startYear: now.getFullYear(),
    startMonth: now.getMonth() + 1,
    maturityYear: now.getFullYear() + 20,
    maturityMonth: now.getMonth() + 1,
    prepayments: [],
  };
}

export function normalizeLoans() {
  const savedLoans = load(STORAGE_KEYS.loans, null);
  if (Array.isArray(savedLoans)) {
    return savedLoans.map((loan) => ({
      ...loan,
      prepayments: loan.prepayments || [],
    }));
  }

  const oldLoan = load(STORAGE_KEYS.loan, null);
  const oldPrepayments = load(STORAGE_KEYS.prepayments, []);
  if (oldLoan?.principal) {
    return [
      {
        type: "mortgage",
        method: "equalPayment",
        payDay: 15,
        startYear: new Date().getFullYear(),
        startMonth: new Date().getMonth() + 1,
        ...oldLoan,
        id: "migrated-loan",
        name: "기존 대출",
        maturityYear: oldLoan.startYear + (oldLoan.years || 30),
        maturityMonth: oldLoan.startMonth || 1,
        prepayments: oldPrepayments,
      },
    ];
  }

  return initialLoans;
}

export function scheduledPrincipalPaid(loan, elapsed, totalMonths) {
  const months = Math.min(Math.max(0, elapsed), totalMonths);
  if (months <= 0) return 0;
  if (loan.method === "bullet") return 0;
  if (loan.method === "equalPrincipal") {
    return (loan.principal * months) / totalMonths;
  }
  const r = loan.rate / 100 / 12;
  if (r === 0) return (loan.principal * months) / totalMonths;
  const pmt = monthlyPaymentByMonths(loan.principal, loan.rate, totalMonths);
  const growth = (1 + r) ** months;
  const remaining = loan.principal * growth - pmt * ((growth - 1) / r);
  return loan.principal - Math.max(0, remaining);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function loanReport(loan) {
  const today = startOfDay(new Date());
  const payDay = clamp(loan.payDay, 1, 28);
  const start = new Date(loan.startYear, loan.startMonth - 1, payDay);
  const maturity = new Date(
    loan.maturityYear,
    loan.maturityMonth - 1,
    payDay,
  );
  const elapsed = Math.max(
    0,
    monthsBetween(start, today) + (today.getDate() >= loan.payDay ? 1 : 0),
  );
  const totalMonths = monthsBetween(start, maturity);
  const remainingMonths = Math.max(1, totalMonths - elapsed);
  const prepaymentTotal = (loan.prepayments || []).reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const scheduledPrincipal = Math.min(
    loan.principal,
    scheduledPrincipalPaid(loan, elapsed, totalMonths),
  );
  const paidPrincipal = Math.min(
    loan.principal,
    scheduledPrincipal + prepaymentTotal,
  );
  const remainingPrincipal = Math.max(0, loan.principal - paidPrincipal);
  const monthlyInterest = remainingPrincipal * (loan.rate / 100 / 12);
  const baseMonthly =
    loan.method === "bullet"
      ? monthlyInterest
      : loan.method === "equalPrincipal"
        ? remainingPrincipal / remainingMonths + monthlyInterest
        : monthlyPaymentByMonths(
            remainingPrincipal,
            loan.rate,
            remainingMonths,
          );
  const progress =
    loan.principal > 0
      ? clamp((paidPrincipal / loan.principal) * 100, 0, 100)
      : 0;
  const nextPay = new Date(today.getFullYear(), today.getMonth(), payDay);
  if (today.getDate() > payDay) nextPay.setMonth(nextPay.getMonth() + 1);
  const dday = Math.max(
    0,
    Math.round((startOfDay(nextPay) - today) / (1000 * 60 * 60 * 24)),
  );
  const remainingInterest = Math.max(
    0,
    remainingMonths * baseMonthly - remainingPrincipal,
  );
  const savedByPrepay =
    prepaymentTotal *
    (loan.rate / 100) *
    Math.min(8, remainingMonths / 12) *
    0.55;

  return {
    elapsed,
    totalMonths,
    remainingMonths,
    baseMonthly,
    paidPrincipal,
    remainingPrincipal,
    progress,
    dday,
    nextPay,
    maturity,
    prepaymentTotal,
    remainingInterest,
    savedByPrepay,
  };
}

export function portfolioReport(loans) {
  const reports = loans.map((loan) => ({ loan, report: loanReport(loan) }));
  const nearest = reports.reduce(
    (best, item) =>
      !best || item.report.dday < best.report.dday ? item : best,
    null,
  );
  return {
    reports,
    nearest,
    totalPrincipal: loans.reduce((sum, loan) => sum + loan.principal, 0),
    totalRemaining: reports.reduce(
      (sum, item) => sum + item.report.remainingPrincipal,
      0,
    ),
    totalMonthly: reports.reduce(
      (sum, item) => sum + item.report.baseMonthly,
      0,
    ),
    totalPrepaid: reports.reduce(
      (sum, item) => sum + item.report.prepaymentTotal,
      0,
    ),
  };
}
