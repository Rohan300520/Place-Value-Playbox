import type React from 'react';

// --- Core App State ---
export type AppState = 'model_selection' | 'place_value_playbox' | 'fractions';

export type UserInfo = {
  name: string;
  school: string;
  keyId: string;
};

// --- UI & Theming ---
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'hi' | 'kn';
export type Difficulty = 'easy' | 'medium' | 'hard';

// --- Place Value Playbox Model ---
export type BlockValue = 1 | 10 | 100 | 1000;
export type PlaceValueCategory = 'ones' | 'tens' | 'hundreds' | 'thousands';

export interface Block {
  id: string;
  value: BlockValue;
  isAnimating?: boolean | null; // true for swirl-out, false for poof-out, null/undefined for no animation
  isNewlyRegrouped?: boolean;
}

export type PlaceValueColumns = {
  [key in PlaceValueCategory]: Block[];
};

export type PlaceValueState =
  | 'welcome'
  | 'model_intro'
  | 'mode_selection'
  | 'training'
  | 'playground'
  | 'challenge'
  | 'challenge_difficulty_selection'
  | 'stem_connection';

export interface TrainingStep {
  step: number;
  type: 'action' | 'feedback' | 'action_multi' | 'magic_feedback' | 'complete';
  text: string;
  source?: BlockValue;
  column?: PlaceValueCategory;
  count?: number;
  duration?: number;
  clearBoardAfter?: boolean;
  targetColumn?: PlaceValueCategory;
}

export interface PlaceValueChallengeQuestion {
  id: number;
  level: number;
  question: string;
  answer: number;
  type: 'build' | 'interpret';
  concept: 'place_value' | 'number_word' | 'addition' | 'subtraction';
}

// --- STEM Connection (Artery) Model ---
export type StemStage = 'intro' | 'build_epithelial' | 'build_blood' | 'build_muscle' | 'assemble_artery' | 'complete';
export type CellType = 'epithelial' | 'rbc' | 'wbc' | 'platelet' | 'muscle';
export type TissueType = 'epithelial' | 'blood' | 'muscle';

export interface StemCell {
  id: string;
  type: CellType;
  state: 'placed' | 'regrouping';
  style: React.CSSProperties;
}

// --- Fractions Model ---
export interface Fraction {
  numerator: number;
  denominator: number;
}

export type FractionOperator = '+' | '-';

export type EquationState = {
  term1: Fraction | null;
  operator: FractionOperator | null;
  term2: Fraction | null;
  result: Fraction | null;
  unsimplifiedResult?: Fraction | null;
  isSolved: boolean;
};

export type FractionState =
  | 'welcome'
  | 'mode_selection'
  | 'training'
  | 'explore'
  | 'challenge'
  | 'challenge_difficulty_selection';

export type ExploreView = 'operations' | 'anatomy' | 'number_line';

export interface FractionChallengeQuestion {
  id: number;
  level: Difficulty;
  term1: Fraction;
  operator: FractionOperator;
  term2: Fraction;
  type: 'add' | 'subtract';
  answer: Fraction;
}

export type TrainingAction = 
  | 'select_term1' 
  | 'select_operator' 
  | 'select_term2' 
  | 'solve' 
  | 'set_denominator'
  | 'select_pieces'
  | 'select_point'
  | 'continue';

export interface FractionTrainingStep {
  step: number;
  type: 'intro' | 'action' | 'feedback' | 'complete';
  ui?: 'concept' | 'number_line' | 'operations';
  text: string;
  requiredAction?: TrainingAction;
  requiredValue?: Fraction | FractionOperator | number;
  spotlightOn?: Fraction | FractionOperator | 'solve' | `denominator-${number}` | 'pieces' | 'continue_button' | 'number_line_ticks' | `number_line_point-${string}`;
  duration?: number;
  clearBoardAfter?: boolean;
  count?: number;
}


// --- Analytics ---
export interface AnalyticsEvent {
  id: string;
  timestamp: number;
  eventName: string;
  userInfo: UserInfo;
  payload: Record<string, any>;
}

export interface GlobalStats {
  total_users: number;
  total_sessions: number;
  total_challenge_attempts: number;
  avg_success_rate: number;
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
  level: Difficulty;
  status: 'correct' | 'incorrect' | 'timed_out';
  duration: number;
  user_answer: number | string;
  correct_answer: number | string;
}

export interface DailyActivity {
  day: string;
  session_count: number;
  user_count: number;
}

export interface SchoolChallengeStats {
  correct_count: number;
  incorrect_count: number;
  timed_out_count: number;
}