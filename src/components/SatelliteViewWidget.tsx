import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X, Eye, Activity, Radio } from 'lucide-react';

export const SatelliteViewWidget: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  // We use the generated images
  const globeImage = '/src/assets/images/cyclonex_satellite_globe_1790326389028.jpg';
  const radarImage = '/src/assets/images/cyclonex_radar_composite_1790326402453.jpg';

  return (
    <>
      {/* Small Widget In Right Sidebar */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-xl group">
        <div className="relative aspect-video w-full overflow-hidden">
          {/* Orbital Satellite Image with fallback */}
          <img
            src={globeImage}
            alt="Real-time orbital satellite view of cyclone"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              // Fallback SVG styling if image fails
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />

          {/* Fallback container in case image doesn't render */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-[#050b18] via-[#0b1b36] to-[#040814] flex items-center justify-center">
            <Radio className="w-8 h-8 text-cyan-500/40 animate-pulse" />
          </div>

          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

          {/* Radar Sweep Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="w-full h-full border border-cyan-500/20 rounded-full animate-radar-sweep" />
          </div>

          {/* Title & Expand Button */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-slate-200">
                Real-time Satellite View
              </span>
            </div>

            <button
              onClick={() => setIsExpanded(true)}
              className="p-1 rounded-md bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
              title="Expand High-Res Satellite View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Modal */}
      {isExpanded &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            style={{ zIndex: 1050 }}
          >
            <div
              className="relative w-full max-w-4xl bg-[#090f1f] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl"
              style={{ zIndex: 1051 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                    High-Resolution Orbital Satellite & Radar Imagery
                  </h3>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content Image Grid */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-cyan-300 mb-1.5 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visible / Thermal Orbital Satellite Feed</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-800 aspect-video bg-black">
                    <img
                      src={globeImage}
                      alt="Orbital Satellite Observation"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    Spectral Band: 10.8µm IR • Resolution: 500m • Refresh: 15 min
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-amber-300 mb-1.5 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Doppler Radar Reflectivity Composite</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-800 aspect-video bg-black">
                    <img
                      src={radarImage}
                      alt="Radar Composite Observation"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    Doppler Sweep: S-Band coastal radars (Paradip, Gopalpur, Kolkata)
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
                <span>Simulation mode calibration. Data synchronized with scenario parameters.</span>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
                >
                  Close View
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
