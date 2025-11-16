import React, { useState, useEffect, memo } from 'react';
import type { SurfaceAreaChallengeQuestion } from '../../../types';
import { useAudio } from '../../../contexts/AudioContext';
import { speak, cancelSpeech } from '../../../utils/speech';

const Timer: React.FC<{ duration: number, onTimeOut: () => void, status: string, questionId: number }> = memo(({ duration, onTimeOut, status, questionId }) => {
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
    }, [status, duration, onTimeOut, questionId]);
    
    const percentage = (timeLeft / duration) * 100;
    let timerColor = 'bg-green-500';
    if (percentage < 50) timerColor = 'bg-yellow-400';
    if (percentage < 25) timerColor = 'bg-red-500';

    return (
        <div className="w-full bg-gray-700/80 rounded-full h-4 relative shadow-inner">
            <div 
                className={`h-4 rounded-full transition-all duration-1000 linear ${timerColor}`}
                style={{ width: `${percentage}%`}}
            />
            <span className="absolute inset-0 text-center text-gray-900 font-bold text-sm">{timeLeft}s</span>
        </div>
    );
});

interface ChallengePanelProps {
    question: SurfaceAreaChallengeQuestion;
    status: 'playing' | 'correct' | 'incorrect' | 'timed_out';
    score: number;
    timeLimit: number;
    onNext: () => void;
    onTimeOut: () => void;
}

export const ChallengePanel: React.FC<ChallengePanelProps> = ({ question, status, score, timeLimit, onNext, onTimeOut }) => {
    const { isSpeechEnabled } = useAudio();

    useEffect(() => {
        if (isSpeechEnabled && question) {
            cancelSpeech();
            speak(question.question, 'en-US');
        }
        return () => cancelSpeech();
    }, [question, isSpeechEnabled]);

    let statusClasses = 'border-sky-400/80 shadow-sky-400/20';
    if (status === 'correct') statusClasses = 'border-green-500 shadow-green-500/40 animate-celebrate';
    if (status === 'incorrect' || status === 'timed_out') statusClasses = 'border-red-500 shadow-red-500/40 animate-shake';

    return (
        <div className={`p-4 rounded-2xl border-2 ${statusClasses} shadow-lg transition-all duration-500`} style={{ backgroundColor: 'var(--panel-bg)'}}>
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <img src="/assets/geo-bot.svg" alt="Geo-Bot" className="w-12 h-12" />
                        <p className="text-xl font-semibold">{question.question}</p>
                    </div>
                    {status === 'incorrect' && (
                        <div className="mt-2 p-2 bg-red-900/50 border border-red-500 rounded-lg">
                            <p className="text-red-300 font-bold text-center">Not quite! The correct answer is {question.answer}{question.unit}.</p>
                        </div>
                    )}
                    {status === 'timed_out' && (
                         <div className="mt-2 p-2 bg-yellow-900/50 border border-yellow-500 rounded-lg">
                            <p className="text-yellow-300 font-bold text-center">Time's up! The correct answer was {question.answer}{question.unit}.</p>
                        </div>
                    )}
                    {status === 'correct' && (
                         <div className="mt-2 p-2 bg-green-900/50 border border-green-500 rounded-lg">
                            <p className="text-green-300 font-bold text-center">Correct! Well done!</p>
                        </div>
                    )}
                </div>
                <div className="text-center flex-shrink-0">
                    <p className="text-lg font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>Score</p>
                    <p className="text-5xl font-black text-green-400">{score}</p>
                </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-1/2">
                    {status === 'playing' && <Timer duration={timeLimit} onTimeOut={onTimeOut} status={status} questionId={question.id} />}
                </div>
                {status !== 'playing' && (
                    <button onClick={onNext} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all border-b-4 border-blue-700 active:border-b-2">
                        Next
                    </button>
                )}
            </div>
        </div>
    );
};
