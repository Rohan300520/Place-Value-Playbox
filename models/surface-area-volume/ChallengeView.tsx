import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { UserInfo, Difficulty, SurfaceAreaChallengeQuestion } from '../../types';
import { ShapeViewer } from './components/ShapeViewer';
import { ChallengePanel } from './components/ChallengePanel';
import { Confetti } from '../../components/Confetti';
import { logEvent, syncAnalyticsData } from '../../utils/analytics';

const DURATION_MAP: Record<Difficulty, number> = { easy: 90, medium: 60, hard: 45 };

interface ChallengeViewProps {
    currentUser: UserInfo | null;
    questions: SurfaceAreaChallengeQuestion[];
    difficulty: Difficulty;
    onComplete: () => void;
}

export const ChallengeView: React.FC<ChallengeViewProps> = ({ currentUser, questions, difficulty, onComplete }) => {
    const [questionIndex, setQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [status, setStatus] = useState<'playing' | 'correct' | 'incorrect' | 'timed_out'>('playing');
    const [userAnswer, setUserAnswer] = useState<string>('');
    const [showConfetti, setShowConfetti] = useState(false);
    const startTimeRef = useRef<number>(Date.now());

    const currentQuestion = useMemo(() => questions[questionIndex] || null, [questions, questionIndex]);

    const resetForNextQuestion = useCallback(() => {
        setUserAnswer('');
        setStatus('playing');
        setShowConfetti(false);
        startTimeRef.current = Date.now();
    }, []);

    const handleCheckAnswer = useCallback(async () => {
        if (!currentQuestion || status !== 'playing') return;

        const answerNum = parseFloat(userAnswer);
        if (isNaN(answerNum)) return;

        const tolerance = currentQuestion.tolerance || 0.01;
        const isCorrect = Math.abs(answerNum - currentQuestion.answer) <= tolerance;

        const durationSeconds = (Date.now() - startTimeRef.current) / 1000;
        await logEvent('challenge_attempt', currentUser, {
            model: 'surface_area_volume',
            questionId: currentQuestion.id,
            questionText: currentQuestion.question,
            level: difficulty,
            status: isCorrect ? 'correct' : 'incorrect',
            durationSeconds,
            userAnswer: answerNum,
            correctAnswer: currentQuestion.answer,
        });
        syncAnalyticsData();

        if (isCorrect) {
            setStatus('correct');
            setScore(s => s + 10);
            setShowConfetti(true);
        } else {
            setStatus('incorrect');
        }
    }, [currentQuestion, userAnswer, difficulty, currentUser, status]);

    const handleNext = useCallback(() => {
        if (questionIndex < questions.length - 1) {
            setQuestionIndex(i => i + 1);
            resetForNextQuestion();
        } else {
            onComplete();
        }
    }, [questionIndex, questions.length, onComplete, resetForNextQuestion]);

    const handleTimeOut = useCallback(async () => {
        if (!currentQuestion) return;
        setStatus('timed_out');
        await logEvent('challenge_attempt', currentUser, {
            model: 'surface_area_volume',
            questionId: currentQuestion.id,
            status: 'timed_out',
        });
        syncAnalyticsData();
    }, [currentQuestion, currentUser]);

    useEffect(() => {
        resetForNextQuestion();
    }, [currentQuestion, resetForNextQuestion]);

    if (!currentQuestion) {
        return <div className="text-xl text-center">Loading challenges...</div>;
    }
    
    return (
        <div className="w-full flex-grow flex flex-col lg:flex-row gap-4 animate-pop-in min-h-0">
            {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
            
            {/* Left Panel: 3D Viewer & Info */}
            <div className="w-full lg:w-2/3 flex flex-col gap-4">
                <div className="flex-grow rounded-2xl shadow-lg border relative min-h-[300px] sm:min-h-[400px] lg:min-h-0" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)' }}>
                    <ShapeViewer
                        shapeType={currentQuestion.shape}
                        dimensions={currentQuestion.dimensions}
                        isUnfolded={false}
                        renderMode="solid"
                        highlightPartId={null}
                    />
                </div>
                {currentQuestion.contextInfo && (
                    <div className="p-4 rounded-lg bg-gray-800/50 border border-sky-500/30">
                        <h3 className="font-bold text-sky-300 mb-2">Hints & Context</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-300">
                            {currentQuestion.contextInfo.map((info, i) => <li key={i}>{info}</li>)}
                        </ul>
                    </div>
                )}
            </div>

            {/* Right Panel: Challenge UI */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4">
                <ChallengePanel
                    question={currentQuestion}
                    status={status}
                    score={score}
                    timeLimit={DURATION_MAP[difficulty]}
                    onNext={handleNext}
                    onTimeOut={handleTimeOut}
                />
                <div className="p-4 rounded-2xl shadow-lg border space-y-4 flex-grow" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)' }}>
                    <label htmlFor="answer-input" className="block text-xl font-bold text-center" style={{ color: 'var(--text-secondary)' }}>
                        Your Answer {currentQuestion.unit && `(in ${currentQuestion.unit})`}
                    </label>
                    <input
                        id="answer-input"
                        type="number"
                        step="0.01"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Enter your answer"
                        disabled={status !== 'playing'}
                        className="w-full p-4 text-2xl text-center rounded-lg border-2 bg-gray-900/50 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition disabled:opacity-50"
                        style={{ borderColor: 'var(--border-primary)'}}
                    />
                    <button
                        onClick={handleCheckAnswer}
                        disabled={status !== 'playing' || !userAnswer}
                        className="w-full py-3 text-xl font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:bg-slate-800 disabled:cursor-not-allowed"
                    >
                        Submit Answer
                    </button>
                </div>
            </div>
        </div>
    );
};
