import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Server-side Gemini Client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Disaster intelligence generation endpoint
app.post('/api/gemini/analyze', async (req, res) => {
  try {
    const { scenarioName, windSpeed, rainfall, trackDeviation, landfallTarget, customPrompt } = req.body;

    if (!ai) {
      // If API key is not configured, send a simulated response
      return res.status(200).json({
        title: `${scenarioName} Dynamic Assessment`,
        whyAtRisk: `Projected landfall in the vicinity of ${landfallTarget} with wind speeds of ${windSpeed} km/h and ${rainfall} mm of cumulative rainfall. Deviation of ${trackDeviation} km increases exposure along coastal assets.`,
        confidence: 82,
        keyFactors: [
          `Sustained wind forces of ${windSpeed} km/h creating critical roof shearing hazard.`,
          `Excess precipitation (${rainfall} mm) causing major estuarine drainage congestion.`,
          `Infrastructure vulnerability concentrated in low-lying healthcare and power junctions.`,
        ],
        actionPlan: [
          {
            id: 'act-1',
            title: 'Prioritize hospital preparedness',
            detail: 'Activate auxiliary fuel systems and transfer vulnerable patients to higher ground.',
            urgency: 'CRITICAL',
          },
          {
            id: 'act-2',
            title: 'Inspect power infrastructure',
            detail: 'De-energize coastal switchyards in flood zones to prevent transformer explosions.',
            urgency: 'HIGH',
          },
          {
            id: 'act-3',
            title: 'Secure critical roads and evacuation routes',
            detail: 'Pre-position road-clearing machinery along primary evacuation highways.',
            urgency: 'HIGH',
          },
          {
            id: 'act-4',
            title: 'Prepare coastal communities',
            detail: 'Mandatory evacuation of unreinforced housing within 5 km of the coast.',
            urgency: 'HIGH',
          },
        ],
        isLiveAI: false,
      });
    }

    const prompt = `You are the lead meteorologist and disaster intelligence commander for CycloneX, an emergency command system.
Analyze the following cyclone scenario parameters:
- Scenario: ${scenarioName}
- Landfall Zone: ${landfallTarget}
- Max Sustained Winds: ${windSpeed} km/h
- Expected Rainfall: ${rainfall} mm
- Track Deviation: ${trackDeviation} km
${customPrompt ? `- Operational Question: ${customPrompt}` : ''}

Respond with a JSON object strictly following this structure:
{
  "title": "short executive title",
  "whyAtRisk": "concise 2-3 sentence explanation of the high risk dynamics, storm surge, and affected assets",
  "confidence": 85,
  "keyFactors": ["factor 1", "factor 2", "factor 3"],
  "actionPlan": [
    {"id": "act-1", "title": "Prioritize hospital preparedness", "detail": "specific hospital advice", "urgency": "CRITICAL"},
    {"id": "act-2", "title": "Inspect power infrastructure", "detail": "specific power grid advice", "urgency": "HIGH"},
    {"id": "act-3", "title": "Secure critical roads and evacuation routes", "detail": "specific evacuation route advice", "urgency": "HIGH"},
    {"id": "act-4", "title": "Prepare coastal communities", "detail": "specific coastal community advice", "urgency": "HIGH"}
  ]
}
Return only valid JSON, without markdown formatting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({
      ...parsed,
      isLiveAI: true,
    });
  } catch (err: any) {
    console.error('Gemini API execution error:', err);
    return res.status(500).json({ error: 'AI analysis could not be completed' });
  }
});

// Setup Vite in Dev or serve static in Prod
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`CycloneX mission control running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
