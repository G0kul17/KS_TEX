import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { AppSettings, ShadeOption } from '../../types';
import { 
  resetInvoiceCounter, 
  BRAND_LOGO_DEFAULT, 
  normalizeLogoUrl,
  getStoredInvoices, 
  saveInvoice 
} from '../../lib/storage';
import { 
  Building2, 
  Landmark, 
  Settings as SettingsIcon, 
  Palette, 
  Plus, 
  Trash2, 
  Sun, 
  Moon, 
  Save, 
  Check, 
  Sparkles,
  Hash,
  Upload,
  Cloud,
  Download,
  FileJson,
  ShieldCheck
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, toggleTheme } = useTheme();
  const [formSettings, setFormSettings] = useState<AppSettings>(settings);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  const [newDenierChip, setNewDenierChip] = useState('');
  const [newShadeName, setNewShadeName] = useState('');
  const [newShadeNo, setNewShadeNo] = useState('');
  const [newShadeHex, setNewShadeHex] = useState('#C6A15B');

  const handleSaveSettings = () => {
    updateSettings(formSettings);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const handleUpdateCompany = (field: string, val: string) => {
    setFormSettings({
      ...formSettings,
      defaultCompanyDetails: {
        ...formSettings.defaultCompanyDetails,
        [field]: val,
      },
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handleUpdateCompany('logoUrl', base64);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateBank = (field: string, val: string) => {
    setFormSettings({
      ...formSettings,
      defaultBankDetails: {
        ...formSettings.defaultBankDetails,
        [field]: val,
      },
    });
  };

  const handleAddDenierChip = () => {
    if (!newDenierChip.trim()) return;
    if (!formSettings.denierOptions.includes(newDenierChip.trim())) {
      setFormSettings({
        ...formSettings,
        denierOptions: [...formSettings.denierOptions, newDenierChip.trim()],
      });
    }
    setNewDenierChip('');
  };

  const handleRemoveDenierChip = (denier: string) => {
    setFormSettings({
      ...formSettings,
      denierOptions: formSettings.denierOptions.filter((d) => d !== denier),
    });
  };

  const handleAddShadeChip = () => {
    if (!newShadeName.trim()) return;
    const exists = formSettings.shadeOptions.some(
      (s) => s.name.toLowerCase() === newShadeName.trim().toLowerCase()
    );
    if (!exists) {
      setFormSettings({
        ...formSettings,
        shadeOptions: [
          ...formSettings.shadeOptions,
          { name: newShadeName.trim(), shadeNo: newShadeNo.trim() || undefined, hexColor: newShadeHex },
        ],
      });
    }
    setNewShadeName('');
    setNewShadeNo('');
  };

  const handleRemoveShadeChip = (name: string, shadeNo?: string) => {
    setFormSettings({
      ...formSettings,
      shadeOptions: formSettings.shadeOptions.filter((s) => !(s.name === name && s.shadeNo === shadeNo)),
    });
  };

  // Export JSON Backup file
  const handleExportBackup = () => {
    const invoices = getStoredInvoices();
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      settings: formSettings,
      invoices,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KS_TEX_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupStatus('Backup exported successfully!');
    setTimeout(() => setBackupStatus(null), 3000);
  };

  // Import JSON Backup file
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.invoices && Array.isArray(json.invoices)) {
          json.invoices.forEach((inv: any) => {
            saveInvoice(inv);
          });
        }
        if (json.settings) {
          updateSettings(json.settings);
          setFormSettings(json.settings);
        }
        setBackupStatus(`Restored ${json.invoices?.length || 0} invoices & settings!`);
        setTimeout(() => setBackupStatus(null), 4000);
      } catch (err) {
        setBackupStatus('Failed to read backup file. Please check file format.');
        setTimeout(() => setBackupStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const isDark = settings.theme === 'atelier-noir';

  return (
    <div className="space-y-6 p-4 lg:p-8 max-w-7xl xl:max-w-[1536px] 2xl:max-w-[1720px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">
            Atelier Settings & Preferences
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Configure permanent cloud storage, invoice defaults, catalog chips, and brand assets
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[var(--accent-brass)] text-[#15130f] text-xs font-bold hover:bg-[#d4b068] transition-all cursor-pointer shadow-md min-h-[40px]"
        >
          {showSavedToast ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{showSavedToast ? 'Settings Saved to Cloud!' : 'Save Preferences'}</span>
        </button>
      </div>

      <div className="thread-stitch"></div>

      {/* Cloud Storage Status Banner */}
      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-serif-display font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <span>Firebase Cloud Database Connected</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              All your invoices, drafts, and customer histories are permanently stored in the cloud. They will never disappear until you delete them.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-solid)] text-xs text-[var(--text-primary)] hover:border-[var(--accent-brass)] transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[var(--accent-brass)]" />
            <span>Download JSON Backup</span>
          </button>

          <label className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-solid)] text-xs text-[var(--text-primary)] hover:border-[var(--accent-brass)] transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs">
            <FileJson className="w-3.5 h-3.5 text-[var(--accent-brass)]" />
            <span>Restore Backup</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {backupStatus && (
        <div className="p-3 rounded-xl bg-[var(--accent-brass)]/15 border border-[var(--accent-brass)]/30 text-xs text-[var(--text-primary)] font-medium">
          {backupStatus}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Visual Theme Toggle */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-[var(--border-hairline)] pb-3">
            <Palette className="w-4 h-4 text-[var(--accent-brass)]" />
            <h3 className="font-serif-display font-semibold text-base text-[var(--text-primary)]">
              Visual Theme Mode
            </h3>
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            Toggle between the rich dark "Atelier Noir" and paper-toned "Daylight" mode. Note: Physical invoice previews and exported PDFs always remain crisp light paper.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setFormSettings({ ...formSettings, theme: 'atelier-noir' });
                if (settings.theme !== 'atelier-noir') toggleTheme();
              }}
              className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                formSettings.theme === 'atelier-noir'
                  ? 'border-[var(--accent-brass)] bg-[var(--accent-brass)]/10 ring-1 ring-[var(--accent-brass)]'
                  : 'border-[var(--border-solid)] bg-[var(--bg-base)]'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-[#15130f] border border-[#302b23] flex items-center justify-center text-[var(--accent-brass)]">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-serif-display font-medium text-xs text-[var(--text-primary)]">
                  Atelier Noir
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">Dark Silk Mode</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormSettings({ ...formSettings, theme: 'daylight' });
                if (settings.theme !== 'daylight') toggleTheme();
              }}
              className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                formSettings.theme === 'daylight'
                  ? 'border-[var(--accent-brass)] bg-[var(--accent-brass)]/10 ring-1 ring-[var(--accent-brass)]'
                  : 'border-[var(--border-solid)] bg-[var(--bg-base)]'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-[#f8f6f0] border border-[#d5cfbe] flex items-center justify-center text-amber-700">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <div className="font-serif-display font-medium text-xs text-[var(--text-primary)]">
                  Daylight
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">Paper Light Mode</div>
              </div>
            </button>
          </div>
        </div>

        {/* Section 2: Invoice Default Prefix & Taxes */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-[var(--border-hairline)] pb-3">
            <SettingsIcon className="w-4 h-4 text-[var(--accent-brass)]" />
            <h3 className="font-serif-display font-semibold text-base text-[var(--text-primary)]">
              Invoice Prefix & Tax Rates
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">
                Invoice Prefix
              </label>
              <div className="relative">
                <Hash className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formSettings.invoicePrefix}
                  onChange={(e) => setFormSettings({ ...formSettings, invoicePrefix: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono uppercase text-xs outline-none focus:border-[var(--accent-brass)]"
                  placeholder="e.g. FY"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">
                Default GST Structure
              </label>
              <select
                value={formSettings.defaultGstType}
                onChange={(e) => setFormSettings({ ...formSettings, defaultGstType: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] text-xs outline-none focus:border-[var(--accent-brass)]"
              >
                <option value="INTRA_STATE">CGST + SGST (Intra-State 5%)</option>
                <option value="INTER_STATE">IGST (Inter-State 5%)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">
                CGST Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formSettings.defaultCgstPercent}
                onChange={(e) => setFormSettings({ ...formSettings, defaultCgstPercent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono text-xs outline-none focus:border-[var(--accent-brass)]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">
                SGST Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formSettings.defaultSgstPercent}
                onChange={(e) => setFormSettings({ ...formSettings, defaultSgstPercent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono text-xs outline-none focus:border-[var(--accent-brass)]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Denier Catalog Chips */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-[var(--border-hairline)] pb-3">
            <Sparkles className="w-4 h-4 text-[var(--accent-brass)]" />
            <h3 className="font-serif-display font-semibold text-base text-[var(--text-primary)]">
              Quick-Select Denier Chips
            </h3>
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            Manage quick denier pills that appear in the item table for one-click entry.
          </p>

          <div className="flex flex-wrap gap-2">
            {formSettings.denierOptions.map((denier) => (
              <span
                key={denier}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-base)] border border-[var(--border-solid)] text-xs font-mono text-[var(--text-primary)]"
              >
                <span>{denier}D</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDenierChip(denier)}
                  className="text-[var(--text-muted)] hover:text-red-400 p-0.5 cursor-pointer"
                  title="Remove Denier"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="text"
              placeholder="e.g. 80"
              value={newDenierChip}
              onChange={(e) => setNewDenierChip(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddDenierChip()}
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-xs text-[var(--text-primary)] font-mono outline-none focus:border-[var(--accent-brass)] w-32"
            />
            <button
              type="button"
              onClick={handleAddDenierChip}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-solid)] text-xs text-[var(--text-primary)] hover:border-[var(--accent-brass)] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Denier</span>
            </button>
          </div>
        </div>

        {/* Section 4: Dyeing Shade Catalog */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-[var(--border-hairline)] pb-3">
            <Palette className="w-4 h-4 text-[var(--accent-brass)]" />
            <h3 className="font-serif-display font-semibold text-base text-[var(--text-primary)]">
              Silk Shade Catalog (Dyeing Program)
            </h3>
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            Manage shade color pills and exact shade numbers (e.g. A958) used during billing.
          </p>

          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
            {formSettings.shadeOptions.map((shade) => (
              <span
                key={`${shade.name}_${shade.shadeNo || ''}`}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-base)] border border-[var(--border-solid)] text-xs text-[var(--text-primary)]"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/20"
                  style={{ backgroundColor: shade.hexColor || '#C6A15B' }}
                />
                <span className="font-medium">{shade.name}</span>
                {shade.shadeNo && <span className="font-mono text-[10px] text-[var(--text-muted)]">[{shade.shadeNo}]</span>}
                <button
                  type="button"
                  onClick={() => handleRemoveShadeChip(shade.name, shade.shadeNo)}
                  className="text-[var(--text-muted)] hover:text-red-400 p-0.5 cursor-pointer ml-1"
                  title="Remove Shade"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Shade Name (e.g. LEMON)"
              value={newShadeName}
              onChange={(e) => setNewShadeName(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-brass)] flex-1 min-w-[140px]"
            />
            <input
              type="text"
              placeholder="Shade No (e.g. A501)"
              value={newShadeNo}
              onChange={(e) => setNewShadeNo(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-xs text-[var(--text-primary)] font-mono outline-none focus:border-[var(--accent-brass)] w-28"
            />
            <input
              type="color"
              value={newShadeHex}
              onChange={(e) => setNewShadeHex(e.target.value)}
              className="w-8 h-8 rounded-lg border border-[var(--border-solid)] bg-transparent cursor-pointer"
              title="Pick Shade Color"
            />
            <button
              type="button"
              onClick={handleAddShadeChip}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-solid)] text-xs text-[var(--text-primary)] hover:border-[var(--accent-brass)] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Shade</span>
            </button>
          </div>
        </div>

        {/* Section 5: Default Company Profile & Logo Mark */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] space-y-4 lg:col-span-2">
          <div className="flex items-center space-x-2.5 border-b border-[var(--border-hairline)] pb-3">
            <Building2 className="w-4 h-4 text-[var(--accent-brass)]" />
            <h3 className="font-serif-display font-semibold text-base text-[var(--text-primary)]">
              Default Company Profile & Permanent Brand Mark
            </h3>
          </div>

          {/* Logo Mark Control Box */}
          <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 rounded-full border border-[var(--accent-brass)]/50 overflow-hidden bg-black shrink-0 flex items-center justify-center shadow-md">
                <img
                  src={normalizeLogoUrl(formSettings.defaultCompanyDetails.logoUrl)}
                  alt="KS TEX Brand Mark"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = BRAND_LOGO_DEFAULT;
                  }}
                />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-serif-display font-bold text-[var(--text-primary)]">
                  Permanent Brand Logo Mark
                </div>
                <div className="text-[11px] text-[var(--text-muted)] max-w-md">
                  This official KS emblem appears automatically on all created invoices, PDFs, and header bars. If changed by admin, the new logo becomes permanently fixed across devices.
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <label className="px-3 py-1.5 rounded-lg bg-[var(--accent-brass)] text-[#15130f] text-xs font-bold hover:bg-[#d4b068] transition-colors cursor-pointer flex items-center space-x-1.5 shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>

              {formSettings.defaultCompanyDetails.logoUrl !== BRAND_LOGO_DEFAULT && (
                <button
                  type="button"
                  onClick={() => handleUpdateCompany('logoUrl', BRAND_LOGO_DEFAULT)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-solid)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Reset Default
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Company Name</label>
              <input
                type="text"
                value={formSettings.defaultCompanyDetails.companyName}
                onChange={(e) => handleUpdateCompany('companyName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-brass)] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Invocation Line</label>
              <input
                type="text"
                value={formSettings.defaultCompanyDetails.invocationLine}
                onChange={(e) => handleUpdateCompany('invocationLine', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-serif italic outline-none focus:border-[var(--accent-brass)] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Tagline</label>
              <input
                type="text"
                value={formSettings.defaultCompanyDetails.tagline}
                onChange={(e) => handleUpdateCompany('tagline', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-brass)] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">GSTIN</label>
              <input
                type="text"
                value={formSettings.defaultCompanyDetails.gstin}
                onChange={(e) => handleUpdateCompany('gstin', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono uppercase outline-none focus:border-[var(--accent-brass)] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Phone</label>
              <input
                type="text"
                value={formSettings.defaultCompanyDetails.phone}
                onChange={(e) => handleUpdateCompany('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-brass)] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Email</label>
              <input
                type="email"
                value={formSettings.defaultCompanyDetails.email}
                onChange={(e) => handleUpdateCompany('email', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-brass)] text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Bank & Payment Coordinates */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] space-y-4 lg:col-span-2">
          <div className="flex items-center space-x-2.5 border-b border-[var(--border-hairline)] pb-3">
            <Landmark className="w-4 h-4 text-[var(--accent-brass)]" />
            <h3 className="font-serif-display font-semibold text-base text-[var(--text-primary)]">
              Default Bank Settlement Account
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Bank Name</label>
              <input
                type="text"
                value={formSettings.defaultBankDetails.bankName}
                onChange={(e) => handleUpdateBank('bankName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-brass)] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Account Number</label>
              <input
                type="text"
                value={formSettings.defaultBankDetails.accountNo}
                onChange={(e) => handleUpdateBank('accountNo', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono outline-none focus:border-[var(--accent-brass)] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">IFSC Code</label>
              <input
                type="text"
                value={formSettings.defaultBankDetails.ifscCode}
                onChange={(e) => handleUpdateBank('ifscCode', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono uppercase outline-none focus:border-[var(--accent-brass)] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Branch Name</label>
              <input
                type="text"
                value={formSettings.defaultBankDetails.branchName}
                onChange={(e) => handleUpdateBank('branchName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-brass)] text-xs"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
