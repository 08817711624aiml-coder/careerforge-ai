export interface Profile {
  resumeText: string;
  resumeFileName?: string;
  linkedinUrl: string;
  desiredJob: string;
  timeline: '3 months' | '6 months' | '9 months';
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  status: 'pending' | 'in_progress' | 'completed';
  actionItems: string[];
}

export interface SkillToAcquire {
  name: string;
  importance: 'high' | 'medium' | 'low';
  currentLevel: string;
  targetLevel: string;
  resources: string[];
}

export interface TargetCompany {
  name: string;
  industry: string;
  whyMatch: string;
  hiringDifficulty: 'easy' | 'medium' | 'hard';
  openRolesEstimate: string;
  interviewPrepStrategy: string;
  tier?: 'Tier 1' | 'Tier 2' | 'Tier 3';
  location?: string;
}

export interface CareerRoadmap {
  desiredJob: string;
  summary: string;
  milestones: RoadmapMilestone[];
  skills: SkillToAcquire[];
  targetCompanies: TargetCompany[];
  timestamp: string;
  timeline?: string;
}

export interface FollowUpReminder {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface JobApplication {
  id?: string;
  userId: string;
  companyName: string;
  roleTitle: string;
  appliedDate: string;
  status: 'applied' | 'interviewing' | 'offered' | 'rejected';
  notes: string;
  skillsRequired: string[];
  reminders?: FollowUpReminder[];
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
}

export interface MarketInsight {
  trendingRoles: string[];
  trendingSkills: string[];
  hiringSpeed: string;
  marketOutlook: string;
  prepAdvice: string;
}
