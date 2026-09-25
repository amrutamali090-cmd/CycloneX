import React from 'react';
import {
  LayoutDashboard,
  Compass,
  AlertOctagon,
  Building2,
  Sliders,
  Sparkles,
  Settings as SettingsIcon,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'track'
  | 'impact'
  | 'infrastructure'
  | 'simulation'
  | 'ai-analysis'
  | 'settings';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSettings: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'track', label: 'Track', icon: Compass },
    { id: 'impact', label: 'Impact', icon: AlertOctagon },
    { id: 'infrastructure', label: 'Infrastructure', icon: Building2 },
    { id: 'simulation', label: 'Simulation', icon: Sliders },
    { id: 'ai-analysis', label: 'AI Analysis', icon: Sparkles },
  ] as const;

  return (
    <aside className="w-16 lg:w-28 bg-[#070b16] border-r border-slate-800/80 flex flex-col justify-between py-3 shrink-0 select-none z-20">
      <div className="flex flex-col gap-1 px-1.5 lg:px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all group relative ${
                isActive
                  ? 'bg-cyan-950/50 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r-md" />
              )}
              <Icon
                className={`w-5 h-5 mb-1 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400'
                }`}
              />
              <span className="text-[11px] font-medium tracking-tight truncate w-full text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Settings Button */}
      <div className="px-1.5 lg:px-2 pt-2 border-t border-slate-800/60">
        <button
          onClick={onOpenSettings}
          className={`w-full flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all group ${
            activeTab === 'settings'
              ? 'bg-cyan-950/50 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <SettingsIcon className="w-5 h-5 mb-1 group-hover:rotate-45 transition-transform" />
          <span className="text-[11px] font-medium tracking-tight">Settings</span>
        </button>
      </div>
    </aside>
  );
};
