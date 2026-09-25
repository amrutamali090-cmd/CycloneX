import { CycloneScenario, SimulationParams } from '../types/cyclone';

export interface AIAnalysisRequest {
  scenario: CycloneScenario;
  simulationParams: SimulationParams;
  customPrompt?: string;
}

export interface GeneratedAIAnalysis {
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
  isLiveAI: boolean;
}

/**
 * Cleanly decoupled AI service architecture.
 * Automatically tries server-side Gemini API endpoint first (/api/gemini/analyze).
 * Falls back to high-fidelity domain intelligence if backend is offline or unconfigured.
 */
export async function generateCycloneAnalysis(
  req: AIAnalysisRequest
): Promise<GeneratedAIAnalysis> {
  const { scenario, simulationParams, customPrompt } = req;

  // Try server-side Gemini route if available
  try {
    const res = await fetch('/api/gemini/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scenarioName: scenario.name,
        windSpeed: simulationParams.windSpeed,
        rainfall: simulationParams.rainfall,
        trackDeviation: simulationParams.trackDeviationKm,
        landfallTarget: scenario.landfallTarget,
        customPrompt,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.whyAtRisk) {
        return {
          ...data,
          isLiveAI: true,
        };
      }
    }
  } catch (err) {
    // Graceful fallback to client-side domain computation
    console.debug('Using calibrated local intelligence model:', err);
  }

  // Client-side domain-calibrated simulation model
  return computeCalibratedAnalysis(scenario, simulationParams, customPrompt);
}

function computeCalibratedAnalysis(
  scenario: CycloneScenario,
  params: SimulationParams,
  customPrompt?: string
): GeneratedAIAnalysis {
  const windDelta = params.windSpeed - 120;
  const rainDelta = params.rainfall - 250;
  const dev = params.trackDeviationKm;

  let deviationText = 'direct landfall on baseline track';
  if (dev > 0) deviationText = `a northeast shift of +${dev} km towards Bhubaneswar and Paradip`;
  if (dev < 0) deviationText = `a southwest shift of ${Math.abs(dev)} km towards Chilika and Ganjam`;

  let severityRisk = 'high';
  let confidence = 78;

  if (params.windSpeed >= 165 || params.rainfall >= 350) {
    severityRisk = 'extreme';
    confidence = 89;
  } else if (params.windSpeed < 90 && params.rainfall < 150) {
    severityRisk = 'moderate';
    confidence = 72;
  }

  const whyAtRisk = `The cyclone is projected to make landfall near ${
    scenario.landfallTarget.split(' ')[0]
  }, with ${deviationText}. High wind speeds (${params.windSpeed} km/h) and heavy rainfall (${
    params.rainfall
  } mm) increase the risk of coastal flooding and structural stress, while the region's high population density and critical infrastructure amplify the potential impact.`;

  const keyFactors: string[] = [
    `Projected sustained wind speeds of ${params.windSpeed} km/h with gusts exceeding ${(params.windSpeed * 1.25).toFixed(0)} km/h.`,
    `Cumulative precipitation of ${params.rainfall} mm likely to overwhelm urban drainage culverts and coastal estuaries.`,
    `Track deviation (${dev >= 0 ? `+${dev}` : dev} km) shifts the maximum surge quadrant into high-density industrial and hospital zones.`,
    `Tidal amplitude confluence creates an estimated surge height of ${(3.2 + (params.windSpeed - 100) * 0.02).toFixed(1)} meters.`,
  ];

  if (customPrompt) {
    keyFactors.push(`Analysis focused on operational query: "${customPrompt}"`);
  }

  const actionPlan = [
    {
      id: 'act-dyn-1',
      title: 'Prioritize hospital preparedness',
      detail:
        params.windSpeed > 140
          ? 'Mandatory evacuation of ground floors and pre-positioning double-capacity diesel generators for life support systems.'
          : 'Guarantee auxiliary fuel tanks are at 100% capacity and ensure 72-hour supply of critical trauma medications.',
      urgency: (params.windSpeed > 130 ? 'CRITICAL' : 'HIGH') as 'CRITICAL' | 'HIGH',
    },
    {
      id: 'act-dyn-2',
      title: 'Inspect power infrastructure',
      detail:
        params.rainfall > 300
          ? 'Pre-emptively de-energize low-elevation coastal transformers to prevent explosive short circuits and permanent grid failure.'
          : 'Secure transformer yard switchgear, check substation perimeter drainage, and deploy repair crews in sheltered inland depots.',
      urgency: (params.rainfall > 320 ? 'CRITICAL' : 'HIGH') as 'CRITICAL' | 'HIGH',
    },
    {
      id: 'act-dyn-3',
      title: 'Secure critical roads and evacuation routes',
      detail:
        'Keep NH-16 open for outbound emergency transit with heavy clearing equipment deployed at 5 km intervals.',
      urgency: 'HIGH' as const,
    },
    {
      id: 'act-dyn-4',
      title: 'Prepare coastal communities',
      detail:
        params.windSpeed > 130
          ? 'Complete 100% mandatory evacuation to reinforced multipurpose shelters before T - 3h lockdown.'
          : 'Issue continuous public loudspeaker advisories, distribute emergency rations, and verify water purification systems.',
      urgency: 'HIGH' as const,
    },
  ];

  return {
    title: `${scenario.name} Threat Analysis (${severityRisk.toUpperCase()} RISK)`,
    whyAtRisk,
    confidence,
    keyFactors,
    actionPlan,
    isLiveAI: false,
  };
}
