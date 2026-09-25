import React, { useState, useEffect } from 'react';
import { TimelineMilestone } from '../types/cyclone';
import { Play, Pause, FastForward, RotateCcw, Clock } from 'lucide-react';

interface TimeMachineProps {
  milestones: TimelineMilestone[];
  activeMilestoneIndex: number;
  onSelectMilestone: (index: number) => void;
}

export const TimeMachine: React.FC<TimeMachineProps> = ({
  milestones,
  activeMilestoneIndex,
  onSelectMilestone,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      onSelectMilestone(
        activeMilestoneIndex >= milestones.length - 1 ? 0 : activeMilestoneIndex + 1
      );
    }, 2800);

    return () => clearInterval(interval);
  }, [isPlaying, activeMilestoneIndex, milestones.length, onSelectMilestone]);

  const activeMilestone = milestones[activeMilestoneIndex] || milestones[0];

  return (
    <div className="bg-[#090f1f]/95 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Timeline' : 'Play Timeline Evolution'}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
            )}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100 tracking-tight">
                Time Machine
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-700/50 text-cyan-300">
                {activeMilestone.timeLabel} • {activeMilestone.hoursFromLandfall}h from landfall
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              See how the storm evolves
            </p>
          </div>
        </div>

        {/* Milestone Directive summary */}
        <div className="text-xs text-slate-300 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 max-w-md truncate">
          <strong className="text-cyan-400">{activeMilestone.subtitle}:</strong>{' '}
          {activeMilestone.summary}
        </div>
      </div>

      {/* Timeline Scrubber Track */}
      <div className="relative pt-3 pb-2 px-4">
        {/* Background Rail */}
        <div className="absolute top-6 left-4 right-4 h-1 bg-slate-800 rounded-full" />

        {/* Progress fill */}
        <div
          className="absolute top-6 left-4 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-rose-500 rounded-full transition-all duration-500"
          style={{
            width: `${(activeMilestoneIndex / (milestones.length - 1)) * 100}%`,
          }}
        />

        {/* Milestone Nodes */}
        <div className="relative flex justify-between items-center">
          {milestones.map((ms, idx) => {
            const isSelected = activeMilestoneIndex === idx;
            const isPast = activeMilestoneIndex > idx;

            return (
              <button
                key={ms.id}
                onClick={() => {
                  setIsPlaying(false);
                  onSelectMilestone(idx);
                }}
                className="group flex flex-col items-center focus:outline-none"
              >
                {/* Node Dot */}
                <div
                  className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-rose-500 border-white scale-125 shadow-[0_0_12px_rgba(244,63,94,0.9)]'
                      : isPast
                      ? 'bg-cyan-500 border-cyan-200'
                      : 'bg-slate-900 border-slate-700 group-hover:border-slate-500'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                </div>

                {/* Node Labels */}
                <div className="mt-2 text-center">
                  <div
                    className={`text-xs font-mono font-bold tracking-tight ${
                      isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {ms.timeLabel}
                  </div>
                  <div
                    className={`text-[10px] tracking-tight whitespace-nowrap mt-0.5 ${
                      isSelected ? 'text-cyan-300 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {ms.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
