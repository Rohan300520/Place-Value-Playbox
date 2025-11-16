import React from 'react';
import type { SurfaceAreaTrainingStep } from '../../../types';

interface TrainingGuideProps {
    currentStep: SurfaceAreaTrainingStep | null;
    onContinue: () => void;
    onComplete: () => void;
}

export const TrainingGuide: React.FC<TrainingGuideProps> = ({ currentStep, onContinue, onComplete }) => {
    if (!currentStep) return null;

    const { type, text, title, requiredAction } = currentStep;

    return (
        <div className="w-full p-4 rounded-2xl animate-pop-in mb-4 flex items-center gap-4">
            <img src="/assets/geo-bot.svg" alt="Geo-Bot Mascot" className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 animate-bot-float" />
            <div 
                className="w-full speech-bubble" 
                style={{ '--bubble-bg': 'rgba(30, 41, 59, 0.95)' } as React.CSSProperties}
            >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-grow">
                        {title && <h3 className="text-2xl font-bold font-display text-sky-300">{title}</h3>}
                        <p className="font-semibold text-lg">{text}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-4">
                        {requiredAction === 'continue' && (
                            <button 
                                onClick={onContinue} 
                                className={`bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-2 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all border-b-4 border-green-700 active:border-b-2 animate-guide-pulse`}
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
            </div>
        </div>
    );
};
