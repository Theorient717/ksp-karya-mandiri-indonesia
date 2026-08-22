import React, { useState } from 'react';
import { GAS_FILES_CATALOG } from '../../services/gasCodeGenerator';
import { Code2, Copy, Download, Check, FileCode, ExternalLink, Terminal } from 'lucide-react';

export const GasExportView: React.FC = () => {
  const [selectedFileName, setSelectedFileName] = useState<string>(GAS_FILES_CATALOG[0].name);
  const [copied, setCopied] = useState(false);

  const selectedFile = GAS_FILES_CATALOG.find((f) => f.name === selectedFileName) || GAS_FILES_CATALOG[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 dark:text-white">
            Google Apps Script & Multi-Spreadsheet Backend Exporter
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Source code lengkap backend GAS untuk mengontrol 10 Google Spreadsheet database & Google Drive.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 shadow-xs"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Unduh File .gs</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Files List */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-3 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-1">
          <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Katalog File Apps Script
          </div>
          {GAS_FILES_CATALOG.map((f) => (
            <button
              key={f.name}
              onClick={() => setSelectedFileName(f.name)}
              className={`flex w-full items-start gap-2.5 rounded-xl p-2.5 text-left transition-colors ${
                selectedFileName === f.name
                  ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'text-stone-700 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800/50'
              }`}
            >
              <FileCode className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="overflow-hidden">
                <div className="truncate text-xs font-mono">{f.name}</div>
                <div className="truncate text-[10px] text-stone-400 font-normal">{f.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-3 rounded-2xl border border-stone-200/80 bg-stone-950 p-4 shadow-xs text-stone-200 flex flex-col font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-[11px] text-stone-400">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span className="font-bold text-stone-200">{selectedFile.name}</span>
              <span>— {selectedFile.description}</span>
            </div>
            <span>Google Apps Script V8 Engine</span>
          </div>

          <pre className="mt-4 flex-1 overflow-x-auto p-2 text-[11px] text-emerald-300/90 leading-relaxed max-h-[600px] overflow-y-auto">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
