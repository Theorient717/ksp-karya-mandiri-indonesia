import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';
import { KspLogo } from './KspLogo';

export interface ReceiptData {
  title: string;
  receiptNumber: string;
  date: string;
  partyName: string;
  partyId: string;
  partyPhone?: string;
  transactionType: string;
  amount: number;
  paymentMethod: string;
  details: Array<{ label: string; value: string }>;
  notes?: string;
  servedBy: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReceiptData | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-emerald-900 px-6 py-4 text-white dark:border-stone-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-300" />
            <h3 className="text-sm font-bold">Bukti Transaksi Resmi</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-emerald-200 hover:bg-emerald-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Printable Area */}
        <div id="receipt-print-area" className="flex-1 overflow-y-auto p-6 text-stone-800 dark:text-stone-200 space-y-4">
          {/* Logo & Header */}
          <div className="text-center border-b border-dashed border-stone-300 pb-4 dark:border-stone-700 flex flex-col items-center">
            <div className="mb-2">
              <KspLogo size="md" />
            </div>
            <p className="text-[11px] text-stone-500 font-medium">
              Koperasi Simpan Pinjam Berbadan Hukum No. AHU-001234.AH.01.26
            </p>
            <p className="text-[10px] text-stone-400">
              Jl. Gatot Subroto No. 45, Bandung • Telp: (022) 7234567
            </p>
            <div className="mt-2 inline-block rounded-md bg-stone-100 px-2.5 py-0.5 text-xs font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
              {data.title}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-stone-500">No. Bukti / Ref:</span>
              <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400">{data.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Tanggal Transaksi:</span>
              <span className="font-semibold">{data.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Nama Anggota/Nasabah:</span>
              <span className="font-bold">{data.partyName} ({data.partyId})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Jenis Transaksi:</span>
              <span className="font-semibold">{data.transactionType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Metode Pembayaran:</span>
              <span className="font-semibold">{data.paymentMethod}</span>
            </div>

            {data.details.map((d, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-stone-500">{d.label}:</span>
                <span className="font-semibold">{d.value}</span>
              </div>
            ))}
          </div>

          {/* Amount Box */}
          <div className="rounded-xl bg-emerald-50 p-3 text-center border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-400">
              Total Transaksi
            </span>
            <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200">
              Rp {data.amount.toLocaleString('id-ID')}
            </div>
          </div>

          {data.notes && (
            <div className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg dark:bg-stone-800">
              Catatan: {data.notes}
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-4 pt-4 text-center text-[11px] border-t border-dashed border-stone-300 dark:border-stone-700">
            <div>
              <p className="text-stone-500">Penyetor / Anggota</p>
              <div className="h-12"></div>
              <p className="font-bold">({data.partyName})</p>
            </div>
            <div>
              <p className="text-stone-500">Petugas / Kasir</p>
              <div className="h-12"></div>
              <p className="font-bold">({data.servedBy})</p>
            </div>
          </div>

          <div className="text-center text-[10px] text-stone-400">
            Bukti ini sah dan dicatat dalam sistem buku besar KSP Karya Mandiri Indonesia.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-6 py-3 dark:border-stone-800 dark:bg-stone-900">
          <button
            onClick={onClose}
            className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Bukti</span>
          </button>
        </div>
      </div>
    </div>
  );
};
