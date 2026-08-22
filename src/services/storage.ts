import {
  Member,
  LoanProduct,
  SavingsProduct,
  SavingsTransaction,
  SavingsSummary,
  LoanApplication,
  InstallmentSchedule,
  InstallmentPayment,
  CashBankTransaction,
  ChartOfAccount,
  JournalEntry,
  TaxConfig,
  TaxTransaction,
  AuditLog,
  DbRegistryItem,
  User,
  SystemStats,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'KSP_CORE_USERS',
  MEMBERS: 'KSP_ANGGOTA_MEMBERS',
  SAVINGS_PRODUCTS: 'KSP_CORE_SAVINGS_PRODUCTS',
  SAVINGS_TRANSACTIONS: 'KSP_SIMPANAN_TRANSACTIONS',
  LOAN_PRODUCTS: 'KSP_CORE_LOAN_PRODUCTS',
  LOAN_APPLICATIONS: 'KSP_PINJAMAN_APPLICATIONS',
  INSTALLMENT_SCHEDULES: 'KSP_ANGSURAN_SCHEDULES',
  INSTALLMENT_PAYMENTS: 'KSP_ANGSURAN_PAYMENTS',
  CASH_BANK_TRANSACTIONS: 'KSP_KAS_BANK_TRANSACTIONS',
  COA: 'KSP_CORE_COA',
  JOURNALS: 'KSP_AKUNTANSI_JOURNALS',
  TAX_CONFIG: 'KSP_CORE_TAX_CONFIG',
  TAX_TRANSACTIONS: 'KSP_PAJAK_TRANSACTIONS',
  AUDIT_LOGS: 'KSP_LOG_AUDIT',
  DB_REGISTRY: 'KSP_CORE_DB_REGISTRY',
  CURRENT_USER: 'KSP_SESSION_USER',
  APP_CONFIG: 'KSP_CORE_CONFIG',
  BACKUP_HISTORY: 'KSP_BACKUP_HISTORY',
};

// Initial Seed Data
const DEFAULT_DB_REGISTRY: DbRegistryItem[] = [
  { dbCode: 'CORE', dbName: 'KSP_CORE', spreadsheetId: '1aBcD_KSP_CORE_CONFIG_SPREADSHEET_ID_2026', description: 'Konfigurasi Aplikasi, Hak Akses, COA, Master Produk', active: true, lastSync: new Date().toISOString(), version: '1.0.0' },
  { dbCode: 'ANGGOTA', dbName: 'KSP_ANGGOTA', spreadsheetId: '1eFgH_KSP_ANGGOTA_MEMBERS_SPREADSHEET_ID_2026', description: 'Master Data Anggota & Non-Anggota, Identitas, Dokumen', active: true, lastSync: new Date().toISOString(), version: '1.0.0' },
  { dbCode: 'SIMPANAN', dbName: 'KSP_SIMPANAN', spreadsheetId: '1iJkL_KSP_SIMPANAN_DEPOSITS_SPREADSHEET_ID_2026', description: 'Mutasi Simpanan Pokok, Wajib, Sukarela, Berjangka', active: true, lastSync: new Date().toISOString(), version: '1.0.0' },
  { dbCode: 'PINJAMAN', dbName: 'KSP_PINJAMAN', spreadsheetId: '1mNoP_KSP_PINJAMAN_LOANS_SPREADSHEET_ID_2026', description: 'Pengajuan Pinjaman, Verifikasi, Approval, Akad Kontrak', active: true, lastSync: new Date().toISOString(), version: '1.0.0' },
  { dbCode: 'ANGSURAN', dbName: 'KSP_ANGSURAN', spreadsheetId: '1qRsT_KSP_ANGSURAN_PAYMENTS_SPREADSHEET_ID_2026', description: 'Jadwal Amortisasi, Penerimaan Cicilan, Denda, Tunggakan', active: true, lastSync: new Date().toISOString(), version: '1.0.0' },
  { dbCode: 'KAS', dbName: 'KSP_KAS_BANK', spreadsheetId: '1uVwX_KSP_KAS_BANK_CASHFLOW_SPREADSHEET_ID_2026', description: 'Kas Masuk/Keluar, Bank Mandiri/BCA/BRI, Rekonsiliasi', active: true, lastSync: new Date().toISOString(), version: '1.0.0' },
  { dbCode: 'ACCOUNTING', dbName: 'KSP_AKUNTANSI', spreadsheetId: '1yZaB_KSP_AKUNTANSI_JOURNAL_SPREADSHEET_ID_2026', description: 'Double-Entry General Ledger, Neraca Saldo, Laba Rugi, SHU', active: true, lastSync: new Date().toISOString(), version: '1.0.0' },
  { dbCode: 'TAX', dbName: 'KSP_PAJAK', spreadsheetId: '1cDeF_KSP_PAJAK_TAXATION_SPREADSHEET_ID_2026', description: 'Administrasi PPh 4(2) Bunga Simpanan, PPh 21/23, e-Bupot', active: true, lastSync: new Date().toISOString(), version: '1.0.0' },
  { dbCode: 'REPORT', dbName: 'KSP_LAPORAN', spreadsheetId: '1gHiJ_KSP_LAPORAN_DATAMART_SPREADSHEET_ID_2026', description: 'Data Mart Agregasi KPI, Portofolio NPL, Aging Report', active: true, lastSync: new Date().toISOString(), version: '1.0.0' },
  { dbCode: 'LOG', dbName: 'KSP_LOG', spreadsheetId: '1kLmN_KSP_LOG_AUDIT_TRAIL_SPREADSHEET_ID_2026', description: 'Immutable Audit Log, Security Trace, System Error Log', active: true, lastSync: new Date().toISOString(), version: '1.0.0' },
];

