import React, { useState } from 'react';
import {
  Github,
  Globe,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  Server,
  Cloud,
  FileCode,
  Laptop
} from 'lucide-react';

export const DeployGuideModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between bg-stone-900 p-6 text-white dark:bg-black border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white font-bold shadow-inner">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-wide">
                Panduan Deploy Frontend (GitHub & Vercel)
              </h2>
              <p className="text-xs text-stone-400">
                100% Gratis, Super Ringan, dan Online dalam 3 Menit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-3 border-b border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-950/60 text-xs font-bold">
          <button
            onClick={() => setActiveStep(1)}
            className={`flex items-center justify-center gap-2 py-3.5 border-b-2 transition-all ${
              activeStep === 1
                ? 'border-emerald-600 bg-white text-emerald-800 dark:bg-stone-900 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400'
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              1
            </span>
            <span>Upload ke GitHub</span>
          </button>
          <button
            onClick={() => setActiveStep(2)}
            className={`flex items-center justify-center gap-2 py-3.5 border-b-2 transition-all ${
              activeStep === 2
                ? 'border-emerald-600 bg-white text-emerald-800 dark:bg-stone-900 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400'
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              2
            </span>
            <span>Sambungkan ke Vercel</span>
          </button>
          <button
            onClick={() => setActiveStep(3)}
            className={`flex items-center justify-center gap-2 py-3.5 border-b-2 transition-all ${
              activeStep === 3
                ? 'border-emerald-600 bg-white text-emerald-800 dark:bg-stone-900 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400'
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              3
            </span>
            <span>Selesai & Tips Cepat</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
          {/* STEP 1 */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/60">
                <h3 className="font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  Langkah 1: Buat Repository di GitHub
                </h3>
                <p className="mt-1 text-emerald-800/90 dark:text-emerald-300/80">
                  GitHub bertindak sebagai brankas kode sumber aplikasi Anda secara gratis dan aman.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-200 font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                    A
                  </span>
                  <div>
                    <p className="font-bold text-stone-900 dark:text-white">
                      Buka GitHub dan Buat Repository Baru:
                    </p>
                    <p className="text-stone-500 mt-0.5">
                      Buka <strong>github.com/new</strong>, isi nama repository misalnya: <code className="bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded font-mono text-emerald-700 dark:text-emerald-400">ksp-karyamandiri</code> (pilih opsi <em>Public</em> atau <em>Private</em>), lalu klik <strong>Create repository</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-200 font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                    B
                  </span>
                  <div className="w-full">
                    <p className="font-bold text-stone-900 dark:text-white">
                      Jalankan Perintah Git di Komputer Anda:
                    </p>
                    <p className="text-stone-500 mt-0.5 mb-2">
                      Buka terminal/command prompt di dalam folder project ini, lalu salin perintah berikut:
                    </p>
                    <div className="relative rounded-xl bg-stone-900 p-4 font-mono text-emerald-400 text-xs shadow-inner">
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `git init\ngit add .\ngit commit -m "feat: first release KSP Karya Mandiri"\ngit branch -M main\ngit remote add origin https://github.com/USERNAME_ANDA/ksp-karyamandiri.git\ngit push -u origin main`,
                            'git-cmd'
                          )
                        }
                        className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-stone-800 px-2.5 py-1 text-[11px] font-sans font-bold text-stone-300 hover:bg-stone-700"
                      >
                        {copiedId === 'git-cmd' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedId === 'git-cmd' ? 'Tersalin' : 'Salin Perintah'}</span>
                      </button>
                      <pre className="overflow-x-auto whitespace-pre-wrap pr-16 leading-relaxed">
{`git init
git add .
git commit -m "feat: first release KSP Karya Mandiri"
git branch -M main
git remote add origin https://github.com/USERNAME_ANDA/ksp-karyamandiri.git
git push -u origin main`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveStep(2)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 font-bold text-white hover:bg-emerald-700"
                >
                  <span>Lanjut ke Langkah 2: Hubungkan Vercel</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-sky-50/70 p-4 border border-sky-200 dark:bg-sky-950/30 dark:border-sky-800/60">
                <h3 className="font-extrabold text-sky-900 dark:text-sky-300 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Langkah 2: Hubungkan Repository ke Vercel (Auto Deploy)
                </h3>
                <p className="mt-1 text-sky-800/90 dark:text-sky-300/80">
                  Vercel akan meng-compile aplikasi React & Vite ini ke dalam CDN global super kencang.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-200 font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                    1
                  </span>
                  <div>
                    <p className="font-bold text-stone-900 dark:text-white">
                      Login ke Vercel dengan Akun GitHub:
                    </p>
                    <p className="text-stone-500 mt-0.5">
                      Buka <strong>vercel.com</strong>, klik <strong>Sign Up / Log In</strong> dan pilih opsi <strong>Continue with GitHub</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-200 font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                    2
                  </span>
                  <div>
                    <p className="font-bold text-stone-900 dark:text-white">
                      Import Repository:
                    </p>
                    <p className="text-stone-500 mt-0.5">
                      Pada dashboard Vercel, klik tombol <strong>"Add New..." → "Project"</strong>. Cari repository <code className="bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded font-mono text-emerald-700 dark:text-emerald-400">ksp-karyamandiri</code> lalu klik <strong>"Import"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-200 font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                    3
                  </span>
                  <div>
                    <p className="font-bold text-stone-900 dark:text-white">
                      Konfigurasi Build (Otomatis Terdeteksi):
                    </p>
                    <ul className="mt-1 list-disc pl-4 text-stone-500 space-y-1">
                      <li>Framework Preset: <strong>Vite</strong></li>
                      <li>Build Command: <strong>npm run build</strong></li>
                      <li>Output Directory: <strong>dist</strong></li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-200 font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                    4
                  </span>
                  <div>
                    <p className="font-bold text-stone-900 dark:text-white">
                      Klik "Deploy":
                    </p>
                    <p className="text-stone-500 mt-0.5">
                      Tunggu sekitar 30–45 detik hingga kembang api muncul. Website Anda kini live di URL gratis seperti: <code className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded font-mono">https://ksp-karyamandiri.vercel.app</code>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setActiveStep(1)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300"
                >
                  Kembali
                </button>
                <button
                  onClick={() => setActiveStep(3)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 font-bold text-white hover:bg-emerald-700"
                >
                  <span>Lanjut ke Langkah 3: Tips & Optimasi</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-amber-50/70 p-4 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/60">
                <h3 className="font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Mengapa Setup Ini Menjawab Kebutuhan Anda?
                </h3>
                <p className="mt-1 text-amber-800/90 dark:text-amber-300/80">
                  Hanya dengan GitHub + Vercel, seluruh sistem KSP ini bekerja tanpa perlu server database berbayar!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 dark:border-stone-800 dark:bg-stone-800/40">
                  <div className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Bisa Hanya GitHub + Vercel Saja?
                  </div>
                  <p className="text-stone-500">
                    <strong>BISA SEKALI!</strong> Seluruh antarmuka portal anggota, cek angsuran via NIK, kalkulator simulasi pinjaman, dan kuitansi cetak sudah otomatis berjalan di Vercel menggunakan local persistence bawaan browser.
                  </p>
                </div>

                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 dark:border-stone-800 dark:bg-stone-800/40">
                  <div className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Otomatis Update Setiap Ada Perubahan
                  </div>
                  <p className="text-stone-500">
                    Setiap kali Anda mengedit kode di GitHub (atau melakukan <code className="font-mono text-[11px]">git push</code>), Vercel akan otomatis meng-update website secara instan tanpa perlu setting ulang.
                  </p>
                </div>
              </div>

              {/* vercel.json configuration badge */}
              <div className="rounded-xl bg-stone-900 p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-emerald-400 font-bold">
                    ✓ File vercel.json Sudah Siap di Project Anda
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                    SPA Router Ready
                  </span>
                </div>
                <p className="text-stone-400 text-[11px]">
                  File konfigurasi <code>vercel.json</code> sudah otomatis dibuatkan di root project untuk memastikan reload halaman (Single Page App) tidak error 404 dan file aset di-cache secara maksimal.
                </p>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setActiveStep(2)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300"
                >
                  Kembali
                </button>
                <button
                  onClick={onClose}
                  className="rounded-xl bg-emerald-800 px-6 py-2.5 font-bold text-white hover:bg-emerald-700"
                >
                  Tutup Panduan & Mulai Gunakan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
