import React from 'react';
import type { SurfaceAreaTrainingStep } from '../../../types';

interface TrainingGuideProps {
  currentStep: SurfaceAreaTrainingStep | null;
  onComplete: () => void;
  onContinue: () => void;
}


export const TrainingGuide: React.FC<TrainingGuideProps> = ({ currentStep, onComplete, onContinue }) => {
    if (!currentStep) return null;

    const { type, text, title } = currentStep;

    const guideBoxStyle = {
        backgroundColor: 'var(--blueprint-panel-bg)',
        borderColor: 'var(--blueprint-border)',
        color: 'var(--blueprint-text-primary)'
    };

    const content = (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="flex-grow">
                {title && <h3 className="text-2xl font-bold font-display text-[var(--blueprint-accent)]">{title}</h3>}
                <p className="font-semibold text-lg">{text}</p>
             </div>
             <div className="flex-shrink-0 flex items-center gap-4">
                {currentStep.requiredAction === 'continue' && (
                    <button 
                        onClick={onContinue}
                        className="self-center bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-2 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all border-b-4 border-green-700 active:border-b-2 animate-guide-pulse"
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
        <div className="w-full border-2 p-4 sm:p-6 rounded-2xl shadow-xl animate-pop-in" style={guideBoxStyle}>
            {content}
        </div>
    );
};