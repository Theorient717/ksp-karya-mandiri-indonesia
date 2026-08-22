import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { TaxRecord, TaxType } from '../../types';
import {
  Receipt,
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  CheckCircle,
  FileText,
  Percent,
} from 'lucide-react';

export const TaxView: React.FC = () => {
  const [taxRecords] = useState<TaxRecord[]>(() => StorageService.getTaxRecords());
  const [search, setSearch] = useState('');
  const [taxFilter, setTaxFilter] = useState<string>('ALL');

  const filteredRecords = taxRecords.filter((t) => {
    const matchSearch =
      t.partyName.toLowerCase().includes(search.toLowerCase()) ||
      t.taxId.toLowerCase().includes(search.toLowerCase()) ||
      (t.withholdingTaxSlipNumber && t.withholdingTaxSlipNumber.toLowerCase().includes(search.toLowerCase()));
    const matchType = taxFilter === 'ALL' || t.taxType === taxFilter;
    return matchSearch && matchType;
  });

  const totalDipotong = filteredRecords.reduce((sum, r) => sum + r.taxAmount, 0);

  const handleExportCSV = () => {
    const headers = [
      'NO_BUKTI_POTONG',
      'NIK',
      'NPWP',
      'NAMA_WAJIB_PAJAK',
      'JENIS_PAJAK',
      'KODE_OBJEK_PAJAK',
      'DPP_BRUTO',
      'TARIF_PERSEN',
      'PPH_DIPOTONG',
      'MASA_PAJAK',
      'TAHUN_PAJAK',
      'STATUS_SETOR',
      'NTPN_KAS_NEGARA',
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.withholdingTaxSlipNumber || r.taxId}"`,
      `"${r.partyId || ''}"`,
      `"${r.npwp || '00.000.000.0-000.000'}"`,
      `"${r.partyName}"`,
      `"${r.taxType}"`,
      `"${r.taxType === 'PPH_FINAL_4_2' ? '28-401-02 (Bunga Simpanan Koperasi)' : '21-100-01'}"`,
      r.grossAmount,
      r.taxRate,
      r.taxAmount,
      `"05"`,
      `"2026"`,
      `"${r.status}"`,
      `"0902202601009823"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SPT_MASA_DJP_PPH4_2_KSP_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 dark:text-white">
            Administrasi Perpajakan Koperasi
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Perhitungan dan pemotongan PPh Pasal 4 ayat (2) Final atas bunga simpanan anggota &gt; Rp 240.000, PPh 21, dan PPh 23 (Standar Ditjen Pajak / DJP Online).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
          >
            <span>Cetak PDF Laporan Pajak</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download e-SPT Pajak (CSV DJP)</span>
          </button>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-400">PPh Final 4(2) Bunga Simpanan</span>
            <Receipt className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-stone-900 dark:text-white">
            10,0%
          </div>
          <div className="mt-1 text-[10px] text-stone-400">Bunga &gt; Rp 240.000 / bln</div>
        </div>

        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-400">Total Pajak Terpotong</span>
            <Percent className="h-5 w-5 text-sky-600" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-emerald-800 dark:text-emerald-400">
            Rp {totalDipotong.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-[10px] text-stone-400">Telah diterbitkan Bukti Potong</div>
        </div>

        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-400">Status Penyetoran Kas Negara</span>
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mt-2 text-lg font-extrabold text-stone-900 dark:text-white">
            NTPN Valid
          </div>
          <div className="mt-1 text-[10px] text-emerald-600 font-semibold">Tersetor via Modul Penerimaan Negara</div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama anggota, No Bukti Potong..."
            className="h-9 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={taxFilter}
            onChange={(e) => setTaxFilter(e.target.value)}
            className="h-9 rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-semibold text-stone-700 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          >
            <option value="ALL">Semua Jenis Pajak</option>
            <option value="PPH_FINAL_4_2">PPh Pasal 4(2) Final</option>
            <option value="PPH_21">PPh Pasal 21</option>
            <option value="PPH_23">PPh Pasal 23</option>
          </select>
        </div>
      </div>

      {/* Tax Records Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-700 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-300">
              <tr>
                <th className="py-3 px-4 font-bold">No Bukti Potong</th>
                <th className="py-3 px-4 font-bold">Wajib Pajak (Anggota)</th>
                <th className="py-3 px-4 font-bold">Jenis Pajak</th>
                <th className="py-3 px-4 font-bold text-right">Dasar Pengenaan Pajak (DPP)</th>
                <th className="py-3 px-4 font-bold text-center">Tarif</th>
                <th className="py-3 px-4 font-bold text-right">Pajak Dipotong</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredRecords.map((t) => (
                <tr key={t.taxId} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                    {t.withholdingTaxSlipNumber || t.taxId}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-stone-900 dark:text-white">{t.partyName}</div>
                    <div className="text-[10px] text-stone-500 font-mono">NPWP: {t.npwp || 'Non-NPWP'}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-stone-800 dark:text-stone-200">
                    {t.taxType}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    Rp {t.grossAmount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-center font-bold">
                    {t.taxRate}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-800 dark:text-emerald-400">
                    Rp {t.taxAmount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
