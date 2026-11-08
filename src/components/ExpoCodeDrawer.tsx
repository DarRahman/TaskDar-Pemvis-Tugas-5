import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode2 } from 'lucide-react';
import { EXPO_APP_JS_SOURCE } from '../data/expoSourceCode';
import { STUDENT_METADATA } from '../data/initialTasks';

export interface ExpoCodeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/*
 * Drawer modal providing immediate copy and file download access to the
 * complete React Native + Expo Managed Workflow App.js source file.
 */
export const ExpoCodeDrawer: React.FC<ExpoCodeDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(EXPO_APP_JS_SOURCE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = EXPO_APP_JS_SOURCE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadFile = () => {
    const blob = new Blob([EXPO_APP_JS_SOURCE], {
      type: 'text/javascript;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'App.js';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="expo-code-drawer-title"
    >
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-[#F5F5F3] border border-[#E4E2DD] shadow-2xl overflow-hidden">
        {/* Drawer Header */}
        <div className="px-5 py-3.5 bg-white border-b border-[#E4E2DD] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#18181B] text-white flex items-center justify-center shrink-0">
              <FileCode2 className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="expo-code-drawer-title"
                className="text-sm font-bold text-[#18181B]"
              >
                Kode Sumber React Native Expo (App.js)
              </h2>
              <p className="text-xs text-[#52524E] font-mono tabular-nums">
                {STUDENT_METADATA.repository} · {STUDENT_METADATA.name} ({STUDENT_METADATA.nim})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              className="min-h-[44px] px-3.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#34D399]" aria-hidden="true" />
                  <span>Berhasil Disalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" aria-hidden="true" />
                  <span>Salin App.js</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadFile}
              className="min-h-[44px] px-3.5 rounded-xl bg-[#EAE7E1] hover:bg-[#DFDCD4] text-[#18181B] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Unduh App.js</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup jendela kode"
              className="min-w-[44px] min-h-[44px] rounded-xl bg-[#EAE7E1] hover:bg-[#DFDCD4] text-[#18181B] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Setup Command Bar */}
        <div className="px-5 py-2.5 bg-[#EFECE6] border-b border-[#E4E2DD] flex flex-wrap items-center justify-between gap-2 text-xs text-[#484843]">
          <span>
            Siap dijalankan pada proyek React Native dengan Expo (Managed Workflow) menggunakan komponen FlatList dan @expo/vector-icons.
          </span>
          <code className="font-mono text-[11px] bg-white px-2.5 py-1 rounded-lg border border-[#E4E2DD] text-[#18181B]">
            npx create-expo-app pemvis-tugas5-task-manager
          </code>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#18181B] text-[#F4F4F5]">
          <pre className="text-xs font-mono leading-relaxed overflow-x-auto select-all">
            <code>{EXPO_APP_JS_SOURCE}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
