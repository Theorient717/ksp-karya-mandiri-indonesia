import React, { useState, useMemo } from 'react';
import { StorageService } from '../../services/storage';
import { LoanCalculatorService, AVAILABLE_TENORS } from '../../services/loanCalculator';
import { AccountingEngine } from '../../services/accountingEngine';
import { LoanApplication, LoanProduct, Member } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ReceiptModal, ReceiptData } from '../common/ReceiptModal';
import {
  Wallet,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  DollarSign,
  ShieldCheck,
  Eye,
  Check,
  X,
  Printer,
  ChevronRight,
} from 'lucide-react';

export const LoanView: React.FC = () => {
  const { currentUser, hasRole } = useAuth();
  const [loans, setLoans] = useState<LoanApplication[]>(() => StorageService.getLoanApplications());
  const [members] = useState<Member[]>(() => StorageService.getMembers());
  const [products] = useState<LoanProduct[]>(() => StorageService.getLoanProducts());

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);

  // Receipt Modal
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Application Form State
  const [applyForm, setApplyForm] = useState({
    partyId: members[0]?.partyId || '',
    productId: products[0]?.productId || '',
    amount: 5000000,
    tenorKey: '12_BULAN',
    purpose: 'MODAL_KERJA' as LoanApplication['purpose'],
    purposeNotes: '',
    guaranteeType: 'BPKB Kendaraan Bermotor',
    guaranteeEstimatedValue: 15000000,
    guarantorName: '',
    guarantorPhone: '',
  });

  // Strict multiple of 50.000 rule validation
  const amountValidation = useMemo(() => {
    return LoanCalculatorService.validateLoanAmount(applyForm.amount);
  }, [applyForm.amount]);

  // Selected product details
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.productId === applyForm.productId) || products[0];
  }, [products, applyForm.productId]);

  // Submit new application
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountValidation.valid) {
      alert(amountValidation.message);
      return;
    }

    const member = members.find((m) => m.partyId === applyForm.partyId);
    if (!member) {
      alert('Pilih anggota/nasabah valid!');
      return;
    }

    const tenorInfo = AVAILABLE_TENORS.find((t) => t.value === applyForm.tenorKey) || {
      value: '12_BULAN',
      label: '12 Bulan (1 Tahun)',
      count: 12,
      unit: 'BULAN' as const,
      equivalentMonths: 12,
    };

    const year = new Date().getFullYear();
    const nextSeq = String(loans.length + 1).padStart(6, '0');
    const applicationId = `PJ-${year}-${nextSeq}`;

    const adminFee = Math.round(applyForm.amount * (selectedProduct.adminFeePercentage / 100));
    const disbursedAmount = applyForm.amount - adminFee;

    const newLoan: LoanApplication = {
      applicationId,
      partyId: member.partyId,
      partyName: member.nama,
      partyType: member.partyType,
      partyPhone: member.noHp,
      productId: selectedProduct.productId,
      productName: selectedProduct.productName,
      purpose: applyForm.purpose,
      purposeNotes: applyForm.purposeNotes,
      amount: applyForm.amount,
      tenorMonths: tenorInfo.equivalentMonths,
      tenorCount: tenorInfo.count,
      tenorUnit: tenorInfo.unit,
      tenorLabel: tenorInfo.label,
      interestMethod: selectedProduct.interestMethod,
      interestRateAnnual: selectedProduct.interestRateAnnual,
      adminFee,
      disbursedAmount,
      guaranteeType: applyForm.guaranteeType,
      guaranteeEstimatedValue: applyForm.guaranteeEstimatedValue,
      guarantorName: applyForm.guarantorName,
      guarantorPhone: applyForm.guarantorPhone,
      status: 'MENUNGGU_PERSETUJUAN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newLoan, ...loans];
    setLoans(updated);
    StorageService.saveLoanApplications(updated);

    StorageService.addAuditLog({
      userId: currentUser?.userId || 'SYSTEM',
      userName: currentUser?.name || 'Admin',
      role: currentUser?.role || 'LOAN_OFFICER',
      module: 'PINJAMAN',
      action: 'CREATE',
      recordId: applicationId,
      status: 'SUCCESS',
      ipAddress: '127.0.0.1',
      message: `Pengajuan pinjaman baru ${applicationId} an ${member.nama} sebesar Rp ${applyForm.amount.toLocaleString('id-ID')} (${tenorInfo.label})`,
    });

    setShowApplyModal(false);
  };

  // Approve Loan
  const handleApprove = (loan: LoanApplication) => {
    const year = new Date().getFullYear();
    const nextSeq = (loan.applicationId || '').replace(/[^0-9]/g, '').slice(-6) || '000001';
    const contractNumber = `AKD-${year}-${nextSeq}`;

    const updated = loans.map((l) => {
      if (l.applicationId === loan.applicationId) {
        return {
          ...l,
          status: 'APPROVED' as const,
          contractNumber,
          approvedAmount: l.amount,
          approvedBy: currentUser?.name || 'Pimpinan Komite',
          approvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return l;
    });

    setLoans(updated);
    StorageService.saveLoanApplications(updated);

    StorageService.addAuditLog({
      userId: currentUser?.userId || 'SYSTEM',
      userName: currentUser?.name || 'Pimpinan',
      role: 'PIMPINAN',
      module: 'PINJAMAN',
      action: 'APPROVE',
      recordId: loan.applicationId,
      status: 'SUCCESS',
      ipAddress: '127.0.0.1',
      message: `Persetujuan pinjaman ${loan.applicationId} nomor akad ${contractNumber} disetujui`,
    });

    setShowApproveModal(false);
    setSelectedLoan(null);
  };

  // Disburse Loan
  const handleDisburse = (loan: LoanApplication, method: 'KAS' | 'BANK') => {
    const updatedLoans = loans.map((l) => {
      if (l.applicationId === loan.applicationId) {
        return {
          ...l,
          status: 'DISBURSED' as const,
          disbursedAt: new Date().toISOString(),
          disbursedMethod: method,
          disbursedBy: currentUser?.name || 'Kasir',
          updatedAt: new Date().toISOString(),
        };
      }
      return l;
    });

    setLoans(updatedLoans);
    StorageService.saveLoanApplications(updatedLoans);

    // 1. Generate Installment Schedule
    const calc = LoanCalculatorService.calculateLoan(
      loan.amount,
      loan.tenorLabel || loan.tenorMonths,
      loan.interestMethod,
      loan.interestRateAnnual,
      1.0,
      loan.tenorUnit
    );

    const newSchedules = LoanCalculatorService.generateInstallmentSchedules(
      loan.contractNumber || `AKD-${loan.applicationId}`,
      loan.applicationId,
      loan.partyId,
      loan.partyName,
      new Date(),
      calc
    );

    const existingSchedules = StorageService.getInstallmentSchedules();
    StorageService.saveInstallmentSchedules([...newSchedules, ...existingSchedules]);

    // 2. Automatic Double-Entry Journal Posting!
    const journal = AccountingEngine.postLoanDisbursement({
      loanId: loan.applicationId,
      contractNumber: loan.contractNumber || loan.applicationId,
      partyName: loan.partyName,
      principalAmount: loan.amount,
      adminFee: loan.adminFee,
      disbursedAmount: loan.disbursedAmount,
      paymentMethod: method,
      userId: currentUser?.userId || 'USR-KASIR',
      userName: currentUser?.name || 'Kasir Utama',
    });

    // 3. Open Receipt Modal for printing
    setReceiptData({
      title: 'BUKTI PENCAIRAN PINJAMAN KREDIT',
      receiptNumber: loan.contractNumber || loan.applicationId,
      date: new Date().toISOString().split('T')[0],
      partyName: loan.partyName,
      partyId: loan.partyId,
      partyPhone: loan.partyPhone,
      transactionType: 'Pencairan Pinjaman Kredit Anggota',
      amount: loan.disbursedAmount,
      paymentMethod: method === 'BANK' ? 'Transfer Bank BCA' : 'Kas Tunai Kasir',
      details: [
        { label: 'Plafon Pinjaman Disetujui', value: `Rp ${loan.amount.toLocaleString('id-ID')}` },
        { label: 'Potongan Provisi & Admin', value: `Rp ${loan.adminFee.toLocaleString('id-ID')}` },
        { label: 'Jangka Waktu (Tenor)', value: loan.tenorLabel || (loan.tenorUnit === 'MINGGU' ? `${loan.tenorCount} Minggu` : `${loan.tenorMonths} Bulan`) },
        { label: 'Suku Bunga / Jasa', value: `${loan.interestRateAnnual}% per tahun (${loan.interestMethod})` },
        { label: 'No. Jurnal Akuntansi', value: journal.journalId },
      ],
      notes: `Agunan: ${loan.guaranteeType || '-'}`,
      servedBy: currentUser?.name || 'Kasir',
    });

    setShowDisburseModal(false);
    setSelectedLoan(null);
  };

  const filteredLoans = loans.filter((l) => {
    const matchSearch =
      l.partyName.toLowerCase().includes(search.toLowerCase()) ||
      l.applicationId.toLowerCase().includes(search.toLowerCase()) ||
      (l.contractNumber && l.contractNumber.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getTenorDisplay = (loan: LoanApplication) => {
    if (loan.tenorLabel) return loan.tenorLabel;
    if (loan.tenorUnit === 'MINGGU') return `${loan.tenorCount} Minggu`;
    return `${loan.tenorMonths} Bulan`;
  };

  const weeklyTenors = AVAILABLE_TENORS.filter((t) => t.unit === 'MINGGU');
  const monthlyTenors = AVAILABLE_TENORS.filter((t) => t.unit === 'BULAN');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 dark:text-white">
            Portofolio Pinjaman & Pembiayaan
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Pengajuan kredit, approval komite, pencairan dana, dan cetak akad perjanjian kredit.
          </p>
        </div>

        {hasRole(['SUPER_ADMIN', 'LOAN_OFFICER', 'PIMPINAN']) && (
          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Pengajuan Pinjaman Baru</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari No Akad, Nama, No Pengajuan..."
            className="h-9 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
          />
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2 overflow-x-auto">
          <span className="text-xs font-semibold text-stone-500 shrink-0">Status:</span>
          {['ALL', 'MENUNGGU_PERSETUJUAN', 'APPROVED', 'DISBURSED', 'LUNAS'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-emerald-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
              }`}
            >
              {st === 'ALL' ? 'Semua' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Loans Table */}
      <div className="rounded-2xl border border-stone-200/80 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:bg-stone-800/60 dark:text-stone-400 border-b border-stone-200/80 dark:border-stone-800">
              <tr>
                <th className="py-3 px-4">No. Kontrak / ID</th>
                <th className="py-3 px-4">Peminjam</th>
                <th className="py-3 px-4">Produk & Bunga</th>
                <th className="py-3 px-4 text-right">Plafon Pinjaman</th>
                <th className="py-3 px-4">Tenor</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredLoans.map((l) => (
                <tr key={l.applicationId} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-emerald-800 dark:text-emerald-400">
                      {l.contractNumber || l.applicationId}
                    </div>
                    <div className="text-[10px] text-stone-400 font-mono">{l.applicationId}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-stone-900 dark:text-white">{l.partyName}</div>
                    <div className="text-[10px] text-stone-500">{l.partyId} • {l.partyPhone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-stone-800 dark:text-stone-200">{l.productName}</div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                      {l.interestMethod} • {l.interestRateAnnual}% p.a.
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="font-extrabold text-stone-900 dark:text-white">
                      Rp {l.amount.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      Kelipatan Rp 50.000 ✓
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block rounded-md bg-stone-100 px-2 py-0.5 font-bold text-stone-800 dark:bg-stone-800 dark:text-stone-200">
                      {getTenorDisplay(l)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        l.status === 'DISBURSED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : l.status === 'APPROVED'
                          ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                          : l.status === 'MENUNGGU_PERSETUJUAN'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* Approval button if Pimpinan */}
                      {l.status === 'MENUNGGU_PERSETUJUAN' && hasRole(['SUPER_ADMIN', 'PIMPINAN']) && (
                        <button
                          onClick={() => {
                            setSelectedLoan(l);
                            setShowApproveModal(true);
                          }}
                          className="rounded-lg bg-emerald-800 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700"
                        >
                          Review & Setujui
                        </button>
                      )}

                      {/* Disbursement button if Approved and Kasir/Admin */}
                      {l.status === 'APPROVED' && hasRole(['SUPER_ADMIN', 'KASIR', 'PIMPINAN']) && (
                        <button
                          onClick={() => {
                            setSelectedLoan(l);
                            setShowDisburseModal(true);
                          }}
                          className="rounded-lg bg-sky-700 px-2.5 py-1 text-xs font-bold text-white hover:bg-sky-600"
                        >
                          Cairkan Dana
                        </button>
                      )}

                      {/* View Detail Button */}
                      <button
                        onClick={() => setSelectedLoan(l)}
                        className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Loan Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200 bg-emerald-900 px-6 py-4 text-white dark:border-stone-800">
              <div>
                <h3 className="text-sm font-bold">Formulir Pengajuan Pinjaman Kredit</h3>
                <p className="text-[11px] text-emerald-200">
                  Tersedia Tenor Mingguan (1-4 Minggu) dan Bulanan (1-48 Bulan)
                </p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="rounded-lg p-1.5 text-emerald-200 hover:bg-emerald-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Borrower Selector */}
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300">Peminjam (Anggota / Nasabah)</label>
                  <select
                    value={applyForm.partyId}
                    onChange={(e) => setApplyForm({ ...applyForm, partyId: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 font-semibold text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  >
                    {members.map((m) => (
                      <option key={m.partyId} value={m.partyId}>
                        {m.nama} ({m.partyId} - {m.partyType})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Selector */}
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300">Pilihan Produk Pinjaman</label>
                  <select
                    value={applyForm.productId}
                    onChange={(e) => setApplyForm({ ...applyForm, productId: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 font-semibold text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  >
                    {products.map((p) => (
                      <option key={p.productId} value={p.productId}>
                        {p.productName} ({p.interestMethod} - {p.interestRateAnnual}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Loan Amount with Strict Multiple of 50k Check */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-stone-700 dark:text-stone-300 flex justify-between">
                    <span>Nominal Pengajuan Pinjaman (Rp)</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">*Wajib Kelipatan 50.000</span>
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2.5 font-bold text-stone-400">Rp</span>
                    <input
                      type="number"
                      step="50000"
                      required
                      value={applyForm.amount || ''}
                      onChange={(e) => setApplyForm({ ...applyForm, amount: Number(e.target.value) })}
                      className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-3 font-bold text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                      placeholder="Contoh: 5.000.000"
                    />
                  </div>

                  {/* Stepper buttons */}
                  <div className="flex gap-1.5 pt-1.5">
                    {[50000, 500000, 1000000, 5000000].map((step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => setApplyForm({ ...applyForm, amount: (applyForm.amount || 0) + step })}
                        className="rounded-md border border-stone-200 bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-700 hover:bg-emerald-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                      >
                        +{step.toLocaleString('id-ID')}
                      </button>
                    ))}
                  </div>

                  {/* Validation Feedback */}
                  <div className="pt-1">
                    {amountValidation.valid ? (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{amountValidation.message}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{amountValidation.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tenor Selection with Weekly and Monthly Options */}
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300">Jangka Waktu (Tenor)</label>
                  <select
                    value={applyForm.tenorKey}
                    onChange={(e) => setApplyForm({ ...applyForm, tenorKey: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 font-semibold text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  >
                    <optgroup label="⚡ Tenor Mingguan">
                      {weeklyTenors.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="📅 Tenor Bulanan">
                      {monthlyTenors.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Purpose */}
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300">Tujuan Penggunaan Dana</label>
                  <select
                    value={applyForm.purpose}
                    onChange={(e) => setApplyForm({ ...applyForm, purpose: e.target.value as any })}
                    className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 font-semibold text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  >
                    <option value="MODAL_KERJA">Modal Kerja Usaha</option>
                    <option value="PRODUKTIF">Pembelian Alat / Produktif</option>
                    <option value="INVESTASI">Investasi / Renovasi</option>
                    <option value="KONSUMTIF">Kebutuhan Konsumtif</option>
                    <option value="PENDIDIKAN">Biaya Pendidikan</option>
                  </select>
                </div>

                {/* Guarantee Info */}
                <div className="sm:col-span-2 space-y-2 rounded-xl bg-stone-50 p-3 border border-stone-200 dark:bg-stone-800 dark:border-stone-700">
                  <span className="font-bold text-stone-800 dark:text-stone-200">Informasi Jaminan / Agunan</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Jenis Agunan (misal: BPKB Motor Honda 2022)"
                      value={applyForm.guaranteeType}
                      onChange={(e) => setApplyForm({ ...applyForm, guaranteeType: e.target.value })}
                      className="h-8 rounded-lg border border-stone-200 bg-white px-2 text-xs text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="Estimasi Nilai Taksiran Agunan (Rp)"
                      value={applyForm.guaranteeEstimatedValue || ''}
                      onChange={(e) => setApplyForm({ ...applyForm, guaranteeEstimatedValue: Number(e.target.value) })}
                      className="h-8 rounded-lg border border-stone-200 bg-white px-2 text-xs text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!amountValidation.valid}
                  className="rounded-xl bg-emerald-800 px-5 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Kirim Pengajuan Pinjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="border-b border-stone-200 bg-emerald-900 px-6 py-4 text-white dark:border-stone-800">
              <h3 className="text-sm font-bold">Persetujuan Komite Kredit Pinjaman</h3>
              <p className="text-xs text-emerald-200">
                Putusan Pengajuan No. {selectedLoan.applicationId}
              </p>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="rounded-xl bg-stone-50 p-3 border border-stone-200 dark:bg-stone-800 dark:border-stone-700 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-stone-500">Peminjam:</span>
                  <span className="text-stone-900 dark:text-white font-bold">{selectedLoan.partyName}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-stone-500">Plafon Diajukan:</span>
                  <span className="text-emerald-800 dark:text-emerald-400 font-extrabold">
                    Rp {selectedLoan.amount.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-stone-500">Tenor:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {getTenorDisplay(selectedLoan)} ({selectedLoan.interestMethod})
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-stone-500">Agunan:</span>
                  <span>{selectedLoan.guaranteeType}</span>
                </div>
              </div>

              <div className="text-[11px] text-stone-500">
                Dengan menyetujui pengajuan ini, sistem akan otomatis menerbitkan Nomor Akad Kredit resmi dan mempersiapkan jadwal amortisasi angsuran.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApproveModal(false)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(selectedLoan)}
                  className="rounded-xl bg-emerald-800 px-5 py-2 font-bold text-white hover:bg-emerald-700"
                >
                  Setujui Pinjaman (Approve)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disburse Modal */}
      {showDisburseModal && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="border-b border-stone-200 bg-emerald-900 px-6 py-4 text-white dark:border-stone-800">
              <h3 className="text-sm font-bold">Eksekusi Pencairan Dana Pinjaman</h3>
              <p className="text-xs text-emerald-200">
                Akad No. {selectedLoan.contractNumber}
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
                  Dana Cair Bersih (Net Disbursement)
                </span>
                <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200">
                  Rp {selectedLoan.disbursedAmount.toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] text-stone-500">
                  Plafon: Rp {selectedLoan.amount.toLocaleString('id-ID')} - Admin: Rp {selectedLoan.adminFee.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-stone-700 dark:text-stone-300">
                  Pilih Saluran Pengeluaran Dana Kas / Bank:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDisburse(selectedLoan, 'BANK')}
                    className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-stone-50 p-3 hover:bg-emerald-50 hover:border-emerald-600 dark:bg-stone-800 dark:border-stone-700"
                  >
                    <span className="font-bold text-stone-900 dark:text-white">Transfer Bank BCA</span>
                    <span className="text-[10px] text-stone-400">Rekening Koperasi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDisburse(selectedLoan, 'KAS')}
                    className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-stone-50 p-3 hover:bg-emerald-50 hover:border-emerald-600 dark:bg-stone-800 dark:border-stone-700"
                  >
                    <span className="font-bold text-stone-900 dark:text-white">Kas Tunai Kasir</span>
                    <span className="text-[10px] text-stone-400">Ambil di Teller</span>
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-stone-400 italic">
                *Pencairan akan langsung memotong kas/bank, menerbitkan jurnal umum double-entry, dan mencetak kwitansi resmi.
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisburseModal(false)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                >
                  Batal
                </button>
              </div>
            </div>
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
