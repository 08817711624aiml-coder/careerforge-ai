import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Plus, 
  Trash2, 
  Calendar, 
  ChevronDown, 
  Edit, 
  Loader2, 
  TrendingUp, 
  Activity, 
  Award, 
  AlertCircle,
  Bell,
  Check,
  CalendarClock,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { JobApplication, FollowUpReminder } from '../types';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore';

interface ApplicationTrackerProps {
  userId: string | null;
}

export default function ApplicationTracker({ userId }: ApplicationTrackerProps) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form input states
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [appliedDate, setAppliedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<JobApplication['status']>('applied');
  const [notes, setNotes] = useState('');
  const [skills, setSkills] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Reminders states per job application card
  const [reminderTitles, setReminderTitles] = useState<Record<string, string>>({});
  const [reminderDates, setReminderDates] = useState<Record<string, string>>({});

  // Load applications
  const loadApplications = async () => {
    setLoading(true);
    try {
      if (userId) {
        // Query from Firestore
        const q = query(collection(db, 'applications'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const docs: JobApplication[] = [];
        querySnapshot.forEach((docSnap) => {
          docs.push({ id: docSnap.id, ...docSnap.data() } as JobApplication);
        });
        setApplications(docs);
      } else {
        // Query from LocalStorage
        const local = localStorage.getItem('career_forge_applications');
        if (local) {
          setApplications(JSON.parse(local));
        } else {
          // pre-seed examples if empty with realistic interactive reminders
          const seed: JobApplication[] = [
            {
              id: 'local-seed-1',
              userId: 'local',
              companyName: 'TechCorp Solutions',
              roleTitle: 'Developer Core Engineer',
              appliedDate: '2026-06-15',
              status: 'interviewing',
              notes: 'Passed the initial resume screen. Preparing for a 45min systemic live-coding session next Thursday.',
              skillsRequired: ['TypeScript', 'Node.js', 'System Architecture'],
              reminders: [
                {
                  id: 'seed-rem-1',
                  title: 'Practice coding challenges (Data Structures, TypeScript and algorithms)',
                  dueDate: '2026-06-23',
                  completed: false
                },
                {
                  id: 'seed-rem-2',
                  title: 'Send thank you email to recruiter Sarah',
                  dueDate: '2026-06-25',
                  completed: false
                }
              ]
            },
            {
              id: 'local-seed-2',
              userId: 'local',
              companyName: 'InnoFlow Systems',
              roleTitle: 'Frontend Optimization Developer',
              appliedDate: '2026-06-19',
              status: 'applied',
              notes: 'Quick apply through LinkedIn, matches the resume roadmap outline nicely.',
              skillsRequired: ['React 19', 'Performance optimization'],
              reminders: [
                {
                  id: 'seed-rem-3',
                  title: 'Follow up on application status',
                  dueDate: '2026-06-20',
                  completed: true
                }
              ]
            }
          ];
          setApplications(seed);
          localStorage.setItem('career_forge_applications', JSON.stringify(seed));
        }
      }
    } catch (e) {
      console.error('Error loading applications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [userId]);

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !roleTitle.trim()) return;

    setSubmitting(true);
    const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    const newApp: Omit<JobApplication, 'id'> = {
      userId: userId || 'local',
      companyName,
      roleTitle,
      appliedDate,
      status,
      notes,
      skillsRequired: skillsArray,
      reminders: []
    };

    try {
      if (userId) {
        // Write to Firestore db
        const docRef = await addDoc(collection(db, 'applications'), newApp);
        setApplications(prev => [...prev, { id: docRef.id, ...newApp }]);
      } else {
        // Write to LocalStorage
        const updated = [...applications, { id: `local-${Date.now()}`, ...newApp }];
        setApplications(updated);
        localStorage.setItem('career_forge_applications', JSON.stringify(updated));
      }

      // Reset Form fields
      setCompanyName('');
      setRoleTitle('');
      setStatus('applied');
      setNotes('');
      setSkills('');
      setShowAddForm(false);
    } catch (e) {
      console.error('Failed to add application:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to remove this job application from your tracker?')) return;

    try {
      if (userId && !id.startsWith('local-')) {
        // Delete from Firestore
        await deleteDoc(doc(db, 'applications', id));
      }
      
      const updated = applications.filter(app => app.id !== id);
      setApplications(updated);
      if (!userId) {
        localStorage.setItem('career_forge_applications', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to delete:', e);
    }
  };

  const handleStatusUpdate = async (id: string | undefined, newStatus: JobApplication['status']) => {
    if (!id) return;
    try {
      if (userId && !id.startsWith('local-')) {
        // Update in Firestore
        await updateDoc(doc(db, 'applications', id), { status: newStatus });
      }
      
      const updated = applications.map(app => app.id === id ? { ...app, status: newStatus } : app);
      setApplications(updated);
      if (!userId) {
        localStorage.setItem('career_forge_applications', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  // Follow-up reminders interactive handlers
  const handleToggleReminder = async (appId: string | undefined, reminderId: string) => {
    if (!appId) return;
    const targetApp = applications.find(a => a.id === appId);
    if (!targetApp) return;

    const currentReminders = targetApp.reminders || [];
    const updatedReminders = currentReminders.map(r => 
      r.id === reminderId ? { ...r, completed: !r.completed } : r
    );

    try {
      if (userId && !appId.startsWith('local-')) {
        await updateDoc(doc(db, 'applications', appId), { reminders: updatedReminders });
      }
      const updatedList = applications.map(app => 
        app.id === appId ? { ...app, reminders: updatedReminders } : app
      );
      setApplications(updatedList);
      if (!userId) {
        localStorage.setItem('career_forge_applications', JSON.stringify(updatedList));
      }
    } catch (e) {
      console.error('Failed to toggle reminder state:', e);
    }
  };

  const handleAddReminder = async (e: React.FormEvent, appId: string | undefined) => {
    e.preventDefault();
    if (!appId) return;
    
    const title = reminderTitles[appId] || '';
    const dateVal = reminderDates[appId] || '';
    
    if (!title.trim() || !dateVal) return;

    const targetApp = applications.find(a => a.id === appId);
    if (!targetApp) return;

    const newReminder: FollowUpReminder = {
      id: `rem-${Date.now()}`,
      title: title.trim(),
      dueDate: dateVal,
      completed: false
    };

    const updatedReminders = [...(targetApp.reminders || []), newReminder];

    try {
      if (userId && !appId.startsWith('local-')) {
        await updateDoc(doc(db, 'applications', appId), { reminders: updatedReminders });
      }
      const updatedList = applications.map(app => 
        app.id === appId ? { ...app, reminders: updatedReminders } : app
      );
      setApplications(updatedList);
      if (!userId) {
        localStorage.setItem('career_forge_applications', JSON.stringify(updatedList));
      }

      // Reset individual fields
      setReminderTitles(prev => ({ ...prev, [appId]: '' }));
      setReminderDates(prev => ({ ...prev, [appId]: '' }));
    } catch (e) {
      console.error('Failed to add follow-up reminder:', e);
    }
  };

  const handleDeleteReminder = async (appId: string | undefined, reminderId: string) => {
    if (!appId) return;
    const targetApp = applications.find(a => a.id === appId);
    if (!targetApp) return;

    const updatedReminders = (targetApp.reminders || []).filter(r => r.id !== reminderId);

    try {
      if (userId && !appId.startsWith('local-')) {
        await updateDoc(doc(db, 'applications', appId), { reminders: updatedReminders });
      }
      const updatedList = applications.map(app => 
        app.id === appId ? { ...app, reminders: updatedReminders } : app
      );
      setApplications(updatedList);
      if (!userId) {
        localStorage.setItem('career_forge_applications', JSON.stringify(updatedList));
      }
    } catch (e) {
      console.error('Failed to delete reminder:', e);
    }
  };

  // Helper to check reminder alert level
  const getReminderStatusStyle = (dueDateStr: string, completed: boolean) => {
    if (completed) return { text: 'Done', colorClass: 'text-slate-500 bg-slate-950/20' };
    
    const today = new Date().toISOString().split('T')[0];
    if (dueDateStr === today) {
      return { text: '🚨 Due Today!', colorClass: 'text-amber-400 bg-amber-950/40 animate-pulse border border-amber-900/60' };
    }
    if (dueDateStr < today) {
      return { text: '⚠️ Overdue', colorClass: 'text-rose-400 bg-rose-950/50 border border-rose-900/60' };
    }
    return { text: `Due: ${dueDateStr}`, colorClass: 'text-indigo-300 bg-slate-950/40' };
  };

  // Stats Counters
  const totalApplied = applications.length;
  const interviewingCount = applications.filter(a => a.status === 'interviewing').length;
  const offeredCount = applications.filter(a => a.status === 'offered').length;
  const pendingRemindersCount = applications.reduce((acc, app) => {
    const active = (app.reminders || []).filter(r => !r.completed).length;
    return acc + active;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-left">
          <Activity className="w-5 h-5 text-indigo-400 mb-2" />
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Applications</p>
          <p className="text-2xl font-extrabold text-white mt-1">{totalApplied}</p>
        </div>
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-left">
          <TrendingUp className="w-5 h-5 text-amber-400 mb-2" />
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Interviewing Loop</p>
          <p className="text-2xl font-extrabold text-white mt-1">{interviewingCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-left">
          <Award className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Offers Secured</p>
          <p className="text-2xl font-extrabold text-white mt-1">{offeredCount}</p>
        </div>
        <div className="bg-slate-900 border border-indigo-950/40 p-4 rounded-xl text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <Bell className="w-16 h-16 text-indigo-500" />
          </div>
          <Bell className="w-5 h-5 text-indigo-400 mb-2 animate-bounce" />
          <p className="text-[10px] text-slate-350 font-bold uppercase tracking-widest">Follow-up Alerts</p>
          <p className="text-2xl font-extrabold text-indigo-300 mt-1">{pendingRemindersCount}</p>
        </div>
      </div>

      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white">Your Placement Pipeline</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {userId ? '🔐 Sourced & synchronized securely with Firestore database' : '👤 Running in local anonymous sandbox'}
          </p>
        </div>

        <button 
          onClick={() => setShowAddForm(p => !p)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Job Position</span>
        </button>
      </div>

      {/* Add application form */}
      {showAddForm && (
        <form onSubmit={handleAddApplication} className="bg-slate-900 border border-indigo-950/60 p-5 rounded-2xl flex flex-col gap-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Company Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Google, Stripe, Local Startup..."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-850 border border-slate-750 text-white rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Role Title</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Senior Frontend Software Engineer..."
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-850 border border-slate-750 text-white rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Applied Date</label>
              <input 
                type="date" 
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-850 border border-slate-750 text-white rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-850 border border-slate-750 text-white rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offered">Offered</option>
                <option value="rejected">Rejected / Finished</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Key skills (comma separated)</label>
              <input 
                type="text" 
                placeholder="React, TypeScript, AWS"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-3 py-2 bg-slate-850 border border-slate-750 text-white rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Custom Recruiter notes</label>
            <textarea 
              rows={3} 
              placeholder="Paste interview guidelines, recruiter contact names, next feedback timeline, or prep hints..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-slate-850 border border-slate-750 text-white rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Application</span>
            </button>
          </div>
        </form>
      )}

      {/* Applications Pipeline Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="font-mono text-sm">Querying placement tracker...</span>
        </div>
      ) : applications.length === 0 ? (
        <div className="py-16 bg-slate-900 border border-slate-850 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-sm">
          <Briefcase className="w-8 h-8 text-slate-600 mb-2" />
          <span>No job applications currently tracked. Click 'Add Job Position' above to track your first application.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {applications.map((app) => (
            <div 
              key={app.id} 
              className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl p-5 flex flex-col justify-between text-left space-y-4"
              id={`app-card-${app.id}`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-white tracking-tight">{app.companyName}</h4>
                    <p className="text-xs text-indigo-400 mt-0.5 font-medium">{app.roleTitle}</p>
                  </div>

                  <button 
                    onClick={() => handleDelete(app.id)}
                    className="p-1 px-2 text-slate-500 hover:text-rose-400 hover:bg-slate-850 rounded text-[11px] font-semibold transition flex items-center gap-1"
                    title="Remove application"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                {/* Status selectors & Applied Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/30 p-2.5 rounded-lg border border-slate-850/50">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400">Pipelines:</span>
                    <select 
                      value={app.status}
                      onChange={(e) => handleStatusUpdate(app.id, e.target.value as any)}
                      className={`px-2 py-0.5 rounded font-bold font-mono outline-none border cursor-pointer text-[10px] ${
                        app.status === 'applied' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/40' :
                        app.status === 'interviewing' ? 'bg-amber-950/40 text-amber-400 border-amber-900/40' :
                        app.status === 'offered' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40' :
                        'bg-slate-950/40 text-slate-400 border-slate-900/40'
                      }`}
                    >
                      <option value="applied" className="bg-slate-900 text-white">APPLIED</option>
                      <option value="interviewing" className="bg-slate-900 text-white">INTERVIEWING</option>
                      <option value="offered" className="bg-slate-900 text-white">OFFERED</option>
                      <option value="rejected" className="bg-slate-900 text-white">REJECTED / ENDED</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 sm:justify-end">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Applied: {app.appliedDate}</span>
                  </div>
                </div>

                {/* skill highlights */}
                {app.skillsRequired && app.skillsRequired.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {app.skillsRequired.map((skill, si) => (
                      <span key={si} className="px-2 py-0.5 bg-slate-850 text-slate-350 rounded text-[9px] font-mono border border-slate-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes details */}
                {app.notes && (
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans bg-slate-950/40 rounded-lg p-3 border border-slate-900/50">
                    <span className="block text-[9px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Position Context / Notes:</span>
                    {app.notes}
                  </p>
                )}

                {/* FOLLOW-UP ACTION REMINDERS MODULE */}
                <div className="pt-3 border-t border-slate-850 mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 text-indigo-400" />
                      Follow-up Reminders & Tasks
                    </span>
                    <span className="text-[9px] text-slate-400 bg-slate-850 px-1.5 py-0.5 rounded font-mono font-semibold">
                      {(app.reminders || []).filter(r => !r.completed).length} Pending
                    </span>
                  </div>

                  {/* List of Reminders */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {(!app.reminders || app.reminders.length === 0) ? (
                      <div className="text-[11px] text-slate-500 py-2 italic">
                        No follow-up reminders. Schedule one below to never miss a recruiter deadlines.
                      </div>
                    ) : (
                      app.reminders.map((reminder) => {
                        const styleInfo = getReminderStatusStyle(reminder.dueDate, reminder.completed);
                        return (
                          <div 
                            key={reminder.id}
                            className={`flex items-start justify-between p-2 rounded-lg text-xs gap-3 transition ${
                              reminder.completed ? 'bg-slate-950/10' : 'bg-slate-950/30 border border-slate-850/40'
                            }`}
                          >
                            <label className="flex items-start gap-2.5 cursor-pointer select-none max-w-[70%]">
                              <input 
                                type="checkbox"
                                checked={reminder.completed}
                                onChange={() => handleToggleReminder(app.id, reminder.id)}
                                className="mt-1 w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 outline-none"
                              />
                              <span className={`text-[11px] leading-tight text-left ${
                                reminder.completed ? 'line-through text-slate-504 text-slate-500' : 'text-slate-300'
                              }`}>
                                {reminder.title}
                              </span>
                            </label>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold ${styleInfo.colorClass}`}>
                                {styleInfo.text}
                              </span>
                              <button 
                                onClick={() => handleDeleteReminder(app.id, reminder.id)}
                                className="text-slate-500 hover:text-rose-450 hover:text-rose-400 p-0.5 rounded"
                                title="Delete task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Create New Reminder Form */}
                  <form 
                    onSubmit={(e) => handleAddReminder(e, app.id)}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-850/40"
                  >
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Call back recruiter, Send thank-you..."
                      value={reminderTitles[app.id || ''] || ''}
                      onChange={(e) => setReminderTitles(prev => ({ ...prev, [app.id || '']: e.target.value }))}
                      className="sm:col-span-2 px-2.5 py-1.5 bg-slate-950/50 border border-slate-800 rounded-lg text-[11px] text-white outline-none focus:border-indigo-600 transition"
                    />
                    <div className="flex gap-1.5">
                      <input 
                        type="date"
                        required
                        value={reminderDates[app.id || ''] || ''}
                        onChange={(e) => setReminderDates(prev => ({ ...prev, [app.id || '']: e.target.value }))}
                        className="w-full px-2 py-1.5 bg-slate-950/50 border border-slate-800 rounded-lg text-[11px] text-slate-350 outline-none focus:border-indigo-600 transition font-mono"
                      />
                      <button 
                        type="submit"
                        className="p-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 rounded-lg transition shrink-0"
                        title="Add task reminder"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
