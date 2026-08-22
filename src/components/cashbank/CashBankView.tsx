import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { CashBankTransaction, CashMutationType, ChartOfAccount } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Search,
  CheckCircle2,
  DollarSign,
  Building,
  HardDrive,
  X,
} from 'lucide-react';

export const CashBankView: React.FC = () => {
  const { currentUser } = useAuth();
  const [coaList] = useState<ChartOfAccount[]>(() => StorageService.getCOA());
  const [transactions, setTransactions] = useState<CashBankTransaction[]>(() => StorageService.getCashBankTransactions());

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    type: 'KAS_MASUK' as CashMutationType,
    accountType: 'KAS_TUNAI' as CashBankTransaction['accountType'],
    amount: 500000,
    description: '',
    sourceModule: 'OPERASIONAL' as CashBankTransaction['sourceModule'],
  });

  // Calculate Balances
  const kasAccount = coaList.find((c) => c.coaCode === '1-1001');
  const bcaAccount = coaList.find((c) => c.coaCode === '1-1002');
  const mandiriAccount = coaList.find((c) => c.coaCode === '1-1003');
  const briAccount = coaList.find((c) => c.coaCode === '1-1004');

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.amount <= 0) {
      alert('Nominal harus lebih besar dari 0!');
      return;
    }

    const year = new Date().getFullYear();
    const prefix = form.type === 'KAS_MASUK' ? 'KM' : form.type === 'KAS_KELUAR' ? 'KK' : form.type === 'BANK_MASUK' ? 'BM' : 'BK';
    const nextSeq = String(transactions.length + 1).padStart(6, '0');
    const cashBankId = `${prefix}-${year}-${nextSeq}`;

    const newTx: CashBankTransaction = {
      cashBankId,
      type: form.type,
      accountType: form.accountType,
      sourceModule: form.sourceModule,
      sourceId: cashBankId,
      amount: form.amount,
      balanceAfter: form.amount,
      description: form.description,
      coaCode: form.accountType === 'KAS_TUNAI' ? '1-1001' : '1-1002',
      status: 'POSTED',
      createdById: currentUser?.userId || 'USR-KASIR',
      createdByName: currentUser?.name || 'Kasir',
      createdAt: new Date().toISOString(),
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    StorageService.saveCashBankTransactions(updated);

    StorageService.addAuditLog({
      userId: currentUser?.userId || 'USR-KASIR',
      userName: currentUser?.name || 'Kasir',
      role: 'KASIR',
      module: 'KAS_BANK',
      action: 'POST',
      recordId: cashBankId,
      status: 'SUCCESS',
      ipAddress: '127.0.0.1',
      message: `Pencatatan ${form.type} (${form.accountType}) senilai Rp ${form.amount.toLocaleString('id-ID')} - ${form.description}`,
    });

    setShowModal(false);
    setForm({
      type: 'KAS_MASUK',
      accountType: 'KAS_TUNAI',
      amount: 500000,
      description: '',
      sourceModule: 'OPERASIONAL',
    });
  };

  const filteredTransactions = transactions.filter((t) => {
    return (
      t.cashBankId.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.accountType.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 dark:text-white">
            Kas Operasional & Rekening Perbankan
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Monitoring likuiditas kas fisik kasir dan rekening bank penampungan koperasi secara terpadu.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Mutasi Kas / Bank</span>
        </button>
      </div>

      {/* Account Balances Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Kas Tunai Kasir */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-400">Kas Tunai Kasir</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-lg font-extrabold text-stone-900 dark:text-white">
            Rp {(kasAccount?.currentBalance || 156350000).toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-[10px] text-stone-400 font-mono">COA: 1-1001 (Kasir Utama)</div>
        </div>

        {/* Bank BCA */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-400">Bank BCA Operasional</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-lg font-extrabold text-stone-900 dark:text-white">
            Rp {(bcaAccount?.currentBalance || 645800000).toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-[10px] text-stone-400 font-mono">Rek. 882019283</div>
        </div>

        {/* Bank Mandiri */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-400">Bank Mandiri Giro</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-lg font-extrabold text-stone-900 dark:text-white">
            Rp {(mandiriAccount?.currentBalance || 420000000).toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-[10px] text-stone-400 font-mono">Rek. 132009871</div>
        </div>

        {/* Bank BRI */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-400">Bank BRI Penampungan</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-lg font-extrabold text-stone-900 dark:text-white">
            Rp {(briAccount?.currentBalance || 180000000).toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-[10px] text-stone-400 font-mono">Rek. 0341010008</div>
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
            placeholder="Cari nomor mutasi, keterangan..."
            className="h-9 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
          />
        </div>
      </div>

      {/* Cash & Bank Mutasi Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-700 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-300">
              <tr>
                <th className="py-3 px-4 font-bold">ID Transaksi</th>
                <th className="py-3 px-4 font-bold">Tipe & Rekening</th>
                <th className="py-3 px-4 font-bold">Keterangan</th>
                <th className="py-3 px-4 font-bold">Modul Sumber</th>
                <th className="py-3 px-4 font-bold text-right">Nominal</th>
                <th className="py-3 px-4 font-bold">Petugas</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    Belum ada mutasi manual dicatat.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.cashBankId} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                      {tx.cashBankId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900 dark:text-white">{tx.type}</div>
                      <div className="text-[10px] text-stone-400">{tx.accountType}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-stone-700 dark:text-stone-300">
                      {tx.description}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                        {tx.sourceModule}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-stone-900 dark:text-white">
                      Rp {tx.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-stone-500">
                      {tx.createdByName}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Mutation */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200 bg-emerald-900 px-6 py-4 text-white dark:border-stone-800">
              <h3 className="text-sm font-bold">Pencatatan Mutasi Kas / Bank</h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-emerald-200 hover:bg-emerald-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300">Jenis Mutasi</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                  className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 font-semibold text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                >
                  <option value="KAS_MASUK">Kas Masuk (KM)</option>
                  <option value="KAS_KELUAR">Kas Keluar (KK)</option>
                  <option value="BANK_MASUK">Bank Masuk (BM)</option>
                  <option value="BANK_KELUAR">Bank Keluar (BK)</option>
                  <option value="TRANSFER">Transfer Internal Kas - Bank</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300">Akun Rekening Kas / Bank</label>
                <select
                  value={form.accountType}
                  onChange={(e) => setForm({ ...form, accountType: e.target.value as any })}
                  className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 font-semibold text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                >
                  <option value="KAS_TUNAI">Kas Tunai Kasir (1-1001)</option>
                  <option value="BANK_BCA">Bank BCA Operasional (1-1002)</option>
                  <option value="BANK_MANDIRI">Bank Mandiri Giro (1-1003)</option>
                  <option value="BANK_BRI">Bank BRI Penampungan (1-1004)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300">Nominal Mutasi (Rp)</label>
                <input
                  type="number"
                  step="10000"
                  required
                  value={form.amount || ''}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm font-bold text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300">Keterangan / Memo</label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Contoh: Pengisian kas kecil operasional kantor"
                  className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-800 px-5 py-2 font-bold text-white hover:bg-emerald-700"
                >
                  Simpan Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
