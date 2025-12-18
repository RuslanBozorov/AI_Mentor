
export type AppLanguage = 'uz' | 'ru' | 'en';

export enum EnglishLevel {
  BEGINNER = 'Beginner',
  ELEMENTARY = 'Elementary',
  PRE_INTERMEDIATE = 'Pre-Intermediate',
  INTERMEDIATE = 'Intermediate',
  UPPER_INTERMEDIATE = 'Upper-Intermediate'
}

export enum LearningGoal {
  SPEAKING = 'Speaking',
  GRAMMAR = 'Grammar',
  VOCABULARY = 'Vocabulary',
  WRITING = 'Writing'
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age?: number;
  avatar?: string;
  currentLevel: EnglishLevel;
  targetLevel: EnglishLevel;
  goal: LearningGoal;
  coins: number;
  language: AppLanguage;
  onboarded: boolean;
  lessonsCompleted: number; // nodes on the roadmap
  currentTaskIndex: number; // 0 to 4 within a lesson
  completedNodes: string[]; // List of completed node IDs
}

export interface LessonContent {
  title: string;
  explanation: string;
  isExam?: boolean;
  examples: { original: string; translation: string }[];
  task: {
    taskType: 'mcq' | 'correction' | 'writing' | 'speaking' | 'vocabulary';
    question: string;
    options?: string[];
    audioPrompt?: string;
  };
}

export interface TaskResponse {
  feedback: string;
  mistakes: string[];
  reason: string;
  coins: number;
  motivation: string;
  next_task: string;
  passedExam?: boolean;
  success: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  coins: number;
  avatar?: string;
  isSelf?: boolean;
}

export interface RoadmapNode {
  id: string;
  title: string;
  icon: string;
  type: 'lesson' | 'exam' | 'treasure';
}
