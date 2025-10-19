import React from 'react';
import type { FractionTrainingStep } from '../../../types';

interface TrainingGuideProps {
  currentStep: FractionTrainingStep | null;
  onComplete: () => void;
  onContinue: () => void;
  feedback: string | null;
}

// The GuideBox is now only used for the final 'complete' message.
const GuideBox: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    return (
        <div className={`fixed backdrop-blur-sm border-2 p-4 sm:p-6 rounded-2xl shadow-xl text-xl sm:text-2xl font-bold max-w-sm sm:max-w-lg text-center animate-pop-in z-40 ${className}`}
          style={{ 
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            borderColor: 'rgba(56, 189, 248, 0.5)',
            color: '#f1f5f9',
          } as React.CSSProperties}
        >
           {children}
        </div>
    );
};

export const TrainingGuide: React.FC<TrainingGuideProps> = ({ currentStep, onComplete, onContinue, feedback }) => {
    
    const renderContent = () => {
        // Display timed feedback messages (from 'intro' and 'feedback' steps)
        if (feedback) {
            return (
                <div className="w-full mb-4 sm:mb-6 backdrop-blur-sm border-2 p-4 sm:p-6 rounded-2xl shadow-xl text-xl sm:text-2xl font-bold text-center animate-pop-in"
                    style={{ 
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        borderColor: 'rgba(56, 189, 248, 0.5)',
                        color: '#f1f5f9'
                    }}
                >
                    <p>{feedback}</p>
                </div>
            );
        }
        
        if (!currentStep) return null;

        // Handle the final completion popup.
        if (currentStep.type === 'complete') {
            return (
                <GuideBox className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <p className="text-5xl">🎓</p>
                    <p className="mt-4 text-4xl font-display">{currentStep.text}</p>
                    <button onClick={onComplete} className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all border-b-4 border-orange-700 active:border-b-2">
                        Back to Menu
                    </button>
                </GuideBox>
            );
        }

        // Handle all 'action' steps, including the special 'continue' action.
        // This renders instructions and the continue button in the top banner, not as a popup.
        if (currentStep.type === 'action') {
            return (
                <div className="w-full mb-4 sm:mb-6 backdrop-blur-sm border-2 p-4 sm:p-6 rounded-2xl shadow-xl text-xl sm:text-2xl font-bold text-center animate-pop-in flex flex-col sm:flex-row items-center justify-center gap-4"
                    style={{ 
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        borderColor: 'rgba(56, 189, 248, 0.5)',
                        color: '#f1f5f9'
                    }}
                >
                    <p className="flex-grow">{currentStep.text}</p>
                    {currentStep.requiredAction === 'continue' && (
                         <button 
                            onClick={onContinue} 
                            className={`flex-shrink-0 bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-2 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all border-b-4 border-green-700 active:border-b-2 ${currentStep.spotlightOn === 'continue_button' ? 'animate-guide-pulse' : ''}`}
                        >
                            Continue
                        </button>
                    )}
                </div>
            );
        }

        return null;
    };

    return <>{renderContent()}</>;
};