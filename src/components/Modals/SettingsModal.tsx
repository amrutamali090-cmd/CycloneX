import React from 'react';
import { createPortal } from 'react-dom';
import { X, Settings, Sliders, Volume2, Globe, Cpu } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  windUnit: 'km/h' | 'knots';
  onToggleWindUnit: (unit: 'km/h' | 'knots') => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  windUnit,
  onToggleWindUnit,
  soundEnabled,
  onToggleSound,
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      style={{ zIndex: 1050 }}
    >
      <div
        className="relative w-full max-w-md bg-[#090f1f] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl"
        style={{ zIndex: 1051 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0a1226]">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white font-['Chakra_Petch']">
              Mission Control Console Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Form */}
        <div className="p-4 space-y-4 text-xs text-slate-300">
          {/* Velocity Unit */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="font-semibold text-white">Wind Velocity Unit</div>
              <div className="text-[11px] text-slate-400">Measurement standard for anemometry</div>
            </div>
            <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => onToggleWindUnit('km/h')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium ${
                  windUnit === 'km/h' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' : 'text-slate-400'
                }`}
              >
                km/h
              </button>
              <button
                onClick={() => onToggleWindUnit('knots')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium ${
                  windUnit === 'knots' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' : 'text-slate-400'
                }`}
              >
                knots
              </button>
            </div>
          </div>

          {/* Sound Alerts */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="font-semibold text-white">Audible Threat Alerts</div>
              <div className="text-[11px] text-slate-400">Audio pings during critical landfall simulation</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => onToggleSound(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          {/* AI Intelligence Architecture */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>AI Integration Architecture</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Equipped with decoupled backend proxy routing to Google GenAI SDK with model <strong className="text-slate-200">gemini-3.8-flash</strong>.
              Automatically switches between live server-side AI evaluation and client-side physics simulation.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs"
          >
            Save & Exit
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
