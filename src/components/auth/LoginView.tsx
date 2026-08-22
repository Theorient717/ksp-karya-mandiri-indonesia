import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Lock, CreditCard, ShieldCheck, CheckCircle2, ArrowRight, User, Building2, Sparkles, HelpCircle } from 'lucide-react';
import { KspLogo } from '../common/KspLogo';
import { PublicLoanApplicationModal } from './PublicLoanApplicationModal';

interface LoginViewProps {
  onOpenDeployGuide?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = () => {
  const { login, verify2FaCode, is2FaPending, error, clearError } = useAuth();
  const [loginMode, setLoginMode] = useState<'member' | 'staff'>('member');
  const [nikInput, setNikInput] = useState('3273011204850001');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPublicApplyModal, setShowPublicApplyModal] = useState(false);

  const demoMembers = [
    {
      nik: '3273051408890002',
      name: 'Usun (Nasabah Non-Anggota)',
      partyType: 'NON_ANGGOTA',
      desc: 'Pinjaman Rp200rb (Cair Rp190rb, Tagihan Rp210rb / Lapangan Rp220rb)',
    },
    {
      nik: '3273011204850001',
      name: 'Budi Santoso, S.T.',
      partyType: 'ANGGOTA',
      desc: 'Pinjaman Rp15jt (Bayar 6x, Sisa 6x, Ada Denda)',
    },
    {
      nik: '3273026508880003',
      name: 'Hj. Siti Nurhaliza',
      partyType: 'ANGGOTA',
      desc: 'Pinjaman Rp50jt & Deposito SiJangka Rp25jt',
    },
    {
      nik: '3273031502920005',
      name: 'Ahmad Fauzi, M.Kom.',
      partyType: 'ANGGOTA',
      desc: 'Pengajuan Baru Rp25jt (Menunggu Approval)',
    },
  ];

