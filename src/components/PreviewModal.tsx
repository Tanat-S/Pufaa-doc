import React, { useRef } from 'react';
import { CompanySettings, DocumentData, DOC_TYPE_CONFIG } from '../types/document';
import { DocumentPaper } from './DocumentPaper';
import {
  X,
  Printer,
  Download,
  Cloud,
  Check,
  ExternalLink,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentData | null;
  settings: CompanySettings;
  onPrint: (doc: DocumentData) => void;
  onDownloadPdf: (doc: DocumentData) => void;
  onUploadDrive: (doc: DocumentData) => void;
  isSavingDrive?: boolean;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  settings,
  onPrint,
  onDownloadPdf,
  onUploadDrive,
  isSavingDrive = false,
}) => {
  if (!isOpen || !doc) return null;

  const config = DOC_TYPE_CONFIG[doc.docType] || DOC_TYPE_CONFIG.RC;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-between overflow-hidden animate-in fade-in duration-150">
      {/* Top Floating Control Bar */}
      <div className="bg-zinc-900 text-white px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md z-10">
        <div className="flex items-center gap-3">
          <span
            className="px-2 py-0.5 rounded text-xs font-bold"
            style={{ backgroundColor: `${config.color}30`, color: config.color }}
          >
            {config.prefix}
          </span>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">
              ตัวอย่างก่อนพิมพ์: {doc.docNumber} ({config.thTitle})
            </h3>
            <p className="text-[11px] text-zinc-400">
              {doc.customer.name || 'ไม่ระบุลูกค้า'} • {doc.date}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {doc.driveFileUrl && (
            <a
              href={doc.driveFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700 rounded-lg text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>เปิดใน Drive</span>
            </a>
          )}

          <button
            type="button"
            disabled={isSavingDrive}
            onClick={() => onUploadDrive(doc)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>{isSavingDrive ? 'กำลังบันทึก...' : 'บันทึกลง Drive'}</span>
          </button>

          <button
            type="button"
            onClick={() => onDownloadPdf(doc)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ดาวน์โหลด PDF</span>
          </button>

          <button
            type="button"
            onClick={() => onPrint(doc)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-zinc-900 hover:bg-zinc-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-800" />
            <span>สั่งพิมพ์</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-zinc-800/80">
        <div className="my-auto scale-90 md:scale-100 origin-top transition-transform">
          <DocumentPaper id="preview-modal-paper" document={doc} settings={settings} />
        </div>
      </div>
    </div>
  );
};