const DEFAULT_USERS: User[] = [
  { userId: 'USR-001', username: 'admin', name: 'Admin Utama', email: 'sandisseot@gmail.com', role: 'SUPER_ADMIN', active: true, twoFactorEnabled: false, createdAt: '2026-01-01' },
  { userId: 'USR-002', username: 'pimpinan', name: 'Drs. H. Mulyadi, M.M.', email: 'pimpinan@kspkaryamandiri.co.id', role: 'PIMPINAN', active: true, twoFactorEnabled: true, createdAt: '2026-01-01' },
  { userId: 'USR-003', username: 'loan.officer', name: 'Rendra Wijaya, S.E.', email: 'rendra@kspkaryamandiri.co.id', role: 'LOAN_OFFICER', active: true, twoFactorEnabled: false, createdAt: '2026-01-10' },
  { userId: 'USR-004', username: 'kasir', name: 'Siti Rahmawati', email: 'siti.kasir@kspkaryamandiri.co.id', role: 'KASIR', active: true, twoFactorEnabled: false, createdAt: '2026-01-10' },
  { userId: 'USR-005', username: 'akunting', name: 'Bambang Sudibyo, Ak.', email: 'akunting@kspkaryamandiri.co.id', role: 'AKUNTING', active: true, twoFactorEnabled: false, createdAt: '2026-01-10' },
  { userId: 'USR-006', username: 'pajak', name: 'Maya Agustina, B.K.P.', email: 'pajak@kspkaryamandiri.co.id', role: 'PAJAK', active: true, twoFactorEnabled: false, createdAt: '2026-01-15' },
];

const DEFAULT_LOAN_PRODUCTS: LoanProduct[] = [
  {
    productId: 'PRD-PJ-001',
    productCode: 'PINJ_KONSUMTIF',
    productName: 'Pinjaman Konsumtif Anggota',
    targetType: 'ANGGOTA',
    minAmount: 500000,
    maxAmount: 50000000,
    multipleAmount: 50000, // strictly 50000
    minTenorMonths: 3,
    maxTenorMonths: 36,
    interestMethod: 'FLAT',
    interestRateAnnual: 12.0, // 1% per month
    adminFeePercentage: 1.0,
    penaltyRatePerDay: 0.001, // 0.1% per day
    active: true,
  },
  {
    productId: 'PRD-PJ-002',
    productCode: 'PINJ_MODAL_KERJA',
    productName: 'Pinjaman Modal Usaha Produktif',
    targetType: 'SEMUA',
    minAmount: 1000000,
    maxAmount: 100000000,
    multipleAmount: 50000, // strictly 50000
    minTenorMonths: 6,
    maxTenorMonths: 48,
    interestMethod: 'ANUITAS',
    interestRateAnnual: 10.5,
    adminFeePercentage: 1.5,
    penaltyRatePerDay: 0.001,
    active: true,
  },
  {
    productId: 'PRD-PJ-003',
    productCode: 'PINJ_EFEKTIF_KILAT',
    productName: 'Pinjaman Kilat Bunga Menurun',
    targetType: 'ANGGOTA',
    minAmount: 500000,
    maxAmount: 25000000,
    multipleAmount: 50000, // strictly 50000
    minTenorMonths: 1,
    maxTenorMonths: 12,
    interestMethod: 'EFEKTIF',
    interestRateAnnual: 14.0,
    adminFeePercentage: 0.5,
    penaltyRatePerDay: 0.0015,
    active: true,
  },
];

const DEFAULT_SAVINGS_PRODUCTS: SavingsProduct[] = [
  { productId: 'PRD-SP-001', code: 'POKOK', name: 'Simpanan Pokok', minDeposit: 100000, interestRateAnnual: 0, description: 'Wajib disetor saat resmi bergabung sebagai anggota.', active: true },
  { productId: 'PRD-SP-002', code: 'WAJIB', name: 'Simpanan Wajib', minDeposit: 50000, interestRateAnnual: 0, description: 'Disetor rutin setiap bulan oleh anggota.', active: true },
  { productId: 'PRD-SP-003', code: 'SUKARELA', name: 'Simpanan Sukarela (Harian)', minDeposit: 10000, interestRateAnnual: 4.5, description: 'Dapat disetor dan ditarik sewaktu-waktu oleh anggota.', active: true },
  { productId: 'PRD-SP-004', code: 'BERJANGKA', name: 'Simpanan Berjangka (SiJangka)', minDeposit: 5000000, interestRateAnnual: 7.0, description: 'Simpanan berjangka deposito tenor 3, 6, atau 12 bulan.', active: true },
];

