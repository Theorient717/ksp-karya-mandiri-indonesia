import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { AccountingEngine } from '../../services/accountingEngine';
import { LoanCalculatorService } from '../../services/loanCalculator';
import { InstallmentSchedule, InstallmentPayment, LoanApplication } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ReceiptModal, ReceiptData } from '../common/ReceiptModal';
import {
  CalendarCheck2,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Printer,
  Calendar,
  X,
  CreditCard,
  Building,
} from 'lucide-react';

export const InstallmentView: React.FC = () => {
  const { currentUser } = useAuth();
  const [schedules, setSchedules] = useState<InstallmentSchedule[]>(() => StorageService.getInstallmentSchedules());
  const [loans] = useState<LoanApplication[]>(() => StorageService.getLoanApplications());

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Payment Modal State
  const [selectedSchedule, setSelectedSchedule] = useState<InstallmentSchedule | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'KAS' | 'BANK'>('KAS');
  const [collectionType, setCollectionType] = useState<'KANTOR' | 'LAPANGAN'>('KANTOR');
  const [fieldServiceFee, setFieldServiceFee] = useState<number>(10000);
  const [collectorName, setCollectorName] = useState<string>('Petugas Lapangan (Kolektor)');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Receipt Modal
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Execute Installment Payment
  const handlePayInstallment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    const year = new Date().getFullYear();
    const payments = StorageService.get<InstallmentPayment[]>('KSP_ANGSURAN_PAYMENTS', []);
    const nextSeq = String(payments.length + 1).padStart(6, '0');
    const paymentId = `BYR-${year}-${nextSeq}`;

    const principalDue = selectedSchedule.principalAmount - selectedSchedule.principalPaid;
    const interestDue = selectedSchedule.interestAmount - selectedSchedule.interestPaid;
    const penaltyDue = selectedSchedule.penaltyAmount - selectedSchedule.penaltyPaid;
    const appliedFieldFee = collectionType === 'LAPANGAN' ? fieldServiceFee : 0;
    const totalAmount = principalDue + interestDue + penaltyDue + appliedFieldFee;

    const newPayment: InstallmentPayment = {
      paymentId,
      contractId: selectedSchedule.contractId,
      installmentId: selectedSchedule.installmentId,
      partyId: selectedSchedule.partyId,
      partyName: selectedSchedule.partyName,
      installmentNo: selectedSchedule.installmentNo,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      collectionType,
      bankName: paymentMethod === 'BANK' ? 'Bank BCA Operasional' : undefined,
      principalPortion: principalDue,
      interestPortion: interestDue,
      penaltyPortion: penaltyDue,
      fieldCollectionFee: appliedFieldFee,
      totalAmount,
      collectorName: collectionType === 'LAPANGAN' ? collectorName : undefined,
      notes:
        paymentNotes ||
        `Pembayaran cicilan ke-${selectedSchedule.installmentNo} (${
          collectionType === 'LAPANGAN' ? `Layanan Lapangan via ${collectorName}` : 'Bayar di Kantor'
        })`,
      createdById: currentUser?.userId || 'USR-KASIR',
      createdByName: currentUser?.name || 'Kasir',
      createdAt: new Date().toISOString(),
    };

    // 1. Update Schedule Record
    const updatedSchedules = schedules.map((s) => {
      if (s.installmentId === selectedSchedule.installmentId) {
        return {
          ...s,
          principalPaid: s.principalAmount,
          interestPaid: s.interestAmount,
          penaltyPaid: s.penaltyAmount,
          fieldCollectionFeePaid: appliedFieldFee,
          totalPaid: s.totalBill + s.penaltyAmount + appliedFieldFee,
          status: 'LUNAS' as const,
          paidAt: new Date().toISOString().split('T')[0],
          paymentRefId: paymentId,
        };
      }
      return s;
    });

    setSchedules(updatedSchedules);
    StorageService.saveInstallmentSchedules(updatedSchedules);
    StorageService.set('KSP_ANGSURAN_PAYMENTS', [newPayment, ...payments]);

    // 2. Automatic Double-Entry Journal Posting
    const journal = AccountingEngine.postInstallmentPayment({
      paymentId,
      contractNumber: selectedSchedule.contractId,
      partyName: selectedSchedule.partyName,
      installmentNo: selectedSchedule.installmentNo,
      principalPortion: principalDue,
      interestPortion: interestDue,
      penaltyPortion: penaltyDue,
      fieldCollectionFee: appliedFieldFee,
      totalAmount,
      paymentMethod,
      userId: currentUser?.userId || 'USR-KASIR',
      userName: currentUser?.name || 'Kasir',
    });

    // 3. Show Printable Receipt
    const receiptDetails = [
      { label: 'Nomor Akad Kontrak', value: selectedSchedule.contractId },
      { label: 'Jalur Pelayanan', value: collectionType === 'LAPANGAN' ? `Jasa Lapangan (+Rp ${appliedFieldFee.toLocaleString('id-ID')})` : 'Datang ke Kantor Langsung' },
      { label: 'Porsi Pokok Pinjaman', value: `Rp ${principalDue.toLocaleString('id-ID')}` },
      { label: 'Porsi Bunga / Jasa', value: `Rp ${interestDue.toLocaleString('id-ID')}` },
    ];

    if (appliedFieldFee > 0) {
      receiptDetails.push({
        label: 'Biaya Jasa Petugas Lapangan',
        value: `Rp ${appliedFieldFee.toLocaleString('id-ID')}`,
      });
    }

    if (penaltyDue > 0) {
      receiptDetails.push({
        label: 'Denda Keterlambatan',
        value: `Rp ${penaltyDue.toLocaleString('id-ID')}`,
      });
    }

    receiptDetails.push(
      { label: 'Sisa Pokok Pinjaman', value: `Rp ${selectedSchedule.remainingPrincipal.toLocaleString('id-ID')}` },
      { label: 'No. Jurnal Akuntansi', value: journal.journalId }
    );

    setReceiptData({
      title: 'KWITANSI PEMBAYARAN ANGSURAN RESMI',
      receiptNumber: paymentId,
      date: new Date().toISOString().split('T')[0],
      partyName: selectedSchedule.partyName,
      partyId: selectedSchedule.partyId,
      transactionType: `Angsuran Pinjaman Cicilan Ke-${selectedSchedule.installmentNo}`,
      amount: totalAmount,
      paymentMethod:
        collectionType === 'LAPANGAN'
          ? `Tunai Petugas Lapangan (${collectorName})`
          : paymentMethod === 'BANK'
          ? 'Transfer Bank BCA'
          : 'Kas Tunai Kantor Koperasi',
      details: receiptDetails,
      notes:
        paymentNotes ||
        (collectionType === 'LAPANGAN'
          ? 'Pembayaran via Jasa Jemput Petugas Lapangan (Dikenakan charge Rp 10.000).'
          : 'Pembayaran langsung di loket Kantor Koperasi.'),
      servedBy: collectionType === 'LAPANGAN' ? collectorName : currentUser?.name || 'Kasir',
    });

    setSelectedSchedule(null);
    setCollectionType('KANTOR');
    setPaymentNotes('');
  };

  const filteredSchedules = schedules.filter((s) => {
    const matchSearch =
      s.partyName.toLowerCase().includes(search.toLowerCase()) ||
      s.contractId.toLowerCase().includes(search.toLowerCase()) ||
      s.installmentId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 dark:text-white">
            Jadwal & Penerimaan Angsuran Cicilan
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Monitoring jadwal jatuh tempo, denda keterlambatan harian, dan penerimaan kasir terintegrasi.
          </p>
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
            placeholder="Cari nama, No Akad, ID Angsuran..."
            className="h-9 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-semibold text-stone-700 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          >
            <option value="ALL">Semua Status Tagihan</option>
            <option value="BELUM_BAYAR">Belum Bayar (Berjalan)</option>
            <option value="TERLAMBAT">Menunggak / Terlambat</option>
            <option value="LUNAS">Lunas</option>
          </select>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-700 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-300">
              <tr>
                <th className="py-3 px-4 font-bold">No Akad / ID</th>
                <th className="py-3 px-4 font-bold">Peminjam</th>
                <th className="py-3 px-4 font-bold">Bulan ke</th>
                <th className="py-3 px-4 font-bold">Jatuh Tempo</th>
                <th className="py-3 px-4 font-bold text-right">Pokok</th>
                <th className="py-3 px-4 font-bold text-right">Bunga</th>
                <th className="py-3 px-4 font-bold text-right">Denda</th>
                <th className="py-3 px-4 font-bold text-right">Total Tagihan</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
                <th className="py-3 px-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredSchedules.map((s) => (
                <tr key={s.installmentId} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                    {s.contractId}
                    <div className="text-[10px] text-stone-400 font-mono">{s.installmentId}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-stone-900 dark:text-white">{s.partyName}</div>
                    <div className="text-[10px] text-stone-500">{s.partyId}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-stone-700 dark:text-stone-300">
                    Ke-{s.installmentNo}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-stone-800 dark:text-stone-200">{s.dueDate}</div>
                    {s.status === 'TERLAMBAT' && (
                      <span className="text-[10px] text-rose-500 font-bold">
                        Lewat {s.daysOverdue} Hari
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-stone-800 dark:text-stone-200">
                    Rp {s.principalAmount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-700 dark:text-emerald-400 font-medium">
                    Rp {s.interestAmount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right text-rose-600 font-medium">
                    {s.penaltyAmount > 0 ? `Rp ${s.penaltyAmount.toLocaleString('id-ID')}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-stone-900 dark:text-white">
                    Rp {(s.totalBill + (s.penaltyAmount || 0)).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        s.status === 'LUNAS'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : s.status === 'TERLAMBAT'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {s.status !== 'LUNAS' ? (
                      <button
                        onClick={() => setSelectedSchedule(s)}
                        className="rounded-lg bg-emerald-800 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                      >
                        Terima Bayar
                      </button>
                    ) : (
                      <span className="text-[11px] text-stone-400 font-semibold flex items-center justify-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                        {s.paidAt}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Processing Modal */}
      {selectedSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200 bg-emerald-900 px-6 py-4 text-white dark:border-stone-800">
              <div>
                <h3 className="text-sm font-bold">Penerimaan Pembayaran Angsuran</h3>
                <p className="text-xs text-emerald-200">
                  Akad No. {selectedSchedule.contractId} (Cicilan ke-{selectedSchedule.installmentNo})
                </p>
              </div>
              <button
                onClick={() => setSelectedSchedule(null)}
                className="rounded-lg p-1.5 text-emerald-200 hover:bg-emerald-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePayInstallment} className="p-6 space-y-4 text-xs">
              {/* Payment Channel / Collection Location */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">
                  Tempat / Jalur Pembayaran Angsuran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCollectionType('KANTOR')}
                    className={`flex flex-col items-center justify-center rounded-xl p-3 text-center border transition-colors ${
                      collectionType === 'KANTOR'
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span className="text-xs font-bold">🏢 Datang ke Kantor</span>
                    <span className={`text-[10px] mt-0.5 ${collectionType === 'KANTOR' ? 'text-emerald-200' : 'text-stone-500'}`}>
                      Tanpa biaya tambahan (Tetap)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCollectionType('LAPANGAN')}
                    className={`flex flex-col items-center justify-center rounded-xl p-3 text-center border transition-colors ${
                      collectionType === 'LAPANGAN'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span className="text-xs font-bold">🛵 Jasa Lapangan</span>
                    <span className={`text-[10px] mt-0.5 ${collectionType === 'LAPANGAN' ? 'text-amber-100 font-bold' : 'text-amber-600 dark:text-amber-400 font-bold'}`}>
                      + Cash Rp 10.000
                    </span>
                  </button>
                </div>
              </div>

              {/* Detail Tagihan Breakdown */}
              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-600 dark:text-stone-400">Peminjam:</span>
                  <span className="font-bold text-stone-900 dark:text-white">{selectedSchedule.partyName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-stone-600 dark:text-stone-400">Pokok Angsuran:</span>
                  <span className="font-semibold">Rp {selectedSchedule.principalAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-stone-600 dark:text-stone-400">Bunga / Jasa:</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">Rp {selectedSchedule.interestAmount.toLocaleString('id-ID')}</span>
                </div>
                {collectionType === 'LAPANGAN' && (
                  <div className="flex justify-between text-xs text-amber-800 dark:text-amber-400 font-bold">
                    <span>Biaya Jasa Petugas Lapangan:</span>
                    <span>+ Rp {fieldServiceFee.toLocaleString('id-ID')}</span>
                  </div>
                )}
                {selectedSchedule.penaltyAmount > 0 && (
                  <div className="flex justify-between text-xs text-rose-600 font-bold">
                    <span>Denda ({selectedSchedule.daysOverdue} Hari):</span>
                    <span>Rp {selectedSchedule.penaltyAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-900 flex justify-between text-sm font-extrabold text-emerald-950 dark:text-emerald-300">
                  <span>Total yang Harus Dibayar:</span>
                  <span>
                    Rp{' '}
                    {(
                      selectedSchedule.totalBill +
                      (selectedSchedule.penaltyAmount || 0) +
                      (collectionType === 'LAPANGAN' ? fieldServiceFee : 0)
                    ).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {collectionType === 'LAPANGAN' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 dark:text-stone-300">Nama Petugas Penagih / Kolektor</label>
                  <input
                    type="text"
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                    placeholder="Nama Petugas Lapangan..."
                    className="h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>
              )}

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">Metode Penyetoran Kas</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('KAS')}
                    className={`flex items-center justify-center gap-2 rounded-xl p-2.5 font-bold border transition-colors ${
                      paymentMethod === 'KAS'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Kas Tunai</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BANK')}
                    className={`flex items-center justify-center gap-2 rounded-xl p-2.5 font-bold border transition-colors ${
                      paymentMethod === 'BANK'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <Building className="h-4 w-4" />
                    <span>Transfer Bank BCA</span>
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">Catatan Transaksi</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Contoh: Titipan teller / Setoran via ATM BCA"
                  className="h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setSelectedSchedule(null)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-800 px-5 py-2 font-bold text-white hover:bg-emerald-700 shadow-xs"
                >
                  Posting Pembayaran
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
