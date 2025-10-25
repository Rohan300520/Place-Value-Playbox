import type React from 'react';

// --- Core App State ---
export type AppState = 'model_selection' | 'place_value_playbox' | 'fractions' | 'surface_area_9' | 'surface_area_10';
export type SchoolLevel = 'Lower School' | 'Middle School' | 'High School';

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

export interface WorkspacePiece {
  id: string;
  fraction: Fraction;
  position: { x: number; y: number };
  state?: 'idle' | 'splitting' | 'merging' | 'removing';
  // For splitting animation
  splitInto?: Fraction;
  // For merging animation
  mergeTargetId?: string;
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
  type: 'add' | 'subtract' | 'compare' | 'order';
  answer: Fraction | Fraction[];
}

export type TrainingAction = 
  | 'drag_piece'
  | 'click_bar'
  | 'arrange_pieces'
  | 'continue'
  | 'solve';
  
export interface FractionTrainingStep {
  module: number;
  step: number;
  type: 'intro' | 'action' | 'feedback' | 'complete';
  text: string;
  goal?: string;
  duration?: number;
  requiredAction?: TrainingAction;
  requiredValue?: Fraction | Fraction[]; // Can be a single fraction to drag, or an array for ordering
  requiredCount?: number;
  spotlightOn?: string; // e.g., 'chart_row-4', 'workspace_piece-id', 'whole_bar'
  clearWorkspaceAfter?: boolean;
  // Animation Triggers
  animation?: 'merge' | 'split' | 'remove';
  animationTarget?: Fraction;
  // For ordering module
  orderingBoxes?: Fraction[];
}


// --- Surface Area & Volume Models ---
export type ShapeType = 
  | 'cuboid' | 'cube' | 'cylinder' | 'cone' | 'sphere' | 'hemisphere'
  | 'cone_on_hemisphere' | 'cylinder_with_hemispheres' | 'cone_on_cylinder' | 'frustum';
  
export type CalculationType = 'volume' | 'lsa' | 'tsa';
export type RenderMode = 'solid' | 'wireframe';

export type ShapeDimensions = {
  [key: string]: number;
};

export type FormulaPart = {
  partName: string;
  formula: string;
  meshId: string | string[];
};

export type CalculationResult = {
  value: number;
  formula: string;
  derivation?: {
    title: string;
    parts: FormulaPart[];
    finalFormula?: string;
  };
  steps: {
    description: string;
    calculation: string;
    result: string;
  }[];
} | null;

export type SurfaceAreaState = 'welcome' | 'mode_selection' | 'training' | 'explore' | 'challenge_difficulty_selection' | 'challenge';

export interface SurfaceAreaChallengeQuestion {
  id: number;
  level: Difficulty;
  class: 9 | 10;
  question: string; // The word problem for the user
  contextInfo?: string[]; // Extra info like rates, costs etc.
  shape: ShapeType; // The correct shape to select
  dimensions: ShapeDimensions; // Correct dimensions to input
  calculationType: CalculationType; // Correct calculation type
  answer: number; // The final numeric answer for the main calculation
  tolerance?: number; 
  unit?: 'cm' | 'm' | 'mm';
  followUp?: {
    prompt: string;
    answer: number;
    unit?: string;
  };
}

export type TrainingSpotlight = 
  | 'dimension' 
  | 'calculation_type' 
  | 'calculate_button' 
  | 'unfold_button' 
  | `shape-${ShapeType}` 
  | `dimension-${string}` 
  | `calc_type-${CalculationType}`
  | 'comparison_button';

export type TrainingAnimation = 'cylinder_unfold' | 'cone_volume_compare';

export interface SurfaceAreaTrainingStep {
  step: number;
  type: 'intro' | 'action' | 'feedback' | 'complete';
  text: string;
  title?: string;
  duration?: number;
  spotlightOn?: TrainingSpotlight;
  requiredAction?: 'select_shape' | 'change_dimension' | 'select_calc_type' | 'calculate' | 'unfold' | 'continue' | 'return_to_selector' | 'toggle_comparison';
  requiredValue?: ShapeType | CalculationType;
  // Visual training properties
  highlightPartId?: string | string[] | null;
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