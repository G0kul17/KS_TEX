import React, { useState } from 'react';
import { Invoice, GoodsItem, GstType, GradeType } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { numberToWordsIndian } from '../../lib/numberToWords';
import { BRAND_LOGO_DEFAULT, getStoredInvoices } from '../../lib/storage';
import { 
  Building2, 
  FileText, 
  FileDiff,
  UserCheck, 
  Truck, 
  Package, 
  Calculator, 
  Landmark, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Upload, 
  RotateCcw,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Search,
  ChevronDown,
  Link2,
  Check
} from 'lucide-react';

interface InvoiceFormProps {
  invoice: Invoice;
  onChange: (updatedInvoice: Invoice) => void;
  onReset: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onChange, onReset }) => {
  const { settings, updateSettings } = useTheme();

  const [newDenierInput, setNewDenierInput] = useState('');
  const [showAddDenierModal, setShowAddDenierModal] = useState(false);

  const [newShadeName, setNewShadeName] = useState('');
  const [newShadeNo, setNewShadeNo] = useState('');
  const [newShadeColor, setNewShadeColor] = useState('#C6A15B');
  const [showAddShadeModal, setShowAddShadeModal] = useState(false);

  // Searchable original invoice selector for Debit Notes
  const [isInvoicePickerOpen, setIsInvoicePickerOpen] = useState(false);
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');

  const isDebitNote = invoice.documentType === 'debit_note';
  const isDateOrderInvalid = isDebitNote && Boolean(
    invoice.invoiceDetails.includeInvoiceDate &&
    invoice.invoiceDetails.invoiceDate &&
    invoice.invoiceDetails.returnDate &&
    invoice.invoiceDetails.returnDate < invoice.invoiceDetails.invoiceDate
  );
  const isMissingOriginalInvoice = isDebitNote && !invoice.invoiceDetails.originalInvoiceNo?.trim();

  // Search through existing finalized and draft invoices to link
  const storedInvoices = getStoredInvoices();
  const selectableInvoices = storedInvoices.filter(
    (inv) => (inv.documentType || 'invoice') === 'invoice' || !inv.invoiceDetails.invoiceNo.startsWith('DN')
  );
  const filteredSelectableInvoices = selectableInvoices.filter((inv) => {
    const q = invoiceSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      inv.invoiceDetails.invoiceNo.toLowerCase().includes(q) ||
      inv.buyerDetails.companyName.toLowerCase().includes(q) ||
      inv.buyerDetails.gstin.toLowerCase().includes(q)
    );
  });

  const handleSelectOriginalInvoice = (selectedInv: Invoice) => {
    const updatedDetails = {
      ...invoice.invoiceDetails,
      originalInvoiceNo: selectedInv.invoiceDetails.invoiceNo,
      invoiceDate: selectedInv.invoiceDetails.invoiceDate || '',
      includeInvoiceDate: Boolean(selectedInv.invoiceDetails.invoiceDate),
      gstType: selectedInv.invoiceDetails.gstType,
      cgstPercent: selectedInv.invoiceDetails.cgstPercent,
      sgstPercent: selectedInv.invoiceDetails.sgstPercent,
      igstPercent: selectedInv.invoiceDetails.igstPercent,
    };

    const updated: Invoice = {
      ...invoice,
      invoiceDetails: updatedDetails,
      buyerDetails: { ...selectedInv.buyerDetails },
      deliveryDetails: { ...selectedInv.deliveryDetails },
    };

    recalculateTotals(updated);
    setIsInvoicePickerOpen(false);
    setInvoiceSearchQuery('');
  };

  // Helper to trigger state updates
  const updateInvoiceState = (field: keyof Invoice, value: any) => {
    const updated = { ...invoice, [field]: value };
    recalculateTotals(updated);
  };

  const updateSubSection = <K extends keyof Invoice>(section: K, field: string, value: any) => {
    const currentSection = invoice[section] as Record<string, any>;
    const updatedSection = { ...currentSection, [field]: value };
    const updated = { ...invoice, [section]: updatedSection };

    // When modifying buyerDetails while sameAsBuyer is checked, synchronize deliveryDetails
    if (section === 'buyerDetails' && invoice.deliveryDetails?.sameAsBuyer) {
      updated.deliveryDetails = {
        ...updated.deliveryDetails,
        [field]: value,
      };
    }

    recalculateTotals(updated);
  };

  // Recalculate totals dynamically
  const recalculateTotals = (inv: Invoice) => {
    let totalCartons = 0;
    let totalCheese = 0;
    let totalWeightKg = 0;
    let amountBeforeTax = 0;

    const updatedItems = inv.items.map((item, idx) => {
      const kg = Number(item.weightKg) || 0;
      const gram = Number(item.weightGram) || 0;
      const combinedKg = kg + gram / 1000;
      const rate = Number(item.rate) || 0;
      const itemAmount = combinedKg * rate;

      totalCartons += Number(item.carton) || 0;
      totalCheese += Number(item.cheese) || 0;
      totalWeightKg += combinedKg;
      amountBeforeTax += itemAmount;

      return {
        ...item,
        srNo: idx + 1,
        amount: Math.round(itemAmount * 100) / 100,
      };
    });

    const grossRateAvg = totalWeightKg > 0 ? amountBeforeTax / totalWeightKg : 0;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (inv.invoiceDetails.gstType === 'INTRA_STATE') {
      const cgstP = inv.invoiceDetails.cgstPercent || 2.5;
      const sgstP = inv.invoiceDetails.sgstPercent || 2.5;
      cgstAmount = (amountBeforeTax * cgstP) / 100;
      sgstAmount = (amountBeforeTax * sgstP) / 100;
    } else {
      const igstP = inv.invoiceDetails.igstPercent || 5.0;
      igstAmount = (amountBeforeTax * igstP) / 100;
    }

    const totalTaxAmount = cgstAmount + sgstAmount + igstAmount;
    const amountAfterTax = Math.round((amountBeforeTax + totalTaxAmount) * 100) / 100;
    const amountInWords = numberToWordsIndian(amountAfterTax);

    inv.items = updatedItems;
    inv.totals = {
      totalCartons,
      totalCheese,
      totalWeightKg: Math.round(totalWeightKg * 1000) / 1000,
      grossRateAvg: Math.round(grossRateAvg * 100) / 100,
      amountBeforeTax: Math.round(amountBeforeTax * 100) / 100,
      cgstAmount: Math.round(cgstAmount * 100) / 100,
      sgstAmount: Math.round(sgstAmount * 100) / 100,
      igstAmount: Math.round(igstAmount * 100) / 100,
      totalTaxAmount: Math.round(totalTaxAmount * 100) / 100,
      amountAfterTax,
      amountInWords,
    };

    onChange({ ...inv });
  };

  // Goods item row operations
  const handleAddItem = () => {
    const defaultShade = settings.shadeOptions[0];
    const newItem: GoodsItem = {
      id: `item_${Date.now()}`,
      srNo: invoice.items.length + 1,
      description: '100 Soft Silk Yarn',
      hsn: '54033100',
      carton: 0,
      cheese: 0,
      weightKg: 0,
      weightGram: 0,
      denier: settings.denierOptions[0] || '100',
      shade: defaultShade?.name || 'CORAL PINK',
      shadeNo: defaultShade?.shadeNo || 'A958',
      lotNo: 'LOT-101',
      grade: 'A',
      rate: 0,
      amount: 0,
    };
    const updated = { ...invoice, items: [...invoice.items, newItem] };
    recalculateTotals(updated);
  };

  const handleUpdateItem = (index: number, field: keyof GoodsItem, value: any) => {
    const updatedItems = [...invoice.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === 'shade') {
      const matchedShade = settings.shadeOptions.find(
        (s) => s.name.toLowerCase() === String(value).toLowerCase() ||
               `${s.name}|||${s.shadeNo}` === String(value)
      );
      if (matchedShade && matchedShade.shadeNo) {
        updatedItems[index].shadeNo = matchedShade.shadeNo;
      }
    }

    const updated = { ...invoice, items: updatedItems };
    recalculateTotals(updated);
  };

  const handleDeleteItem = (index: number) => {
    if (invoice.items.length <= 1) return;
    const updatedItems = invoice.items.filter((_, i) => i !== index);
    const updated = { ...invoice, items: updatedItems };
    recalculateTotals(updated);
  };

  const handleDuplicateItem = (index: number) => {
    const itemToDup = invoice.items[index];
    const duplicated: GoodsItem = {
      ...itemToDup,
      id: `item_${Date.now()}`,
      srNo: invoice.items.length + 1,
    };
    const updatedItems = [...invoice.items];
    updatedItems.splice(index + 1, 0, duplicated);
    const updated = { ...invoice, items: updatedItems };
    recalculateTotals(updated);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= invoice.items.length) return;
    const updatedItems = [...invoice.items];
    const temp = updatedItems[index];
    updatedItems[index] = updatedItems[newIdx];
    updatedItems[newIdx] = temp;
    const updated = { ...invoice, items: updatedItems };
    recalculateTotals(updated);
  };

  // Custom catalog additions
  const handleAddCustomDenier = () => {
    if (!newDenierInput.trim()) return;
    if (!settings.denierOptions.includes(newDenierInput.trim())) {
      const updatedOptions = [...settings.denierOptions, newDenierInput.trim()];
      updateSettings({ ...settings, denierOptions: updatedOptions });
    }
    setNewDenierInput('');
    setShowAddDenierModal(false);
  };

  const handleAddCustomShade = () => {
    if (!newShadeName.trim()) return;
    const exists = settings.shadeOptions.some(
      (s) => s.name.toLowerCase() === newShadeName.trim().toLowerCase() && s.shadeNo === newShadeNo.trim()
    );
    if (!exists) {
      const updatedShades = [
        ...settings.shadeOptions, 
        { name: newShadeName.trim(), shadeNo: newShadeNo.trim() || undefined, hexColor: newShadeColor }
      ];
      updateSettings({ ...settings, shadeOptions: updatedShades });
    }
    setNewShadeName('');
    setNewShadeNo('');
    setShowAddShadeModal(false);
  };

  // Logo File Upload Handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateSubSection('companyDetails', 'logoUrl', base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    updateSubSection('companyDetails', 'logoUrl', '');
  };

  // Pre-fill Defaults
  const handlePreFillDefaults = () => {
    const updated = {
      ...invoice,
      companyDetails: { ...settings.defaultCompanyDetails },
      bankDetails: { ...settings.defaultBankDetails },
      termsConditions: settings.defaultTerms,
    };
    onChange(updated);
  };

  return (
    <div className="space-y-6 text-sm">
      
      {/* 1. COMPANY DETAILS CARD */}
      <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
          <div className="flex items-center space-x-2.5">
            <Building2 className="w-4 h-4 text-[var(--accent-brass)]" />
            <h3 className="font-serif-display font-semibold text-base text-[var(--text-primary)]">
              1. Company Details
            </h3>
          </div>
          <button
            type="button"
            onClick={handlePreFillDefaults}
            className="text-xs font-mono text-[var(--accent-brass)] hover:underline inline-flex items-center space-x-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Pre-fill Defaults</span>
          </button>
        </div>

        {/* Logo Drag/Drop Upload Area */}
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16 rounded-full border-2 border-[var(--border-solid)] bg-black flex items-center justify-center overflow-hidden shrink-0 group shadow-sm">
            <img
              src={invoice.companyDetails.logoUrl || settings.defaultCompanyDetails.logoUrl || BRAND_LOGO_DEFAULT}
              alt="Company Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              title="Upload Brand Logo"
            />
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-[var(--text-primary)]">
              Brand Logo Mark
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              PNG/JPG/SVG. Appears on physical A4 invoice header block.
            </div>
            {invoice.companyDetails.logoUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="text-[10px] font-mono text-[var(--status-error)] hover:underline cursor-pointer"
              >
                Remove Logo
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Company Name</label>
            <input
              type="text"
              value={invoice.companyDetails.companyName}
              onChange={(e) => updateSubSection('companyDetails', 'companyName', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Tagline</label>
            <input
              type="text"
              value={invoice.companyDetails.tagline}
              onChange={(e) => updateSubSection('companyDetails', 'tagline', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">GSTIN</label>
            <input
              type="text"
              value={invoice.companyDetails.gstin}
              onChange={(e) => updateSubSection('companyDetails', 'gstin', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono focus:border-[var(--accent-brass)] outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Phone / Mobile</label>
            <input
              type="text"
              value={invoice.companyDetails.phone}
              onChange={(e) => updateSubSection('companyDetails', 'phone', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Email</label>
            <input
              type="email"
              value={invoice.companyDetails.email}
              onChange={(e) => updateSubSection('companyDetails', 'email', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Address</label>
            <input
              type="text"
              value={invoice.companyDetails.address}
              onChange={(e) => updateSubSection('companyDetails', 'address', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. DOCUMENT DETAILS / INVOICE DETAILS CARD */}
      <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
          <div className="flex items-center space-x-2.5">
            {isDebitNote ? (
              <FileDiff className="w-4 h-4 text-[var(--accent-brass)]" />
            ) : (
              <FileText className="w-4 h-4 text-[var(--accent-brass)]" />
            )}
            <h3 className="font-serif-display font-semibold text-base text-[var(--text-primary)]">
              {isDebitNote ? '2. Debit Note Meta & Adjustment Details' : '2. Invoice Details'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {isDebitNote && (
              <label className="flex items-center space-x-2 cursor-pointer select-none bg-[var(--bg-base)] px-2.5 py-1.5 rounded-xl border border-[var(--border-solid)] hover:border-[var(--accent-brass)]/50 transition-colors">
                <input
                  type="checkbox"
                  checked={invoice.invoiceDetails.includeInvoiceDate ?? false}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    updateSubSection('invoiceDetails', 'includeInvoiceDate', checked);
                    if (checked && !invoice.invoiceDetails.invoiceDate) {
                      updateSubSection('invoiceDetails', 'invoiceDate', invoice.invoiceDetails.returnDate || new Date().toISOString().split('T')[0]);
                    }
                  }}
                  className="rounded border-[var(--border-solid)] text-[var(--accent-brass)] focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-mono font-medium text-[var(--text-primary)]">
                  Add Original Invoice Date
                </span>
              </label>
            )}

            {isDebitNote && (
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-xl bg-[var(--accent-brass)]/15 text-[var(--accent-brass)] border border-[var(--accent-brass)]/30 font-semibold">
                Debit Note Mode
              </span>
            )}
          </div>
        </div>

        {isDebitNote ? (
          /* DEBIT NOTE SPECIFIC META FIELDS */
          <div className="space-y-4">
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${invoice.invoiceDetails.includeInvoiceDate ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-3`}>
              
              {/* Debit Note Number */}
              <div>
                <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">
                  Debit Note Number
                </label>
                <input
                  type="text"
                  value={invoice.invoiceDetails.invoiceNo}
                  onChange={(e) => updateSubSection('invoiceDetails', 'invoiceNo', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--accent-brass)] font-mono font-bold focus:border-[var(--accent-brass)] outline-none"
                  placeholder="e.g. DN001"
                />
              </div>

              {/* Original Invoice Number (Manual Entry or History Picker) */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-mono text-[var(--text-muted)]">
                    Original Bill / Invoice No. <span className="text-[var(--status-error)]">*</span>
                  </label>
                  {selectableInvoices.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsInvoicePickerOpen(!isInvoicePickerOpen)}
                      className="text-[10px] font-mono text-[var(--accent-brass)] hover:underline flex items-center gap-1 cursor-pointer bg-[var(--accent-brass)]/10 px-2 py-0.5 rounded"
                    >
                      <Search className="w-3 h-3" />
                      <span>{isInvoicePickerOpen ? 'Close' : 'From History'}</span>
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={invoice.invoiceDetails.originalInvoiceNo || ''}
                    onChange={(e) => updateSubSection('invoiceDetails', 'originalInvoiceNo', e.target.value)}
                    placeholder="Enter bill / invoice number..."
                    className={`w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border text-[var(--text-primary)] font-mono font-bold text-xs focus:border-[var(--accent-brass)] outline-none ${
                      isMissingOriginalInvoice
                        ? 'border-[var(--status-error)]/60 bg-[var(--status-error)]/5'
                        : 'border-[var(--border-solid)]'
                    }`}
                  />
                  {selectableInvoices.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsInvoicePickerOpen(!isInvoicePickerOpen)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--accent-brass)] cursor-pointer"
                      title="Choose from past invoices in system"
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isInvoicePickerOpen ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {/* Dropdown Popover for Searchable History */}
                {isInvoicePickerOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-[var(--bg-surface)] rounded-xl border border-[var(--accent-brass)]/40 shadow-2xl p-2.5 space-y-2 max-h-64 overflow-y-auto">
                    <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase flex items-center justify-between pb-1 border-b border-[var(--border-hairline)]">
                      <span>Pick from Past Invoices</span>
                      <button 
                        type="button" 
                        onClick={() => setIsInvoicePickerOpen(false)}
                        className="hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={invoiceSearchQuery}
                        onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                        placeholder="Search bill # or buyer name..."
                        className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none"
                        autoFocus
                      />
                    </div>

                    <div className="divide-y divide-[var(--border-hairline)] max-h-44 overflow-y-auto">
                      {filteredSelectableInvoices.length === 0 ? (
                        <div className="p-3 text-center text-xs text-[var(--text-muted)] italic">
                          No matching invoices found in history. You can directly type the bill number in the box above.
                        </div>
                      ) : (
                        filteredSelectableInvoices.map((inv) => (
                          <button
                            type="button"
                            key={inv.id}
                            onClick={() => handleSelectOriginalInvoice(inv)}
                            className="w-full p-2 text-left rounded-lg hover:bg-[var(--bg-surface-hover)] transition-colors flex items-center justify-between text-xs cursor-pointer group"
                          >
                            <div className="space-y-0.5">
                              <div className="font-mono font-bold text-[var(--accent-brass)] flex items-center gap-1.5">
                                <Link2 className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[var(--accent-brass)]" />
                                <span>{inv.invoiceDetails.invoiceNo}</span>
                                <span className="text-[10px] font-normal text-[var(--text-muted)]">
                                  ({inv.invoiceDetails.invoiceDate})
                                </span>
                              </div>
                              <div className="text-[11px] text-[var(--text-primary)] font-medium truncate max-w-[200px]">
                                {inv.buyerDetails.companyName || 'Unspecified Buyer'}
                              </div>
                            </div>
                            <div className="text-right font-mono text-[11px] font-semibold text-[var(--text-muted)]">
                              ₹{inv.totals.amountAfterTax.toFixed(0)}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Original Invoice Date (Optional) */}
              {invoice.invoiceDetails.includeInvoiceDate && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-mono text-[var(--text-muted)]">
                      Original Invoice Date
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        updateSubSection('invoiceDetails', 'includeInvoiceDate', false);
                        updateSubSection('invoiceDetails', 'invoiceDate', '');
                      }}
                      className="text-[10px] font-mono text-[var(--text-muted)] hover:text-[var(--status-error)] cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="date"
                    value={invoice.invoiceDetails.invoiceDate || ''}
                    onChange={(e) => updateSubSection('invoiceDetails', 'invoiceDate', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono focus:border-[var(--accent-brass)] outline-none"
                  />
                </div>
              )}

              {/* Debit Date (Return Date) */}
              <div>
                <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">
                  Debit Date (Return Date) <span className="text-[var(--status-error)]">*</span>
                </label>
                <input
                  type="date"
                  value={invoice.invoiceDetails.returnDate || ''}
                  onChange={(e) => updateSubSection('invoiceDetails', 'returnDate', e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border font-mono focus:border-[var(--accent-brass)] outline-none ${
                    isDateOrderInvalid
                      ? 'border-[var(--status-error)] text-[var(--status-error)] bg-[var(--status-error)]/5'
                      : 'border-[var(--border-solid)] text-[var(--text-primary)]'
                  }`}
                />
              </div>

            </div>

            {/* When Original Invoice Date is hidden, provide a subtle action box like transport details */}
            {!invoice.invoiceDetails.includeInvoiceDate && (
              <div className="p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-hairline)] text-xs text-[var(--text-muted)] flex items-center justify-between">
                <span>Original Invoice Date is optional. Click <strong>"Add Original Invoice Date"</strong> if you want to include it on the debit note.</span>
                <button
                  type="button"
                  onClick={() => {
                    updateSubSection('invoiceDetails', 'includeInvoiceDate', true);
                    if (!invoice.invoiceDetails.invoiceDate) {
                      updateSubSection('invoiceDetails', 'invoiceDate', invoice.invoiceDetails.returnDate || new Date().toISOString().split('T')[0]);
                    }
                  }}
                  className="text-[11px] font-mono text-[var(--accent-brass)] hover:underline cursor-pointer font-semibold shrink-0 ml-2"
                >
                  + Add Original Invoice Date
                </button>
              </div>
            )}

            {/* Secondary Row: Challan & Agent */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Challan Number</label>
                <input
                  type="text"
                  value={invoice.invoiceDetails.challanNo}
                  onChange={(e) => updateSubSection('invoiceDetails', 'challanNo', e.target.value)}
                  placeholder="Optional reference"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono focus:border-[var(--accent-brass)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Agent / Broker</label>
                <input
                  type="text"
                  value={invoice.invoiceDetails.agentName}
                  onChange={(e) => updateSubSection('invoiceDetails', 'agentName', e.target.value)}
                  placeholder="e.g. Ramesh Shah & Sons"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none"
                />
              </div>
            </div>

            {/* Validation Alerts */}
            {isDateOrderInvalid && (
              <div className="p-3 rounded-xl bg-[var(--status-error)]/10 border border-[var(--status-error)]/30 text-[var(--status-error)] text-xs flex items-center space-x-2 animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Invalid Return Date:</strong> Debit Date (Return Date: {invoice.invoiceDetails.returnDate}) cannot be earlier than Original Invoice Date ({invoice.invoiceDetails.invoiceDate}). Goods cannot be returned before they were billed.
                </span>
              </div>
            )}

            {isMissingOriginalInvoice && (
              <div className="p-2.5 rounded-xl bg-[var(--accent-terracotta)]/10 border border-[var(--accent-terracotta)]/30 text-[var(--accent-terracotta)] text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Original Bill Number:</strong> Please type the original purchase / supplier invoice number being adjusted in the box above.
                </span>
              </div>
            )}
          </div>
        ) : (
          /* STANDARD TAX INVOICE META FIELDS */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Invoice Number</label>
              <input
                type="text"
                value={invoice.invoiceDetails.invoiceNo}
                onChange={(e) => updateSubSection('invoiceDetails', 'invoiceNo', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--accent-brass)] font-mono font-bold focus:border-[var(--accent-brass)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Invoice Date</label>
              <input
                type="date"
                value={invoice.invoiceDetails.invoiceDate}
                onChange={(e) => updateSubSection('invoiceDetails', 'invoiceDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono focus:border-[var(--accent-brass)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Challan Number</label>
              <input
                type="text"
                value={invoice.invoiceDetails.challanNo}
                onChange={(e) => updateSubSection('invoiceDetails', 'challanNo', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono focus:border-[var(--accent-brass)] outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. BUYER DETAILS & DELIVERY DETAILS CARD */}
      <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-[var(--border-hairline)] pb-3">
          <UserCheck className="w-4 h-4 text-[var(--accent-brass)]" />
          <h3 className="font-serif-display font-semibold text-base text-[var(--text-primary)]">
            3. Buyer & Delivery Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buyer Column */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-mono tracking-wider text-[var(--accent-brass)] font-semibold">
              Buyer / Party Info
            </h4>
            
            <div>
              <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">Company Name</label>
              <input
                type="text"
                value={invoice.buyerDetails.companyName}
                onChange={(e) => updateSubSection('buyerDetails', 'companyName', e.target.value)}
                placeholder="e.g. Vardhman Weaving Mills"
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">Address</label>
              <textarea
                rows={2}
                value={invoice.buyerDetails.address}
                onChange={(e) => updateSubSection('buyerDetails', 'address', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">GSTIN</label>
                <input
                  type="text"
                  value={invoice.buyerDetails.gstin}
                  onChange={(e) => updateSubSection('buyerDetails', 'gstin', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono uppercase focus:border-[var(--accent-brass)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">State</label>
                <input
                  type="text"
                  value={invoice.buyerDetails.state}
                  onChange={(e) => updateSubSection('buyerDetails', 'state', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Delivery Column */}
          <div className="space-y-3 pl-0 md:pl-6 md:border-l md:border-[var(--border-hairline)]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-mono tracking-wider text-[var(--accent-brass)] font-semibold">
                Delivery Address
              </h4>
              <label className="flex items-center space-x-2 text-xs text-[var(--text-muted)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={invoice.deliveryDetails.sameAsBuyer}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    const updatedDelivery = isChecked
                      ? {
                          sameAsBuyer: true,
                          companyName: invoice.buyerDetails.companyName,
                          address: invoice.buyerDetails.address,
                          city: invoice.buyerDetails.city,
                          state: invoice.buyerDetails.state,
                          gstin: invoice.buyerDetails.gstin,
                        }
                      : { ...invoice.deliveryDetails, sameAsBuyer: false };
                    updateInvoiceState('deliveryDetails', updatedDelivery);
                  }}
                  className="rounded border-[var(--border-solid)] text-[var(--accent-brass)] focus:ring-0 cursor-pointer"
                />
                <span>Same as buyer</span>
              </label>
            </div>

            {!invoice.deliveryDetails.sameAsBuyer ? (
              <>
                <div>
                  <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">Consignee Name</label>
                  <input
                    type="text"
                    value={invoice.deliveryDetails.companyName}
                    onChange={(e) => updateSubSection('deliveryDetails', 'companyName', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">Delivery Address</label>
                  <textarea
                    rows={2}
                    value={invoice.deliveryDetails.address}
                    onChange={(e) => updateSubSection('deliveryDetails', 'address', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">GSTIN</label>
                    <input
                      type="text"
                      value={invoice.deliveryDetails.gstin}
                      onChange={(e) => updateSubSection('deliveryDetails', 'gstin', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono uppercase focus:border-[var(--accent-brass)] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">State</label>
                    <input
                      type="text"
                      value={invoice.deliveryDetails.state}
                      onChange={(e) => updateSubSection('deliveryDetails', 'state', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-hairline)] text-xs text-[var(--text-muted)] italic text-center">
                Consignee details are synced with Buyer info above.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. TRANSPORT DETAILS CARD */}
      <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
          <div className="flex items-center space-x-2.5">
            <Truck className="w-4 h-4 text-[var(--accent-brass)]" />
            <h3 className="font-serif-display font-semibold text-base text-[var(--text-primary)]">
              4. Transport Details
            </h3>
          </div>

          <label className="flex items-center space-x-2 cursor-pointer select-none bg-[var(--bg-base)] px-3 py-1.5 rounded-xl border border-[var(--border-solid)] hover:border-[var(--accent-brass)]/50 transition-colors">
            <input
              type="checkbox"
              checked={invoice.transportDetails?.enabled ?? false}
              onChange={(e) => updateSubSection('transportDetails', 'enabled', e.target.checked)}
              className="rounded border-[var(--border-solid)] text-[var(--accent-brass)] focus:ring-0 cursor-pointer"
            />
            <span className="text-xs font-mono font-medium text-[var(--text-primary)]">
              Add Transport Details
            </span>
          </label>
        </div>

        {invoice.transportDetails?.enabled ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">Transporter</label>
              <input
                type="text"
                value={invoice.transportDetails.transporter}
                onChange={(e) => updateSubSection('transportDetails', 'transporter', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">Transport GSTIN</label>
              <input
                type="text"
                value={invoice.transportDetails.transportGstin}
                onChange={(e) => updateSubSection('transportDetails', 'transportGstin', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono uppercase focus:border-[var(--accent-brass)] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">Vehicle No</label>
              <input
                type="text"
                value={invoice.transportDetails.vehicleNo}
                onChange={(e) => updateSubSection('transportDetails', 'vehicleNo', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono uppercase focus:border-[var(--accent-brass)] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">LR Number</label>
              <input
                type="text"
                value={invoice.transportDetails.lrNo}
                onChange={(e) => updateSubSection('transportDetails', 'lrNo', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono focus:border-[var(--accent-brass)] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">LR Date</label>
              <input
                type="date"
                value={invoice.transportDetails.lrDate}
                onChange={(e) => updateSubSection('transportDetails', 'lrDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono focus:border-[var(--accent-brass)] outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-hairline)] text-xs text-[var(--text-muted)] flex flex-wrap items-center justify-between gap-2">
            <span>Transport details are hidden from this invoice. Click <strong>"Add Transport Details"</strong> if transport info is needed.</span>
            <button
              type="button"
              onClick={() => updateSubSection('transportDetails', 'enabled', true)}
              className="text-[11px] font-mono text-[var(--accent-brass)] hover:underline cursor-pointer font-semibold"
            >
              + Add Transport Details
            </button>
          </div>
        )}
      </div>

      {/* 5. GOODS TABLE CARD */}
      <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
          <div className="flex items-center space-x-2.5">
            <Package className="w-4 h-4 text-[var(--accent-brass)]" />
            <h3 className="font-serif-display font-semibold text-base text-[var(--text-primary)]">
              5. Goods Ledger Table
            </h3>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-brass)] text-[#15130f] text-xs font-semibold hover:bg-[#d4b068] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Goods Items List */}
        <div className="space-y-4 overflow-x-auto pb-2">
          {invoice.items.map((item, index) => {
            const itemKgCombined = (Number(item.weightKg) || 0) + (Number(item.weightGram) || 0) / 1000;
            const currentShadeObj = settings.shadeOptions.find(
              (s) => s.name === item.shade && (!s.shadeNo || s.shadeNo === item.shadeNo)
            ) || settings.shadeOptions.find((s) => s.name === item.shade);

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] space-y-3 relative group"
              >
                {/* Row Header & Actions */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[var(--accent-brass)]">
                    Row #{index + 1}
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleMoveItem(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveItem(index, 'down')}
                      disabled={index === invoice.items.length - 1}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateItem(index)}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                      title="Duplicate Row"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(index)}
                      disabled={invoice.items.length <= 1}
                      className="p-1 rounded text-[var(--status-error)] hover:bg-[var(--status-error)]/10 disabled:opacity-30 cursor-pointer"
                      title="Delete Row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">
                      Description / Yarn Specifications
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-solid)] text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">HSN Code</label>
                    <input
                      type="text"
                      value={item.hsn}
                      onChange={(e) => handleUpdateItem(index, 'hsn', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono focus:border-[var(--accent-brass)] outline-none"
                    />
                  </div>

                  {/* Shade Dropdown with Color Dot */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-mono text-[var(--text-muted)]">Shade / Colour</label>
                      <button
                        type="button"
                        onClick={() => setShowAddShadeModal(true)}
                        className="text-[10px] text-[var(--accent-brass)] hover:underline flex items-center cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-gray-400 absolute left-2.5 shrink-0 pointer-events-none"
                        style={{ backgroundColor: currentShadeObj?.hexColor || '#ffffff' }}
                      />
                      <select
                        value={item.shadeNo ? `${item.shade}|||${item.shadeNo}` : item.shade}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.includes('|||')) {
                            const [sName, sNo] = val.split('|||');
                            const updatedItems = [...invoice.items];
                            updatedItems[index] = { ...updatedItems[index], shade: sName, shadeNo: sNo };
                            recalculateTotals({ ...invoice, items: updatedItems });
                          } else {
                            handleUpdateItem(index, 'shade', val);
                          }
                        }}
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-solid)] text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none cursor-pointer"
                      >
                        {settings.shadeOptions.map((s, idx) => {
                          const optionVal = s.shadeNo ? `${s.name}|||${s.shadeNo}` : s.name;
                          const displayLabel = s.shadeNo ? `${s.name} (${s.shadeNo})` : s.name;
                          return (
                            <option key={`${s.name}-${s.shadeNo || idx}`} value={optionVal}>
                              {displayLabel}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Shade Number */}
                  <div>
                    <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">Shade No</label>
                    <input
                      type="text"
                      placeholder="e.g. 101, SH-52"
                      value={item.shadeNo || ''}
                      onChange={(e) => handleUpdateItem(index, 'shadeNo', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono focus:border-[var(--accent-brass)] outline-none"
                    />
                  </div>

                  {/* Denier Dropdown with Custom Add Inline */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-mono text-[var(--text-muted)]">Denier</label>
                      <button
                        type="button"
                        onClick={() => setShowAddDenierModal(true)}
                        className="text-[10px] text-[var(--accent-brass)] hover:underline flex items-center cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                    <select
                      value={item.denier}
                      onChange={(e) => handleUpdateItem(index, 'denier', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono focus:border-[var(--accent-brass)] outline-none cursor-pointer"
                    >
                      {settings.denierOptions.map((d) => (
                        <option key={d} value={d}>
                          {d} Denier
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Weight split: KG and Gram */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">Weight (KG)</label>
                      <input
                        type="number"
                        min="0"
                        value={item.weightKg}
                        onChange={(e) => handleUpdateItem(index, 'weightKg', Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono focus:border-[var(--accent-brass)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">Grams</label>
                      <input
                        type="number"
                        min="0"
                        max="999"
                        value={item.weightGram}
                        onChange={(e) => handleUpdateItem(index, 'weightGram', Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono focus:border-[var(--accent-brass)] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">Grade</label>
                    <select
                      value={item.grade}
                      onChange={(e) => handleUpdateItem(index, 'grade', e.target.value as GradeType)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono focus:border-[var(--accent-brass)] outline-none cursor-pointer"
                    >
                      {settings.gradeOptions.map((g) => (
                        <option key={g} value={g}>
                          Grade {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">Rate per KG (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={item.rate}
                      onChange={(e) => handleUpdateItem(index, 'rate', Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono focus:border-[var(--accent-brass)] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">Calculated Amount (₹)</label>
                    <div className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-surface-hover)] border border-[var(--border-hairline)] text-[var(--accent-brass)] font-mono font-bold">
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-[var(--text-muted)] flex items-center justify-between pt-1 border-t border-[var(--border-hairline)]">
                  <span>Display Weight: <strong className="text-[var(--text-primary)]">{itemKgCombined.toFixed(3)} KGS</strong></span>
                  <span>Row Total: ₹{item.amount.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. TOTALS & GST TAX CALCULATION CARD */}
      <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-[var(--border-hairline)] pb-3">
          <Calculator className="w-4 h-4 text-[var(--accent-brass)]" />
          <h3 className="font-serif-display font-semibold text-base text-[var(--text-primary)]">
            6. Totals & Tax Calculations
          </h3>
        </div>

        {/* Quantity Summary Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-hairline)]">
            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] block">Total Weight</span>
            <span className="font-mono font-bold text-lg text-[var(--accent-brass)]">{invoice.totals.totalWeightKg.toFixed(3)} KGS</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-hairline)]">
            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] block">Amount Before Tax</span>
            <span className="font-mono font-bold text-lg text-[var(--text-primary)]">₹{invoice.totals.amountBeforeTax.toFixed(2)}</span>
          </div>
        </div>

        {/* GST Type Selection */}
        <div className="space-y-3 pt-2 border-t border-[var(--border-hairline)]">
          <label className="block text-xs font-mono text-[var(--text-muted)]">GST Tax Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateSubSection('invoiceDetails', 'gstType', 'INTRA_STATE')}
              className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                invoice.invoiceDetails.gstType === 'INTRA_STATE'
                  ? 'border-[var(--accent-brass)] bg-[var(--accent-brass)]/15 text-[var(--text-primary)]'
                  : 'border-[var(--border-solid)] bg-[var(--bg-base)] text-[var(--text-muted)]'
              }`}
            >
              <div>
                <div className="font-semibold text-xs text-[var(--text-primary)]">CGST + SGST (Intra-State)</div>
                <div className="text-[10px] font-mono mt-0.5">Tamil Nadu Sales</div>
              </div>
              {invoice.invoiceDetails.gstType === 'INTRA_STATE' && <CheckCircle2 className="w-4 h-4 text-[var(--accent-brass)]" />}
            </button>

            <button
              type="button"
              onClick={() => updateSubSection('invoiceDetails', 'gstType', 'INTER_STATE')}
              className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                invoice.invoiceDetails.gstType === 'INTER_STATE'
                  ? 'border-[var(--accent-brass)] bg-[var(--accent-brass)]/15 text-[var(--text-primary)]'
                  : 'border-[var(--border-solid)] bg-[var(--bg-base)] text-[var(--text-muted)]'
              }`}
            >
              <div>
                <div className="font-semibold text-xs text-[var(--text-primary)]">IGST (Inter-State)</div>
                <div className="text-[10px] font-mono mt-0.5">Out-of-State Sales</div>
              </div>
              {invoice.invoiceDetails.gstType === 'INTER_STATE' && <CheckCircle2 className="w-4 h-4 text-[var(--accent-brass)]" />}
            </button>
          </div>

          {/* Rate Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {invoice.invoiceDetails.gstType === 'INTRA_STATE' ? (
              <>
                <div>
                  <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">CGST Rate (%)</label>
                  <select
                    value={invoice.invoiceDetails.cgstPercent}
                    onChange={(e) => updateSubSection('invoiceDetails', 'cgstPercent', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono focus:border-[var(--accent-brass)] outline-none cursor-pointer"
                  >
                    <option value={0}>0.0% (Exempt)</option>
                    <option value={2.5}>2.5% (Standard Slab 5%)</option>
                    <option value={6}>6.0% (Standard Slab 12%)</option>
                    <option value={9}>9.0% (Standard Slab 18%)</option>
                    <option value={14}>14.0% (Standard Slab 28%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">SGST Rate (%)</label>
                  <select
                    value={invoice.invoiceDetails.sgstPercent}
                    onChange={(e) => updateSubSection('invoiceDetails', 'sgstPercent', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono focus:border-[var(--accent-brass)] outline-none cursor-pointer"
                  >
                    <option value={0}>0.0% (Exempt)</option>
                    <option value={2.5}>2.5% (Standard Slab 5%)</option>
                    <option value={6}>6.0% (Standard Slab 12%)</option>
                    <option value={9}>9.0% (Standard Slab 18%)</option>
                    <option value={14}>14.0% (Standard Slab 28%)</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">IGST Rate (%)</label>
                <select
                  value={invoice.invoiceDetails.igstPercent}
                  onChange={(e) => updateSubSection('invoiceDetails', 'igstPercent', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono focus:border-[var(--accent-brass)] outline-none cursor-pointer"
                >
                  <option value={0}>0% (Exempt)</option>
                  <option value={5}>5.0% (Integrated Standard)</option>
                  <option value={12}>12.0% (Integrated Standard)</option>
                  <option value={18}>18.0% (Integrated Standard)</option>
                  <option value={28}>28.0% (Integrated Standard)</option>
                </select>
              </div>
            )}
          </div>

          {/* Amount In Words Display */}
          <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Rupees in Words</span>
            <div className="font-serif italic font-bold text-sm text-[var(--accent-brass)]">
              {invoice.totals.amountInWords}
            </div>
          </div>
        </div>
      </div>

      {/* 7. BANK DETAILS CARD */}
      <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-[var(--border-hairline)] pb-3">
          <Landmark className="w-4 h-4 text-[var(--accent-brass)]" />
          <h3 className="font-serif-display font-semibold text-base text-[var(--text-primary)]">
            7. Bank Details
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Bank Name</label>
            <input
              type="text"
              value={invoice.bankDetails.bankName}
              onChange={(e) => updateSubSection('bankDetails', 'bankName', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Account Number</label>
            <input
              type="text"
              value={invoice.bankDetails.accountNo}
              onChange={(e) => updateSubSection('bankDetails', 'accountNo', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono focus:border-[var(--accent-brass)] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">IFSC Code</label>
            <input
              type="text"
              value={invoice.bankDetails.ifscCode}
              onChange={(e) => updateSubSection('bankDetails', 'ifscCode', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono uppercase focus:border-[var(--accent-brass)] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Branch Name</label>
            <input
              type="text"
              value={invoice.bankDetails.branchName}
              onChange={(e) => updateSubSection('bankDetails', 'branchName', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Form Reset Control */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Form Fields</span>
        </button>
      </div>

      {/* Modal: Add Custom Denier */}
      {showAddDenierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--bg-surface)] p-6 border border-[var(--accent-brass)]/40 shadow-2xl space-y-4">
            <h4 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">Add Custom Denier</h4>
            <p className="text-xs text-[var(--text-muted)]">
              This denier option will be added permanently to your catalog for future invoices.
            </p>
            <input
              type="text"
              placeholder="e.g. 250"
              value={newDenierInput}
              onChange={(e) => setNewDenierInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono outline-none focus:border-[var(--accent-brass)]"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddDenierModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] cursor-pointer min-h-[38px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomDenier}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent-brass)] text-[#15130f] hover:bg-[#d4b068] cursor-pointer min-h-[38px]"
              >
                Save Denier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Custom Shade */}
      {showAddShadeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--bg-surface)] p-6 border border-[var(--accent-brass)]/40 shadow-2xl space-y-4">
            <h4 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">Add Custom Shade/Colour</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Color Name</label>
                <input
                  type="text"
                  placeholder="e.g. CORAL PINK"
                  value={newShadeName}
                  onChange={(e) => setNewShadeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-brass)] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Shade No (Code)</label>
                <input
                  type="text"
                  placeholder="e.g. A958"
                  value={newShadeNo}
                  onChange={(e) => setNewShadeNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono outline-none focus:border-[var(--accent-brass)] text-xs uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Color Swatch</label>
                <input
                  type="color"
                  value={newShadeColor}
                  onChange={(e) => setNewShadeColor(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] cursor-pointer p-1"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddShadeModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] cursor-pointer min-h-[38px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomShade}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent-brass)] text-[#15130f] hover:bg-[#d4b068] cursor-pointer min-h-[38px]"
              >
                Save Shade
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
