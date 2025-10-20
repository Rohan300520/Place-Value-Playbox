import React, { useState, useEffect } from 'react';
import type { SurfaceAreaChallengeQuestion } from '../../../types';

const Timer: React.FC<{ onTimeOut: () => void, status: string, duration: number, questionId: number }> = ({ onTimeOut, status, duration, questionId }) => {
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
    }, [status, onTimeOut, duration, questionId]);
    
    const percentage = (timeLeft / duration) * 100;
    let timerColor = 'bg-green-500';
    if (percentage < 50) timerColor = 'bg-yellow-400';
    if (percentage < 25) timerColor = 'bg-red-500';

    return (
        <div className="w-full bg-[var(--blueprint-input-bg)] rounded-full h-4 relative shadow-inner border" style={{ borderColor: 'var(--blueprint-border)'}}>
            <div 
                className={`h-full rounded-full transition-all duration-1000 linear ${timerColor}`}
                style={{ width: `${percentage}%`}}
            />
            <span className="absolute inset-0 text-center text-white font-bold text-sm">{timeLeft}s</span>
        </div>
    );
};

interface ChallengePanelProps {
    status: 'playing' | 'correct' | 'incorrect' | 'timed_out';
    question: SurfaceAreaChallengeQuestion;
    onNext: () => void;
    onTimeOut: () => void;
    onCheckAnswer: () => void;
    lastCalculatedValue: number | null;
    score: number;
    timeLimit: number;
}

