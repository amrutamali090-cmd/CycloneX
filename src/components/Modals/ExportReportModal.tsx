import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import { CycloneScenario, SimulationParams } from '../../types/cyclone';
import { X, Printer, Copy, Check, FileText, MapPin } from 'lucide-react';

interface ExportReportModalProps {
  scenario: CycloneScenario;
  simulationParams: SimulationParams;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  scenario,
  simulationParams,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);
  const reportMapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const now = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });

  // Initialize report tactical impact map when modal opens
  useEffect(() => {
    if (!isOpen || !reportMapRef.current) return;

    // Small delay to allow container dimensions to compute
    const timer = setTimeout(() => {
      if (!reportMapRef.current) return;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }

      const map = L.map(reportMapRef.current, {
        center: [scenario.centerLat, scenario.centerLng],
        zoom: 6,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      // Track line
      const points: [number, number][] = scenario.trackPoints.map((p) => [
        p.lat,
        p.status === 'projected' ? p.lng + simulationParams.trackDeviationKm * 0.009 : p.lng,
      ]);
      L.polyline(points, {
        color: '#38bdf8',
        weight: 3,
        dashArray: '5, 7',
      }).addTo(map);

      // Storm center marker
      const cycloneIconHtml = `
        <div class="relative w-8 h-8 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div class="w-8 h-8 rounded-full border-2 border-rose-500 bg-rose-950/80 animate-spin flex items-center justify-center">
            <div class="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
          </div>
        </div>
      `;
      const vortexIcon = L.divIcon({
        html: cycloneIconHtml,
        className: 'report-cyclone-icon',
        iconSize: [0, 0],
      });
      L.marker([scenario.centerLat, scenario.centerLng + simulationParams.trackDeviationKm * 0.009], {
        icon: vortexIcon,
      }).addTo(map);

      // High risk zone polygon
      L.polygon(
        [
          [19.65, 85.45],
          [19.95, 86.15],
          [20.25, 86.60],
          [20.45, 86.40],
          [20.15, 85.70],
          [19.80, 85.30],
        ],
        {
          color: '#f43f5e',
          fillColor: '#f43f5e',
          fillOpacity: 0.35,
          weight: 1.5,
        }
      ).addTo(map);

      // Key critical assets
      scenario.assets.slice(0, 5).forEach((asset) => {
        const dotHtml = `
          <div class="w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full ${
            asset.vulnerability === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-500'
          } border border-white shadow-md flex items-center justify-center text-[8px] font-bold text-black">
            ${asset.type === 'hospital' ? '+' : '⚡'}
          </div>
        `;
        const icon = L.divIcon({
          html: dotHtml,
          className: 'report-asset-icon',
          iconSize: [0, 0],
        });
        L.marker([asset.lat, asset.lng], { icon }).addTo(map);
      });

      mapInstance.current = map;
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isOpen, scenario, simulationParams]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const reportText = `
CYCLONEX INCIDENT BRIEFING REPORT
Generated: ${now} (IST)
Scenario: ${scenario.name}
Basin: ${scenario.basin}
Category: ${scenario.category}
Risk Level: ${scenario.overallRiskLevel} (${scenario.overallRiskPercent}%)
Location: ${scenario.centerLat}°N, ${scenario.centerLng}°E
ETA to Landfall: ${scenario.etaDisplay}
Max Sustained Winds: ${simulationParams.windSpeed} km/h
Expected Rainfall: ${simulationParams.rainfall} mm
Estimated Storm Surge: ${scenario.stormSurgeMeters} m

CRITICAL ASSETS AT RISK:
- Hospitals at Risk: ${scenario.hospitalsAtRisk.count} / ${scenario.hospitalsAtRisk.total}
- Power Substations: ${scenario.powerAtRisk.count} / ${scenario.powerAtRisk.total}
- Highway Corridors: ${scenario.roadsAtRisk.count} / ${scenario.roadsAtRisk.total}

TOP OPERATIONAL ACTIONS:
1. Prioritize hospital preparedness (auxiliary fuel, critical ward transfers)
2. Inspect power infrastructure (de-energize coastal switchyards in flood zones)
3. Secure critical roads and evacuation routes (stage heavy equipment on NH-16)
4. Prepare coastal communities (100% evacuation to cyclone shelters)

*SIMULATED PROTOTYPE DATA - NOT AN OFFICIAL FORECAST*
`;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      style={{ zIndex: 9998 }}
    >
      <div
        className="relative w-full max-w-3xl bg-[#090f1f] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        style={{ zIndex: 9999 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0a1226]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-['Chakra_Petch']">
              Disaster Management Incident Dispatch Report
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/80 font-sans text-slate-200 text-xs space-y-5">
          {/* Header watermark/banner */}
          <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
            <div>
              <div className="text-xl font-bold font-['Chakra_Petch'] text-cyan-400">
                CycloneX Intelligence Command
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                Multi-Hazard Infrastructure Vulnerability Assessment
              </div>
            </div>
            <div className="text-right font-mono text-[10px] text-slate-400">
              <div>REPORT ID: CYX-OPS-{Date.now().toString().slice(-6)}</div>
              <div>DATE: {now} (IST)</div>
              <div className="text-rose-400 font-bold uppercase mt-1">STATUS: SIMULATED SCENARIO</div>
            </div>
          </div>

          {/* Telemetry Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Scenario</span>
              <div className="text-sm font-bold text-white font-mono">{scenario.name}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Wind Velocity</span>
              <div className="text-sm font-bold text-cyan-400 font-mono">{simulationParams.windSpeed} km/h</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Precipitation</span>
              <div className="text-sm font-bold text-blue-400 font-mono">{simulationParams.rainfall} mm</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Storm Surge</span>
              <div className="text-sm font-bold text-amber-400 font-mono">{scenario.stormSurgeMeters} meters</div>
            </div>
          </div>

          {/* Strategic Analysis */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              1. Executive Situational Analysis
            </h4>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 leading-relaxed">
              {scenario.aiAnalysis.whyAtRisk}
            </div>
          </div>

          {/* Incident Tactical Geospatial Map */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>2. Projected Landfall & Risk Quadrant Map</span>
              </h4>
              <span className="text-[10px] font-mono text-cyan-400">
                Track Deviation: {simulationParams.trackDeviationKm >= 0 ? `+${simulationParams.trackDeviationKm}` : simulationParams.trackDeviationKm} km
              </span>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-800 h-48 relative bg-[#070c18]">
              <div ref={reportMapRef} className="w-full h-full" />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-[9px] text-slate-300 z-[1000] pointer-events-none">
                Simulated Impact Swath
              </div>
            </div>
          </div>

          {/* Infrastructure Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              3. Vulnerable Asset Status
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Hospitals</span>
                <span className="text-sm font-bold text-rose-400">{scenario.hospitalsAtRisk.count} / {scenario.hospitalsAtRisk.total}</span>
              </div>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Power Substations</span>
                <span className="text-sm font-bold text-amber-400">{scenario.powerAtRisk.count} / {scenario.powerAtRisk.total}</span>
              </div>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Evacuation Roads</span>
                <span className="text-sm font-bold text-blue-400">{scenario.roadsAtRisk.count} / {scenario.roadsAtRisk.total}</span>
              </div>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Pop. Sectors</span>
                <span className="text-sm font-bold text-cyan-400">{scenario.populationZonesAtRisk.count} / {scenario.populationZonesAtRisk.total}</span>
              </div>
            </div>
          </div>

          {/* Action Directives */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              4. Mandatory Operational Directives
            </h4>
            <div className="space-y-2">
              {scenario.aiAnalysis.actionPlan.map((act, i) => (
                <div key={act.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-white">{act.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{act.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Simulated Disclaimer Footer */}
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300/90 leading-relaxed">
            <strong>NOTICE:</strong> This document was generated using simulated meteorological and infrastructure models for hackathon demonstration. It is not an official forecast from the India Meteorological Department (IMD) or government disaster authority.
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Prepared for emergency responders and planning coordinators</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
