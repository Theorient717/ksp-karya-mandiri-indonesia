import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { Member, PartyType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Plus,
  Filter,
  UserCheck,
  UserX,
  Phone,
  Mail,
  MapPin,
  FileText,
  Edit2,
  CheckCircle,
  X,
  Printer,
} from 'lucide-react';

export const MemberView: React.FC = () => {
  const { currentUser } = useAuth();
  const [members, setMembers] = useState<Member[]>(() => StorageService.getMembers());
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // New Member Form State
  const [formData, setFormData] = useState({
    partyType: 'ANGGOTA' as PartyType,
    nama: '',
    nik: '',
    npwp: '',
    jenisKelamin: 'L' as 'L' | 'P',
    tempatLahir: '',
    tanggalLahir: '',
    pekerjaan: '',
    noHp: '',
    email: '',
    alamat: '',
    simpananPokokPaid: true,
  });

  const filteredMembers = members.filter((m) => {
    const matchSearch =
      m.nama.toLowerCase().includes(search.toLowerCase()) ||
      m.nik.includes(search) ||
      m.partyId.toLowerCase().includes(search.toLowerCase()) ||
      m.noHp.includes(search);
    const matchType = filterType === 'ALL' || m.partyType === filterType;
    return matchSearch && matchType;
  });

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.nik) {
      alert('Nama dan NIK wajib diisi!');
      return;
    }

    const year = new Date().getFullYear();
    const isMember = formData.partyType === 'ANGGOTA';
    const prefix = isMember ? 'ANG' : 'NAS';
    const nextSeq = String(members.filter((m) => m.partyType === formData.partyType).length + 1).padStart(6, '0');
    const partyId = `${prefix}-${year}-${nextSeq}`;
    const noIdentitas = isMember ? `KM-${nextSeq.slice(-4)}` : `NS-${nextSeq.slice(-4)}`;

    const newMember: Member = {
      partyId,
      partyType: formData.partyType,
      nomorIdentitasKoperasi: noIdentitas,
      nama: formData.nama,
      nik: formData.nik,
      npwp: formData.npwp,
      jenisKelamin: formData.jenisKelamin,
      tempatLahir: formData.tempatLahir || 'Bandung',
      tanggalLahir: formData.tanggalLahir || '1990-01-01',
      pekerjaan: formData.pekerjaan || 'Wiraswasta',
      noHp: formData.noHp,
      email: formData.email,
      alamat: formData.alamat,
      tanggalGabung: new Date().toISOString().split('T')[0],
      status: 'AKTIF',
      simpananPokokPaid: isMember ? formData.simpananPokokPaid : false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newMember, ...members];
    setMembers(updated);
    StorageService.saveMembers(updated);

    StorageService.addAuditLog({
      userId: currentUser?.userId || 'SYSTEM',
      userName: currentUser?.name || 'Admin',
      role: currentUser?.role || 'SUPER_ADMIN',
      module: 'ANGGOTA',
      action: 'CREATE',
      recordId: partyId,
      status: 'SUCCESS',
      ipAddress: '127.0.0.1',
      message: `Pendaftaran ${formData.partyType} baru ${newMember.nama} (${partyId})`,
    });

    setShowAddModal(false);
    setFormData({
      partyType: 'ANGGOTA',
      nama: '',
      nik: '',
      npwp: '',
      jenisKelamin: 'L',
      tempatLahir: '',
      tanggalLahir: '',
      pekerjaan: '',
      noHp: '',
      email: '',
      alamat: '',
      simpananPokokPaid: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 dark:text-white">
            Data Anggota & Non-Anggota (Party Registry)
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Pemisahan identitas anggota resmi (ANG) dan nasabah eksternal (NAS) dengan nomor unik terpusat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak PDF</span>
          </button>
          <button
            onClick={() => {
              const headers = ['PARTY_ID', 'JENIS', 'NOMOR_ANGGOTA', 'NAMA_LENGKAP', 'NIK', 'NPWP', 'NO_HP', 'PEKERJAAN', 'ALAMAT', 'TANGGAL_GABUNG', 'STATUS'];
              const rows = filteredMembers.map(m => [
                `"${m.partyId}"`,
                `"${m.partyType}"`,
                `"${m.nomorIdentitasKoperasi || ''}"`,
                `"${m.nama}"`,
                `"${m.nik}"`,
                `"${m.npwp || ''}"`,
                `"${m.noHp}"`,
                `"${m.pekerjaan || ''}"`,
                `"${m.alamat || ''}"`,
                `"${m.tanggalGabung}"`,
                `"${m.status}"`
              ]);
              const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
              const link = document.createElement('a');
              link.setAttribute('href', encodeURI(csvContent));
              link.setAttribute('download', `LAPORAN_ANGGOTA_KSP_${filterType}_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
          >
            <FileText className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Anggota / Nasabah</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, NIK, ID Anggota, No HP..."
            className="h-9 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-stone-400 shrink-0" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-9 rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-semibold text-stone-700 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          >
            <option value="ALL">Semua Jenis Keanggotaan</option>
            <option value="ANGGOTA">Anggota Resmi (ANG)</option>
            <option value="NON_ANGGOTA">Non-Anggota / Nasabah (NAS)</option>
            <option value="CALON_ANGGOTA">Calon Anggota</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-700 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-300">
              <tr>
                <th className="py-3 px-4 font-bold">ID / No Anggota</th>
                <th className="py-3 px-4 font-bold">Nama Lengkap & NIK</th>
                <th className="py-3 px-4 font-bold">Jenis / Status</th>
                <th className="py-3 px-4 font-bold">Kontak & Email</th>
                <th className="py-3 px-4 font-bold">Simpanan Pokok</th>
                <th className="py-3 px-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredMembers.map((m) => (
                <tr key={m.partyId} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400">
                      {m.partyId}
                    </span>
                    <div className="text-[10px] text-stone-400 font-medium">{m.nomorIdentitasKoperasi}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-stone-900 dark:text-white">{m.nama}</div>
                    <div className="text-[10px] text-stone-500 font-mono">NIK: {m.nik}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        m.partyType === 'ANGGOTA'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      }`}
                    >
                      {m.partyType}
                    </span>
                    <div className="text-[10px] text-stone-400 mt-0.5">Gabung: {m.tanggalGabung}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-stone-800 dark:text-stone-200">{m.noHp}</div>
                    <div className="text-[10px] text-stone-400">{m.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    {m.partyType === 'ANGGOTA' ? (
                      m.simpananPokokPaid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="h-3.5 w-3.5" /> Lunas Rp100k
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-600">Belum Lunas</span>
                      )
                    ) : (
                      <span className="text-[10px] text-stone-400">N/A (Non-Anggota)</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedMember(m)}
                      className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200 bg-emerald-900 px-6 py-4 text-white dark:border-stone-800">
              <h3 className="text-sm font-bold">Registrasi Anggota / Nasabah Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-emerald-200 hover:bg-emerald-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300">Jenis Keanggotaan</label>
                  <select
                    value={formData.partyType}
                    onChange={(e) => setFormData({ ...formData, partyType: e.target.value as PartyType })}
                    className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 font-semibold text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  >
                    <option value="ANGGOTA">Anggota Penuh Koperasi</option>
                    <option value="NON_ANGGOTA">Non-Anggota / Nasabah Pinjaman</option>
                    <option value="CALON_ANGGOTA">Calon Anggota</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300">Nama Lengkap (Sesuai KTP)</label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Rahmat Hidayat, S.E."
                    className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300">Nomor Induk Kependudukan (NIK 16 Digit)</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    placeholder="Contoh: 3273010101900001"
                    className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 font-mono text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300">Nomor Pokok Wajib Pajak (NPWP)</label>
                  <input
                    type="text"
                    value={formData.npwp}
                    onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                    placeholder="Contoh: 09.234.567.8-421.000"
                    className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 font-mono text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    required
                    value={formData.noHp}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    placeholder="081234567890"
                    className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@email.com"
                    className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300">Pekerjaan / Bidang Usaha</label>
                  <input
                    type="text"
                    value={formData.pekerjaan}
                    onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                    placeholder="Wiraswasta / Karyawan"
                    className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300">Jenis Kelamin</label>
                  <select
                    value={formData.jenisKelamin}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })}
                    className="mt-1 h-9 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 font-semibold text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300">Alamat Domisili Lengkap</label>
                <textarea
                  rows={2}
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Jl. Nama Jalan No. RT/RW, Kelurahan, Kecamatan, Kota"
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-stone-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              {formData.partyType === 'ANGGOTA' && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900">
                  <input
                    type="checkbox"
                    id="pokokPaid"
                    checked={formData.simpananPokokPaid}
                    onChange={(e) => setFormData({ ...formData, simpananPokokPaid: e.target.checked })}
                    className="h-4 w-4 rounded text-emerald-600"
                  />
                  <label htmlFor="pokokPaid" className="font-semibold text-emerald-900 dark:text-emerald-300">
                    Telah melunasi Simpanan Pokok Wajib Pertama (Rp 100.000)
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-800 px-5 py-2 font-bold text-white hover:bg-emerald-700"
                >
                  Daftarkan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200 bg-emerald-900 px-6 py-4 text-white dark:border-stone-800">
              <h3 className="text-sm font-bold">Profil Lengkap Keanggotaan</h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="rounded-lg p-1.5 text-emerald-200 hover:bg-emerald-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="flex items-center gap-4 rounded-xl bg-stone-50 p-4 border border-stone-200 dark:bg-stone-800 dark:border-stone-700">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-800 text-lg font-bold text-white">
                  {selectedMember.nama.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white">{selectedMember.nama}</h4>
                  <p className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">{selectedMember.partyId}</p>
                  <span className="inline-block mt-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {selectedMember.partyType} • {selectedMember.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-stone-400">NIK:</span>
                  <p className="font-mono font-bold text-stone-800 dark:text-stone-200">{selectedMember.nik}</p>
                </div>
                <div>
                  <span className="text-stone-400">NPWP:</span>
                  <p className="font-mono font-bold text-stone-800 dark:text-stone-200">{selectedMember.npwp || '-'}</p>
                </div>
                <div>
                  <span className="text-stone-400">Nomor HP/WA:</span>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">{selectedMember.noHp}</p>
                </div>
                <div>
                  <span className="text-stone-400">Email:</span>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">{selectedMember.email}</p>
                </div>
                <div>
                  <span className="text-stone-400">Pekerjaan:</span>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">{selectedMember.pekerjaan}</p>
                </div>
                <div>
                  <span className="text-stone-400">Tanggal Bergabung:</span>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">{selectedMember.tanggalGabung}</p>
                </div>
              </div>

              <div>
                <span className="text-stone-400">Alamat Lengkap:</span>
                <p className="font-medium text-stone-800 dark:text-stone-200 bg-stone-50 p-2.5 rounded-xl border border-stone-200 dark:bg-stone-800 dark:border-stone-700 mt-1">
                  {selectedMember.alamat}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-stone-200 bg-stone-50 px-6 py-3 dark:border-stone-800 dark:bg-stone-900">
              <button
                onClick={() => setSelectedMember(null)}
                className="rounded-xl bg-emerald-800 px-4 py-2 font-bold text-white hover:bg-emerald-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
