import React from 'react';
import { CycloneScenario, SimulationParams } from '../types/cyclone';
import { Sparkles, ArrowRight, BrainCircuit } from 'lucide-react';

interface AIRiskAnalysisPanelProps {
  scenario: CycloneScenario;
  simulationParams: SimulationParams;
  onOpenAIDeepAnalysis: () => void;
  customAnalysisText?: string;
  confidenceScore?: number;
  isLiveAI?: boolean;
}

export const AIRiskAnalysisPanel: React.FC<AIRiskAnalysisPanelProps> = ({
  scenario,
  simulationParams,
  onOpenAIDeepAnalysis,
  customAnalysisText,
  confidenceScore = 78,
  isLiveAI = false,
}) => {
  // Use scenario or simulated text
  const displayText =
    customAnalysisText ||
    scenario.aiAnalysis.whyAtRisk;

  return (
    <div className="bg-[#090f1f]/95 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono shadow-[0_0_10px_rgba(37,99,235,0.6)]">
            AI
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-1.5">
              <span>AI Risk Analysis</span>
            </h2>
          </div>
        </div>

        <span className="text-[10px] text-cyan-400 font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-700/40">
          {isLiveAI ? 'Live Gemini 3.8' : 'Demo Analysis'}
        </span>
      </div>

      {/* Main Analysis Block */}
      <div className="mt-2.5">
        <h3 className="text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
          <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
          <span>Why is this area at high risk?</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {displayText}
        </p>
      </div>

      {/* Confidence Bar */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex-1 mr-4">
          <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
            <span className="text-slate-400">Confidence:</span>
            <span className="text-cyan-300 font-bold">{confidenceScore}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              style={{ width: `${confidenceScore}%` }}
            />
          </div>
        </div>

        <button
          onClick={onOpenAIDeepAnalysis}
          title="Open Full AI Debrief & Query Console"
          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-cyan-400 hover:text-white transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
