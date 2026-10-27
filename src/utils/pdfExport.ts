import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CompanySettings, DocumentData } from '../types/document';
import { buildDocumentHtml } from './printHelper';

/**
 * Generates an A4 PDF from document data inside an isolated sandbox iframe.
 * This completely isolates html2canvas from Tailwind CSS v4's oklch() color syntax,
 * permanently resolving the "Attempting to parse an unsupported color function 'oklch'" error.
 */
export async function generatePdfFromDocData(
  doc: DocumentData,
  settings: CompanySettings,
  download: boolean = true
): Promise<Blob> {
  // Create an isolated sandbox iframe
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
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Capture body of isolated iframe (100% clean HEX/RGB colors, no oklch)
    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.96);

    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    if (pdfHeight <= 297) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    } else {
      let position = 0;
      let heightLeft = pdfHeight;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= 297;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= 297;
      }
    }

    const fileName = `${doc.docNumber}.pdf`;
    const pdfBlob = pdf.output('blob');

    if (download) {
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
  } finally {
    // Always clean up sandbox iframe
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
