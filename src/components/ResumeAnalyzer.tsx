import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Linkedin, 
  Briefcase, 
  FileUp, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  Calendar,
  Check,
  ChevronDown
} from 'lucide-react';
import { Profile } from '../types';

interface ResumeAnalyzerProps {
  onAnalyze: (profile: Profile) => void;
  loading: boolean;
  initialResumeText?: string;
  initialResumeFileName?: string;
}

const JOB_SUGGESTIONS = [
  "Software Engineer",
  "ML Engineer",
  "AI Cloud DevOps",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Developer",
  "Data Scientist",
  "Data Analyst",
  "Cyber Security Analyst",
  "Cloud Solutions Architect",
  "Product Manager",
  "DevOps Engineer",
  "Mobile App Developer",
  "UI/UX Designer"
];

export default function ResumeAnalyzer({ onAnalyze, loading, initialResumeText = '', initialResumeFileName = '' }: ResumeAnalyzerProps) {
  const [resumeText, setResumeText] = useState(initialResumeText);
  const [resumeFileName, setResumeFileName] = useState(initialResumeFileName);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [desiredJob, setDesiredJob] = useState('Software Engineer');
  const [timeline, setTimeline] = useState<'3 months' | '6 months' | '9 months'>('6 months');
  
  // Autocomplete states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('Software Engineer');
  const [filteredJobs, setFilteredJobs] = useState<string[]>(JOB_SUGGESTIONS);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync initial text if configured from external source (like Google Drive)
  useEffect(() => {
    if (initialResumeText) {
      setResumeText(initialResumeText);
    }
  }, [initialResumeText]);

  useEffect(() => {
    if (initialResumeFileName) {
      setResumeFileName(initialResumeFileName);
    }
  }, [initialResumeFileName]);

  // Click outside listener for job autocomplete dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (val: string) => {
    setSearchQuery(val);
    setDesiredJob(val);
    
    // Suggest matching Tech terms
    if (val.trim() === '') {
      setFilteredJobs(JOB_SUGGESTIONS);
    } else {
      const filtered = JOB_SUGGESTIONS.filter(job => 
        job.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
    setDropdownOpen(true);
  };

  const handleSelectJob = (job: string) => {
    setSearchQuery(job);
    setDesiredJob(job);
    setDropdownOpen(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setResumeFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setResumeText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!resumeText.trim()) {
      setError('Please copy-paste/upload your resume or experience profile content below.');
      return;
    }

    onAnalyze({
      resumeText,
      resumeFileName,
      linkedinUrl,
      desiredJob: desiredJob.trim() || 'Software Engineer',
      timeline
    });
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
          <Briefcase className="w-5 h-5 text-indigo-400" />
          <span>Profile & Desired Placement Path</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">Specify your target role, select timeline pacing, and upload your resume profile experience.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Desired Job Autocomplete Input */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2" htmlFor="job-input">
            Target Job Title / Specialization
          </label>
          <div className="relative">
            <input 
              type="text"
              id="job-input"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                setDropdownOpen(true);
                // Reset suggestions to standard if current is valid
                if (!searchQuery) setFilteredJobs(JOB_SUGGESTIONS);
              }}
              placeholder="Type e.g., SOF, ML, DevOps..."
              required
              autoComplete="off"
              className="w-full pl-11 pr-10 py-3 bg-slate-950/60 text-white rounded-xl placeholder-slate-550 border border-slate-800/80 focus:outline-none focus:border-indigo-500 transition text-sm"
            />
            <Briefcase className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <button 
              type="button" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-350"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {dropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-xl max-h-56 overflow-y-auto">
              {filteredJobs.length === 0 ? (
                <div 
                  onClick={() => {
                    setDesiredJob(searchQuery);
                    setDropdownOpen(false);
                  }}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:bg-slate-900 cursor-pointer italic"
                >
                  No match. Press enter or click here to build custom path for "{searchQuery}"
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <div 
                    key={job}
                    onClick={() => handleSelectJob(job)}
                    className="px-4 py-2.5 text-xs text-slate-300 hover:bg-indigo-950/50 hover:text-indigo-200 cursor-pointer flex items-center justify-between transition"
                  >
                    <span>{job}</span>
                    {desiredJob === job && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Timeline Selection Options */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Dynamic Roadmap Timeline Goal
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['3 months', '6 months', '9 months'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeline(t)}
                className={`py-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 ${
                  timeline === t 
                    ? 'bg-indigo-600/10 border-indigo-500/80 text-indigo-300' 
                    : 'bg-slate-955/30 bg-slate-950/20 border-slate-800/50 text-slate-400 hover:bg-slate-950/40'
                }`}
              >
                <Calendar className={`w-4 h-4 ${timeline === t ? 'text-indigo-400' : 'text-slate-505 text-slate-500'}`} />
                <span>{t === '3 months' ? '3 Months' : t === '6 months' ? '6 Months' : '9 Months'}</span>
                <span className="text-[9px] font-normal opacity-70">
                  {t === '3 months' ? 'Rapid Prep' : t === '6 months' ? 'Balanced Path' : 'Strategic Placement'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* LinkedIn Profile */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2" htmlFor="linkedin-input">
            LinkedIn Profile URL (Optional)
          </label>
          <div className="relative">
            <input 
              type="url"
              id="linkedin-input"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="e.g. https://www.linkedin.com/in/username"
              className="w-full pl-11 pr-4 py-3 bg-slate-950/60 text-white rounded-xl placeholder-slate-550 border border-slate-800/80 focus:outline-none focus:border-indigo-500 transition text-sm"
            />
            <Linkedin className="absolute left-4 top-3.5 w-4 h-4 text-indigo-400/80" />
          </div>
        </div>

        {/* Resume Area */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Resume/Experience Text Outline
            </span>
            {resumeFileName && (
              <span className="text-xs text-indigo-400 font-mono italic truncate max-w-[200px]">
                📁 {resumeFileName}
              </span>
            )}
          </div>

          {/* Drag & drop upload area */}
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition cursor-pointer ${
              dragActive ? 'border-indigo-455 border-indigo-500 bg-indigo-950/10' : 'border-slate-800/80 hover:border-slate-750/80 bg-slate-950/20'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleChange}
              accept=".txt,.md,.pdf,.doc,.docx"
              className="hidden"
            />
            
            <FileUp className="w-7 h-7 text-indigo-400 mb-1.5" />
            <p className="text-xs font-semibold text-slate-200">
              Drag-and-drop Resume (.txt, .md) or click to upload
            </p>
            <p className="text-[10px] text-slate-450 mt-1">
              Recommended: Paste raw text experience below directly
            </p>
          </div>

          {/* Text Area */}
          <div className="mt-3">
            <textarea
              rows={5}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume contents or academic achievements here directly..."
              className="w-full p-3.5 bg-slate-950/60 text-white rounded-xl placeholder-slate-550 border border-slate-800/80 focus:outline-none focus:border-indigo-500 transition text-xs font-sans leading-relaxed"
              id="resume-text-input"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-550 disabled:bg-slate-850 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-900/30"
          id="btn-analyze-profile"
        >
          {loading ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin text-white" />
              <span>Forging Customized {timeline} Roadmap...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
              <span>Forge {timeline === '3 months' ? '3-Month' : timeline === '6 months' ? '6-Month' : '9-Month'} Career Roadmap</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
