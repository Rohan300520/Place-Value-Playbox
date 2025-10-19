import React from 'react';
import type { FractionTrainingStep } from '../../../types';

interface TrainingGuideProps {
  currentStep: FractionTrainingStep | null;
  onComplete: () => void;
  feedback: string | null;
}

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

export const TrainingGuide: React.FC<TrainingGuideProps> = ({ currentStep, onComplete, feedback }) => {
    
    const renderContent = () => {
        // Render feedback as a non-intrusive banner at the top.
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

        // The completion message remains a popup to celebrate finishing the training.
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

        // Action steps are also rendered as a banner.
        return (
            <div className="w-full mb-4 sm:mb-6 backdrop-blur-sm border-2 p-4 sm:p-6 rounded-2xl shadow-xl text-xl sm:text-2xl font-bold text-center animate-pop-in"
                style={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    borderColor: 'rgba(56, 189, 248, 0.5)',
                    color: '#f1f5f9'
                }}
            >
                <p>{currentStep.text}</p>
            </div>
        );
    };

    return <>{renderContent()}</>;
};
