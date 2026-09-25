import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CycloneScenario, InfrastructureAsset, AssetType, SimulationParams } from '../../types/cyclone';
import { Layers, Compass, ZoomIn, ZoomOut, Target, AlertCircle, Info, ExternalLink } from 'lucide-react';

interface ImpactMapProps {
  scenario: CycloneScenario;
  simulationParams: SimulationParams;
  selectedRiskFilter: string | null;
  selectedAssetType: AssetType | null;
  focusedAsset: InfrastructureAsset | null;
  currentMilestoneLat?: number;
  currentMilestoneLng?: number;
}

export const ImpactMap: React.FC<ImpactMapProps> = ({
  scenario,
  simulationParams,
  selectedRiskFilter,
  selectedAssetType,
  focusedAsset,
  currentMilestoneLat,
  currentMilestoneLng,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    tileLayer?: L.TileLayer;
    cycloneMarker?: L.Marker;
    trackPolyline?: L.Polyline;
    conePolygons?: L.Polygon[];
    riskPolygons?: L.Polygon[];
    assetMarkers?: L.Marker[];
  }>({});

  const [activeBasemap, setActiveBasemap] = useState<'dark' | 'satellite'>('dark');
  const [visibleLayers, setVisibleLayers] = useState({
    highRisk: true,
    medRisk: true,
    lowRisk: true,
    hospitals: true,
    power: true,
    roads: true,
    population: true,
    vortex: true,
  });
  const [showLayerPanel, setShowLayerPanel] = useState(false);

  // Cyclone center point (can be altered by milestone scrub or track deviation)
  const effectiveCenterLat = currentMilestoneLat ?? scenario.centerLat;
  const effectiveCenterLng = (currentMilestoneLng ?? scenario.centerLng) + (simulationParams.trackDeviationKm * 0.009);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [19.8, 86.5],
      zoom: 6.8,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Tiles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.tileLayer) {
      map.removeLayer(layersRef.current.tileLayer);
    }

    const tileUrl =
      activeBasemap === 'dark'
        ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    const newTile = L.tileLayer(tileUrl, {
      maxZoom: 18,
      subdomains: activeBasemap === 'dark' ? ['a', 'b', 'c'] : ['server', 'services'],
    }).addTo(map);

    layersRef.current.tileLayer = newTile;
  }, [activeBasemap]);

  // Update Cyclone Vortex, Track & Uncertainty Cone
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Clean existing cyclone elements
    if (layersRef.current.cycloneMarker) map.removeLayer(layersRef.current.cycloneMarker);
    if (layersRef.current.trackPolyline) map.removeLayer(layersRef.current.trackPolyline);
    if (layersRef.current.conePolygons) {
      layersRef.current.conePolygons.forEach((p) => map.removeLayer(p));
    }

    // 2. Custom Animated Cyclone Vortex Marker
    const cycloneIconHtml = `
      <div class="relative w-28 h-28 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer">
        <!-- Outer radar spiral arms -->
        <div class="absolute inset-0 animate-cyclone-spin">
          <svg viewBox="0 0 100 100" class="w-full h-full opacity-70">
            <path d="M 50 50 Q 80 20 95 50 T 50 95 Q 20 80 5 50 T 50 5" fill="none" stroke="#22d3ee" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
            <path d="M 50 50 Q 75 30 88 55 T 45 88 Q 25 75 12 45 T 50 12" fill="none" stroke="#f43f5e" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
            <path d="M 50 50 Q 70 40 80 60 T 40 80 Q 30 70 20 40 T 50 20" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
          </svg>
        </div>
        <!-- Inner dense eyewall rotating -->
        <div class="absolute inset-4 rounded-full border-2 border-rose-500/80 animate-cyclone-spin-fast shadow-[0_0_20px_rgba(244,63,94,0.8)] bg-gradient-to-tr from-rose-950/60 via-amber-950/40 to-transparent flex items-center justify-center">
          <div class="w-4 h-4 rounded-full bg-slate-950 border-2 border-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
        </div>
        <!-- Pulse radar circle -->
        <div class="absolute inset-2 rounded-full border border-cyan-400/40 animate-ping opacity-40"></div>
        <!-- Eye label -->
        <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-slate-950/90 border border-rose-500 text-[10px] font-mono font-bold text-rose-300 shadow-md">
          EYE: ${effectiveCenterLat.toFixed(1)}°N, ${effectiveCenterLng.toFixed(1)}°E
        </div>
      </div>
    `;

    const vortexIcon = L.divIcon({
      html: cycloneIconHtml,
      className: 'cyclone-vortex-icon',
      iconSize: [0, 0],
    });

    const cycloneMarker = L.marker([effectiveCenterLat, effectiveCenterLng], {
      icon: vortexIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    cycloneMarker.bindPopup(`
      <div class="p-3 font-sans min-w-[220px]">
        <div class="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2">
          <span class="font-bold text-white text-sm">${scenario.name}</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
            ${scenario.overallRiskLevel}
          </span>
        </div>
        <div class="text-xs text-slate-300 space-y-1 font-mono">
          <div>Winds: <strong class="text-cyan-300">${simulationParams.windSpeed} km/h</strong></div>
          <div>Precipitation: <strong class="text-blue-300">${simulationParams.rainfall} mm</strong></div>
          <div>Heading: <strong class="text-white">${scenario.trackHeading}</strong></div>
          <div>Target: <strong class="text-amber-300">${scenario.landfallTarget}</strong></div>
        </div>
      </div>
    `);

    layersRef.current.cycloneMarker = cycloneMarker;

    // 3. Cyclone Track Polyline (Past + Projected)
    const points: [number, number][] = scenario.trackPoints.map((p) => {
      // apply track deviation to projected points
      if (p.status === 'projected') {
        return [p.lat, p.lng + simulationParams.trackDeviationKm * 0.009];
      }
      return [p.lat, p.lng];
    });

    const trackPolyline = L.polyline(points, {
      color: '#38bdf8',
      weight: 3.5,
      dashArray: '6, 8',
      opacity: 0.9,
    }).addTo(map);

    layersRef.current.trackPolyline = trackPolyline;

    // 4. Uncertainty Cone of Impact (Translucent cone polygon towards coast)
    const conePolygon = L.polygon(
      [
        [effectiveCenterLat, effectiveCenterLng],
        [19.9 + simulationParams.trackDeviationKm * 0.008, 86.8],
        [20.5 + simulationParams.trackDeviationKm * 0.008, 86.3],
        [20.1 + simulationParams.trackDeviationKm * 0.008, 85.3],
        [19.2 + simulationParams.trackDeviationKm * 0.008, 85.0],
      ],
      {
        color: '#f43f5e',
        fillColor: '#f43f5e',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 4',
      }
    ).addTo(map);

    layersRef.current.conePolygons = [conePolygon];
  }, [scenario, simulationParams, effectiveCenterLat, effectiveCenterLng]);

  // Update Risk Polygons on Coastline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.riskPolygons) {
      layersRef.current.riskPolygons.forEach((p) => map.removeLayer(p));
    }

    const createdPolys: L.Polygon[] = [];

    // Red: High Risk Landfall Zone (Puri, Chilika mouth, Konark)
    if (
      visibleLayers.highRisk &&
      (!selectedRiskFilter || selectedRiskFilter === 'high')
    ) {
      const highRisk = L.polygon(
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
          weight: 2,
        }
      ).addTo(map);
      highRisk.bindPopup('<strong class="text-rose-400">High Risk Coastal Zone</strong><br><span class="text-xs text-slate-300">Puri & Marine Drive: High wave wash, 3.8m surge inundation risk.</span>');
      createdPolys.push(highRisk);
    }

    // Orange: Medium Risk Inland Zone (Bhubaneswar, Cuttack, Khordha)
    if (
      visibleLayers.medRisk &&
      (!selectedRiskFilter || selectedRiskFilter === 'medium')
    ) {
      const medRisk = L.polygon(
        [
          [20.10, 85.20],
          [20.65, 85.65],
          [20.55, 86.85],
          [20.25, 86.60],
          [19.95, 86.15],
          [19.80, 85.30],
        ],
        {
          color: '#f59e0b',
          fillColor: '#f59e0b',
          fillOpacity: 0.22,
          weight: 1.5,
        }
      ).addTo(map);
      medRisk.bindPopup('<strong class="text-amber-400">Medium Risk Inland Zone</strong><br><span class="text-xs text-slate-300">Bhubaneswar & Cuttack: 250mm flash floods, major power grid disruption.</span>');
      createdPolys.push(medRisk);
    }

    // Yellow: Low Risk Periphery Zone
    if (
      visibleLayers.lowRisk &&
      (!selectedRiskFilter || selectedRiskFilter === 'low')
    ) {
      const lowRisk = L.polygon(
        [
          [18.5, 84.0],
          [21.5, 86.0],
          [22.2, 88.0],
          [21.0, 88.5],
          [19.0, 86.5],
        ],
        {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.1,
          weight: 1,
        }
      ).addTo(map);
      lowRisk.bindPopup('<strong class="text-emerald-400">Low Risk Outer Swath</strong><br><span class="text-xs text-slate-300">Gale force winds, heavy squalls, maritime alerts.</span>');
      createdPolys.push(lowRisk);
    }

    layersRef.current.riskPolygons = createdPolys;
  }, [visibleLayers, selectedRiskFilter]);

  // Update Infrastructure Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.assetMarkers) {
      layersRef.current.assetMarkers.forEach((m) => map.removeLayer(m));
    }

    const markers: L.Marker[] = [];

    scenario.assets.forEach((asset) => {
      // Filter out if not matching active filters
      if (selectedAssetType && asset.type !== selectedAssetType) return;
      if (asset.type === 'hospital' && !visibleLayers.hospitals) return;
      if (asset.type === 'power' && !visibleLayers.power) return;
      if (asset.type === 'road' && !visibleLayers.roads) return;
      if (asset.type === 'population' && !visibleLayers.population) return;

      let iconHtml = '';

      if (asset.type === 'hospital') {
        iconHtml = `
          <div class="w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-950/90 border-2 border-rose-500 flex items-center justify-center text-rose-300 font-bold shadow-[0_0_12px_rgba(244,63,94,0.7)] hover:scale-125 transition-transform">
            <span class="text-sm font-sans">+</span>
          </div>
        `;
      } else if (asset.type === 'power') {
        iconHtml = `
          <div class="w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-950/90 border-2 border-amber-500 flex items-center justify-center text-amber-300 font-bold shadow-[0_0_12px_rgba(245,158,11,0.7)] hover:scale-125 transition-transform">
            <span class="text-xs">⚡</span>
          </div>
        `;
      } else if (asset.type === 'road') {
        iconHtml = `
          <div class="w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-950/90 border-2 border-blue-500 flex items-center justify-center text-blue-300 font-bold shadow-[0_0_12px_rgba(59,130,246,0.7)] hover:scale-125 transition-transform">
            <span class="text-[10px]">🛣️</span>
          </div>
        `;
      } else {
        // population zone
        iconHtml = `
          <div class="flex items-center gap-1.5 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-[10px] font-semibold tracking-tight shadow-[0_0_10px_rgba(6,182,212,0.5)]">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>${asset.name.split(' ')[0]}</span>
          </div>
        `;
      }

      const icon = L.divIcon({
        html: iconHtml,
        className: 'infra-marker-icon',
        iconSize: [0, 0],
      });

      const marker = L.marker([asset.lat, asset.lng], { icon }).addTo(map);

      // Detailed Interactive Popup
      marker.bindPopup(`
        <div class="p-3 font-sans min-w-[240px]">
          <div class="flex items-center justify-between border-b border-slate-700/80 pb-1.5 mb-2">
            <span class="font-bold text-white text-xs">${asset.name}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
              asset.vulnerability === 'CRITICAL'
                ? 'bg-rose-950 text-rose-300 border border-rose-700'
                : asset.vulnerability === 'HIGH'
                ? 'bg-rose-950/60 text-rose-400 border border-rose-800'
                : 'bg-amber-950/60 text-amber-400 border border-amber-800'
            }">
              ${asset.vulnerability}
            </span>
          </div>

          <div class="text-[11px] text-slate-300 space-y-1 font-mono">
            <div>Type: <strong class="capitalize text-slate-100">${asset.type}</strong></div>
            <div>Time to Impact: <strong class="text-rose-400">${asset.timeToImpactHours} hrs</strong></div>
            <div>Elevation: <strong class="text-slate-100">${asset.elevationMeters}m MSL</strong></div>
            <div>Backup Power: <strong class="text-cyan-300">${asset.backupPowerStatus}</strong></div>
            <div>Capacity: <strong class="text-slate-200">${asset.capacityOrLoad}</strong></div>
          </div>

          <div class="mt-2.5 pt-2 border-t border-slate-800 text-[11px]">
            <div class="text-amber-300/90 font-semibold mb-0.5">Threat:</div>
            <div class="text-slate-300 leading-tight">${asset.impactRisk}</div>
          </div>

          <div class="mt-2 pt-1.5 border-t border-slate-800/80 text-[11px]">
            <div class="text-cyan-400 font-semibold mb-0.5">Priority Directive:</div>
            <div class="text-slate-300 leading-tight">${asset.recommendedAction}</div>
          </div>
        </div>
      `);

      markers.push(marker);
    });

    layersRef.current.assetMarkers = markers;
  }, [scenario, selectedAssetType, visibleLayers]);

  // Center on focused asset if clicked from Protect First panel
  useEffect(() => {
    if (!focusedAsset || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([focusedAsset.lat, focusedAsset.lng], 11, {
      duration: 1.5,
    });
  }, [focusedAsset]);

  // Recenter on storm
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([19.8, 86.5], 6.8, { duration: 1.2 });
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-[#070c18] overflow-hidden select-none">
      {/* The Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Callout: Projected Path Deviation */}
      <div className="absolute top-4 right-16 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-700/80 text-xs text-slate-200 backdrop-blur-md shadow-lg pointer-events-none z-[1000]">
        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
        <span className="font-semibold text-white">Projected Path</span>
        <span className="font-mono text-cyan-300">
          ({simulationParams.trackDeviationKm >= 0 ? `+${simulationParams.trackDeviationKm}` : simulationParams.trackDeviationKm} km deviation)
        </span>
      </div>

      {/* Floating Map Controls (Top Right) */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-[1000]">
        {/* Reset North */}
        <button
          onClick={handleRecenter}
          title="Reset to Storm Orientation"
          className="w-9 h-9 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 flex items-center justify-center shadow-lg transition-colors"
        >
          <Compass className="w-5 h-5" />
        </button>

        {/* Zoom In */}
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          title="Zoom In"
          className="w-9 h-9 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center shadow-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          title="Zoom Out"
          className="w-9 h-9 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center shadow-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Recenter Cyclone */}
        <button
          onClick={() => {
            if (!mapInstanceRef.current) return;
            mapInstanceRef.current.flyTo([effectiveCenterLat, effectiveCenterLng], 8, { duration: 1 });
          }}
          title="Center on Cyclone Eye"
          className="w-9 h-9 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-rose-400 flex items-center justify-center shadow-lg transition-colors"
        >
          <Target className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Map Legend (Bottom Right) */}
      <div className="absolute bottom-4 right-4 max-w-sm rounded-xl bg-[#090f1f]/95 border border-slate-800/90 backdrop-blur-md p-3 shadow-2xl z-[1000]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
          <div className="text-xs font-bold text-slate-200 tracking-tight">
            Map Legend & Layers
          </div>
          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Map Layers</span>
          </button>
        </div>

        {/* Legend Icons Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
            <span>High Risk Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-rose-950 border border-rose-500 text-rose-300 flex items-center justify-center text-[10px] font-bold">+</span>
            <span>Hospitals</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
            <span>Medium Risk Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-amber-950 border border-amber-500 text-amber-300 flex items-center justify-center text-[10px]">⚡</span>
            <span>Power Infrastructure</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
            <span>Low Risk Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-blue-400 rounded" />
            <span>Major Roads</span>
          </div>

          <div className="flex items-center gap-2 col-span-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Population Areas (Puri, Bhubaneswar, Paradip)</span>
          </div>
        </div>

        {/* Source Simulated Notice */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>Source: Simulated Data</span>
          <button
            onClick={() => setActiveBasemap(activeBasemap === 'dark' ? 'satellite' : 'dark')}
            className="text-cyan-400 hover:underline"
          >
            {activeBasemap === 'dark' ? 'Satellite Imagery' : 'Dark Vector'}
          </button>
        </div>

        {/* Expandable Layer Toggles */}
        {showLayerPanel && (
          <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
            <div className="font-semibold text-slate-400 text-[10px] uppercase">Toggle Layers</div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleLayers.highRisk}
                onChange={(e) => setVisibleLayers({ ...visibleLayers, highRisk: e.target.checked })}
                className="rounded border-slate-700 text-rose-500 focus:ring-0"
              />
              <span>High Risk Polygons</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleLayers.hospitals}
                onChange={(e) => setVisibleLayers({ ...visibleLayers, hospitals: e.target.checked })}
                className="rounded border-slate-700 text-rose-500 focus:ring-0"
              />
              <span>Hospitals & Healthcare</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleLayers.power}
                onChange={(e) => setVisibleLayers({ ...visibleLayers, power: e.target.checked })}
                className="rounded border-slate-700 text-amber-500 focus:ring-0"
              />
              <span>Electrical Grid & Substations</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleLayers.roads}
                onChange={(e) => setVisibleLayers({ ...visibleLayers, roads: e.target.checked })}
                className="rounded border-slate-700 text-blue-500 focus:ring-0"
              />
              <span>Evacuation Highways</span>
            </label>
          </div>
        )}
      </div>

      {/* Mandatory Simulated Data Disclaimer Banner */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 backdrop-blur-md shadow-md z-[1000] pointer-events-none">
        <Info className="w-3.5 h-3.5 text-cyan-400" />
        <span>Potential impact shown using simulated data</span>
      </div>
    </div>
  );
};