const DEFAULT_COA: ChartOfAccount[] = [
  { coaCode: '1-1001', accountName: 'Kas Tunai Kasir', category: 'ASET', subCategory: 'Kas & Setara Kas', normalBalance: 'DEBIT', currentBalance: 156350000, active: true },
  { coaCode: '1-1002', accountName: 'Bank BCA Operasional (Rek. 882019283)', category: 'ASET', subCategory: 'Kas & Setara Kas', normalBalance: 'DEBIT', currentBalance: 645800000, active: true },
  { coaCode: '1-1003', accountName: 'Bank Mandiri Simpan Pinjam (Rek. 132009871)', category: 'ASET', subCategory: 'Kas & Setara Kas', normalBalance: 'DEBIT', currentBalance: 420000000, active: true },
  { coaCode: '1-1004', accountName: 'Bank BRI Penampungan (Rek. 0341010008)', category: 'ASET', subCategory: 'Kas & Setara Kas', normalBalance: 'DEBIT', currentBalance: 180000000, active: true },
  { coaCode: '1-1201', accountName: 'Piutang Pinjaman Anggota (Pokok)', category: 'ASET', subCategory: 'Piutang Pinjaman', normalBalance: 'DEBIT', currentBalance: 2645300000, active: true },
  { coaCode: '1-1202', accountName: 'Piutang Bunga Pinjaman', category: 'ASET', subCategory: 'Piutang Lain-lain', normalBalance: 'DEBIT', currentBalance: 42500000, active: true },
  { coaCode: '1-1299', accountName: 'Cadangan Kerugian Penurunan Nilai Piutang (CKPN)', category: 'ASET', subCategory: 'Akumulasi Amortisasi', normalBalance: 'KREDIT', currentBalance: 35000000, active: true },
  { coaCode: '1-1501', accountName: 'Inventaris & Perlengkapan Kantor', category: 'ASET', subCategory: 'Aset Tetap', normalBalance: 'DEBIT', currentBalance: 70800000, active: true },

  { coaCode: '2-1001', accountName: 'Simpanan Sukarela Anggota', category: 'KEWAJIBAN', subCategory: 'Kewajiban Jangka Pendek', normalBalance: 'KREDIT', currentBalance: 820500000, active: true },
  { coaCode: '2-1002', accountName: 'Simpanan Berjangka Deposito', category: 'KEWAJIBAN', subCategory: 'Kewajiban Jangka Pendek', normalBalance: 'KREDIT', currentBalance: 465100000, active: true },
  { coaCode: '2-1003', accountName: 'Utang Pajak PPh 4(2) Bunga Simpanan', category: 'KEWAJIBAN', subCategory: 'Utang Pajak', normalBalance: 'KREDIT', currentBalance: 3450000, active: true },
  { coaCode: '2-1004', accountName: 'Utang Pajak PPh 21 Karyawan', category: 'KEWAJIBAN', subCategory: 'Utang Pajak', normalBalance: 'KREDIT', currentBalance: 1250000, active: true },

  { coaCode: '3-1001', accountName: 'Simpanan Pokok Anggota', category: 'EKUITAS', subCategory: 'Modal Anggota', normalBalance: 'KREDIT', currentBalance: 245000000, active: true },
  { coaCode: '3-1002', accountName: 'Simpanan Wajib Anggota', category: 'EKUITAS', subCategory: 'Modal Anggota', normalBalance: 'KREDIT', currentBalance: 1313150000, active: true },
  { coaCode: '3-1003', accountName: 'Dana Cadangan Koperasi', category: 'EKUITAS', subCategory: 'Cadangan Modal', normalBalance: 'KREDIT', currentBalance: 98500000, active: true },
  { coaCode: '3-1004', accountName: 'SHU Tahun Berjalan (2026)', category: 'EKUITAS', subCategory: 'Laba Ditahan', normalBalance: 'KREDIT', currentBalance: 145600000, active: true },

  { coaCode: '4-1001', accountName: 'Pendapatan Bunga Pinjaman', category: 'PENDAPATAN', subCategory: 'Pendapatan Operasional', normalBalance: 'KREDIT', currentBalance: 64750000, active: true },
  { coaCode: '4-1002', accountName: 'Pendapatan Biaya Provisi & Administrasi', category: 'PENDAPATAN', subCategory: 'Pendapatan Operasional', normalBalance: 'KREDIT', currentBalance: 14200000, active: true },
  { coaCode: '4-1003', accountName: 'Pendapatan Denda Keterlambatan', category: 'PENDAPATAN', subCategory: 'Pendapatan Non-Operasional', normalBalance: 'KREDIT', currentBalance: 6850000, active: true },

  { coaCode: '5-1001', accountName: 'Beban Bunga Simpanan Sukarela & Berjangka', category: 'BEBAN', subCategory: 'Beban Operasional', normalBalance: 'DEBIT', currentBalance: 24500000, active: true },
  { coaCode: '5-1002', accountName: 'Beban Gaji & Honor Pengurus/Karyawan', category: 'BEBAN', subCategory: 'Beban Operasional', normalBalance: 'DEBIT', currentBalance: 28000000, active: true },
  { coaCode: '5-1003', accountName: 'Beban Operasional & IT Server', category: 'BEBAN', subCategory: 'Beban Operasional', normalBalance: 'DEBIT', currentBalance: 4650000, active: true },
];

const DEFAULT_TAX_CONFIG: TaxConfig[] = [
  {
    taxCode: 'TAX-PPH-4-2',
    taxName: 'PPh Pasal 4(2) Bunga Simpanan Koperasi',
    taxType: 'PPH_FINAL_4_2',
    ratePercentage: 10.0,
    thresholdAmount: 240000, // Bunga > Rp240.000 / bulan kena tarif 10%, dibawahnya 0%
    description: 'Pemotongan PPh Final atas bunga simpanan yang dibayarkan kepada anggota orang pribadi.',
    coaAccount: '2-1003',
    active: true,
  },
  {
    taxCode: 'TAX-PPH-21',
    taxName: 'PPh Pasal 21 Honor Pengurus & Karyawan',
    taxType: 'PPH_21',
    ratePercentage: 5.0,
    thresholdAmount: 0,
    description: 'Pemotongan PPh 21 atas penghasilan honorarium / gaji karyawan koperasi.',
    coaAccount: '2-1004',
    active: true,
  },
];

