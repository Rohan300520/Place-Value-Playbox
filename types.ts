export type BlockValue = 1 | 10 | 100 | 1000;
export type PlaceValueCategory = 'ones' | 'tens' | 'hundreds' | 'thousands';
export type AppState = 'welcome' | 'mode_selection' | 'training' | 'playground' | 'challenge' | 'stem_connection' | 'challenge_difficulty_selection';
export type Difficulty = 'easy' | 'medium' | 'hard';

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
    source?: BlockValue;
    column?: PlaceValueCategory;
    count?: number;
    text: string;
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
}