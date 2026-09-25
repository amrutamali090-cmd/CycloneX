import React from 'react';
import { InfrastructureAsset } from '../types/cyclone';
import { ShieldAlert, PlusSquare, Zap, AlertTriangle, ChevronRight } from 'lucide-react';

interface ProtectFirstPanelProps {
  assets: InfrastructureAsset[];
  onFocusAsset: (asset: InfrastructureAsset) => void;
  onOpenAllAssets: () => void;
}

export const ProtectFirstPanel: React.FC<ProtectFirstPanelProps> = ({
  assets,
  onFocusAsset,
  onOpenAllAssets,
}) => {
  // Sort assets by urgency (shortest timeToImpact and highest vulnerability)
  const prioritized = [...assets]
    .sort((a, b) => a.timeToImpactHours - b.timeToImpactHours)
    .slice(0, 3);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return <PlusSquare className="w-4 h-4 text-rose-400" />;
      case 'power':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'road':
        return <AlertTriangle className="w-4 h-4 text-blue-400" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getAssetBg = (type: string) => {
    switch (type) {
      case 'hospital':
        return 'bg-rose-950/60 border-rose-500/40 text-rose-400';
      case 'power':
        return 'bg-amber-950/60 border-amber-500/40 text-amber-400';
      default:
        return 'bg-blue-950/60 border-blue-500/40 text-blue-400';
    }
  };

  return (
    <div className="bg-[#090f1f]/95 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Protect First</span>
        </h2>
      </div>
      <p className="text-[11px] text-slate-400 mb-3">
        Critical assets based on current scenario
      </p>

      {/* Asset Cards Ranked 1, 2, 3 */}
      <div className="flex flex-col gap-2">
        {prioritized.map((asset, index) => (
          <button
            key={asset.id}
            onClick={() => onFocusAsset(asset)}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all text-left group"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-slate-400 w-3 text-center">
                {index + 1}
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center border ${getAssetBg(
                  asset.type
                )}`}
              >
                {getAssetIcon(asset.type)}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                  {asset.name}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                      asset.vulnerability === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : asset.vulnerability === 'HIGH'
                        ? 'bg-rose-950/60 text-rose-400 border-rose-900'
                        : 'bg-amber-950/60 text-amber-300 border-amber-900'
                    }`}
                  >
                    {asset.vulnerability} VULNERABILITY
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {asset.timeToImpactHours} hrs before impact
                  </span>
                </div>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800/80">
        <button
          onClick={onOpenAllAssets}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>View all critical assets</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