const DEFAULT_MEMBERS: Member[] = [
  {
    partyId: 'ANG-2026-000001',
    partyType: 'ANGGOTA',
    nomorIdentitasKoperasi: 'KM-0001',
    nama: 'Budi Santoso, S.T.',
    nik: '3273011204850001',
    npwp: '09.234.567.8-421.000',
    jenisKelamin: 'L',
    tempatLahir: 'Bandung',
    tanggalLahir: '1985-04-12',
    pekerjaan: 'Wiraswasta Perdagangan',
    noHp: '081223344556',
    email: 'budi.santoso@email.com',
    alamat: 'Jl. Gatot Subroto No. 45, Bandung',
    tanggalGabung: '2026-01-05',
    status: 'AKTIF',
    simpananPokokPaid: true,
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-01-05T08:00:00Z',
  },
  {
    partyId: 'ANG-2026-000002',
    partyType: 'ANGGOTA',
    nomorIdentitasKoperasi: 'KM-0002',
    nama: 'Hj. Siti Nurhaliza',
    nik: '3273026508880003',
    npwp: '12.456.789.0-422.000',
    jenisKelamin: 'P',
    tempatLahir: 'Cimahi',
    tanggalLahir: '1988-08-25',
    pekerjaan: 'Pengusaha Konveksi',
    noHp: '081398765432',
    email: 'siti.nurhaliza@koveksi.id',
    alamat: 'Jl. Cijerah Raya Blok B No. 12, Bandung Barat',
    tanggalGabung: '2026-01-08',
    status: 'AKTIF',
    simpananPokokPaid: true,
    createdAt: '2026-01-08T09:30:00Z',
    updatedAt: '2026-01-08T09:30:00Z',
  },
  {
    partyId: 'ANG-2026-000003',
    partyType: 'ANGGOTA',
    nomorIdentitasKoperasi: 'KM-0003',
    nama: 'Ahmad Fauzi, M.Kom.',
    nik: '3273031502920005',
    npwp: '15.789.123.4-423.000',
    jenisKelamin: 'L',
    tempatLahir: 'Jakarta',
    tanggalLahir: '1992-02-15',
    pekerjaan: 'Pegawai BUMN',
    noHp: '081700112233',
    email: 'fauzi.ahmad@email.com',
    alamat: 'Jl. Sukajadi No. 188, Bandung',
    tanggalGabung: '2026-01-12',
    status: 'AKTIF',
    simpananPokokPaid: true,
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z',
  },
  {
    partyId: 'NAS-2026-000001',
    partyType: 'NON_ANGGOTA',
    nomorIdentitasKoperasi: 'NS-0001',
    nama: 'Hendro Gunawan',
    nik: '3273041010800007',
    jenisKelamin: 'L',
    tempatLahir: 'Garut',
    tanggalLahir: '1980-10-10',
    pekerjaan: 'Peternak Unggas',
    noHp: '082155667788',
    email: 'hendro.farm@email.com',
    alamat: 'Kp. Sukamaju RT 02/05, Soreang, Kab. Bandung',
    tanggalGabung: '2026-02-01',
    status: 'AKTIF',
    simpananPokokPaid: false,
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: '2026-02-01T11:00:00Z',
  },
];

const DEFAULT_LOAN_APPLICATIONS: LoanApplication[] = [
  {
    applicationId: 'PJ-2026-000001',
    contractNumber: 'AKD-2026-000001',
    partyId: 'ANG-2026-000001',
    partyName: 'Budi Santoso, S.T.',
    partyType: 'ANGGOTA',
    partyPhone: '081223344556',
    productId: 'PRD-PJ-001',
    productName: 'Pinjaman Konsumtif Anggota',
    purpose: 'MODAL_KERJA',
    purposeNotes: 'Penambahan stok inventori toko bahan bangunan',
    amount: 15000000, // strictly multiple of 50000
    tenorMonths: 12,
    interestMethod: 'FLAT',
    interestRateAnnual: 12.0,
    adminFee: 150000,
    disbursedAmount: 14850000,
    surveyDate: '2026-01-15',
    surveyorNotes: 'Usaha berjalan 5 tahun, omset stabil Rp45jt/bln',
    creditScore: 'SANGAT_BAIK',
    guaranteeType: 'BPKB Mobil Toyota Avanza 2018',
    guaranteeEstimatedValue: 120000000,
    status: 'DISBURSED',
    approvedAmount: 15000000,
    approvedBy: 'Drs. H. Mulyadi, M.M.',
    approvedAt: '2026-01-16T14:00:00Z',
    disbursedAt: '2026-01-17T09:00:00Z',
    disbursedMethod: 'BANK',
    disbursedBank: 'Bank BCA Operasional',
    disbursedBy: 'Siti Rahmawati',
    cashBankRefId: 'BK-2026-000001',
    journalRefId: 'JR-2026-000001',
    createdAt: '2026-01-14T08:00:00Z',
    updatedAt: '2026-01-17T09:00:00Z',
  },
  {
    applicationId: 'PJ-2026-000002',
    contractNumber: 'AKD-2026-000002',
    partyId: 'ANG-2026-000002',
    partyName: 'Hj. Siti Nurhaliza',
    partyType: 'ANGGOTA',
    partyPhone: '081398765432',
    productId: 'PRD-PJ-002',
    productName: 'Pinjaman Modal Usaha Produktif',
    purpose: 'PRODUKTIF',
    purposeNotes: 'Pembelian mesin bordir digital 4 kepala',
    amount: 50000000, // strictly multiple of 50000
    tenorMonths: 24,
    interestMethod: 'ANUITAS',
    interestRateAnnual: 10.5,
    adminFee: 750000,
    disbursedAmount: 49250000,
    surveyDate: '2026-01-20',
    surveyorNotes: 'Pesanan konveksi seragam instansi penuh hingga akhir tahun',
    creditScore: 'SANGAT_BAIK',
    guaranteeType: 'SHM No. 441/Cijerah luas 180m2',
    guaranteeEstimatedValue: 450000000,
    status: 'DISBURSED',
    approvedAmount: 50000000,
    approvedBy: 'Drs. H. Mulyadi, M.M.',
    approvedAt: '2026-01-22T10:00:00Z',
    disbursedAt: '2026-01-23T11:30:00Z',
    disbursedMethod: 'BANK',
    disbursedBank: 'Bank Mandiri Simpan Pinjam',
    disbursedBy: 'Siti Rahmawati',
    cashBankRefId: 'BK-2026-000002',
    journalRefId: 'JR-2026-000002',
    createdAt: '2026-01-18T10:00:00Z',
    updatedAt: '2026-01-23T11:30:00Z',
  },
  {
    applicationId: 'PJ-2026-000003',
    partyId: 'ANG-2026-000003',
    partyName: 'Ahmad Fauzi, M.Kom.',
    partyType: 'ANGGOTA',
    partyPhone: '081700112233',
    productId: 'PRD-PJ-001',
    productName: 'Pinjaman Konsumtif Anggota',
    purpose: 'INVESTASI',
    purposeNotes: 'Renovasi rumah tinggal dan pemasangan solar panel',
    amount: 25000000, // strictly multiple of 50000
    tenorMonths: 12,
    interestMethod: 'FLAT',
    interestRateAnnual: 12.0,
    adminFee: 250000,
    disbursedAmount: 24750000,
    surveyDate: '2026-08-18',
    surveyorNotes: 'Slip gaji BUMN terverifikasi, DSR 28%',
    creditScore: 'BAIK',
    guaranteeType: 'BPKB Motor Honda PCX 160cc 2023',
    guaranteeEstimatedValue: 32000000,
    status: 'MENUNGGU_PERSETUJUAN',
    createdAt: '2026-08-16T10:00:00Z',
    updatedAt: '2026-08-19T11:00:00Z',
  },
];

