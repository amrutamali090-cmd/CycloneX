import React, { useState } from 'react';
import { CycloneScenario, SimulationParams } from '../types/cyclone';
import { Sliders, Play, RotateCcw, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface ScenarioLabProps {
  scenario: CycloneScenario;
  simulationParams: SimulationParams;
  onUpdateParams: (params: SimulationParams) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
}

export const ScenarioLab: React.FC<ScenarioLabProps> = ({
  scenario,
  simulationParams,
  onUpdateParams,
  onRunSimulation,
  isSimulating,
}) => {
  // Temporary slider draft values before user clicks "RUN SIMULATION"
  const [draftWind, setDraftWind] = useState(simulationParams.windSpeed);
  const [draftRain, setDraftRain] = useState(simulationParams.rainfall);
  const [draftDev, setDraftDev] = useState(simulationParams.trackDeviationKm);

  // Compute what the predicted values would be if simulated
  const factor = (draftWind / 120 + draftRain / 250) / 2;
  const simulatedRiskLevel = factor >= 1.25 ? 'Extreme' : factor >= 0.9 ? 'High' : 'Moderate';
  const predictedZones = Math.round(12 * factor);
  const predictedHospitals = Math.round(4 * factor);
  const predictedRoads = Math.round(7 * factor);

  const handleWindChange = (val: number) => {
    setDraftWind(val);
    onUpdateParams({ ...simulationParams, windSpeed: val });
  };

  const handleRainChange = (val: number) => {
    setDraftRain(val);
    onUpdateParams({ ...simulationParams, rainfall: val });
  };

  const handleDevChange = (val: number) => {
    setDraftDev(val);
    onUpdateParams({ ...simulationParams, trackDeviationKm: val });
  };

  const handleReset = () => {
    setDraftWind(scenario.maxWindsKmh);
    setDraftRain(scenario.rainfallMm);
    setDraftDev(12);
    onUpdateParams({
      windSpeed: scenario.maxWindsKmh,
      rainfall: scenario.rainfallMm,
      trackDeviationKm: 12,
      forwardSpeedKmh: 18,
      isSimulated: false,
    });
  };

  return (
    <div className="bg-[#090f1f]/95 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-2">
              <span>Scenario Lab</span>
              {simulationParams.isSimulated && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  SIMULATION ACTIVE
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-400">
              Adjust parameters to simulate different outcomes
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors"
          title="Reset to Baseline Forecast"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Sliders Area (col-span-7) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Wind Speed Slider */}
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-300 font-medium">Wind Speed</span>
              <span className="text-xs font-mono font-bold text-cyan-300">
                {draftWind} <span className="text-[10px] font-normal text-slate-400">km/h</span>
              </span>
            </div>
            <input
              type="range"
              min="60"
              max="200"
              step="5"
              value={draftWind}
              onChange={(e) => handleWindChange(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>60</span>
              <span>200</span>
            </div>
          </div>

          {/* Rainfall Slider */}
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-300 font-medium">Rainfall</span>
              <span className="text-xs font-mono font-bold text-blue-300">
                {draftRain} <span className="text-[10px] font-normal text-slate-400">mm</span>
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={draftRain}
              onChange={(e) => handleRainChange(Number(e.target.value))}
              className="w-full accent-blue-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>50</span>
              <span>500</span>
            </div>
          </div>

          {/* Track Deviation Slider */}
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-300 font-medium">Track Deviation</span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {draftDev >= 0 ? `+${draftDev}` : draftDev} <span className="text-[10px] font-normal text-slate-400">km</span>
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="2"
              value={draftDev}
              onChange={(e) => handleDevChange(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>-50</span>
              <span>+50</span>
            </div>
          </div>
        </div>

        {/* Current vs New Scenario Outcome Preview (col-span-3) */}
        <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
          <div className="text-[11px] font-semibold text-slate-300 mb-1.5">
            Current vs New Scenario
          </div>

          <div className="flex items-baseline gap-2 text-xs mb-2">
            <div>
              <span className="text-[10px] text-slate-400 block">Current</span>
              <span className="font-bold text-rose-400">High Risk</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div>
              <span className="text-[10px] text-slate-400 block">New (after simulation)</span>
              <span className="font-bold text-amber-400">{simulatedRiskLevel} Risk</span>
            </div>
          </div>

          {/* Metrics comparison */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono pt-1.5 border-t border-slate-800/80">
            <div>
              <span className="text-slate-400 block text-[9px]">Risk Zones</span>
              <span className="font-semibold text-white">12 → <strong className="text-cyan-300">{predictedZones}</strong></span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">Hospitals</span>
              <span className="font-semibold text-white">4 → <strong className="text-rose-300">{predictedHospitals}</strong></span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">Roads</span>
              <span className="font-semibold text-white">7 → <strong className="text-amber-300">{predictedRoads}</strong></span>
            </div>
          </div>
        </div>

        {/* Big Action Button (col-span-2) */}
        <div className="lg:col-span-2">
          <button
            onClick={onRunSimulation}
            disabled={isSimulating}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg ${
              isSimulating
                ? 'bg-cyan-800 text-cyan-200 cursor-not-allowed animate-pulse'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-blue-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isSimulating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run Simulation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
