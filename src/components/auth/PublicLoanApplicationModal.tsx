import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { AVAILABLE_TENORS, LoanCalculatorService } from '../../services/loanCalculator';
import { LoanApplication, Member } from '../../types';
import { X, CheckCircle2, AlertCircle, Send, User, DollarSign, Sparkles } from 'lucide-react';

interface PublicLoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: (nik: string) => void;
}

export const PublicLoanApplicationModal: React.FC<PublicLoanApplicationModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const [nik, setNik] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [job, setJob] = useState('');
  const [purpose, setPurpose] = useState<'MODAL_KERJA' | 'INVESTASI' | 'KONSUMTIF'>('MODAL_KERJA');
  const [purposeNotes, setPurposeNotes] = useState('');

  // Loan Amount & Tenor
  const [amount, setAmount] = useState<number>(200000);
  const [tenorUnit, setTenorUnit] = useState<'MINGGU' | 'BULAN'>('BULAN');
  const [tenorCount, setTenorCount] = useState<number>(1);
  const [guaranteeType, setGuaranteeType] = useState('KTP & Surat Keterangan Usaha (SKU)');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    applicationId: string;
    partyId: string;
    contractNumber: string;
    disbursedAmount: number;
    totalRepayment: number;
    amount: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Selected Tenor Calculation
  const selectedTenor = AVAILABLE_TENORS.find((t) => t.unit === tenorUnit && t.count === tenorCount) || AVAILABLE_TENORS[0];
  const interestRateAnnual = 60.0; // 5% flat per bulan = 60% per tahun
  const adminRate = 5.0; // 5% admin fee (e.g., Rp 10.000 untuk 200rb)

  const simulation = LoanCalculatorService.calculateLoan(
    amount,
    selectedTenor.value,
    'FLAT',
    interestRateAnnual,
    adminRate,
    tenorUnit
  );

  const totalRepaymentOffice = simulation.totalRepayment;
  const totalRepaymentField = simulation.totalRepayment + 10000;

  const handleAmountPreset = (val: number) => {
    setAmount(val);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (nik.length !== 16 || !/^\d+$/.test(nik)) {
      setErrorMsg('Nomor NIK KTP wajib 16 digit angka yang valid.');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Nama lengkap pemohon wajib diisi.');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('Nomor WhatsApp / HP wajib diisi.');
      return;
    }

    const validation = LoanCalculatorService.validateLoanAmount(amount);
    if (!validation.valid) {
      setErrorMsg(validation.message);
      return;
    }

    setSubmitting(true);

    try {
      // 1. Check or Register Member / Non-Anggota
      const existingMembers = StorageService.getMembers();
      let member = existingMembers.find((m) => m.nik === nik);

      if (!member) {
        const nextNo = (existingMembers.length + 1).toString().padStart(4, '0');
        const partyId = `NAS-${new Date().getFullYear()}-${nextNo}`;
        member = {
          partyId,
          partyType: 'NON_ANGGOTA',
          nomorIdentitasKoperasi: `NS-${nextNo}`,
          nama: name.trim(),
          nik: nik.trim(),
          jenisKelamin: 'L',
          tempatLahir: 'Bandung',
          tanggalLahir: '1990-01-01',
          pekerjaan: job.trim() || 'Wiraswasta / Pedagang',
          noHp: phone.trim(),
          email: `${name.trim().toLowerCase().replace(/\s+/g, '')}@gmail.com`,
          alamat: address.trim() || 'Alamat Domisili',
          tanggalGabung: new Date().toISOString().split('T')[0],
          status: 'AKTIF',
          simpananPokokPaid: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        StorageService.saveMembers([member, ...existingMembers]);
      }

      // 2. Register Loan Application
      const existingApps = StorageService.getLoanApplications();
      const nextAppNo = (existingApps.length + 1).toString().padStart(6, '0');
      const applicationId = `PJ-${new Date().getFullYear()}-${nextAppNo}`;
      const contractNumber = `AKD-${new Date().getFullYear()}-${nextAppNo}`;

      const newApplication: LoanApplication = {
        applicationId,
        contractNumber,
        partyId: member.partyId,
        partyName: `${member.nama} (Non-Anggota)`,
        partyType: 'NON_ANGGOTA',
        partyPhone: member.noHp,
        productId: 'PRD-PJ-001',
        productName: 'Pinjaman Mikro Cepat Non-Anggota',
        purpose,
        purposeNotes: purposeNotes || 'Pengajuan pinjaman mandiri via portal online',
        amount,
        tenorMonths: tenorUnit === 'BULAN' ? tenorCount : 1,
        tenorCount,
        tenorUnit,
        tenorLabel: selectedTenor.label,
        interestMethod: 'FLAT',
        interestRateAnnual,
        adminFee: simulation.adminFee,
        disbursedAmount: simulation.disbursedAmount,
        surveyDate: new Date().toISOString().split('T')[0],
        surveyorNotes: 'Pengajuan online mandiri oleh calon nasabah non-anggota.',
        creditScore: 'CUKUP',
        guaranteeType: guaranteeType || 'KTP & SKU',
        guaranteeEstimatedValue: amount * 2,
        status: 'MENUNGGU_PERSETUJUAN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      StorageService.saveLoanApplications([newApplication, ...existingApps]);

      // 3. Log Audit
      StorageService.addAuditLog({
        userId: member.partyId,
        userName: member.nama,
        role: 'ANGGOTA',
        action: 'CREATE',
        module: 'PINJAMAN',
        recordId: applicationId,
        status: 'SUCCESS',
        ipAddress: '127.0.0.1',
        message: `Calon nasabah ${member.nama} mengajukan pinjaman online Rp ${amount.toLocaleString('id-ID')} (${selectedTenor.label})`,
      });

      setSuccessResult({
        applicationId,
        partyId: member.partyId,
        contractNumber,
        disbursedAmount: simulation.disbursedAmount,
        totalRepayment: totalRepaymentOffice,
        amount,
      });
    } catch (err: any) {
      setErrorMsg('Gagal memproses pengajuan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-[#143d30] px-6 py-4 text-white dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-stone-950 shadow-xs">
              <Sparkles className="h-5 w-5 font-bold" />
            </div>
            <div>
              <h3 className="text-base font-bold">Pengajuan Pinjaman Online Mandiri</h3>
              <p className="text-xs text-emerald-200">
                Terbuka untuk Non-Anggota & Anggota KSP Karya Mandiri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-stone-700 dark:text-stone-300">
          {successResult ? (
            /* SUCCESS STATE */
            <div className="space-y-5 text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <div>
                <h4 className="text-lg font-black text-stone-900 dark:text-white">
                  Pengajuan Berhasil Terkirim!
                </h4>
                <p className="mt-1 text-xs text-stone-500 max-w-md mx-auto">
                  Pengajuan pinjaman Anda telah tercatat di sistem KSP Karya Mandiri dan sedang dalam tahap verifikasi komite kredit.
                </p>
              </div>

              <div className="mx-auto max-w-md rounded-2xl bg-emerald-50/80 p-4 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Nomor Registrasi Pengajuan:</span>
                  <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400">{successResult.applicationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Plafon Pinjaman:</span>
                  <span className="font-bold text-stone-900 dark:text-white">Rp {successResult.amount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Estimasi Dana Bersih Diterima:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">Rp {successResult.disbursedAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Status Saat Ini:</span>
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 font-bold text-amber-800 text-[10px]">
                    MENUNGGU PERSETUJUAN
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onSuccessLogin) onSuccessLogin(nik);
                  }}
                  className="flex-1 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                >
                  Cek Status di Portal Saya (via NIK)
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-stone-300 px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            /* APPLICATION FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Section 1: Identitas Pemohon */}
              <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200 dark:bg-stone-800/60 dark:border-stone-700 space-y-3">
                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-400">
                  <User className="h-4 w-4" />
                  <span>1. Identitas Calon Peminjam (Non-Anggota / Anggota)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-stone-700 dark:text-stone-300">
                      Nomor NIK KTP (16 Digit) *
                    </label>
                    <input
                      type="text"
                      maxLength={16}
                      required
                      value={nik}
                      onChange={(e) => setNik(e.target.value)}
                      placeholder="Contoh: 3273051408890002"
                      className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-white px-3 font-mono text-xs text-stone-900 focus:border-emerald-600 focus:outline-hidden dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 dark:text-stone-300">
                      Nama Lengkap Sesuai KTP *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Usun"
                      className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-900 focus:border-emerald-600 focus:outline-hidden dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 dark:text-stone-300">
                      Nomor WhatsApp / HP Aktif *
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0852xxxxxxxx"
                      className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-900 focus:border-emerald-600 focus:outline-hidden dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 dark:text-stone-300">
                      Pekerjaan / Usaha Saat Ini
                    </label>
                    <input
                      type="text"
                      value={job}
                      onChange={(e) => setJob(e.target.value)}
                      placeholder="Contoh: Pedagang Kelontong / Usaha Harian"
                      className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-900 focus:border-emerald-600 focus:outline-hidden dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300">
                    Alamat Domisili / Lokasi Usaha
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Jl. Pasar Baru No. 18..."
                    className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-900 focus:border-emerald-600 focus:outline-hidden dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Section 2: Plafon Pinjaman & Tenor */}
              <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200 dark:bg-stone-800/60 dark:border-stone-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-400">
                    <DollarSign className="h-4 w-4" />
                    <span>2. Nominal Pengajuan Pinjaman (Kelipatan Rp 50.000)</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                    Wajib Kelipatan 50k
                  </span>
                </div>

                <div>
                  <div className="relative">
                    <span className="absolute left-3 top-2 font-bold text-stone-500">Rp</span>
                    <input
                      type="number"
                      step={50000}
                      min={100000}
                      value={amount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setAmount(val);
                      }}
                      className="h-10 w-full rounded-xl border border-stone-200 bg-white pl-10 pr-3 font-mono text-sm font-bold text-stone-900 focus:border-emerald-600 focus:outline-hidden dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                    />
                  </div>

                  {/* Preset Fast Buttons */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[200000, 300000, 500000, 1000000, 2000000, 5000000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAmountPreset(preset)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                          amount === preset
                            ? 'bg-emerald-800 text-white'
                            : 'bg-white text-stone-700 border border-stone-200 hover:bg-emerald-50 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300'
                        }`}
                      >
                        Rp {preset >= 1000000 ? `${preset / 1000000} Jt` : `${preset / 1000} Rb`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tenor Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="font-semibold text-stone-700 dark:text-stone-300">
                      Pilihan Jenis Tenor *
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setTenorUnit('MINGGU');
                          setTenorCount(1);
                        }}
                        className={`rounded-xl py-2 text-xs font-bold border transition-colors ${
                          tenorUnit === 'MINGGU'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-stone-700 border-stone-200 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300'
                        }`}
                      >
                        ⚡ Mingguan
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTenorUnit('BULAN');
                          setTenorCount(1);
                        }}
                        className={`rounded-xl py-2 text-xs font-bold border transition-colors ${
                          tenorUnit === 'BULAN'
                            ? 'bg-emerald-800 text-white border-emerald-800'
                            : 'bg-white text-stone-700 border-stone-200 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300'
                        }`}
                      >
                        📅 Bulanan
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 dark:text-stone-300">
                      Durasi / Jangka Waktu *
                    </label>
                    <select
                      value={`${tenorUnit}-${tenorCount}`}
                      onChange={(e) => {
                        const [unit, count] = e.target.value.split('-');
                        setTenorUnit(unit as any);
                        setTenorCount(parseInt(count));
                      }}
                      className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-white px-3 font-semibold text-xs text-stone-900 focus:border-emerald-600 focus:outline-hidden dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                    >
                      {AVAILABLE_TENORS.filter((t) => t.unit === tenorUnit).map((t) => (
                        <option key={`${t.unit}-${t.count}`} value={`${t.unit}-${t.count}`}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Ringkasan Simulasi Otomatis */}
              <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900 space-y-2">
                <div className="font-bold text-emerald-950 dark:text-emerald-300 flex items-center justify-between">
                  <span>Kalkulasi Otomatis Pinjaman</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    Tenor: {selectedTenor.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200 dark:border-emerald-900 text-xs">
                  <div>
                    <span className="text-stone-600 dark:text-stone-400">Plafon Pokok:</span>
                    <div className="font-bold text-stone-900 dark:text-white">
                      Rp {amount.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-600 dark:text-stone-400">Biaya Admin (5%):</span>
                    <div className="font-bold text-rose-600">
                      - Rp {simulation.adminFee.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-600 dark:text-stone-400">Total Diterima Bersih:</span>
                    <div className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                      Rp {simulation.disbursedAmount.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-600 dark:text-stone-400">Bunga / Jasa Pinjaman:</span>
                    <div className="font-bold text-stone-800 dark:text-stone-200">
                      Rp {simulation.totalInterest.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                {/* Dua Opsi Pengembalian */}
                <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-900 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-xl bg-white p-2 border border-emerald-300 dark:bg-stone-900 dark:border-stone-700">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300">🏢 Bayar di Kantor:</span>
                    <div className="font-black text-xs text-stone-900 dark:text-white mt-0.5">
                      Rp {totalRepaymentOffice.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="rounded-xl bg-white p-2 border border-amber-300 dark:bg-stone-900 dark:border-stone-700">
                    <span className="font-bold text-amber-900 dark:text-amber-400">🛵 Jasa Petugas Lapangan:</span>
                    <div className="font-black text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                      Rp {totalRepaymentField.toLocaleString('id-ID')} <span className="font-normal text-[10px] text-stone-500">(+10k)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-stone-200 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-800 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Pinjaman'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
