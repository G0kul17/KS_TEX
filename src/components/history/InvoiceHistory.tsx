import React, { useState } from 'react';
import { Invoice } from '../../types';
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
  Clock
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'finalized'>('all');
  const [gstFilter, setGstFilter] = useState<'all' | 'INTRA_STATE' | 'INTER_STATE'>('all');
  const [sortField, setSortField] = useState<'invoiceNo' | 'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter & Search Logic
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceDetails.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.buyerDetails.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceDetails.agentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesGst = gstFilter === 'all' || inv.invoiceDetails.gstType === gstFilter;

    return matchesSearch && matchesStatus && matchesGst;
  });

  // Sort Logic
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'invoiceNo') {
      comparison = a.invoiceDetails.invoiceNo.localeCompare(b.invoiceDetails.invoiceNo);
    } else if (sortField === 'date') {
      comparison = new Date(a.invoiceDetails.invoiceDate).getTime() - new Date(b.invoiceDetails.invoiceDate).getTime();
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
    <div className="space-y-6 p-4 lg:p-8 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">
            Invoice History Ledger
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Search, filter, export, and manage archived trade invoices
          </p>
        </div>

        <button
          onClick={onNavigateToGenerate}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[var(--accent-brass)] text-[#15130f] text-xs font-semibold hover:bg-[#d4b068] transition-colors cursor-pointer shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Invoice</span>
        </button>
      </div>

      <div className="thread-stitch"></div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)]">
        
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search invoice #, buyer, agent..."
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
            No matching invoices found
          </div>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            Try adjusting your search criteria or create a new invoice for your buyer.
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
                      <span>Invoice No</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
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
                  <th className="px-5 py-3.5">Agent</th>
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
                {sortedInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-[var(--bg-surface-hover)]/60 transition-colors group"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-[var(--accent-brass)]">
                      {inv.invoiceDetails.invoiceNo}
                    </td>
                    <td className="px-5 py-4 font-mono text-[var(--text-muted)]">
                      {inv.invoiceDetails.invoiceDate}
                    </td>
                    <td className="px-5 py-4 font-medium max-w-xs truncate">
                      {inv.buyerDetails.companyName || '—'}
                    </td>
                    <td className="px-5 py-4 text-[var(--text-muted)]">
                      {inv.invoiceDetails.agentName || '—'}
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
                          onClick={() => onOpenInvoice(inv)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                          title="Open in Generator"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDuplicateInvoice(inv)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                          title="Duplicate Invoice"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onExportPdf(inv)}
                          className="p-1.5 rounded-lg text-[var(--accent-brass)] hover:bg-[var(--accent-brass)]/15"
                          title="Export PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(inv.id)}
                          className="p-1.5 rounded-lg text-[var(--status-error)] hover:bg-[var(--status-error)]/15"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
              Delete Invoice?
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Are you sure you want to delete this record permanently from your local archive? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] cursor-pointer"
              >
                Cancel
              </button>
              <button
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