export const ChallengePanel: React.FC<ChallengePanelProps> = ({ status, question, onNext, onTimeOut, onCheckAnswer, lastCalculatedValue, score, timeLimit }) => {
    const [part, setPart] = useState<'part1' | 'part2'>('part1');
    const [followUpAnswer, setFollowUpAnswer] = useState('');
    const [followUpStatus, setFollowUpStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

    useEffect(() => {
        setPart('part1');
        setFollowUpAnswer('');
        setFollowUpStatus('idle');
    }, [question.id]);

    useEffect(() => {
        if (status === 'correct' && question.followUp) {
            setPart('part2');
        }
    }, [status, question.followUp]);

    const handleCheckFollowUp = () => {
        const userAnswer = parseFloat(followUpAnswer);
        if (isNaN(userAnswer)) return;

        if (Math.abs(userAnswer - question.followUp!.answer) < (question.tolerance || 0.01)) {
            setFollowUpStatus('correct');
        } else {
            setFollowUpStatus('incorrect');
        }
    };

    let statusClasses = 'border-[var(--blueprint-accent)]';
    if (status === 'correct' || followUpStatus === 'correct') statusClasses = 'border-green-500 animate-celebrate';
    if ((status === 'incorrect' || status === 'timed_out') && part === 'part1') statusClasses = 'border-red-500 animate-shake';

    const showNextButton = (status === 'correct' && !question.followUp) ||
                           ((status === 'incorrect' || status === 'timed_out') && part === 'part1') ||
                           followUpStatus === 'correct';

    return (
        <div className={`w-full p-4 rounded-2xl border-2 ${statusClasses} transition-all duration-300 backdrop-blur-sm space-y-3`} style={{ backgroundColor: 'var(--blueprint-panel-bg)'}}>
            <div className="flex justify-between items-start gap-4">
                 <div className="flex-1">
                    <p className="text-xl font-bold font-display" style={{ color: 'var(--blueprint-accent)'}}>Challenge! <span className='capitalize' style={{ color: 'var(--blueprint-text-secondary)'}}>({question.level})</span></p>
                    <p className="text-lg mt-1" style={{ color: 'var(--blueprint-text-primary)'}}>{question.question}</p>
                    {question.contextInfo && (
                        <div className="mt-2 p-2 bg-black/20 rounded-md border border-white/20">
                            <p className="font-bold text-amber-400 mb-1">Given Information:</p>
                            {question.contextInfo.map((line, i) => (
                                <p key={i} className="text-sm font-mono text-amber-300">{line}</p>
                            ))}
                        </div>
                    )}
                 </div>
                 <div className="text-center">
                    <p className="text-xl font-bold font-display" style={{ color: 'var(--blueprint-accent)'}}>Score</p>
                    <p className="text-5xl font-black text-green-400">{score}</p>
                 </div>
            </div>

            {part === 'part2' && question.followUp && (
                <div className="mt-2 space-y-3 animate-pop-in">
                    <p className="text-lg font-bold" style={{ color: 'var(--blueprint-text-primary)'}}>{question.followUp.prompt}</p>
                    <div className="flex items-center gap-2">
                        {question.followUp.unit && <span className="text-2xl font-bold text-white">{question.followUp.unit}</span>}
                        <input 
                            type="number"
                            value={followUpAnswer}
                            onChange={e => setFollowUpAnswer(e.target.value)}
                            className="flex-grow p-2 text-lg font-mono rounded-md border-2"
                            style={{ backgroundColor: 'var(--blueprint-input-bg)', borderColor: 'var(--blueprint-border)', color: 'var(--blueprint-text-primary)' }}
                            disabled={followUpStatus === 'correct'}
                            placeholder="Enter your answer"
                        />
                        {followUpStatus !== 'correct' && (
                            <button onClick={handleCheckFollowUp} className="font-bold text-lg py-2 px-4 rounded-lg bg-[var(--btn-action-bg)] text-white border-b-4 border-[var(--btn-action-border)] hover:bg-[var(--btn-action-hover)] transition-all">Check</button>
                        )}
                    </div>
                    {followUpStatus === 'incorrect' && <div className="p-2 bg-red-500/20 border border-red-500/50 rounded-lg"><p className="text-red-300 font-bold text-center">Not quite, try again!</p></div>}
                    {followUpStatus === 'correct' && <div className="p-2 bg-green-500/20 border border-green-500/50 rounded-lg"><p className="text-green-300 font-bold text-center">Perfect! You solved the entire problem!</p></div>}
                </div>
            )}

            {(status === 'incorrect' || status === 'timed_out') && part === 'part1' && <div className="p-2 bg-red-500/20 border border-red-500/50 rounded-lg"><p className="text-red-300 font-bold text-center">{status === 'timed_out' ? 'Time is up! ' : 'That\'s not correct. '}The expected answer is {question.answer}.</p></div>}
            {status === 'correct' && part === 'part1' && !question.followUp && <div className="p-2 bg-green-500/20 border border-green-500/50 rounded-lg"><p className="text-green-300 font-bold text-center">Correct! Great job!</p></div>}
            
            <div className="mt-2 flex flex-col sm:flex-row justify-between items-center gap-2">
                 <div className="w-full sm:flex-[2]">
                    {status === 'playing' && part === 'part1' && <Timer onTimeOut={onTimeOut} status={status} duration={timeLimit} questionId={question.id}/>}
                </div>
                <div className="w-full sm:flex-[3] flex items-center justify-end gap-2">
                    {status === 'playing' && part === 'part1' && lastCalculatedValue !== null && (
                        <div className="flex items-center gap-2 p-2 rounded-md bg-black/20 text-white animate-pop-in">
                            <span className="text-sm font-semibold">Your Result:</span>
                            <span className="font-mono font-bold text-lg">{lastCalculatedValue.toFixed(2)}</span>
                        </div>
                    )}
                    {showNextButton ? (
                        <button onClick={onNext} className="w-full sm:w-auto text-white font-bold text-xl py-3 px-6 rounded-xl shadow-lg border-b-4 active:border-b-2 font-display bg-[var(--btn-help-bg)] border-[var(--btn-help-border)] hover:bg-[var(--btn-help-hover)] transition-all">Next Question</button>
                    ) : status === 'playing' && part === 'part1' ? (
                        <button onClick={onCheckAnswer} disabled={lastCalculatedValue === null} className="font-bold text-lg py-3 px-5 rounded-lg bg-[var(--btn-action-bg)] text-white border-b-4 border-[var(--btn-action-border)] hover:bg-[var(--btn-action-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">Check Answer</button>
                    ) : null}
                </div>
            </div>
        </div>
    );
};