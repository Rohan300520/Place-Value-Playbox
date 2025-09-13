// Fix: Replaced incorrect content with proper type definitions for the entire application.
// This resolves all type-related errors across components and utilities.

export type BlockValue = 1 | 10 | 100 | 1000;

export type PlaceValueCategory = 'ones' | 'tens' | 'hundreds' | 'thousands';

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

export type AppState =
  | 'welcome'
  | 'mode_selection'
  | 'challenge_difficulty_selection'
  | 'training'
  | 'playground'
  | 'challenge'
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

export interface ChallengeQuestion {
  id: number;
  level: number;
  question: string;
  answer: number;
  type: 'build' | 'interpret';
  concept: 'place_value' | 'number_word' | 'addition' | 'subtraction';
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Theme = 'light' | 'dark';

// Fix: Added the missing 'Language' type definition.
export type Language = 'en' | 'hi' | 'kn';
