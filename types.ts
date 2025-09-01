export type BlockValue = 1 | 10 | 100;
export type PlaceValueCategory = 'ones' | 'tens' | 'hundreds';
export type AppState = 'welcome' | 'mode_selection' | 'training' | 'playground' | 'challenge';

export interface Block {
  id: string;
  value: BlockValue;
  isAnimating?: boolean;
}

export interface PlaceValueColumns {
  ones: Block[];
  tens: Block[];
  hundreds: Block[];
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
}