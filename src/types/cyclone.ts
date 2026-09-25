export type RiskLevel = 'EXTREME' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AssetType = 'hospital' | 'power' | 'road' | 'population' | 'shelter';

export interface TrackPoint {
  lat: number;
  lng: number;
  timestamp: string;
  status: 'past' | 'current' | 'projected';
  windSpeedKmh: number;
  label?: string;
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  type: AssetType;
  lat: number;
  lng: number;
  vulnerability: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timeToImpactHours: number;
  elevationMeters: number;
  backupPowerStatus: 'Operational' | 'At Risk' | 'None' | 'Submerged';
  capacityOrLoad: string;
  impactRisk: string;
  recommendedAction: string;
}

export interface TimelineMilestone {
  id: string;
  timeLabel: string;
  subtitle: string;
  hoursFromLandfall: number;
  lat: number;
  lng: number;
  windSpeedKmh: number;
  rainfallMm: number;
  summary: string;
}

export interface CycloneScenario {
  id: string;
  name: string;
  basin: string;
  category: string;
  centerLat: number;
  centerLng: number;
  trackHeading: string;
  maxWindsKmh: number;
  rainfallMm: number;
  centralPressureHpa: number;
  stormSurgeMeters: number;
  etaHours: number;
  etaDisplay: string;
  overallRiskLevel: RiskLevel;
  overallRiskPercent: number;
  landfallTarget: string;
  trackPoints: TrackPoint[];
  milestones: TimelineMilestone[];
  highRiskZonesCount: number;
  mediumRiskZonesCount: number;
  lowRiskZonesCount: number;
  hospitalsAtRisk: { count: number; total: number };
  powerAtRisk: { count: number; total: number };
  roadsAtRisk: { count: number; total: number };
  populationZonesAtRisk: { count: number; total: number };
  assets: InfrastructureAsset[];
  aiAnalysis: {
    title: string;
    whyAtRisk: string;
    confidence: number;
    keyFactors: string[];
    actionPlan: Array<{
      id: string;
      title: string;
      detail: string;
      urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    }>;
  };
}

export interface SimulationParams {
  windSpeed: number;
  rainfall: number;
  trackDeviationKm: number;
  forwardSpeedKmh: number;
  isSimulated: boolean;
}