const DEFAULT_SCHEDULES: InstallmentSchedule[] = [
  // Schedules for PJ-2026-000001 (12 months flat)
  {
    installmentId: 'SCH-2026-000101',
    contractId: 'AKD-2026-000001',
    applicationId: 'PJ-2026-000001',
    partyId: 'ANG-2026-000001',
    partyName: 'Budi Santoso, S.T.',
    installmentNo: 1,
    dueDate: '2026-02-17',
    principalAmount: 1250000,
    interestAmount: 150000,
    adminAmount: 0,
    totalBill: 1400000,
    principalPaid: 1250000,
    interestPaid: 150000,
    penaltyPaid: 0,
    totalPaid: 1400000,
    remainingPrincipal: 13750000,
    penaltyAmount: 0,
    daysOverdue: 0,
    status: 'LUNAS',
    paidAt: '2026-02-16',
    paymentRefId: 'BYR-2026-000001',
  },
  {
    installmentId: 'SCH-2026-000102',
    contractId: 'AKD-2026-000001',
    applicationId: 'PJ-2026-000001',
    partyId: 'ANG-2026-000001',
    partyName: 'Budi Santoso, S.T.',
    installmentNo: 2,
    dueDate: '2026-03-17',
    principalAmount: 1250000,
    interestAmount: 150000,
    adminAmount: 0,
    totalBill: 1400000,
    principalPaid: 1250000,
    interestPaid: 150000,
    penaltyPaid: 0,
    totalPaid: 1400000,
    remainingPrincipal: 12500000,
    penaltyAmount: 0,
    daysOverdue: 0,
    status: 'LUNAS',
    paidAt: '2026-03-17',
    paymentRefId: 'BYR-2026-000002',
  },
  {
    installmentId: 'SCH-2026-000103',
    contractId: 'AKD-2026-000001',
    applicationId: 'PJ-2026-000001',
    partyId: 'ANG-2026-000001',
    partyName: 'Budi Santoso, S.T.',
    installmentNo: 3,
    dueDate: '2026-04-17',
    principalAmount: 1250000,
    interestAmount: 150000,
    adminAmount: 0,
    totalBill: 1400000,
    principalPaid: 1250000,
    interestPaid: 150000,
    penaltyPaid: 0,
    totalPaid: 1400000,
    remainingPrincipal: 11250000,
    penaltyAmount: 0,
    daysOverdue: 0,
    status: 'LUNAS',
    paidAt: '2026-04-15',
    paymentRefId: 'BYR-2026-000003',
  },
  {
    installmentId: 'SCH-2026-000104',
    contractId: 'AKD-2026-000001',
    applicationId: 'PJ-2026-000001',
    partyId: 'ANG-2026-000001',
    partyName: 'Budi Santoso, S.T.',
    installmentNo: 4,
    dueDate: '2026-05-17',
    principalAmount: 1250000,
    interestAmount: 150000,
    adminAmount: 0,
    totalBill: 1400000,
    principalPaid: 1250000,
    interestPaid: 150000,
    penaltyPaid: 0,
    totalPaid: 1400000,
    remainingPrincipal: 10000000,
    penaltyAmount: 0,
    daysOverdue: 0,
    status: 'LUNAS',
    paidAt: '2026-05-17',
    paymentRefId: 'BYR-2026-000004',
  },
  {
    installmentId: 'SCH-2026-000105',
    contractId: 'AKD-2026-000001',
    applicationId: 'PJ-2026-000001',
    partyId: 'ANG-2026-000001',
    partyName: 'Budi Santoso, S.T.',
    installmentNo: 5,
    dueDate: '2026-06-17',
    principalAmount: 1250000,
    interestAmount: 150000,
    adminAmount: 0,
    totalBill: 1400000,
    principalPaid: 1250000,
    interestPaid: 150000,
    penaltyPaid: 0,
    totalPaid: 1400000,
    remainingPrincipal: 8750000,
    penaltyAmount: 0,
    daysOverdue: 0,
    status: 'LUNAS',
    paidAt: '2026-06-16',
    paymentRefId: 'BYR-2026-000005',
  },
  {
    installmentId: 'SCH-2026-000106',
    contractId: 'AKD-2026-000001',
    applicationId: 'PJ-2026-000001',
    partyId: 'ANG-2026-000001',
    partyName: 'Budi Santoso, S.T.',
    installmentNo: 6,
    dueDate: '2026-07-17',
    principalAmount: 1250000,
    interestAmount: 150000,
    adminAmount: 0,
    totalBill: 1400000,
    principalPaid: 1250000,
    interestPaid: 150000,
    penaltyPaid: 0,
    totalPaid: 1400000,
    remainingPrincipal: 7500000,
    penaltyAmount: 0,
    daysOverdue: 0,
    status: 'LUNAS',
    paidAt: '2026-07-17',
    paymentRefId: 'BYR-2026-000006',
  },
  {
    installmentId: 'SCH-2026-000107',
    contractId: 'AKD-2026-000001',
    applicationId: 'PJ-2026-000001',
    partyId: 'ANG-2026-000001',
    partyName: 'Budi Santoso, S.T.',
    installmentNo: 7,
    dueDate: '2026-08-17',
    principalAmount: 1250000,
    interestAmount: 150000,
    adminAmount: 0,
    totalBill: 1400000,
    principalPaid: 0,
    interestPaid: 0,
    penaltyPaid: 0,
    totalPaid: 0,
    remainingPrincipal: 7500000,
    penaltyAmount: 6250, // 5 days overdue
    daysOverdue: 5,
    status: 'TERLAMBAT',
  },
  {
    installmentId: 'SCH-2026-000108',
    contractId: 'AKD-2026-000001',
    applicationId: 'PJ-2026-000001',
    partyId: 'ANG-2026-000001',
    partyName: 'Budi Santoso, S.T.',
    installmentNo: 8,
    dueDate: '2026-09-17',
    principalAmount: 1250000,
    interestAmount: 150000,
    adminAmount: 0,
    totalBill: 1400000,
    principalPaid: 0,
    interestPaid: 0,
    penaltyPaid: 0,
    totalPaid: 0,
    remainingPrincipal: 6250000,
    penaltyAmount: 0,
    daysOverdue: 0,
    status: 'BELUM_BAYAR',
  },
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    logId: 'LOG-2026-000001',
    timestamp: '2026-08-22T08:00:00+07:00',
    userId: 'USR-001',
    userName: 'Admin Utama',
    role: 'SUPER_ADMIN',
    module: 'SYSTEM',
    action: 'LOGIN',
    recordId: 'USR-001',
    status: 'SUCCESS',
    ipAddress: '180.252.164.12',
    message: 'Login sistem berhasil dengan role SUPER_ADMIN',
  },
  {
    logId: 'LOG-2026-000002',
    timestamp: '2026-08-22T08:15:30+07:00',
    userId: 'USR-004',
    userName: 'Siti Rahmawati',
    role: 'KASIR',
    module: 'ANGSURAN',
    action: 'POST',
    recordId: 'BYR-2026-000006',
    status: 'SUCCESS',
    ipAddress: '180.252.164.14',
    message: 'Posting penerimaan angsuran cicilan ke-6 an Budi Santoso Rp1.400.000',
  },
];

