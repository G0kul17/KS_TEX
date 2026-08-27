export type DocumentType = 'invoice' | 'debit_note';

export type GstType = 'INTRA_STATE' | 'INTER_STATE';

export type InvoiceStatus = 'draft' | 'finalized';

export type GradeType = 'A' | 'B' | 'C';

export interface CompanyDetails {
  companyName: string;
  tagline: string;
  invocationLine: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  gstin: string;
  pan?: string;
  logoUrl?: string;
}

export interface BuyerDetails {
  companyName: string;
  address: string;
  city: string;
  state: string;
  gstin: string;
  pan?: string;
  phone: string;
}

export interface DeliveryDetails {
  sameAsBuyer: boolean;
  companyName: string;
  address: string;
  city: string;
  state: string;
  gstin: string;
}

export interface TransportDetails {
  enabled?: boolean;
  transporter: string;
  transportGstin: string;
  vehicleNo: string;
  lrNo: string;
  lrDate: string;
}

export interface GoodsItem {
  id: string;
  srNo: number;
  description: string;
  hsn: string;
  carton?: number;
  cheese?: number;
  weightKg: number;
  weightGram: number;
  denier: string;
  shade: string;
  shadeNo?: string;
  lotNo?: string;
  grade: GradeType;
  rate: number;
  amount: number;
}

export interface BankDetails {
  bankName: string;
  accountNo: string;
  ifscCode: string;
  branchName: string;
}

export interface InvoiceDetails {
  invoiceNo: string;
  invoiceDate: string;
  challanNo: string;
  agentName: string;
  gstType: GstType;
  cgstPercent: number;
  sgstPercent: number;
  igstPercent: number;
  originalInvoiceNo?: string;
  returnDate?: string;
  includeInvoiceDate?: boolean;
}

export interface InvoiceTotals {
  totalCartons?: number;
  totalCheese?: number;
  totalWeightKg: number;
  grossRateAvg: number;
  amountBeforeTax: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTaxAmount: number;
  amountAfterTax: number;
  amountInWords: string;
}

export interface Invoice {
  id: string;
  documentType?: DocumentType;
  invoiceDetails: InvoiceDetails;
  companyDetails: CompanyDetails;
  buyerDetails: BuyerDetails;
  deliveryDetails: DeliveryDetails;
  transportDetails: TransportDetails;
  items: GoodsItem[];
  totals: InvoiceTotals;
  bankDetails: BankDetails;
  termsConditions: string;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  companyName: string;
  address: string;
  gstin: string;
  state: string;
  phone: string;
  totalInvoices: number;
  totalAmount: number;
  lastInvoiceDate: string;
}

export interface ShadeOption {
  name: string;
  shadeNo?: string;
  hexColor: string;
}

export interface AppSettings {
  defaultCompanyDetails: CompanyDetails;
  defaultBankDetails: BankDetails;
  defaultTerms: string;
  defaultGstType: GstType;
  defaultCgstPercent: number;
  defaultSgstPercent: number;
  defaultIgstPercent: number;
  invoicePrefix: string;
  debitNotePrefix: string;
  denierOptions: string[];
  shadeOptions: ShadeOption[];
  gradeOptions: GradeType[];
  theme: 'atelier-noir' | 'daylight';
}
