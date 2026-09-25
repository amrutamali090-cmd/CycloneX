import React, { useState, useEffect } from 'react';
import { CycloneScenario, SimulationParams } from '../types/cyclone';
import { Wind, CloudRain, Navigation2, Gauge, Waves } from 'lucide-react';

interface CycloneScenarioHeaderProps {
  scenario: CycloneScenario;
  simulationParams: SimulationParams;
  hoursRemaining: number;
}

export const CycloneScenarioHeader: React.FC<CycloneScenarioHeaderProps> = ({
  scenario,
  simulationParams,
  hoursRemaining,
}) => {
  // Live countdown state in seconds
  const [secondsLeft, setSecondsLeft] = useState(
    Math.round(hoursRemaining * 3600)
  );

  useEffect(() => {
    setSecondsLeft(Math.round(hoursRemaining * 3600));
  }, [hoursRemaining]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')} : ${String(mins).padStart(2, '0')} : ${String(secs).padStart(2, '0')}`;
  };

  const currentWinds = simulationParams.isSimulated
    ? simulationParams.windSpeed
    : scenario.maxWindsKmh;
  const currentRain = simulationParams.isSimulated
    ? simulationParams.rainfall
    : scenario.rainfallMm;

  return (
    <div className="bg-[#090f1e]/90 border-b border-slate-800/80 px-4 py-3 select-none">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Title, Category & Location */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight font-['Chakra_Petch']">
              {scenario.name}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase ${
                scenario.overallRiskLevel === 'EXTREME'
                  ? 'bg-rose-950/80 border border-rose-500/60 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              {scenario.overallRiskLevel} RISK
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
            <span>• {scenario.basin}</span>
            <span>• {scenario.centerLat}°N, {scenario.centerLng}°E</span>
            <span>• {scenario.etaDisplay}</span>
          </div>
        </div>

        {/* Large Countdown Clock */}
        <div className="flex flex-col items-start xl:items-center justify-center">
          <div className="font-['Chakra_Petch'] text-2xl lg:text-3xl font-bold tracking-widest text-white tabular-nums text-shadow-glow">
            {formatCountdown(secondsLeft)}
          </div>
          <div className="text-[11px] text-slate-400 tracking-tight -mt-0.5">
            Estimated time until projected impact
          </div>
        </div>

        {/* Telemetry Indicator Cards */}
        <div className="flex items-center gap-2 lg:gap-3 overflow-x-auto pb-1 xl:pb-0">
          {/* Wind */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Wind
              </div>
              <div className="text-sm font-bold text-white font-mono">
                {currentWinds} <span className="text-[11px] font-normal text-slate-400">km/h</span>
              </div>
            </div>
          </div>

          {/* Rainfall */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-blue-950/70 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Rainfall
              </div>
              <div className="text-sm font-bold text-white font-mono">
                {currentRain} <span className="text-[11px] font-normal text-slate-400">mm</span>
              </div>
            </div>
          </div>

          {/* Track */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-teal-950/70 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Navigation2 className="w-4 h-4 rotate-45" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Track
              </div>
              <div className="text-sm font-bold text-white font-mono">
                {scenario.trackHeading}
              </div>
            </div>
          </div>

          {/* Central Pressure */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Pressure
              </div>
              <div className="text-sm font-bold text-white font-mono">
                {scenario.centralPressureHpa} <span className="text-[11px] font-normal text-slate-400">hPa</span>
              </div>
            </div>
          </div>

          {/* Storm Surge */}
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-amber-950/70 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Surge
              </div>
              <div className="text-sm font-bold text-white font-mono">
                {scenario.stormSurgeMeters} <span className="text-[11px] font-normal text-slate-400">m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
