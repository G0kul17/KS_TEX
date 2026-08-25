import React from 'react';
import { 
  LayoutDashboard, 
  FilePlus, 
  FileDiff,
  History, 
  FileClock, 
  Users, 
  Settings as SettingsIcon,
  X
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'generate' | 'generate_debit_note' | 'history' | 'drafts' | 'customers' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  draftCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  draftCount = 0,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  interface NavItem {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'generate', label: 'Generate Invoice', icon: FilePlus },
    { id: 'generate_debit_note', label: 'Generate Debit Note', icon: FileDiff },
    { id: 'history', label: 'Document History', icon: History },
    { id: 'drafts', label: 'Draft Bills', icon: FileClock, badge: draftCount },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const content = (
    <aside className="w-64 bg-[var(--bg-surface)] border-r border-[var(--border-solid)] flex flex-col justify-between h-full py-6 px-3">
      <div className="space-y-6">
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-3 lg:hidden">
          <span className="font-serif-display font-semibold text-lg text-[var(--text-primary)]">
            Navigation
          </span>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  onTabChange(item.id as ActiveTab);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'bg-[var(--accent-brass)]/15 text-[var(--accent-brass)] border border-[var(--accent-brass)]/30 font-semibold shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[var(--accent-brass)]' : 'text-[var(--text-muted)]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded-full bg-[var(--accent-terracotta)]/20 text-[var(--accent-terracotta)] border border-[var(--accent-terracotta)]/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Signature Branding Motif */}
      <div className="px-3 pt-4 border-t border-[var(--border-hairline)] space-y-2">
        <div className="thread-stitch !mt-1 !mb-3"></div>
        <div className="text-[11px] text-[var(--text-muted)] font-serif italic text-center">
          "Crafting Luxury Silk & Yarn Legacy"
        </div>
        <div className="text-[10px] text-[var(--text-muted)] font-mono text-center opacity-70">
          GST-Compliant v2.4.0
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-[calc(100vh-57px)] sticky top-[57px] shrink-0">
        {content}
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-xs bg-[var(--bg-surface)] h-full shadow-2xl z-10 transition-transform">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
