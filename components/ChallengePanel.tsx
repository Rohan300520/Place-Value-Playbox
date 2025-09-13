import React, { useState, useEffect } from 'react';
import type { ChallengeQuestion } from '../types';

interface ChallengePanelProps {
  question: ChallengeQuestion | null;
  score: number;
  status: 'playing' | 'correct' | 'incorrect' | 'timed_out';
  onCheck: () => void;
  onNext: () => void;
  onTimeOut: () => void;
  correctAnswer: number | null;
  timeLimit: number;
}

const Timer: React.FC<{ onTimeOut: () => void, status: string, duration: number }> = ({ onTimeOut, status, duration }) => {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (status !== 'playing') {
            return;
        }

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
    let timerColor = 'bg-green-500';
    if (percentage < 50) timerColor = 'bg-yellow-500';
    if (percentage < 25) timerColor = 'bg-red-500';


    return (
        <div className="w-full bg-slate-700 rounded-full h-4 my-2 relative">
            <div 
                className={`h-4 rounded-full transition-all duration-1000 linear ${timerColor}`}
                style={{ width: `${percentage}%`}}
            ></div>
            <span className="absolute inset-0 text-center text-white font-bold text-sm">{timeLeft}s</span>
        </div>
    )
}

export const ChallengePanel: React.FC<ChallengePanelProps> = ({ question, score, status, onCheck, onNext, onTimeOut, correctAnswer, timeLimit }) => {
    
    let statusClasses = 'border-sky-400/30 shadow-sky-500/20';
    if(status === 'correct') statusClasses = 'border-green-400 shadow-green-400/40 animate-celebrate';
    if(status === 'incorrect' || status === 'timed_out') statusClasses = 'border-red-400 shadow-red-400/40 animate-shake';

    if (!question) {
        return <div>Loading challenges...</div>;
    }

    return (
        <div className={`bg-slate-800/50 backdrop-blur-md rounded-2xl border ${statusClasses} shadow-lg p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col justify-between items-center w-full transition-all duration-500 min-h-[150px]`}>
            <div className="flex justify-between w-full items-start gap-4">
                <div className="flex-1 text-left">
                    <span className="text-md sm:text-lg font-bold text-sky-300 uppercase tracking-wider">Level {question.level}</span>
                    <p className="text-lg sm:text-xl font-semibold text-white mt-1">{question.question}</p>
                     {(status === 'incorrect' || status === 'timed_out') && correctAnswer !== null && (
                         <div className="mt-2 p-2 bg-red-900/50 border border-red-500 rounded-lg">
                             <p className="text-red-300 font-bold text-center">
                                {status === 'timed_out' && 'Time is up! '}Correct Answer: {correctAnswer}
                             </p>
                         </div>
                     )}
                </div>
                <div className="text-center">
                    <span className="text-md sm:text-xl font-bold text-sky-300 uppercase tracking-wider">Score</span>
                    <div className="text-4xl sm:text-5xl font-black text-emerald-400 tabular-nums tracking-tighter" style={{ textShadow: '0 0 10px #34d399' }}>
                        {score}
                    </div>
                </div>
            </div>

            <div className="w-full flex flex-col sm:flex-row items-center justify-between mt-2 gap-4">
                 <div className="w-full sm:w-1/2">
                    {status === 'playing' && <Timer onTimeOut={onTimeOut} status={status} duration={timeLimit} />}
                 </div>
                 <div className="mt-3 sm:mt-0">
                    {status === 'correct' || status === 'incorrect' || status === 'timed_out' ? (
                         <button onClick={onNext} className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-xl shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-all text-base sm:text-lg">
                            Next Challenge!
                         </button>
                    ) : (
                        <button onClick={onCheck} disabled={status !== 'playing'} className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 disabled:shadow-none text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-xl shadow-lg shadow-emerald-500/30 transform hover:scale-105 transition-all text-base sm:text-lg">
                            Check Answer
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};