import React from 'react';
import { Invoice } from '../../types';

interface InvoicePreviewProps {
  invoice: Invoice;
  previewRef?: React.RefObject<HTMLDivElement | null>;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, previewRef }) => {
  const {
    companyDetails,
    invoiceDetails,
    buyerDetails,
    deliveryDetails,
    transportDetails,
    items,
    totals,
    bankDetails,
  } = invoice;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const showTransport = transportDetails?.enabled === true;

  return (
    <div className="bg-white rounded-xl shadow-2xl p-2 sm:p-3 max-w-[210mm] mx-auto overflow-hidden">
      <div
        ref={previewRef}
        className="bg-white text-[#1a2332] font-sans p-4 sm:p-6 text-xs leading-tight"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          color: '#1a2332',
        }}
      >
        {/* UNIFIED SINGLE-BORDER MASTER CONTAINER */}
        <div className="border border-gray-900 bg-white">

        {/* 1. TOP STRIP */}
        <div className="border-b border-gray-900 flex items-center justify-between px-3 py-1.5 bg-gray-50/60 text-[10.5px] font-mono">
          <div className="font-semibold text-gray-900">
            GSTIN: <span className="font-bold">{companyDetails.gstin || '33EXDPM4349N1Z1'}</span>
          </div>
          <div className="font-serif italic font-medium text-gray-800">
            {companyDetails.invocationLine || '|| SRI MURUGAN THUNAI ||'}
          </div>
          <div className="text-gray-900">
            Ph: <span className="font-semibold">{companyDetails.phone || '9003449226'}</span>
          </div>
        </div>

        {/* 2. HEADER BLOCK */}
        <div className="border-b border-gray-900 p-4 text-center relative bg-white">
          {/* Logo Mark Top-Left */}
          <div className="absolute top-3.5 left-4 w-14 h-14 rounded-full border border-amber-600/40 flex items-center justify-center bg-amber-50/40 overflow-hidden">
            {companyDetails.logoUrl ? (
              <img
                src={companyDetails.logoUrl}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center">
                <span className="font-serif font-bold text-amber-800 text-xs tracking-wider block">
                  KST
                </span>
                <span className="text-[8px] text-amber-900 block font-mono">SILK</span>
              </div>
            )}
          </div>

          {/* Header Titles */}
          <div className="inline-block border-b border-gray-900 pb-0.5 mb-1">
            <span className="uppercase text-[10px] tracking-widest font-mono font-bold text-gray-800">
              TAX INVOICE
            </span>
          </div>

          <h1 className="font-serif-display text-2xl lg:text-3xl font-extrabold text-black tracking-wider uppercase mt-0.5">
            {companyDetails.companyName || 'K.S. TEX'}
          </h1>

          <p className="text-[11px] font-serif italic text-amber-800 mt-0.5 font-semibold">
            {companyDetails.tagline || 'Trading of Yarn & Soft Silk'}
          </p>

          <p className="text-[10px] text-gray-800 font-sans mt-1">
            {companyDetails.address}, {companyDetails.city}, {companyDetails.state}
            {companyDetails.email ? ` | Email: ${companyDetails.email}` : ''}
          </p>
        </div>

        {/* 3. INVOICE META ROW (4 Columns) */}
        <div className="border-b border-gray-900 grid grid-cols-4 divide-x divide-gray-900 bg-gray-50/40 text-[10.5px]">
          <div className="p-2">
            <span className="text-gray-500 block text-[8.5px] font-mono uppercase font-bold">Invoice No</span>
            <span className="font-mono font-bold text-black">{invoiceDetails.invoiceNo}</span>
          </div>
          <div className="p-2">
            <span className="text-gray-500 block text-[8.5px] font-mono uppercase font-bold">Invoice Date</span>
            <span className="font-mono font-semibold text-black">{invoiceDetails.invoiceDate}</span>
          </div>
          <div className="p-2">
            <span className="text-gray-500 block text-[8.5px] font-mono uppercase font-bold">Challan No</span>
            <span className="font-mono text-black">{invoiceDetails.challanNo || '—'}</span>
          </div>
          <div className="p-2 bg-amber-50/30">
            <span className="text-gray-500 block text-[8.5px] font-mono uppercase font-bold">GST Type</span>
            <span className="font-mono font-bold text-amber-900">
              {invoiceDetails.gstType === 'INTRA_STATE' ? 'Intra-State (CGST+SGST)' : 'Inter-State (IGST)'}
            </span>
          </div>
        </div>

        {/* 4. TWO SIDE-BY-SIDE BOXES: BUYER & DELIVERY (2 Columns) */}
        <div className="border-b border-gray-900 grid grid-cols-2 divide-x divide-gray-900">
          
          {/* Buyer Details */}
          <div className="p-3 space-y-1">
            <div className="font-mono uppercase font-bold text-[9.5px] text-amber-800 border-b border-gray-300 pb-1 flex justify-between">
              <span>Party / Buyer Details</span>
              <span className="text-gray-500">Buyer Copy</span>
            </div>
            <div className="font-bold text-xs text-black pt-0.5">{buyerDetails.companyName || '—'}</div>
            <div className="text-gray-800 text-[10px]">{buyerDetails.address || '—'}</div>
            <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
              <div><span className="text-gray-500 font-mono">GSTIN:</span> <span className="font-mono font-semibold">{buyerDetails.gstin || '—'}</span></div>
              <div><span className="text-gray-500 font-mono">State:</span> <span className="font-semibold">{buyerDetails.state || 'Tamil Nadu'}</span></div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="p-3 space-y-1">
            <div className="font-mono uppercase font-bold text-[9.5px] text-amber-800 border-b border-gray-300 pb-1 flex justify-between">
              <span>Consignee / Delivery Address</span>
              {deliveryDetails.sameAsBuyer && (
                <span className="text-emerald-700 text-[9px] font-sans font-bold">Same as Buyer</span>
              )}
            </div>
            <div className="font-bold text-xs text-black pt-0.5">{deliveryDetails.companyName || buyerDetails.companyName || '—'}</div>
            <div className="text-gray-800 text-[10px]">{deliveryDetails.address || buyerDetails.address || '—'}</div>
            <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
              <div><span className="text-gray-500 font-mono">GSTIN:</span> <span className="font-mono font-semibold">{deliveryDetails.gstin || buyerDetails.gstin || '—'}</span></div>
              <div><span className="text-gray-500 font-mono">State:</span> <span className="font-semibold">{deliveryDetails.state || buyerDetails.state || 'Tamil Nadu'}</span></div>
            </div>
          </div>

        </div>

        {/* 5. OPTIONAL TRANSPORT STRIP (5 Columns) */}
        {showTransport && (
          <div className="border-b border-gray-900 grid grid-cols-5 divide-x divide-gray-900 bg-gray-50/50 text-[10px]">
            <div className="p-2">
              <span className="text-gray-500 block font-mono text-[8px] uppercase font-bold">Transporter</span>
              <span className="font-medium truncate block">{transportDetails?.transporter || '—'}</span>
            </div>
            <div className="p-2">
              <span className="text-gray-500 block font-mono text-[8px] uppercase font-bold">Transporter GSTIN</span>
              <span className="font-mono font-medium">{transportDetails?.transportGstin || '—'}</span>
            </div>
            <div className="p-2">
              <span className="text-gray-500 block font-mono text-[8px] uppercase font-bold">Vehicle No</span>
              <span className="font-mono font-semibold">{transportDetails?.vehicleNo || '—'}</span>
            </div>
            <div className="p-2">
              <span className="text-gray-500 block font-mono text-[8px] uppercase font-bold">L.R. No.</span>
              <span className="font-mono font-semibold">{transportDetails?.lrNo || '—'}</span>
            </div>
            <div className="p-2">
              <span className="text-gray-500 block font-mono text-[8px] uppercase font-bold">L.R. Date</span>
              <span className="font-mono font-medium">{transportDetails?.lrDate || '—'}</span>
            </div>
          </div>
        )}

        {/* 6. GOODS TABLE WITH PROPORTIONS */}
        <div className="border-b border-gray-900 overflow-x-auto">
          <table className="w-full text-left text-[9.5px] border-collapse table-fixed min-w-[640px]">
            <colgroup>
              <col style={{ width: '4%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '4%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '11%' }} />
            </colgroup>
            <thead>
              <tr className="bg-gray-100 text-gray-900 border-b border-gray-900 font-mono uppercase font-bold text-[8.5px]">
                <th className="p-1 border-r border-gray-900 text-center align-middle whitespace-nowrap">Sr</th>
                <th className="p-1 border-r border-gray-900 text-left align-middle whitespace-nowrap">Yarn Description</th>
                <th className="p-1 border-r border-gray-900 text-center align-middle whitespace-nowrap">HSN</th>
                <th className="p-1 border-r border-gray-900 text-center align-middle whitespace-nowrap">Shade</th>
                <th className="p-1 border-r border-gray-900 text-center align-middle whitespace-nowrap">Shade No</th>
                <th className="p-1 border-r border-gray-900 text-center align-middle whitespace-nowrap">Denier</th>
                <th className="p-1 border-r border-gray-900 text-right align-middle leading-tight">
                  <div>Weight</div>
                  <div className="text-[7.5px] font-normal text-gray-700">(KGS)</div>
                </th>
                <th className="p-1 border-r border-gray-900 text-right align-middle leading-tight">
                  <div>Weight</div>
                  <div className="text-[7.5px] font-normal text-gray-700">(GMS)</div>
                </th>
                <th className="p-1 border-r border-gray-900 text-center align-middle whitespace-nowrap">Grd</th>
                <th className="p-1 border-r border-gray-900 text-right align-middle whitespace-nowrap">Rate/Kg</th>
                <th className="p-1 text-right align-middle whitespace-nowrap">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 font-sans text-gray-900 text-[9.5px]">
              {items.map((item, idx) => {
                const kgInt = Math.floor(item.weightKg || 0);
                const gramVal = item.weightGram !== undefined ? item.weightGram : Math.round(((item.weightKg || 0) - kgInt) * 1000);
                const shadeDisplay = (item.shade || '').split('|||')[0].replace(/\s*[\(\[\{].*?[\)\]\}]/g, '').trim() || '—';

                return (
                  <tr key={item.id || idx} className="hover:bg-amber-50/10">
                    <td className="p-1 border-r border-gray-900 text-center font-mono">{idx + 1}</td>
                    <td className="p-1 border-r border-gray-900 font-medium truncate">
                      {item.description || 'Yarn Item'}
                    </td>
                    <td className="p-1 border-r border-gray-900 text-center font-mono whitespace-nowrap overflow-hidden text-ellipsis">{item.hsn || '54033100'}</td>
                    <td className="p-1 border-r border-gray-900 text-center font-semibold uppercase whitespace-nowrap overflow-hidden text-ellipsis">{shadeDisplay}</td>
                    <td className="p-1 border-r border-gray-900 text-center font-mono whitespace-nowrap">{item.shadeNo || '—'}</td>
                    <td className="p-1 border-r border-gray-900 text-center font-mono whitespace-nowrap">{item.denier || '—'}</td>
                    <td className="p-1 border-r border-gray-900 text-right font-mono font-semibold">{kgInt}</td>
                    <td className="p-1 border-r border-gray-900 text-right font-mono">{gramVal}</td>
                    <td className="p-1 border-r border-gray-900 text-center font-mono font-bold">{item.grade || 'A'}</td>
                    <td className="p-1 border-r border-gray-900 text-right font-mono">{formatCurrency(item.rate)}</td>
                    <td className="p-1 text-right font-mono font-bold">{formatCurrency(item.amount)}</td>
                  </tr>
                );
              })}

              {/* Empty padding rows to preserve traditional invoice ledger height */}
              {items.length < 5 &&
                Array.from({ length: 5 - items.length }).map((_, i) => (
                  <tr key={`empty_${i}`} className="h-6">
                    <td className="p-1.5 border-r border-gray-900">&nbsp;</td>
                    <td className="p-1.5 border-r border-gray-900">&nbsp;</td>
                    <td className="p-1.5 border-r border-gray-900">&nbsp;</td>
                    <td className="p-1.5 border-r border-gray-900">&nbsp;</td>
                    <td className="p-1.5 border-r border-gray-900">&nbsp;</td>
                    <td className="p-1.5 border-r border-gray-900">&nbsp;</td>
                    <td className="p-1.5 border-r border-gray-900">&nbsp;</td>
                    <td className="p-1.5 border-r border-gray-900">&nbsp;</td>
                    <td className="p-1.5 border-r border-gray-900">&nbsp;</td>
                    <td className="p-1.5 border-r border-gray-900">&nbsp;</td>
                    <td className="p-1.5">&nbsp;</td>
                  </tr>
                ))}
            </tbody>

            {/* TOTALS ROW BENEATH GOODS TABLE */}
            <tfoot>
              <tr className="bg-gray-100 font-mono font-bold text-[9.5px] border-t-2 border-gray-900 text-black">
                <td colSpan={6} className="p-1.5 border-r border-gray-900 text-right uppercase">
                  Total Weight:
                </td>
                <td colSpan={2} className="p-1.5 border-r border-gray-900 text-center text-amber-900 font-bold">
                  {totals.totalWeightKg.toFixed(3)} KGS
                </td>
                <td colSpan={2} className="p-1.5 border-r border-gray-900 text-right uppercase text-[8.5px] text-gray-700">
                  Subtotal:
                </td>
                <td className="p-1.5 text-right font-extrabold text-black">
                  {formatCurrency(totals.amountBeforeTax)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 7. BOTTOM SPLIT: BANK DETAILS (LEFT) vs TAX BREAKDOWN & TOTAL (RIGHT) */}
        <div className="border-b border-gray-900 grid grid-cols-2 divide-x divide-gray-900">
          
          {/* Left Box: Bank Details */}
          <div className="p-3 space-y-1 bg-gray-50/20">
            <div className="font-mono uppercase font-bold text-[9.5px] text-amber-800 border-b border-gray-300 pb-0.5">
              Bank Details for RTGS / NEFT
            </div>
            <div className="text-[10px] space-y-0.5 text-gray-800 pt-0.5">
              <div><span className="font-mono text-gray-500">Bank:</span> <span className="font-semibold">{bankDetails.bankName || 'INDIAN BANK'}</span></div>
              <div><span className="font-mono text-gray-500">Account No:</span> <span className="font-mono font-bold text-black">{bankDetails.accountNo || '8284710994'}</span></div>
              <div><span className="font-mono text-gray-500">IFSC Code:</span> <span className="font-mono font-bold text-amber-900">{bankDetails.ifscCode || 'IDIB000G052'}</span></div>
              <div><span className="font-mono text-gray-500">Branch:</span> <span>{bankDetails.branchName || 'GUGAI BRANCH, SALEM - 6'}</span></div>
            </div>
          </div>

          {/* Right Box: CGST / SGST / IGST & Final Total */}
          <div className="text-[10px] flex flex-col justify-between">
            <div>
              {invoiceDetails.gstType === 'INTRA_STATE' ? (
                <>
                  <div className="flex items-center justify-between p-2 border-b border-gray-300">
                    <span className="font-mono">Add: CGST @ {invoiceDetails.cgstPercent}%</span>
                    <span className="font-mono font-semibold">₹{formatCurrency(totals.cgstAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border-b border-gray-300">
                    <span className="font-mono">Add: SGST @ {invoiceDetails.sgstPercent}%</span>
                    <span className="font-mono font-semibold">₹{formatCurrency(totals.sgstAmount)}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between p-2 border-b border-gray-300">
                  <span className="font-mono">Add: IGST @ {invoiceDetails.igstPercent}%</span>
                  <span className="font-mono font-semibold">₹{formatCurrency(totals.igstAmount)}</span>
                </div>
              )}
            </div>

            {/* TOTAL AMOUNT AFTER TAX ROW */}
            <div className="flex items-center justify-between p-2.5 bg-amber-100/60 text-black font-extrabold text-xs border-t border-gray-900">
              <span className="uppercase font-mono tracking-wider">Total Amount After Tax:</span>
              <span className="font-mono text-sm text-amber-950 font-bold">₹{formatCurrency(totals.amountAfterTax)}</span>
            </div>
          </div>

        </div>

        {/* 8. RUPEES IN WORDS */}
        <div className="border-b border-gray-900 p-2.5 bg-white">
          <span className="font-mono uppercase font-bold text-[9px] text-gray-500 mr-2">Amount in Words:</span>
          <span className="font-serif italic font-bold text-black text-[11px] underline decoration-amber-600/40">
            {totals.amountInWords || 'Rupees Zero Only'}
          </span>
        </div>

        {/* 9. SIGNATURE ROW */}
        <div className="p-4 pt-6 pb-4 flex items-end justify-between text-[10px] font-mono bg-white">
          <div className="text-center w-44 space-y-2">
            <div className="border-b border-gray-900 w-full"></div>
            <span className="text-gray-800 font-medium block">Customer's Signature</span>
          </div>

          <div className="text-center w-56 space-y-2">
            <span className="text-[9px] text-gray-600 block uppercase font-mono tracking-wider">
              For {companyDetails.companyName || 'K.S. TEX'}
            </span>
            <div className="border-b border-gray-900 w-full pt-6"></div>
            <span className="text-black font-bold block">Authorised Signatory</span>
          </div>
        </div>

      </div>

      {/* GOLD THREAD-STITCH DIVIDER & FOOTER */}
      <div className="pt-4 space-y-1">
        <div className="border-t border-dashed border-amber-600/60 my-2 relative">
          <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-amber-600"></div>
          <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-amber-600"></div>
        </div>
        <div className="text-center text-[8px] font-mono text-gray-500 uppercase tracking-widest">
          Computer Generated Original Tax Invoice — K.S. TEX Atelier
        </div>
      </div>

      </div>
    </div>
  );
};
