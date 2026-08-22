import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { AccountingEngine } from '../../services/accountingEngine';
import { SavingsProduct, SavingsTransaction, Member } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ReceiptModal, ReceiptData } from '../common/ReceiptModal';
import {
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  CreditCard,
  Building,
  DollarSign,
  History,
  BookOpen,
} from 'lucide-react';

export const SavingsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [members] = useState<Member[]>(() => StorageService.getMembers().filter((m) => m.partyType === 'ANGGOTA'));
  const [products] = useState<SavingsProduct[]>(() => StorageService.getSavingsProducts());
  const [transactions, setTransactions] = useState<SavingsTransaction[]>(() => StorageService.getSavingsTransactions());

  const [search, setSearch] = useState('');
  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState<'SETORAN' | 'PENARIKAN'>('SETORAN');

  // Form State
  const [form, setForm] = useState({
    partyId: members[0]?.partyId || '',
    productCode: 'SUKARELA' as 'POKOK' | 'WAJIB' | 'SUKARELA' | 'BERJANGKA',
    amount: 100000,
    paymentMethod: 'KAS' as 'KAS' | 'BANK',
    notes: '',
  });

  // Receipt Modal
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.amount <= 0) {
      alert('Nominal harus lebih besar dari 0!');
      return;
    }

    const member = members.find((m) => m.partyId === form.partyId);
    if (!member) {
      alert('Pilih anggota valid!');
      return;
    }

    const year = new Date().getFullYear();
    const nextSeq = String(transactions.length + 1).padStart(6, '0');
    const transactionId = `TRX-SP-${year}-${nextSeq}`;

    const newTx: SavingsTransaction = {
      transactionId,
      partyId: member.partyId,
      partyName: member.nama,
      productCode: form.productCode,
      type: txType,
      amount: form.amount,
      paymentMethod: form.paymentMethod,
      balanceAfter: form.amount, // running balance simplification
      notes: form.notes || `${txType === 'SETORAN' ? 'Setoran' : 'Penarikan'} Simpanan ${form.productCode}`,
      status: 'POSTED',
      sourceModule: 'SIMPANAN',
      createdById: currentUser?.userId || 'USR-KASIR',
      createdByName: currentUser?.name || 'Kasir',
      createdAt: new Date().toISOString(),
    };

    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    StorageService.saveSavingsTransactions(updatedTxs);

    // Auto Double-Entry Journal Posting if Deposit
    let journalId = 'JR-AUTO';
    if (txType === 'SETORAN') {
      const journal = AccountingEngine.postSavingsDeposit({
        transactionId,
        partyName: member.nama,
        productCode: form.productCode,
        amount: form.amount,
        paymentMethod: form.paymentMethod,
        userId: currentUser?.userId || 'USR-KASIR',
        userName: currentUser?.name || 'Kasir',
      });
      journalId = journal.journalId;
    }

    // Show Receipt Modal
    setReceiptData({
      title: `SLIP ${txType} SIMPANAN KOPERASI`,
      receiptNumber: transactionId,
      date: new Date().toISOString().split('T')[0],
      partyName: member.nama,
      partyId: member.partyId,
      transactionType: `${txType} Simpanan ${form.productCode}`,
      amount: form.amount,
      paymentMethod: form.paymentMethod === 'BANK' ? 'Transfer Bank BCA' : 'Kas Tunai Kasir',
      details: [
        { label: 'Jenis Simpanan', value: form.productCode },
        { label: 'Nomor Transaksi', value: transactionId },
        { label: 'No. Jurnal Akuntansi', value: journalId },
      ],
      notes: form.notes || 'Transaksi telah dibukukan.',
      servedBy: currentUser?.name || 'Kasir',
    });

    setShowTxModal(false);
  };

  const filteredTransactions = transactions.filter((t) => {
    return (
      t.partyName.toLowerCase().includes(search.toLowerCase()) ||
      t.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      t.partyId.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 dark:text-white">
            Pengelolaan Simpanan Anggota
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Pencatatan Simpanan Pokok, Simpanan Wajib bulanan, Sukarela harian, dan Simpanan Berjangka (Deposito).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTxType('SETORAN');
              setShowTxModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
          >
            <ArrowDownLeft className="h-4 w-4" />
            <span>Setoran Simpanan</span>
          </button>
          <button
            onClick={() => {
              setTxType('PENARIKAN');
              setShowTxModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 shadow-xs"
          >
            <ArrowUpRight className="h-4 w-4 text-rose-500" />
            <span>Penarikan Dana</span>
          </button>
        </div>
      </div>

      {/* Product Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <div
            key={p.productId}
            className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{p.name}</span>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {p.code}
              </span>
            </div>
            <div className="mt-2 text-lg font-extrabold text-stone-900 dark:text-white">
              Min. Rp {p.minDeposit.toLocaleString('id-ID')}
            </div>
            <div className="mt-1 text-[11px] text-stone-500">
              Bunga: <span className="font-bold text-emerald-700 dark:text-emerald-400">{p.interestRateAnnual}% p.a.</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi, nama anggota, ID..."
            className="h-9 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-700 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-300">
              <tr>
                <th className="py-3 px-4 font-bold">No Transaksi</th>
                <th className="py-3 px-4 font-bold">Anggota</th>
                <th className="py-3 px-4 font-bold">Jenis Simpanan</th>
                <th className="py-3 px-4 font-bold">Tipe Mutasi</th>
                <th className="py-3 px-4 font-bold text-right">Nominal</th>
                <th className="py-3 px-4 font-bold">Metode</th>
                <th className="py-3 px-4 font-bold">Waktu</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    Belum ada riwayat mutasi simpanan tercatat.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.transactionId} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                      {tx.transactionId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900 dark:text-white">{tx.partyName}</div>
                      <div className="text-[10px] text-stone-400 font-mono">{tx.partyId}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-800 dark:text-stone-200">
                      {tx.productCode}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          tx.type === 'SETORAN'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {tx.type === 'SETORAN' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-stone-900 dark:text-white">
                      Rp {tx.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 font-medium text-stone-600 dark:text-stone-400">
                      {tx.paymentMethod}
                    </td>
                    <td className="py-3 px-4 text-stone-500">
                      {new Date(tx.createdAt).toLocaleDateString('id-ID')}
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

      {/* New Transaction Modal */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200 bg-emerald-900 px-6 py-4 text-white dark:border-stone-800">
              <h3 className="text-sm font-bold">
                {txType === 'SETORAN' ? 'Setoran Simpanan Anggota' : 'Penarikan Dana Simpanan'}
              </h3>
              <button
                onClick={() => setShowTxModal(false)}
                className="rounded-lg p-1.5 text-emerald-200 hover:bg-emerald-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300">Pilih Anggota</label>
                <select
                  value={form.partyId}
                  onChange={(e) => setForm({ ...form, partyId: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 font-semibold text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                >
                  {members.map((m) => (
                    <option key={m.partyId} value={m.partyId}>
                      {m.nama} ({m.partyId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300">Jenis Simpanan</label>
                <select
                  value={form.productCode}
                  onChange={(e) => setForm({ ...form, productCode: e.target.value as any })}
                  className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 font-semibold text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                >
                  <option value="SUKARELA">Simpanan Sukarela (Harian)</option>
                  <option value="WAJIB">Simpanan Wajib (Bulanan)</option>
                  <option value="POKOK">Simpanan Pokok</option>
                  <option value="BERJANGKA">Simpanan Berjangka Deposito</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300">Nominal Transaksi (Rp)</label>
                <input
                  type="number"
                  step="10000"
                  required
                  value={form.amount || ''}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm font-bold text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  placeholder="Contoh: 100.000"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300">Metode Penyetoran / Penarikan</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, paymentMethod: 'KAS' })}
                    className={`flex items-center justify-center gap-2 rounded-xl p-2.5 font-bold border transition-colors ${
                      form.paymentMethod === 'KAS'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Kas Tunai</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, paymentMethod: 'BANK' })}
                    className={`flex items-center justify-center gap-2 rounded-xl p-2.5 font-bold border transition-colors ${
                      form.paymentMethod === 'BANK'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <Building className="h-4 w-4" />
                    <span>Bank Transfer</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300">Catatan</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Contoh: Setoran rutin bulanan"
                  className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
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

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={!!receiptData}
        onClose={() => setReceiptData(null)}
        data={receiptData}
      />
    </div>
  );
};
