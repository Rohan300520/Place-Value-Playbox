import React from 'react';
import type { SurfaceAreaTrainingStep } from '../../../types';

interface TrainingGuideProps {
  currentStep: SurfaceAreaTrainingStep | null;
  onComplete: () => void;
  onContinue: () => void;
}

const POSITION_CLASSES: Record<string, string> = {
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'shape-selector': 'top-1/4 left-1/2 -translate-x-1/2',
    'input-panel': 'top-1/2 left-[calc(50%-18rem)] -translate-x-full -translate-y-1/2', // Positions left of center
    'top-left': 'top-24 left-24',
};

const ARROW_CLASSES: Record<string, string> = {
    up: 'guide-box-arrow-up',
    down: 'guide-box-arrow-down',
    left: 'guide-box-arrow-left',
    right: 'guide-box-arrow-right',
    none: '',
};

export const TrainingGuide: React.FC<TrainingGuideProps> = ({ currentStep, onComplete, onContinue }) => {
    if (!currentStep) return null;

    const { type, text, position = 'center', arrow = 'none' } = currentStep;

    const baseClasses = "fixed backdrop-blur-sm border-2 p-6 rounded-2xl shadow-xl max-w-sm text-center animate-pop-in z-40 flex items-center gap-4";
    const positionClass = POSITION_CLASSES[position] || POSITION_CLASSES.center;
    const arrowClass = ARROW_CLASSES[arrow] || '';

    const guideBoxStyle = {
        backgroundColor: 'var(--blueprint-panel-bg)',
        borderColor: 'var(--blueprint-accent)',
        color: 'var(--blueprint-text-primary)'
    };

    if (type === 'feedback') {
        return (
            <div className={`${baseClasses} ${positionClass}`} style={guideBoxStyle}>
                <p className="font-bold text-2xl">{text}</p>
            </div>
        );
    }
    
    if (type === 'complete') {
        return (
             <div className={`${baseClasses} ${positionClass} flex-col`} style={guideBoxStyle}>
                <p className="text-5xl">🎓</p>
                <p className="mt-4 text-3xl font-display font-bold">{text}</p>
                <button 
                    onClick={onComplete} 
                    className="mt-6 text-white font-bold text-xl py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all border-b-4 active:border-b-2"
                    style={{ backgroundColor: 'var(--btn-action-bg)', borderColor: 'var(--btn-action-border)' }}
                >
                    Back to Menu
                </button>
            </div>
        );
    }

    // For intro and action types
    return (
        <div className={`${baseClasses} ${positionClass} ${arrowClass}`} style={guideBoxStyle}>
            <img src="/assets/geo-bot.svg" alt="Geo Bot Mascot" className="w-20 h-20 flex-shrink-0" />
            <div className="flex flex-col items-start gap-4">
                 <p className="font-bold text-xl text-left">{text}</p>
                 {currentStep.requiredAction === 'continue' && (
                     <button 
                        onClick={onContinue}
                        className="self-center bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-2 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all border-b-4 border-green-700 active:border-b-2 animate-guide-pulse"
                    >
                        Continue
                    </button>
                 )}
            </div>
        </div>
    );
};