import { LoanInterestMethod, InstallmentSchedule, TenorUnit, TenorOption } from '../types';

export const AVAILABLE_TENORS: TenorOption[] = [
  // Tenor Mingguan
  { value: '1_MINGGU', label: '1 Minggu (7 Hari)', count: 1, unit: 'MINGGU', equivalentMonths: 0.25 },
  { value: '2_MINGGU', label: '2 Minggu (14 Hari)', count: 2, unit: 'MINGGU', equivalentMonths: 0.5 },
  { value: '3_MINGGU', label: '3 Minggu (21 Hari)', count: 3, unit: 'MINGGU', equivalentMonths: 0.75 },
  { value: '4_MINGGU', label: '4 Minggu (28 Hari)', count: 4, unit: 'MINGGU', equivalentMonths: 1.0 },

  // Tenor Bulanan
  { value: '1_BULAN', label: '1 Bulan (30 Hari)', count: 1, unit: 'BULAN', equivalentMonths: 1 },
  { value: '2_BULAN', label: '2 Bulan', count: 2, unit: 'BULAN', equivalentMonths: 2 },
  { value: '3_BULAN', label: '3 Bulan (Triwulan)', count: 3, unit: 'BULAN', equivalentMonths: 3 },
  { value: '4_BULAN', label: '4 Bulan', count: 4, unit: 'BULAN', equivalentMonths: 4 },
  { value: '5_BULAN', label: '5 Bulan', count: 5, unit: 'BULAN', equivalentMonths: 5 },
  { value: '6_BULAN', label: '6 Bulan (Semester)', count: 6, unit: 'BULAN', equivalentMonths: 6 },
  { value: '9_BULAN', label: '9 Bulan', count: 9, unit: 'BULAN', equivalentMonths: 9 },
  { value: '10_BULAN', label: '10 Bulan', count: 10, unit: 'BULAN', equivalentMonths: 10 },
  { value: '12_BULAN', label: '12 Bulan (1 Tahun)', count: 12, unit: 'BULAN', equivalentMonths: 12 },
  { value: '18_BULAN', label: '18 Bulan (1.5 Tahun)', count: 18, unit: 'BULAN', equivalentMonths: 18 },
  { value: '24_BULAN', label: '24 Bulan (2 Tahun)', count: 24, unit: 'BULAN', equivalentMonths: 24 },
  { value: '36_BULAN', label: '36 Bulan (3 Tahun)', count: 36, unit: 'BULAN', equivalentMonths: 36 },
  { value: '48_BULAN', label: '48 Bulan (4 Tahun)', count: 48, unit: 'BULAN', equivalentMonths: 48 },
];

export interface LoanCalculationResult {
  amount: number;
  tenorCount: number;
  tenorUnit: TenorUnit;
  tenorLabel: string;
  tenorMonths: number; // backward compatibility
  interestMethod: LoanInterestMethod;
  interestRateAnnual: number;
  periodicInterestRate: number;
  installmentPerPeriod: number; // nominal cicilan per periode
  totalInterest: number;
  totalRepayment: number;
  adminFee: number;
  disbursedAmount: number;
  schedule: Array<{
    installmentNo: number;
    principalAmount: number;
    interestAmount: number;
    adminAmount: number;
    totalBill: number;
    remainingPrincipal: number;
  }>;
}

export class LoanCalculatorService {
  public static readonly MULTIPLE_AMOUNT = 50000;

  /**
   * Parse tenor input which can be a number (months) or string code like '1_MINGGU' or '2_BULAN'
   */
  public static parseTenor(tenorInput: number | string, explicitUnit?: TenorUnit): TenorOption {
    if (typeof tenorInput === 'string') {
      const match = AVAILABLE_TENORS.find((t) => t.value === tenorInput);
      if (match) return match;

      // Handle strings like "1 minggu" or "2 bulan"
      const lower = tenorInput.toLowerCase();
      const num = parseInt(lower.replace(/[^0-9]/g, ''), 10) || 1;
      if (lower.includes('minggu') || lower.includes('week')) {
        return {
          value: `${num}_MINGGU`,
          label: `${num} Minggu`,
          count: num,
          unit: 'MINGGU',
          equivalentMonths: num * 0.25,
        };
      }
      return {
        value: `${num}_BULAN`,
        label: `${num} Bulan`,
        count: num,
        unit: 'BULAN',
        equivalentMonths: num,
      };
    }

    // It's a number
    if (explicitUnit === 'MINGGU') {
      return {
        value: `${tenorInput}_MINGGU`,
        label: `${tenorInput} Minggu`,
        count: tenorInput,
        unit: 'MINGGU',
        equivalentMonths: tenorInput * 0.25,
      };
    }

    const matchMonths = AVAILABLE_TENORS.find((t) => t.unit === 'BULAN' && t.count === tenorInput);
    if (matchMonths) return matchMonths;

    return {
      value: `${tenorInput}_BULAN`,
      label: `${tenorInput} Bulan`,
      count: tenorInput,
      unit: 'BULAN',
      equivalentMonths: tenorInput,
    };
  }

