import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';
import { Member, LoanApplication, InstallmentSchedule, SavingsTransaction } from '../../types';
import {
  User,
  Wallet,
  PiggyBank,
  CalendarCheck2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  CreditCard,
  Phone,
  MapPin,
  ShieldCheck,
  Download,
  Receipt,
  Eye,
  Percent,
  X,
} from 'lucide-react';

export const MemberPortalView: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedReceipt, setSelectedReceipt] = useState<InstallmentSchedule | null>(null);
  const [activeTab, setActiveTab] = useState<'loans' | 'savings' | 'profile'>('loans');

  // Find the member record corresponding to currentUser
  const members = useMemo(() => StorageService.getMembers(), []);
  const allLoans = useMemo(() => StorageService.getLoanApplications(), []);
  const allSchedules = useMemo(() => StorageService.getInstallmentSchedules(), []);
  const allSavingsTxs = useMemo(() => StorageService.getSavingsTransactions(), []);

  const currentMember: Member | undefined = useMemo(() => {
    if (!currentUser) return members[0];
    if (currentUser.partyId) {
      const found = members.find((m) => m.partyId === currentUser.partyId);
      if (found) return found;
    }
    if (currentUser.nik) {
      const found = members.find((m) => m.nik.replace(/[^0-9]/g, '') === currentUser.nik?.replace(/[^0-9]/g, ''));
      if (found) return found;
    }
    // Fallback: match by username or default first
    const byUser = members.find((m) => m.partyId.toLowerCase() === currentUser.username.toLowerCase() || m.nik === currentUser.username);
    return byUser || members[0];
  }, [currentUser, members]);

  const memberPartyId = currentMember?.partyId || 'ANG-2026-000001';

  // Strictly filter only data belonging to THIS member
  const memberLoans = useMemo(() => {
    return allLoans.filter((l) => l.partyId === memberPartyId);
  }, [allLoans, memberPartyId]);

  const memberSchedules = useMemo(() => {
    return allSchedules.filter((s) => s.partyId === memberPartyId);
  }, [allSchedules, memberPartyId]);

  const memberSavingsTxs = useMemo(() => {
    return allSavingsTxs.filter((tx) => tx.partyId === memberPartyId);
  }, [allSavingsTxs, memberPartyId]);

  // Compute Loan Totals
  const loanStats = useMemo(() => {
    const totalBorrowed = memberLoans.reduce((sum, l) => sum + l.amount, 0);
    const paidSchedules = memberSchedules.filter((s) => s.status === 'LUNAS');
    const unpaidSchedules = memberSchedules.filter((s) => s.status !== 'LUNAS');
    const overdueSchedules = memberSchedules.filter((s) => s.status === 'TERLAMBAT');

    const totalPaidAmount = memberSchedules.reduce((sum, s) => sum + s.totalPaid, 0);
    const totalPrincipalPaid = memberSchedules.reduce((sum, s) => sum + s.principalPaid, 0);
    
    // Remaining Principal (Baki Debet)
    const remainingPrincipal = Math.max(0, totalBorrowed - totalPrincipalPaid);

    // Remaining Unpaid Total Bill
    const totalRemainingBill = unpaidSchedules.reduce((sum, s) => sum + (s.totalBill - s.totalPaid) + s.penaltyAmount, 0);
    const totalPenalty = memberSchedules.reduce((sum, s) => sum + s.penaltyAmount, 0);

    const paidCount = paidSchedules.length;
    const totalCount = memberSchedules.length;
    const remainingCount = unpaidSchedules.length;
    const progressPercent = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

    return {
      totalBorrowed,
      remainingPrincipal,
      totalPaidAmount,
      totalRemainingBill,
      totalPenalty,
      paidCount,
      totalCount,
      remainingCount,
      progressPercent,
      overdueCount: overdueSchedules.length,
    };
  }, [memberLoans, memberSchedules]);

  // Compute Savings Balance Breakdown
  const savingsStats = useMemo(() => {
    let pokok = 0;
    let wajib = 0;
    let sukarela = 0;
    let berjangka = 0;

    memberSavingsTxs.forEach((tx) => {
      const multiplier = tx.type === 'PENARIKAN' || tx.type === 'BIAYA_ADMIN' ? -1 : 1;
      if (tx.productCode === 'POKOK') pokok += tx.amount * multiplier;
      else if (tx.productCode === 'WAJIB') wajib += tx.amount * multiplier;
      else if (tx.productCode === 'SUKARELA') sukarela += tx.amount * multiplier;
      else if (tx.productCode === 'BERJANGKA') berjangka += tx.amount * multiplier;
    });

    const totalSaldo = pokok + wajib + sukarela + berjangka;

    return { pokok, wajib, sukarela, berjangka, totalSaldo };
  }, [memberSavingsTxs]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card with Member Identity */}
      <div className="rounded-3xl border border-stone-200/80 bg-linear-to-r from-emerald-900 to-emerald-950 p-6 text-white shadow-xl dark:border-stone-800">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-700/80 text-2xl font-black text-white shadow-inner">
              {currentMember?.nama ? currentMember.nama.charAt(0) : 'A'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-wide">
                  {currentMember?.nama || 'Anggota KSP'}
                </h1>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                  {currentMember?.partyType === 'ANGGOTA' ? 'Anggota Resmi' : 'Nasabah Non-Anggota'}
                </span>
                <span className="rounded-full bg-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-white">
                  {currentMember?.status || 'AKTIF'}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2 text-xs text-emerald-200/90">
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-emerald-400 font-bold">NIK (KTP):</span>
                  <span>{currentMember?.nik || '-'}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-emerald-400 font-bold">No. Anggota:</span>
                  <span>{currentMember?.nomorIdentitasKoperasi || currentMember?.partyId}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{currentMember?.noHp || '-'}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate max-w-xs">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{currentMember?.alamat || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-xs hover:bg-white/20 transition-all border border-white/20 shadow-xs"
            >
              <Printer className="h-4 w-4 text-emerald-300" />
              <span>Cetak Rekap Pribadi</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex gap-2 border-t border-emerald-800/60 pt-4">
          <button
            onClick={() => setActiveTab('loans')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'loans'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-200 hover:bg-emerald-800/60'
            }`}
          >
            <Wallet className="h-4 w-4" />
            <span>Laporan Pinjaman & Angsuran</span>
          </button>
          <button
            onClick={() => setActiveTab('savings')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'savings'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-200 hover:bg-emerald-800/60'
            }`}
          >
            <PiggyBank className="h-4 w-4" />
            <span>Buku Tabungan Simpanan</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-200 hover:bg-emerald-800/60'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Data Identitas Diri</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LAPORAN PINJAMAN & ANGSURAN PRIBADI (SESUAI REQUEST USER) */}
      {activeTab === 'loans' && (
        <div className="space-y-6">
          {/* 4 Summary Metric Cards (Pinjaman, Sudah Bayar Berapa Kali, Sisa Pokok, Sisa Tunggakan) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Besaran Meminjam */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400">
                <span>Total Pinjaman (Plafon)</span>
                <Wallet className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-xl font-extrabold text-stone-900 dark:text-white">
                Rp {loanStats.totalBorrowed.toLocaleString('id-ID')}
              </div>
              <div className="mt-1 text-[11px] font-medium text-stone-500">
                {memberLoans.length} Berkas Pinjaman Terdaftar
              </div>
            </div>

            {/* 2. Sisa Pokok Pinjaman (Baki Debet) */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400">
                <span>Sisa Pokok (Baki Debet)</span>
                <Clock className="h-4 w-4 text-sky-600" />
              </div>
              <div className="mt-2 text-xl font-extrabold text-sky-700 dark:text-sky-400">
                Rp {loanStats.remainingPrincipal.toLocaleString('id-ID')}
              </div>
              <div className="mt-1 text-[11px] font-medium text-stone-500">
                Pokok hutang yang belum lunas
              </div>
            </div>

            {/* 3. Sudah Berapa Kali Membayar (Progress Angsuran) */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400">
                <span>Progres Pembayaran</span>
                <CalendarCheck2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {loanStats.paidCount} / {loanStats.totalCount}
                <span className="text-xs font-bold text-stone-400 ml-1.5">Kali ({loanStats.progressPercent}%)</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{loanStats.remainingCount} Angsuran tersisa</span>
              </div>
            </div>

            {/* 4. Sisa Tagihan & Tunggakan */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400">
                <span>Sisa Tagihan Belum Dibayar</span>
                <AlertTriangle className={`h-4 w-4 ${loanStats.overdueCount > 0 ? 'text-rose-500' : 'text-amber-500'}`} />
              </div>
              <div className={`mt-2 text-xl font-extrabold ${loanStats.overdueCount > 0 ? 'text-rose-600' : 'text-stone-900 dark:text-white'}`}>
                Rp {loanStats.totalRemainingBill.toLocaleString('id-ID')}
              </div>
              <div className="mt-1 text-[11px] font-semibold text-stone-500">
                {loanStats.overdueCount > 0 ? (
                  <span className="text-rose-500">Ada {loanStats.overdueCount} tagihan terlambat</span>
                ) : (
                  <span className="text-emerald-600">Status angsuran lancar</span>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Loans Overview & Amortization Table */}
          {memberLoans.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-stone-800 dark:bg-stone-900">
              <Wallet className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-600 mb-3" />
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                Belum Ada Catatan Pinjaman Aktif
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                Anda belum memiliki riwayat pengajuan pinjaman di KSP Karya Mandiri. Hubungi Loan Officer atau kunjungi kantor koperasi untuk mengajukan pinjaman.
              </p>
            </div>
          ) : (
            memberLoans.map((loan) => {
              const loanSchedules = memberSchedules.filter((s) => s.contractId === loan.contractNumber || s.applicationId === loan.applicationId);
              const totalPaid = loanSchedules.reduce((sum, s) => sum + s.totalPaid, 0);
              const paidInstallments = loanSchedules.filter((s) => s.status === 'LUNAS').length;

              return (
                <div
                  key={loan.applicationId}
                  className="rounded-2xl border border-stone-200/80 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900 overflow-hidden"
                >
                  {/* Loan Header Bar */}
                  <div className="flex flex-col gap-3 bg-stone-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-800 dark:text-emerald-400 font-mono">
                          {loan.contractNumber || loan.applicationId}
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {loan.productName}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          loan.status === 'DISBURSED' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {loan.status === 'DISBURSED' ? 'PINJAMAN BERJALAN' : loan.status}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-stone-500">
                        Metode Bunga: <strong className="text-stone-700 dark:text-stone-300">{loan.interestMethod} ({loan.interestRateAnnual}%/thn)</strong> • Tenor: <strong className="text-stone-700 dark:text-stone-300">{loan.tenorLabel || (loan.tenorUnit === 'MINGGU' ? `${loan.tenorCount} Minggu` : `${loan.tenorMonths} Bulan`)}</strong> • Tujuan: <strong className="text-stone-700 dark:text-stone-300">{loan.purpose}</strong>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-stone-400">Plafon Cair</div>
                      <div className="text-base font-extrabold text-stone-900 dark:text-white">
                        Rp {loan.amount.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  {/* Installment Schedule Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50/50 text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:bg-stone-900 dark:text-stone-400 border-b border-stone-100 dark:border-stone-800">
                        <tr>
                          <th className="px-4 py-3">Ke</th>
                          <th className="px-4 py-3">Jatuh Tempo</th>
                          <th className="px-4 py-3 text-right">Pokok</th>
                          <th className="px-4 py-3 text-right">Bunga</th>
                          <th className="px-4 py-3 text-right">Total Tagihan</th>
                          <th className="px-4 py-3 text-right">Jumlah Dibayar</th>
                          <th className="px-4 py-3 text-right">Denda</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-center">Kuitansi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-medium">
                        {loanSchedules.map((sch) => {
                          const isPaid = sch.status === 'LUNAS';
                          const isOverdue = sch.status === 'TERLAMBAT';

                          return (
                            <tr
                              key={sch.installmentId}
                              className={`transition-colors ${
                                isPaid
                                  ? 'bg-emerald-50/20 hover:bg-emerald-50/40 dark:bg-emerald-950/10'
                                  : isOverdue
                                  ? 'bg-rose-50/30 hover:bg-rose-50/50 dark:bg-rose-950/20'
                                  : 'hover:bg-stone-50 dark:hover:bg-stone-800/40'
                              }`}
                            >
                              <td className="px-4 py-3 font-bold text-stone-900 dark:text-white">
                                #{sch.installmentNo}
                              </td>
                              <td className="px-4 py-3 font-mono text-stone-600 dark:text-stone-300">
                                {sch.dueDate}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-stone-700 dark:text-stone-300">
                                Rp {sch.principalAmount.toLocaleString('id-ID')}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-stone-700 dark:text-stone-300">
                                Rp {sch.interestAmount.toLocaleString('id-ID')}
                              </td>
                              <td className="px-4 py-3 text-right font-bold font-mono text-stone-900 dark:text-white">
                                Rp {sch.totalBill.toLocaleString('id-ID')}
                              </td>
                              <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                {sch.totalPaid > 0 ? `Rp ${sch.totalPaid.toLocaleString('id-ID')}` : '-'}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-rose-600">
                                {sch.penaltyAmount > 0 ? `Rp ${sch.penaltyAmount.toLocaleString('id-ID')}` : '-'}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                                    isPaid
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : isOverdue
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                      : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                                  }`}
                                >
                                  {isPaid && <CheckCircle2 className="h-3 w-3" />}
                                  {isOverdue && <AlertTriangle className="h-3 w-3" />}
                                  {sch.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {isPaid ? (
                                  <button
                                    onClick={() => setSelectedReceipt(sch)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-50 dark:bg-stone-800 dark:border-emerald-700 dark:text-emerald-300 shadow-2xs"
                                  >
                                    <Receipt className="h-3 w-3" />
                                    <span>Kuitansi</span>
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-stone-400">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Footer for this Loan */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-100 dark:border-stone-800 text-xs">
                    <div className="font-semibold text-stone-600 dark:text-stone-400">
                      Progres: <strong className="text-emerald-700 dark:text-emerald-400">{paidInstallments} dari {loanSchedules.length} Kali Angsuran Lunas</strong> ({Math.round((paidInstallments / (loanSchedules.length || 1)) * 100)}%)
                    </div>
                    <div className="mt-1 sm:mt-0 font-bold text-stone-900 dark:text-white">
                      Total Dana Sudah Dibayarkan: <span className="text-emerald-700 dark:text-emerald-400">Rp {totalPaid.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: BUKU TABUNGAN & SIMPANAN PRIBADI */}
      {activeTab === 'savings' && (
        <div className="space-y-6">
          {/* Savings Balance Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50/50 p-4 shadow-xs dark:border-emerald-800 dark:bg-emerald-950/30">
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Total Seluruh Saldo</div>
              <div className="mt-2 text-xl font-black text-emerald-900 dark:text-white">
                Rp {savingsStats.totalSaldo.toLocaleString('id-ID')}
              </div>
              <div className="mt-1 text-[10px] text-emerald-700 dark:text-emerald-400">Simpanan Aman Terjamin</div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <div className="text-xs font-bold text-stone-500">Simpanan Pokok</div>
              <div className="mt-2 text-lg font-extrabold text-stone-900 dark:text-white">
                Rp {savingsStats.pokok.toLocaleString('id-ID')}
              </div>
              <div className="mt-1 text-[10px] text-stone-400">Penyertaan Modal Anggota</div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <div className="text-xs font-bold text-stone-500">Simpanan Wajib</div>
              <div className="mt-2 text-lg font-extrabold text-stone-900 dark:text-white">
                Rp {savingsStats.wajib.toLocaleString('id-ID')}
              </div>
              <div className="mt-1 text-[10px] text-stone-400">Iuran Bulanan Anggota</div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <div className="text-xs font-bold text-stone-500">Simpanan Sukarela</div>
              <div className="mt-2 text-lg font-extrabold text-stone-900 dark:text-white">
                Rp {savingsStats.sukarela.toLocaleString('id-ID')}
              </div>
              <div className="mt-1 text-[10px] text-stone-400">Bunga 4.5% p.a (Bisa ditarik)</div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <div className="text-xs font-bold text-stone-500">SiJangka (Deposito)</div>
              <div className="mt-2 text-lg font-extrabold text-stone-900 dark:text-white">
                Rp {savingsStats.berjangka.toLocaleString('id-ID')}
              </div>
              <div className="mt-1 text-[10px] text-stone-400">Bagi Hasil 7.0% p.a</div>
            </div>
          </div>

          {/* Savings Mutation Table */}
          <div className="rounded-2xl border border-stone-200/80 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900 overflow-hidden">
            <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                  Buku Tabungan & Riwayat Mutasi Simpanan
                </h3>
                <p className="text-[11px] text-stone-500">Daftar transaksi setoran, penarikan, dan bagi hasil bunga.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:bg-stone-800/60 dark:text-stone-400 border-b border-stone-100 dark:border-stone-800">
                  <tr>
                    <th className="px-4 py-3">No. Transaksi</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Jenis Simpanan</th>
                    <th className="px-4 py-3">Tipe Mutasi</th>
                    <th className="px-4 py-3 text-right">Nominal</th>
                    <th className="px-4 py-3 text-right">Saldo Akhir</th>
                    <th className="px-4 py-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-medium">
                  {memberSavingsTxs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-400 text-xs">
                        Belum ada mutasi simpanan tercatat.
                      </td>
                    </tr>
                  ) : (
                    memberSavingsTxs.map((tx) => {
                      const isDeposit = tx.type === 'SETORAN' || tx.type === 'BUNGA';
                      return (
                        <tr key={tx.transactionId} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                          <td className="px-4 py-3 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                            {tx.transactionId}
                          </td>
                          <td className="px-4 py-3 font-mono text-stone-600 dark:text-stone-300">
                            {new Date(tx.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-800 dark:bg-stone-800 dark:text-stone-300">
                              {tx.productCode}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isDeposit ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-right font-mono font-bold ${isDeposit ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'}`}>
                            {isDeposit ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-stone-900 dark:text-white">
                            Rp {tx.balanceAfter.toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-stone-500 text-[11px] truncate max-w-xs">
                            {tx.notes}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROFIL & LEGALITAS ANGGOTA */}
      {activeTab === 'profile' && (
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                Data Lengkap Keanggotaan KSP
              </h3>
              <p className="text-xs text-stone-500">
                Terverifikasi secara resmi sesuai catatan Kemenkop & KSP Karya Mandiri
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
              <span>e-KTP Terverifikasi</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <div>
                <label className="text-stone-400 font-semibold">Nama Lengkap</label>
                <div className="text-sm font-bold text-stone-900 dark:text-white mt-0.5">{currentMember?.nama}</div>
              </div>
              <div>
                <label className="text-stone-400 font-semibold">Nomor Induk Kependudukan (NIK)</label>
                <div className="text-sm font-bold font-mono text-stone-900 dark:text-white mt-0.5">{currentMember?.nik}</div>
              </div>
              <div>
                <label className="text-stone-400 font-semibold">Nomor Pokok Wajib Pajak (NPWP)</label>
                <div className="text-sm font-mono text-stone-800 dark:text-stone-200 mt-0.5">{currentMember?.npwp || 'Tidak Ada NPWP (Potongan 20% lebih tinggi)'}</div>
              </div>
              <div>
                <label className="text-stone-400 font-semibold">Tempat, Tanggal Lahir</label>
                <div className="text-sm text-stone-800 dark:text-stone-200 mt-0.5">{currentMember?.tempatLahir}, {currentMember?.tanggalLahir}</div>
              </div>
              <div>
                <label className="text-stone-400 font-semibold">Pekerjaan</label>
                <div className="text-sm text-stone-800 dark:text-stone-200 mt-0.5">{currentMember?.pekerjaan}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-stone-400 font-semibold">Nomor Telepon / WhatsApp</label>
                <div className="text-sm font-bold text-stone-900 dark:text-white mt-0.5">{currentMember?.noHp}</div>
              </div>
              <div>
                <label className="text-stone-400 font-semibold">Alamat Domisili</label>
                <div className="text-sm text-stone-800 dark:text-stone-200 mt-0.5">{currentMember?.alamat}</div>
              </div>
              <div>
                <label className="text-stone-400 font-semibold">Tanggal Terdaftar Masuk Koperasi</label>
                <div className="text-sm font-mono text-stone-800 dark:text-stone-200 mt-0.5">{currentMember?.tanggalGabung}</div>
              </div>
              <div>
                <label className="text-stone-400 font-semibold">Status Simpanan Pokok Awal</label>
                <div className="text-sm font-bold text-emerald-600 mt-0.5">
                  {currentMember?.simpananPokokPaid ? '✓ LUNAS (Rp 100.000)' : 'Belum Lunas'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kuitansi / Bukti Pembayaran Modal Modal Pop-up */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                  Kuitansi Pembayaran Angsuran Resmi
                </h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="rounded-full p-1 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Printable Receipt Body */}
            <div className="my-4 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 dark:border-stone-700 dark:bg-stone-950/60 text-xs space-y-3">
              <div className="text-center pb-3 border-b border-stone-200 dark:border-stone-800">
                <h4 className="font-extrabold text-stone-900 dark:text-white uppercase tracking-wider">
                  KSP KARYA MANDIRI INDONESIA
                </h4>
                <p className="text-[10px] text-stone-500">
                  Bukti Penerimaan Angsuran Cicilan Pinjaman
                </p>
                <div className="mt-1 font-mono text-[11px] font-bold text-emerald-800 dark:text-emerald-400">
                  Ref: {selectedReceipt.paymentRefId || `BYR-${selectedReceipt.installmentId}`}
                </div>
              </div>

              <div className="space-y-1.5 text-stone-700 dark:text-stone-300">
                <div className="flex justify-between">
                  <span className="text-stone-400">Nama Peminjam:</span>
                  <span className="font-bold text-stone-900 dark:text-white">{currentMember?.nama}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-stone-400">NIK (KTP):</span>
                  <span>{currentMember?.nik}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-stone-400">No. Kontrak Pinjaman:</span>
                  <span>{selectedReceipt.contractId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Angsuran Ke:</span>
                  <span className="font-bold text-emerald-700">#{selectedReceipt.installmentNo}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-stone-400">Tanggal Bayar:</span>
                  <span>{selectedReceipt.paidAt || selectedReceipt.dueDate}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-1">
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Pokok Pinjaman:</span>
                  <span className="font-mono">Rp {selectedReceipt.principalPaid.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Bunga Pinjaman:</span>
                  <span className="font-mono">Rp {selectedReceipt.interestPaid.toLocaleString('id-ID')}</span>
                </div>
                {selectedReceipt.penaltyPaid > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Denda Keterlambatan:</span>
                    <span className="font-mono">Rp {selectedReceipt.penaltyPaid.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-stone-900 dark:text-white pt-2 border-t border-stone-200 dark:border-stone-800">
                  <span>TOTAL DIBAYAR:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono">
                    Rp {selectedReceipt.totalPaid.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-center text-[10px] text-stone-400">
                Status: <strong>LUNAS TERCATAT SISTEM</strong> • Terima kasih atas pembayaran Anda tepat waktu.
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300"
              >
                Tutup
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Kuitansi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
