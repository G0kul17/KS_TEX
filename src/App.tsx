import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { InvoiceEditor } from './components/invoice/InvoiceEditor';
import { InvoiceHistory } from './components/history/InvoiceHistory';
import { DraftBills } from './components/history/DraftBills';
import { CustomerDirectory } from './components/customers/CustomerDirectory';
import { SettingsPage } from './components/settings/SettingsPage';
import { 
  getStoredInvoices, 
  deleteInvoice, 
  getCustomersFromInvoices, 
  saveInvoice, 
  getNextInvoiceNumber,
  getStoredSettings,
  subscribeToInvoices
} from './lib/storage';
import { Invoice, Customer } from './types';
import { generateInvoicePdf } from './lib/pdf';

export function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStoredInvoices());
  const [customers, setCustomers] = useState<Customer[]>(() => getCustomersFromInvoices());
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<Invoice | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Real-time Cloud Firestore synchronization + local fallback
  useEffect(() => {
    const unsubscribe = subscribeToInvoices((updatedInvoices) => {
      setInvoices(updatedInvoices);
      setCustomers(getCustomersFromInvoices());
    });
    return () => unsubscribe();
  }, []);

  const refreshData = () => {
    const loadedInvoices = getStoredInvoices();
    setInvoices(loadedInvoices);
    setCustomers(getCustomersFromInvoices());
  };

  const draftCount = invoices.filter((i) => i.status === 'draft').length;

  // Handlers
  const handleNavigateToGenerate = () => {
    setSelectedInvoiceForEdit(null);
    setActiveTab('generate');
  };

  const handleNavigateToGenerateDebitNote = () => {
    setSelectedInvoiceForEdit(null);
    setActiveTab('generate_debit_note');
  };

  const handleOpenInvoice = (invoice: Invoice) => {
    setSelectedInvoiceForEdit(invoice);
    if (invoice.documentType === 'debit_note') {
      setActiveTab('generate_debit_note');
    } else {
      setActiveTab('generate');
    }
  };

  const handleDuplicateInvoice = (invoice: Invoice) => {
    const isDN = invoice.documentType === 'debit_note';
    const settings = getStoredSettings();
    const prefix = isDN ? (settings.debitNotePrefix || 'DN') : (settings.invoicePrefix || 'FY');
    const nextNo = getNextInvoiceNumber(prefix, isDN ? 'debit_note' : 'invoice');
    const today = new Date().toISOString().split('T')[0];

    const duplicated: Invoice = {
      ...invoice,
      id: `inv_${Date.now()}`,
      documentType: isDN ? 'debit_note' : 'invoice',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      invoiceDetails: {
        ...invoice.invoiceDetails,
        invoiceNo: nextNo,
        invoiceDate: isDN ? invoice.invoiceDetails.invoiceDate : today,
        returnDate: isDN ? (invoice.invoiceDetails.returnDate || today) : undefined,
        originalInvoiceNo: isDN ? (invoice.invoiceDetails.originalInvoiceNo || '') : undefined,
      },
    };
    saveInvoice(duplicated);
    refreshData();
    setSelectedInvoiceForEdit(duplicated);
    setActiveTab(isDN ? 'generate_debit_note' : 'generate');
  };

  const handleDeleteInvoice = (id: string) => {
    deleteInvoice(id);
    refreshData();
  };

  const handleExportPdf = async (invoice: Invoice) => {
    // Render hidden preview element offscreen to generate PDF
    const hiddenDiv = document.createElement('div');
    hiddenDiv.style.position = 'absolute';
    hiddenDiv.style.left = '-9999px';
    hiddenDiv.style.top = '-9999px';
    hiddenDiv.style.width = '210mm';
    document.body.appendChild(hiddenDiv);

    // Dynamic import to avoid SSR issues
    const { createRoot } = await import('react-dom/client');
    const { InvoicePreview } = await import('./components/invoice/InvoicePreview');

    const root = createRoot(hiddenDiv);
    root.render(<InvoicePreview invoice={invoice} />);

    const isDN = invoice.documentType === 'debit_note';
    const docPrefix = isDN ? 'KS_TEX_DebitNote' : 'KS_TEX_Invoice';
    const fileName = `${docPrefix}_${invoice.invoiceDetails.invoiceNo}.pdf`;

    setTimeout(async () => {
      await generateInvoicePdf(hiddenDiv, fileName);
      root.unmount();
      document.body.removeChild(hiddenDiv);
    }, 300);
  };

  const handleCreateInvoiceForCustomer = (customer: Customer) => {
    const settings = getStoredSettings();
    const nextNo = getNextInvoiceNumber(settings.invoicePrefix || 'FY', 'invoice');
    const defaultItem = {
      id: `item_${Date.now()}`,
      srNo: 1,
      description: '100 Soft Silk Yarn',
      hsn: '54033100',
      carton: 0,
      cheese: 0,
      weightKg: 0,
      weightGram: 0,
      denier: settings.denierOptions[0] || '100',
      shade: settings.shadeOptions[0]?.name || 'CORAL PINK',
      shadeNo: settings.shadeOptions[0]?.shadeNo || 'A958',
      lotNo: 'LOT-A10',
      grade: 'A' as const,
      rate: 0,
      amount: 0,
    };
    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      documentType: 'invoice',
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
        companyName: customer.companyName,
        address: customer.address,
        city: 'Salem',
        state: customer.state || 'Tamil Nadu',
        gstin: customer.gstin,
        pan: '',
        phone: customer.phone,
      },
      deliveryDetails: {
        sameAsBuyer: true,
        companyName: customer.companyName,
        address: customer.address,
        city: 'Salem',
        state: customer.state || 'Tamil Nadu',
        gstin: customer.gstin,
      },
      transportDetails: {
        enabled: true,
        transporter: '',
        transportGstin: '',
        vehicleNo: '',
        lrNo: '',
        lrDate: new Date().toISOString().split('T')[0],
      },
      items: [defaultItem],
      totals: {
        totalCartons: 0,
        totalCheese: 0,
        totalWeightKg: 0,
        grossRateAvg: 0,
        amountBeforeTax: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalTaxAmount: 0,
        amountAfterTax: 0,
        amountInWords: 'Rupees Zero Only',
      },
    };
    setSelectedInvoiceForEdit(newInvoice);
    setActiveTab('generate');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] weave-pattern transition-colors duration-300 flex flex-col">
      {/* Top Navbar */}
      <Navbar onToggleMobileMenu={() => setIsMobileSidebarOpen(true)} />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if ((tab === 'generate' || tab === 'generate_debit_note') && activeTab !== tab) {
              setSelectedInvoiceForEdit(null);
            }
          }}
          draftCount={draftCount}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Panel */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              invoices={invoices}
              customers={customers}
              onNavigateToGenerate={handleNavigateToGenerate}
              onViewInvoice={handleOpenInvoice}
              onExportPdf={handleExportPdf}
            />
          )}

          {activeTab === 'generate' && (
            <InvoiceEditor
              key={selectedInvoiceForEdit?.id || 'new_invoice_editor'}
              defaultDocumentType="invoice"
              initialInvoice={selectedInvoiceForEdit}
              onInvoiceSaved={() => {
                refreshData();
              }}
            />
          )}

          {activeTab === 'generate_debit_note' && (
            <InvoiceEditor
              key={selectedInvoiceForEdit?.id || 'new_debit_note_editor'}
              defaultDocumentType="debit_note"
              initialInvoice={selectedInvoiceForEdit}
              onInvoiceSaved={() => {
                refreshData();
              }}
            />
          )}

          {activeTab === 'history' && (
            <InvoiceHistory
              invoices={invoices}
              onOpenInvoice={handleOpenInvoice}
              onDuplicateInvoice={handleDuplicateInvoice}
              onExportPdf={handleExportPdf}
              onDeleteInvoice={handleDeleteInvoice}
              onNavigateToGenerate={handleNavigateToGenerate}
            />
          )}

          {activeTab === 'drafts' && (
            <DraftBills
              drafts={invoices.filter((i) => i.status === 'draft')}
              onResumeDraft={handleOpenInvoice}
              onDeleteDraft={handleDeleteInvoice}
              onNavigateToGenerate={handleNavigateToGenerate}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerDirectory
              customers={customers}
              onCreateInvoiceForCustomer={handleCreateInvoiceForCustomer}
            />
          )}

          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