  /**
   * Validates if the loan amount conforms strictly to multiples of Rp 50,000
   */
  public static validateLoanAmount(amount: number): { valid: boolean; message: string } {
    if (!amount || isNaN(amount)) {
      return { valid: false, message: 'Nominal pinjaman wajib diisi.' };
    }
    if (amount <= 0) {
      return { valid: false, message: 'Nominal pinjaman harus lebih besar dari Rp 0.' };
    }
    if (amount < this.MULTIPLE_AMOUNT) {
      return { valid: false, message: `Nominal pinjaman minimal Rp ${this.MULTIPLE_AMOUNT.toLocaleString('id-ID')}.` };
    }
    if (amount % this.MULTIPLE_AMOUNT !== 0) {
      const nearestLower = Math.floor(amount / this.MULTIPLE_AMOUNT) * this.MULTIPLE_AMOUNT;
      const nearestHigher = nearestLower + this.MULTIPLE_AMOUNT;
      return {
        valid: false,
        message: `Nominal pinjaman wajib kelipatan Rp 50.000. Rekomendasi: Rp ${nearestLower.toLocaleString('id-ID')} atau Rp ${nearestHigher.toLocaleString('id-ID')}.`,
      };
    }
    return { valid: true, message: 'Nominal valid (kelipatan Rp 50.000).' };
  }

  /**
   * Calculates comprehensive amortization schedule based on interest method and flexible tenor (Weekly/Monthly)
   */
  public static calculateLoan(
    amount: number,
    tenorInput: number | string,
    interestMethod: LoanInterestMethod,
    interestRateAnnual: number, // e.g. 12 (%)
    adminFeePercentage: number = 1.0, // e.g. 1%
    explicitUnit?: TenorUnit
  ): LoanCalculationResult {
    const validation = this.validateLoanAmount(amount);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const tenorInfo = this.parseTenor(tenorInput, explicitUnit);
    const count = tenorInfo.count;
    if (count <= 0) {
      throw new Error('Tenor pinjaman minimal 1 periode.');
    }

    // Periodic rate calculation:
    // If weekly: annual rate divided by 52 weeks
    // If monthly: annual rate divided by 12 months
    const periodsPerYear = tenorInfo.unit === 'MINGGU' ? 52 : 12;
    const periodicInterestRate = interestRateAnnual / 100 / periodsPerYear;

    const adminFee = Math.round(amount * (adminFeePercentage / 100));
    const disbursedAmount = amount - adminFee;

    const schedule: LoanCalculationResult['schedule'] = [];
    let totalInterest = 0;

    if (interestMethod === 'FLAT') {
      const principalPerPeriod = Math.round(amount / count);
      const interestPerPeriod = Math.round(amount * periodicInterestRate);
      let currentRemaining = amount;

      for (let i = 1; i <= count; i++) {
        const isLast = i === count;
        const principal = isLast ? currentRemaining : principalPerPeriod;
        const interest = interestPerPeriod;
        const totalBill = principal + interest;
        currentRemaining -= principal;
        totalInterest += interest;

        schedule.push({
          installmentNo: i,
          principalAmount: principal,
          interestAmount: interest,
          adminAmount: 0,
          totalBill: totalBill,
          remainingPrincipal: Math.max(0, currentRemaining),
        });
      }
    } else if (interestMethod === 'EFEKTIF') {
      const principalPerPeriod = Math.round(amount / count);
      let currentRemaining = amount;

      for (let i = 1; i <= count; i++) {
        const isLast = i === count;
        const principal = isLast ? currentRemaining : principalPerPeriod;
        const interest = Math.round(currentRemaining * periodicInterestRate);
        const totalBill = principal + interest;
        currentRemaining -= principal;
        totalInterest += interest;

        schedule.push({
          installmentNo: i,
          principalAmount: principal,
          interestAmount: interest,
          adminAmount: 0,
          totalBill: totalBill,
          remainingPrincipal: Math.max(0, currentRemaining),
        });
      }
    } else {
      // ANUITAS: A = P * (i / (1 - (1 + i)^-n))
      const periodicPayment = Math.round(
        (amount * periodicInterestRate) / (1 - Math.pow(1 + periodicInterestRate, -count))
      );
      let currentRemaining = amount;

      for (let i = 1; i <= count; i++) {
        const isLast = i === count;
        const interest = Math.round(currentRemaining * periodicInterestRate);
        let principal = periodicPayment - interest;
        if (isLast || principal > currentRemaining) {
          principal = currentRemaining;
        }
        const totalBill = principal + interest;
        currentRemaining -= principal;
        totalInterest += interest;

        schedule.push({
          installmentNo: i,
          principalAmount: principal,
          interestAmount: interest,
          adminAmount: 0,
          totalBill: totalBill,
          remainingPrincipal: Math.max(0, currentRemaining),
        });
      }
    }

    const totalRepayment = amount + totalInterest;
    const installmentPerPeriod = Math.round(totalRepayment / count);

    return {
      amount,
      tenorCount: tenorInfo.count,
      tenorUnit: tenorInfo.unit,
      tenorLabel: tenorInfo.label,
      tenorMonths: tenorInfo.equivalentMonths,
      interestMethod,
      interestRateAnnual,
      periodicInterestRate,
      installmentPerPeriod,
      totalInterest,
      totalRepayment,
      adminFee,
      disbursedAmount,
      schedule,
    };
  }

