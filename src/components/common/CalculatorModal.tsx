import React, { useState, useMemo } from 'react';
import { LoanCalculatorService, AVAILABLE_TENORS } from '../../services/loanCalculator';
import { LoanInterestMethod } from '../../types';
import { X, Calculator, AlertCircle, CheckCircle2, Printer } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState<number>(5000000);
  const [selectedTenorVal, setSelectedTenorVal] = useState<string>('12_BULAN');
  const [method, setMethod] = useState<LoanInterestMethod>('FLAT');
  const [interestRate, setInterestRate] = useState<number>(12);
  const [adminFeePct, setAdminFeePct] = useState<number>(1.0);

  // Validation
  const validation = useMemo(() => {
    return LoanCalculatorService.validateLoanAmount(amount);
  }, [amount]);

  // Calculation
  const result = useMemo(() => {
    if (!validation.valid) return null;
    try {
      return LoanCalculatorService.calculateLoan(amount, selectedTenorVal, method, interestRate, adminFeePct);
    } catch {
      return null;
    }
  }, [amount, selectedTenorVal, method, interestRate, adminFeePct, validation]);

  if (!isOpen) return null;

  const quickSteps = [50000, 500000, 1000000, 5000000];

  const weeklyTenors = AVAILABLE_TENORS.filter((t) => t.unit === 'MINGGU');
  const monthlyTenors = AVAILABLE_TENORS.filter((t) => t.unit === 'BULAN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-emerald-900 px-6 py-4 text-white dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Kalkulator Simulasi Pinjaman KSP (Mingguan & Bulanan)</h2>
              <p className="text-xs text-emerald-200">
                Aturan Wajib: Nominal Pinjaman Harus Merupakan Kelipatan <span className="font-extrabold text-amber-300">Rp 50.000</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-emerald-200 hover:bg-emerald-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Amount */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Nominal Pinjaman (Rp) <span className="text-emerald-700 dark:text-emerald-400">*Kelipatan 50k</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-400">Rp</span>
                <input
                  type="number"
                  step="50000"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-3 text-sm font-bold text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  placeholder="Contoh: 5.000.000"
                />
              </div>

              {/* Quick Stepper Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-stone-400 self-center">Tambah:</span>
                {quickSteps.map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setAmount((prev) => (prev || 0) + step)}
                    className="rounded-md border border-stone-200 bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-700 hover:bg-emerald-100 hover:border-emerald-300 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                  >
                    +{step.toLocaleString('id-ID')}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmount(5000000)}
                  className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                >
                  Reset 5 Juta
                </button>
              </div>

              {/* Validation Feedback */}
              <div className="pt-1">
                {validation.valid ? (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>{validation.message}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{validation.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Metode Bunga / Jasa
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as LoanInterestMethod)}
                className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-bold text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
              >
                <option value="FLAT">FLAT (Cicilan Tetap)</option>
                <option value="EFEKTIF">EFEKTIF (Bunga Menurun)</option>
                <option value="ANUITAS">ANUITAS (Angsuran Rata)</option>
              </select>
            </div>

            {/* Tenor Selection with Weekly and Monthly Options */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Pilihan Tenor (Minggu / Bulan)
              </label>
              <select
                value={selectedTenorVal}
                onChange={(e) => setSelectedTenorVal(e.target.value)}
                className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-bold text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
              >
                <optgroup label="⚡ Tenor Mingguan (Pinjaman Mikro)">
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
          </div>

          {/* Result Cards Summary */}
          {result && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200/80 dark:bg-emerald-950/20 dark:border-emerald-900/40">
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
                  Angsuran per {result.tenorUnit === 'MINGGU' ? 'Minggu' : 'Bulan'}
                </span>
                <p className="text-base font-extrabold text-emerald-900 dark:text-emerald-200">
                  Rp {result.installmentPerPeriod.toLocaleString('id-ID')}
                </p>
                <span className="text-[10px] text-stone-500 dark:text-stone-400">
                  {result.tenorUnit === 'MINGGU'
                    ? `Bunga: ${(result.interestRateAnnual / 52).toFixed(2)}%/mgg`
                    : `Bunga: ${(result.interestRateAnnual / 12).toFixed(2)}%/bln`}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
                  Dana Cair Bersih
                </span>
                <p className="text-base font-extrabold text-stone-900 dark:text-white">
                  Rp {result.disbursedAmount.toLocaleString('id-ID')}
                </p>
                <span className="text-[10px] text-stone-500 dark:text-stone-400">
                  Pot. Admin: Rp {result.adminFee.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
                  Total Bunga / Jasa
                </span>
                <p className="text-base font-extrabold text-stone-900 dark:text-white">
                  Rp {result.totalInterest.toLocaleString('id-ID')}
                </p>
                <span className="text-[10px] text-stone-500 dark:text-stone-400">
                  Total {result.tenorLabel}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
                  Total Pengembalian
                </span>
                <p className="text-base font-extrabold text-stone-900 dark:text-white">
                  Rp {result.totalRepayment.toLocaleString('id-ID')}
                </p>
                <span className="text-[10px] text-stone-500 dark:text-stone-400">
                  Pokok + Bunga
                </span>
              </div>
            </div>
          )}

          {/* Schedule Table */}
          {result && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  Simulasi Tabel Jadwal Angsuran Amortisasi ({method} - {result.tenorLabel})
                </h3>
                <span className="text-[11px] text-stone-500">
                  {result.schedule.length} Kali Pembayaran
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                    <tr>
                      <th className="py-2.5 px-3 font-bold">
                        {result.tenorUnit === 'MINGGU' ? 'Minggu ke' : 'Bulan ke'}
                      </th>
                      <th className="py-2.5 px-3 font-bold text-right">Angsuran Pokok</th>
                      <th className="py-2.5 px-3 font-bold text-right">Bunga / Jasa</th>
                      <th className="py-2.5 px-3 font-bold text-right">Total Tagihan</th>
                      <th className="py-2.5 px-3 font-bold text-right">Sisa Pokok</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {result.schedule.map((row) => (
                      <tr
                        key={row.installmentNo}
                        className="hover:bg-stone-50 dark:hover:bg-stone-800/50"
                      >
                        <td className="py-2 px-3 font-semibold text-stone-700 dark:text-stone-300">
                          {result.tenorUnit === 'MINGGU' ? `Minggu ke-${row.installmentNo}` : `Bulan ke-${row.installmentNo}`}
                        </td>
                        <td className="py-2 px-3 text-right text-stone-800 dark:text-stone-200">
                          Rp {row.principalAmount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-700 dark:text-emerald-400 font-medium">
                          Rp {row.interestAmount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-stone-900 dark:text-white">
                          Rp {row.totalBill.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-right text-stone-500 dark:text-stone-400">
                          Rp {row.remainingPrincipal.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-6 py-3 dark:border-stone-800 dark:bg-stone-900">
          <div className="text-[11px] text-stone-500">
            *Hasil perhitungan merupakan estimasi dan mengikat setelah akad kredit disetujui.
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Hasil</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
