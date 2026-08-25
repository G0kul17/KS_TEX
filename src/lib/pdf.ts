import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Exact W3C OKLCH / OKLAB to RGB converter.
 * Converts modern CSS colors (oklch, oklab) into standard rgb(...) / rgba(...) string
 * so html2canvas can render all text, borders, and backgrounds perfectly.
 */
function oklchToRgb(l: number, c: number, h: number, alpha: number = 1): string {
  if (isNaN(l)) l = 0;
  if (isNaN(c)) c = 0;
  if (isNaN(h)) h = 0;
  if (isNaN(alpha)) alpha = 1;

  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);
  return oklabToRgb(l, a, b, alpha);
}

function oklabToRgb(l: number, a: number, b: number, alpha: number = 1): string {
  if (isNaN(l)) l = 0;
  if (isNaN(a)) a = 0;
  if (isNaN(b)) b = 0;
  if (isNaN(alpha)) alpha = 1;

  // OKLAB -> LMS
  const L_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const M_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const S_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = L_ * L_ * L_;
  const m3 = M_ * M_ * M_;
  const s3 = S_ * S_ * S_;

  // LMS -> linear sRGB
  const r_lin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g_lin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const b_lin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  // Linear sRGB -> standard sRGB (gamma correction)
  const gamma = (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 255;
    const val = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    return Math.round(Math.min(255, Math.max(0, val * 255)));
  };

  const r = gamma(r_lin);
  const g = gamma(g_lin);
  const bRes = gamma(b_lin);

  if (alpha < 1) {
    return `rgba(${r}, ${g}, ${bRes}, ${Number(alpha.toFixed(3))})`;
  }
  return `rgb(${r}, ${g}, ${bRes})`;
}

function parseOklchStr(matchStr: string): string {
  try {
    const inner = matchStr.replace(/^oklch\(\s*/i, '').replace(/\s*\)$/, '');
    const [colorPart, alphaPart] = inner.split('/');
    const parts = colorPart.trim().split(/[\s,]+/);
    if (parts.length < 3) return matchStr;

    let l = parseFloat(parts[0]);
    if (parts[0].includes('%')) l /= 100;
    if (isNaN(l) || parts[0] === 'none') l = 0;

    let c = parseFloat(parts[1]);
    if (parts[1].includes('%')) c /= 100;
    if (isNaN(c) || parts[1] === 'none') c = 0;

    let h = parseFloat(parts[2]);
    if (parts[2].includes('deg')) h = parseFloat(parts[2]);
    else if (parts[2].includes('rad')) h = (parseFloat(parts[2]) * 180) / Math.PI;
    if (isNaN(h) || parts[2] === 'none') h = 0;

    let alpha = 1;
    if (alphaPart !== undefined) {
      let aVal = parseFloat(alphaPart.trim());
      if (alphaPart.includes('%')) aVal /= 100;
      if (!isNaN(aVal)) alpha = aVal;
    }

    return oklchToRgb(l, c, h, alpha);
  } catch {
    return matchStr;
  }
}

function parseOklabStr(matchStr: string): string {
  try {
    const inner = matchStr.replace(/^oklab\(\s*/i, '').replace(/\s*\)$/, '');
    const [colorPart, alphaPart] = inner.split('/');
    const parts = colorPart.trim().split(/[\s,]+/);
    if (parts.length < 3) return matchStr;

    let l = parseFloat(parts[0]);
    if (parts[0].includes('%')) l /= 100;
    if (isNaN(l) || parts[0] === 'none') l = 0;

    let a = parseFloat(parts[1]);
    if (parts[1].includes('%')) a /= 100;
    if (isNaN(a) || parts[1] === 'none') a = 0;

    let b = parseFloat(parts[2]);
    if (parts[2].includes('%')) b /= 100;
    if (isNaN(b) || parts[2] === 'none') b = 0;

    let alpha = 1;
    if (alphaPart !== undefined) {
      let aVal = parseFloat(alphaPart.trim());
      if (alphaPart.includes('%')) aVal /= 100;
      if (!isNaN(aVal)) alpha = aVal;
    }

    return oklabToRgb(l, a, b, alpha);
  } catch {
    return matchStr;
  }
}

const dummyCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
const dummyCtx = dummyCanvas ? dummyCanvas.getContext('2d') : null;

function convertModernColorsToRgb(cssText: string): string {
  if (!cssText || !/(?:oklch|oklab|lab|lch|color-mix|light-dark)/i.test(cssText)) {
    return cssText;
  }

  // 1. Replace oklch(...)
  let result = cssText.replace(/oklch\([^)]+\)/gi, (m) => parseOklchStr(m));

  // 2. Replace oklab(...)
  result = result.replace(/oklab\([^)]+\)/gi, (m) => parseOklabStr(m));

  // 3. Replace light-dark(...)
  result = result.replace(/light-dark\(\s*([^,]+)\s*,\s*[^)]+\)/gi, '$1');

  // 4. Fallback for color-mix(...)
  result = result.replace(/color-mix\([^)]+\)/gi, (m) => {
    if (dummyCtx) {
      try {
        dummyCtx.fillStyle = '#000000';
        dummyCtx.fillStyle = m;
        const res = dummyCtx.fillStyle;
        if (res && res !== '#000000' && !/color-mix/i.test(res)) {
          return res;
        }
      } catch {
        // ignore
      }
    }
    return 'rgba(0,0,0,0.05)';
  });

  return result;
}

/**
 * Capture the invoice preview element and export to pixel-faithful A4 PDF.
 */
