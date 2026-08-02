import { AppSettings, Customer, Invoice } from '../types';
import { numberToWordsIndian } from './numberToWords';
import ksLogoMark from '../assets/images/ks_logo_mark_1785667570392.jpg';

export const BRAND_LOGO_DEFAULT = ksLogoMark;

const SETTINGS_KEY = 'kstex_settings_v1';
const INVOICES_KEY = 'kstex_invoices_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'atelier-noir',
  invoicePrefix: 'FY',
  defaultGstType: 'INTRA_STATE',
  defaultCgstPercent: 2.5,
  defaultSgstPercent: 2.5,
  defaultIgstPercent: 5.0,
  defaultCompanyDetails: {
    companyName: 'K.S. TEX',
    tagline: 'Trading of Yarn & Soft Silk',
    invocationLine: '|| SRI MURUGAN THUNAI ||',
    address: '247-B EATTI MUNIYAPPAN KOVIL STREET',
    city: 'SALEM - 636015',
    state: 'TAMIL NADU',
    phone: '9003449226',
    email: 'karthimani1978@gmail.com',
    gstin: '33EXDPM4349N1Z1',
    pan: 'EXDPM4349N',
    logoUrl: ksLogoMark,
  },
  defaultBankDetails: {
    bankName: 'INDIAN BANK',
    accountNo: '8284710994',
    ifscCode: 'IDIB000G052',
    branchName: 'GUGAI BRANCH, SALEM - 6',
  },
  defaultTerms: `1. Goods once sold will not be taken back or exchanged.
2. Interest @ 18% p.a. will be charged on delayed payments after 30 days.
3. All disputes are subject to Salem Jurisdiction only.
4. E. & O. E.`,
  denierOptions: ['100', '50', '75', '120', '150', '200', '300'],
  shadeOptions: [
    { name: 'CORAL PINK', shadeNo: 'A958', hexColor: '#F88379' },
    { name: 'CHOCKLATE', shadeNo: 'A957', hexColor: '#7B3F00' },
    { name: 'PEACH', shadeNo: 'A924', hexColor: '#FFDAB9' },
    { name: 'GAJARI', shadeNo: 'A546', hexColor: '#E2583E' },
    { name: 'COFFEE', shadeNo: 'A625', hexColor: '#4B3621' },
    { name: 'LT.N.BLUE', shadeNo: 'A569', hexColor: '#87CEEB' },
    { name: 'CHIKU', shadeNo: 'A913', hexColor: '#D2B48C' },
    { name: 'MEHANDI', shadeNo: 'A529', hexColor: '#556B2F' },
    { name: 'RUST', shadeNo: 'A556', hexColor: '#B7410E' },
    { name: 'COFFEE', shadeNo: 'A837', hexColor: '#3D2817' },
    { name: 'LT OLIVE', shadeNo: 'A908', hexColor: '#A2B567' },
    { name: 'OLIVE', shadeNo: 'A918', hexColor: '#808000' },
    { name: 'ANANDA', shadeNo: 'A527', hexColor: '#008080' },
    { name: 'COFFEE', shadeNo: 'A507', hexColor: '#4A2E12' },
    { name: 'GOLD', shadeNo: 'A521', hexColor: '#FFD700' },
    { name: 'WINE', shadeNo: 'A613', hexColor: '#722F37' },
    { name: 'VIOLET', shadeNo: 'A574', hexColor: '#8A2BE2' },
    { name: 'GOLD', shadeNo: 'A536', hexColor: '#DAA520' },
    { name: 'MAJENTA', shadeNo: 'A565', hexColor: '#FF00FF' },
    { name: 'TUSSER', shadeNo: 'A775', hexColor: '#E0C097' },
    { name: 'DUSTY PINK', shadeNo: 'A695', hexColor: '#DCAE96' },
    { name: 'GAJARI', shadeNo: 'A822', hexColor: '#E06D53' },
    { name: 'WINE', shadeNo: 'A497', hexColor: '#58111A' },
    { name: 'GAJARI', shadeNo: 'A884', hexColor: '#F07050' },
    { name: 'R.BLUE', shadeNo: 'A502', hexColor: '#4169E1' },
    { name: 'RANI', shadeNo: 'A614', hexColor: '#E0115F' },
    { name: 'MAROON', shadeNo: 'A540', hexColor: '#800000' },
    { name: 'CHOCKLATE', shadeNo: 'A516', hexColor: '#5C2C16' },
    { name: 'B.GREEN', shadeNo: 'A578', hexColor: '#006400' },
    { name: 'OLIVE', shadeNo: 'A893', hexColor: '#6B8E23' },
  ],
  gradeOptions: ['A', 'B', 'C'],
};

