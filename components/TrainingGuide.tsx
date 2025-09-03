import React from 'react';
import { NumberBlock } from './NumberBlock';
import type { TrainingStep, PlaceValueCategory } from '../types';

interface TrainingGuideProps {
  currentStepConfig: TrainingStep | null;
  columnCounts: { [key in PlaceValueCategory]: number };
  onComplete: () => void;
  feedback: string | null;
}

const GuideBox: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    return (
        <div className={`fixed bg-slate-200/95 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl text-xl sm:text-2xl font-bold text-slate-700 max-w-sm sm:max-w-lg text-center animate-pop-in z-30 ${className}`}>
           {children}
        </div>
    )
};

const FeedbackBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-100 border-4 border-green-400 p-6 sm:p-8 rounded-2xl shadow-xl text-2xl sm:text-4xl font-black text-green-700 animate-tada z-40 flex items-center gap-4">
        {children}
    </div>
);

const GhostBlock: React.FC<{ value: number }> = ({ value }) => {
    let animationClass = '';
    switch(value) {
        case 1: animationClass = 'animate-ghost-move-one'; break;
        case 10: animationClass = 'animate-ghost-move-ten'; break;
        case 100: animationClass = 'animate-ghost-move-hundred'; break;
    }
    return (
        <div className={animationClass}>
            <NumberBlock value={value as 1|10|100} isDraggable={false} />
        </div>
    );
};

const colorSpan = (text: string) => {
    if (text.includes("'1'")) return <span className="text-sky-600">{text}</span>
    if (text.includes("'10'")) return <span className="text-emerald-600">{text}</span>
    if (text.includes("'100'")) return <span className="text-amber-600">{text}</span>
    return text;
};

const colorMap = {
    ones: 'text-sky-500',
    tens: 'text-emerald-500',
    hundreds: 'text-amber-500',
};

export const TrainingGuide: React.FC<TrainingGuideProps> = ({ currentStepConfig, columnCounts, onComplete, feedback }) => {
    
    const renderContent = () => {
        if (feedback) {
            return <FeedbackBox>{feedback}</FeedbackBox>
        }
        
        if (!currentStepConfig) return null;

        switch (currentStepConfig.type) {
            case 'action':
            case 'action_multi':
                const column = currentStepConfig.column!;
                return (
                    <>
                        <GhostBlock value={currentStepConfig.source!} />
                        <GuideBox className="bottom-4 right-4 sm:bottom-6 sm:right-6 w-[80vw] max-w-xs text-left guide-box-arrow">
                            <p>{colorSpan(currentStepConfig.text)}</p>
                            {currentStepConfig.type === 'action_multi' && (
                                <div className={`mt-4 text-4xl font-black ${colorMap[column]} tabular-nums`}>
                                    {columnCounts[column]} / {currentStepConfig.count}
                                </div>
                            )}
                        </GuideBox>
                    </>
                );
            case 'magic_feedback': {
                let positionClass = '';
                switch (currentStepConfig.targetColumn) {
                    case 'tens':
                        // Center on mobile, middle column on desktop
                        positionClass = 'top-[15vh] left-1/2 -translate-x-1/2';
                        break;
                    case 'hundreds':
                        // Center on mobile, left column on desktop
                        positionClass = 'top-[15vh] left-1/2 lg:left-[16.66%] -translate-x-1/2';
                        break;
                    default:
                        // Fallback to center if no target is specified
                        positionClass = 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
                }
                return (
                    <GuideBox className={`${positionClass} guide-box-arrow`}>
                        <p>{currentStepConfig.text}</p>
                    </GuideBox>
                );
            }
            case 'complete':
                 return (
                    <GuideBox className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <p className="text-5xl">🎓</p>
                        <p className="mt-4 text-4xl">{currentStepConfig.text}</p>
                        <button onClick={onComplete} className="mt-6 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold text-xl py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all">
                            Back to Menu
                        </button>
                    </GuideBox>
                )
            default:
                return null;
        }
    }

    return (
       <>
        <div className="fixed inset-0 bg-black/60 z-10" />
        {renderContent()}
       </>
    );
};