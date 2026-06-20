import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Plus, 
  Flame, 
  ShieldCheck,
  Filter,
  CheckCircle,
  Briefcase
} from 'lucide-react';
import { TargetCompany } from '../types';

interface CompanyFinderProps {
  companies: TargetCompany[];
  onAddApplication: (companyName: string, roleTitle: string) => void;
  desiredJob: string;
}

export default function CompanyFinder({ companies = [], onAddApplication, desiredJob }: CompanyFinderProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [addedTrackerList, setAddedTrackerList] = useState<string[]>([]);

  const handleTrackAndNotify = (companyName: string) => {
    onAddApplication(companyName, desiredJob);
    setAddedTrackerList(prev => [...prev, companyName]);
    // Remove from notification list after 2.5 seconds
    setTimeout(() => {
      setAddedTrackerList(prev => prev.filter(item => item !== companyName));
    }, 2500);
  };

  const getDifficultyColor = (diff: 'easy' | 'medium' | 'hard') => {
    switch (diff) {
      case 'easy':
        return 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40';
      case 'medium':
        return 'bg-amber-950/40 text-amber-400 border border-amber-900/40';
      case 'hard':
      default:
        return 'bg-rose-950/40 text-rose-400 border border-rose-900/40';
    }
  };

  // Filter companies based on criteria
  const filteredCompanies = companies.filter(company => {
    const matchLocation = selectedLocation === 'All' || 
      (company.location && company.location.toLowerCase().includes(selectedLocation.toLowerCase()));
    
    const matchTier = selectedTier === 'All' || 
      (company.tier && company.tier === selectedTier);
      
    return matchLocation && matchTier;
  });

  const locationsList = ['All', 'Bengaluru', 'Delhi NCR', 'Hyderabad', 'Pune/Mumbai', 'Remote'];
  const tiersList = [
    { key: 'All', label: 'All Categories' },
    { key: 'Tier 1', label: 'Tier 1: Product Giants' },
    { key: 'Tier 2', label: 'Tier 2: High-Growth Startups' },
    { key: 'Tier 3', label: 'Tier 3: Core IT Services' }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Intro info */}
      <div className="space-y-2 pb-5 border-b border-slate-800">
        <h3 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-indigo-400" />
          <span>Strategic Target Firms</span>
        </h3>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Tactical company tiers engineered specifically for a student launching a <strong className="text-indigo-400">{desiredJob}</strong> internship search. Filter by location and tiers to plan your applications.
        </p>
      </div>

      {/* Interactive Filters Grid */}
      <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span>Interactive Pipelines Filter</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location Filters */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Hub Office Location</label>
            <div className="flex flex-wrap gap-1.5">
              {locationsList.map(loc => (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    selectedLocation === loc
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                  }`}
                  id={`filter-loc-${loc.replace(/\s+/g, '-')}`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Tier Filters */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Company Tier Category</label>
            <div className="flex flex-wrap gap-1.5">
              {tiersList.map(tier => (
                <button
                  key={tier.key}
                  onClick={() => setSelectedTier(tier.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    selectedTier === tier.key
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                  }`}
                  id={`filter-tier-${tier.key}`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Target Companies results */}
      {filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          {filteredCompanies.map((company, index) => {
            const isAdded = addedTrackerList.includes(company.name);
            return (
              <div 
                key={index} 
                className="flex flex-col justify-between bg-slate-900/80 border border-slate-850 hover:border-slate-800 rounded-2xl p-6 hover:shadow-xl hover:shadow-indigo-950/10 transition-all duration-200 text-left space-y-4"
              >
                {/* Header info */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3 items-center">
                      <div className="p-3 bg-slate-850 text-indigo-400 rounded-xl border border-slate-800">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-100">{company.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            company.tier === 'Tier 1' 
                              ? 'bg-purple-950/60 text-purple-300 border border-purple-900/60'
                              : company.tier === 'Tier 2'
                              ? 'bg-pink-950/60 text-pink-300 border border-pink-900/60'
                              : 'bg-cyan-950/60 text-cyan-300 border border-cyan-900/60'
                          }`}>
                            {company.tier || 'Direct'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{company.location || 'Multiple Hubs'}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400 font-medium">{company.industry}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider font-mono ${getDifficultyColor(company.hiringDifficulty)}`}>
                        {company.hiringDifficulty.toUpperCase()} LOOP
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {company.openRolesEstimate}
                      </span>
                    </div>
                  </div>

                  {/* Why match details */}
                  <div className="pt-2 border-t border-slate-850/80">
                    <p className="text-xs font-semibold text-indigo-400 mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Why your profile matches:</span>
                    </p>
                    <p className="text-xs text-slate-350 leading-relaxed">
                      {company.whyMatch}
                    </p>
                  </div>
                </div>

                {/* Preparation Blueprint */}
                <div className="bg-[#0c1221] rounded-xl p-4 space-y-2 text-left border border-slate-850">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                    <span>College Interview prep Strategy</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {company.interviewPrepStrategy}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-850/60">
                  <span className="text-[10px] text-slate-500 font-mono">Status: Direct matching candidates</span>
                  <button 
                    onClick={() => handleTrackAndNotify(company.name)}
                    disabled={isAdded}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-550 text-white shadow-md shadow-indigo-900/10'
                    }`}
                    id={`btn-add-company-${index}`}
                  >
                    {isAdded ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Added to Pipeline</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Track Application</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center max-w-md mx-auto bg-slate-900 border border-slate-850 p-8 rounded-2xl space-y-4">
          <Briefcase className="w-10 h-10 text-slate-650 mx-auto" />
          <h4 className="text-base font-bold text-white">No active matching partners</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            There are no suggested companies that perfectly match your filtered location preference is <span className="text-indigo-400">"{selectedLocation}"</span> and category tier <span className="text-indigo-400">"{selectedTier}"</span>. Try expanding your preference criteria!
          </p>
          <button 
            onClick={() => { setSelectedLocation('All'); setSelectedTier('All'); }}
            className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