  /**
   * Generates initial installment schedule objects ready for database saving
   * Handles weekly (+7 days) and monthly (+1 month) due dates automatically
   */
  public static generateInstallmentSchedules(
    contractId: string,
    applicationId: string,
    partyId: string,
    partyName: string,
    startDate: Date,
    calculation: LoanCalculationResult
  ): InstallmentSchedule[] {
    return calculation.schedule.map((row) => {
      const dueDate = new Date(startDate);
      if (calculation.tenorUnit === 'MINGGU') {
        dueDate.setDate(dueDate.getDate() + row.installmentNo * 7);
      } else {
        dueDate.setMonth(dueDate.getMonth() + row.installmentNo);
      }

      const paddedNo = String(row.installmentNo).padStart(3, '0');
      const year = startDate.getFullYear();

      return {
        installmentId: `SCH-${year}-${(contractId || '').replace(/[^0-9]/g, '').slice(-4)}${paddedNo}`,
        contractId,
        applicationId,
        partyId,
        partyName,
        installmentNo: row.installmentNo,
        dueDate: dueDate.toISOString().split('T')[0],
        principalAmount: row.principalAmount,
        interestAmount: row.interestAmount,
        adminAmount: row.adminAmount,
        totalBill: row.totalBill,
        principalPaid: 0,
        interestPaid: 0,
        penaltyPaid: 0,
        totalPaid: 0,
        remainingPrincipal: row.remainingPrincipal,
        penaltyAmount: 0,
        daysOverdue: 0,
        status: 'BELUM_BAYAR',
      };
    });
  }

  /**
   * Computes penalty based on overdue days and standard penalty rate
   */
  public static calculatePenalty(
    principalDue: number,
    dueDateStr: string,
    asOfDateStr: string = new Date().toISOString().split('T')[0],
    penaltyRatePerDay: number = 0.001 // 0.1% per day
  ): { daysOverdue: number; penaltyAmount: number } {
    const due = new Date(dueDateStr);
    const asOf = new Date(asOfDateStr);
    const diffTime = asOf.getTime() - due.getTime();
    const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

    if (daysOverdue <= 0) {
      return { daysOverdue: 0, penaltyAmount: 0 };
    }

    const penaltyAmount = Math.round(principalDue * penaltyRatePerDay * daysOverdue);
    return { daysOverdue, penaltyAmount };
  }
}