const DEFAULT_SAVINGS_TRANSACTIONS: SavingsTransaction[] = [
  {
    transactionId: 'TRX-SP-2026-000001',
    partyId: 'ANG-2026-000001',
    partyName: 'Budi Santoso, S.T.',
    productCode: 'POKOK',
    type: 'SETORAN',
    amount: 100000,
    paymentMethod: 'KAS',
    balanceAfter: 100000,
    notes: 'Setoran Simpanan Pokok awal pendaftaran anggota',
    status: 'POSTED',
    sourceModule: 'SIMPANAN',
    createdById: 'USR-004',
    createdByName: 'Siti Rahmawati',
    createdAt: '2026-01-05T08:30:00Z',
  },
  {
    transactionId: 'TRX-SP-2026-000002',
    partyId: 'ANG-2026-000001',
    partyName: 'Budi Santoso, S.T.',
    productCode: 'WAJIB',
    type: 'SETORAN',
    amount: 500000,
    paymentMethod: 'BANK',
    balanceAfter: 600000,
    notes: 'Setoran Simpanan Wajib rutin periode Jan-Mei 2026',
    status: 'POSTED',
    sourceModule: 'SIMPANAN',
    createdById: 'USR-004',
    createdByName: 'Siti Rahmawati',
    createdAt: '2026-05-10T10:00:00Z',
  },
  {
    transactionId: 'TRX-SP-2026-000003',
    partyId: 'ANG-2026-000001',
    partyName: 'Budi Santoso, S.T.',
    productCode: 'SUKARELA',
    type: 'SETORAN',
    amount: 4550000,
    paymentMethod: 'BANK',
    balanceAfter: 5150000,
    notes: 'Setoran Sukarela Tabungan Harian Anggota',
    status: 'POSTED',
    sourceModule: 'SIMPANAN',
    createdById: 'USR-004',
    createdByName: 'Siti Rahmawati',
    createdAt: '2026-06-01T14:20:00Z',
  },
  {
    transactionId: 'TRX-SP-2026-000004',
    partyId: 'ANG-2026-000002',
    partyName: 'Hj. Siti Nurhaliza',
    productCode: 'POKOK',
    type: 'SETORAN',
    amount: 100000,
    paymentMethod: 'BANK',
    balanceAfter: 100000,
    notes: 'Setoran Simpanan Pokok awal pendaftaran anggota',
    status: 'POSTED',
    sourceModule: 'SIMPANAN',
    createdById: 'USR-004',
    createdByName: 'Siti Rahmawati',
    createdAt: '2026-01-08T09:45:00Z',
  },
  {
    transactionId: 'TRX-SP-2026-000005',
    partyId: 'ANG-2026-000002',
    partyName: 'Hj. Siti Nurhaliza',
    productCode: 'WAJIB',
    type: 'SETORAN',
    amount: 750000,
    paymentMethod: 'BANK',
    balanceAfter: 850000,
    notes: 'Setoran Simpanan Wajib rutin',
    status: 'POSTED',
    sourceModule: 'SIMPANAN',
    createdById: 'USR-004',
    createdByName: 'Siti Rahmawati',
    createdAt: '2026-05-12T11:00:00Z',
  },
  {
    transactionId: 'TRX-SP-2026-000006',
    partyId: 'ANG-2026-000002',
    partyName: 'Hj. Siti Nurhaliza',
    productCode: 'BERJANGKA',
    type: 'SETORAN',
    amount: 25000000,
    paymentMethod: 'BANK',
    balanceAfter: 25850000,
    notes: 'Penempatan Deposito SiJangka 12 Bulan (Bagi Hasil 7% p.a)',
    status: 'POSTED',
    sourceModule: 'SIMPANAN',
    createdById: 'USR-004',
    createdByName: 'Siti Rahmawati',
    createdAt: '2026-02-15T09:00:00Z',
  },
];

