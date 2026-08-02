import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { AppSettings, ShadeOption } from '../../types';
import { 
  Building2, 
  Landmark, 
  Settings as SettingsIcon, 
  Palette, 
  Plus, 
  Trash2, 
  Sun, 
  Moon, 
  RotateCcw, 
  Save, 
  Check, 
  Sparkles 
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, toggleTheme } = useTheme();
  const [formSettings, setFormSettings] = useState<AppSettings>(settings);
  const [showSavedToast, setShowSavedToast] = useState(false);

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

  const handleUpdateBank = (field: string, val: string) => {
    setFormSettings({
      ...formSettings,
      defaultBankDetails: {
        ...formSettings.defaultBankDetails,
        [field]: val,
      },
    });
  };

  // Denier catalog management
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

  // Shade catalog management
  const handleAddShadeChip = () => {
    if (!newShadeName.trim()) return;
    const exists = formSettings.shadeOptions.some(
      (s) => s.name.toLowerCase() === newShadeName.trim().toLowerCase() && s.shadeNo === newShadeNo.trim()
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
            Configure invoice defaults, catalog chips, and visual theme tokens
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[var(--accent-brass)] text-[#15130f] text-xs font-bold hover:bg-[#d4b068] transition-all cursor-pointer shadow-md min-h-[40px]"
        >
          {showSavedToast ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{showSavedToast ? 'Settings Saved!' : 'Save Preferences'}</span>
        </button>
      </div>

      <div className="thread-stitch"></div>

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
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                formSettings.theme === 'atelier-noir'
                  ? 'border-[var(--accent-brass)] bg-[#15130f] text-[#f3ede1] shadow-lg ring-1 ring-[var(--accent-brass)]'
                  : 'border-[var(--border-solid)] bg-[var(--bg-base)] text-[var(--text-muted)]'
              }`}
            >
              <Moon className="w-5 h-5 text-[#c6a15b] mb-2" />
              <div className="font-serif-display font-bold text-sm text-[#f3ede1]">Atelier Noir</div>
              <div className="text-[10px] font-mono text-[#a69c8c] mt-0.5">Deep Charcoal Ink & Brass Gold</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormSettings({ ...formSettings, theme: 'daylight' });
                if (settings.theme !== 'daylight') toggleTheme();
              }}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                formSettings.theme === 'daylight'
                  ? 'border-[var(--accent-brass)] bg-[#f7f2e9] text-[#231f1a] shadow-lg ring-1 ring-[var(--accent-brass)]'
                  : 'border-[var(--border-solid)] bg-[var(--bg-base)] text-[var(--text-muted)]'
              }`}
            >
              <Sun className="w-5 h-5 text-[#a9822f] mb-2" />
              <div className="font-serif-display font-bold text-sm text-[#231f1a]">Daylight Mode</div>
              <div className="text-[10px] font-mono text-[#71685c] mt-0.5">Warm Ivory Paper & Brass</div>
            </button>
          </div>
        </div>

        {/* Section 2: Invoice Prefix & GST Defaults */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-[var(--border-hairline)] pb-3">
            <SettingsIcon className="w-4 h-4 text-[var(--accent-brass)]" />
            <h3 className="font-serif-display font-semibold text-base text-[var(--text-primary)]">
              Invoice Defaults
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Invoice Number Prefix</label>
              <input
                type="text"
                value={formSettings.invoicePrefix}
                onChange={(e) => setFormSettings({ ...formSettings, invoicePrefix: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono font-bold focus:border-[var(--accent-brass)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Default GST Type</label>
              <select
                value={formSettings.defaultGstType}
                onChange={(e) => setFormSettings({ ...formSettings, defaultGstType: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono text-xs focus:border-[var(--accent-brass)] outline-none cursor-pointer"
              >
                <option value="INTRA_STATE">Intra-State (CGST + SGST)</option>
                <option value="INTER_STATE">Inter-State (IGST)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Denier Catalog Chips */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-[var(--accent-brass)]" />
              <h3 className="font-serif-display font-semibold text-base text-[var(--text-primary)]">
                Yarn Denier Catalog Options
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {formSettings.denierOptions.map((denier) => (
              <span
                key={denier}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-xs font-mono font-semibold text-[var(--text-primary)]"
              >
                <span>{denier} Denier</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDenierChip(denier)}
                  className="text-[var(--text-muted)] hover:text-[var(--status-error)] cursor-pointer ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-2 pt-2 max-w-xs">
            <input
              type="text"
              placeholder="Add new denier (e.g. 210)"
              value={newDenierChip}
              onChange={(e) => setNewDenierChip(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-xs text-[var(--text-primary)] font-mono outline-none focus:border-[var(--accent-brass)]"
            />
            <button
              type="button"
              onClick={handleAddDenierChip}
              className="px-3 py-1.5 rounded-xl bg-[var(--accent-brass)] text-[#15130f] text-xs font-bold hover:bg-[#d4b068] cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        {/* Section 4: Shade / Colour Catalog Chips */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
            <div className="flex items-center space-x-2.5">
              <Palette className="w-4 h-4 text-[var(--accent-brass)]" />
              <h3 className="font-serif-display font-semibold text-base text-[var(--text-primary)]">
                Shade / Colour Swatch Catalog
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 max-h-72 overflow-y-auto p-1">
            {formSettings.shadeOptions.map((shade, idx) => (
              <span
                key={`${shade.name}-${shade.shadeNo || idx}`}
                className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-xs font-medium text-[var(--text-primary)]"
              >
                <span
                  className="w-3 h-3 rounded-full border border-gray-400 shrink-0"
                  style={{ backgroundColor: shade.hexColor }}
                />
                <span>
                  {shade.name}{' '}
                  {shade.shadeNo && (
                    <span className="font-mono text-[var(--accent-brass)] font-semibold">({shade.shadeNo})</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveShadeChip(shade.name, shade.shadeNo)}
                  className="text-[var(--text-muted)] hover:text-[var(--status-error)] cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 max-w-md">
            <input
              type="text"
              placeholder="Color Name (e.g. CORAL PINK)"
              value={newShadeName}
              onChange={(e) => setNewShadeName(e.target.value)}
              className="flex-1 min-w-[140px] px-3 py-1.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-brass)]"
            />
            <input
              type="text"
              placeholder="Shade No (e.g. A958)"
              value={newShadeNo}
              onChange={(e) => setNewShadeNo(e.target.value)}
              className="w-28 px-3 py-1.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-xs text-[var(--text-primary)] font-mono outline-none focus:border-[var(--accent-brass)] uppercase"
            />
            <input
              type="color"
              value={newShadeHex}
              onChange={(e) => setNewShadeHex(e.target.value)}
              className="w-8 h-8 rounded-lg bg-[var(--bg-base)] border border-[var(--border-solid)] cursor-pointer p-0.5 shrink-0"
            />
            <button
              type="button"
              onClick={handleAddShadeChip}
              className="px-3 py-1.5 rounded-xl bg-[var(--accent-brass)] text-[#15130f] text-xs font-bold hover:bg-[#d4b068] cursor-pointer shrink-0"
            >
              Add
            </button>
          </div>
        </div>

        {/* Section 5: Default Company Info Form */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-solid)] shadow-[var(--shadow-warm)] space-y-4 lg:col-span-2">
          <div className="flex items-center space-x-2.5 border-b border-[var(--border-hairline)] pb-3">
            <Building2 className="w-4 h-4 text-[var(--accent-brass)]" />
            <h3 className="font-serif-display font-semibold text-base text-[var(--text-primary)]">
              Default Company Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Company Name</label>
              <input
                type="text"
                value={formSettings.defaultCompanyDetails.companyName}
                onChange={(e) => handleUpdateCompany('companyName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-brass)]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Invocation Line</label>
              <input
                type="text"
                value={formSettings.defaultCompanyDetails.invocationLine}
                onChange={(e) => handleUpdateCompany('invocationLine', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-serif italic outline-none focus:border-[var(--accent-brass)]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Tagline</label>
              <input
                type="text"
                value={formSettings.defaultCompanyDetails.tagline}
                onChange={(e) => handleUpdateCompany('tagline', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-brass)]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">GSTIN</label>
              <input
                type="text"
                value={formSettings.defaultCompanyDetails.gstin}
                onChange={(e) => handleUpdateCompany('gstin', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] font-mono uppercase outline-none focus:border-[var(--accent-brass)]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Phone</label>
              <input
                type="text"
                value={formSettings.defaultCompanyDetails.phone}
                onChange={(e) => handleUpdateCompany('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-brass)]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Email</label>
              <input
                type="email"
                value={formSettings.defaultCompanyDetails.email}
                onChange={(e) => handleUpdateCompany('email', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-solid)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-brass)]"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
