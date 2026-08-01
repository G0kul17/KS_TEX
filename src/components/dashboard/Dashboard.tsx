import React, { useEffect, useState } from 'react';
import { Invoice, Customer } from '../../types';
import { 
  FileCheck, 
  FileClock, 
  Users, 
  TrendingUp, 
  PlusCircle, 
  ArrowRight, 
  Eye, 
  FileDown, 
  Receipt,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  invoices: Invoice[];
  customers: Customer[];
  onNavigateToGenerate: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onExportPdf: (invoice: Invoice) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  invoices,
  customers,
  onNavigateToGenerate,
  onViewInvoice,
  onExportPdf,
}) => {
  const finalizedInvoices = invoices.filter((i) => i.status === 'finalized');
  const draftInvoices = invoices.filter((i) => i.status === 'draft');

  const totalGenerated = finalizedInvoices.length;
  const totalDrafts = draftInvoices.length;
  const totalCustomers = customers.length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const netAmountThisMonth = finalizedInvoices
    .filter((inv) => {
      const d = new Date(inv.invoiceDetails.invoiceDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, inv) => acc + inv.totals.amountAfterTax, 0);

  // Animated Count-Up Hook
  const useAnimatedCounter = (endValue: number, duration: number = 1000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const increment = endValue / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= endValue) {
          setCount(endValue);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 16);

      return () => clearInterval(timer);
    }, [endValue, duration]);

    return count;
  };

  const countGenerated = useAnimatedCounter(totalGenerated);
  const countDrafts = useAnimatedCounter(totalDrafts);
  const countCustomers = useAnimatedCounter(totalCustomers);
  const countNet = useAnimatedCounter(netAmountThisMonth);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-[#15130f] space-y-8 p-4 lg:p-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-3xl lg:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
            Atelier Overview
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Real-time trade ledger & luxury yarn billing system
          </p>
        </div>

        <button
          onClick={onNavigateToGenerate}
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-[var(--accent-brass)] text-[#15130f] font-medium hover:bg-[#d4b068] active:scale-98 transition-all duration-200 cursor-pointer shadow-lg shadow-[var(--accent-brass)]/10"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="font-semibold">Create New Invoice</span>
        </button>
      </div>

      <div className="thread-stitch"></div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        
        {/* Card 1: Invoices Generated */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] flex flex-col justify-between relative overflow-hidden group hover:border-[var(--accent-brass)]/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-[var(--text-muted)]">
              Invoices Generated
            </span>
            <div className="p-2.5 rounded-xl bg-[var(--accent-brass)]/10 text-[var(--accent-brass)]">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-serif-display text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
              {Math.round(countGenerated)}
            </div>
            <div className="text-xs text-[var(--status-success)] mt-1 font-mono">
              ✓ Verified & Archived
            </div>
          </div>
        </motion.div>

        {/* Card 2: Draft Bills */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] flex flex-col justify-between relative overflow-hidden group hover:border-[var(--accent-brass)]/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-[var(--text-muted)]">
              Draft Bills
            </span>
            <div className="p-2.5 rounded-xl bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)]">
              <FileClock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-serif-display text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
              {Math.round(countDrafts)}
            </div>
            <div className="text-xs text-[var(--accent-terracotta)] mt-1 font-mono">
              Pending completion
            </div>
          </div>
        </motion.div>

        {/* Card 3: Unique Customers */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] flex flex-col justify-between relative overflow-hidden group hover:border-[var(--accent-brass)]/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-[var(--text-muted)]">
              Unique Buyers
            </span>
            <div className="p-2.5 rounded-xl bg-[var(--accent-brass)]/10 text-[var(--accent-brass)]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-serif-display text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
              {Math.round(countCustomers)}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1 font-mono">
              Active trading accounts
            </div>
          </div>
        </motion.div>

        {/* Card 4: Net Amount This Month */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] flex flex-col justify-between relative overflow-hidden group hover:border-[var(--accent-brass)]/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-[var(--text-muted)]">
              Net Revenue (This Month)
            </span>
            <div className="p-2.5 rounded-xl bg-[var(--status-success)]/10 text-[var(--status-success)]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono-num text-2xl lg:text-3xl font-bold text-[var(--accent-brass)]">
              {formatCurrency(countNet)}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1 font-mono">
              Tax inclusive total
            </div>
          </div>
        </motion.div>

      </div>

      {/* Featured CTA Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-surface-hover)] to-[var(--bg-surface)] p-6 lg:p-8 border border-[var(--accent-brass)]/30 shadow-xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-brass)]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs font-mono text-[var(--accent-brass)] bg-[var(--accent-brass)]/10 px-3 py-1 rounded-full border border-[var(--accent-brass)]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GST-Compliant Physical Invoice Replica</span>
            </div>
            <h2 className="font-serif-display text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">
              Generate K.S. TEX Trade Invoice
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Create official tax invoices with live A4 preview, yarn specification tables (Cartons, Cheese, Weight split in KGs/Grams, Denier, Shade), auto-calculated intra/inter-state GST, and Indian currency word translations.
            </p>
          </div>

          <button
            onClick={onNavigateToGenerate}
            className="shrink-0 flex items-center space-x-2.5 px-6 py-3.5 rounded-xl bg-[var(--accent-brass)] text-[#15130f] font-semibold hover:bg-[#d4b068] transition-all duration-200 cursor-pointer shadow-md group"
          >
            <span>Open Generator</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>

      {/* Recent Invoices Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">
            Recent Invoices
          </h2>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            Showing latest {Math.min(invoices.length, 5)} records
          </span>
        </div>

        {invoices.length === 0 ? (
          /* Empty State */
          <div className="p-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--accent-brass)]/10 text-[var(--accent-brass)] flex items-center justify-center mx-auto">
              <Receipt className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-serif-display text-lg font-semibold text-[var(--text-primary)]">
                No invoices created yet
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                Start logging your textile trade bills. Generated invoices will be archived here with full PDF export capability.
              </p>
            </div>
            <button
              onClick={onNavigateToGenerate}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[var(--accent-brass)] text-[#15130f] text-sm font-semibold hover:bg-[#d4b068] transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Invoice</span>
            </button>
          </div>
        ) : (
          /* Invoice Table */
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] overflow-hidden shadow-[var(--shadow-warm)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-surface-hover)] border-b border-[var(--border-solid)] text-[var(--text-muted)] uppercase font-mono tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Invoice No</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Buyer Name</th>
                    <th className="px-5 py-3.5">State</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Net Amount</th>
                    <th className="px-5 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)] text-[var(--text-primary)]">
                  {invoices.slice(0, 5).map((inv) => (
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
                        {inv.buyerDetails.state || 'Gujarat'}
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
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => onViewInvoice(inv)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                            title="Preview Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onExportPdf(inv)}
                            className="p-1.5 rounded-lg text-[var(--accent-brass)] hover:bg-[var(--accent-brass)]/15 transition-colors"
                            title="Export PDF"
                          >
                            <FileDown className="w-4 h-4" />
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
      </div>

    </div>
  );
};
