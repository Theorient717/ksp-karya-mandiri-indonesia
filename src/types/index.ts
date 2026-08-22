export type PartyType = 'ANGGOTA' | 'NON_ANGGOTA' | 'CALON_ANGGOTA' | 'TIDAK_AKTIF';

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'PIMPINAN' 
  | 'LOAN_OFFICER' 
  | 'KASIR' 
  | 'AKUNTING' 
  | 'PAJAK' 
  | 'ANGGOTA';

export type LoanInterestMethod = 'FLAT' | 'EFEKTIF' | 'ANUITAS';

export type TenorUnit = 'MINGGU' | 'BULAN';

export interface TenorOption {
  value: string;
  label: string;
  count: number;
  unit: TenorUnit;
  equivalentMonths: number;
}

export type TransactionStatus = 
  | 'DRAFT' 
  | 'PENDING' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'POSTED' 
  | 'CANCELLED' 
  | 'REVERSED';

export type InstallmentStatus = 'BELUM_BAYAR' | 'JATUH_TEMPO' | 'TERLAMBAT' | 'LUNAS' | 'SEBAGIAN';

export type CashMutationType = 'KAS_MASUK' | 'KAS_KELUAR' | 'BANK_MASUK' | 'BANK_KELUAR' | 'TRANSFER';

export interface User {
  userId: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  partyId?: string;
  nik?: string;
  twoFactorEnabled?: boolean;
  active: boolean;
  createdAt: string;
}

