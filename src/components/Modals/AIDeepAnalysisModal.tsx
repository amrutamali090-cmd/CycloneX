import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CycloneScenario, SimulationParams } from '../../types/cyclone';
import { generateCycloneAnalysis, GeneratedAIAnalysis } from '../../services/geminiService';
import { X, Sparkles, Send, BrainCircuit, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

interface AIDeepAnalysisModalProps {
  scenario: CycloneScenario;
  simulationParams: SimulationParams;
  isOpen: boolean;
  onClose: () => void;
  onApplyNewAnalysis: (analysis: GeneratedAIAnalysis) => void;
}

export const AIDeepAnalysisModal: React.FC<AIDeepAnalysisModalProps> = ({
  scenario,
  simulationParams,
  isOpen,
  onClose,
  onApplyNewAnalysis,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<GeneratedAIAnalysis | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    'Should we evacuate City Hospital ICU patients to Bhubaneswar?',
    'What is the predicted flood surge inundation along Puri Marine Drive?',
    'How should we sequence power grid de-energization in coastal substations?',
    'Assess emergency heavy equipment staging along NH-16.',
  ];

  const handleRunAI = async (customPromptText?: string) => {
    const promptToUse = customPromptText || query;
    setLoading(true);
    try {
      const result = await generateCycloneAnalysis({
        scenario,
        simulationParams,
        customPrompt: promptToUse,
      });
      setAnalysisResult(result);
      onApplyNewAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      style={{ zIndex: 1050 }}
    >
      <div
        className="relative w-full max-w-3xl bg-[#090f1f] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        style={{ zIndex: 1051 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0a1226]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(37,99,235,0.7)]">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-['Chakra_Petch']">
                  CycloneX AI Threat Intelligence Console
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  Gemini Flash 3.8
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Calibrated against live parameters: {simulationParams.windSpeed} km/h winds • {simulationParams.rainfall} mm rain
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Query Input & Quick Prompts */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask AI disaster commander specific tactical inquiry..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunAI()}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => handleRunAI()}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Analyze</span>
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="text-[10px] text-slate-500 font-medium py-1">Quick Inquiries:</span>
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(p);
                  handleRunAI(p);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-cyan-950/70 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {analysisResult ? (
            <div className="space-y-4">
              {/* Threat Title & Confidence */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">{analysisResult.title}</h3>
                  <div className="text-xs text-cyan-400 mt-0.5">
                    {analysisResult.isLiveAI ? 'Live Gemini Model Output' : 'Calibrated Disaster Physics Engine'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-white">
                    Confidence: <span className="text-emerald-400">{analysisResult.confidence}%</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Validated against sensor models</div>
                </div>
              </div>

              {/* Why at risk */}
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
                <h4 className="text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Strategic Impact Assessment</span>
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {analysisResult.whyAtRisk}
                </p>
              </div>

              {/* Key Risk Drivers */}
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
                <h4 className="text-xs font-semibold text-cyan-300 mb-2">
                  Key Compound Risk Drivers
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {analysisResult.keyFactors.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Plan */}
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
                <h4 className="text-xs font-semibold text-emerald-300 mb-2">
                  Command Action Plan & Directives
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {analysisResult.actionPlan.map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white text-xs">{act.title}</span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                            act.urgency === 'CRITICAL'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {act.urgency}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">{act.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Sparkles className="w-10 h-10 mx-auto text-cyan-500/40 mb-3 animate-pulse" />
              <p className="text-sm font-medium text-slate-300">
                AI Intelligence Ready
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Enter an inquiry or select a preset template above to synthesize multi-hazard threat scenarios.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Decoupled AI engine • Gemini 3.8 Flash API integration</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
