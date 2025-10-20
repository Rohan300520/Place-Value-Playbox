// Fix: Populated with all necessary type definitions for the entire application.

import React from 'react';

// --- General App Types ---
export type AppState = 'model_selection' | 'place_value_playbox' | 'fractions' | 'surface_area_9' | 'surface_area_10';
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'hi' | 'kn';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface UserInfo {
  name: string;
  school: string;
  keyId: string;
}

// --- Place Value Playbox Types ---
export type PlaceValueCategory = 'ones' | 'tens' | 'hundreds' | 'thousands';
export type BlockValue = 1 | 10 | 100 | 1000;
export type PlaceValueState = 'welcome' | 'model_intro' | 'mode_selection' | 'training' | 'playground' | 'challenge' | 'challenge_difficulty_selection' | 'stem_connection';

export interface Block {
  id: string;
  value: BlockValue;
  isAnimating?: boolean;
  isNewlyRegrouped?: boolean;
}

export interface PlaceValueColumns {
  ones: Block[];
  tens: Block[];
  hundreds: Block[];
  thousands: Block[];
}

export interface TrainingStep {
  step: number;
  type: 'action' | 'action_multi' | 'feedback' | 'magic_feedback' | 'complete';
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

// --- STEM Connection Types ---
export type StemStage = 'intro' | 'build_epithelial' | 'build_blood' | 'build_muscle' | 'assemble_artery' | 'complete';
export type CellType = 'epithelial' | 'rbc' | 'wbc' | 'platelet' | 'muscle';
export type TissueType = 'epithelial' | 'blood' | 'muscle';

export interface StemCell {
    id: string;
    type: CellType;
    state: 'placed' | 'regrouping';
    style: React.CSSProperties;
}


// --- Fractions App Types ---
export interface Fraction {
  numerator: number;
  denominator: number;
}

export type FractionState = 'welcome' | 'mode_selection' | 'explore' | 'training' | 'challenge' | 'challenge_difficulty_selection';
export type FractionOperator = '+' | '-';
export type ExploreView = 'operations' | 'anatomy' | 'number_line';

export interface EquationState {
  term1: Fraction | null;
  operator: FractionOperator | null;
  term2: Fraction | null;
  result: Fraction | null;
  unsimplifiedResult: Fraction | null;
  isSolved: boolean;
}

export interface FractionChallengeQuestion {
    id: number;
    level: Difficulty;
    type: 'add' | 'subtract';
    term1: Fraction;
    operator: FractionOperator;
    term2: Fraction;
    answer: Fraction;
}

export type TrainingAction = 'select_term1' | 'select_operator' | 'select_term2' | 'solve' | 'continue' | 'set_denominator' | 'select_pieces' | 'select_point';

export interface FractionTrainingStep {
    step: number;
    type: 'intro' | 'feedback' | 'action' | 'complete';
    ui: 'operations' | 'concept' | 'number_line';
    text: string;
    duration?: number;
    clearBoardAfter?: boolean;
    requiredAction?: TrainingAction;
    requiredValue?: Fraction | FractionOperator | number;
    spotlightOn?: Fraction | FractionOperator | 'solve' | string;
    count?: number;
}

// --- Surface Area App Types ---
export type ShapeType = 
    // Class 9
    'cuboid' | 'cube' | 'cylinder' | 'cone' | 'sphere' | 'hemisphere' |
    // Class 10
    'cone_on_hemisphere' | 'cylinder_with_hemispheres' | 'cone_on_cylinder' | 'frustum';
    
export type CalculationType = 'volume' | 'lsa' | 'tsa';

export type ShapeDimensions = { [key: string]: number };

export interface CalculationStep {
    description: string;
    calculation: string;
    result: string;
}

export interface CalculationResult {
    value: number;
    formula: string;
    steps: CalculationStep[];
}

// --- Analytics Types ---
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
  level: string;
  status: string;
  duration: number;
  user_answer: number;
  correct_answer: number;
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
