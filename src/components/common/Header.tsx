import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';
import {
  Bell,
  Search,
  Moon,
  Sun,
  Globe,
  Calculator,
  Shield,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Database,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenCalculator: () => void;
  onOpenCloudSync: () => void;
  onOpenDeployGuide?: () => void;
  activeView?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenCalculator,
  onOpenCloudSync,
  onOpenDeployGuide,
  activeView = 'dashboard',
}) => {
  const { currentUser, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLanguage();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const notifications = [
    { id: 1, title: '5 pengajuan pinjaman menunggu persetujuan', time: '10 menit lalu', type: 'alert' },
    { id: 2, title: '3 dokumen anggota akan segera berakhir', time: '1 jam lalu', type: 'info' },
    { id: 3, title: 'Rekonsiliasi bank bulan Mei selesai', time: '3 jam lalu', type: 'success' },
    { id: 4, title: 'Backup data snapshot otomatis tersimpan di Google Drive', time: '02:30 WIB', type: 'system' },
  ];

  const rolesList: { role: UserRole; label: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin' },
    { role: 'PIMPINAN', label: 'Pimpinan' },
    { role: 'LOAN_OFFICER', label: 'Petugas Pinjaman' },
    { role: 'KASIR', label: 'Kasir / Teller' },
    { role: 'AKUNTING', label: 'Akuntan' },
    { role: 'PAJAK', label: 'Petugas Pajak' },
    { role: 'ANGGOTA', label: 'Portal Anggota (NIK)' },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-stone-200 bg-white px-4 lg:px-6 dark:border-stone-800 dark:bg-stone-900 shadow-xs">
      {/* Zone 1: Mobile toggle & Breadcrumb/Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 lg:hidden dark:text-stone-300 dark:hover:bg-stone-800"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden md:flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
          <span className="font-semibold text-emerald-800 dark:text-emerald-400">KSP KARYA MANDIRI</span>
          <span>/</span>
          <span className="capitalize font-medium text-stone-800 dark:text-stone-200">
            {(activeView || 'dashboard').replace(/_/g, ' ')}
          </span>
        </div>

        <div className="relative hidden xl:block w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Cari anggota, nomor akad, no jurnal..."
            className="h-9 w-full rounded-lg border border-stone-200 bg-stone-50 pl-9 pr-3 text-xs text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Zone 2 & 3: Action tools & User info */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Loan Calculator Shortcut */}
        <button
          onClick={onOpenCalculator}
          title="Kalkulator Pinjaman (Kelipatan Rp50.000)"
          className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          <Calculator className="h-4 w-4" />
          <span className="hidden sm:inline">Kalkulator</span>
        </button>

        {/* Deploy to GitHub & Vercel Guide Shortcut */}
        {onOpenDeployGuide && (
          <button
            onClick={onOpenDeployGuide}
            title="Panduan Deploy GitHub & Vercel (Gratis)"
            className="flex items-center gap-1.5 rounded-lg border border-stone-800 bg-stone-900 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 shadow-2xs"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden md:inline">Deploy Vercel</span>
          </button>
        )}

        {/* Cloud Sync Status */}
        <button
          onClick={onOpenCloudSync}
          title="Multi-Spreadsheet & Drive Status"
          className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
        >
          <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden md:inline">10 DB Online</span>
        </button>

        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
          className="flex items-center gap-1 rounded-lg p-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
          title="Ganti Bahasa / Switch Language"
        >
          <Globe className="h-4 w-4" />
          <span className="uppercase">{lang}</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
          title="Toggle Dark/Light Mode"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
            title="Notifikasi Sistem"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
              4
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-stone-200 bg-white p-3 shadow-xl dark:border-stone-700 dark:bg-stone-800">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2 dark:border-stone-700">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Notifikasi Sistem</span>
                <span className="text-[10px] text-emerald-600 font-semibold cursor-pointer hover:underline">
                  Tandai terbaca
                </span>
              </div>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex gap-2.5 rounded-lg p-2 text-xs transition-colors hover:bg-stone-50 dark:hover:bg-stone-700/50"
                  >
                    {n.type === 'alert' ? (
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    ) : n.type === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                    ) : (
                      <FileText className="h-4 w-4 shrink-0 text-sky-500 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-stone-800 dark:text-stone-200 leading-snug">{n.title}</p>
                      <span className="text-[10px] text-stone-400">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        <div className="relative pl-2 border-l border-stone-200 dark:border-stone-700">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-2.5 rounded-lg p-1 text-left hover:bg-stone-50 dark:hover:bg-stone-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-800 text-xs font-bold text-white">
              {currentUser?.name.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate max-w-[130px]">
                {currentUser?.name || 'Admin'}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  {currentUser?.role || 'SUPER_ADMIN'}
                </span>
              </div>
            </div>
          </button>

          {/* Quick Role Switcher Dropdown */}
          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-stone-200 bg-white p-2 shadow-xl dark:border-stone-700 dark:bg-stone-800">
              <div className="px-2 py-1.5 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Simulasi Ganti Role (RBAC)
              </div>
              <div className="space-y-1">
                {rolesList.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchRole(r.role);
                      setShowRoleSwitcher(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left ${
                      currentUser?.role === r.role
                        ? 'bg-emerald-50 text-emerald-800 font-bold dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700'
                    }`}
                  >
                    <span>{r.label}</span>
                    {currentUser?.role === r.role && <Shield className="h-3.5 w-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