// Initial realistic seed invoices for K.S. TEX
const INITIAL_SEED_INVOICES: Invoice[] = [
  {
    id: 'inv_001',
    status: 'finalized',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    companyDetails: DEFAULT_SETTINGS.defaultCompanyDetails,
    bankDetails: DEFAULT_SETTINGS.defaultBankDetails,
    termsConditions: DEFAULT_SETTINGS.defaultTerms,
    invoiceDetails: {
      invoiceNo: 'FY001',
      invoiceDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      challanNo: 'CH-8410',
      agentName: 'Ramesh Shah & Sons',
      gstType: 'INTRA_STATE',
      cgstPercent: 2.5,
      sgstPercent: 2.5,
      igstPercent: 5.0,
    },
    buyerDetails: {
      companyName: 'Vardhman Weaving Mills Pvt Ltd',
      address: 'Shed No. 12-14, GIDC Silk Zone, Bhatar Road',
      city: 'Salem',
      state: 'Tamil Nadu',
      gstin: '24AAACV8891E1Z3',
      pan: 'AAACV8891E',
      phone: '+91 98980 11223',
    },
    deliveryDetails: {
      sameAsBuyer: true,
      companyName: 'Vardhman Weaving Mills Pvt Ltd',
      address: 'Shed No. 12-14, GIDC Silk Zone, Bhatar Road',
      city: 'Salem',
      state: 'Tamil Nadu',
      gstin: '24AAACV8891E1Z3',
    },
    transportDetails: {
      enabled: true,
      transporter: 'Mahavir Surface Logistics',
      transportGstin: '24AABCM9012J1Z5',
      vehicleNo: 'GJ-05-BX-4910',
      lrNo: 'LR-99210',
      lrDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    },
    items: [
      {
        id: 'item_1',
        srNo: 1,
        description: 'Polyester Filament Textured Yarn 150/48 Nim',
        hsn: '54033100',
        carton: 12,
        cheese: 288,
        weightKg: 240,
        weightGram: 350,
        denier: '150',
        shade: 'Natural White',
        shadeNo: '50',
        lotNo: 'LOT-A42',
        grade: 'A',
        rate: 138,
        amount: 33168.3,
      },
      {
        id: 'item_2',
        srNo: 2,
        description: 'Viscose Rayon Spun Soft Silk Yarn 100 Denier',
        hsn: '54033100',
        carton: 8,
        cheese: 192,
        weightKg: 160,
        weightGram: 150,
        denier: '100',
        shade: 'Deep Navy',
        shadeNo: '102',
        lotNo: 'LOT-B19',
        grade: 'A',
        rate: 185,
        amount: 29627.75,
      },
    ],
    totals: {
      totalCartons: 20,
      totalCheese: 480,
      totalWeightKg: 400.5,
      grossRateAvg: 156.8,
      amountBeforeTax: 62796.05,
      cgstAmount: 1569.9,
      sgstAmount: 1569.9,
      igstAmount: 0,
      totalTaxAmount: 3139.8,
      amountAfterTax: 65935.85,
      amountInWords: numberToWordsIndian(65935.85),
    },
  },
  {
    id: 'inv_002',
    status: 'finalized',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    companyDetails: DEFAULT_SETTINGS.defaultCompanyDetails,
    bankDetails: DEFAULT_SETTINGS.defaultBankDetails,
    termsConditions: DEFAULT_SETTINGS.defaultTerms,
    invoiceDetails: {
      invoiceNo: 'FY002',
      invoiceDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
      challanNo: 'CH-8411',
      agentName: 'Global Fabric Agencies',
      gstType: 'INTER_STATE',
      cgstPercent: 0,
      sgstPercent: 0,
      igstPercent: 5.0,
    },
    buyerDetails: {
      companyName: 'Loomcraft Textiles Ltd',
      address: 'Plot 88, Bhiwandi Textile Park',
      city: 'Bhiwandi',
      state: 'Maharashtra',
      gstin: '27AABCL4410K1Z8',
      pan: 'AABCL4410K',
      phone: '+91 97123 45678',
    },
    deliveryDetails: {
      sameAsBuyer: true,
      companyName: 'Loomcraft Textiles Ltd',
      address: 'Plot 88, Bhiwandi Textile Park',
      city: 'Bhiwandi',
      state: 'Maharashtra',
      gstin: '27AABCL4410K1Z8',
    },
    transportDetails: {
      enabled: true,
      transporter: 'V-Trans India Ltd',
      transportGstin: '27AABCV1100F1Z2',
      vehicleNo: 'MH-04-ER-8812',
      lrNo: 'LR-10822',
      lrDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    },
    items: [
      {
        id: 'item_201',
        srNo: 1,
        description: 'Micro Fiber DTY Intermingled Yarn 75/36',
        hsn: '54033100',
        carton: 25,
        cheese: 600,
        weightKg: 520,
        weightGram: 800,
        denier: '75',
        shade: 'Jet Black',
        lotNo: 'LOT-X88',
        grade: 'A',
        rate: 162,
        amount: 84369.6,
      },
    ],
    totals: {
      totalCartons: 25,
      totalCheese: 600,
      totalWeightKg: 520.8,
      grossRateAvg: 162,
      amountBeforeTax: 84369.6,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 4218.48,
      totalTaxAmount: 4218.48,
      amountAfterTax: 88588.08,
      amountInWords: numberToWordsIndian(88588.08),
    },
  },
  {
    id: 'inv_003_draft',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    companyDetails: DEFAULT_SETTINGS.defaultCompanyDetails,
    bankDetails: DEFAULT_SETTINGS.defaultBankDetails,
    termsConditions: DEFAULT_SETTINGS.defaultTerms,
    invoiceDetails: {
      invoiceNo: 'FY003',
      invoiceDate: new Date().toISOString().split('T')[0],
      challanNo: 'CH-8415',
      agentName: 'Ramesh Shah & Sons',
      gstType: 'INTRA_STATE',
      cgstPercent: 2.5,
      sgstPercent: 2.5,
      igstPercent: 5.0,
    },
    buyerDetails: {
      companyName: 'Shree Krishna Silk Mills',
      address: '204, Sahara Darwaja Silk Market',
      city: 'Salem',
      state: 'Tamil Nadu',
      gstin: '24AABCS7712M1ZP',
      pan: 'AABCS7712M',
      phone: '+91 98241 88200',
    },
    deliveryDetails: {
      sameAsBuyer: true,
      companyName: 'Shree Krishna Silk Mills',
      address: '204, Sahara Darwaja Silk Market',
      city: 'Salem',
      state: 'Tamil Nadu',
      gstin: '24AABCS7712M1ZP',
    },
    transportDetails: {
      enabled: true,
      transporter: 'Surat Local Goods Transport',
      transportGstin: '24AAACS1111A1Z0',
      vehicleNo: 'GJ-05-AZ-1122',
      lrNo: 'LR-7712',
      lrDate: new Date().toISOString().split('T')[0],
    },
    items: [
      {
        id: 'item_301',
        srNo: 1,
        description: 'Twisted Silk Yarn Premium Grade 50 Denier',
        hsn: '54033100',
        carton: 10,
        cheese: 240,
        weightKg: 185,
        weightGram: 500,
        denier: '50',
        shade: 'Royal Coffee',
        lotNo: 'LOT-S10',
        grade: 'A',
        rate: 210,
        amount: 38955,
      },
    ],
    totals: {
      totalCartons: 10,
      totalCheese: 240,
      totalWeightKg: 185.5,
      grossRateAvg: 210,
      amountBeforeTax: 38955,
      cgstAmount: 973.88,
      sgstAmount: 973.88,
      igstAmount: 0,
      totalTaxAmount: 1947.76,
      amountAfterTax: 40902.76,
      amountInWords: numberToWordsIndian(40902.76),
    },
  },
];

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const hasDyingProgramShades = parsed.shadeOptions && parsed.shadeOptions.some((s: any) => s.shadeNo);
      const shadeOptions = hasDyingProgramShades ? parsed.shadeOptions : DEFAULT_SETTINGS.shadeOptions;
      let companyDetails = { ...DEFAULT_SETTINGS.defaultCompanyDetails, ...parsed.defaultCompanyDetails };
      if (
        !parsed.defaultCompanyDetails?.gstin ||
        parsed.defaultCompanyDetails?.gstin === '24AAFCK1234F1Z9' ||
        parsed.defaultCompanyDetails?.email === 'contact@kstex.in' ||
        parsed.defaultCompanyDetails?.invocationLine === '|| Shree Ganeshay Namah ||'
      ) {
        companyDetails = DEFAULT_SETTINGS.defaultCompanyDetails;
      }
      if (!companyDetails.logoUrl) {
        companyDetails.logoUrl = ksLogoMark;
      }

      let bankDetails = { ...DEFAULT_SETTINGS.defaultBankDetails, ...parsed.defaultBankDetails };
      if (!parsed.defaultBankDetails?.accountNo || parsed.defaultBankDetails?.accountNo === '50200049281042') {
        bankDetails = DEFAULT_SETTINGS.defaultBankDetails;
      }

      return { ...DEFAULT_SETTINGS, ...parsed, defaultCompanyDetails: companyDetails, defaultBankDetails: bankDetails, shadeOptions };
    }
  } catch (e) {
    console.error('Failed to load settings from storage', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function getStoredInvoices(): Invoice[] {
  try {
    if (!localStorage.getItem('kstex_reset_inv_no_v12')) {
      localStorage.setItem('kstex_reset_inv_no_v12', 'true');
      localStorage.setItem(INVOICES_KEY, JSON.stringify([]));
      return [];
    }
    const raw = localStorage.getItem(INVOICES_KEY);
    if (raw) {
      const parsed: Invoice[] = JSON.parse(raw);
      return parsed.map((inv) => {
        let updated = { ...inv };
        if (
          !updated.companyDetails?.gstin ||
          updated.companyDetails.gstin === '24AAFCK1234F1Z9' ||
          updated.companyDetails.email === 'contact@kstex.in'
        ) {
          updated.companyDetails = DEFAULT_SETTINGS.defaultCompanyDetails;
        }
        if (!updated.bankDetails?.accountNo || updated.bankDetails?.accountNo === '50200049281042') {
          updated.bankDetails = DEFAULT_SETTINGS.defaultBankDetails;
        }
        if (updated.buyerDetails && (!updated.buyerDetails.state || updated.buyerDetails.state === 'Gujarat')) {
          updated.buyerDetails = { ...updated.buyerDetails, state: 'Tamil Nadu' };
        }
        if (updated.deliveryDetails && (!updated.deliveryDetails.state || updated.deliveryDetails.state === 'Gujarat')) {
          updated.deliveryDetails = { ...updated.deliveryDetails, state: 'Tamil Nadu' };
        }
        if (updated.items && Array.isArray(updated.items)) {
          updated.items = updated.items.map((it) => ({
            ...it,
            hsn: (!it.hsn || it.hsn === '5402' || it.hsn === '5403' || it.hsn === '5007') ? '54033100' : it.hsn,
          }));
        }
        return updated;
      });
    }
    // Seed initial invoices if storage is empty
    localStorage.setItem(INVOICES_KEY, JSON.stringify([]));
    return [];
  } catch (e) {
    console.error('Failed to load invoices from storage', e);
    return [];
  }
}

export function resetInvoiceCounter(): void {
  try {
    localStorage.setItem(INVOICES_KEY, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to reset invoice counter', e);
  }
}

export function saveInvoice(invoice: Invoice): void {
  const invoices = getStoredInvoices();
  const existingIdx = invoices.findIndex((i) => i.id === invoice.id || i.invoiceDetails.invoiceNo === invoice.invoiceDetails.invoiceNo);
  
  const updatedInvoice = {
    ...invoice,
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    invoices[existingIdx] = updatedInvoice;
  } else {
    invoices.unshift(updatedInvoice);
  }

  try {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  } catch (e) {
    console.error('Failed to save invoice', e);
  }
}

export function deleteInvoice(id: string): void {
  const invoices = getStoredInvoices().filter((i) => i.id !== id);
  try {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  } catch (e) {
    console.error('Failed to delete invoice', e);
  }
}

export function getNextInvoiceNumber(prefix: string = 'FY'): string {
  const invoices = getStoredInvoices();
  let maxNum = 0;
  
  for (const inv of invoices) {
    const invNo = inv.invoiceDetails.invoiceNo;
    const match = invNo.match(/\d+/);
    if (match) {
      const val = parseInt(match[0], 10);
      if (val > maxNum) {
        maxNum = val;
      }
    }
  }

  const nextNum = maxNum + 1;
  const padded = nextNum.toString().padStart(3, '0');
  return `${prefix}${padded}`;
}

export function getCustomersFromInvoices(): Customer[] {
  const invoices = getStoredInvoices();
  const customerMap: Record<string, Customer> = {};

  for (const inv of invoices) {
    if (!inv.buyerDetails.companyName) continue;
    
    const key = inv.buyerDetails.companyName.trim().toLowerCase();
    
    if (!customerMap[key]) {
      customerMap[key] = {
        id: `cust_${key.replace(/[^a-z0-9]/g, '_')}`,
        companyName: inv.buyerDetails.companyName,
        address: inv.buyerDetails.address,
        gstin: inv.buyerDetails.gstin,
        state: inv.buyerDetails.state,
        phone: inv.buyerDetails.phone,
        totalInvoices: 0,
        totalAmount: 0,
        lastInvoiceDate: inv.invoiceDetails.invoiceDate,
      };
    }

    const c = customerMap[key];
    c.totalInvoices += 1;
    c.totalAmount += inv.totals.amountAfterTax;
    
    if (new Date(inv.invoiceDetails.invoiceDate) > new Date(c.lastInvoiceDate)) {
      c.lastInvoiceDate = inv.invoiceDetails.invoiceDate;
    }
  }

  return Object.values(customerMap);
}