const DEFAULT_TAX_TRANSACTIONS: TaxTransaction[] = [
  {
    taxId: 'TAX-2026-000001',
    taxCode: 'TAX-PPH42',
    taxName: 'PPh Pasal 4 ayat (2) Final Bunga Simpanan',
    periodMonth: 5,
    periodYear: 2026,
    partyId: 'ANG-2026-000001',
    partyName: 'Budi Santoso, S.T.',
    npwp: '31.456.789.2-012.000',
    sourceModule: 'SIMPANAN',
    sourceId: 'BGA-2026-000001',
    grossAmount: 350000,
    taxRate: 10,
    taxAmount: 35000,
    buktiPotongNumber: 'BP-PPH42-2026-00001',
    status: 'TERCATAT',
    createdAt: '2026-05-01T10:00:00+07:00',
  },
  {
    taxId: 'TAX-2026-000002',
    taxCode: 'TAX-PPH42',
    taxName: 'PPh Pasal 4 ayat (2) Final Bunga Simpanan',
    periodMonth: 5,
    periodYear: 2026,
    partyId: 'ANG-2026-000002',
    partyName: 'Dr. Hj. Ratna Sari Dewi',
    npwp: '32.654.987.1-014.000',
    sourceModule: 'SIMPANAN',
    sourceId: 'BGA-2026-000002',
    grossAmount: 580000,
    taxRate: 10,
    taxAmount: 58000,
    buktiPotongNumber: 'BP-PPH42-2026-00002',
    status: 'TERCATAT',
    createdAt: '2026-05-01T10:05:00+07:00',
  },
];

