import React, { useState, useEffect } from 'react';
import { CycloneScenario } from '../types/cyclone';
import { SCENARIOS } from '../data/mockScenarios';
import { AlertTriangle, ChevronDown, Radio, Activity, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currentScenario: CycloneScenario;
  onSelectScenario: (scenario: CycloneScenario) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScenario,
  onSelectScenario,
  onOpenSettings,
}) => {
  const [timeString, setTimeString] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format: Mon, 26 May 2025 14:32 (IST)
      const datePart = now.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const timePart = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setTimeString(`${datePart} ${timePart} (IST)`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 border-b border-slate-800/80 bg-[#070b16]/95 backdrop-blur-md px-4 flex items-center justify-between select-none z-30 sticky top-0">
      {/* Brand & Simulation Pill */}
      <div className="flex items-center gap-4">
        {/* CycloneX Logo & Icon */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 flex items-center justify-center">
            {/* Animated neon cyclone swirl */}
            <svg
              viewBox="0 0 100 100"
              className="w-8 h-8 text-cyan-400 animate-cyclone-spin drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]"
            >
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray="25 15"
                fill="none"
                opacity="0.4"
              />
              <path
                d="M 50 12 C 70 15, 88 33, 88 50 C 88 72, 70 88, 50 88 C 30 88, 12 70, 12 50 C 12 36, 22 24, 34 18"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="50" cy="50" r="12" fill="#38bdf8" opacity="0.8" />
              <circle cx="50" cy="50" r="5" fill="#082f49" />
            </svg>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tracking-tight text-white font-['Chakra_Petch']">
                Cyclone<span className="text-cyan-400">X</span>
              </span>
            </div>
            <div className="text-[9px] font-semibold tracking-[0.2em] text-cyan-400/90 -mt-1 uppercase">
              Cyclone Impact Intelligence
            </div>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-slate-800 hidden sm:block mx-1" />

        {/* Demo / Simulation Mode Badge */}
        <div className="hidden lg:flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-medium tracking-wide shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>DEMO / SIMULATION MODE</span>
          </div>
          <span className="text-xs text-slate-400 font-normal">
            Using simulated data for demonstration purposes only
          </span>
        </div>
      </div>

      {/* Scenario Dropdown Quick Switcher */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 text-xs font-medium text-slate-200 transition-all shadow-sm"
        >
          <span className="text-slate-400">Scenario:</span>
          <span className="text-cyan-300 font-semibold">{currentScenario.name}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-1.5 w-64 rounded-lg bg-[#0c1322] border border-slate-700 shadow-2xl py-1 z-50">
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
              Select Cyclone Scenario
            </div>
            {SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => {
                  onSelectScenario(sc);
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-cyan-950/40 transition-colors ${
                  currentScenario.id === sc.id
                    ? 'text-cyan-300 bg-cyan-950/30 font-medium'
                    : 'text-slate-300'
                }`}
              >
                <div>
                  <div className="font-medium">{sc.name}</div>
                  <div className="text-[10px] text-slate-400">{sc.basin} • {sc.category}</div>
                </div>
                {currentScenario.id === sc.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Telemetry & Status */}
      <div className="flex items-center gap-4">
        {/* Live IST Clock */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-slate-300">
          <span className="tabular-nums tracking-wide">{timeString}</span>
        </div>

        {/* System Ready indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-wide">System Ready</span>
        </div>
      </div>
    </header>
  );
};
