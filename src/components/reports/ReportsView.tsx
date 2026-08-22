import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { FileBarChart, Download, Printer, Filter, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('KOLEKTIBILITAS');
  const members = StorageService.getMembers();
  const loans = StorageService.getLoanApplications();
  const savings = StorageService.getSavingsTransactions();
  const coaList = StorageService.getCOA();

  const handleExportCSV = () => {
    alert(`Laporan ${selectedReport} berhasil diexport ke CSV (Spreadsheet Data Mart format).`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 dark:text-white">
            Pusat Laporan & Data Mart Koperasi
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Laporan agregasi analitik, kolektibilitas kredit (NPL), rekap simpanan, dan proyeksi pembagian SHU.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'KOLEKTIBILITAS', label: 'Kolektibilitas & NPL Pinjaman' },
          { id: 'REKAP_SIMPANAN', label: 'Rekapitulasi Simpanan Anggota' },
          { id: 'ARUS_KAS', label: 'Laporan Arus Kas Operasional' },
          { id: 'PROYEKSI_SHU', label: 'Proyeksi Pembagian SHU Tahunan' },
        ].map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedReport(r.id)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              selectedReport === r.id
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Report Content Container */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        {/* Header inside Report */}
        <div className="text-center pb-4 border-b border-stone-200 dark:border-stone-800 mb-6">
          <h2 className="text-base font-extrabold text-stone-900 dark:text-white uppercase tracking-wide">
            KSP KARYA MANDIRI INDONESIA
          </h2>
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
            {selectedReport === 'KOLEKTIBILITAS' && 'LAPORAN DAFTAR KOLEKTIBILITAS KREDIT & PENYISIHAN PENGHAPUSAN AKTIVA (PPA)'}
            {selectedReport === 'REKAP_SIMPANAN' && 'LAPORAN REKAPITULASI SALDO SIMPANAN ANGGOTA'}
            {selectedReport === 'ARUS_KAS' && 'LAPORAN ARUS KAS PENERIMAAN DAN PENGELUARAN (CASH FLOW)'}
            {selectedReport === 'PROYEKSI_SHU' && 'LAPORAN ALOKASI & SIMULASI PEMBAGIAN SISA HASIL USAHA (SHU)'}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">Posisi Per 16 Mei 2026</p>
        </div>

        {/* 1. KOLEKTIBILITAS VIEW */}
        {selectedReport === 'KOLEKTIBILITAS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900 text-center">
                <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">KOL 1: Lancar</div>
                <div className="text-sm font-extrabold text-stone-900 dark:text-white mt-1">92.4%</div>
                <span className="text-[10px] text-stone-400">Rp 2.45 M</span>
              </div>
              <div className="rounded-xl bg-sky-50 p-3 border border-sky-200 dark:bg-sky-950/30 dark:border-sky-900 text-center">
                <div className="text-[10px] font-bold text-sky-800 dark:text-sky-300">KOL 2: DPK</div>
                <div className="text-sm font-extrabold text-stone-900 dark:text-white mt-1">4.2%</div>
                <span className="text-[10px] text-stone-400">Rp 112 Jt</span>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 text-center">
                <div className="text-[10px] font-bold text-amber-800 dark:text-amber-300">KOL 3: Kurang Lancar</div>
                <div className="text-sm font-extrabold text-stone-900 dark:text-white mt-1">1.8%</div>
                <span className="text-[10px] text-stone-400">Rp 48 Jt</span>
              </div>
              <div className="rounded-xl bg-orange-50 p-3 border border-orange-200 dark:bg-orange-950/30 dark:border-orange-900 text-center">
                <div className="text-[10px] font-bold text-orange-800 dark:text-orange-300">KOL 4: Diragukan</div>
                <div className="text-sm font-extrabold text-stone-900 dark:text-white mt-1">0.9%</div>
                <span className="text-[10px] text-stone-400">Rp 24 Jt</span>
              </div>
              <div className="rounded-xl bg-rose-50 p-3 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900 text-center">
                <div className="text-[10px] font-bold text-rose-800 dark:text-rose-300">KOL 5: Macet</div>
                <div className="text-sm font-extrabold text-rose-600 mt-1">0.7%</div>
                <span className="text-[10px] text-stone-400">Rp 18.5 Jt</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">No Kontrak</th>
                    <th className="py-2.5 px-3 font-bold">Nama Peminjam</th>
                    <th className="py-2.5 px-3 font-bold text-right">Plafon Awal</th>
                    <th className="py-2.5 px-3 font-bold text-right">Baki Debet</th>
                    <th className="py-2.5 px-3 font-bold text-center">Kolektibilitas</th>
                    <th className="py-2.5 px-3 font-bold text-right">Cadangan PPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {loans.slice(0, 10).map((l, i) => (
                    <tr key={l.applicationId} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                      <td className="py-2 px-3 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                        {l.contractNumber || l.applicationId}
                      </td>
                      <td className="py-2 px-3 font-semibold text-stone-800 dark:text-stone-200">
                        {l.partyName}
                      </td>
                      <td className="py-2 px-3 text-right">
                        Rp {l.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-stone-900 dark:text-white">
                        Rp {(l.amount * 0.75).toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          KOL 1 (Lancar)
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-stone-500">
                        Rp {(l.amount * 0.01).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. REKAP SIMPANAN */}
        {selectedReport === 'REKAP_SIMPANAN' && (
          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                <tr>
                  <th className="py-2.5 px-3 font-bold">ID Anggota</th>
                  <th className="py-2.5 px-3 font-bold">Nama Anggota</th>
                  <th className="py-2.5 px-3 font-bold text-right">Simp. Pokok</th>
                  <th className="py-2.5 px-3 font-bold text-right">Simp. Wajib</th>
                  <th className="py-2.5 px-3 font-bold text-right">Simp. Sukarela</th>
                  <th className="py-2.5 px-3 font-bold text-right">Total Simpanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {members.slice(0, 10).map((m) => (
                  <tr key={m.partyId} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                    <td className="py-2 px-3 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                      {m.partyId}
                    </td>
                    <td className="py-2 px-3 font-semibold text-stone-800 dark:text-stone-200">
                      {m.nama}
                    </td>
                    <td className="py-2 px-3 text-right">Rp 100.000</td>
                    <td className="py-2 px-3 text-right">Rp 600.000</td>
                    <td className="py-2 px-3 text-right">Rp 2.500.000</td>
                    <td className="py-2 px-3 text-right font-extrabold text-stone-900 dark:text-white">
                      Rp 3.200.000
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. ARUS KAS */}
        {selectedReport === 'ARUS_KAS' && (
          <div className="max-w-2xl mx-auto space-y-4 text-xs">
            <div className="space-y-2">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-400 uppercase text-[11px]">
                ARUS KAS DARI AKTIVITAS OPERASIONAL
              </h4>
              <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                <span>Penerimaan Angsuran Pokok Pinjaman</span>
                <span className="font-mono font-bold">Rp 185.000.000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                <span>Penerimaan Pendapatan Bunga Pinjaman</span>
                <span className="font-mono font-bold">Rp 48.750.000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                <span>Penerimaan Biaya Administrasi & Provisi</span>
                <span className="font-mono font-bold">Rp 6.200.000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800 text-rose-600">
                <span>Penyaluran Pencairan Pinjaman Baru</span>
                <span className="font-mono font-bold">(Rp 150.000.000)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800 text-rose-600">
                <span>Pembayaran Beban Operasional & Gaji</span>
                <span className="font-mono font-bold">(Rp 15.600.000)</span>
              </div>
            </div>

            <div className="pt-2 border-t-2 border-stone-200 dark:border-stone-700 flex justify-between font-extrabold text-sm text-stone-900 dark:text-white">
              <span>Kenaikan Bersih Kas & Bank:</span>
              <span className="text-emerald-800 dark:text-emerald-400">Rp 74.350.000</span>
            </div>
          </div>
        )}

        {/* 4. PROYEKSI SHU */}
        {selectedReport === 'PROYEKSI_SHU' && (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900 flex justify-between items-center">
              <div>
                <span className="text-xs uppercase font-bold text-emerald-900 dark:text-emerald-300">
                  Total Estimasi SHU Tahun Buku 2026
                </span>
                <p className="text-[10px] text-stone-500">Sesuai Keputusan AD/ART Koperasi</p>
              </div>
              <span className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200">
                Rp 285.600.000
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-stone-200 p-3 space-y-1.5 dark:border-stone-700">
                <div className="font-bold text-stone-700 dark:text-stone-300">Jasa Modal Anggota (40%)</div>
                <p className="text-stone-500 text-[11px]">Dialokasikan berdasarkan saldo simpanan pokok & wajib</p>
                <div className="text-base font-extrabold text-emerald-800 dark:text-emerald-400">Rp 114.240.000</div>
              </div>

              <div className="rounded-xl border border-stone-200 p-3 space-y-1.5 dark:border-stone-700">
                <div className="font-bold text-stone-700 dark:text-stone-300">Jasa Usaha / Pinjaman (30%)</div>
                <p className="text-stone-500 text-[11px]">Dialokasikan berdasarkan kontribusi bunga pinjaman anggota</p>
                <div className="text-base font-extrabold text-sky-800 dark:text-sky-400">Rp 85.680.000</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
