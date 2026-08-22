import React, { createContext, useContext, useState } from 'react';

type Language = 'id' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const DICTIONARY: Record<Language, Record<string, string>> = {
  id: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.member_portal': 'Buku & Kartu Saya (Portal)',
    'nav.members': 'Anggota & Nasabah',
    'nav.savings': 'Simpanan',
    'nav.loans': 'Pinjaman',
    'nav.installments': 'Angsuran',
    'nav.cashbank': 'Kas & Bank',
    'nav.accounting': 'Akuntansi',
    'nav.tax': 'Perpajakan',
    'nav.reports': 'Laporan',
    'nav.audit': 'Audit Log',
    'nav.gas_export': 'Apps Script Export',
    'nav.settings': 'Pengaturan',
    'nav.logout': 'Keluar',

    // Dashboard
    'dash.welcome': 'Ringkasan Kondisi KSP Karya Mandiri Indonesia',
    'dash.total_members': 'Total Anggota',
    'dash.total_savings': 'Total Simpanan',
    'dash.total_loans': 'Total Pinjaman',
    'dash.running_receivables': 'Piutang Berjalan',
    'dash.today_installment': 'Angsuran Hari Ini',
    'dash.total_overdue': 'Tunggakan',
    'dash.interest_income': 'Pendapatan Bunga (Bln Ini)',
    'dash.cash_balance': 'Saldo Kas Tunai',
    'dash.bank_balance': 'Saldo Bank',
    'dash.total_assets': 'Total Aset',
    'dash.total_liabilities': 'Total Kewajiban',
    'dash.shu_month': 'SHU (Bln Ini)',
    'dash.loan_vs_savings': 'Grafik Pinjaman vs Simpanan (12 Bulan Terakhir)',
    'dash.loan_composition': 'Komposisi Pinjaman',
    'dash.overdue_by_age': 'Tunggakan Berdasarkan Umur',
    'dash.due_installments': 'Angsuran Akan Jatuh Tempo',
    'dash.important_info': 'Informasi Penting',
    'dash.all_notifs': 'Lihat Semua Notifikasi',

    // General Actions
    'action.save': 'Simpan',
    'action.cancel': 'Batal',
    'action.edit': 'Edit',
    'action.delete': 'Hapus',
    'action.view_detail': 'Lihat Detail',
    'action.search': 'Cari...',
    'action.filter': 'Filter',
    'action.print': 'Cetak',
    'action.export': 'Ekspor',
    'action.approve': 'Setujui',
    'action.reject': 'Tolak',
    'action.pay': 'Bayar',
    'action.settle': 'Lunasi',
    'action.calculator': 'Kalkulator Pinjaman',
    'action.add_member': 'Tambah Anggota Baru',
    'action.new_loan': 'Ajukan Pinjaman',
    'action.deposit': 'Setoran Simpanan',
    'action.withdraw': 'Penarikan Simpanan',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.member_portal': 'My Portal & Statements',
    'nav.members': 'Members & Clients',
    'nav.savings': 'Savings',
    'nav.loans': 'Loans',
    'nav.installments': 'Installments',
    'nav.cashbank': 'Cash & Bank',
    'nav.accounting': 'Accounting',
    'nav.tax': 'Taxation',
    'nav.reports': 'Reports',
    'nav.audit': 'Audit Trail',
    'nav.gas_export': 'Apps Script Export',
    'nav.settings': 'Settings',
    'nav.logout': 'Sign Out',

    // Dashboard
    'dash.welcome': 'KSP Karya Mandiri Indonesia Financial Overview',
    'dash.total_members': 'Total Members',
    'dash.total_savings': 'Total Savings',
    'dash.total_loans': 'Total Loans',
    'dash.running_receivables': 'Active Receivables',
    'dash.today_installment': "Today's Installments",
    'dash.total_overdue': 'Overdue Arrears',
    'dash.interest_income': 'Interest Income (This Mo)',
    'dash.cash_balance': 'Petty Cash Balance',
    'dash.bank_balance': 'Bank Balance',
    'dash.total_assets': 'Total Assets',
    'dash.total_liabilities': 'Total Liabilities',
    'dash.shu_month': 'Net Surplus (SHU)',
    'dash.loan_vs_savings': 'Loans vs Savings Trend (Last 12 Months)',
    'dash.loan_composition': 'Loan Composition',
    'dash.overdue_by_age': 'Arrears by Aging Bracket',
    'dash.due_installments': 'Upcoming Due Installments',
    'dash.important_info': 'Important Alerts',
    'dash.all_notifs': 'View All Notifications',

    // General Actions
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.view_detail': 'View Detail',
    'action.search': 'Search...',
    'action.filter': 'Filter',
    'action.print': 'Print',
    'action.export': 'Export',
    'action.approve': 'Approve',
    'action.reject': 'Reject',
    'action.pay': 'Pay',
    'action.settle': 'Pay Off',
    'action.calculator': 'Loan Calculator',
    'action.add_member': 'Add New Member',
    'action.new_loan': 'Apply for Loan',
    'action.deposit': 'Deposit Savings',
    'action.withdraw': 'Withdraw Savings',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('KSP_LANG');
    return (saved as Language) || 'id';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('KSP_LANG', newLang);
  };

  const t = (key: string): string => {
    return DICTIONARY[lang][key] || DICTIONARY['id'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