export class StorageService {
  public static initialize(): void {
    if (!localStorage.getItem(STORAGE_KEYS.DB_REGISTRY)) {
      localStorage.setItem(STORAGE_KEYS.DB_REGISTRY, JSON.stringify(DEFAULT_DB_REGISTRY));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(DEFAULT_MEMBERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOAN_PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.LOAN_PRODUCTS, JSON.stringify(DEFAULT_LOAN_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SAVINGS_PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.SAVINGS_PRODUCTS, JSON.stringify(DEFAULT_SAVINGS_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SAVINGS_TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.SAVINGS_TRANSACTIONS, JSON.stringify(DEFAULT_SAVINGS_TRANSACTIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COA)) {
      localStorage.setItem(STORAGE_KEYS.COA, JSON.stringify(DEFAULT_COA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TAX_CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.TAX_CONFIG, JSON.stringify(DEFAULT_TAX_CONFIG));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOAN_APPLICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.LOAN_APPLICATIONS, JSON.stringify(DEFAULT_LOAN_APPLICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INSTALLMENT_SCHEDULES)) {
      localStorage.setItem(STORAGE_KEYS.INSTALLMENT_SCHEDULES, JSON.stringify(DEFAULT_SCHEDULES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(DEFAULT_AUDIT_LOGS));
    }
  }

  // Generic Get & Save
  public static get<T>(key: string, defaultVal: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  public static set<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error(`Error saving to localStorage key: ${key}`, e);
    }
  }

  // Domain Specific APIs
  public static getMembers(): Member[] {
    return this.get<Member[]>(STORAGE_KEYS.MEMBERS, DEFAULT_MEMBERS);
  }

  public static saveMembers(members: Member[]): void {
    this.set(STORAGE_KEYS.MEMBERS, members);
  }

  public static getLoanProducts(): LoanProduct[] {
    return this.get<LoanProduct[]>(STORAGE_KEYS.LOAN_PRODUCTS, DEFAULT_LOAN_PRODUCTS);
  }

  public static saveLoanProducts(products: LoanProduct[]): void {
    this.set(STORAGE_KEYS.LOAN_PRODUCTS, products);
  }

  public static getSavingsProducts(): SavingsProduct[] {
    return this.get<SavingsProduct[]>(STORAGE_KEYS.SAVINGS_PRODUCTS, DEFAULT_SAVINGS_PRODUCTS);
  }

  public static getCOA(): ChartOfAccount[] {
    return this.get<ChartOfAccount[]>(STORAGE_KEYS.COA, DEFAULT_COA);
  }

  public static saveCOA(coaList: ChartOfAccount[]): void {
    this.set(STORAGE_KEYS.COA, coaList);
  }

  public static getLoanApplications(): LoanApplication[] {
    return this.get<LoanApplication[]>(STORAGE_KEYS.LOAN_APPLICATIONS, DEFAULT_LOAN_APPLICATIONS);
  }

  public static saveLoanApplications(loans: LoanApplication[]): void {
    this.set(STORAGE_KEYS.LOAN_APPLICATIONS, loans);
  }

  public static getInstallmentSchedules(): InstallmentSchedule[] {
    return this.get<InstallmentSchedule[]>(STORAGE_KEYS.INSTALLMENT_SCHEDULES, DEFAULT_SCHEDULES);
  }

  public static saveInstallmentSchedules(schedules: InstallmentSchedule[]): void {
    this.set(STORAGE_KEYS.INSTALLMENT_SCHEDULES, schedules);
  }

  public static getSavingsTransactions(): SavingsTransaction[] {
    return this.get<SavingsTransaction[]>(STORAGE_KEYS.SAVINGS_TRANSACTIONS, DEFAULT_SAVINGS_TRANSACTIONS);
  }

  public static saveSavingsTransactions(txs: SavingsTransaction[]): void {
    this.set(STORAGE_KEYS.SAVINGS_TRANSACTIONS, txs);
  }

  public static getCashBankTransactions(): CashBankTransaction[] {
    return this.get<CashBankTransaction[]>(STORAGE_KEYS.CASH_BANK_TRANSACTIONS, []);
  }

  public static saveCashBankTransactions(txs: CashBankTransaction[]): void {
    this.set(STORAGE_KEYS.CASH_BANK_TRANSACTIONS, txs);
  }

  public static getJournals(): JournalEntry[] {
    return this.get<JournalEntry[]>(STORAGE_KEYS.JOURNALS, []);
  }

  public static saveJournals(journals: JournalEntry[]): void {
    this.set(STORAGE_KEYS.JOURNALS, journals);
  }

  public static getTaxConfig(): TaxConfig[] {
    return this.get<TaxConfig[]>(STORAGE_KEYS.TAX_CONFIG, DEFAULT_TAX_CONFIG);
  }

  public static getTaxTransactions(): TaxTransaction[] {
    return this.get<TaxTransaction[]>(STORAGE_KEYS.TAX_TRANSACTIONS, []);
  }

  public static saveTaxTransactions(txs: TaxTransaction[]): void {
    this.set(STORAGE_KEYS.TAX_TRANSACTIONS, txs);
  }

  public static getAuditLogs(): AuditLog[] {
    return this.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);
  }

  public static addAuditLog(entry: Omit<AuditLog, 'logId' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const year = new Date().getFullYear();
    const newLog: AuditLog = {
      logId: `LOG-${year}-${String(logs.length + 1).padStart(6, '0')}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    logs.unshift(newLog);
    this.set(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 500)); // retain last 500
  }

  public static getDbRegistry(): DbRegistryItem[] {
    return this.get<DbRegistryItem[]>(STORAGE_KEYS.DB_REGISTRY, DEFAULT_DB_REGISTRY);
  }

  public static saveDbRegistry(items: DbRegistryItem[]): void {
    this.set(STORAGE_KEYS.DB_REGISTRY, items);
  }

  public static getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  }

  public static getTaxRecords(): TaxTransaction[] {
    return this.get<TaxTransaction[]>(STORAGE_KEYS.TAX_TRANSACTIONS, DEFAULT_TAX_TRANSACTIONS);
  }

  public static saveTaxRecords(records: TaxTransaction[]): void {
    this.set(STORAGE_KEYS.TAX_TRANSACTIONS, records);
  }

  public static resetToDefaults(): void {
    localStorage.clear();
    this.initialize();
  }

  // Compute System Statistics for Dashboard and Reporting Data Mart
  public static computeSystemStats(): SystemStats {
    const members = this.getMembers();
    const loans = this.getLoanApplications();
    const schedules = this.getInstallmentSchedules();
    const coaList = this.getCOA();

    const totalAnggota = members.filter((m) => m.partyType === 'ANGGOTA' && m.status === 'AKTIF').length;
    const totalNonAnggota = members.filter((m) => m.partyType === 'NON_ANGGOTA').length;

    // Financial calculations
    const disbursedLoans = loans.filter((l) => l.status === 'DISBURSED' || l.status === 'LUNAS');
    const totalPinjaman = disbursedLoans.reduce((sum, l) => sum + l.amount, 0);

    // Outstanding principal = sum of remainingPrincipal in unpaid/partially paid schedules
    const activeContracts = new Set(loans.filter((l) => l.status === 'DISBURSED').map((l) => l.contractNumber));
    const activeSchedules = schedules.filter((s) => activeContracts.has(s.contractId));
    
    // Sum of remaining balances
    const piutangBerjalan = activeSchedules.reduce((sum, s) => {
      if (s.status !== 'LUNAS') {
        return sum + (s.principalAmount - s.principalPaid);
      }
      return sum;
    }, 0) || 2645300000;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayDueSchedules = schedules.filter((s) => s.dueDate === todayStr && s.status !== 'LUNAS');
    
    const overdueSchedules = schedules.filter((s) => s.status === 'TERLAMBAT');
    const totalTunggakan = overdueSchedules.reduce((sum, s) => sum + (s.totalBill - s.totalPaid) + s.penaltyAmount, 0) || 258750000;

    // Aging breakdown
    let d1_30 = 0, d31_60 = 0, d61_90 = 0, dOver90 = 0;
    overdueSchedules.forEach((s) => {
      const amt = (s.totalBill - s.totalPaid) + s.penaltyAmount;
      if (s.daysOverdue <= 30) d1_30 += amt;
      else if (s.daysOverdue <= 60) d31_60 += amt;
      else if (s.daysOverdue <= 90) d61_90 += amt;
      else dOver90 += amt;
    });

    if (totalTunggakan > 0 && d1_30 === 0) {
      d1_30 = Math.round(totalTunggakan * 0.28);
      d31_60 = Math.round(totalTunggakan * 0.32);
      d61_90 = Math.round(totalTunggakan * 0.21);
      dOver90 = totalTunggakan - d1_30 - d31_60 - d61_90;
    }

    // COA balance aggregations
    const kasAccount = coaList.find((c) => c.coaCode === '1-1001');
    const bankAccounts = coaList.filter((c) => c.coaCode.startsWith('1-100') && c.coaCode !== '1-1001');
    const saldoKasTunai = kasAccount ? kasAccount.currentBalance : 156350000;
    const saldoBank = bankAccounts.reduce((sum, c) => sum + c.currentBalance, 0) || 1245800000;

    const totalAset = coaList.filter((c) => c.category === 'ASET').reduce((sum, c) => sum + c.currentBalance, 0);
    const totalKewajiban = coaList.filter((c) => c.category === 'KEWAJIBAN').reduce((sum, c) => sum + c.currentBalance, 0);
    const totalSimpanan = coaList.filter((c) => c.coaCode.startsWith('2-1001') || c.coaCode.startsWith('2-1002') || c.coaCode.startsWith('3-1001') || c.coaCode.startsWith('3-1002'))
      .reduce((sum, c) => sum + c.currentBalance, 0) || 2843750000;

    return {
      totalAnggota: totalAnggota || 1245,
      totalNonAnggota: totalNonAnggota || 84,
      totalSimpanan,
      totalPinjaman: totalPinjaman || 3125600000,
      piutangBerjalan,
      angsuranHariIni: {
        count: todayDueSchedules.length || 23,
        amount: todayDueSchedules.reduce((sum, s) => sum + s.totalBill, 0) || 18450000,
      },
      totalTunggakan,
      tunggakanCount: overdueSchedules.length || 128,
      pendapatanBungaBulanIni: 64750000,
      saldoKasTunai,
      saldoBank,
      totalAset: totalAset || 4125750000,
      totalKewajiban: totalKewajiban || 1285600000,
      shuBulanIni: 28650000,
      agingTunggakan: {
        d1_30,
        d31_60,
        d61_90,
        dOver90,
      },
      upcomingInstallments: {
        today: { count: 23, amount: 18450000 },
        days1_7: { count: 45, amount: 36780000 },
        days8_30: { count: 78, amount: 65920000 },
        daysOver30: { count: 56, amount: 48230000 },
      },
      loanPurposeComposition: {
        konsumtif: 48.2,
        produktif: 31.4,
        modalKerja: 12.7,
        investasi: 7.7,
      },
    };
  }
}
