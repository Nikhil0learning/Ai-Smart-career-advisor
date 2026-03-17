export interface UserProfile {
  _id?: string;
  email: string;
  name: string;
  currentRole: string;
  currentIndustry: string;
  yearsOfExperience: number;
  skills: string[];
  careerGoal: string;
  learningHistory: {
    course: string;
    completionDate: string;
    category: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SkillProgress {
  skill: string;
  currentLevel: number; // 1-5
  targetLevel: number; // 1-5
  learningStartDate: string;
  lastUpdated: string;
}

export interface CareerAnalytics {
  _id?: string;
  userId: string;
  skillProgression: SkillProgress[];
  careerPathStages: {
    stage: string;
    role: string;
    requiredSkills: string[];
    estimatedTimeline: number; // months
    completed: boolean;
  }[];
  timeToGoal: number; // months
  lastUpdated?: Date;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface Conversation {
  _id?: string;
  userId: string;
  messages: Message[];
  topic: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ResumeAnalysis {
  strengths: string[];
  areasForImprovement: string[];
  recommendedCertifications: string[];
  suggestedSkills: string[];
}
