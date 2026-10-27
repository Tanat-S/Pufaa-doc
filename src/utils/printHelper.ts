import { CompanySettings, DocumentData } from '../types/document';
import { formatCurrency, formatThaiBahtText } from './thaiBaht';
import { DOC_TYPE_CONFIG } from '../types/document';

/**
 * Builds standalone, self-contained HTML for the document using standard HEX colors.
 * Completely free of Tailwind CSS v4 or modern oklch() color syntax,
 * making it 100% compatible with html2canvas and browser print engines.
 */
export function buildDocumentHtml(
  doc: DocumentData,
  settings: CompanySettings,
  includePrintScript: boolean = true
): string {
  const config = DOC_TYPE_CONFIG[doc.docType] || DOC_TYPE_CONFIG.RC;
  const bahtText = doc.bahtText || formatThaiBahtText(doc.grandTotal);

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>${doc.docNumber} - ${config.thTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 10mm 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #18181b;
      background: #ffffff;
      padding: 20px;
      width: 794px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #e4e4e7;
      padding-bottom: 16px;
      margin-bottom: 16px;
    }
    .company-info {
      flex: 1;
    }
    .company-name {
      font-size: 16px;
      font-weight: 700;
      color: #09090b;
      margin-bottom: 2px;
    }
    .company-name-en {
      font-size: 11px;
      color: #71717a;
      margin-bottom: 4px;
    }
    .company-detail {
      font-size: 11px;
      color: #52525b;
      line-height: 1.4;
    }
    .doc-badge-box {
      text-align: right;
    }
    .doc-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 4px;
      border: 1px solid ${config.color}40;
      background: ${config.color}10;
      margin-bottom: 8px;
    }
    .doc-title {
      font-size: 18px;
      font-weight: 700;
      color: ${config.color};
    }
    .doc-subtitle {
      font-size: 10px;
      font-weight: 600;
      color: #71717a;
      letter-spacing: 1px;
    }
    .meta-table {
      font-size: 11px;
      margin-left: auto;
    }
    .meta-table td {
      padding: 2px 4px;
    }
    .meta-label {
      color: #71717a;
      text-align: right;
    }
    .meta-val {
      font-weight: 600;
      color: #09090b;
      font-family: monospace;
    }
    .client-card {
      display: flex;
      justify-content: space-between;
      background: #fbfbfb;
      border: 1px solid #e4e4e7;
      border-radius: 4px;
      padding: 10px 14px;
      margin-bottom: 16px;
      font-size: 11px;
    }
    .client-title {
      font-size: 9px;
      font-weight: 700;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .client-name {
      font-size: 13px;
      font-weight: 700;
      color: #09090b;
    }
    .booking-card {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 4px;
      padding: 10px 14px;
      margin-bottom: 16px;
      font-size: 11px;
    }
    .booking-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-top: 6px;
    }
    .booking-field-label {
      color: #78716c;
      font-size: 10px;
    }
    .booking-field-val {
      font-weight: 600;
      color: #1c1917;
    }
    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 11px;
    }
    table.items-table th {
      background: #f4f4f5;
      border-top: 2px solid #d4d4d8;
      border-bottom: 2px solid #d4d4d8;
      padding: 8px 6px;
      font-weight: 600;
      color: #3f3f46;
      text-align: left;
    }
    table.items-table td {
      border-bottom: 1px solid #e4e4e7;
      padding: 8px 6px;
      vertical-align: top;
    }
    .summary-section {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 24px;
      font-size: 11px;
    }
    .summary-left {
      flex: 1.3;
    }
    .summary-right {
      flex: 0.9;
      background: #fafafa;
      border: 1px solid #e4e4e7;
      border-radius: 4px;
      padding: 10px 14px;
    }
    .baht-box {
      background: #f4f4f5;
      padding: 6px 10px;
      border-radius: 4px;
      margin-bottom: 10px;
      font-size: 11px;
      display: flex;
      justify-content: space-between;
    }
    .bank-box {
      background: #fbfbfb;
      border: 1px solid #e4e4e7;
      border-radius: 4px;
      padding: 8px 10px;
      margin-bottom: 8px;
      font-size: 10.5px;
      color: #3f3f46;
    }
    .math-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
      color: #52525b;
    }
    .math-row.grand-total {
      font-size: 13px;
      font-weight: 700;
      color: #09090b;
      border-top: 1px solid #d4d4d8;
      margin-top: 4px;
      padding-top: 6px;
    }
    .signatures {
      display: flex;
      justify-content: space-around;
      margin-top: 36px;
      text-align: center;
      font-size: 11px;
    }
    .sig-line {
      width: 180px;
      border-bottom: 1px dashed #a1a1aa;
      margin: 40px auto 6px auto;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      ${
        settings.logoUrl
          ? `<img src="${settings.logoUrl}" style="max-height: 50px; max-width: 140px; margin-bottom: 6px; display: block;" />`
          : ''
      }
      <div class="company-name">${settings.companyName || ''}</div>
      ${settings.companyNameEn ? `<div class="company-name-en">${settings.companyNameEn}</div>` : ''}
      <div class="company-detail">
        ${settings.address ? `<div>${settings.address}</div>` : ''}
        <div>
          ${settings.phone ? `โทร: ${settings.phone} ` : ''}
          ${settings.email ? `อีเมล: ${settings.email}` : ''}
        </div>
        ${settings.taxId ? `<div>เลขประจำตัวผู้เสียภาษี: ${settings.taxId}</div>` : ''}
      </div>
    </div>
    <div class="doc-badge-box">
      <div class="doc-badge">
        <div class="doc-title">${config.thTitle}</div>
        <div class="doc-subtitle">${config.enTitle}</div>
      </div>
      <table class="meta-table">
        <tr>
          <td class="meta-label">เลขที่เอกสาร:</td>
          <td class="meta-val">${doc.docNumber}</td>
        </tr>
        <tr>
          <td class="meta-label">วันที่ออก:</td>
          <td class="meta-val">${doc.date}</td>
        </tr>
        ${
          doc.dueDate && doc.docType !== 'CF'
            ? `<tr>
                <td class="meta-label">ครบกำหนด:</td>
                <td class="meta-val">${doc.dueDate}</td>
              </tr>`
            : ''
        }
      </table>
    </div>
  </div>

  <div class="client-card">
    <div>
      <div class="client-title">${doc.docType === 'CF' ? 'ข้อมูลผู้เข้าพัก' : 'ข้อมูลลูกค้า'}</div>
      <div class="client-name">${doc.customer.name || '-'}</div>
      ${doc.customer.branch ? `<div>สาขา: ${doc.customer.branch}</div>` : ''}
      ${doc.customer.address ? `<div style="margin-top: 3px; color: #52525b;">${doc.customer.address.replace(/\n/g, '<br>')}</div>` : ''}
    </div>
    <div style="text-align: right; color: #52525b;">
      ${doc.customer.taxId ? `<div>เลขประจำตัวผู้เสียภาษี: ${doc.customer.taxId}</div>` : ''}
      ${doc.customer.phone ? `<div>เบอร์โทรศัพท์: ${doc.customer.phone}</div>` : ''}
      ${doc.customer.email ? `<div>อีเมล: ${doc.customer.email}</div>` : ''}
    </div>
  </div>

  ${
    doc.docType === 'CF' && doc.booking
      ? `
    <div class="booking-card">
      <div style="font-weight: 700; color: #92400e; margin-bottom: 4px;">รายละเอียดการจองห้องพัก</div>
      <div class="booking-grid">
        <div>
          <span class="booking-field-label">ประเภทห้อง:</span><br>
          <span class="booking-field-val">${doc.booking.roomType || '-'}</span>
        </div>
        <div>
          <span class="booking-field-label">หมายเลขห้อง:</span><br>
          <span class="booking-field-val">${doc.booking.roomNumber || '-'}</span>
        </div>
        <div>
          <span class="booking-field-label">วันเช็คอิน:</span><br>
          <span class="booking-field-val">${doc.booking.checkInDate || '-'} ${doc.booking.checkInTime || ''}</span>
        </div>
        <div>
          <span class="booking-field-label">วันเช็คเอาท์:</span><br>
          <span class="booking-field-val">${doc.booking.checkOutDate || '-'} ${doc.booking.checkOutTime || ''}</span>
        </div>
        <div>
          <span class="booking-field-label">จำนวนคืน:</span><br>
          <span class="booking-field-val">${doc.booking.nights || 1} คืน</span>
        </div>
        <div>
          <span class="booking-field-label">ผู้เข้าพัก:</span><br>
          <span class="booking-field-val">ผู้ใหญ่ ${doc.booking.adults || 1} ท่าน ${doc.booking.children ? `, เด็ก ${doc.booking.children} ท่าน` : ''}</span>
        </div>
        <div style="grid-column: span 2;">
          <span class="booking-field-label">แผนอาหาร:</span><br>
          <span class="booking-field-val">${doc.booking.mealPlan || '-'}</span>
        </div>
      </div>
    </div>`
      : ''
  }

  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 30px; text-align: center;">#</th>
        <th>รายการ</th>
        <th style="width: 50px; text-align: center;">จำนวน</th>
        <th style="width: 50px; text-align: center;">หน่วย</th>
        <th style="width: 80px; text-align: right;">ราคา/หน่วย</th>
        <th style="width: 60px; text-align: right;">ส่วนลด</th>
        <th style="width: 90px; text-align: right;">จำนวนเงิน</th>
      </tr>
    </thead>
    <tbody>
      ${doc.items
        .map(
          (item, idx) => `
        <tr>
          <td style="text-align: center; color: #a1a1aa;">${idx + 1}</td>
          <td>
            <strong>${item.name}</strong>
            ${item.description ? `<div style="font-size: 10px; color: #71717a; margin-top: 2px;">${item.description.replace(/\n/g, '<br>')}</div>` : ''}
          </td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: center;">${item.unit || '-'}</td>
          <td style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
          <td style="text-align: right; color: #71717a;">${item.discount > 0 ? formatCurrency(item.discount) : '-'}</td>
          <td style="text-align: right; font-weight: 600;">${formatCurrency(item.amount)}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="summary-section">
    <div class="summary-left">
      <div class="baht-box">
        <span style="color: #71717a;">ตัวอักษร:</span>
        <span style="font-weight: 600; color: #18181b;">${bahtText}</span>
      </div>

      ${
        settings.bankAccountNo
          ? `
        <div class="bank-box">
          <div style="font-weight: 700; margin-bottom: 2px; color: #18181b;">ช่องทางการชำระเงิน:</div>
          <div>ธนาคาร: ${settings.bankName || ''}</div>
          <div>เลขที่บัญชี: <strong>${settings.bankAccountNo}</strong> (${settings.bankAccountName || ''})</div>
          ${settings.promptPayNo ? `<div>พร้อมเพย์: ${settings.promptPayNo}</div>` : ''}
        </div>`
          : ''
      }

      ${doc.notes ? `<div style="margin-top: 6px; color: #52525b; font-size: 10.5px;"><strong>หมายเหตุ:</strong> ${doc.notes.replace(/\n/g, '<br>')}</div>` : ''}
      ${doc.paymentTerms ? `<div style="margin-top: 4px; color: #52525b; font-size: 10.5px;"><strong>เงื่อนไข:</strong> ${doc.paymentTerms.replace(/\n/g, '<br>')}</div>` : ''}
    </div>

    <div class="summary-right">
      <div class="math-row">
        <span>รวมเป็นเงิน:</span>
        <span>${formatCurrency(doc.subtotal)} บาท</span>
      </div>
      ${
        doc.discountAmount > 0
          ? `<div class="math-row" style="color: #e11d48;">
              <span>ส่วนลด ${doc.discountPercent > 0 ? `(${doc.discountPercent}%)` : ''}:</span>
              <span>-${formatCurrency(doc.discountAmount)} บาท</span>
            </div>`
          : ''
      }
      ${
        doc.vatEnabled
          ? `<div class="math-row">
              <span>ภาษีมูลค่าเพิ่ม VAT ${doc.vatRate}%:</span>
              <span>${formatCurrency(doc.vatAmount)} บาท</span>
            </div>`
          : ''
      }
      <div class="math-row grand-total">
        <span>ยอดรวมทั้งสิ้น:</span>
        <span style="color: ${config.color}; font-size: 14px;">${formatCurrency(doc.grandTotal)} บาท</span>
      </div>
      ${
        doc.paidAmount > 0 || doc.status === 'paid'
          ? `<div class="math-row" style="color: #059669; margin-top: 4px; font-weight: 600;">
              <span>ชำระแล้ว:</span>
              <span>${formatCurrency(doc.paidAmount)} บาท</span>
            </div>`
          : ''
      }
      ${
        doc.remainingAmount > 0 && doc.status !== 'paid'
          ? `<div class="math-row" style="color: #d97706; font-weight: 600;">
              <span>ยอดค้างชำระ:</span>
              <span>${formatCurrency(doc.remainingAmount)} บาท</span>
            </div>`
          : ''
      }
    </div>
  </div>

  <div class="signatures">
    <div>
      <div>${doc.docType === 'CF' ? 'ผู้เข้าพัก / ผู้จอง' : 'ผู้รับบริการ / ลูกค้า'}</div>
      <div class="sig-line"></div>
      <div style="color: #71717a;">(...................................................)</div>
      <div style="color: #a1a1aa; font-size: 10px; margin-top: 2px;">วันที่ ......./......./...........</div>
    </div>
    <div>
      <div>ผู้มีอำนาจลงนาม / พนักงาน</div>
      <div class="sig-line"></div>
      <div style="color: #18181b; font-weight: 500;">(${settings.signatureName || '...................................................'})</div>
      ${settings.signatureTitle ? `<div style="color: #71717a; font-size: 10px;">${settings.signatureTitle}</div>` : ''}
      <div style="color: #a1a1aa; font-size: 10px; margin-top: 2px;">วันที่ ......./......./...........</div>
    </div>
  </div>

  ${
    includePrintScript
      ? `
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 300);
    };
  </script>`
      : ''
  }
</body>
</html>`;
}

/**
 * Robust print helper that prints the document in an isolated iframe
 */
export function printDocumentIsolated(doc: DocumentData, settings: CompanySettings): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('title', 'Print Document');

  document.body.appendChild(iframe);

  const docHtml = buildDocumentHtml(doc, settings, true);
  const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;

  if (iframeDoc) {
    iframeDoc.open();
    iframeDoc.write(docHtml);
    iframeDoc.close();

    setTimeout(() => {
      try {
        document.body.removeChild(iframe);
      } catch (e) {
        // ignore
      }
    }, 60000);
  }
}
