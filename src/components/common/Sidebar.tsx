import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  Users,
  PiggyBank,
  Wallet,
  CalendarCheck2,
  Building2,
  CreditCard,
  BookOpen,
  Receipt,
  FileBarChart,
  History,
  Code2,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  isOpen,
  onClose,
}) => {
  const { logout, currentUser, hasRole } = useAuth();
  const { t } = useLanguage();
  const [masterDataOpen, setMasterDataOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'PIMPINAN', 'LOAN_OFFICER', 'KASIR', 'AKUNTING', 'PAJAK'] },
    { id: 'member_portal', label: t('nav.member_portal'), icon: CreditCard, roles: ['ANGGOTA', 'SUPER_ADMIN', 'PIMPINAN'] },
    { id: 'members', label: t('nav.members'), icon: Users, roles: ['SUPER_ADMIN', 'PIMPINAN', 'LOAN_OFFICER', 'KASIR', 'AKUNTING'] },
    { id: 'savings', label: t('nav.savings'), icon: PiggyBank, roles: ['SUPER_ADMIN', 'PIMPINAN', 'KASIR', 'AKUNTING'] },
    { id: 'loans', label: t('nav.loans'), icon: Wallet, roles: ['SUPER_ADMIN', 'PIMPINAN', 'LOAN_OFFICER', 'KASIR', 'ANGGOTA'] },
    { id: 'installments', label: t('nav.installments'), icon: CalendarCheck2, roles: ['SUPER_ADMIN', 'PIMPINAN', 'LOAN_OFFICER', 'KASIR'] },
    { id: 'cashbank', label: t('nav.cashbank'), icon: Building2, roles: ['SUPER_ADMIN', 'PIMPINAN', 'KASIR', 'AKUNTING'] },
    { id: 'accounting', label: t('nav.accounting'), icon: BookOpen, roles: ['SUPER_ADMIN', 'PIMPINAN', 'AKUNTING'] },
    { id: 'tax', label: t('nav.tax'), icon: Receipt, roles: ['SUPER_ADMIN', 'PIMPINAN', 'AKUNTING', 'PAJAK'] },
    { id: 'reports', label: t('nav.reports'), icon: FileBarChart, roles: ['SUPER_ADMIN', 'PIMPINAN', 'AKUNTING', 'PAJAK'] },
    { id: 'audit', label: t('nav.audit'), icon: History, roles: ['SUPER_ADMIN', 'PIMPINAN'] },
    { id: 'gas_export', label: t('nav.gas_export'), icon: Code2, roles: ['SUPER_ADMIN', 'PIMPINAN', 'AKUNTING'] },
    { id: 'settings', label: t('nav.settings'), icon: Settings, roles: ['SUPER_ADMIN', 'PIMPINAN'] },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#143d30] text-stone-100 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-xl`}
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center border-b border-emerald-900/60 p-5 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700/80 p-2 text-white shadow-inner mb-2">
            <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10 text-emerald-100">
              <circle cx="24" cy="14" r="6" fill="currentColor" opacity="0.9" />
              <circle cx="14" cy="22" r="5" fill="currentColor" opacity="0.8" />
              <circle cx="34" cy="22" r="5" fill="currentColor" opacity="0.8" />
              <path
                d="M10 40C10 32.5 16.5 28 24 28C31.5 28 38 32.5 38 40"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M4 38C4 32.5 8 29 14 29"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M44 38C44 32.5 40 29 34 29"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="text-base font-extrabold tracking-wide text-white uppercase">
            KSP KARYA MANDIRI
          </h1>
          <p className="text-[11px] font-medium text-emerald-300/80">
            Koperasi Simpan Pinjam Indonesia
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isAccessible = hasRole(item.roles as any);
            if (!isAccessible) return null;

            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600/90 text-white shadow-md shadow-emerald-950/20 translate-x-1'
                    : 'text-emerald-100/80 hover:bg-emerald-800/50 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-emerald-300'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout Bottom */}
        <div className="border-t border-emerald-900/60 p-3">
          <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-emerald-950/40 p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-xs font-bold text-white">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="overflow-hidden leading-tight text-left">
              <div className="truncate text-xs font-bold text-white">{currentUser?.name}</div>
              <div className="text-[10px] text-emerald-300/80 uppercase tracking-wider font-medium">
                {currentUser?.role}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-900 bg-emerald-950/60 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>{t('nav.logout')}</span>
          </button>

          <div className="mt-2 text-center text-[10px] text-emerald-300/50">
            © 2026 KSP Karya Mandiri v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
};
