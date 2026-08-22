import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { AuditLog } from '../../types';
import { History, Search, Filter, ShieldCheck, CheckCircle2, AlertCircle, Eye, X } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const [logs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter((l) => {
    const matchSearch =
      l.logId.toLowerCase().includes(search.toLowerCase()) ||
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.message.toLowerCase().includes(search.toLowerCase()) ||
      l.recordId.toLowerCase().includes(search.toLowerCase());
    const matchModule = moduleFilter === 'ALL' || l.module === moduleFilter;
    return matchSearch && matchModule;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 dark:text-white">
            Audit Trail & Log Aktivitas Sistem (KSP_LOG)
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Jejak digital permanen tak terhapus mencakup seluruh transaksi finansial, approval, dan perubahan data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4" />
            Integrity Guard Active
          </span>
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
            placeholder="Cari ID log, user, record ID, pesan..."
            className="h-9 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="h-9 rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-semibold text-stone-700 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          >
            <option value="ALL">Semua Modul Database</option>
            <option value="CORE">CORE (System & Auth)</option>
            <option value="ANGGOTA">ANGGOTA (Party Registry)</option>
            <option value="SIMPANAN">SIMPANAN</option>
            <option value="PINJAMAN">PINJAMAN</option>
            <option value="ANGSURAN">ANGSURAN</option>
            <option value="KAS_BANK">KAS & BANK</option>
            <option value="AKUNTANSI">AKUNTANSI (Ledger)</option>
            <option value="PAJAK">PAJAK</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-700 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-300">
              <tr>
                <th className="py-3 px-4 font-bold">Waktu & Log ID</th>
                <th className="py-3 px-4 font-bold">Pengguna & Role</th>
                <th className="py-3 px-4 font-bold">Modul / Aksi</th>
                <th className="py-3 px-4 font-bold">Target Record ID</th>
                <th className="py-3 px-4 font-bold">Keterangan Aktivitas</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
                <th className="py-3 px-4 font-bold text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredLogs.map((l) => (
                <tr key={l.logId} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                  <td className="py-2.5 px-4 font-mono">
                    <div className="font-bold text-stone-900 dark:text-white">
                      {new Date(l.timestamp).toLocaleTimeString('id-ID')}
                    </div>
                    <div className="text-[10px] text-stone-400">{l.logId}</div>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="font-bold text-stone-900 dark:text-white">{l.userName}</div>
                    <div className="text-[10px] text-stone-400 font-mono">{l.role}</div>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-bold text-emerald-800 dark:text-emerald-400">{l.module}</span>
                    <div className="text-[10px] font-semibold text-stone-500">{l.action}</div>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-stone-700 dark:text-stone-300">
                    {l.recordId}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-stone-800 dark:text-stone-200">
                    {l.message}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {l.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <button
                      onClick={() => setSelectedLog(l)}
                      className="rounded-lg border border-stone-200 p-1 hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
                    >
                      <Eye className="h-3.5 w-3.5 text-stone-600 dark:text-stone-300" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200 bg-emerald-900 px-6 py-4 text-white dark:border-stone-800">
              <h3 className="text-sm font-bold">Detail Log Audit #{selectedLog.logId}</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-lg p-1.5 text-emerald-200 hover:bg-emerald-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-stone-400">Waktu Kejadian:</span>
                  <p className="font-semibold text-stone-900 dark:text-white">{selectedLog.timestamp}</p>
                </div>
                <div>
                  <span className="text-stone-400">Pengguna:</span>
                  <p className="font-semibold text-stone-900 dark:text-white">{selectedLog.userName} ({selectedLog.userId})</p>
                </div>
                <div>
                  <span className="text-stone-400">Modul & Aksi:</span>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-400">{selectedLog.module} - {selectedLog.action}</p>
                </div>
                <div>
                  <span className="text-stone-400">Record ID:</span>
                  <p className="font-mono font-bold text-stone-900 dark:text-white">{selectedLog.recordId}</p>
                </div>
              </div>

              <div>
                <span className="text-stone-400">Keterangan:</span>
                <p className="font-medium text-stone-800 dark:text-stone-200 bg-stone-50 p-2.5 rounded-xl border border-stone-200 dark:bg-stone-800 dark:border-stone-700 mt-1">
                  {selectedLog.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-stone-200 bg-stone-50 px-6 py-3 dark:border-stone-800 dark:bg-stone-900">
              <button
                onClick={() => setSelectedLog(null)}
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
