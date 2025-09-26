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
