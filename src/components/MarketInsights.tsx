import React from 'react';
import { 
  Briefcase, 
  Compass, 
  MapPin, 
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';
import { MarketInsight } from '../types';

interface MarketInsightsProps {
  insights: MarketInsight;
  desiredJob: string;
}

export default function MarketInsights({ insights, desiredJob }: MarketInsightsProps) {
  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-slate-800 text-left">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          <span>Real-time Tech Market Analysis</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Dynamic recruitment insights, high-value career paths, and skill filters based on current hiring velocity for {desiredJob || "your role"}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Dynamic Outlook */}
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4 text-left flex flex-col justify-between">
          <div className="space-y-3">
            <span className="px-2 py-0.5 bg-emerald-950/40 text-[9px] font-mono font-bold text-emerald-400 rounded-lg border border-emerald-900/40 tracking-wider">
              MARKET OUTLOOK
            </span>
            <h4 className="text-md font-bold text-slate-200">Opportunities and Budget trends</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{insights.marketOutlook}</p>
          </div>
          <div className="pt-3 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
            Hiring Speed: {insights.hiringSpeed}
          </div>
        </div>

        {/* Highly Desired Skills */}
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4 text-left">
          <span className="px-2 py-0.5 bg-indigo-950/40 text-[9px] font-mono font-bold text-indigo-400 rounded-lg border border-indigo-900/40 tracking-wider">
            FILTER RECRUITMENT SKILLS
          </span>
          <h4 className="text-md font-bold text-slate-200">High-filter Skills right now</h4>
          <ul className="space-y-2.5">
            {insights.trendingSkills.map((skill, index) => (
              <li key={index} className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                <span className="font-mono font-bold text-indigo-300 bg-indigo-950/10 px-1.5 py-0.5 rounded">{skill}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actionable stand out advice */}
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4 text-left flex flex-col justify-between">
          <div className="space-y-3">
            <span className="px-2 py-0.5 bg-amber-950/40 text-[9px] font-mono font-bold text-amber-400 rounded-lg border border-amber-900/40 tracking-wider">
              RECRUITER INSIDER SCRIPTS
            </span>
            <h4 className="text-md font-bold text-slate-200">Stand-out Interview Tact</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{insights.prepAdvice}</p>
          </div>
          <p className="text-[10px] text-indigo-400 italic">⭐ rec. 42% higher screening score</p>
        </div>

      </div>

      {/* Sibling Roles */}
      <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 text-left">
        <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
          <Compass className="w-4 h-4 text-indigo-400" />
          <span>Advanced or Sibling career transitions</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {insights.trendingRoles.map((role, rIdx) => (
            <div key={rIdx} className="bg-slate-850 hover:bg-slate-800 p-3 rounded-xl border border-slate-800 transition">
              <p className="text-xs font-bold text-white leading-tight">{role}</p>
              <span className="text-[9px] font-semibold text-indigo-400 block mt-1 tracking-wider uppercase">HIRE GAP FILTERS</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