export async function generateInvoicePdf(
  element: HTMLElement,
  fileName: string = 'KS_TEX_Invoice.pdf'
): Promise<boolean> {
  let origElements: HTMLElement[] = [];
  try {
    element.setAttribute('data-pdf-root', 'true');

    // Tag all original elements with unique data-pdf-id to guarantee 1:1 node matching
    origElements = [element, ...Array.from(element.querySelectorAll<HTMLElement>('*'))];
    origElements.forEach((el, index) => {
      el.setAttribute('data-pdf-id', index.toString());
    });

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      onclone: (clonedDoc) => {
        // Enforce light mode on cloned document
        if (clonedDoc.documentElement) {
          clonedDoc.documentElement.classList.remove('dark');
          clonedDoc.documentElement.style.colorScheme = 'light';
        }
        if (clonedDoc.body) {
          clonedDoc.body.classList.remove('dark');
          clonedDoc.body.style.backgroundColor = '#ffffff';
          clonedDoc.body.style.color = '#1a2332';
          clonedDoc.body.style.colorScheme = 'light';
        }

        // Clear adoptedStyleSheets if present
        if ('adoptedStyleSheets' in clonedDoc) {
          try {
            (clonedDoc as unknown as { adoptedStyleSheets: unknown[] }).adoptedStyleSheets = [];
          } catch {
            // Ignore
          }
        }

        // Set fixed A4 dimensions on cloned root target for exact 1-page paper proportions
        const clonedTarget = clonedDoc.querySelector<HTMLElement>('[data-pdf-root="true"]');
        if (clonedTarget) {
          clonedTarget.style.width = '794px';
          clonedTarget.style.maxWidth = '794px';
          clonedTarget.style.minWidth = '794px';
          clonedTarget.style.boxSizing = 'border-box';
          clonedTarget.style.margin = '0 auto';
          clonedTarget.style.padding = '16px';
          clonedTarget.style.backgroundColor = '#ffffff';
          clonedTarget.style.color = '#1a2332';
          clonedTarget.style.colorScheme = 'light';
        }

        // 1. Transfer exact computed styles 1:1 from live DOM onto cloned DOM
        const colorProps = [
          'color',
          'background-color',
          'border-top-color',
          'border-right-color',
          'border-bottom-color',
          'border-left-color',
          'fill',
          'stroke',
        ];

        origElements.forEach((origEl) => {
          const pdfId = origEl.getAttribute('data-pdf-id');
          if (!pdfId) return;

          const cloneEl = clonedDoc.querySelector<HTMLElement>(`[data-pdf-id="${pdfId}"]`);
          if (!cloneEl) return;

          try {
            const computed = window.getComputedStyle(origEl);
            colorProps.forEach((prop) => {
              const val = computed.getPropertyValue(prop);
              if (val && val !== 'rgba(0, 0, 0, 0)' && val !== 'transparent') {
                const cleanVal = convertModernColorsToRgb(val);
                cloneEl.style.setProperty(prop, cleanVal, 'important');
              }
            });
          } catch {
            // Ignore
          }
        });

        // 2. Sanitize all <style> tags in cloned doc to standard RGB / RGBA
        const styleElements = Array.from(clonedDoc.querySelectorAll('style'));
        styleElements.forEach((styleTag) => {
          if (styleTag.textContent) {
            styleTag.textContent = convertModernColorsToRgb(styleTag.textContent);
          }
        });

        // 3. Sanitize all <link rel="stylesheet"> tags
        const linkElements = Array.from(clonedDoc.querySelectorAll('link[rel="stylesheet"]'));
        linkElements.forEach((link) => {
          try {
            const sheet = (link as HTMLLinkElement).sheet;
            if (sheet) {
              let cssText = '';
              try {
                const rules = Array.from(sheet.cssRules || []);
                cssText = rules.map((r) => r.cssText).join('\n');
              } catch {
                // Cross-origin
              }
              if (cssText) {
                const cleanCss = convertModernColorsToRgb(cssText);
                const newStyle = clonedDoc.createElement('style');
                newStyle.textContent = cleanCss;
                if (link.parentNode) {
                  link.parentNode.replaceChild(newStyle, link);
                }
              }
            }
          } catch {
            // Ignore
          }
        });

        // 4. Sanitize inline style attributes on cloned elements
        const allCloned = Array.from(clonedDoc.querySelectorAll<HTMLElement>('*'));
        allCloned.forEach((el) => {
          if (el.style && el.style.cssText) {
            if (/(?:oklch|oklab|lab|lch|color-mix|light-dark)/i.test(el.style.cssText)) {
              el.style.cssText = convertModernColorsToRgb(el.style.cssText);
            }
          }
        });
      },
    });

    // Clean up data-pdf-id attributes
    element.removeAttribute('data-pdf-root');
    origElements.forEach((el) => el.removeAttribute('data-pdf-id'));

    const imgData = canvas.toDataURL('image/png');

    // Create jsPDF instance (A4 portrait: 210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    // Scale image to fit standard A4 width
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pdfHeight + 5) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight), undefined, 'FAST');
    } else {
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
    }

    pdf.save(fileName);
    return true;
  } catch (error) {
    element.removeAttribute('data-pdf-root');
    if (origElements && origElements.length > 0) {
      origElements.forEach((el) => el.removeAttribute('data-pdf-id'));
    }
    console.error('PDF Generation failed:', error);
    return false;
  }
}

/**
 * Trigger native print dialog for the invoice element.
 */
export function printInvoiceElement(element: HTMLElement, title: string = 'KS TEX — Print Invoice'): void {
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
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
          <title>${title}</title>
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
                try {
                  window.print();
                  window.close();
                } catch(e) {}
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } catch (e) {
    console.warn('Pop-up or window.open blocked by sandbox environment:', e);
    try {
      window.print();
    } catch (err) {
      console.error('window.print failed:', err);
    }
  }
}

export const downloadInvoicePDF = generateInvoicePdf;