  const demoStaffRoles: Array<{ role: UserRole; name: string; username: string; desc: string }> = [
    { role: 'SUPER_ADMIN', name: 'Rian Pratama', username: 'admin', desc: 'Akses Penuh Seluruh Sistem' },
    { role: 'PIMPINAN', name: 'Drs. H. Bambang', username: 'pimpinan', desc: 'Approval Kredit & Laporan SHU' },
    { role: 'LOAN_OFFICER', name: 'Siti Nurhaliza', username: 'officer', desc: 'Survey & Pengajuan Pinjaman' },
    { role: 'KASIR', name: 'Dewi Lestari', username: 'kasir', desc: 'Pencairan, Angsuran, Setoran' },
    { role: 'AKUNTING', name: 'Hendri Gunawan', username: 'akunting', desc: 'Jurnal Umum, Neraca, PHU' },
    { role: 'PAJAK', name: 'Bayu Saputra', username: 'pajak', desc: 'PPh Final 4(2), e-SPT' },
  ];

  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    await login(nikInput, undefined, 'ANGGOTA');
    setLoading(false);
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);

    if (showTwoFactor || is2FaPending) {
      const verified = verify2FaCode(twoFactorCode || '123456');
      if (!verified) {
        alert('Kode 2FA tidak valid. Masukkan 6 digit angka.');
      }
      setLoading(false);
      return;
    }

    const result = await login(username, password);
    if (result.requires2Fa) {
      setShowTwoFactor(true);
    }
    setLoading(false);
  };

  const handleQuickMemberSelect = async (nik: string) => {
    clearError();
    setNikInput(nik);
    setLoading(true);
    await login(nik, undefined, 'ANGGOTA');
    setLoading(false);
  };

  const handleQuickStaffLogin = async (demoUser: string) => {
    clearError();
    setUsername(demoUser);
    setPassword('admin123');
    setLoading(true);
    const result = await login(demoUser, 'admin123');
    if (result.requires2Fa) {
      verify2FaCode('123456');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-stone-100 dark:bg-stone-950 items-center justify-center p-4">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        {/* Left Side: Brand presentation with Official Logo */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-between bg-[#143d30] p-8 text-white">
          <div>
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs border border-white/15 inline-block mb-4 shadow-sm">
              <KspLogo size="lg" inverted={true} />
            </div>
            <p className="text-xs text-emerald-200/90 font-medium mt-1">
              Sistem Koperasi Simpan Pinjam Terintegrasi Indonesia
            </p>
          </div>

          <div className="space-y-3 text-xs text-emerald-100/80 my-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Portal Mandiri Nasabah: Akses Riwayat & Kartu via NIK</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Non-Anggota & Anggota Dapat Mengajukan Pinjaman Langsung</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Arsitektur 10 Google Spreadsheet Multi-Database Real-Time</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Aturan Pinjaman Wajib Kelipatan Rp 50.000</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Buku Besar Otomatis Berpasangan (Double Entry)</span>
            </div>
          </div>

          <div className="text-[11px] text-emerald-300/50 pt-2 border-t border-emerald-900/60">
            © 2026 KSP Karya Mandiri Indonesia • AHU-001234.AH.01.26
          </div>
        </div>

        {/* Right Side: Login & Online Application Form */}
        <div className="flex w-full md:w-1/2 flex-col justify-center p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-stone-900 dark:text-white">
                Masuk ke Sistem KSP
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Pilih jenis akses akun Anda di bawah ini.
              </p>
            </div>
            {/* Mobile Logo Only */}
            <div className="md:hidden">
              <KspLogo size="sm" showText={false} />
            </div>
          </div>

          {/* Banner Ajukan Pinjaman Online Mandiri (Non-Anggota / Calon Nasabah) */}
          <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-amber-500/10 p-3 border border-amber-300 dark:border-amber-700/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-stone-950 font-bold shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <div className="text-xs font-bold text-stone-900 dark:text-white">
                  Belum Terdaftar / Ingin Pinjam?
                </div>
                <div className="text-[10px] text-stone-600 dark:text-stone-400">
                  Ajukan mandiri (Non-Anggota / Anggota)
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPublicApplyModal(true)}
              className="shrink-0 rounded-xl bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-bold text-stone-950 transition-colors shadow-xs"
            >
              Ajukan Online
            </button>
          </div>

          {/* Tab Selector: Anggota / Nasabah (NIK) vs Petugas (Staff) */}
          <div className="flex rounded-xl bg-stone-100 p-1 dark:bg-stone-800">
            <button
              type="button"
              onClick={() => {
                setLoginMode('member');
                clearError();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMode === 'member'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Portal Nasabah & Anggota (NIK)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('staff');
                clearError();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMode === 'staff'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Petugas / Pengurus KSP</span>
            </button>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
              {error}
            </div>
          )}

          {/* MODE 1: LOGIN ANGGOTA / NASABAH (MENGGUNAKAN NIK KTP 16 DIGIT) */}
          {loginMode === 'member' ? (
            <form onSubmit={handleMemberLogin} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300">
                  Nomor Induk Kependudukan (NIK KTP 16 Digit)
                </label>
                <div className="relative mt-1">
                  <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                  <input
                    type="text"
                    required
                    value={nikInput}
                    onChange={(e) => setNikInput(e.target.value)}
                    placeholder="Contoh: 3273051408890002"
                    className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 font-mono text-sm tracking-wider text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>
                <p className="mt-1 text-[11px] text-stone-500">
                  Masukkan NIK untuk melihat kartu pinjaman, jadwal angsuran, sisa tagihan, & status pengajuan.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <span>{loading ? 'Memeriksa Data NIK...' : 'Buka Laporan & Kartu Saya'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Quick Sample Members Selector */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  Pilih Contoh Nasabah / Anggota untuk Uji Coba:
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {demoMembers.map((m) => (
                    <button
                      key={m.nik}
                      type="button"
                      onClick={() => handleQuickMemberSelect(m.nik)}
                      className="w-full flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-2 text-left hover:bg-emerald-50 hover:border-emerald-400 dark:border-stone-700 dark:bg-stone-800/60 dark:hover:bg-emerald-950/40 transition-colors"
                    >
                      <div className="truncate">
                        <div className="font-bold text-stone-900 dark:text-white text-[11px]">
                          {m.name}
                        </div>
                        <div className="text-[10px] text-stone-500 truncate">
                          {m.desc}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0 ml-2">
                        {m.nik.slice(0, 6)}...
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            /* MODE 2: LOGIN PETUGAS / PENGURUS */
            <form onSubmit={handleStaffLogin} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300">Username / ID Pegawai</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300">Kata Sandi</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>
              </div>

              {showTwoFactor && (
                <div>
                  <label className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Kode Otentikasi 2FA (Demo: 123456)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="123456"
                    className="mt-1 h-10 w-full rounded-xl border border-emerald-300 bg-emerald-50 px-3 font-mono text-sm tracking-widest text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:bg-emerald-950/40 dark:text-white dark:border-emerald-700"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <span>{loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Quick Demo Staff Selector */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  Akses Cepat Petugas:
                </span>
                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {demoStaffRoles.map((d) => (
                    <button
                      key={d.role}
                      type="button"
                      onClick={() => handleQuickStaffLogin(d.username)}
                      className="flex flex-col items-start rounded-xl border border-stone-200 bg-stone-50 p-1.5 text-left hover:bg-emerald-50 hover:border-emerald-400 dark:border-stone-700 dark:bg-stone-800/60 dark:hover:bg-emerald-950/40 transition-colors"
                    >
                      <div className="font-bold text-stone-900 dark:text-white text-[11px] truncate w-full">
                        {d.name}
                      </div>
                      <div className="text-[9px] font-semibold text-emerald-800 dark:text-emerald-400 uppercase">
                        {d.role}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Public Online Loan Application Modal */}
      <PublicLoanApplicationModal
        isOpen={showPublicApplyModal}
        onClose={() => setShowPublicApplyModal(false)}
        onSuccessLogin={(registeredNik) => {
          handleQuickMemberSelect(registeredNik);
        }}
      />
    </div>
  );
};
