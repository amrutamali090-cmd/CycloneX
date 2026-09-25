import React from 'react';
import { CycloneScenario, SimulationParams } from '../types/cyclone';

interface ImpactSummaryCardProps {
  scenario: CycloneScenario;
  simulationParams: SimulationParams;
  selectedRiskFilter: string | null;
  onSelectRiskFilter: (filter: string | null) => void;
}

export const ImpactSummaryCard: React.FC<ImpactSummaryCardProps> = ({
  scenario,
  simulationParams,
  selectedRiskFilter,
  onSelectRiskFilter,
}) => {
  // If simulated with higher winds or rain, dynamically boost the risk percent & counts
  let riskPercent = scenario.overallRiskPercent;
  let highZones = scenario.highRiskZonesCount;
  let medZones = scenario.mediumRiskZonesCount;
  let lowZones = scenario.lowRiskZonesCount;

  if (simulationParams.isSimulated) {
    const windMultiplier = simulationParams.windSpeed / 120;
    const rainMultiplier = simulationParams.rainfall / 250;
    const factor = (windMultiplier + rainMultiplier) / 2;
    riskPercent = Math.min(96, Math.round(scenario.overallRiskPercent * factor));
    highZones = Math.round(scenario.highRiskZonesCount * factor);
    medZones = Math.round(scenario.mediumRiskZonesCount * factor);
    lowZones = Math.max(8, Math.round(scenario.lowRiskZonesCount / (factor * 0.9)));
  }

  // SVG circular gauge math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (riskPercent / 100) * circumference;

  return (
    <div className="bg-[#090f1f]/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
      <h2 className="text-sm font-semibold text-slate-200 tracking-tight mb-3">
        Impact Summary
      </h2>

      <div className="flex items-center gap-4">
        {/* Circular Donut Gauge */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-24 h-24 -rotate-90">
            {/* Background track */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#1e293b"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Value stroke */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#f43f5e"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]"
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold font-mono text-white tracking-tight">
              {riskPercent}<span className="text-xs font-normal text-rose-400">%</span>
            </span>
            <span className="text-[8px] uppercase tracking-wider text-slate-400 -mt-0.5">
              Overall Risk
            </span>
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
              {riskPercent >= 85 ? 'EXTREME' : 'HIGH'}
            </span>
          </div>
        </div>

        {/* Risk Zones Breakdown */}
        <div className="flex-1 flex flex-col gap-2">
          {/* High Risk */}
          <button
            onClick={() =>
              onSelectRiskFilter(selectedRiskFilter === 'high' ? null : 'high')
            }
            className={`flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-all ${
              selectedRiskFilter === 'high'
                ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
              <span>High Risk Zones</span>
            </div>
            <span className="font-mono font-semibold text-white">{highZones}</span>
          </button>

          {/* Medium Risk */}
          <button
            onClick={() =>
              onSelectRiskFilter(selectedRiskFilter === 'medium' ? null : 'medium')
            }
            className={`flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-all ${
              selectedRiskFilter === 'medium'
                ? 'bg-amber-950/60 border border-amber-500/40 text-amber-300'
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
              <span>Medium Risk Zones</span>
            </div>
            <span className="font-mono font-semibold text-white">{medZones}</span>
          </button>

          {/* Low Risk */}
          <button
            onClick={() =>
              onSelectRiskFilter(selectedRiskFilter === 'low' ? null : 'low')
            }
            className={`flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-all ${
              selectedRiskFilter === 'low'
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <span>Low Risk Zones</span>
            </div>
            <span className="font-mono font-semibold text-white">{lowZones}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
