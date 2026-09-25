import React from 'react';
import { CycloneScenario } from '../types/cyclone';
import { FileText, CheckCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface AIActionPlanPanelProps {
  scenario: CycloneScenario;
  onOpenReportModal: () => void;
  customActionPlan?: Array<{
    id: string;
    title: string;
    detail: string;
    urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  }>;
}

export const AIActionPlanPanel: React.FC<AIActionPlanPanelProps> = ({
  scenario,
  onOpenReportModal,
  customActionPlan,
}) => {
  const planItems = customActionPlan || scenario.aiAnalysis.actionPlan;

  return (
    <div className="bg-[#090f1f]/95 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono shadow-[0_0_10px_rgba(37,99,235,0.6)]">
            AI
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 tracking-tight">
              AI Action Plan
            </h2>
          </div>
        </div>

        <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
          Demo Recommendations
        </span>
      </div>

      {/* Action Items List */}
      <div className="flex flex-col gap-2.5">
        {planItems.map((item, index) => {
          const numStr = String(index + 1).padStart(2, '0');
          return (
            <div
              key={item.id}
              className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <span className="font-mono text-xs font-bold text-amber-400 pt-0.5">
                {numStr}
              </span>
              <div className="flex-1">
                <div className="text-xs font-semibold text-slate-200">
                  {item.title}
                </div>
                {item.detail && (
                  <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    {item.detail}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Export / Dispatch Button */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80">
        <button
          onClick={onOpenReportModal}
          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-cyan-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Generate Incident Dispatch Report</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
