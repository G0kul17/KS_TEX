import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Capture the invoice preview element and export to pixel-faithful A4 PDF.
 */
export async function generateInvoicePdf(
  element: HTMLElement,
  fileName: string = 'KS_TEX_Invoice.pdf'
): Promise<boolean> {
  try {
    // Clone or capture element with high DPI settings
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff', // Always crisp light paper for official invoices
      windowWidth: 1200,
    });

    const imgData = canvas.toDataURL('image/png');

    // Create jsPDF instance (A4 portrait: 210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Handle overflow pages if invoice exceeds 1 page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('PDF Generation failed:', error);
    return false;
  }
}

/**
 * Trigger native print dialog for the invoice element.
 */
export function printInvoiceElement(element: HTMLElement): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    // Fallback if popup blocked
    window.print();
    return;
  }

  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((style) => style.outerHTML)
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>KS TEX — Print Invoice</title>
        ${styles}
        <style>
          body {
            background-color: #ffffff !important;
            margin: 0;
            padding: 10mm;
            font-family: 'Inter', sans-serif;
          }
          @page {
            size: A4 portrait;
            margin: 5mm;
          }
        </style>
      </head>
      <body>
        <div style="max-width: 210mm; margin: 0 auto;">
          ${element.outerHTML}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
