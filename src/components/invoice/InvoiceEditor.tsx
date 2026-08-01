import React, { useRef, useState } from 'react';
import { Invoice } from '../../types';
import { InvoiceForm } from './InvoiceForm';
import { InvoicePreview } from './InvoicePreview';
import { generateInvoicePdf, printInvoiceElement } from '../../lib/pdf';
import { saveInvoice, getNextInvoiceNumber, DEFAULT_SETTINGS } from '../../lib/storage';
import { useTheme } from '../../context/ThemeContext';
import { 
  FileCheck, 
  FileClock, 
  Printer, 
  FileDown, 
  RotateCcw, 
  Eye, 
  X, 
  CheckCircle2, 
  Sparkles,
  Loader2
} from 'lucide-react';

interface InvoiceEditorProps {
  initialInvoice?: Invoice | null;
  onInvoiceSaved: () => void;
}

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ initialInvoice, onInvoiceSaved }) => {
  const { settings } = useTheme();
  const previewRef = useRef<HTMLDivElement | null>(null);

  // Initialize new blank invoice structure
  const createBlankInvoice = (): Invoice => {
    const nextNo = getNextInvoiceNumber(settings.invoicePrefix || 'FY');
    return {
      id: `inv_${Date.now()}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      companyDetails: { ...settings.defaultCompanyDetails },
      bankDetails: { ...settings.defaultBankDetails },
      termsConditions: settings.defaultTerms,
      invoiceDetails: {
        invoiceNo: nextNo,
        invoiceDate: new Date().toISOString().split('T')[0],
        challanNo: '',
        agentName: 'Ramesh Shah & Sons',
        gstType: settings.defaultGstType || 'INTRA_STATE',
        cgstPercent: settings.defaultCgstPercent || 2.5,
        sgstPercent: settings.defaultSgstPercent || 2.5,
        igstPercent: settings.defaultIgstPercent || 5.0,
      },
      buyerDetails: {
        companyName: '',
        address: '',
        city: 'Surat',
        state: 'Gujarat',
        gstin: '',
        pan: '',
        phone: '',
      },
      deliveryDetails: {
        sameAsBuyer: true,
        companyName: '',
        address: '',
        city: 'Surat',
        state: 'Gujarat',
        gstin: '',
      },
      transportDetails: {
        enabled: false,
        transporter: '',
        transportGstin: '',
        vehicleNo: '',
        lrNo: '',
        lrDate: new Date().toISOString().split('T')[0],
      },
      items: [
        {
          id: `item_${Date.now()}`,
          srNo: 1,
          description: 'Polyester Filament Textured Yarn 150/48 Nim',
          hsn: '5402',
          carton: 10,
          cheese: 240,
          weightKg: 200,
          weightGram: 0,
          denier: settings.denierOptions[0] || '150',
          shade: settings.shadeOptions[0]?.name || 'Natural White',
          lotNo: 'LOT-A10',
          grade: 'A',
          rate: 140,
          amount: 28000,
        },
      ],
      totals: {
        totalCartons: 10,
        totalCheese: 240,
        totalWeightKg: 200,
        grossRateAvg: 140,
        amountBeforeTax: 28000,
        cgstAmount: 700,
        sgstAmount: 700,
        igstAmount: 0,
        totalTaxAmount: 1400,
        amountAfterTax: 29400,
        amountInWords: 'Rupees Twenty Nine Thousand Four Hundred Only',
      },
    };
  };

  const [invoice, setInvoice] = useState<Invoice>(() => initialInvoice || createBlankInvoice());
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showMobilePreviewModal, setShowMobilePreviewModal] = useState(false);

  // Reset form
  const handleResetForm = () => {
    setInvoice(createBlankInvoice());
    setShowConfirmReset(false);
  };

  // Save as Draft
  const handleSaveDraft = () => {
    const updatedDraft: Invoice = {
      ...invoice,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    };
    saveInvoice(updatedDraft);
    onInvoiceSaved();
  };

  // Generate Finalized Invoice & PDF
  const handleGeneratePdfAndFinalize = async () => {
    setIsGeneratingPdf(true);

    const finalizedInvoice: Invoice = {
      ...invoice,
      status: 'finalized',
      updatedAt: new Date().toISOString(),
    };

    saveInvoice(finalizedInvoice);

    if (previewRef.current) {
      const fileName = `KS_TEX_Invoice_${finalizedInvoice.invoiceDetails.invoiceNo}.pdf`;
      await generateInvoicePdf(previewRef.current, fileName);
    }

    setIsGeneratingPdf(false);
    setShowSuccessDialog(true);
    onInvoiceSaved();
  };

  // Print Invoice
  const handlePrint = () => {
    if (previewRef.current) {
      printInvoiceElement(previewRef.current);
    }
  };

  return (
    <div className="relative pb-24 min-h-[calc(100vh-60px)]">
      
      {/* Top Bar Status Indicator */}
      <div className="p-4 lg:p-6 pb-2 max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="font-serif-display text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">
            Invoice Generator
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Editing Invoice #{invoice.invoiceDetails.invoiceNo} — Live A4 Preview Active
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {invoice.status === 'finalized' ? (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-[var(--status-success)]/15 text-[var(--status-success)] border border-[var(--status-success)]/30">
              Finalized
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-[var(--accent-terracotta)]/15 text-[var(--accent-terracotta)] border border-[var(--accent-terracotta)]/30">
              Draft State
            </span>
          )}
        </div>
      </div>

      <div className="px-4 lg:px-6 max-w-7xl mx-auto">
        <div className="thread-stitch"></div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="p-4 lg:p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <InvoiceForm
            invoice={invoice}
            onChange={setInvoice}
            onReset={() => setShowConfirmReset(true)}
          />
        </div>

        {/* Right Column: Sticky Live A4 Invoice Preview (5 cols) */}
        <div className="hidden lg:block lg:col-span-5 sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto pr-1">
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 text-xs font-mono text-[var(--text-muted)]">
              <span>Live A4 Physical Document Replica</span>
              <span className="text-[var(--accent-brass)]">Auto-sync ON</span>
            </div>

            <InvoicePreview invoice={invoice} previewRef={previewRef} />
          </div>
        </div>

      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--bg-surface)]/95 backdrop-blur-md border-t border-[var(--border-solid)] py-3 px-4 lg:px-8 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Mobile Preview Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMobilePreviewModal(true)}
              className="lg:hidden inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-solid)] text-[var(--text-primary)] text-xs font-semibold cursor-pointer"
            >
              <Eye className="w-4 h-4 text-[var(--accent-brass)]" />
              <span>Preview (A4)</span>
            </button>

            <button
              onClick={() => setShowConfirmReset(true)}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-[var(--border-hairline)] text-[var(--text-muted)] hover:text-[var(--status-error)] hover:bg-[var(--status-error)]/10 text-xs font-mono cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3">
            
            {/* Save Draft */}
            <button
              onClick={handleSaveDraft}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-[var(--border-solid)] bg-[var(--bg-base)] text-[var(--text-primary)] text-xs font-semibold hover:border-[var(--accent-brass)] transition-colors cursor-pointer shadow-xs"
            >
              <FileClock className="w-4 h-4 text-[var(--accent-terracotta)]" />
              <span className="hidden sm:inline">Save Draft</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-[var(--border-solid)] bg-[var(--bg-base)] text-[var(--text-primary)] text-xs font-semibold hover:border-[var(--accent-brass)] transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-[var(--accent-brass)]" />
              <span>Print</span>
            </button>

            {/* Primary Gold: Generate PDF */}
            <button
              onClick={handleGeneratePdfAndFinalize}
              disabled={isGeneratingPdf}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[var(--accent-brass)] text-[#15130f] text-xs font-bold hover:bg-[#d4b068] active:scale-98 transition-all duration-200 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Rendering PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Export PDF & Finalize</span>
                </>
              )}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Fullscreen A4 Preview Modal */}
      {showMobilePreviewModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-base)]">
          <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-surface)] border-b border-[var(--border-solid)]">
            <span className="font-serif-display font-bold text-sm text-[var(--text-primary)]">
              A4 Invoice Preview
            </span>
            <button
              onClick={() => setShowMobilePreviewModal(false)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex justify-center">
            <div className="w-full max-w-[210mm]">
              <InvoicePreview invoice={invoice} />
            </div>
          </div>
        </div>
      )}

      {/* Success Confirmation Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[var(--bg-surface)] p-6 border border-[var(--accent-brass)]/40 shadow-2xl space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--status-success)]/15 text-[var(--status-success)] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">
                Invoice Generated & Exported!
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Invoice #{invoice.invoiceDetails.invoiceNo} has been finalized and saved to your offline ledger. The PDF has been downloaded to your browser.
              </p>
            </div>

            <div className="thread-stitch !my-3"></div>

            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowSuccessDialog(false)}
                className="px-5 py-2.5 rounded-xl bg-[var(--accent-brass)] text-[#15130f] text-xs font-semibold hover:bg-[#d4b068] cursor-pointer"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--bg-surface)] p-6 border border-[var(--status-error)]/40 shadow-2xl space-y-4 text-center">
            <h3 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
              Reset Invoice Fields?
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              This will clear all current input fields and restore the blank template with the next auto-incrementing invoice number. Unsaved changes will be lost.
            </p>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 rounded-xl text-xs text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetForm}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--status-error)] text-white hover:bg-[#a54338] cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
