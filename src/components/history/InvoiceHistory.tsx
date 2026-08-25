import React, { useState } from 'react';
import { Invoice, DocumentType } from '../../types';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  Copy, 
  FileDown, 
  Trash2, 
  Receipt, 
  PlusCircle,
  Clock,
  FileDiff,
  FileText
} from 'lucide-react';

interface InvoiceHistoryProps {
  invoices: Invoice[];
  onOpenInvoice: (invoice: Invoice) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onExportPdf: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onNavigateToGenerate: () => void;
}

export const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({
  invoices,
  onOpenInvoice,
  onDuplicateInvoice,
  onExportPdf,
  onDeleteInvoice,
  onNavigateToGenerate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState<'all' | 'invoice' | 'debit_note'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'finalized'>('all');
  const [gstFilter, setGstFilter] = useState<'all' | 'INTRA_STATE' | 'INTER_STATE'>('all');
  const [sortField, setSortField] = useState<'invoiceNo' | 'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Counts for document type filter tabs
  const invoiceCount = invoices.filter((i) => (i.documentType || 'invoice') === 'invoice').length;
  const debitNoteCount = invoices.filter((i) => i.documentType === 'debit_note').length;

  // Filter & Search Logic
  const filteredInvoices = invoices.filter((inv) => {
    const isDN = inv.documentType === 'debit_note';
    const matchesDocType =
      docTypeFilter === 'all' ||
      (docTypeFilter === 'debit_note' && isDN) ||
      (docTypeFilter === 'invoice' && !isDN);

    const matchesSearch =
      inv.invoiceDetails.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.buyerDetails.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.invoiceDetails.originalInvoiceNo &&
        inv.invoiceDetails.originalInvoiceNo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesGst = gstFilter === 'all' || inv.invoiceDetails.gstType === gstFilter;

    return matchesDocType && matchesSearch && matchesStatus && matchesGst;
  });

  // Sort Logic
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'invoiceNo') {
      comparison = a.invoiceDetails.invoiceNo.localeCompare(b.invoiceDetails.invoiceNo);
    } else if (sortField === 'date') {
      const dateA = a.invoiceDetails.returnDate || a.invoiceDetails.invoiceDate;
      const dateB = b.invoiceDetails.returnDate || b.invoiceDetails.invoiceDate;
      comparison = new Date(dateA).getTime() - new Date(dateB).getTime();
    } else if (sortField === 'amount') {
      comparison = a.totals.amountAfterTax - b.totals.amountAfterTax;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: 'invoiceNo' | 'date' | 'amount') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="space-y-6 p-4 lg:p-8 max-w-7xl xl:max-w-[1536px] 2xl:max-w-[1720px] mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">
            Document History Ledger
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Search, filter, export, and manage archived trade invoices and debit notes
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToGenerate}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[var(--accent-brass)] text-[#15130f] text-xs font-semibold hover:bg-[#d4b068] transition-colors cursor-pointer shadow-xs min-h-[40px]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Document</span>
        </button>
      </div>

      <div className="thread-stitch"></div>

      {/* Document Type Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-[var(--border-solid)] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setDocTypeFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center space-x-2 whitespace-nowrap ${
            docTypeFilter === 'all'
              ? 'bg-[var(--accent-brass)] text-[#15130f] font-bold shadow-xs'
              : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-hairline)]'
          }`}
        >
          <span>All Documents</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 font-mono">
            {invoices.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setDocTypeFilter('invoice')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center space-x-2 whitespace-nowrap ${
            docTypeFilter === 'invoice'
              ? 'bg-[var(--accent-brass)] text-[#15130f] font-bold shadow-xs'
              : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-hairline)]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Tax Invoices</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 font-mono">
            {invoiceCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setDocTypeFilter('debit_note')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center space-x-2 whitespace-nowrap ${
            docTypeFilter === 'debit_note'
              ? 'bg-[var(--accent-brass)] text-[#15130f] font-bold shadow-xs'
              : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-hairline)]'
          }`}
        >
          <FileDiff className="w-3.5 h-3.5" />
          <span>Debit Notes</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 font-mono">
            {debitNoteCount}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)]">
        
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search document #, buyer, ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="finalized">Finalized</option>
            <option value="draft">Drafts</option>
          </select>
        </div>

        {/* GST Type Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-[var(--text-muted)] shrink-0">GST:</span>
          <select
            value={gstFilter}
            onChange={(e) => setGstFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none cursor-pointer"
          >
            <option value="all">All Tax Types</option>
            <option value="INTRA_STATE">Intra-State (CGST+SGST)</option>
            <option value="INTER_STATE">Inter-State (IGST)</option>
          </select>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center justify-end text-xs font-mono text-[var(--text-muted)]">
          <span>Showing {sortedInvoices.length} of {invoices.length} records</span>
        </div>

      </div>

      {/* Table Container */}
      {sortedInvoices.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] text-center space-y-3">
          <Receipt className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
          <div className="font-serif-display font-semibold text-lg text-[var(--text-primary)]">
            No matching documents found
          </div>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            Try adjusting your search criteria or create a new invoice / debit note.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] overflow-hidden shadow-[var(--shadow-warm)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-surface-hover)] border-b border-[var(--border-solid)] text-[var(--text-muted)] uppercase font-mono tracking-wider">
                <tr>
                  <th
                    onClick={() => toggleSort('invoiceNo')}
                    className="px-5 py-3.5 cursor-pointer hover:text-[var(--text-primary)] select-none"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Document No</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-5 py-3.5">Type</th>
                  <th
                    onClick={() => toggleSort('date')}
                    className="px-5 py-3.5 cursor-pointer hover:text-[var(--text-primary)] select-none"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-5 py-3.5">Buyer Name</th>
                  <th className="px-5 py-3.5">GST Type</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th
                    onClick={() => toggleSort('amount')}
                    className="px-5 py-3.5 text-right cursor-pointer hover:text-[var(--text-primary)] select-none"
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Total Amount</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-5 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)] text-[var(--text-primary)]">
                {sortedInvoices.map((inv) => {
                  const isDN = inv.documentType === 'debit_note';
                  const displayDate = isDN 
                    ? (inv.invoiceDetails.returnDate || inv.invoiceDetails.invoiceDate)
                    : inv.invoiceDetails.invoiceDate;

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-[var(--bg-surface-hover)]/60 transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-[var(--accent-brass)]">
                          {inv.invoiceDetails.invoiceNo}
                        </div>
                        {isDN && inv.invoiceDetails.originalInvoiceNo && (
                          <div className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">
                            Ref: #{inv.invoiceDetails.originalInvoiceNo}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {isDN ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                            Debit Note
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[var(--accent-brass)]/15 text-[var(--accent-brass)] border border-[var(--accent-brass)]/30">
                            Tax Invoice
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-mono text-[var(--text-muted)]">
                        <div>{displayDate}</div>
                        {isDN && inv.invoiceDetails.returnDate && (
                          <div className="text-[9px] text-[var(--text-muted)] opacity-75">
                            (Ret: {inv.invoiceDetails.returnDate})
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 font-medium max-w-xs truncate">
                        {inv.buyerDetails.companyName || '—'}
                      </td>
                      <td className="px-5 py-4 font-mono text-[11px] text-[var(--text-muted)]">
                        {inv.invoiceDetails.gstType === 'INTRA_STATE' ? 'Intra (CGST+SGST)' : 'Inter (IGST)'}
                      </td>
                      <td className="px-5 py-4">
                        {inv.status === 'finalized' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[var(--status-success)]/15 text-[var(--status-success)] border border-[var(--status-success)]/30">
                            Finalized
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[var(--accent-terracotta)]/15 text-[var(--accent-terracotta)] border border-[var(--accent-terracotta)]/30">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-mono-num font-bold text-right text-[var(--text-primary)]">
                        {formatCurrency(inv.totals.amountAfterTax)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenInvoice(inv)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer"
                            title="Open in Generator"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDuplicateInvoice(inv)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer"
                            title={`Duplicate ${isDN ? 'Debit Note' : 'Invoice'}`}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onExportPdf(inv)}
                            className="p-1.5 rounded-lg text-[var(--accent-brass)] hover:bg-[var(--accent-brass)]/15 cursor-pointer"
                            title="Export PDF"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(inv.id)}
                            className="p-1.5 rounded-lg text-[var(--status-error)] hover:bg-[var(--status-error)]/15 cursor-pointer"
                            title={`Delete ${isDN ? 'Debit Note' : 'Invoice'}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--bg-surface)] p-6 border border-[var(--status-error)]/40 shadow-2xl space-y-4 text-center">
            <h3 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
              Delete Document Record?
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Are you sure you want to delete this document permanently from your local archive? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteInvoice(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--status-error)] text-white hover:bg-[#a54338] cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
