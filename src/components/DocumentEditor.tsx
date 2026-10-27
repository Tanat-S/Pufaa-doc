import React, { useState, useEffect } from 'react';
import {
  BookingDetails,
  CompanySettings,
  DocItem,
  DocStatus,
  DocType,
  DocumentData,
  DOC_TYPE_CONFIG,
} from '../types/document';
import { formatThaiBahtText, formatCurrency } from '../utils/thaiBaht';
import { getNextDocNumber } from '../utils/numberGenerator';
import {
  Plus,
  Trash2,
  Printer,
  Download,
  Cloud,
  FileSpreadsheet,
  Eye,
  Check,
  ChevronRight,
  Sparkles,
  Calendar,
  Building,
  UserCheck,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';

interface DocumentEditorProps {
  initialDocument?: DocumentData | null;
  existingDocNumbers: string[];
  settings: CompanySettings;
  onSave: (doc: DocumentData) => void;
  onCancel: () => void;
  onPreview: (doc: DocumentData) => void;
  onPrint: (doc: DocumentData) => void;
  onDownloadPdf: (doc: DocumentData) => void;
  onUploadDrive: (doc: DocumentData) => void;
  isSavingDrive?: boolean;
  driveLink?: string;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  initialDocument,
  existingDocNumbers,
  settings,
  onSave,
  onCancel,
  onPreview,
  onPrint,
  onDownloadPdf,
  onUploadDrive,
  isSavingDrive = false,
  driveLink,
}) => {
  // Determine doc type
  const [docType, setDocType] = useState<DocType>(initialDocument?.docType || 'RC');
  const [docNumber, setDocNumber] = useState<string>(
    initialDocument?.docNumber || getNextDocNumber(initialDocument?.docType || 'RC', existingDocNumbers)
  );
  const [date, setDate] = useState<string>(
    initialDocument?.date || new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState<string>(initialDocument?.dueDate || '');
  const [status, setStatus] = useState<DocStatus>(initialDocument?.status || 'issued');

  // Customer info
  const [customer, setCustomer] = useState(
    initialDocument?.customer || {
      name: '',
      taxId: '',
      phone: '',
      email: '',
      address: '',
      branch: '',
    }
  );

  // Booking details for CF
  const [booking, setBooking] = useState<BookingDetails>(
    initialDocument?.booking || {
      roomType: 'Deluxe Room',
      roomNumber: '101',
      checkInDate: new Date().toISOString().split('T')[0],
      checkInTime: '14:00 น.',
      checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      checkOutTime: '12:00 น.',
      nights: 1,
      adults: 2,
      children: 0,
      mealPlan: 'รวมอาหารเช้า (Breakfast Included)',
    }
  );

  // Items
  const [items, setItems] = useState<DocItem[]>(
    initialDocument?.items || [
      {
        id: '1',
        name: 'ค่าบริการ / สินค้า',
        description: '',
        quantity: 1,
        unit: 'รายการ',
        unitPrice: 1000,
        discount: 0,
        amount: 1000,
      },
    ]
  );

  // Discount & Tax settings
  const [discountPercent, setDiscountPercent] = useState<number>(initialDocument?.discountPercent || 0);
  const [vatEnabled, setVatEnabled] = useState<boolean>(initialDocument?.vatEnabled ?? true);
  const [vatRate, setVatRate] = useState<number>(initialDocument?.vatRate ?? 7);
  const [paidAmount, setPaidAmount] = useState<number>(initialDocument?.paidAmount ?? 0);

  // Free-form notes and payment terms
  const [notes, setNotes] = useState<string>(
    initialDocument?.notes || settings.defaultNotes[docType] || ''
  );
  const [paymentTerms, setPaymentTerms] = useState<string>(
    initialDocument?.paymentTerms || settings.defaultTerms[docType] || ''
  );

  // Re-generate doc number when switching doc type for a brand new document
  const handleTypeChange = (newType: DocType) => {
    setDocType(newType);
    if (!initialDocument) {
      setDocNumber(getNextDocNumber(newType, existingDocNumbers));
      setNotes(settings.defaultNotes[newType] || '');
      setPaymentTerms(settings.defaultTerms[newType] || '');
    }
  };

  // Re-calculate financial totals whenever items, discount, or VAT changes
  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const discountAmount = discountPercent > 0 ? (subtotal * discountPercent) / 100 : 0;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const vatAmount = vatEnabled ? (afterDiscount * vatRate) / 100 : 0;
  const grandTotal = Math.round((afterDiscount + vatAmount) * 100) / 100;
  const remainingAmount = Math.max(0, grandTotal - paidAmount);
  const bahtText = formatThaiBahtText(grandTotal);

  // Update item field
  const updateItem = (index: number, field: keyof DocItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    // auto compute row amount
    if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
      const q = field === 'quantity' ? Number(value) || 0 : item.quantity;
      const p = field === 'unitPrice' ? Number(value) || 0 : item.unitPrice;
      const d = field === 'discount' ? Number(value) || 0 : item.discount;
      item.amount = Math.max(0, q * p - d);
    }

    updated[index] = item;
    setItems(updated);
  };

  const addItem = () => {
    const newItem: DocItem = {
      id: String(Date.now()),
      name: '',
      description: '',
      quantity: 1,
      unit: docType === 'CF' ? 'คืน' : 'รายการ',
      unitPrice: 0,
      discount: 0,
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const currentDocData: DocumentData = {
    id: initialDocument?.id || `doc-${Date.now()}`,
    docType,
    docNumber,
    date,
    dueDate: dueDate || undefined,
    customer,
    booking: docType === 'CF' ? booking : undefined,
    items,
    subtotal,
    discountPercent,
    discountAmount,
    vatEnabled,
    vatRate,
    vatAmount,
    grandTotal,
    paidAmount,
    remainingAmount,
    bahtText,
    notes,
    paymentTerms,
    status,
    driveFileId: initialDocument?.driveFileId,
    driveFileUrl: driveLink || initialDocument?.driveFileUrl,
    createdAt: initialDocument?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const config = DOC_TYPE_CONFIG[docType];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header & Fast Action Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors"
            title="ย้อนกลับ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-0.5 rounded text-xs font-bold tracking-wide uppercase"
                style={{ backgroundColor: `${config.color}15`, color: config.color }}
              >
                {config.prefix}
              </span>
              <h2 className="text-lg font-bold text-zinc-900">
                {initialDocument ? `แก้ไข ${docNumber}` : `สร้างเอกสารใหม่ (${config.thTitle})`}
              </h2>
            </div>
            <p className="text-xs text-zinc-500">กรอกข้อมูลได้อย่างอิสระ ระบบจะคำนวณยอดเงินให้อัตโนมัติ</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onPreview(currentDocData)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-zinc-600" />
            <span>ตัวอย่าง</span>
          </button>

          <button
            type="button"
            onClick={() => onPrint(currentDocData)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-zinc-600" />
            <span>พิมพ์</span>
          </button>

          <button
            type="button"
            onClick={() => onDownloadPdf(currentDocData)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-zinc-600" />
            <span>ดาวน์โหลด PDF</span>
          </button>

          <button
            type="button"
            disabled={isSavingDrive}
            onClick={() => onUploadDrive(currentDocData)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <Cloud className="w-4 h-4 text-blue-600" />
            <span>{isSavingDrive ? 'กำลังบันทึกลง Drive...' : 'บันทึกลง Google Drive'}</span>
          </button>

          <button
            type="button"
            onClick={() => onSave(currentDocData)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>บันทึกข้อมูล</span>
          </button>
        </div>
      </div>

      {/* Type Selection Tabs */}
      <div className="bg-white p-3 rounded-xl border border-zinc-200/80 shadow-xs">
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2 px-1">
          เลือกประเภทเอกสาร (Document Type)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(['RC', 'QT', 'IN', 'CF'] as DocType[]).map((type) => {
            const itemCfg = DOC_TYPE_CONFIG[type];
            const isSelected = docType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-zinc-900 ring-2 ring-zinc-900/10 shadow-xs bg-zinc-50/50'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${itemCfg.color}18`,
                      color: itemCfg.color,
                    }}
                  >
                    {itemCfg.prefix}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-zinc-900" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">{itemCfg.thTitle}</p>
                  <p className="text-[11px] text-zinc-500 font-medium">{itemCfg.enTitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Document Meta: Number, Date, Status */}
      <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs space-y-4">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          ข้อมูลหลักของเอกสาร (Document Details)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              เลขที่เอกสาร (Auto-run / แก้ไขได้)
            </label>
            <div className="relative">
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="เช่น RC2026-001"
                className="w-full text-sm font-mono font-bold px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 bg-zinc-50/50"
              />
              <button
                type="button"
                onClick={() => setDocNumber(getNextDocNumber(docType, existingDocNumbers))}
                title="รีเซ็ตเป็นเลขถัดไปอัตโนมัติ"
                className="absolute right-2 top-2 p-1 text-zinc-400 hover:text-zinc-700 rounded"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">รูปแบบมาตรฐาน: {docType}2026-001</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">วันที่ออกเอกสาร</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          {docType !== 'CF' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                {docType === 'QT' ? 'กำหนดยืนยันราคาถึง' : 'ครบกำหนดชำระ'}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">สถานะเอกสาร</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DocStatus)}
              className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
            >
              <option value="issued">ออกเอกสารแล้ว (Issued)</option>
              <option value="paid">ชำระเงินแล้ว (Paid)</option>
              <option value="draft">ฉบับร่าง (Draft)</option>
              <option value="cancelled">ยกเลิก (Cancelled)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer / Guest Info */}
      <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {docType === 'CF' ? 'ข้อมูลผู้เข้าพัก (Guest Information)' : 'ข้อมูลลูกค้า / ผู้ติดต่อ (Customer Information)'}
          </h3>
          <span className="text-[11px] text-zinc-400">กรอกข้อความได้อย่างอิสระ</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              ชื่อลูกค้า / บริษัท / ผู้เข้าพัก <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              placeholder="เช่น คุณสมชาย ใจดี หรือ บริษัท สยามมีเดีย จำกัด"
              className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">สาขา (ถ้ามี)</label>
            <input
              type="text"
              value={customer.branch || ''}
              onChange={(e) => setCustomer({ ...customer, branch: e.target.value })}
              placeholder="เช่น สำนักงานใหญ่ หรือ สาขา 00001"
              className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">เบอร์โทรศัพท์</label>
            <input
              type="text"
              value={customer.phone || ''}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              placeholder="081-234-5678"
              className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">อีเมล</label>
            <input
              type="email"
              value={customer.email || ''}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              placeholder="customer@example.com"
              className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              เลขประจำตัวผู้เสียภาษี / บัตรประชาชน
            </label>
            <input
              type="text"
              value={customer.taxId || ''}
              onChange={(e) => setCustomer({ ...customer, taxId: e.target.value })}
              placeholder="13 หลัก เช่น 0105558098765"
              className="w-full text-sm font-mono px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-zinc-700 mb-1">ที่อยู่</label>
            <textarea
              rows={2}
              value={customer.address || ''}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
              className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </div>
      </div>

      {/* Special Booking Section for CF (ใบยืนยันการจองห้องพัก) */}
      {docType === 'CF' && (
        <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-amber-200/60 pb-2">
            <Calendar className="w-4 h-4 text-amber-700" />
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              ข้อมูลการจองห้องพัก (Reservation Details)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">ประเภทห้องพัก</label>
              <input
                type="text"
                value={booking.roomType}
                onChange={(e) => setBooking({ ...booking, roomType: e.target.value })}
                placeholder="เช่น Deluxe Villa, Suite"
                className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">หมายเลขห้อง</label>
              <input
                type="text"
                value={booking.roomNumber || ''}
                onChange={(e) => setBooking({ ...booking, roomNumber: e.target.value })}
                placeholder="เช่น 101, Villa A"
                className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">วันเช็คอิน</label>
              <input
                type="date"
                value={booking.checkInDate}
                onChange={(e) => setBooking({ ...booking, checkInDate: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">วันเช็คเอาท์</label>
              <input
                type="date"
                value={booking.checkOutDate}
                onChange={(e) => setBooking({ ...booking, checkOutDate: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">จำนวนคืน</label>
              <input
                type="number"
                min="1"
                value={booking.nights}
                onChange={(e) => setBooking({ ...booking, nights: parseInt(e.target.value, 10) || 1 })}
                className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">ผู้ใหญ่ (ท่าน)</label>
              <input
                type="number"
                min="1"
                value={booking.adults}
                onChange={(e) => setBooking({ ...booking, adults: parseInt(e.target.value, 10) || 1 })}
                className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">เด็ก (ท่าน)</label>
              <input
                type="number"
                min="0"
                value={booking.children}
                onChange={(e) => setBooking({ ...booking, children: parseInt(e.target.value, 10) || 0 })}
                className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">แผนอาหาร</label>
              <input
                type="text"
                value={booking.mealPlan || ''}
                onChange={(e) => setBooking({ ...booking, mealPlan: e.target.value })}
                placeholder="เช่น รวมอาหารเช้า 2 ท่าน"
                className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            รายการสินค้า / ค่าบริการ (Items & Charges)
          </h3>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-md transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มแถวรายการ</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 font-semibold bg-zinc-50/50">
                <th className="py-2 px-2 w-8 text-center">#</th>
                <th className="py-2 px-2 min-w-[200px]">ชื่อรายการ</th>
                <th className="py-2 px-2 min-w-[140px]">รายละเอียดเพิ่มเติม (ถ้ามี)</th>
                <th className="py-2 px-2 w-20 text-center">จำนวน</th>
                <th className="py-2 px-2 w-20 text-center">หน่วย</th>
                <th className="py-2 px-2 w-28 text-right">ราคา/หน่วย</th>
                <th className="py-2 px-2 w-24 text-right">ส่วนลด</th>
                <th className="py-2 px-2 w-28 text-right">รวมเป็นเงิน</th>
                <th className="py-2 px-2 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.map((item, index) => (
                <tr key={item.id} className="hover:bg-zinc-50/30">
                  <td className="py-2 px-2 text-center text-zinc-400 font-mono">{index + 1}</td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="ชื่อสินค้าหรือบริการ"
                      className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded focus:border-zinc-900 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="คำอธิบายย่อย..."
                      className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded focus:border-zinc-900 focus:outline-none text-zinc-600"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className="w-full text-xs text-center font-mono px-2 py-1.5 border border-zinc-200 rounded focus:border-zinc-900 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updateItem(index, 'unit', e.target.value)}
                      placeholder="รายการ, คืน"
                      className="w-full text-xs text-center px-2 py-1.5 border border-zinc-200 rounded focus:border-zinc-900 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                      className="w-full text-xs text-right font-mono px-2 py-1.5 border border-zinc-200 rounded focus:border-zinc-900 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={item.discount}
                      onChange={(e) => updateItem(index, 'discount', e.target.value)}
                      placeholder="0"
                      className="w-full text-xs text-right font-mono px-2 py-1.5 border border-zinc-200 rounded focus:border-zinc-900 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-2 text-right font-mono font-semibold text-zinc-900">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length <= 1}
                      title="ลบแถวนี้"
                      className="p-1 text-zinc-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-zinc-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary and Financial Calculations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notes & Terms (Left) */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            หมายเหตุ & เงื่อนไข (Notes & Terms)
          </h3>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">หมายเหตุท้ายเอกสาร</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ระบุหมายเหตุหรือข้อความเพิ่มเติมสำหรับลูกค้า..."
              className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">เงื่อนไขการชำระเงิน / ข้อตกลง</label>
            <textarea
              rows={3}
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="เช่น ชำระมัดจำ 50%, โอนเงินผ่านบัญชีธนาคารภายใน 7 วัน..."
              className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 leading-relaxed"
            />
          </div>
        </div>

        {/* Calculation Settings (Right) */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            คำนวณยอดเงิน (Financial Summary)
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-zinc-600">รวมเป็นเงิน (Subtotal):</span>
              <span className="font-mono font-medium text-sm">{formatCurrency(subtotal)} บาท</span>
            </div>

            {/* Discount Percent */}
            <div className="flex justify-between items-center gap-4 py-1">
              <span className="text-zinc-600 flex items-center gap-2">
                <span>ส่วนลดทั้งบิล (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-center font-mono text-xs border border-zinc-200 rounded"
                />
              </span>
              <span className="font-mono text-rose-600">
                {discountAmount > 0 ? `-${formatCurrency(discountAmount)} บาท` : '0.00 บาท'}
              </span>
            </div>

            {/* VAT Toggle */}
            <div className="flex justify-between items-center gap-4 py-1 border-t border-zinc-100 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-700">
                <input
                  type="checkbox"
                  checked={vatEnabled}
                  onChange={(e) => setVatEnabled(e.target.checked)}
                  className="rounded text-zinc-900 focus:ring-zinc-900"
                />
                <span>ภาษีมูลค่าเพิ่ม VAT</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  disabled={!vatEnabled}
                  value={vatRate}
                  onChange={(e) => setVatRate(parseFloat(e.target.value) || 7)}
                  className="w-12 px-1.5 py-0.5 text-center font-mono text-xs border border-zinc-200 rounded disabled:opacity-40"
                />
                <span>%</span>
              </label>
              <span className="font-mono">{formatCurrency(vatAmount)} บาท</span>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-center py-3 border-t-2 border-zinc-200 bg-zinc-50 px-3 rounded-lg">
              <span className="font-bold text-zinc-900 text-sm">ยอดรวมทั้งสิ้น (Grand Total):</span>
              <span className="font-mono text-lg font-bold text-zinc-900">
                {formatCurrency(grandTotal)} บาท
              </span>
            </div>

            {/* Thai Baht Text Preview */}
            <div className="bg-zinc-100/70 p-2.5 rounded text-[11px] text-zinc-700">
              <span className="text-zinc-400 block mb-0.5">ตัวอักษร:</span>
              <span className="font-medium">{bahtText}</span>
            </div>

            {/* Paid / Deposit Amount */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  ยอดชำระแล้ว / มัดจำ (บาท)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-mono px-3 py-1.5 border border-zinc-200 rounded focus:border-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  ยอดคงเหลือค้างชำระ
                </label>
                <div className="w-full text-xs font-mono font-semibold px-3 py-1.5 bg-zinc-100 rounded text-zinc-800 border border-zinc-200">
                  {formatCurrency(remainingAmount)} บาท
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
