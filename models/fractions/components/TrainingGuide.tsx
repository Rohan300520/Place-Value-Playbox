import React from 'react';
import type { FractionTrainingStep } from '../../../types';

interface TrainingGuideProps {
  currentStep: FractionTrainingStep | null;
  onComplete: () => void;
  onContinue: () => void;
  incorrectActionFeedback?: string | null;
}


export const TrainingGuide: React.FC<TrainingGuideProps> = ({ currentStep, onComplete, onContinue, incorrectActionFeedback }) => {
    if (!currentStep) return null;

    const { type, text, title } = currentStep;

    const content = (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="flex-grow">
                {title && <h3 className="text-2xl font-bold font-display text-[var(--chalk-yellow)]">{title}</h3>}
                <p className="font-semibold text-lg">{text}</p>
                {incorrectActionFeedback && (
                    <p className="mt-2 text-lg font-bold text-red-400 animate-shake">{incorrectActionFeedback}</p>
                )}
             </div>
             <div className="flex-shrink-0 flex items-center gap-4">
                {currentStep.requiredAction === 'continue' && (
                    <button 
                        onClick={onContinue} 
                        className={`flex-shrink-0 bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-2 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all border-b-4 border-green-700 active:border-b-2 ${currentStep.spotlightOn === 'continue_button' ? 'animate-guide-pulse' : ''}`}
                    >
                        Continue
                    </button>
                )}
                {type === 'complete' && (
                     <button 
                        onClick={onComplete} 
                        className="text-white font-bold text-xl py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all border-b-4 active:border-b-2"
                        style={{ backgroundColor: 'var(--btn-action-bg)', borderColor: 'var(--btn-action-border)' }}
                    >
                        Finish Training
                    </button>
                )}
             </div>
        </div>
    );
    
    return (
        <div className="w-full border-2 p-4 sm:p-6 rounded-2xl shadow-xl animate-pop-in" style={{ 
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            borderColor: 'rgba(56, 189, 248, 0.5)',
            color: '#f1f5f9'
        }}>
            {content}
        </div>
    );
};