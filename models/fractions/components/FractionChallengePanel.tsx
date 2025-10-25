import React, { useState, useEffect } from 'react';
import type { FractionChallengeQuestion } from '../../../types';
// Fix: The component exported from './FractionBlock' is named `FractionPiece`. Aliasing it to `FractionBlock` to match its usage in this file.
import { FractionPiece as FractionBlock } from './FractionBlock';

const Timer: React.FC<{ onTimeOut: () => void, status: string, duration: number }> = ({ onTimeOut, status, duration }) => {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (status !== 'playing') return;

        setTimeLeft(duration);
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onTimeOut();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [status, onTimeOut, duration]);
    
    const percentage = (timeLeft / duration) * 100;
    let timerColor = 'bg-green-400';
    if (percentage < 50) timerColor = 'bg-yellow-400';
    if (percentage < 25) timerColor = 'bg-red-500';

    return (
        <div className="w-full bg-slate-700/80 rounded-full h-4 relative shadow-inner">
            <div 
                className={`h-4 rounded-full transition-all duration-1000 linear ${timerColor}`}
                style={{ width: `${percentage}%`}}
            />
            <span className="absolute inset-0 text-center text-slate-900 font-bold text-sm">{timeLeft}s</span>
        </div>
    );
};

interface FractionChallengePanelProps {
    status: 'playing' | 'correct' | 'incorrect' | 'timed_out';
    question: FractionChallengeQuestion;
    onCheckAnswer: () => void;
    onNext: () => void;
    onTimeOut: () => void;
    onClearAnswer: () => void;
    score: number;
    timeLimit: number;
}

export const FractionChallengePanel: React.FC<FractionChallengePanelProps> = ({ status, question, onCheckAnswer, onNext, onTimeOut, onClearAnswer, score, timeLimit }) => {
    let statusClasses = 'border-chalk-cyan/80';
    if(status === 'correct') statusClasses = 'border-chalk-green/80 animate-celebrate';
    if(status === 'incorrect' || status === 'timed_out') statusClasses = 'border-chalk-red/80 animate-shake';

    return (
        <div className={`w-full mb-4 p-4 rounded-2xl border-2 ${statusClasses} transition-all duration-300 chalk-bg`}>
            <div className="flex justify-between items-start gap-4">
                 <div className="flex-1">
                    <p className="text-2xl font-chalk text-chalk-yellow">Challenge! <span className='capitalize text-chalk-light'>({question.level})</span></p>
                    <div className="flex items-center justify-center gap-2 sm:gap-4 my-3 text-chalk-light">
                        <FractionBlock fraction={question.term1} />
                        <span className="text-4xl font-chalk">{question.operator}</span>
                        <FractionBlock fraction={question.term2} />
                        <span className="text-4xl font-chalk">= ?</span>
                    </div>
                    {(status === 'incorrect' || status === 'timed_out') && (
                        <div className="mt-2 p-2 bg-red-900/50 border border-red-500 rounded-lg">
                            <p className="text-red-300 font-bold text-center font-chalk">
                               {status === 'timed_out' ? 'Time is up! ' : 'Not quite! '}The correct answer is {question.answer.numerator}/{question.answer.denominator}.
                            </p>
                        </div>
                    )}
                     {status === 'correct' && (
                        <div className="mt-2 p-2 bg-green-900/50 border border-green-500 rounded-lg">
                            <p className="text-green-300 font-bold text-center font-chalk">
                               Correct! Great job!
                            </p>
                        </div>
                    )}
                 </div>
                 <div className="text-center">
                    <p className="text-xl font-chalk text-chalk-yellow">Score</p>
                    <p className="text-5xl font-chalk text-chalk-green">{score}</p>
                 </div>
            </div>

            <div className="w-full flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                <div className="w-full sm:w-1/2">
                    {status === 'playing' && <Timer onTimeOut={onTimeOut} status={status} duration={timeLimit} />}
                </div>
                <div className="flex items-center gap-4">
                    {status === 'playing' ? (
                        <>
                           <button 
                                onClick={onClearAnswer}
                                className="control-button bg-amber-600 border-amber-800 hover:bg-amber-500"
                            >
                                Clear
                            </button>
                            <button 
                                onClick={onCheckAnswer}
                                className="control-button bg-green-600 border-green-800 hover:bg-green-500"
                            >
                                Check Answer
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={onNext}
                            className="control-button bg-sky-600 border-sky-800 hover:bg-sky-500"
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};