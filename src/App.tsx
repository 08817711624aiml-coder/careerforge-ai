import React, { useState, useEffect } from 'react';
import { 
  initAuthListener, 
  googleSignIn, 
  googleSignOut,
  db
} from './lib/firebase';
import { User } from 'firebase/auth';
import { collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';

import { 
  Sparkles, 
  Briefcase, 
  Map, 
  Building2, 
  Activity, 
  Compass, 
  User as UserIcon, 
  LogOut,
  ChevronRight,
  Award,
  AlertCircle
} from 'lucide-react';
import { Profile, CareerRoadmap, MarketInsight, JobApplication } from './types';

// Components
import ResumeAnalyzer from './components/ResumeAnalyzer';
import RoadmapView from './components/RoadmapView';
import CompanyFinder from './components/CompanyFinder';
import ApplicationTracker from './components/ApplicationTracker';
import MarketInsights from './components/MarketInsights';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'roadmap' | 'companies' | 'pipeline' | 'insights'>('profile');
  
  // App primary States
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(() => {
    try {
      const stored = localStorage.getItem('career_forge_roadmap_data');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [insights, setInsights] = useState<MarketInsight | null>(() => {
    try {
      const stored = localStorage.getItem('career_forge_insights_data');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Setup Firebase Auth observer
  useEffect(() => {
    const unsubscribe = initAuthListener(
      async (currentUser, token) => {
        setUser(currentUser);
        if (token) {
          setAccessToken(token);
        }
        if (currentUser) {
          // Attempt loading their latest stable roadmap from Firestore
          try {
            const docRef = doc(db, 'roadmaps', currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data?.roadmap) {
                setRoadmap(data.roadmap);
                localStorage.setItem('career_forge_roadmap_data', JSON.stringify(data.roadmap));
              }
            }
          } catch (e) {
            console.error("Firestore read roadmap warning:", e);
          }
        }
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setErrorMsg('');
      const res = await googleSignIn(false);
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Login failed: ' + (e.message || 'Check browser permissions.'));
    }
  };

  const handleSignOut = async () => {
    try {
      await googleSignOut();
      setUser(null);
      setAccessToken(null);
    } catch (e: any) {
      console.error(e);
    }
  };

  // REST API trigger for analysis
  const handleProfileAnalysis = async (profile: Profile) => {
    setLoadingRoadmap(true);
    setErrorMsg('');
    try {
      // 1. Analyze and get roadmap
      const roadmapRes = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (!roadmapRes.ok) {
        throw new Error('Analysis failed. Please try again.');
      }
      const roadmapData = await roadmapRes.json();
      setRoadmap(roadmapData);
      localStorage.setItem('career_forge_roadmap_data', JSON.stringify(roadmapData));

      // Save to Firestore if database is accessible and user is signed in
      if (user) {
        try {
          await setDoc(doc(db, 'roadmaps', user.uid), {
            userId: user.uid,
            roadmap: roadmapData,
            timestamp: new Date().toISOString()
          });
        } catch (dbErr) {
          console.error("Failed to store roadmap in Firestore:", dbErr);
        }
      }

      // 2. Fetch specific Tech Market Insights
      const insightsRes = await fetch('/api/gemini/market-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desiredJob: profile.desiredJob })
      });
      if (insightsRes.ok) {
        const insightsData = await insightsRes.json();
        setInsights(insightsData);
        localStorage.setItem('career_forge_insights_data', JSON.stringify(insightsData));
      }

      // Transition to action roadmap
      setActiveTab('roadmap');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during evaluation.');
    } finally {
      setLoadingRoadmap(false);
    }
  };

  // Add target company to tracking pipeline
  const handleAddCompanyToTracker = async (companyName: string, roleTitle: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const newApp: Omit<JobApplication, 'id'> = {
        userId: user?.uid || 'local',
        companyName,
        roleTitle,
        appliedDate: today,
        status: 'applied',
        notes: `Added automatically from suggestions on Career Forge AI roadmap matching.`,
        skillsRequired: []
      };

      if (user?.uid) {
        // Save to firestore db
        await addDoc(collection(db, 'applications'), newApp);
      } else {
        // Save to local storage
        const currentLocal = localStorage.getItem('career_forge_applications');
        const list = currentLocal ? JSON.parse(currentLocal) : [];
        list.push({ id: `local-${Date.now()}`, ...newApp });
        localStorage.setItem('career_forge_applications', JSON.stringify(list));
      }

      // open pipeline view
      setActiveTab('pipeline');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans">
      
      {/* HEADER SECTION */}
      <nav className="border-b border-slate-850 bg-[#070b13]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-650 text-white rounded-xl shadow-lg shadow-indigo-900/30">
              <Sparkles className="w-5.5 h-5.5" />
            </div>
            <div className="text-left">
              <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5 leading-tight">
                Career Forge AI
              </h1>
              <p className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase font-semibold">B.Tech Portfolio Project • Placement Coach</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-1.5 px-3">
                <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase">
                  {user.displayName ? user.displayName.slice(0, 2) : <UserIcon className="w-4 h-4" />}
                </div>
                
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-200">{user.displayName || 'Developer'}</p>
                  <p className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                    <span>●</span> Google Connected
                  </p>
                </div>

                <button 
                  onClick={handleSignOut}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleSignIn}
                className="gsi-material-button text-xs"
                id="google-signin-btn"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents font-semibold">Sign in with Google</span>
                </div>
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* ERROR MSG BANNER */}
      {errorMsg && (
        <div className="bg-rose-950/20 border-b border-rose-900/60 p-4">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-3 text-rose-300 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* CORE FRAMEWORK TABS */}
      <div className="border-b border-slate-850 bg-[#070b13]/40">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex gap-1 overflow-x-auto py-2 Scrollbar-none">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 border whitespace-nowrap ${
                activeTab === 'profile' 
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30' 
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-4 h-4 shrink-0" />
              <span>1. Profile & Desired Job</span>
            </button>

            <button
              onClick={() => {
                if (roadmap) setActiveTab('roadmap');
              }}
              disabled={!roadmap}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 border whitespace-nowrap ${
                !roadmap ? 'opacity-40 cursor-not-allowed' : ''
              } ${
                activeTab === 'roadmap' 
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30' 
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <Map className="w-4 h-4 shrink-0" />
              <span>2. Career Roadmap</span>
            </button>

            <button
              onClick={() => {
                if (roadmap) setActiveTab('companies');
              }}
              disabled={!roadmap}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 border whitespace-nowrap ${
                !roadmap ? 'opacity-40 cursor-not-allowed' : ''
              } ${
                activeTab === 'companies' 
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30' 
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>3. Target Firms</span>
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 border whitespace-nowrap ${
                activeTab === 'pipeline' 
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30' 
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span>4. Placement Pipeline</span>
            </button>

            <button
              onClick={() => {
                if (roadmap) setActiveTab('insights');
              }}
              disabled={!roadmap}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 border whitespace-nowrap ${
                !roadmap ? 'opacity-40 cursor-not-allowed' : ''
              } ${
                activeTab === 'insights' 
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30' 
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span>5. Tech Trends</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 lg:px-8 py-8">
        
        {activeTab === 'profile' && (
          <div className="space-y-8">
            {/* Header / Intro */}
            <div className="text-left space-y-2">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Placement Coaching Evaluation</h2>
              <p className="text-sm text-slate-400 max-w-2xl">
                Upload or paste your resume, specify your target role, select your roadmap timeline, and immediately mapping out your career pipeline.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Entry */}
              <div className="lg:col-span-7">
                <ResumeAnalyzer 
                  onAnalyze={handleProfileAnalysis}
                  loading={loadingRoadmap}
                  initialResumeText={resumeText}
                  initialResumeFileName={resumeFileName}
                />
              </div>

              {/* Connected components / Guidelines */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Helpful Hints */}
                <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 text-left space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Evaluation Guidelines</span>
                  </h4>
                  <ul className="space-y-3">
                    <li className="text-xs text-slate-300 leading-normal flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>Input your target job title (e.g. Software Engineer, ML Engineer, or custom roles) using our smart tech-term autocomplete.</span>
                    </li>
                    <li className="text-xs text-slate-300 leading-normal flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>Choose between rapid, balanced, or strategic readiness timelines (3, 6, or 9 months pacing).</span>
                    </li>
                    <li className="text-xs text-slate-300 leading-normal flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>The AI coach builds structured milestones, defines technical gaps, lists target companies categorized into Tier-1, Tier-2, and Tier-3, and details specific college interview strategies.</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          </div>
        )}

        {activeTab === 'roadmap' && roadmap && (
          <RoadmapView roadmap={roadmap} />
        )}

        {activeTab === 'companies' && roadmap && (
          <CompanyFinder 
            companies={roadmap.targetCompanies}
            onAddApplication={handleAddCompanyToTracker}
            desiredJob={roadmap.desiredJob}
          />
        )}

        {activeTab === 'pipeline' && (
          <ApplicationTracker userId={user?.uid || null} />
        )}

        {activeTab === 'insights' && roadmap && insights && (
          <MarketInsights insights={insights} desiredJob={roadmap.desiredJob} />
        )}

        {/* Roadmap Prompt Guide Overlay if not set */}
        {activeTab !== 'profile' && activeTab !== 'pipeline' && !roadmap && (
          <div className="py-20 text-center max-w-lg mx-auto bg-slate-900 border border-slate-850 p-8 rounded-2xl space-y-4">
            <Briefcase className="w-12 h-12 text-slate-650 mx-auto" />
            <h3 className="text-lg font-bold text-white">No evaluation profile found</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Please enter your current professional experience or upload/paste a resume to build your Career Coach analysis and unlock the timelines, matches, and industry trends!
            </p>
            <button 
              onClick={() => setActiveTab('profile')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-sm font-semibold transition"
            >
              Analyze Profile Now
            </button>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-850 bg-slate-950 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center sm:flex sm:justify-between sm:items-center text-xs text-slate-500 font-mono">
          <span>Career Forge AI - Executive Recruiting and Placement Placement Coach</span>
          <span className="mt-2 sm:mt-0 block text-[10px]">Connected via secure Google Cloud Run Sandboxed Architecture</span>
        </div>
      </footer>

    </div>
  );
}
