import React from 'react';
import { CompanySettings, DocumentData, DOC_TYPE_CONFIG } from '../types/document';
import { formatCurrency } from '../utils/thaiBaht';
import { Building2, Calendar, CheckCircle2, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';

interface DocumentPaperProps {
  document: DocumentData;
  settings: CompanySettings;
  id?: string;
  isPrintOnly?: boolean;
}

export const DocumentPaper: React.FC<DocumentPaperProps> = ({
  document: doc,
  settings,
  id = 'document-paper',
  isPrintOnly = false,
}) => {
  const config = DOC_TYPE_CONFIG[doc.docType] || DOC_TYPE_CONFIG.RC;

  return (
    <div
      id={id}
      className={`bg-white text-zinc-900 font-sans print:p-0 print:shadow-none print:m-0 mx-auto w-full max-w-[210mm] min-h-[297mm] p-8 md:p-12 border border-zinc-200/80 shadow-xl rounded-sm flex flex-col justify-between ${
        isPrintOnly ? 'print:block hidden' : ''
      }`}
      style={{
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Top Header Section */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-zinc-200 pb-6">
          {/* Company Info Left */}
          <div className="flex items-start gap-4 flex-1">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Company Logo"
                className="w-16 h-16 object-contain rounded border border-zinc-100"
              />
            ) : (
              <div
                className="w-14 h-14 rounded flex items-center justify-center font-bold text-xl text-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: config.color }}
              >
                {doc.docType}
              </div>
            )}

            <div className="space-y-1">
              <h1 className="text-lg font-bold text-zinc-900 leading-tight">
                {settings.companyName || 'ชื่อบริษัท / กิจการ'}
              </h1>
              {settings.companyNameEn && (
                <p className="text-xs text-zinc-500 font-medium">{settings.companyNameEn}</p>
              )}
              <div className="text-xs text-zinc-600 space-y-0.5 pt-1">
                {settings.address && (
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                    <span>{settings.address}</span>
                  </p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-zinc-500">
                  {settings.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-zinc-400" />
                      {settings.phone}
                    </span>
                  )}
                  {settings.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-zinc-400" />
                      {settings.email}
                    </span>
                  )}
                </div>
                {settings.taxId && (
                  <p className="text-zinc-600 font-medium">
                    เลขประจำตัวผู้เสียภาษี: <span className="font-mono">{settings.taxId}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Document Title & Meta Right */}
          <div className="w-full md:w-auto text-left md:text-right flex flex-col md:items-end">
            <div
              className="inline-block px-4 py-2 rounded text-left md:text-right border mb-3"
              style={{
                borderColor: `${config.color}30`,
                backgroundColor: `${config.color}0D`,
              }}
            >
              <h2 className="text-xl font-bold tracking-tight" style={{ color: config.color }}>
                {config.thTitle}
              </h2>
              <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                {config.enTitle}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <span className="text-zinc-500">เลขที่เอกสาร:</span>
              <span className="font-mono font-bold text-zinc-900">{doc.docNumber}</span>

              <span className="text-zinc-500">วันที่ออก:</span>
              <span className="font-medium text-zinc-800">{doc.date}</span>

              {doc.dueDate && doc.docType !== 'CF' && (
                <>
                  <span className="text-zinc-500">ครบกำหนด / ยืนยันถึง:</span>
                  <span className="font-medium text-zinc-800">{doc.dueDate}</span>
                </>
              )}

              <span className="text-zinc-500">สถานะ:</span>
              <span>
                {doc.status === 'paid' && (
                  <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> ชำระแล้ว
                  </span>
                )}
                {doc.status === 'issued' && <span className="text-blue-700 font-medium">ออกเอกสารแล้ว</span>}
                {doc.status === 'draft' && <span className="text-zinc-500 font-medium">ฉบับร่าง</span>}
                {doc.status === 'cancelled' && <span className="text-rose-600 font-medium">ยกเลิกแล้ว</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Customer / Client Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5 bg-zinc-50/80 p-4 rounded border border-zinc-200/70 text-xs">
          <div>
            <span className="text-zinc-400 uppercase font-semibold text-[10px] tracking-wider block mb-1">
              {doc.docType === 'CF' ? 'ข้อมูลผู้เข้าพัก (Guest Details)' : 'ข้อมูลลูกค้า (Customer Details)'}
            </span>
            <p className="text-sm font-bold text-zinc-900">{doc.customer.name || 'ไม่ระบุชื่อ'}</p>
            {doc.customer.branch && (
              <p className="text-zinc-600 text-xs mt-0.5">สาขา: {doc.customer.branch}</p>
            )}
            {doc.customer.address && (
              <p className="text-zinc-600 mt-1 whitespace-pre-line leading-relaxed">
                {doc.customer.address}
              </p>
            )}
          </div>
          <div className="space-y-1 md:text-right flex flex-col md:items-end justify-center">
            {doc.customer.taxId && (
              <p className="text-zinc-600">
                <span className="text-zinc-400">เลขประจำตัวผู้เสียภาษี:</span>{' '}
                <span className="font-mono font-medium">{doc.customer.taxId}</span>
              </p>
            )}
            {doc.customer.phone && (
              <p className="text-zinc-600">
                <span className="text-zinc-400">เบอร์โทรศัพท์:</span> {doc.customer.phone}
              </p>
            )}
            {doc.customer.email && (
              <p className="text-zinc-600">
                <span className="text-zinc-400">อีเมล:</span> {doc.customer.email}
              </p>
            )}
          </div>
        </div>

        {/* Booking Details Specific Section for CF */}
        {doc.docType === 'CF' && doc.booking && (
          <div className="mb-5 bg-amber-50/60 border border-amber-200/80 rounded p-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5 border-b border-amber-200/50 pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-700" />
                <h3 className="font-bold text-amber-900 text-sm">
                  รายละเอียดการจองห้องพัก (Reservation Details)
                </h3>
              </div>
              {doc.booking.branch && (
                <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded text-[11px]">
                  <span>สาขา:</span>
                  <span>{doc.booking.branch}</span>
                </span>
              )}
            </div>

            {/* Room rows table if multiple rooms exist, otherwise fallback grid */}
            {doc.booking.rooms && doc.booking.rooms.length > 0 ? (
              <div className="mb-3 overflow-x-auto">
                <table className="w-full text-left border-collapse border border-amber-200 bg-white rounded">
                  <thead>
                    <tr className="bg-amber-100/60 text-amber-900 text-[11px] font-semibold border-b border-amber-200">
                      <th className="py-1.5 px-2 w-8 text-center">#</th>
                      <th className="py-1.5 px-2">ประเภทห้องพัก (Room Type)</th>
                      <th className="py-1.5 px-2">หมายเลขห้อง</th>
                      <th className="py-1.5 px-2 w-16 text-center">จำนวน</th>
                      <th className="py-1.5 px-2">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 text-zinc-800 text-[11px]">
                    {doc.booking.rooms.map((room, rIdx) => (
                      <tr key={room.id || rIdx}>
                        <td className="py-1.5 px-2 text-center text-zinc-400 font-mono">{rIdx + 1}</td>
                        <td className="py-1.5 px-2 font-bold text-zinc-900">{room.roomType || '-'}</td>
                        <td className="py-1.5 px-2 font-mono font-medium text-amber-900">
                          {room.roomNumber || '-'}
                        </td>
                        <td className="py-1.5 px-2 text-center font-mono">{room.quantity || 1} ห้อง</td>
                        <td className="py-1.5 px-2 text-zinc-500">{room.note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-zinc-800 mb-3">
                <div className="col-span-2">
                  <span className="text-zinc-500 block text-[11px]">ประเภทห้องพัก:</span>
                  <span className="font-bold text-zinc-900 whitespace-pre-line leading-relaxed">
                    {doc.booking.roomType || '-'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-zinc-500 block text-[11px]">หมายเลขห้อง:</span>
                  <span className="font-semibold text-zinc-900 whitespace-pre-line">
                    {doc.booking.roomNumber || '-'}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-zinc-800 border-t border-amber-200/50 pt-2.5">
              <div>
                <span className="text-zinc-500 block text-[11px]">วันและเวลาเช็คอิน:</span>
                <span className="font-semibold text-zinc-900">
                  {doc.booking.checkInDate || '-'} {doc.booking.checkInTime ? `(${doc.booking.checkInTime})` : ''}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">วันและเวลาเช็คเอาท์:</span>
                <span className="font-semibold text-zinc-900">
                  {doc.booking.checkOutDate || '-'} {doc.booking.checkOutTime ? `(${doc.booking.checkOutTime})` : ''}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">จำนวนคืนทั้งหมด:</span>
                <span className="font-bold text-amber-900">{doc.booking.nights || 1} คืน</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">จำนวนผู้เข้าพัก:</span>
                <span className="font-medium text-zinc-900">
                  ผู้ใหญ่ {doc.booking.adults || 1} ท่าน
                  {doc.booking.children ? `, เด็ก ${doc.booking.children} ท่าน` : ''}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Line Items Table */}
        <div className="overflow-x-auto my-4">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-y-2 border-zinc-300 bg-zinc-100/70 text-zinc-700 font-semibold">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">รายการ (Description)</th>
                <th className="py-2.5 px-3 w-16 text-center">จำนวน</th>
                <th className="py-2.5 px-3 w-16 text-center">หน่วย</th>
                <th className="py-2.5 px-3 w-24 text-right">ราคา/หน่วย</th>
                <th className="py-2.5 px-3 w-20 text-right">ส่วนลด</th>
                <th className="py-2.5 px-3 w-28 text-right">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {doc.items && doc.items.length > 0 ? (
                doc.items.map((item, index) => (
                  <tr key={item.id || index} className="text-zinc-800 hover:bg-zinc-50/50">
                    <td className="py-2.5 px-3 text-center text-zinc-400 font-mono">{index + 1}</td>
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-zinc-900">{item.name}</p>
                      {item.description && (
                        <p className="text-[11px] text-zinc-500 mt-0.5 whitespace-pre-line">
                          {item.description}
                        </p>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-center text-zinc-600">{item.unit || 'รายการ'}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-zinc-500">
                      {item.discount > 0 ? formatCurrency(item.discount) : '-'}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono font-semibold ${item.amount < 0 ? 'text-rose-600' : 'text-zinc-900'}`}>
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-zinc-400">
                    ไม่มีรายการสินค้าหรือบริการ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Calculation & Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-4 pt-2 border-t border-zinc-200">
          {/* Left Column: Thai Baht Text, Bank info & Notes */}
          <div className="md:col-span-7 space-y-4 text-xs">
            {/* Thai Baht text banner */}
            <div className="bg-zinc-100/90 rounded px-3 py-2 border border-zinc-200 flex items-center justify-between">
              <span className="text-zinc-500 text-[11px]">จำนวนเงินตัวอักษร:</span>
              <span className="font-semibold text-zinc-900">{doc.bahtText || 'ศูนย์บาทถ้วน'}</span>
            </div>

            {/* Payment Method / Bank info */}
            {(settings.bankAccountNo || settings.promptPayNo) && (
              <div className="bg-zinc-50 rounded p-3 border border-zinc-200/80 space-y-1 text-zinc-700">
                <span className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider block">
                  ช่องทางการชำระเงิน (Payment Details)
                </span>
                {settings.bankName && (
                  <p>
                    <span className="text-zinc-500">ธนาคาร:</span> {settings.bankName}
                  </p>
                )}
                {settings.bankAccountNo && (
                  <p>
                    <span className="text-zinc-500">เลขที่บัญชี:</span>{' '}
                    <span className="font-mono font-bold text-zinc-900">{settings.bankAccountNo}</span>{' '}
                    ({settings.bankAccountName})
                  </p>
                )}
                {settings.promptPayNo && (
                  <p>
                    <span className="text-zinc-500">พร้อมเพย์:</span>{' '}
                    <span className="font-mono font-medium">{settings.promptPayNo}</span>
                  </p>
                )}
              </div>
            )}

            {/* Notes & Payment Terms */}
            {(doc.notes || doc.paymentTerms) && (
              <div className="text-zinc-600 space-y-2 pt-1">
                {doc.notes && (
                  <div>
                    <span className="font-semibold text-zinc-700 block text-[11px]">หมายเหตุ:</span>
                    <p className="whitespace-pre-line text-zinc-600 text-[11px] leading-relaxed">
                      {doc.notes}
                    </p>
                  </div>
                )}
                {doc.paymentTerms && (
                  <div>
                    <span className="font-semibold text-zinc-700 block text-[11px]">
                      เงื่อนไขการชำระเงิน / ข้อตกลง:
                    </span>
                    <p className="whitespace-pre-line text-zinc-600 text-[11px] leading-relaxed">
                      {doc.paymentTerms}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Financial Math */}
          <div className="md:col-span-5 bg-zinc-50/70 p-4 rounded border border-zinc-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>รวมเป็นเงิน (Subtotal):</span>
              <span className="font-mono font-medium">{formatCurrency(doc.subtotal)} บาท</span>
            </div>

            {doc.discountAmount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>
                  ส่วนลด {doc.discountPercent > 0 ? `(${doc.discountPercent}%)` : ''}:
                </span>
                <span className="font-mono font-medium">-{formatCurrency(doc.discountAmount)} บาท</span>
              </div>
            )}

            {doc.vatEnabled && (
              <div className="flex justify-between text-zinc-600">
                <span>ภาษีมูลค่าเพิ่ม VAT {doc.vatRate}%:</span>
                <span className="font-mono font-medium">{formatCurrency(doc.vatAmount)} บาท</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-bold text-zinc-900 border-t border-zinc-300 pt-2 pb-1">
              <span>จำนวนเงินรวมทั้งสิ้น:</span>
              <span className="font-mono text-base font-bold" style={{ color: config.color }}>
                {formatCurrency(doc.grandTotal)} บาท
              </span>
            </div>

            {(doc.paidAmount > 0 || doc.status === 'paid') && (
              <div className="flex justify-between text-emerald-700 pt-1 border-t border-dashed border-zinc-200">
                <span>ชำระแล้ว / มัดจำ:</span>
                <span className="font-mono font-semibold">{formatCurrency(doc.paidAmount)} บาท</span>
              </div>
            )}

            {doc.remainingAmount > 0 && doc.status !== 'paid' && (
              <div className="flex justify-between text-amber-700 font-semibold">
                <span>ยอดคงเหลือที่ต้องชำระ:</span>
                <span className="font-mono">{formatCurrency(doc.remainingAmount)} บาท</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Signatures Section */}
      <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-zinc-200 text-xs text-zinc-600">
        <div className="text-center space-y-3">
          <p className="font-medium text-zinc-700">
            {doc.docType === 'CF' ? 'ผู้เข้าพัก / ผู้จอง' : 'ผู้รับบริการ / ลูกค้า'}
          </p>
          <div className="h-14 border-b border-zinc-300 border-dashed w-48 mx-auto"></div>
          <div className="text-zinc-500 text-[11px] space-y-0.5">
            <p>(..........................................................)</p>
            <p>วันที่ ......./......./...........</p>
          </div>
        </div>

        <div className="text-center space-y-3">
          <p className="font-medium text-zinc-700">ผู้มีอำนาจลงนาม / พนักงานผู้ออกเอกสาร</p>
          <div className="h-14 border-b border-zinc-300 border-dashed w-48 mx-auto flex items-end justify-center pb-1 relative">
            {doc.showSignature !== false && settings.signatureImageUrl ? (
              <img
                src={settings.signatureImageUrl}
                alt="Authorized Signature"
                className="max-h-14 max-w-[170px] object-contain mb-1"
              />
            ) : doc.showSignature !== false && settings.signatureName ? (
              <span className="font-medium text-zinc-800 text-[11px]">{settings.signatureName}</span>
            ) : null}
          </div>
          <div className="text-zinc-500 text-[11px] space-y-0.5">
            <p>
              (
              {doc.showSignature !== false && settings.signatureName
                ? settings.signatureName
                : '..........................................................'}
              )
            </p>
            {settings.signatureTitle && <p className="text-[10px] text-zinc-400">{settings.signatureTitle}</p>}
            <p>วันที่ {doc.signatureDate || '......./......./...........'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
