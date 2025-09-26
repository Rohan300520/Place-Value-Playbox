// Define the basic types for blocks and columns
export type BlockValue = 1 | 10 | 100 | 1000;
export type PlaceValueCategory = 'ones' | 'tens' | 'hundreds' | 'thousands';

export interface Block {
  id: string;
  value: BlockValue;
  isAnimating?: boolean;
  isNewlyRegrouped?: boolean;
}

export type PlaceValueColumns = {
  [key in PlaceValueCategory]: Block[];
};

// Define the state of the application
export type AppState = 
  | 'home'
  | 'welcome'
  | 'model_intro'
  | 'mode_selection'
  | 'playground'
  | 'training'
  | 'challenge'
  | 'stem_connection'
  | 'challenge_difficulty_selection';

// Define the structure for training steps
type TrainingActionStep = {
  step: number;
  type: 'action';
  source: BlockValue;
  column: PlaceValueCategory;
  text: string;
};

type TrainingFeedbackStep = {
  step: number;
  type: 'feedback';
  text: string;
  duration: number;
  clearBoardAfter: boolean;
};

type TrainingActionMultiStep = {
  step: number;
  type: 'action_multi';
  source: BlockValue;
  column: PlaceValueCategory;
  count: number;
  text: string;
};

type TrainingMagicFeedbackStep = {
  step: number;
  type: 'magic_feedback';
  text: string;
  duration: number;
  clearBoardAfter: boolean;
  targetColumn: PlaceValueCategory;
};

type TrainingCompleteStep = {
  step: number;
  type: 'complete';
  text: string;
};

export type TrainingStep = 
  | TrainingActionStep 
  | TrainingFeedbackStep 
  | TrainingActionMultiStep
  | TrainingMagicFeedbackStep
  | TrainingCompleteStep;

// Define the structure for challenge questions
export interface ChallengeQuestion {
  id: number;
  level: number;
  question: string;
  answer: number;
  type: 'build' | 'interpret';
  concept: string;
}

// Define difficulty levels for challenge mode
export type Difficulty = 'easy' | 'medium' | 'hard';

// User information for licensing and analytics
export interface UserInfo {
    name: string;
    school: string;
    keyId: string;
}

// Theme for the application UI
export type Theme = 'light' | 'dark';

// Language for localization
export type Language = 'en' | 'hi' | 'kn';

// Analytics event structure
export interface AnalyticsEvent {
  id: string; // Unique ID for the event
  timestamp: number;
  eventName: string;
  userInfo: UserInfo | null;
  payload: Record<string, any>;
}

// --- Analytics Dashboard Types ---

export interface GlobalStats {
  total_users: number;
  total_sessions: number;
  total_challenge_attempts: number;
  avg_success_rate: number | null;
}

export interface SchoolSummary {
  school_name: string;
  user_count: number;
  session_count: number;
  last_active: string;
}

export interface SchoolUserDetails {
  user_name: string;
  session_count: number;
  total_challenge_attempts: number;
  correct_challenge_attempts: number;
  last_active: string;
}

export interface UserChallengeHistory {
  event_timestamp: string;
  question: string;
  level: string;
  status: string;
  duration: number;
  user_answer: string;
  correct_answer: string;
}

export interface DailyActivity {
    day: string; // Date string "YYYY-MM-DD"
    session_count: number;
    user_count: number;
}

export interface SchoolChallengeStats {
    correct_count: number;
    incorrect_count: number;
    timed_out_count: number;
}