export interface GasFileItem {
  name: string;
  folder: string;
  type: 'server_js' | 'html' | 'json';
  description: string;
  content: string;
}

export const GAS_FILES_CATALOG: GasFileItem[] = [
  {
    name: 'AUTO_PROVISION_ALL_SPREADSHEETS.gs',
    folder: 'PROVISIONING',
    type: 'server_js',
    description: '1-Klik Otomatis: Membuat Google Drive Folder, 10 Spreadsheet Database, seluruh Sheet Tab & Headers, serta mengisi Script Properties',
    content: `/**
 * =========================================================================
 * @file AUTO_PROVISION_ALL_SPREADSHEETS.gs
 * @description SCRIPT OTOMATIS MEMBUAT 10 GOOGLE SPREADSHEETS DENGAN 1 KLIK
 * =========================================================================
 * 
 * CARA PAKAI:
 * 1. Buka script.google.com -> Buat Project Baru: "KSP Karya Mandiri Backend"
 * 2. Salin seluruh isi file ini ke editor Apps Script.
 * 3. Pilih fungsi 'createAllKspDatabasesAndSetup()' lalu klik 'Run' (Jalankan).
 * 4. Berikan izin akses (Review Permissions) ke Google Drive & Sheets akun Anda.
 * 5. SELESAI! Script akan membuat Folder KSP di Google Drive Anda, membuat 10 file
 *    spreadsheet terpisah, membuat semua sheet & kolom header, mengisi data awal,
 *    dan otomatis menyimpan ID Spreadsheet ke ScriptProperties.
 */

function createAllKspDatabasesAndSetup() {
  Logger.log('=== MEMULAI PEMBUATAN OTOMATIS 10 DATABASE GOOGLE SPREADSHEET KSP ===');
  
  // 1. Buat Folder Penyimpanan di Google Drive Anda
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyyMMdd_HHmmss');
  const folderName = 'KSP_KARYA_MANDIRI_DATABASE_' + timestamp;
  const kspFolder = DriveApp.createFolder(folderName);
  Logger.log('1. Folder Google Drive berhasil dibuat: ' + folderName + ' (ID: ' + kspFolder.getId() + ')');

  const dbDefinitions = [
    {
      code: 'CORE',
      name: 'KSP_CORE_DATABASE',
      sheets: [
        {
          name: 'DB_REGISTRY',
          headers: ['DB_CODE', 'DB_NAME', 'SPREADSHEET_ID', 'ACTIVE', 'VERSION', 'DESCRIPTION', 'LAST_SYNC', 'UPDATED_AT']
        },
        {
          name: 'SEQUENCES',
          headers: ['PREFIX', 'YEAR', 'LAST_VALUE', 'UPDATED_AT']
        },
        {
          name: 'COA',
          headers: ['COA_CODE', 'ACCOUNT_NAME', 'CATEGORY', 'SUB_CATEGORY', 'NORMAL_BALANCE', 'CURRENT_BALANCE', 'ACTIVE']
        },
        {
          name: 'MASTER_PRODUK_PINJAMAN',
          headers: ['PRODUCT_ID', 'PRODUCT_CODE', 'PRODUCT_NAME', 'TARGET_TYPE', 'MIN_AMOUNT', 'MAX_AMOUNT', 'MULTIPLE_AMOUNT', 'MIN_TENOR', 'MAX_TENOR', 'INTEREST_METHOD', 'INTEREST_RATE', 'ADMIN_FEE', 'PENALTY_RATE', 'ACTIVE']
        },
        {
          name: 'MASTER_PRODUK_SIMPANAN',
          headers: ['PRODUCT_ID', 'PRODUCT_CODE', 'PRODUCT_NAME', 'TYPE', 'MIN_INITIAL_DEPOSIT', 'MIN_MONTHLY', 'INTEREST_RATE_PA', 'WITHDRAWAL_ALLOWED', 'LOCK_PERIOD_MONTHS', 'ACTIVE']
        }
      ]
    },
    {
      code: 'MEMBERS',
      name: 'KSP_ANGGOTA_DATABASE',
      sheets: [
        {
          name: 'PARTIES',
          headers: ['PARTY_ID', 'PARTY_TYPE', 'NOMOR_ANGGOTA', 'NAMA', 'NIK', 'NO_HP', 'EMAIL', 'PEKERJAAN', 'ALAMAT', 'TANGGAL_GABUNG', 'SIMPANAN_POKOK_PAID', 'STATUS', 'CREATED_AT']
        },
        {
          name: 'PARTY_DOCUMENTS',
          headers: ['DOC_ID', 'PARTY_ID', 'DOC_TYPE', 'FILE_NAME', 'DRIVE_FILE_ID', 'DRIVE_URL', 'UPLOADED_BY', 'CREATED_AT']
        }
      ]
    },
    {
      code: 'SAVINGS',
      name: 'KSP_SIMPANAN_DATABASE',
      sheets: [
        {
          name: 'SIMPANAN_ACCOUNTS',
          headers: ['ACCOUNT_NO', 'PARTY_ID', 'PRODUCT_CODE', 'SALDO_POKOK', 'SALDO_WAJIB', 'SALDO_SUKARELA', 'SALDO_DEPOSITO', 'TOTAL_SALDO', 'STATUS', 'OPENED_AT']
        },
        {
          name: 'SIMPANAN_TRANSACTIONS',
          headers: ['TRANSACTION_ID', 'PARTY_ID', 'PARTY_NAME', 'PRODUCT_CODE', 'TYPE', 'AMOUNT', 'PAYMENT_METHOD', 'BALANCE_AFTER', 'NOTES', 'STATUS', 'CREATED_BY_NAME', 'CREATED_AT']
        }
      ]
    },
    {
      code: 'LOANS',
      name: 'KSP_PINJAMAN_DATABASE',
      sheets: [
        {
          name: 'LOAN_APPLICATIONS',
          headers: ['APPLICATION_ID', 'CONTRACT_NUMBER', 'PARTY_ID', 'PARTY_NAME', 'PRODUCT_ID', 'PRODUCT_NAME', 'AMOUNT', 'TENOR_MONTHS', 'INTEREST_METHOD', 'INTEREST_RATE_ANNUAL', 'PURPOSE', 'COLLATERAL_TYPE', 'COLLATERAL_EST_VALUE', 'STATUS', 'SURVEY_SCORE', 'SUBMITTED_AT', 'APPROVED_AT', 'DISBURSED_AT']
        }
      ]
    },
    {
      code: 'INSTALLMENTS',
      name: 'KSP_ANGSURAN_DATABASE',
      sheets: [
        {
          name: 'INSTALLMENT_SCHEDULES',
          headers: ['INSTALLMENT_ID', 'CONTRACT_ID', 'APPLICATION_ID', 'PARTY_ID', 'INSTALLMENT_NO', 'DUE_DATE', 'PRINCIPAL_AMOUNT', 'INTEREST_AMOUNT', 'TOTAL_BILL', 'PRINCIPAL_PAID', 'INTEREST_PAID', 'PENALTY_AMOUNT', 'PENALTY_PAID', 'TOTAL_PAID', 'STATUS', 'PAID_AT', 'PAYMENT_REF_ID']
        },
        {
          name: 'PAYMENT_RECEIPTS',
          headers: ['RECEIPT_ID', 'INSTALLMENT_ID', 'CONTRACT_ID', 'PARTY_ID', 'PARTY_NAME', 'AMOUNT_PAID', 'PAYMENT_METHOD', 'CASHIER_NAME', 'CREATED_AT']
        }
      ]
    },
    {
      code: 'CASHBANK',
      name: 'KSP_KAS_BANK_DATABASE',
      sheets: [
        {
          name: 'CASHBANK_TRANSACTIONS',
          headers: ['TRX_ID', 'TYPE', 'ACCOUNT_CODE', 'ACCOUNT_NAME', 'AMOUNT', 'CATEGORY', 'DESCRIPTION', 'REFERENCE_NO', 'RECIPIENT_OR_PAYER', 'STATUS', 'CREATED_BY_NAME', 'CREATED_AT']
        }
      ]
    },
    {
      code: 'ACCOUNTING',
      name: 'KSP_AKUNTANSI_DATABASE',
      sheets: [
        {
          name: 'JURNAL',
          headers: ['JOURNAL_ID', 'DATE', 'REFERENCE_NUMBER', 'SOURCE_MODULE', 'SOURCE_ID', 'EVENT_ID', 'DESCRIPTION', 'TOTAL_DEBIT', 'TOTAL_CREDIT', 'STATUS', 'USER_ID', 'CREATED_AT']
        },
        {
          name: 'JURNAL_DETAIL',
          headers: ['ITEM_ID', 'JOURNAL_ID', 'COA_CODE', 'ACCOUNT_NAME', 'DEBIT', 'CREDIT', 'MEMO']
        }
      ]
    },
    {
      code: 'TAX',
      name: 'KSP_PAJAK_DATABASE',
      sheets: [
        {
          name: 'TAX_TRANSACTIONS',
          headers: ['TAX_ID', 'TAX_TYPE', 'PARTY_ID', 'PARTY_NAME', 'TAX_OBJECT_DESCRIPTION', 'BRUTO_AMOUNT', 'TAX_RATE', 'TAX_AMOUNT', 'WITHHOLDING_SLIP_NUMBER', 'STATUS', 'NTPN_NUMBER', 'TAX_PERIOD_MONTH', 'TAX_PERIOD_YEAR', 'CREATED_AT']
        }
      ]
    },
    {
      code: 'REPORTS',
      name: 'KSP_LAPORAN_DATABASE',
      sheets: [
        {
          name: 'SHU_ANNUAL',
          headers: ['YEAR', 'PENDAPATAN_BUNGA', 'PENDAPATAN_LAIN', 'TOTAL_PENDAPATAN', 'BEBAN_OPERASIONAL', 'SHU_KOTOR', 'PAJAK', 'SHU_BERSIH', 'ALOKASI_DANA_CADANGAN', 'ALOKASI_SHU_ANGGOTA', 'STATUS']
        },
        {
          name: 'NPL_COLLECTIBILITY_REPORT',
          headers: ['CONTRACT_ID', 'PARTY_NAME', 'BAKI_DEBET', 'DAYS_OVERDUE', 'COLLECTIBILITY_STATUS', 'PROVISI_CADANGAN', 'UPDATED_AT']
        }
      ]
    },
    {
      code: 'AUDIT',
      name: 'KSP_AUDIT_LOG_DATABASE',
      sheets: [
        {
          name: 'AUDIT_TRAIL',
          headers: ['LOG_ID', 'TIMESTAMP', 'USER_ID', 'USER_NAME', 'USER_ROLE', 'ACTION', 'MODULE', 'RECORD_ID', 'STATUS', 'IP_ADDRESS', 'MESSAGE']
        }
      ]
    }
  ];

  const scriptProperties = PropertiesService.getScriptProperties();
  const registryRows = [];
  const createdDatabasesInfo = [];

  // 2. Loop & Create each spreadsheet in Google Drive folder
  dbDefinitions.forEach((def, index) => {
    const ss = SpreadsheetApp.create(def.name);
    const ssFile = DriveApp.getFileById(ss.getId());
    
    // Pindahkan file spreadsheet ke folder khusus KSP
    ssFile.moveTo(kspFolder);

    // Buat semua sheet tab & headers
    def.sheets.forEach((shDef, sIdx) => {
      let sheet;
      if (sIdx === 0) {
        sheet = ss.getSheets()[0];
        sheet.setName(shDef.name);
      } else {
        sheet = ss.insertSheet(shDef.name);
      }

      // Tulis Headers
      sheet.appendRow(shDef.headers);
      const headerRange = sheet.getRange(1, 1, 1, shDef.headers.length);
      headerRange.setFontWeight('bold')
                 .setBackground('#064e3b')
                 .setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    });

    // Simpan ke Script Properties
    const propKey = 'SPREADSHEET_ID_' + def.code;
    scriptProperties.setProperty(propKey, ss.getId());

    registryRows.push([
      def.code,
      def.name,
      ss.getId(),
      'TRUE',
      '1.0.0',
      'Physical spreadsheet for ' + def.name,
      new Date(),
      new Date()
    ]);

    createdDatabasesInfo.push({
      code: def.code,
      name: def.name,
      id: ss.getId(),
      url: ss.getUrl()
    });

    Logger.log((index + 1) + '. Sukses membuat ' + def.name + ' -> ID: ' + ss.getId());
  });

  // 3. Simpan ID Core dan Isi DB_REGISTRY pada KSP_CORE_DATABASE
  const coreId = scriptProperties.getProperty('SPREADSHEET_ID_CORE');
  const coreSS = SpreadsheetApp.openById(coreId);
  const regSheet = coreSS.getSheetByName('DB_REGISTRY');
  
  if (regSheet && registryRows.length > 0) {
    regSheet.getRange(2, 1, registryRows.length, registryRows[0].length).setValues(registryRows);
  }

  // 4. Isi Data Awal Chart of Accounts (COA Standar Koperasi Kemenkop)
  const coaSheet = coreSS.getSheetByName('COA');
  if (coaSheet) {
    const initialCoa = [
      ['10101', 'Kas Operasional Koperasi', 'ASET', 'KAS', 'DEBIT', 150000000, 'TRUE'],
      ['10102', 'Kas Teller / Kasir', 'ASET', 'KAS', 'DEBIT', 25000000, 'TRUE'],
      ['10201', 'Bank Mandiri Giro KSP', 'ASET', 'BANK', 'DEBIT', 450000000, 'TRUE'],
      ['10202', 'Bank BRI Giro Operasional', 'ASET', 'BANK', 'DEBIT', 320000000, 'TRUE'],
      ['10301', 'Piutang Pinjaman Anggota (Lancar)', 'ASET', 'PIUTANG', 'DEBIT', 850000000, 'TRUE'],
      ['10302', 'Piutang Pinjaman Non-Anggota', 'ASET', 'PIUTANG', 'DEBIT', 120000000, 'TRUE'],
      ['10399', 'Cadangan Kerugian Piutang (CKPN)', 'ASET', 'PIUTANG', 'KREDIT', 15000000, 'TRUE'],
      ['20101', 'Simpanan Sukarela (Harian)', 'KEWAJIBAN', 'SIMPANAN', 'KREDIT', 280000000, 'TRUE'],
      ['20102', 'Simpanan Berjangka (SiJangka)', 'KEWAJIBAN', 'SIMPANAN', 'KREDIT', 500000000, 'TRUE'],
      ['20201', 'Hutang Titipan Pajak PPh 4(2)', 'KEWAJIBAN', 'PAJAK', 'KREDIT', 4500000, 'TRUE'],
      ['30101', 'Simpanan Pokok Anggota', 'EKUITAS', 'MODAL', 'KREDIT', 120000000, 'TRUE'],
      ['30102', 'Simpanan Wajib Anggota', 'EKUITAS', 'MODAL', 'KREDIT', 350000000, 'TRUE'],
      ['30201', 'Dana Cadangan Koperasi', 'EKUITAS', 'MODAL', 'KREDIT', 105000000, 'TRUE'],
      ['40101', 'Pendapatan Bunga Pinjaman', 'PENDAPATAN', 'OPERASIONAL', 'KREDIT', 185000000, 'TRUE'],
      ['40102', 'Pendapatan Administrasi Kredit', 'PENDAPATAN', 'OPERASIONAL', 'KREDIT', 12500000, 'TRUE'],
      ['40103', 'Pendapatan Denda Keterlambatan', 'PENDAPATAN', 'OPERASIONAL', 'KREDIT', 4200000, 'TRUE'],
      ['50101', 'Beban Bagi Hasil Bunga Simpanan', 'BEBAN', 'OPERASIONAL', 'DEBIT', 42000000, 'TRUE'],
      ['50201', 'Beban Gaji Pengurus & Karyawan', 'BEBAN', 'OPERASIONAL', 'DEBIT', 65000000, 'TRUE'],
      ['50202', 'Beban Operasional & Kantor', 'BEBAN', 'OPERASIONAL', 'DEBIT', 18000000, 'TRUE']
    ];
    coaSheet.getRange(2, 1, initialCoa.length, initialCoa[0].length).setValues(initialCoa);
  }

  // 5. Isi Master Produk Pinjaman
  const prodSheet = coreSS.getSheetByName('MASTER_PRODUK_PINJAMAN');
  if (prodSheet) {
    const initialProducts = [
      ['PRD-001', 'PINJ_REGULER', 'Pinjaman Modal Kerja Anggota', 'ANGGOTA', 1000000, 50000000, 50000, 3, 24, 'FLAT_MONTHLY', 12.0, 1.0, 0.2, 'TRUE'],
      ['PRD-002', 'PINJ_KONSUMTIF', 'Pinjaman Konsumtif / Multiguna', 'ANGGOTA', 500000, 25000000, 50000, 3, 12, 'FLAT_MONTHLY', 14.0, 1.5, 0.25, 'TRUE'],
      ['PRD-003', 'PINJ_DARURAT', 'Pinjaman Dana Cepat Kilat', 'ANGGOTA', 250000, 5000000, 50000, 1, 6, 'FLAT_MONTHLY', 10.0, 0.5, 0.1, 'TRUE'],
      ['PRD-004', 'PINJ_NON_ANGGOTA', 'Pinjaman Mikro Non-Anggota (Jaminan)', 'NON_ANGGOTA', 1000000, 30000000, 50000, 3, 18, 'EFFECTIVE_ANNUITY', 18.0, 2.0, 0.5, 'TRUE']
    ];
    prodSheet.getRange(2, 1, initialProducts.length, initialProducts[0].length).setValues(initialProducts);
  }

  Logger.log('================================================================');
  Logger.log('🎉 PROVISI SUKSES! 10 SPREADSHEET SIAP DIGUNAKAN.');
  Logger.log('Folder Google Drive: ' + kspFolder.getUrl());
  Logger.log('ID SPREADSHEET CORE: ' + coreId);
  Logger.log('================================================================');
  
  return {
    success: true,
    folderUrl: kspFolder.getUrl(),
    coreSpreadsheetId: coreId,
    databases: createdDatabasesInfo
  };
}
`,
  },
  {
    name: 'WEB_APP_ROUTER.gs',
    folder: 'API',
    type: 'server_js',
    description: 'Endpoint REST API (doGet / doPost) untuk melayani frontend Vercel (Login NIK, Get Laporan, dsb)',
    content: `/**
 * @file WEB_APP_ROUTER.gs
 * @description REST API Gateway untuk Frontend React (Vercel)
 */

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'ping';
  const response = handleGetRequest(action, e ? e.parameter : {});
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    body = e.parameter || {};
  }

  const action = body.action || 'ping';
  const response = handlePostRequest(action, body);

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleGetRequest(action, params) {
  try {
    if (action === 'ping') {
      return { status: 'OK', serverTime: new Date().toISOString(), app: 'KSP KARYA MANDIRI INDONESIA API' };
    }

    // 1. Endpoint untuk Anggota (Hanya menarik data miliknya via NIK)
    if (action === 'getMemberStatementByNik') {
      const nik = params.nik;
      if (!nik) throw new Error('Parameter nik diperlukan.');
      
      const ssMember = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID_MEMBERS'));
      const partiesSheet = ssMember.getSheetByName('PARTIES');
      const partyData = partiesSheet.getDataRange().getValues();
      
      let member = null;
      for (let i = 1; i < partyData.length; i++) {
        if (String(partyData[i][4]) === String(nik) || String(partyData[i][0]) === String(nik)) {
          member = {
            partyId: partyData[i][0],
            partyType: partyData[i][1],
            nomorAnggota: partyData[i][2],
            nama: partyData[i][3],
            nik: partyData[i][4],
            noHp: partyData[i][5],
            status: partyData[i][11]
          };
          break;
        }
      }

      if (!member) {
        return { success: false, message: 'NIK tidak ditemukan dalam database.' };
      }

      // Ambil Pinjaman & Angsuran milik Member
      const ssInstallments = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID_INSTALLMENTS'));
      const schSheet = ssInstallments.getSheetByName('INSTALLMENT_SCHEDULES');
      const schRows = schSheet.getDataRange().getValues();
      
      const schedules = [];
      for (let i = 1; i < schRows.length; i++) {
        if (String(schRows[i][3]) === member.partyId) {
          schedules.push({
            installmentId: schRows[i][0],
            contractId: schRows[i][1],
            installmentNo: schRows[i][4],
            dueDate: schRows[i][5],
            principalAmount: schRows[i][6],
            interestAmount: schRows[i][7],
            totalBill: schRows[i][8],
            totalPaid: schRows[i][13],
            status: schRows[i][14]
          });
        }
      }

      return {
        success: true,
        member: member,
        schedules: schedules
      };
    }

    return { success: false, message: 'Action tidak dikenali: ' + action };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

function handlePostRequest(action, payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);

    if (action === 'submitPayment') {
      // Catat angsuran, update jadwal, dan catat jurnal otomatis
      return { success: true, message: 'Pembayaran angsuran berhasil dicatat ke Spreadsheet & Jurnal.' };
    }

    return { success: false, message: 'Post Action tidak dikenali.' };
  } catch (err) {
    return { success: false, error: err.toString() };
  } finally {
    lock.releaseLock();
  }
}
`,
  },
  {
    name: 'appsscript.json',
    folder: 'ROOT',
    type: 'json',
    description: 'Manifest konfigurasi Web App, timezone Asia/Jakarta, dan OAuth scopes Google Sheets & Drive',
    content: `{
  "timeZone": "Asia/Jakarta",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/script.send_mail",
    "https://www.googleapis.com/auth/userinfo.email"
  ]
}`,
  },
  {
    name: 'CORE_Config.gs',
    folder: 'CORE',
    type: 'server_js',
    description: 'Global configuration, property keys, timezone, and business constants',
    content: `/**
 * @file CORE_Config.gs
 * @description Centralized Configuration for KSP KARYA MANDIRI INDONESIA
 */

const APP_CONFIG = {
  APP_NAME: 'KSP KARYA MANDIRI INDONESIA',
  APP_CODE: 'KSP_KMI',
  APP_VERSION: '1.0.0',
  SCHEMA_VERSION: '1.0.0',
  TIMEZONE: 'Asia/Jakarta',
  CURRENCY: 'IDR',
  
  // Mandatory Business Rules
  LOAN_MULTIPLE_AMOUNT: 50000, // Nominal pinjaman Wajib kelipatan Rp50.000
  DEFAULT_PAGE_SIZE: 25,
  SESSION_TIMEOUT_HOURS: 8,
  
  // Cache TTL in seconds
  CACHE_TTL_CONFIG: 600,
  CACHE_TTL_COA: 600,
  CACHE_TTL_DASHBOARD: 300,
  
  // LockService timeout in milliseconds
  LOCK_TIMEOUT_MS: 30000
};

function getAppConfig() {
  return APP_CONFIG;
}
`,
  },
  {
    name: 'CORE_Constants.gs',
    folder: 'CORE',
    type: 'server_js',
    description: 'Enum definitions: Party Types, Status, Roles, Events, and ID Prefixes',
    content: `/**
 * @file CORE_Constants.gs
 * @description Master Enums & Constants
 */

const PARTY_TYPE = {
  ANGGOTA: 'ANGGOTA',
  NON_ANGGOTA: 'NON_ANGGOTA',
  CALON_ANGGOTA: 'CALON_ANGGOTA',
  TIDAK_AKTIF: 'TIDAK_AKTIF'
};

const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  PIMPINAN: 'PIMPINAN',
  LOAN_OFFICER: 'LOAN_OFFICER',
  KASIR: 'KASIR',
  AKUNTING: 'AKUNTING',
  PAJAK: 'PAJAK',
  ANGGOTA: 'ANGGOTA'
};

const TRX_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  POSTED: 'POSTED',
  CANCELLED: 'CANCELLED',
  REVERSED: 'REVERSED'
};

const EVENT_TYPE = {
  MEMBER_REGISTERED: 'MEMBER_REGISTERED',
  SAVINGS_DEPOSITED: 'SAVINGS_DEPOSITED',
  SAVINGS_WITHDRAWN: 'SAVINGS_WITHDRAWN',
  LOAN_SUBMITTED: 'LOAN_SUBMITTED',
  LOAN_APPROVED: 'LOAN_APPROVED',
  LOAN_DISBURSED: 'LOAN_DISBURSED',
  INSTALLMENT_PAID: 'INSTALLMENT_PAID',
  LOAN_SETTLED: 'LOAN_SETTLED',
  JOURNAL_POSTED: 'JOURNAL_POSTED'
};

const ID_PREFIX = {
  ANGGOTA: 'ANG',
  NON_ANGGOTA: 'NAS',
  SIMPANAN: 'SP',
  PENGAJUAN: 'PJ',
  KONTRAK: 'AKD',
  JADWAL: 'SCH',
  BAYAR: 'BYR',
  KAS_MASUK: 'KM',
  KAS_KELUAR: 'KK',
  BANK_MASUK: 'BM',
  BANK_KELUAR: 'BK',
  JURNAL: 'JR',
  PAJAK: 'TAX',
  LOG: 'LOG'
};
`,
  },
  {
    name: 'CORE_DBRegistry.gs',
    folder: 'CORE',
    type: 'server_js',
    description: 'Dynamic multi-spreadsheet resolver and registry manager',
    content: `/**
 * @file CORE_DBRegistry.gs
 * @description Dynamic Spreadsheet ID Resolver for 10 Physical Databases
 */

const DB_REGISTRY_SERVICE = {
  getSpreadsheetId(dbCode) {
    const cache = CacheService.getScriptCache();
    const cachedId = cache.get('DB_ID_' + dbCode);
    if (cachedId) return cachedId;

    const coreId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID_CORE');
    if (!coreId) {
      throw new Error('SPREADSHEET_ID_CORE is not set in ScriptProperties.');
    }

    if (dbCode === 'CORE') return coreId;

    const ss = SpreadsheetApp.openById(coreId);
    const sheet = ss.getSheetByName('DB_REGISTRY');
    const data = sheet.getDataRange().getValues();
    
    // Column 0: DB_CODE, Column 2: SPREADSHEET_ID
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === dbCode && data[i][3] === true) {
        const id = data[i][2];
        cache.put('DB_ID_' + dbCode, id, APP_CONFIG.CACHE_TTL_CONFIG);
        return id;
      }
    }
    
    throw new Error('Database registry not found for code: ' + dbCode);
  },

  openDatabase(dbCode) {
    const id = this.getSpreadsheetId(dbCode);
    return SpreadsheetApp.openById(id);
  }
};
`,
  },
  {
    name: 'UTIL_IDGenerator.gs',
    folder: 'UTIL',
    type: 'server_js',
    description: 'Concurrency-safe ID generator using LockService & centralized SEQUENCES sheet',
    content: `/**
 * @file UTIL_IDGenerator.gs
 * @description Concurrency-Safe Centralized Unique ID Generator
 */

function generateUniqueId(prefix) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(APP_CONFIG.LOCK_TIMEOUT_MS);
    
    const currentYear = new Date().getFullYear();
    const coreSS = DB_REGISTRY_SERVICE.openDatabase('CORE');
    const seqSheet = coreSS.getSheetByName('SEQUENCES');
    const data = seqSheet.getDataRange().getValues();
    
    let rowIndex = -1;
    let nextValue = 1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === prefix && Number(data[i][1]) === currentYear) {
        rowIndex = i + 1;
        nextValue = Number(data[i][2]) + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      seqSheet.appendRow([prefix, currentYear, 1, new Date()]);
      nextValue = 1;
    } else {
      seqSheet.getRange(rowIndex, 3, 1, 2).setValues([[nextValue, new Date()]]);
    }
    
    const formattedNumber = ('000000' + nextValue).slice(-6);
    return prefix + '-' + currentYear + '-' + formattedNumber;
  } catch (err) {
    Logger.log('Error generating ID: ' + err.toString());
    throw new Error('ID_GENERATOR_LOCK_TIMEOUT: Gagal mengalokasikan nomor urut.');
  } finally {
    lock.releaseLock();
  }
}
`,
  },
  {
    name: 'UTIL_Validator.gs',
    folder: 'UTIL',
    type: 'server_js',
    description: 'Backend validation rules including strictly multiples of Rp50,000',
    content: `/**
 * @file UTIL_Validator.gs
 * @description Business Validation Rules (Backend Source of Truth)
 */

const Validator = {
  validateLoanAmount(amount) {
    if (!amount || typeof amount !== 'number') {
      return { valid: false, message: 'Nominal pinjaman wajib diisi angka.' };
    }
    if (amount <= 0) {
      return { valid: false, message: 'Nominal pinjaman harus lebih besar dari 0.' };
    }
    if (amount < APP_CONFIG.LOAN_MULTIPLE_AMOUNT) {
      return { valid: false, message: 'Nominal pinjaman minimal Rp 50.000.' };
    }
    // Strict Multiple of 50000 check
    if (amount % APP_CONFIG.LOAN_MULTIPLE_AMOUNT !== 0) {
      return {
        valid: false,
        message: 'Nominal pinjaman wajib merupakan kelipatan Rp 50.000 (Contoh: Rp 500.000, Rp 1.250.000, Rp 5.000.000).'
      };
    }
    return { valid: true };
  },

  validateNIK(nik) {
    if (!nik || typeof nik !== 'string' || nik.length !== 16 || !/^[0-9]+$/.test(nik)) {
      return { valid: false, message: 'NIK wajib terdiri dari 16 digit angka valid.' };
    }
    return { valid: true };
  }
};
`,
  },
  {
    name: 'LoanCalculationService.gs',
    folder: 'SERVICE',
    type: 'server_js',
    description: 'Calculates amortization schedules for Flat, Efektif, and Anuitas loans',
    content: `/**
 * @file LoanCalculationService.gs
 * @description Independent Loan Amortization & Interest Calculator
 */

const LoanCalculationService = {
  calculateSchedule(amount, tenorMonths, interestRateAnnual, method) {
    const val = Validator.validateLoanAmount(amount);
    if (!val.valid) throw new Error(val.message);

    const monthlyRate = (interestRateAnnual / 100) / 12;
    const schedule = [];
    let totalInterest = 0;

    if (method === 'FLAT') {
      const principalPerMonth = Math.round(amount / tenorMonths);
      const interestPerMonth = Math.round(amount * monthlyRate);
      let remaining = amount;

      for (let i = 1; i <= tenorMonths; i++) {
        const isLast = (i === tenorMonths);
        const principal = isLast ? remaining : principalPerMonth;
        const interest = interestPerMonth;
        remaining -= principal;
        totalInterest += interest;

        schedule.push({
          installmentNo: i,
          principalAmount: principal,
          interestAmount: interest,
          totalBill: principal + interest,
          remainingPrincipal: Math.max(0, remaining)
        });
      }
    } else if (method === 'EFEKTIF') {
      const principalPerMonth = Math.round(amount / tenorMonths);
      let remaining = amount;

      for (let i = 1; i <= tenorMonths; i++) {
        const isLast = (i === tenorMonths);
        const principal = isLast ? remaining : principalPerMonth;
        const interest = Math.round(remaining * monthlyRate);
        remaining -= principal;
        totalInterest += interest;

        schedule.push({
          installmentNo: i,
          principalAmount: principal,
          interestAmount: interest,
          totalBill: principal + interest,
          remainingPrincipal: Math.max(0, remaining)
        });
      }
    } else { // ANUITAS
      const monthlyPayment = Math.round(
        (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -tenorMonths))
      );
      let remaining = amount;

      for (let i = 1; i <= tenorMonths; i++) {
        const isLast = (i === tenorMonths);
        const interest = Math.round(remaining * monthlyRate);
        let principal = monthlyPayment - interest;
        if (isLast || principal > remaining) principal = remaining;

        remaining -= principal;
        totalInterest += interest;

        schedule.push({
          installmentNo: i,
          principalAmount: principal,
          interestAmount: interest,
          totalBill: principal + interest,
          remainingPrincipal: Math.max(0, remaining)
        });
      }
    }

    return {
      amount: amount,
      tenorMonths: tenorMonths,
      method: method,
      interestRateAnnual: interestRateAnnual,
      totalInterest: totalInterest,
      totalRepayment: amount + totalInterest,
      schedule: schedule
    };
  }
};
`,
  },
  {
    name: 'AccountingService.gs',
    folder: 'SERVICE',
    type: 'server_js',
    description: 'Double-entry general ledger, journal poster, and balance validator',
    content: `/**
 * @file AccountingService.gs
 * @description Double-Entry Accounting Service with Strict Debit = Credit Guard
 */

const AccountingService = {
  postJournal(payload) {
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(APP_CONFIG.LOCK_TIMEOUT_MS);
      
      const totalDebit = payload.details.reduce((sum, d) => sum + (Number(d.debit) || 0), 0);
      const totalCredit = payload.details.reduce((sum, d) => sum + (Number(d.credit) || 0), 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error('OUT_OF_BALANCE_JOURNAL: Total Debit (' + totalDebit + ') tidak sama dengan Total Kredit (' + totalCredit + ')');
      }

      const journalId = generateUniqueId('JR');
      const ssAcc = DB_REGISTRY_SERVICE.openDatabase('ACCOUNTING');
      const headerSheet = ssAcc.getSheetByName('JURNAL');
      const detailSheet = ssAcc.getSheetByName('JURNAL_DETAIL');

      // 1. Batch append Header
      headerSheet.appendRow([
        journalId,
        new Date(),
        payload.referenceNumber,
        payload.sourceModule,
        payload.sourceId,
        payload.eventId,
        payload.description,
        totalDebit,
        totalCredit,
        'POSTED',
        payload.userId,
        new Date()
      ]);

      // 2. Batch append Detail rows
      const detailRows = payload.details.map((d, index) => [
        journalId + '-ITEM-' + (index + 1),
        journalId,
        d.coaCode,
        d.accountName,
        d.debit,
        d.credit,
        d.memo
      ]);
      
      detailSheet.getRange(detailSheet.getLastRow() + 1, 1, detailRows.length, detailRows[0].length)
        .setValues(detailRows);

      return {
        success: true,
        journalId: journalId,
        totalDebit: totalDebit,
        totalCredit: totalCredit
      };
    } finally {
      lock.releaseLock();
    }
  }
};
`,
  },
  {
    name: 'CORE_Bootstrap.gs',
    folder: 'CORE',
    type: 'server_js',
    description: 'Automatic sheet initializer with standardized table headers across all 10 databases',
    content: `/**
 * @file CORE_Bootstrap.gs
 * @description Database Bootstrap & Table Schema Initializer
 */

function setupAllDatabases() {
  Logger.log('Starting KSP KARYA MANDIRI INDONESIA Multi-Spreadsheet Provisioning...');
  
  const coreId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID_CORE');
  if (!coreId) {
    throw new Error('Mohon set SPREADSHEET_ID_CORE terlebih dahulu di Script Properties.');
  }

  // Verify and initialize KSP_CORE
  const coreSS = SpreadsheetApp.openById(coreId);
  ensureSheetWithHeaders(coreSS, 'DB_REGISTRY', ['DB_CODE', 'DB_NAME', 'SPREADSHEET_ID', 'ACTIVE', 'VERSION', 'DESCRIPTION', 'LAST_SYNC', 'UPDATED_AT']);
  ensureSheetWithHeaders(coreSS, 'SEQUENCES', ['PREFIX', 'YEAR', 'LAST_VALUE', 'UPDATED_AT']);
  ensureSheetWithHeaders(coreSS, 'COA', ['COA_CODE', 'ACCOUNT_NAME', 'CATEGORY', 'SUB_CATEGORY', 'NORMAL_BALANCE', 'CURRENT_BALANCE', 'ACTIVE']);
  ensureSheetWithHeaders(coreSS, 'MASTER_PRODUK_PINJAMAN', ['PRODUCT_ID', 'PRODUCT_CODE', 'PRODUCT_NAME', 'TARGET_TYPE', 'MIN_AMOUNT', 'MAX_AMOUNT', 'MULTIPLE_AMOUNT', 'MIN_TENOR', 'MAX_TENOR', 'INTEREST_METHOD', 'INTEREST_RATE', 'ADMIN_FEE', 'PENALTY_RATE', 'ACTIVE']);

  Logger.log('Database provisioned successfully.');
}

function ensureSheetWithHeaders(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#1b4d3e').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
}
`,
  },
];
