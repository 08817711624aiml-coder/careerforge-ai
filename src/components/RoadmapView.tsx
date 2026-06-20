import React, { useState } from 'react';
import { 
  CheckCircle, 
  Circle, 
  MapPin, 
  Clock, 
  Compass, 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { CareerRoadmap, RoadmapMilestone } from '../types';

interface RoadmapViewProps {
  roadmap: CareerRoadmap;
}

export default function RoadmapView({ roadmap }: RoadmapViewProps) {
  // Store ticked action items in local state so the guide is truly interactive
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(`career_forge_completed_${roadmap.desiredJob}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const toggleActionItem = (milestoneId: string, itemIdx: number) => {
    const key = `${milestoneId}-${itemIdx}`;
    setCompletedItems(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(`career_forge_completed_${roadmap.desiredJob}`, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const getMilestoneProgress = (milestone: RoadmapMilestone) => {
    if (!milestone.actionItems || milestone.actionItems.length === 0) return 0;
    const completedCount = milestone.actionItems.filter((_, idx) => completedItems[`${milestone.id}-${idx}`]).length;
    return Math.round((completedCount / milestone.actionItems.length) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Executive coaching summary */}
      <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-900/40 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0 mt-1">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase">Executive Summary Feedback</span>
            <h3 className="text-xl font-bold text-white mt-0.5">Perfecting your path to: {roadmap.desiredJob}</h3>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed font-sans">{roadmap.summary}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* TIMELINE COLUMN */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h4 className="text-sm font-semibold text-white tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Step-by-Step Training Program</span>
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              Actionable Guide
            </span>
          </div>

          <div className="relative pl-6 border-l-2 border-slate-800 space-y-8 py-2">
            {roadmap.milestones.map((milestone, mIdx) => {
              const progress = getMilestoneProgress(milestone);
              return (
                <div key={milestone.id || mIdx} className="relative group">
                  {/* Badge point */}
                  <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 ${
                    progress === 100 ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-900 border-slate-700 group-hover:border-indigo-400'
                  } transition flex items-center justify-center`}>
                    {progress === 100 && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>

                  <div className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl p-5 transition text-left">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-800 text-[10px] font-mono font-bold text-slate-400 rounded">
                          {milestone.timeframe}
                        </span>
                        <h5 className="text-md font-bold text-slate-100 group-hover:text-white transition">
                          {milestone.title}
                        </h5>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-medium">
                        {progress}% Completed
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {milestone.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-slate-850 rounded-full mt-3 overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Checkbox tasks */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Weekly Core Actions</p>
                      {milestone.actionItems.map((item, itemIdx) => {
                        const isDone = !!completedItems[`${milestone.id}-${itemIdx}`];
                        return (
                          <div 
                            key={itemIdx}
                            onClick={() => toggleActionItem(milestone.id, itemIdx)}
                            className="flex items-start gap-2.5 cursor-pointer select-none group/item"
                          >
                            {isDone ? (
                              <CheckCircle className="w-4.5 h-4.5 text-emerald-500 mt-0.5 shrink-0" />
                            ) : (
                              <Circle className="w-4.5 h-4.5 text-slate-600 group-hover/item:text-indigo-400 mt-0.5 shrink-0" />
                            )}
                            <span className={`text-xs ${isDone ? 'text-slate-500 line-through' : 'text-slate-300 group-hover/item:text-slate-200'}`}>
                              {item}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SKILLS COLUMN */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h4 className="text-sm font-semibold text-white tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Critical Skills Acquisition</span>
            </h4>
            <span className="text-xs text-slate-400 font-mono">Top Profiles</span>
          </div>

          <div className="space-y-4">
            {roadmap.skills.map((skill, sIdx) => {
              const isHigh = skill.importance === 'high';
              return (
                <div 
                  key={sIdx}
                  className="bg-slate-900 border border-slate-850 hover:border-slate-800 p-4 rounded-xl space-y-3 transition"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h5 className="text-sm font-bold text-white">{skill.name}</h5>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] text-slate-400">Current: <strong className="text-slate-300">{skill.currentLevel}</strong></span>
                        <span className="text-slate-600 text-[10px]">|</span>
                        <span className="text-[10px] text-indigo-400">Target: <strong className="font-semibold text-indigo-300">{skill.targetLevel}</strong></span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest ${
                      isHigh ? 'bg-rose-950/50 text-rose-400 border border-rose-900/50' : 'bg-amber-950/30 text-amber-400 border border-amber-900/30'
                    }`}>
                      {skill.importance.toUpperCase()} PRIORITY
                    </span>
                  </div>

                  {/* Resource materials links */}
                  <div className="bg-slate-850 rounded-lg p-2.5 text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 text-emerald-400" />
                      <span>Recommended Resources</span>
                    </p>
                    <ul className="space-y-1">
                      {skill.resources.map((resItem, rIdx) => (
                        <li key={rIdx} className="text-xs text-slate-300 flex items-center gap-1.5 pl-0.5">
                          <ArrowRight className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                          <span className="truncate" title={resItem}>{resItem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Core Tip Card */}
          <div className="bg-emerald-950/10 border border-emerald-900/40 rounded-xl p-4 flex gap-3 text-left">
            <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h6 className="text-xs font-bold text-slate-200">Continuous Profile Audit</h6>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Aim to tick off actions weekly. Candidates who demonstrate self-learning of critical high-priority skills observe a 42% faster interview progression rate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