export interface Member {
  partyId: string; // ANG-2026-000001 or NAS-2026-000001
  partyType: PartyType;
  nomorIdentitasKoperasi: string;
  nama: string;
  nik: string;
  npwp?: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  pekerjaan: string;
  noHp: string;
  email: string;
  alamat: string;
  tanggalGabung: string;
  status: 'AKTIF' | 'PASIF' | 'KELUAR' | 'DIBERHENTIKAN';
  simpananPokokPaid: boolean;
  dokumenUrls?: {
    ktp?: string;
    kk?: string;
    slipGaji?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SavingsProduct {
  productId: string;
  code: string;
  name: string;
  minDeposit: number;
  interestRateAnnual: number;
  description: string;
  active: boolean;
}

export interface SavingsTransaction {
  transactionId: string; // TRX-SP-2026-000001
  partyId: string;
  partyName: string;
  productCode: 'POKOK' | 'WAJIB' | 'SUKARELA' | 'BERJANGKA' | 'KHUSUS';
  type: 'SETORAN' | 'PENARIKAN' | 'BUNGA' | 'BIAYA_ADMIN';
  amount: number;
  paymentMethod: 'KAS' | 'BANK';
  bankAccount?: string;
  balanceAfter: number;
  notes: string;
  status: TransactionStatus;
  sourceModule: 'SIMPANAN';
  cashBankRefId?: string;
  journalRefId?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
}

export interface SavingsSummary {
  partyId: string;
  pokok: number;
  wajib: number;
  sukarela: number;
  berjangka: number;
  khusus: number;
  totalSaldo: number;
  lastUpdated: string;
}

export interface LoanProduct {
  productId: string;
  productCode: string;
  productName: string;
  targetType: 'ANGGOTA' | 'SEMUA';
  minAmount: number;
  maxAmount: number;
  multipleAmount: number; // strictly 50000
  minTenorMonths: number;
  maxTenorMonths: number;
  interestMethod: LoanInterestMethod;
  interestRateAnnual: number; // e.g. 12%
  adminFeePercentage: number; // e.g. 1%
  penaltyRatePerDay: number; // e.g. 0.1% per day of overdue
  active: boolean;
}

export interface LoanApplication {
  applicationId: string; // PJ-2026-000001
  contractNumber?: string; // AKD-2026-000001
  partyId: string;
  partyName: string;
  partyType: PartyType;
  partyPhone: string;
  productId: string;
  productName: string;
  purpose: 'KONSUMTIF' | 'PRODUKTIF' | 'MODAL_KERJA' | 'INVESTASI' | 'PENDIDIKAN' | 'LAINNYA';
  purposeNotes: string;
  amount: number; // Must be % 50000 === 0
  tenorMonths: number;
  tenorCount?: number;
  tenorUnit?: TenorUnit;
  tenorLabel?: string;
  interestMethod: LoanInterestMethod;
  interestRateAnnual: number;
  adminFee: number;
  disbursedAmount: number;
  
  // Verification info
  surveyDate?: string;
  surveyorNotes?: string;
  creditScore?: 'SANGAT_BAIK' | 'BAIK' | 'CUKUP' | 'BERISIKO';
  guaranteeType?: string;
  guaranteeEstimatedValue?: number;
  guaranteeNotes?: string;
  guarantorName?: string;
  guarantorPhone?: string;

  // Approval info
  status: 'DRAFT' | 'VERIFIKASI' | 'MENUNGGU_PERSETUJUAN' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'LUNAS';
  approvedAmount?: number;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;

  // Disbursement
  disbursedAt?: string;
  disbursedMethod?: 'KAS' | 'BANK';
  disbursedBank?: string;
  disbursedBy?: string;
  cashBankRefId?: string;
  journalRefId?: string;

  createdAt: string;
  updatedAt: string;
}

export interface InstallmentSchedule {
  installmentId: string; // SCH-2026-000001
  contractId: string;
  applicationId: string;
  partyId: string;
  partyName: string;
  installmentNo: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  adminAmount: number;
  totalBill: number;
  
  principalPaid: number;
  interestPaid: number;
  penaltyPaid: number;
  totalPaid: number;
  
  remainingPrincipal: number;
  penaltyAmount: number;
  daysOverdue: number;
  status: InstallmentStatus;
  paidAt?: string;
  paymentRefId?: string;
}

export interface InstallmentPayment {
  paymentId: string; // BYR-2026-000001
  contractId: string;
  installmentId: string;
  partyId: string;
  partyName: string;
  installmentNo: number;
  paymentDate: string;
  paymentMethod: 'KAS' | 'BANK';
  bankName?: string;
  principalPortion: number;
  interestPortion: number;
  penaltyPortion: number;
  totalAmount: number;
  notes: string;
  cashBankRefId?: string;
  journalRefId?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
}

export interface CashBankTransaction {
  cashBankId: string; // KM/KK/BM/BK-2026-000001
  type: CashMutationType;
  accountType: 'KAS_TUNAI' | 'BANK_BCA' | 'BANK_MANDIRI' | 'BANK_BRI';
  sourceModule: 'SIMPANAN' | 'PINJAMAN' | 'ANGSURAN' | 'OPERASIONAL' | 'PAJAK' | 'TRANSFER' | 'LAINNYA';
  sourceId: string;
  amount: number;
  balanceAfter: number;
  description: string;
  coaCode: string;
  status: TransactionStatus;
  journalRefId?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
}

export interface ChartOfAccount {
  coaCode: string; // 1-1001
  accountName: string;
  category: 'ASET' | 'KEWAJIBAN' | 'EKUITAS' | 'PENDAPATAN' | 'BEBAN';
  subCategory: string;
  normalBalance: 'DEBIT' | 'KREDIT';
  currentBalance: number;
  active: boolean;
}

export interface JournalDetail {
  itemId: string;
  coaCode: string;
  accountName: string;
  debit: number;
  credit: number;
  memo: string;
}

export interface JournalEntry {
  journalId: string; // JR-2026-000001
  entryDate: string;
  referenceNumber: string;
  sourceModule: 'SIMPANAN' | 'PINJAMAN' | 'ANGSURAN' | 'KAS_BANK' | 'PAJAK' | 'MANUAL' | 'CLOSING';
  sourceId: string;
  eventId: string;
  description: string;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  status: 'POSTED' | 'REVERSED';
  reversedJournalId?: string;
  details: JournalDetail[];
  createdById: string;
  createdByName: string;
  createdAt: string;
}

export interface TaxConfig {
  taxCode: string;
  taxName: string;
  taxType: 'PPH_FINAL_4_2' | 'PPH_21' | 'PPH_23';
  ratePercentage: number;
  thresholdAmount: number;
  description: string;
  coaAccount: string;
  active: boolean;
}

export type JournalLine = JournalDetail;
export type TaxRecord = TaxTransaction;
export type TaxType = 'PPH_FINAL_4_2' | 'PPH_21' | 'PPH_23';

export interface TaxTransaction {
  taxId: string; // TAX-2026-000001
  taxCode: string;
  taxName: string;
  periodMonth: number;
  periodYear: number;
  partyId: string;
  partyName: string;
  npwp?: string;
  sourceModule: 'SIMPANAN' | 'PINJAMAN' | 'AKUNTANSI' | 'HONOR';
  sourceId: string;
  grossAmount: number; // DPP
  taxRate: number;
  taxAmount: number;
  buktiPotongNumber?: string;
  status: 'TERCATAT' | 'DISETOR' | 'DILAPORKAN';
  createdAt: string;
}

export interface AuditLog {
  logId: string; // LOG-2026-000001
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  module: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE_REQUEST' | 'APPROVE' | 'REJECT' | 'POST' | 'REVERSE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'BACKUP' | 'SYNC';
  recordId: string;
  oldValue?: string;
  newValue?: string;
  status: 'SUCCESS' | 'FAILED';
  ipAddress: string;
  message: string;
}

export interface DbRegistryItem {
  dbCode: string;
  dbName: string;
  spreadsheetId: string;
  description: string;
  active: boolean;
  lastSync: string;
  version: string;
}

export interface SystemStats {
  totalAnggota: number;
  totalNonAnggota: number;
  totalSimpanan: number;
  totalPinjaman: number;
  piutangBerjalan: number;
  angsuranHariIni: {
    count: number;
    amount: number;
  };
  totalTunggakan: number;
  tunggakanCount: number;
  pendapatanBungaBulanIni: number;
  saldoKasTunai: number;
  saldoBank: number;
  totalAset: number;
  totalKewajiban: number;
  shuBulanIni: number;
  agingTunggakan: {
    d1_30: number;
    d31_60: number;
    d61_90: number;
    dOver90: number;
  };
  upcomingInstallments: {
    today: { count: number; amount: number };
    days1_7: { count: number; amount: number };
    days8_30: { count: number; amount: number };
    daysOver30: { count: number; amount: number };
  };
  loanPurposeComposition: {
    konsumtif: number;
    produktif: number;
    modalKerja: number;
    investasi: number;
  };
}
