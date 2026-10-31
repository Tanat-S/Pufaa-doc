import { CompanySettings, DocumentData } from '../types/document';
import { buildDocumentHtml } from './printHelper';

/**
 * Downloads the document in native web document format (HTML / A4 Vector Layout).
 * This completely eliminates raster canvas bitmap blurring.
 * Users can open this file in any browser or viewer with 100% vector text,
 * selectable fonts, crystal clear logos, and press Ctrl+P / Cmd+P to export as a native vector PDF.
 */
export function downloadVectorDocument(doc: DocumentData, settings: CompanySettings): void {
  const htmlContent = buildDocumentHtml(doc, settings, false);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${doc.docNumber}.html`;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Generates an ultra high-resolution A4 PDF blob (3.5x supersampled scale).
 * Used for Google Drive upload and direct PDF download with maximum crispness.
 */
export async function generateUltraCrispPdfBlob(
  doc: DocumentData,
  settings: CompanySettings
): Promise<Blob> {
  const jsPDF = (await import('jspdf')).default;
  const html2canvas = (await import('html2canvas')).default;

  // Create isolated sandbox iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.style.width = '794px';
  iframe.style.height = '1123px';
  iframe.style.border = '0';
  iframe.style.zIndex = '-9999';
  iframe.setAttribute('title', 'PDF Generator Sandbox');

  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!iframeDoc) {
      throw new Error('ไม่สามารถสร้าง Sandbox สำหรับเรนเดอร์ PDF ได้');
    }

    const htmlContent = buildDocumentHtml(doc, settings, false);
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Wait for fonts in the iframe
    if (iframeDoc.fonts) {
      try {
        await iframeDoc.fonts.ready;
      } catch (e) {
        // ignore font readiness errors
      }
    }

    // Allow browser layout and image loading to settle
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Capture with 3.5x scale (Ultra-Crisp Print Resolution ~300 DPI)
    const canvas = await html2canvas(iframeDoc.body, {
      scale: 3.5,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      imageTimeout: 15000,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    if (pdfHeight <= 297) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    } else {
      let position = 0;
      let heightLeft = pdfHeight;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
      heightLeft -= 297;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
        heightLeft -= 297;
      }
    }

    return pdf.output('blob');
  } finally {
    setTimeout(() => {
      try {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      } catch (e) {
        // ignore
      }
    }, 500);
  }
}

/**
 * Downloads high-resolution PDF file directly to user device
 */
export async function generatePdfFromDocData(
  doc: DocumentData,
  settings: CompanySettings,
  download: boolean = true
): Promise<Blob> {
  const pdfBlob = await generateUltraCrispPdfBlob(doc, settings);

  if (download) {
    const fileName = `${doc.docNumber}.pdf`;
    const url = URL.createObjectURL(pdfBlob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = fileName;
    window.document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000);
  }

  return pdfBlob;
}
