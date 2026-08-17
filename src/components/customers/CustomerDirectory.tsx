import React, { useState } from 'react';
import { Customer } from '../../types';
import { Search, Users, FilePlus, Building2, MapPin, Phone, Hash } from 'lucide-react';

interface CustomerDirectoryProps {
  customers: Customer[];
  onCreateInvoiceForCustomer: (customer: Customer) => void;
}

export const CustomerDirectory: React.FC<CustomerDirectoryProps> = ({
  customers,
  onCreateInvoiceForCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 p-4 lg:p-8 max-w-7xl xl:max-w-[1536px] 2xl:max-w-[1720px] mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">
            Customer Directory
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Deduplicated buyer profile directory derived automatically from trade history
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-[var(--accent-brass)]/15 text-[var(--accent-brass)] border border-[var(--accent-brass)]/30 w-fit">
          {customers.length} Registered Trade Accounts
        </span>
      </div>

      <div className="thread-stitch"></div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by company name, GSTIN, or state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-brass)] outline-none"
          />
        </div>

        <span className="text-xs font-mono text-[var(--text-muted)] hidden sm:inline">
          Showing {filteredCustomers.length} accounts
        </span>
      </div>

      {/* Customers Cards Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] text-center space-y-3">
          <Users className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
          <div className="font-serif-display font-semibold text-lg text-[var(--text-primary)]">
            No customer accounts found
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Customer profiles are generated automatically when you create finalized trade invoices.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] hover:border-[var(--accent-brass)]/50 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="font-serif-display font-bold text-base text-[var(--text-primary)] leading-tight group-hover:text-[var(--accent-brass)] transition-colors">
                      {cust.companyName}
                    </h3>
                    <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 font-mono">
                      <MapPin className="w-3 h-3 text-[var(--accent-brass)] shrink-0" />
                      <span>{cust.state || 'Tamil Nadu'}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[var(--accent-brass)]/15 text-[var(--accent-brass)] border border-[var(--accent-brass)]/30 shrink-0">
                    {cust.totalInvoices} {cust.totalInvoices === 1 ? 'Invoice' : 'Invoices'}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-[var(--text-muted)] bg-[var(--bg-base)] p-3 rounded-xl border border-[var(--border-hairline)]">
                  <div className="text-[10px] font-mono uppercase">GSTIN / Tax ID</div>
                  <div className="font-mono font-semibold text-[var(--text-primary)]">{cust.gstin || 'Unspecified'}</div>
                  {cust.address && <div className="text-[11px] text-[var(--text-muted)] pt-1 truncate">{cust.address}</div>}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div>
                    <span className="text-[10px] uppercase text-[var(--text-muted)] block">Total Trade Volume</span>
                    <span className="font-bold text-[var(--accent-brass)] text-sm">
                      {formatCurrency(cust.totalAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[var(--text-muted)] block">Last Active</span>
                    <span className="text-[var(--text-primary)] font-medium text-xs block mt-0.5">
                      {cust.lastInvoiceDate}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-hairline)]">
                <button
                  type="button"
                  onClick={() => onCreateInvoiceForCustomer(cust)}
                  className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] hover:border-[var(--accent-brass)] text-[var(--text-primary)] text-xs font-semibold hover:bg-[var(--accent-brass)] hover:text-[#15130f] transition-all cursor-pointer shadow-xs min-h-[40px]"
                >
                  <FilePlus className="w-4 h-4" />
                  <span>Create Invoice For Buyer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
