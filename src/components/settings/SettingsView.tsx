import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { DbRegistryItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  Database,
  Shield,
  RefreshCw,
  CheckCircle,
  Save,
  RotateCcw,
  Sliders,
  HardDrive,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [dbList, setDbList] = useState<DbRegistryItem[]>(() => StorageService.getDbRegistry());
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Business Rules
  const [rules, setRules] = useState({
    loanMultipleRequired: 50000,
    enforceStrictDebitCredit: true,
    autoPPhFinalCalculation: true,
    pPhFinalThreshold: 240000,
    pPhFinalRate: 10,
    simpananPokokAmount: 100000,
    simpananWajibAmount: 50000,
  });

  const handleSaveDBs = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveDbRegistry(dbList);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);

    StorageService.addAuditLog({
      userId: currentUser?.userId || 'SYSTEM',
      userName: currentUser?.name || 'Admin',
      role: 'SUPER_ADMIN',
      module: 'CORE',
      action: 'UPDATE',
      recordId: 'DB_REGISTRY_CONFIG',
      status: 'SUCCESS',
      ipAddress: '127.0.0.1',
      message: 'Memperbarui konfigurasi 10 Google Spreadsheet Logical Database',
    });
  };

  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin me-reset seluruh data ke nilai awal bawaan pabrik (Factory Default Data)?')) {
      StorageService.resetToDefaults();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 dark:text-white">
            Pengaturan Sistem & Konfigurasi Multi-Database
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Pemetaan 10 ID Google Spreadsheet, aturan bisnis pinjaman kelipatan Rp 50.000, dan parameter akuntansi.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-300 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset ke Data Awal Demo</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>Konfigurasi sistem berhasil disimpan dan disinkronkan ke KSP_CORE.</span>
        </div>
      )}

      {/* 1. Database Spreadsheets ID Configuration */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100 dark:border-stone-800">
          <Database className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">
              Registry 10 Google Spreadsheet Partitioned Databases
            </h3>
            <p className="text-xs text-stone-400">
              KSP_CORE mendistribusikan query ke masing-masing spreadsheet fisik di Google Drive secara otomatis.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveDBs} className="mt-4 space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Kode DB</th>
                  <th className="py-2.5 px-3 font-bold">Nama Spreadsheet</th>
                  <th className="py-2.5 px-3 font-bold">Google Spreadsheet ID (Drive)</th>
                  <th className="py-2.5 px-3 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {dbList.map((db, idx) => (
                  <tr key={db.dbCode}>
                    <td className="py-2 px-3 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                      {db.dbCode}
                    </td>
                    <td className="py-2 px-3 font-semibold text-stone-800 dark:text-stone-200">
                      {db.dbName}
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={db.spreadsheetId}
                        onChange={(e) => {
                          const updated = [...dbList];
                          updated[idx].spreadsheetId = e.target.value;
                          setDbList(updated);
                        }}
                        className="h-8 w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 font-mono text-[11px] text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        ONLINE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Registry Database</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Business Rules & Financial Policy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Loan Policy */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
            <Sliders className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="font-bold text-stone-900 dark:text-white">Aturan Validasi Pinjaman</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-stone-800 dark:text-stone-200">Kelipatan Nominal Pinjaman Wajib</div>
                <div className="text-[10px] text-stone-400">Validasi otomatis di backend dan form frontend</div>
              </div>
              <span className="rounded-lg bg-emerald-100 px-3 py-1 font-mono font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                Rp 50.000
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-stone-800 dark:text-stone-200">Biaya Administrasi & Provisi</div>
                <div className="text-[10px] text-stone-400">Dipotong di muka dari pencairan</div>
              </div>
              <span className="font-mono font-bold">1,0%</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-stone-800 dark:text-stone-200">Denda Keterlambatan Harian</div>
                <div className="text-[10px] text-stone-400">0,1% per hari dari total tagihan jatuh tempo</div>
              </div>
              <span className="font-mono font-bold">0,1% / hari</span>
            </div>
          </div>
        </div>

        {/* Accounting & Tax Policy */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
            <Shield className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="font-bold text-stone-900 dark:text-white">Integritas Akuntansi & Pajak</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-stone-800 dark:text-stone-200">Strict Double-Entry Enforcement</div>
                <div className="text-[10px] text-stone-400">Menolak posting jika Debit != Kredit</div>
              </div>
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                AKTIF
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-stone-800 dark:text-stone-200">Batas Kena PPh Final 4(2) Bunga</div>
                <div className="text-[10px] text-stone-400">PMK Perpajakan Bunga Simpanan Koperasi</div>
              </div>
              <span className="font-mono font-bold">&gt; Rp 240.000 (10%)</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-stone-800 dark:text-stone-200">Simpanan Pokok Wajib Pertama</div>
                <div className="text-[10px] text-stone-400">Syarat hak suara anggota</div>
              </div>
              <span className="font-mono font-bold">Rp 100.000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
