import { AppSettings, Customer, Invoice, DocumentType } from '../types';
import { numberToWordsIndian } from './numberToWords';
import { KS_BRAND_LOGO_BASE64 } from '../assets/ksLogo';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  writeBatch
} from 'firebase/firestore';

export const BRAND_LOGO_DEFAULT = KS_BRAND_LOGO_BASE64;

const SETTINGS_KEY = 'kstex_settings_v1';
const INVOICES_KEY = 'kstex_invoices_v1';
const SETTINGS_DOC_ID = 'app_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'atelier-noir',
  invoicePrefix: 'FY',
  debitNotePrefix: 'DN',
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
    logoUrl: KS_BRAND_LOGO_BASE64,
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

// Helper to ensure logo is always a valid renderable image URL or Base64
export function normalizeLogoUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') {
    return BRAND_LOGO_DEFAULT;
  }
  // If it's an old Vite dev URL or broken local path or blob, heal with embedded default
  if (
    url.startsWith('/src/') ||
    url.startsWith('/assets/') ||
    url.startsWith('/@fs') ||
    url.startsWith('blob:') ||
    url.includes('undefined') ||
    url.includes('null')
  ) {
    return BRAND_LOGO_DEFAULT;
  }
  return url;
}

// Clean and normalize invoice object
export function sanitizeInvoice(inv: Invoice): Invoice {
  let updated = { ...inv };
  if (!updated.documentType) {
    updated.documentType = updated.invoiceDetails?.invoiceNo?.startsWith('DN') ? 'debit_note' : 'invoice';
  }

  if (
    !updated.companyDetails?.gstin ||
    updated.companyDetails.gstin === '24AAFCK1234F1Z9' ||
    updated.companyDetails.email === 'contact@kstex.in'
  ) {
    updated.companyDetails = DEFAULT_SETTINGS.defaultCompanyDetails;
  }
  
  updated.companyDetails = {
    ...updated.companyDetails,
    logoUrl: normalizeLogoUrl(updated.companyDetails?.logoUrl),
  };

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
}

// ----------------------------------------------------
// SETTINGS PERSISTENCE (Syncs to Local Storage & Firestore)
// ----------------------------------------------------

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
      companyDetails.logoUrl = normalizeLogoUrl(companyDetails.logoUrl);

      let bankDetails = { ...DEFAULT_SETTINGS.defaultBankDetails, ...parsed.defaultBankDetails };
      if (!parsed.defaultBankDetails?.accountNo || parsed.defaultBankDetails?.accountNo === '50200049281042') {
        bankDetails = DEFAULT_SETTINGS.defaultBankDetails;
      }

      return { 
        ...DEFAULT_SETTINGS, 
        debitNotePrefix: parsed.debitNotePrefix || 'DN',
        ...parsed, 
        defaultCompanyDetails: companyDetails, 
        defaultBankDetails: bankDetails, 
        shadeOptions 
      };
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
    console.error('Failed to save settings to local cache', e);
  }

  // Cloud Firestore permanent save
  try {
    const settingsDocRef = doc(db, 'settings', SETTINGS_DOC_ID);
    setDoc(settingsDocRef, settings, { merge: true }).catch((err) => {
      console.warn('Failed to sync settings to Firestore:', err);
    });
  } catch (err) {
    console.warn('Firestore settings error:', err);
  }
}

// ----------------------------------------------------
// INVOICES PERSISTENCE (Syncs to Local Storage & Firestore)
// ----------------------------------------------------

export function getStoredInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(INVOICES_KEY);
    if (raw) {
      const parsed: Invoice[] = JSON.parse(raw);
      return parsed.map(sanitizeInvoice);
    }
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
  const sanitized = sanitizeInvoice({
    ...invoice,
    updatedAt: new Date().toISOString(),
  });

  // 1. Update local cache immediately for responsive UI
  const invoices = getStoredInvoices();
  const existingIdx = invoices.findIndex(
    (i) => i.id === sanitized.id || i.invoiceDetails.invoiceNo === sanitized.invoiceDetails.invoiceNo
  );
  
  if (existingIdx >= 0) {
    invoices[existingIdx] = sanitized;
  } else {
    invoices.unshift(sanitized);
  }

  try {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  } catch (e) {
    console.error('Failed to save invoice to local storage', e);
  }

  // 2. Persist permanently to Cloud Firestore
  try {
    const invoiceDocRef = doc(db, 'invoices', sanitized.id);
    setDoc(invoiceDocRef, sanitized).catch((err) => {
      console.error('Failed to persist invoice to Firestore:', err);
    });
  } catch (err) {
    console.error('Firestore save invoice error:', err);
  }
}

