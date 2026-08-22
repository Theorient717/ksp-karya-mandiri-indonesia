import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { SystemStats } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  Users,
  PiggyBank,
  Wallet,
  Clock,
  Calendar,
  AlertTriangle,
  Percent,
  Banknote,
  Building,
  PieChart,
  Layers,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle2,
  FileText,
  Database,
  Calculator,
  Plus,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onOpenCalculator: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenCalculator }) => {
  const { t } = useLanguage();
  const [stats] = useState<SystemStats>(() => StorageService.computeSystemStats());

  // 12 Months chart mock values for Pinjaman vs Simpanan
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  const simpananTrend = [2.4, 2.6, 2.5, 2.8, 3.0, 2.9, 2.8, 2.9, 3.1, 3.3, 3.4, 3.2];
  const pinjamanTrend = [1.8, 2.1, 2.0, 2.3, 2.4, 2.3, 2.2, 2.4, 2.5, 2.7, 2.8, 2.6];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 dark:text-white">
            {t('nav.dashboard')}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {t('dash.welcome')} • Terkoneksi ke 10 Spreadsheet Multi-Database
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('loans')}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Pengajuan Pinjaman (Kelipatan 50k)</span>
          </button>
          <button
            onClick={() => onNavigate('savings')}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700"
          >
            <PiggyBank className="h-4 w-4" />
            <span>Setoran Simpanan</span>
          </button>
          <button
            onClick={onOpenCalculator}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          >
            <Calculator className="h-4 w-4 text-emerald-600" />
            <span>Simulasi</span>
          </button>
        </div>
      </div>

      {/* 12 Metric KPI Cards Grid (Matches Reference Image) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Anggota */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900 transition-hover hover:border-emerald-300">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-stone-600 dark:text-stone-400">Total Anggota</div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold text-stone-900 dark:text-white">
            {stats.totalAnggota.toLocaleString('id-ID')}
            <span className="text-xs font-medium text-stone-400 ml-1.5">Orang</span>
          </div>
          <div className="mt-1 flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>12 orang (1,0%)</span>
          </div>
        </div>

        {/* 2. Total Simpanan */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900 transition-hover hover:border-emerald-300">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-stone-600 dark:text-stone-400">Total Simpanan</div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <PiggyBank className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold text-stone-900 dark:text-white">
            Rp {stats.totalSimpanan.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Rp 85.250.000 (3,09%)</span>
          </div>
        </div>

        {/* 3. Total Pinjaman */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900 transition-hover hover:border-emerald-300">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-stone-600 dark:text-stone-400">Total Pinjaman</div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold text-stone-900 dark:text-white">
            Rp {stats.totalPinjaman.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Rp 120.500.000 (4,01%)</span>
          </div>
        </div>

        {/* 4. Piutang Berjalan */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900 transition-hover hover:border-emerald-300">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-stone-600 dark:text-stone-400">Piutang Berjalan</div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold text-stone-900 dark:text-white">
            Rp {stats.piutangBerjalan.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 flex items-center text-[11px] font-semibold text-rose-500">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span>Rp 32.750.000 (1,22%)</span>
          </div>
        </div>

        {/* 5. Angsuran Hari Ini */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900 transition-hover hover:border-emerald-300">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-stone-600 dark:text-stone-400">Angsuran Hari Ini</div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold text-stone-900 dark:text-white">
            Rp {stats.angsuranHariIni.amount.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-[11px] font-medium text-stone-500">
            {stats.angsuranHariIni.count} transaksi terjadwal
          </div>
        </div>

        {/* 6. Tunggakan */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900 transition-hover hover:border-emerald-300">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-stone-600 dark:text-stone-400">Tunggakan</div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold text-stone-900 dark:text-white">
            Rp {stats.totalTunggakan.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-[11px] font-medium text-rose-500">
            {stats.tunggakanCount} anggota menunggak
          </div>
        </div>

        {/* 7. Pendapatan Bunga (Bln Ini) */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900 transition-hover hover:border-emerald-300">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-stone-600 dark:text-stone-400">Pendapatan Bunga (Bln Ini)</div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <Percent className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold text-stone-900 dark:text-white">
            Rp {stats.pendapatanBungaBulanIni.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>7,25% dari bulan lalu</span>
          </div>
        </div>

        {/* 8. Saldo Kas */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900 transition-hover hover:border-emerald-300">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-stone-600 dark:text-stone-400">Saldo Kas Tunai</div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Banknote className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold text-stone-900 dark:text-white">
            Rp {stats.saldoKasTunai.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-[11px] font-medium text-stone-500">
            Brankas Kasir Utama
          </div>
        </div>

        {/* 9. Saldo Bank */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900 transition-hover hover:border-emerald-300">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-stone-600 dark:text-stone-400">Saldo Bank</div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <Building className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold text-stone-900 dark:text-white">
            Rp {stats.saldoBank.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-[11px] font-medium text-stone-500">
            3 Rekening (BCA, Mandiri, BRI)
          </div>
        </div>

        {/* 10. Total Aset */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900 transition-hover hover:border-emerald-300">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-stone-600 dark:text-stone-400">Total Aset</div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
              <PieChart className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold text-stone-900 dark:text-white">
            Rp {stats.totalAset.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>2,45% dari bulan lalu</span>
          </div>
        </div>

        {/* 11. Total Kewajiban */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900 transition-hover hover:border-emerald-300">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-stone-600 dark:text-stone-400">Total Kewajiban</div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold text-stone-900 dark:text-white">
            Rp {stats.totalKewajiban.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>1,12% dari bulan lalu</span>
          </div>
        </div>

        {/* 12. SHU (Bln Ini) */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900 transition-hover hover:border-emerald-300">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-stone-600 dark:text-stone-400">SHU (Bln Ini)</div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
            Rp {stats.shuBulanIni.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>5,81% dari bulan lalu</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Composition Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Trend Line Chart (Pinjaman vs Simpanan 12 Bulan) */}
        <div className="lg:col-span-2 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">
              {t('dash.loan_vs_savings')}
            </h3>
            <div className="flex items-center gap-4 mt-2 sm:mt-0 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-emerald-600"></span>
                <span className="text-stone-600 dark:text-stone-400 font-medium">Simpanan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-sky-500"></span>
                <span className="text-stone-600 dark:text-stone-400 font-medium">Pinjaman</span>
              </div>
            </div>
          </div>

          {/* Line Chart Visual Canvas Simulation */}
          <div className="mt-6 h-56 w-full flex flex-col justify-end">
            <div className="relative h-44 w-full flex items-end justify-between px-2">
              {/* Horizontal grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-stone-400">
                <div className="border-b border-dashed border-stone-200 dark:border-stone-800 w-full flex justify-between">
                  <span>4 M</span>
                </div>
                <div className="border-b border-dashed border-stone-200 dark:border-stone-800 w-full flex justify-between">
                  <span>3 M</span>
                </div>
                <div className="border-b border-dashed border-stone-200 dark:border-stone-800 w-full flex justify-between">
                  <span>2 M</span>
                </div>
                <div className="border-b border-dashed border-stone-200 dark:border-stone-800 w-full flex justify-between">
                  <span>1 M</span>
                </div>
                <div className="border-b border-stone-300 dark:border-stone-700 w-full flex justify-between">
                  <span>0</span>
                </div>
              </div>

              {/* Data points representation */}
              {months.map((m, idx) => {
                const sHeight = (simpananTrend[idx] / 4.0) * 100;
                const pHeight = (pinjamanTrend[idx] / 4.0) * 100;

                return (
                  <div key={m} className="z-10 flex flex-col items-center gap-1 w-full group">
                    <div className="relative h-36 w-full flex items-end justify-center gap-1">
                      {/* Simpanan Bar/Point */}
                      <div
                        style={{ height: `${sHeight}%` }}
                        className="w-2.5 sm:w-3.5 rounded-t-md bg-emerald-600/85 hover:bg-emerald-600 transition-all cursor-pointer relative"
                        title={`Simpanan ${m}: Rp ${simpananTrend[idx]} M`}
                      />
                      {/* Pinjaman Bar/Point */}
                      <div
                        style={{ height: `${pHeight}%` }}
                        className="w-2.5 sm:w-3.5 rounded-t-md bg-sky-500/85 hover:bg-sky-500 transition-all cursor-pointer relative"
                        title={`Pinjaman ${m}: Rp ${pinjamanTrend[idx]} M`}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400 mt-2">
                      {m}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Loan Composition (Donut Chart representation) */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900 flex flex-col">
          <h3 className="text-sm font-bold text-stone-900 dark:text-white pb-4 border-b border-stone-100 dark:border-stone-800">
            {t('dash.loan_composition')}
          </h3>

          <div className="my-auto flex flex-col items-center justify-center pt-4">
            {/* Donut representation */}
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-conic-gradient from-sky-500 via-emerald-500 via-amber-400 to-purple-500 shadow-inner">
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white dark:bg-stone-900 shadow-md">
                <span className="text-base font-extrabold text-stone-900 dark:text-white">100%</span>
                <span className="text-[10px] font-medium text-stone-400">Portofolio</span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-xs w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span>
                  <span className="text-stone-600 dark:text-stone-400">Konsumtif</span>
                </div>
                <span className="font-bold text-stone-800 dark:text-stone-200">48.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-stone-600 dark:text-stone-400">Produktif</span>
                </div>
                <span className="font-bold text-stone-800 dark:text-stone-200">31.4%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
                  <span className="text-stone-600 dark:text-stone-400">Modal Kerja</span>
                </div>
                <span className="font-bold text-stone-800 dark:text-stone-200">12.7%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500"></span>
                  <span className="text-stone-600 dark:text-stone-400">Investasi</span>
                </div>
                <span className="font-bold text-stone-800 dark:text-stone-200">7.7%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Widgets Row: 3 Panels Matching Reference Mockup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel 1: Tunggakan Berdasarkan Umur */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <h3 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              {t('dash.overdue_by_age')}
            </h3>
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
              Aging Bucket
            </span>
          </div>

          <div className="mt-4 space-y-3.5">
            {/* 1 - 30 Hari */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-stone-600 dark:text-stone-400">1 - 30 Hari</span>
                <span className="text-stone-900 dark:text-white font-bold">
                  Rp {stats.agingTunggakan.d1_30.toLocaleString('id-ID')} (28%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>

            {/* 31 - 60 Hari */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-stone-600 dark:text-stone-400">31 - 60 Hari</span>
                <span className="text-stone-900 dark:text-white font-bold">
                  Rp {stats.agingTunggakan.d31_60.toLocaleString('id-ID')} (32%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '32%' }}></div>
              </div>
            </div>

            {/* 61 - 90 Hari */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-stone-600 dark:text-stone-400">61 - 90 Hari</span>
                <span className="text-stone-900 dark:text-white font-bold">
                  Rp {stats.agingTunggakan.d61_90.toLocaleString('id-ID')} (21%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '21%' }}></div>
              </div>
            </div>

            {/* > 90 Hari */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-stone-600 dark:text-stone-400">&gt; 90 Hari (Macet)</span>
                <span className="text-rose-600 font-bold">
                  Rp {stats.agingTunggakan.dOver90.toLocaleString('id-ID')} (19%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <div className="h-full bg-rose-600 rounded-full" style={{ width: '19%' }}></div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-between text-xs font-bold">
              <span className="text-stone-500">Total Tunggakan:</span>
              <span className="text-rose-600">Rp {stats.totalTunggakan.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Panel 2: Angsuran Akan Jatuh Tempo */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <h3 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              {t('dash.due_installments')}
            </h3>
            <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
              Jadwal Penagihan
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-stone-800 dark:text-stone-200">Hari Ini</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-800 dark:text-emerald-300">
                  Rp {stats.upcomingInstallments.today.amount.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-stone-400">{stats.upcomingInstallments.today.count} Angsuran</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-800/50">
              <span className="text-stone-600 dark:text-stone-400 font-medium">1 - 7 Hari</span>
              <div className="text-right">
                <div className="font-bold text-stone-900 dark:text-white">
                  Rp {stats.upcomingInstallments.days1_7.amount.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-stone-400">{stats.upcomingInstallments.days1_7.count} Angsuran</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-800/50">
              <span className="text-stone-600 dark:text-stone-400 font-medium">8 - 30 Hari</span>
              <div className="text-right">
                <div className="font-bold text-stone-900 dark:text-white">
                  Rp {stats.upcomingInstallments.days8_30.amount.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-stone-400">{stats.upcomingInstallments.days8_30.count} Angsuran</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-800/50">
              <span className="text-stone-600 dark:text-stone-400 font-medium">&gt; 30 Hari</span>
              <div className="text-right">
                <div className="font-bold text-stone-900 dark:text-white">
                  Rp {stats.upcomingInstallments.daysOver30.amount.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-stone-400">{stats.upcomingInstallments.daysOver30.count} Angsuran</div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-between text-xs font-bold">
              <span className="text-stone-500">Total Proyeksi:</span>
              <span className="text-emerald-700 dark:text-emerald-400">Rp 169.380.000 (202 Tagihan)</span>
            </div>
          </div>
        </div>

        {/* Panel 3: Informasi Penting & Alert System */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                {t('dash.important_info')}
              </h3>
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex gap-2.5 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">
                    5 pengajuan pinjaman menunggu persetujuan
                  </p>
                  <span className="text-[10px] text-stone-400">Komite Kredit • Perlu Review</span>
                </div>
              </div>

              <div className="flex gap-2.5 text-xs">
                <FileText className="h-4 w-4 shrink-0 text-sky-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">
                    3 dokumen legalitas anggota akan segera berakhir
                  </p>
                  <span className="text-[10px] text-stone-400">KTP / NIK kadaluarsa</span>
                </div>
              </div>

              <div className="flex gap-2.5 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">
                    Rekonsiliasi bank bulan Mei belum selesai
                  </p>
                  <span className="text-[10px] text-stone-400">Selisih mutasi Bank BCA</span>
                </div>
              </div>

              <div className="flex gap-2.5 text-xs">
                <Database className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">
                    Backup data terakhir: 16 Mei 2026 02:30 WIB
                  </p>
                  <span className="text-[10px] text-stone-400">Snapshot 10 DB aman di Google Drive</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2">
            <button
              onClick={() => onNavigate('loans')}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 transition-colors"
            >
              {t('dash.all_notifs')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
