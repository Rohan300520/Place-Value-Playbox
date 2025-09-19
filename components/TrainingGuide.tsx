import React from 'react';
import { NumberBlock } from './NumberBlock';
import type { TrainingStep, PlaceValueCategory, BlockValue } from '../types';


interface TrainingGuideProps {
  currentStepConfig: TrainingStep | null;
  columnCounts: { [key in PlaceValueCategory]: number };
  onComplete: () => void;
  feedback: string | null;
}

const GuideBox: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    return (
        <div className={`fixed backdrop-blur-sm border-2 p-4 sm:p-6 rounded-2xl shadow-xl text-xl sm:text-2xl font-bold max-w-sm sm:max-w-lg text-center animate-pop-in z-30 ${className}`}
          style={{ 
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            borderColor: 'rgba(56, 189, 248, 0.5)',
            color: '#f1f5f9',
            '--guide-box-bg': 'rgba(30, 41, 59, 0.95)'
          } as React.CSSProperties}
        >
           {children}
        </div>
    )
};

const FeedbackBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500/95 border-4 border-white/50 p-6 sm:p-8 rounded-2xl shadow-xl text-2xl sm:text-4xl font-black text-white animate-tada z-40 flex items-center gap-4 font-display">
        {children}
    </div>
);

const GhostBlock: React.FC<{ value: number }> = ({ value }) => {
    let animationClass = '';
    switch(value) {
        case 1: animationClass = 'animate-ghost-move-one'; break;
        case 10: animationClass = 'animate-ghost-move-ten'; break;
        case 100: animationClass = 'animate-ghost-move-hundred'; break;
        case 1000: animationClass = 'animate-ghost-move-thousand'; break;
    }
    return (
        <div className={animationClass}>
            <NumberBlock value={value as BlockValue} isDraggable={false} />
        </div>
    );
};

const colorSpan = (text: string) => {
    if (text.includes("'1'")) return <span className="text-sky-400">{text}</span>;
    if (text.includes("'10'")) return <span className="text-emerald-400">{text}</span>;
    if (text.includes("'100'")) return <span className="text-amber-400">{text}</span>;
    if (text.includes("'1000'")) return <span className="text-purple-400">{text}</span>;
    return text;
};

const colorMap = {
    ones: 'text-sky-400',
    tens: 'text-emerald-400',
    hundreds: 'text-amber-400',
    thousands: 'text-purple-400',
};

export const TrainingGuide: React.FC<TrainingGuideProps> = ({ currentStepConfig, columnCounts, onComplete, feedback }) => {
    
    const renderContent = () => {
        if (feedback) {
            return <FeedbackBox>{feedback}</FeedbackBox>
        }

        if (!currentStepConfig) return null;

        switch (currentStepConfig.type) {
            case 'action':
            case 'action_multi': {
                const column = currentStepConfig.column;
                if (!column) return null; 

                // Position the guide box statically at the bottom-center of the screen. This predictable position
                // prevents it from ever overlapping with the columns or source blocks.
                const positionClass = 'bottom-28 left-1/2 -translate-x-1/2';
                
                return (
                    <>
                        {currentStepConfig.source && <GhostBlock value={currentStepConfig.source} />}
                        <GuideBox className={`${positionClass} max-w-sm sm:max-w-md`}>
                            <p>{colorSpan(currentStepConfig.text)}</p>
                            {currentStepConfig.type === 'action_multi' && currentStepConfig.count && (
                                <div className={`mt-2 text-3xl font-black ${colorMap[column]} tabular-nums font-display`}>
                                    {columnCounts[column]} / {currentStepConfig.count}
                                </div>
                            )}
                        </GuideBox>
                    </>
                );
            }
            case 'magic_feedback': {
                let positionClass = 'top-[15vh]';
                switch (currentStepConfig.targetColumn) {
                    case 'thousands':
                        positionClass += ' left-[12.5%] -translate-x-1/2';
                        break;
                    case 'hundreds':
                        positionClass += ' left-[37.5%] -translate-x-1/2';
                        break;
                    case 'tens':
                        positionClass += ' left-[62.5%] -translate-x-1/2';
                        break;
                    default:
                        positionClass = 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
                }
                return (
                    <GuideBox className={`${positionClass} guide-box-arrow`}>
                        <p className="font-display text-3xl">{currentStepConfig.text}</p>
                    </GuideBox>
                );
            }
            case 'complete':
                 return (
                    <GuideBox className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <p className="text-5xl">🎓</p>
                        <p className="mt-4 text-4xl font-display">{currentStepConfig.text}</p>
                        <button onClick={onComplete} className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all border-b-4 border-orange-700 active:border-b-2">
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
        {renderContent()}
       </>
    );
};