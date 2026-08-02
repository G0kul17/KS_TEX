import React, { useState } from 'react';
import { Invoice } from '../../types';
import { FileClock, Play, Trash2, Calendar, User, Package } from 'lucide-react';

interface DraftBillsProps {
  drafts: Invoice[];
  onResumeDraft: (draft: Invoice) => void;
  onDeleteDraft: (id: string) => void;
  onNavigateToGenerate: () => void;
}

export const DraftBills: React.FC<DraftBillsProps> = ({
  drafts,
  onResumeDraft,
  onDeleteDraft,
  onNavigateToGenerate,
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-8 max-w-7xl xl:max-w-[1536px] 2xl:max-w-[1720px] mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">
            Draft Bills & Pending Work
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Incomplete invoices saved for later completion
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-[var(--accent-terracotta)]/15 text-[var(--accent-terracotta)] border border-[var(--accent-terracotta)]/30 w-fit">
          {drafts.length} Pending Drafts
        </span>
      </div>

      <div className="thread-stitch"></div>

      {drafts.length === 0 ? (
        /* Designed Empty State */
        <div className="p-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)] flex items-center justify-center mx-auto">
            <FileClock className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-serif-display text-lg font-semibold text-[var(--text-primary)]">
              No pending drafts
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              All your invoices are finalized. Whenever you save an unfinished invoice from the generator, it will appear here for easy resuming.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToGenerate}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[var(--accent-brass)] text-[#15130f] text-xs font-semibold hover:bg-[#d4b068] transition-colors cursor-pointer min-h-[40px]"
          >
            <span>Start New Invoice</span>
          </button>
        </div>
      ) : (
        /* Draft Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] hover:border-[var(--accent-brass)]/50 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-[var(--accent-brass)]">
                    {draft.invoiceDetails.invoiceNo}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(draft.updatedAt)}</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-[var(--text-muted)] uppercase font-mono">Buyer</div>
                  <div className="font-serif-display font-semibold text-base text-[var(--text-primary)] truncate flex items-center gap-2">
                    <User className="w-4 h-4 text-[var(--accent-brass)] shrink-0" />
                    <span>{draft.buyerDetails.companyName || 'Unspecified Buyer'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[var(--text-muted)] pt-2 border-t border-[var(--border-hairline)]">
                  <div>
                    <span className="block text-[10px] uppercase">Items</span>
                    <span className="text-[var(--text-primary)] font-semibold flex items-center gap-1 mt-0.5">
                      <Package className="w-3 h-3 text-[var(--accent-brass)]" />
                      {draft.items.length} Yarn Rows
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase">Subtotal</span>
                    <span className="text-[var(--text-primary)] font-semibold mt-0.5 block">
                      {formatCurrency(draft.totals.amountAfterTax)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-hairline)]">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(draft.id)}
                  className="p-2 rounded-lg text-[var(--status-error)] hover:bg-[var(--status-error)]/10 text-xs font-mono flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  onClick={() => onResumeDraft(draft)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[var(--accent-brass)] text-[#15130f] text-xs font-bold hover:bg-[#d4b068] cursor-pointer transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume Editing</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--bg-surface)] p-6 border border-[var(--status-error)]/40 shadow-2xl space-y-4 text-center">
            <h3 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
              Discard Draft?
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              This will permanently delete this unfinished draft bill.
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
                  onDeleteDraft(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--status-error)] text-white hover:bg-[#a54338] cursor-pointer"
              >
                Discard Draft
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
