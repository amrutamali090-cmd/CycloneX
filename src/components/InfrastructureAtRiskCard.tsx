import React from 'react';
import { CycloneScenario, SimulationParams, AssetType } from '../types/cyclone';
import { PlusSquare, Zap, AlertTriangle, Users } from 'lucide-react';

interface InfrastructureAtRiskCardProps {
  scenario: CycloneScenario;
  simulationParams: SimulationParams;
  selectedAssetType: AssetType | null;
  onSelectAssetType: (type: AssetType | null) => void;
  onOpenAllAssets: () => void;
}

export const InfrastructureAtRiskCard: React.FC<InfrastructureAtRiskCardProps> = ({
  scenario,
  simulationParams,
  selectedAssetType,
  onSelectAssetType,
  onOpenAllAssets,
}) => {
  // If simulated parameters, compute dynamic risk scaling
  let hospRisk = scenario.hospitalsAtRisk.count;
  let powerRisk = scenario.powerAtRisk.count;
  let roadsRisk = scenario.roadsAtRisk.count;
  let popRisk = scenario.populationZonesAtRisk.count;

  if (simulationParams.isSimulated) {
    const factor = (simulationParams.windSpeed / 120 + simulationParams.rainfall / 250) / 2;
    hospRisk = Math.min(scenario.hospitalsAtRisk.total, Math.round(scenario.hospitalsAtRisk.count * factor));
    powerRisk = Math.min(scenario.powerAtRisk.total, Math.round(scenario.powerAtRisk.count * factor));
    roadsRisk = Math.min(scenario.roadsAtRisk.total, Math.round(scenario.roadsAtRisk.count * factor));
    popRisk = Math.min(scenario.populationZonesAtRisk.total, Math.round(scenario.populationZonesAtRisk.count * factor));
  }

  const items = [
    {
      type: 'hospital' as AssetType,
      label: 'Hospitals',
      current: hospRisk,
      total: scenario.hospitalsAtRisk.total,
      icon: PlusSquare,
      color: 'text-rose-400',
      bg: 'bg-rose-950/60 border-rose-500/40',
      iconBg: 'bg-rose-500/20 text-rose-400',
    },
    {
      type: 'power' as AssetType,
      label: 'Power Infrastructure',
      current: powerRisk,
      total: scenario.powerAtRisk.total,
      icon: Zap,
      color: 'text-amber-400',
      bg: 'bg-amber-950/60 border-amber-500/40',
      iconBg: 'bg-amber-500/20 text-amber-400',
    },
    {
      type: 'road' as AssetType,
      label: 'Roads',
      current: roadsRisk,
      total: scenario.roadsAtRisk.total,
      icon: AlertTriangle,
      color: 'text-blue-400',
      bg: 'bg-blue-950/60 border-blue-500/40',
      iconBg: 'bg-blue-500/20 text-blue-400',
    },
    {
      type: 'population' as AssetType,
      label: 'Population Zones',
      current: popRisk,
      total: scenario.populationZonesAtRisk.total,
      icon: Users,
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/60 border-cyan-500/40',
      iconBg: 'bg-cyan-500/20 text-cyan-400',
    },
  ];

  return (
    <div className="bg-[#090f1f]/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-200 tracking-tight">
          Infrastructure at Risk
        </h2>
        <button
          onClick={onOpenAllAssets}
          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
        >
          View Inventory →
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedAssetType === item.type;
          return (
            <button
              key={item.type}
              onClick={() => onSelectAssetType(isSelected ? null : item.type)}
              className={`flex items-center justify-between p-2 rounded-xl transition-all border ${
                isSelected
                  ? `${item.bg} shadow-md`
                  : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/40 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-200">{item.label}</span>
              </div>

              <div className="font-mono text-xs">
                <span className="font-bold text-white">{item.current}</span>
                <span className="text-slate-500 mx-1">/</span>
                <span className="text-slate-400">{item.total}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
