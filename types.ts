import type React from 'react';

// --- Core App State ---
export type AppState = 'model_selection' | 'place_value_playbox' | 'fractions' | 'surface_area_volume';
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
  state?: 'idle' | 'splitting' | 'merging' | 'removing' | 'combining';
  // For splitting animation
  splitInto?: Fraction;
  // For merging animation
  mergeTargetId?: string;
}


// Fix: Add ', or' to FractionOperator type to support visual separators in compare mode.
export type FractionOperator = '+' | '-' | ', or';

export interface EquationTerm {
  fraction: Fraction | null;
  pieces: WorkspacePiece[];
}

export type EquationState = {
  terms: EquationTerm[];
  operators: FractionOperator[];
  result: Fraction | null;
  resultPieces: WorkspacePiece[];
  unsimplifiedResult?: Fraction | null;
  unsimplifiedResultPieces?: WorkspacePiece[];
  isSolved: boolean;
  isWorkoutActive: boolean;
  workoutStep: 'idle' | 'commonDenominator' | 'combine' | 'simplify' | 'done';
  autoAdvanceWorkout?: boolean;
};

export type FractionState =
  | 'welcome'
  | 'model_intro'
  | 'mode_selection'
  | 'training'
  | 'explore'
  | 'challenge'
  | 'challenge_difficulty_selection';

export type ExploreView = 'operations' | 'anatomy' | 'number_line';

export interface FractionChallengeQuestion {
  id: number;
  level: Difficulty;
  questionText: string;
  fractions: Fraction[];
  operator?: FractionOperator;
  type: 'add' | 'subtract' | 'compare' | 'order';
  answer: Fraction | Fraction[] | number; // number for compare index
  order?: 'ascending' | 'descending';
  displayType?: 'chart' | 'mcq' | 'pizza';
  mcqOptions?: Fraction[];
}

export type TrainingAction = 
  | 'drag_piece'
  | 'click_bar'
  | 'arrange_pieces'
  | 'continue'
  | 'solve'
  // Fix: Add missing training actions
  | 'set_denominator'
  | 'select_pieces';
  
export type TrainingActivity = {
  type: 'build' | 'equivalent' | 'improper_to_mixed';
  target: Fraction;
  options?: {
    // For equivalence, which denominators are allowed for the user's answer
    allowedDenominators?: number[];
  };
};
  
// Fix: Add 'simplify' to the animation type and include related properties to support the simplification animation step.
export interface FractionTrainingStep {
  module: number;
  step: number;
  type: 'intro' | 'action' | 'feedback' | 'complete' | 'activity';
  text: string;
  // Fix: Add optional title property
  title?: string;
  goal?: string;
  duration?: number;
  requiredAction?: TrainingAction;
  requiredValue?: Fraction | Fraction[]; // Can be a single fraction to drag, or an array for ordering
  requiredCount?: number;
  spotlightOn?: string; // e.g., 'chart_row-4', 'workspace_piece-id', 'whole_bar'
  clearWorkspaceAfter?: boolean;
  // Animation Triggers
  animation?: 'merge' | 'split' | 'remove' | 'simplify';
  animationTarget?: Fraction;
  animationSplitResult?: Fraction; // The fraction of each piece after splitting.
  animationTargetCount?: number;
  animationResult?: Fraction;
  // For ordering module
  orderingBoxes?: Fraction[];
  activity?: TrainingActivity;
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

// Fix: Added missing type definitions for the Surface Area & Volume models.
// --- Surface Area & Volume Model ---
export type ShapeType =
  | 'cuboid'
  | 'cube'
  | 'cylinder'
  | 'cone'
  | 'sphere'
  | 'hemisphere'
  | 'cone_on_hemisphere'
  | 'cylinder_with_hemispheres'
  | 'cone_on_cylinder'
  | 'frustum';

export type ShapeDimensions = {
  [key: string]: number;
};

export type CalculationType = 'volume' | 'lsa' | 'tsa';

export type CalculationResult = {
  value: number;
  formula: string;
  steps: {
    description: string;
    calculation: string;
    result: string;
  }[];
  derivation?: {
    title: string;
    parts: {
      partName: string;
      formula: string;
      meshId: string | string[];
    }[];
    finalFormula?: string;
  };
} | null;

export type SurfaceAreaState =
  | 'welcome'
  | 'objectives'
  | 'mode_selection'
  | 'explore'
  | 'training'
  | 'challenge'
  | 'challenge_difficulty_selection';

export type RenderMode = 'solid' | 'wireframe';

export type TrainingSpotlight = string;

export interface SurfaceAreaChallengeQuestion {
  id: number;
  level: Difficulty;
  class: 9 | 10;
  shape: ShapeType;
  question: string;
  contextInfo?: string[];
  dimensions: ShapeDimensions;
  calculationType: CalculationType;
  answer: number;
  tolerance?: number;
  unit?: string;
  followUp?: {
    prompt: string;
    answer: number;
    unit?: string;
  };
}

export interface SurfaceAreaTrainingStep {
  step: number;
  type: 'intro' | 'feedback' | 'action' | 'complete';
  title?: string;
  text: string;
  duration?: number;
  requiredAction?:
    | 'select_shape'
    | 'change_dimension'
    | 'select_calc_type'
    | 'calculate'
    | 'unfold'
    | 'toggle_comparison'
    | 'return_to_selector'
    | 'continue'
    | 'show_examples';
  requiredValue?: ShapeType | CalculationType;
  spotlightOn?: TrainingSpotlight;
  highlightPartId?: string | string[] | null;
  unfoldOnStep?: boolean;
}