import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { AccountingEngine } from '../../services/accountingEngine';
import { ChartOfAccount, JournalEntry, JournalLine } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  PieChart,
  TrendingUp,
  X,
  Printer,
  FileText,
} from 'lucide-react';

export const AccountingView: React.FC = () => {
  const { currentUser } = useAuth();
  const [coaList] = useState<ChartOfAccount[]>(() => StorageService.getCOA());
  const [journals, setJournals] = useState<JournalEntry[]>(() => StorageService.getJournals());

  const [activeTab, setActiveTab] = useState<'JOURNAL' | 'NERACA' | 'LABA_RUGI' | 'COA'>('JOURNAL');
  const [search, setSearch] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);

  // Manual Journal State
  const [description, setDescription] = useState('');
  const [manualLines, setManualLines] = useState<Array<{ coaCode: string; debit: number; credit: number; notes: string }>>([
    { coaCode: '1-1001', debit: 100000, credit: 0, notes: 'Kas Masuk' },
    { coaCode: '4-1001', debit: 0, credit: 100000, notes: 'Pendapatan Jasa' },
  ]);

  const totalDebit = manualLines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = manualLines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleAddLine = () => {
    setManualLines([...manualLines, { coaCode: '1-1001', debit: 0, credit: 0, notes: '' }]);
  };

  const handleRemoveLine = (idx: number) => {
    setManualLines(manualLines.filter((_, i) => i !== idx));
  };

  const handleSaveManualJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      alert(`Jurnal tidak seimbang! Total Debit (Rp ${totalDebit}) != Total Kredit (Rp ${totalCredit})`);
      return;
    }

    const lines: JournalLine[] = manualLines.map((l) => {
      const coa = coaList.find((c) => c.coaCode === l.coaCode);
      return {
        coaCode: l.coaCode,
        accountName: coa?.accountName || 'Akun',
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        notes: l.notes,
      };
    });

    const newJournal = AccountingEngine.createJournalEntry({
      journalType: 'MANUAL',
      sourceModule: 'MANUAL',
      sourceId: `MAN-${Date.now()}`,
      description: description || 'Jurnal Penyesuaian Manual',
      lines,
      userId: currentUser?.userId || 'USR-AKUNTING',
      userName: currentUser?.name || 'Akunting',
    });

    setJournals([newJournal, ...journals]);
    setShowManualModal(false);
    setDescription('');
  };

  // Financial Statements computations
  const totalAssets = coaList
    .filter((c) => c.category === 'ASET')
    .reduce((sum, c) => sum + c.currentBalance, 0);

  const totalLiabilities = coaList
    .filter((c) => c.category === 'KEWAJIBAN')
    .reduce((sum, c) => sum + c.currentBalance, 0);

  const totalEquity = coaList
    .filter((c) => c.category === 'EKUITAS')
    .reduce((sum, c) => sum + c.currentBalance, 0);

  const totalRevenue = coaList
    .filter((c) => c.category === 'PENDAPATAN')
    .reduce((sum, c) => sum + c.currentBalance, 0);

  const totalExpense = coaList
    .filter((c) => c.category === 'BEBAN')
    .reduce((sum, c) => sum + c.currentBalance, 0);

  const netIncome = totalRevenue - totalExpense;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 dark:text-white">
            Buku Besar & Akuntansi Keuangan Koperasi
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Sistem pembukuan berpasangan (Double-Entry Ledger) dengan validasi mutlak <span className="font-bold text-emerald-700 dark:text-emerald-400">Debit = Kredit</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak PDF Laporan</span>
          </button>
          <button
            onClick={() => {
              let headers: string[] = [];
              let rows: (string | number)[][] = [];
              let filename = `LAPORAN_KEUANGAN_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;

              if (activeTab === 'JOURNAL') {
                headers = ['JOURNAL_ID', 'TANGGAL', 'NO_REF', 'MODUL', 'DESKRIPSI', 'TOTAL_DEBIT', 'TOTAL_KREDIT', 'STATUS', 'USER'];
                rows = journals.map(j => [
                  `"${j.journalId}"`,
                  `"${j.date}"`,
                  `"${j.referenceNumber}"`,
                  `"${j.sourceModule}"`,
                  `"${j.description}"`,
                  j.totalDebit,
                  j.totalCredit,
                  `"${j.status}"`,
                  `"${j.userName}"`
                ]);
              } else {
                headers = ['KODE_COA', 'NAMA_AKUN', 'KATEGORI', 'SUB_KATEGORI', 'POSISI_NORMAL', 'SALDO_AKHIR'];
                rows = coaList.map(c => [
                  `"${c.coaCode}"`,
                  `"${c.accountName}"`,
                  `"${c.category}"`,
                  `"${c.subCategory}"`,
                  `"${c.normalBalance}"`,
                  c.currentBalance
                ]);
              }

              const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
              const link = document.createElement('a');
              link.setAttribute('href', encodeURI(csvContent));
              link.setAttribute('download', filename);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Input Jurnal Penyesuaian</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800">
        <button
          onClick={() => setActiveTab('JOURNAL')}
          className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'JOURNAL'
              ? 'border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          Jurnal Umum (General Journal)
        </button>
        <button
          onClick={() => setActiveTab('NERACA')}
          className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'NERACA'
              ? 'border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          Neraca Keuangan (Balance Sheet)
        </button>
        <button
          onClick={() => setActiveTab('LABA_RUGI')}
          className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'LABA_RUGI'
              ? 'border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          Laporan Laba Rugi / PHU
        </button>
        <button
          onClick={() => setActiveTab('COA')}
          className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'COA'
              ? 'border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          Bagan Akun (Chart of Accounts)
        </button>
      </div>

      {/* TAB 1: JOURNAL */}
      {activeTab === 'JOURNAL' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor jurnal, keterangan..."
                className="h-9 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            {journals.map((j) => (
              <div
                key={j.journalId}
                className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400 text-xs">
                      {j.journalId}
                    </span>
                    <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                      {j.journalType} • {j.sourceModule}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      {j.transactionDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <CheckCircle className="h-3 w-3" />
                      SEIMBANG (Rp {j.totalDebit.toLocaleString('id-ID')})
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-xs font-semibold text-stone-800 dark:text-stone-200 mb-2">
                  {j.description}
                </div>

                {/* Journal Lines */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-500 dark:bg-stone-800/60 dark:text-stone-400">
                      <tr>
                        <th className="py-1.5 px-3 font-semibold">Kode Akun</th>
                        <th className="py-1.5 px-3 font-semibold">Nama Akun</th>
                        <th className="py-1.5 px-3 font-semibold text-right">Debit (Rp)</th>
                        <th className="py-1.5 px-3 font-semibold text-right">Kredit (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {j.lines.map((l, idx) => (
                        <tr key={idx}>
                          <td className="py-1.5 px-3 font-mono text-stone-600 dark:text-stone-400">{l.coaCode}</td>
                          <td className={`py-1.5 px-3 font-medium ${l.credit > 0 ? 'pl-8 text-stone-600 dark:text-stone-400' : 'text-stone-900 dark:text-white'}`}>
                            {l.accountName}
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold text-stone-900 dark:text-white">
                            {l.debit > 0 ? `Rp ${l.debit.toLocaleString('id-ID')}` : '-'}
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold text-stone-900 dark:text-white">
                            {l.credit > 0 ? `Rp ${l.credit.toLocaleString('id-ID')}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: NERACA KEUANGAN */}
      {activeTab === 'NERACA' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Aset / Aktiva */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-400 pb-3 border-b border-stone-100 dark:border-stone-800">
              AKTIVA / ASET
            </h3>
            <div className="mt-4 space-y-2 text-xs">
              {coaList
                .filter((c) => c.category === 'ASET')
                .map((c) => (
                  <div key={c.coaCode} className="flex justify-between py-1 border-b border-stone-50 dark:border-stone-800/50">
                    <span className="text-stone-700 dark:text-stone-300 font-medium">
                      {c.coaCode} - {c.accountName}
                    </span>
                    <span className="font-mono font-bold text-stone-900 dark:text-white">
                      Rp {c.currentBalance.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
            </div>
            <div className="mt-4 pt-3 border-t-2 border-stone-200 dark:border-stone-700 flex justify-between text-sm font-extrabold text-emerald-900 dark:text-emerald-300">
              <span>TOTAL AKTIVA:</span>
              <span>Rp {totalAssets.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Kewajiban & Ekuitas / Pasiva */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white pb-3 border-b border-stone-100 dark:border-stone-800">
                PASIVA (KEWAJIBAN & EKUITAS)
              </h3>
              <div className="mt-4 space-y-2 text-xs">
                <div className="font-bold text-stone-500 uppercase text-[10px]">Kewajiban / Hutang:</div>
                {coaList
                  .filter((c) => c.category === 'KEWAJIBAN')
                  .map((c) => (
                    <div key={c.coaCode} className="flex justify-between py-1 border-b border-stone-50 dark:border-stone-800/50">
                      <span className="text-stone-700 dark:text-stone-300 font-medium">
                        {c.coaCode} - {c.accountName}
                      </span>
                      <span className="font-mono font-bold text-stone-900 dark:text-white">
                        Rp {c.currentBalance.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}

                <div className="font-bold text-stone-500 uppercase text-[10px] pt-2">Ekuitas / Modal Sendiri:</div>
                {coaList
                  .filter((c) => c.category === 'EKUITAS')
                  .map((c) => (
                    <div key={c.coaCode} className="flex justify-between py-1 border-b border-stone-50 dark:border-stone-800/50">
                      <span className="text-stone-700 dark:text-stone-300 font-medium">
                        {c.coaCode} - {c.accountName}
                      </span>
                      <span className="font-mono font-bold text-stone-900 dark:text-white">
                        Rp {c.currentBalance.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-stone-200 dark:border-stone-700 flex justify-between text-sm font-extrabold text-stone-900 dark:text-white">
              <span>TOTAL PASIVA:</span>
              <span>Rp {(totalLiabilities + totalEquity).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LABA RUGI / PHU */}
      {activeTab === 'LABA_RUGI' && (
        <div className="max-w-2xl mx-auto rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="text-center pb-4 border-b border-stone-200 dark:border-stone-800">
            <h3 className="text-base font-extrabold text-stone-900 dark:text-white">
              LAPORAN HASIL USAHA (PHU / LABA RUGI)
            </h3>
            <p className="text-xs text-stone-500">Periode Berjalan Tahun 2026</p>
          </div>

          <div className="mt-6 space-y-4 text-xs">
            {/* Pendapatan */}
            <div>
              <h4 className="font-bold text-emerald-800 dark:text-emerald-400 uppercase text-[11px] mb-2">
                I. PENDAPATAN OPERASIONAL & NON-OPERASIONAL
              </h4>
              <div className="space-y-1.5 pl-2">
                {coaList
                  .filter((c) => c.category === 'PENDAPATAN')
                  .map((c) => (
                    <div key={c.coaCode} className="flex justify-between py-1 border-b border-stone-50 dark:border-stone-800/50">
                      <span>{c.accountName}</span>
                      <span className="font-mono font-bold">Rp {c.currentBalance.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                <div className="flex justify-between font-bold text-stone-900 dark:text-white pt-1">
                  <span>Total Pendapatan:</span>
                  <span>Rp {totalRevenue.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Beban */}
            <div className="pt-3">
              <h4 className="font-bold text-rose-800 dark:text-rose-400 uppercase text-[11px] mb-2">
                II. BEBAN OPERASIONAL & UMUM
              </h4>
              <div className="space-y-1.5 pl-2">
                {coaList
                  .filter((c) => c.category === 'BEBAN')
                  .map((c) => (
                    <div key={c.coaCode} className="flex justify-between py-1 border-b border-stone-50 dark:border-stone-800/50">
                      <span>{c.accountName}</span>
                      <span className="font-mono font-bold">Rp {c.currentBalance.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                <div className="flex justify-between font-bold text-stone-900 dark:text-white pt-1">
                  <span>Total Beban Operasional:</span>
                  <span>Rp {totalExpense.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Net Income / SHU */}
            <div className="mt-6 rounded-xl bg-emerald-50 p-4 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900 flex justify-between items-center">
              <div>
                <span className="text-xs uppercase font-bold text-emerald-900 dark:text-emerald-300">
                  SISA HASIL USAHA BERSIH (SHU)
                </span>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Siap dibagikan pada RAT</p>
              </div>
              <span className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200">
                Rp {netIncome.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COA */}
      {activeTab === 'COA' && (
        <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50 text-stone-700 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-300">
                <tr>
                  <th className="py-3 px-4 font-bold">Kode Akun (COA)</th>
                  <th className="py-3 px-4 font-bold">Nama Akun Rekening</th>
                  <th className="py-3 px-4 font-bold">Kategori</th>
                  <th className="py-3 px-4 font-bold">Saldo Normal</th>
                  <th className="py-3 px-4 font-bold text-right">Saldo Berjalan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {coaList.map((c) => (
                  <tr key={c.coaCode} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                    <td className="py-2.5 px-4 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                      {c.coaCode}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-stone-900 dark:text-white">
                      {c.accountName}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                        {c.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px]">
                      {c.normalBalance}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-stone-900 dark:text-white">
                      Rp {c.currentBalance.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Journal Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200 bg-emerald-900 px-6 py-4 text-white dark:border-stone-800">
              <h3 className="text-sm font-bold">Input Jurnal Penyesuaian Manual</h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="rounded-lg p-1.5 text-emerald-200 hover:bg-emerald-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualJournal} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300">Keterangan Jurnal</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Penyesuaian penyusutan aset inventaris kantor"
                  className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              {/* Dynamic Lines */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-700 dark:text-stone-300">Baris Ayat Jurnal (Double Entry)</span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    + Tambah Baris Akun
                  </button>
                </div>

                <div className="space-y-2">
                  {manualLines.map((l, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded-xl bg-stone-50 p-2 border border-stone-200 dark:bg-stone-800 dark:border-stone-700">
                      <select
                        value={l.coaCode}
                        onChange={(e) => {
                          const updated = [...manualLines];
                          updated[idx].coaCode = e.target.value;
                          setManualLines(updated);
                        }}
                        className="h-8 flex-1 rounded-lg border border-stone-200 bg-white px-2 text-xs font-medium dark:bg-stone-700 dark:border-stone-600"
                      >
                        {coaList.map((c) => (
                          <option key={c.coaCode} value={c.coaCode}>
                            {c.coaCode} - {c.accountName}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        placeholder="Debit (Rp)"
                        value={l.debit || ''}
                        onChange={(e) => {
                          const updated = [...manualLines];
                          updated[idx].debit = Number(e.target.value);
                          setManualLines(updated);
                        }}
                        className="h-8 w-28 rounded-lg border border-stone-200 bg-white px-2 font-mono text-xs dark:bg-stone-700 dark:border-stone-600"
                      />

                      <input
                        type="number"
                        placeholder="Kredit (Rp)"
                        value={l.credit || ''}
                        onChange={(e) => {
                          const updated = [...manualLines];
                          updated[idx].credit = Number(e.target.value);
                          setManualLines(updated);
                        }}
                        className="h-8 w-28 rounded-lg border border-stone-200 bg-white px-2 font-mono text-xs dark:bg-stone-700 dark:border-stone-600"
                      />

                      {manualLines.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="p-1 text-rose-500 hover:text-rose-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Balance Verification Bar */}
              <div className={`flex items-center justify-between p-3 rounded-xl border ${
                isBalanced
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300'
                  : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300'
              }`}>
                <div className="flex items-center gap-2">
                  {isBalanced ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-rose-600" />}
                  <span className="font-bold">
                    {isBalanced ? 'Jurnal Seimbang (Balanced)' : 'Jurnal Tidak Seimbang (Out of Balance)'}
                  </span>
                </div>
                <div className="text-right font-mono font-bold">
                  <div>Debit: Rp {totalDebit.toLocaleString('id-ID')}</div>
                  <div>Kredit: Rp {totalCredit.toLocaleString('id-ID')}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!isBalanced}
                  className="rounded-xl bg-emerald-800 px-5 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Posting ke Buku Besar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
