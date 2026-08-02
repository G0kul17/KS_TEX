import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, ShieldCheck, Menu } from 'lucide-react';
import { BRAND_LOGO_DEFAULT } from '../../lib/storage';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const { settings, toggleTheme } = useTheme();
  const logoUrl = settings.defaultCompanyDetails?.logoUrl || BRAND_LOGO_DEFAULT;
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const isDark = settings.theme === 'atelier-noir';

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[var(--bg-base)]/90 border-b border-[var(--border-solid)] px-4 lg:px-8 py-3 transition-colors duration-300">
      <div className="flex items-center justify-between max-w-7xl xl:max-w-[1536px] 2xl:max-w-[1720px] mx-auto">
        
        {/* Left: Mobile Menu Toggle & Brand Wordmark with Logo Mark */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full border border-[var(--accent-brass)]/40 overflow-hidden bg-black flex items-center justify-center shrink-0 shadow-sm">
              <img
                src={logoUrl}
                alt="KS TEX Brand Mark"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="font-serif-display font-bold text-xl tracking-wide text-[var(--text-primary)]">
                KS TEX
              </span>
              <span className="hidden sm:inline-block ml-2.5 px-2 py-0.5 text-[10px] uppercase tracking-widest font-mono text-[var(--accent-brass)] bg-[var(--accent-brass)]/10 rounded border border-[var(--accent-brass)]/20">
                Atelier
              </span>
            </div>
          </div>
        </div>

        {/* Center: Current Date / System Status */}
        <div className="hidden md:flex items-center space-x-2 text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-surface)] px-3 py-1.5 rounded-full border border-[var(--border-hairline)] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[var(--status-success)] inline-block animate-pulse"></span>
          <span>{currentDate}</span>
          <span className="text-[var(--border-solid)]">|</span>
          <span className="text-[var(--text-primary)] font-medium">Surat Silk Exchange</span>
        </div>

        {/* Right: Theme Toggle & Admin Badge */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-[var(--border-solid)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--accent-brass)] transition-all duration-200 text-xs font-medium cursor-pointer shadow-xs min-h-[36px]"
            title={`Switch to ${isDark ? 'Daylight' : 'Atelier Noir'} Mode`}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-[var(--accent-brass)]" />
                <span className="hidden sm:inline text-[var(--text-muted)]">Daylight</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[var(--accent-brass)]" />
                <span className="hidden sm:inline text-[var(--text-muted)]">Atelier Noir</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-2.5 pl-2 border-l border-[var(--border-solid)]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-brass)] to-[var(--bg-surface)] text-[#15130f] font-serif font-bold text-xs flex items-center justify-center ring-2 ring-[var(--accent-brass)]/30">
              KT
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-medium text-[var(--text-primary)] leading-tight flex items-center gap-1">
                <span>Admin</span>
                <ShieldCheck className="w-3 h-3 text-[var(--accent-brass)]" />
              </div>
              <div className="text-[10px] text-[var(--text-muted)] font-mono">Offline Storage</div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
