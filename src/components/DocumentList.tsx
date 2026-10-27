import React, { useState } from 'react';
import { DocStatus, DocType, DocumentData, DOC_TYPE_CONFIG } from '../types/document';
import { formatCurrency } from '../utils/thaiBaht';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit3,
  Printer,
  Download,
  Copy,
  Trash2,
  ExternalLink,
  Cloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface DocumentListProps {
  documents: DocumentData[];
  onNewDoc: (docType?: DocType) => void;
  onEditDoc: (doc: DocumentData) => void;
  onPreviewDoc: (doc: DocumentData) => void;
  onPrintDoc: (doc: DocumentData) => void;
  onDownloadPdf: (doc: DocumentData) => void;
  onDuplicateDoc: (doc: DocumentData) => void;
  onDeleteDoc: (docId: string) => void;
  onUploadDrive: (doc: DocumentData) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onNewDoc,
  onEditDoc,
  onPreviewDoc,
  onPrintDoc,
  onDownloadPdf,
  onDuplicateDoc,
  onDeleteDoc,
  onUploadDrive,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<DocType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<DocStatus | 'ALL'>('ALL');

  // Filter documents
  const filteredDocs = documents.filter((doc) => {
    // Type filter
    if (selectedType !== 'ALL' && doc.docType !== selectedType) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'ALL' && doc.status !== selectedStatus) {
      return false;
    }

    // Search query: search by document number, customer name, phone, or date
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNumber = doc.docNumber.toLowerCase().includes(q);
      const matchCustomer = doc.customer.name.toLowerCase().includes(q);
      const matchPhone = (doc.customer.phone || '').toLowerCase().includes(q);
      const matchDate = doc.date.toLowerCase().includes(q);
      const matchType = doc.docType.toLowerCase().includes(q);

      return matchNumber || matchCustomer || matchPhone || matchDate || matchType;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search input by document number or customer */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาเลขที่เอกสาร (เช่น RC2026), ชื่อลูกค้า, เบอร์โทร..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 bg-zinc-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-zinc-400 hover:text-zinc-600 cursor-pointer"
            >
              ล้าง
            </button>
          )}
        </div>

        {/* Create Document Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => onNewDoc('RC')}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ออก RC</span>
          </button>
          <button
            onClick={() => onNewDoc('QT')}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ออก QT</span>
          </button>
          <button
            onClick={() => onNewDoc('IN')}
            className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ออก IN</span>
          </button>
          <button
            onClick={() => onNewDoc('CF')}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ออก CF</span>
          </button>
        </div>
      </div>

      {/* Document Type Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedType('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium border transition-colors cursor-pointer ${
            selectedType === 'ALL'
              ? 'bg-zinc-900 text-white border-zinc-900'
              : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          ทั้งหมด ({documents.length})
        </button>

        {(['RC', 'QT', 'IN', 'CF'] as DocType[]).map((type) => {
          const cfg = DOC_TYPE_CONFIG[type];
          const count = documents.filter((d) => d.docType === type).length;
          const isSelected = selectedType === type;
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: cfg.color }}
              />
              <span>{cfg.thTitle}</span>
              <span className="text-[11px] opacity-75 font-mono">({count})</span>
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-700 focus:outline-none"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="issued">ออกแล้ว (Issued)</option>
            <option value="paid">ชำระแล้ว (Paid)</option>
            <option value="draft">ฉบับร่าง (Draft)</option>
            <option value="cancelled">ยกเลิก (Cancelled)</option>
          </select>
        </div>
      </div>

      {/* Documents Table or Empty State */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-800">ไม่พบเอกสารที่ค้นหา</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchQuery
              ? `ไม่มีเอกสารที่ตรงกับ "${searchQuery}" ลองค้นหาด้วยคำอื่น หรือคลิกสร้างเอกสารใหม่`
              : 'ยังไม่มีเอกสารในหมวดหมู่นี้ เริ่มสร้างเอกสารแรกของคุณได้ทันที'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNewDoc(selectedType !== 'ALL' ? selectedType : 'RC')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างเอกสารใหม่</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-600 font-semibold">
                  <th className="py-3 px-4">เลขที่เอกสาร</th>
                  <th className="py-3 px-4">ประเภท</th>
                  <th className="py-3 px-4">วันที่</th>
                  <th className="py-3 px-4">ลูกค้า / ผู้เข้าพัก</th>
                  <th className="py-3 px-4 text-right">ยอดรวม</th>
                  <th className="py-3 px-4 text-center">สถานะ</th>
                  <th className="py-3 px-4 text-center">Google Drive</th>
                  <th className="py-3 px-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredDocs.map((doc) => {
                  const cfg = DOC_TYPE_CONFIG[doc.docType] || DOC_TYPE_CONFIG.RC;
                  return (
                    <tr key={doc.id} className="hover:bg-zinc-50/50 transition-colors">
                      {/* Doc Number */}
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                        <button
                          onClick={() => onPreviewDoc(doc)}
                          className="hover:underline flex items-center gap-1.5 cursor-pointer text-zinc-900 hover:text-zinc-600"
                        >
                          <span>{doc.docNumber}</span>
                        </button>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border"
                          style={{
                            backgroundColor: `${cfg.color}15`,
                            color: cfg.color,
                            borderColor: `${cfg.color}30`,
                          }}
                        >
                          {cfg.thTitle}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-zinc-600 font-mono text-[11px]">{doc.date}</td>

                      {/* Customer / Guest */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-zinc-900">{doc.customer.name || '-'}</p>
                        {doc.customer.phone && (
                          <p className="text-[11px] text-zinc-500 font-mono">{doc.customer.phone}</p>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-zinc-900">
                        {formatCurrency(doc.grandTotal)} ฿
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {doc.status === 'paid' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5" /> ชำระแล้ว
                          </span>
                        )}
                        {doc.status === 'issued' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <Clock className="w-2.5 h-2.5" /> ออกแล้ว
                          </span>
                        )}
                        {doc.status === 'draft' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-600">
                            ฉบับร่าง
                          </span>
                        )}
                        {doc.status === 'cancelled' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-2.5 h-2.5" /> ยกเลิก
                          </span>
                        )}
                      </td>

                      {/* Google Drive Link */}
                      <td className="py-3 px-4 text-center">
                        {doc.driveFileUrl ? (
                          <a
                            href={doc.driveFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                            title="เปิดไฟล์ PDF ใน Google Drive"
                          >
                            <Cloud className="w-3.5 h-3.5 text-blue-500" />
                            <span>ดูใน Drive</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        ) : (
                          <button
                            onClick={() => onUploadDrive(doc)}
                            className="text-zinc-400 hover:text-blue-600 text-[11px] inline-flex items-center gap-1 hover:underline cursor-pointer"
                            title="อัปโหลดขึ้น Google Drive"
                          >
                            <Cloud className="w-3.5 h-3.5" />
                            <span>บันทึก</span>
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onPreviewDoc(doc)}
                            title="ดูตัวอย่าง"
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onPrintDoc(doc)}
                            title="พิมพ์เอกสาร"
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDownloadPdf(doc)}
                            title="ดาวน์โหลด PDF"
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onEditDoc(doc)}
                            title="แก้ไขเอกสาร"
                            className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-zinc-100 rounded-lg cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDuplicateDoc(doc)}
                            title="คัดลอกเป็นเอกสารใหม่"
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteDoc(doc.id)}
                            title="ลบเอกสาร"
                            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 bg-zinc-50/70 border-t border-zinc-200 text-xs text-zinc-500 flex justify-between items-center">
            <span>แสดง {filteredDocs.length} จากทั้งหมด {documents.length} เอกสาร</span>
            <span>เรียงตามวันที่สร้างล่าสุด</span>
          </div>
        </div>
      )}
    </div>
  );
};