export function deleteInvoice(id: string): void {
  // 1. Remove from local storage
  const invoices = getStoredInvoices().filter((i) => i.id !== id);
  try {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  } catch (e) {
    console.error('Failed to delete invoice from local storage', e);
  }

  // 2. Delete permanently from Cloud Firestore
  try {
    const invoiceDocRef = doc(db, 'invoices', id);
    deleteDoc(invoiceDocRef).catch((err) => {
      console.error('Failed to delete invoice from Firestore:', err);
    });
  } catch (err) {
    console.error('Firestore delete invoice error:', err);
  }
}

export function getNextInvoiceNumber(prefix: string = 'FY', documentType: DocumentType = 'invoice'): string {
  const invoices = getStoredInvoices();
  let maxNum = 0;
  
  for (const inv of invoices) {
    const isTargetType = inv.documentType === documentType || 
      (documentType === 'debit_note' ? inv.invoiceDetails.invoiceNo.startsWith('DN') : !inv.invoiceDetails.invoiceNo.startsWith('DN'));
    if (!isTargetType) continue;

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

export function getNextDocumentNumber(documentType: DocumentType = 'invoice', customPrefix?: string): string {
  const settings = getStoredSettings();
  const prefix = customPrefix || (documentType === 'debit_note' ? settings.debitNotePrefix || 'DN' : settings.invoicePrefix || 'FY');
  return getNextInvoiceNumber(prefix, documentType);
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

// ----------------------------------------------------
// REAL-TIME FIRESTORE SUBSCRIPTIONS & CLOUD SYNC
// ----------------------------------------------------

/**
 * Subscribes to real-time changes in Firestore invoices collection.
 * Automatically synchronizes cloud changes into local storage and calls callback.
 */
export function subscribeToInvoices(onUpdate: (invoices: Invoice[]) => void): () => void {
  try {
    const invoicesCol = collection(db, 'invoices');
    const q = query(invoicesCol);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cloudInvoices: Invoice[] = [];
      snapshot.forEach((docSnap) => {
        cloudInvoices.push(sanitizeInvoice(docSnap.data() as Invoice));
      });

      // Sort by creation or update date descending
      cloudInvoices.sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      // If cloud has documents, sync them into local storage
      if (cloudInvoices.length > 0) {
        try {
          localStorage.setItem(INVOICES_KEY, JSON.stringify(cloudInvoices));
        } catch (e) {
          console.warn('Could not cache cloud invoices to local storage:', e);
        }
        onUpdate(cloudInvoices);
      } else {
        // If cloud is empty but local storage has invoices, upload existing local ones to cloud!
        const localInvoices = getStoredInvoices();
        if (localInvoices.length > 0) {
          syncLocalInvoicesToCloud(localInvoices);
          onUpdate(localInvoices);
        } else {
          onUpdate([]);
        }
      }
    }, (error) => {
      console.warn('Firestore onSnapshot listener error (falling back to local):', error);
      onUpdate(getStoredInvoices());
    });

    return unsubscribe;
  } catch (err) {
    console.warn('Firestore subscription failed, falling back to local:', err);
    onUpdate(getStoredInvoices());
    return () => {};
  }
}

/**
 * Subscribes to settings stored in Firestore
 */
export function subscribeToSettings(onUpdate: (settings: AppSettings) => void): () => void {
  try {
    const settingsDocRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const unsubscribe = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const cloudSettings = docSnap.data() as AppSettings;
        const merged = { ...DEFAULT_SETTINGS, ...cloudSettings };
        try {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
        } catch (e) {
          console.warn('Could not cache cloud settings to local storage:', e);
        }
        onUpdate(merged);
      } else {
        // Upload default or existing local settings to cloud
        const local = getStoredSettings();
        setDoc(settingsDocRef, local).catch(console.warn);
      }
    }, (error) => {
      console.warn('Firestore settings subscription error:', error);
    });

    return unsubscribe;
  } catch (err) {
    console.warn('Firestore settings listener error:', err);
    return () => {};
  }
}

/**
 * Migration helper: Push local data to Firestore if not already present
 */
async function syncLocalInvoicesToCloud(invoices: Invoice[]) {
  try {
    const batch = writeBatch(db);
    invoices.forEach((inv) => {
      const docRef = doc(db, 'invoices', inv.id);
      batch.set(docRef, inv);
    });
    await batch.commit();
    console.log(`Successfully migrated ${invoices.length} local invoices to Cloud Firestore.`);
  } catch (err) {
    console.warn('Error during batch sync to Firestore:', err);
  }
}
