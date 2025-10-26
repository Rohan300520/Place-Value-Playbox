import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { Fraction, FractionState, Difficulty, FractionChallengeQuestion, UserInfo, WorkspacePiece, FractionTrainingStep, EquationState, FractionOperator } from '../../types';
import { Header } from '../../components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ModeSelector } from './components/ModeSelector';
import { DifficultySelector } from '../../components/DifficultySelector';
import { FractionChart } from './components/FractionWall';
import { CalculationWorkspace } from './components/CalculationWorkspace';
import { FractionChallengePanel } from './components/FractionChallengePanel';
import { OrderWorkspace } from './components/OrderWorkspace';
import { TrainingGuide } from './components/TrainingGuide';
import { Confetti } from '../../components/Confetti';
import { challenges } from './utils/challenges';
import { fractionTrainingPlan } from './utils/training';
import { logEvent, syncAnalyticsData } from '../../utils/analytics';
import { speak, cancelSpeech } from '../../utils/speech';
import { useAudio } from '../../contexts/AudioContext';
import { HelpModal } from './components/HelpModal';
import { CalculationStepsPanel } from './components/CalculationStepsPanel';
import { FractionControls } from './components/FractionControls';
import { EquationInfoPanel } from './components/EquationInfoPanel';
import { addFractions, subtractFractions, simplifyFraction, lcm, getFractionalValue, fractionsAreEqual } from './utils/fractions';
import { FractionPiece } from './components/FractionBlock';


const DURATION_MAP: Record<Difficulty, number> = { easy: 45, medium: 35, hard: 25 };

const EMPTY_EQUATION: EquationState = {
    terms: [{ fraction: null, pieces: [] }],
    operators: [],
    result: null,
    resultPieces: [],
    unsimplifiedResult: null,
    unsimplifiedResultPieces: [],
    isSolved: false,
};

export const FractionsApp: React.FC<{ onExit: () => void; currentUser: UserInfo | null }> = ({ onExit, currentUser }) => {
    const [gameState, setGameState] = useState<FractionState>('welcome');
    const [showHelp, setShowHelp] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isDropZoneActive, setIsDropZoneActive] = useState(false);
    
    // --- Audio & Sound Effects ---
    const { isSpeechEnabled } = useAudio();
    const useSimpleSound = (freq: number, duration: number) => useCallback(() => { /* sound implementation */ }, [freq, duration]);
    const playSuccessSound = useSimpleSound(1046, 0.2);
    const playErrorSound = useSimpleSound(220, 0.2);
    
    // --- Training State ---
    const [trainingStep, setTrainingStep] = useState(0);
    const [trainingWorkspacePieces, setTrainingWorkspacePieces] = useState<WorkspacePiece[]>([]);
    const [incorrectActionFeedback, setIncorrectActionFeedback] = useState<string | null>(null);
    const spokenStepsRef = useRef<Set<number>>(new Set());
    const currentTrainingStep = useMemo(() => fractionTrainingPlan.find(s => s.step === trainingStep) || null, [trainingStep]);

    // --- Explore Mode State ---
    const [equation, setEquation] = useState<EquationState>(EMPTY_EQUATION);
    
    // --- Challenge Mode State ---
    const [challengeStatus, setChallengeStatus] = useState<'playing' | 'correct' | 'incorrect' | 'timed_out'>('playing');
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [filteredQuestions, setFilteredQuestions] = useState<FractionChallengeQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const challengeStartTimeRef = useRef<number | null>(null);
    // User answers for different question types
    const [challengeAnswerPieces, setChallengeAnswerPieces] = useState<WorkspacePiece[]>([]);
    const [challengeAnswerIndex, setChallengeAnswerIndex] = useState<number | null>(null);
    const [challengeAnswerOrder, setChallengeAnswerOrder] = useState<Fraction[]>([]);
    
    const currentQuestion = useMemo(() => filteredQuestions[currentQuestionIndex] || null, [filteredQuestions, currentQuestionIndex]);

    const clearWorkspace = useCallback((forTraining: boolean) => {
        if (forTraining) {
            setTrainingWorkspacePieces([]);
        } else {
            setEquation(EMPTY_EQUATION);
            setChallengeAnswerPieces([]);
            setChallengeAnswerIndex(null);
            setChallengeAnswerOrder([]);
        }
    }, []);

    const advanceStep = useCallback(() => {
        const step = fractionTrainingPlan.find(s => s.step === trainingStep);
        if (step?.clearWorkspaceAfter) {
            clearWorkspace(true);
        }
        setIncorrectActionFeedback(null);
        setTrainingStep(t => t + 1);
    }, [trainingStep, clearWorkspace]);

    const handlePieceDragStart = (e: React.DragEvent<HTMLDivElement>, fraction: Fraction) => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('application/json', JSON.stringify(fraction));
        setIsDropZoneActive(true);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDropZoneActive(false);
        const fractionData = e.dataTransfer.getData('application/json');
        if (!fractionData) return;

        const fraction = JSON.parse(fractionData) as Fraction;
        const newPiece: WorkspacePiece = { id: `wp-${Date.now()}`, fraction, position: { x: 0, y: 0 }, state: 'idle' };

        if (gameState === 'training') {
            setTrainingWorkspacePieces(prev => [...prev, newPiece]);
        } else if (gameState === 'explore' && !equation.isSolved) {
            setEquation(prev => {
                const newTerms = [...prev.terms];
                const lastTermIndex = newTerms.length - 1;
                const currentTerm = newTerms[lastTermIndex];
                const newPieces = [...currentTerm.pieces, newPiece];
                const newFraction = addFractions(currentTerm.fraction, fraction);
                newTerms[lastTermIndex] = { fraction: newFraction, pieces: newPieces };
                return { ...prev, terms: newTerms };
            });
        } else if (gameState === 'challenge' && (currentQuestion?.type === 'add' || currentQuestion?.type === 'subtract')) {
            setChallengeAnswerPieces(prev => [...prev, newPiece]);
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
    
    const handleSetOperator = (op: FractionOperator) => {
        if (gameState === 'explore' && !equation.isSolved) {
             setEquation(prev => {
                const lastTerm = prev.terms[prev.terms.length - 1];
                if (lastTerm.fraction) {
                    return { ...prev, operators: [...prev.operators, op], terms: [...prev.terms, { fraction: null, pieces: [] }] };
                }
                return prev;
            });
        }
    }

    const handleSolveEquation = () => {
        // ... (existing explore mode solve logic)
    };

    const goBackToMenu = useCallback(() => {
        clearWorkspace(true);
        clearWorkspace(false);
        setGameState('mode_selection');
        spokenStepsRef.current.clear();
        setTrainingStep(0);
        cancelSpeech();
    }, [clearWorkspace]);
    
    // --- Challenge Logic ---
    const startChallenge = (selectedDifficulty: Difficulty) => {
        const questions = challenges.filter(q => q.level === selectedDifficulty);
        const shuffled = [...questions].sort(() => 0.5 - Math.random());
        setDifficulty(selectedDifficulty);
        setFilteredQuestions(shuffled);
        setCurrentQuestionIndex(0);
        setScore(0);
        clearWorkspace(false);
        setChallengeStatus('playing');
        setGameState('challenge');
        challengeStartTimeRef.current = Date.now();
    };

    const handleCheckAnswer = async () => {
        if (!currentQuestion) return;

        let isCorrect = false;
        let userAnswer: string | number;
        let correctAnswerString: string;
        const correctAnswer = currentQuestion.answer;
    
        switch (currentQuestion.type) {
            case 'add':
            case 'subtract': {
                const userAnswerFraction = challengeAnswerPieces.reduce((acc, piece) => addFractions(acc, piece.fraction), { numerator: 0, denominator: 1 });
                isCorrect = fractionsAreEqual(userAnswerFraction, correctAnswer as Fraction);
                userAnswer = `${userAnswerFraction.numerator}/${userAnswerFraction.denominator}`;
                const correctFraction = correctAnswer as Fraction;
                correctAnswerString = `${correctFraction.numerator}/${correctFraction.denominator}`;
                break;
            }
            case 'compare': {
                isCorrect = challengeAnswerIndex === correctAnswer;
                const userAnswerFraction = challengeAnswerIndex !== null ? currentQuestion.fractions[challengeAnswerIndex] : null;
                userAnswer = userAnswerFraction ? `${userAnswerFraction.numerator}/${userAnswerFraction.denominator}` : 'N/A';
                const correctFraction = currentQuestion.fractions[correctAnswer as number];
                correctAnswerString = `${correctFraction.numerator}/${correctFraction.denominator}`;
                break;
            }
            case 'order': {
                const correctOrder = correctAnswer as Fraction[];
                if (challengeAnswerOrder.length === correctOrder.length) {
                    isCorrect = challengeAnswerOrder.every((f, i) => fractionsAreEqual(f, correctOrder[i]));
                }
                userAnswer = challengeAnswerOrder.map(f => `${f.numerator}/${f.denominator}`).join(', ');
                correctAnswerString = correctOrder.map(f => `${f.numerator}/${f.denominator}`).join(', ');
                break;
            }
            default:
                userAnswer = 'N/A';
                correctAnswerString = 'N/A';
        }
    
        const durationSeconds = challengeStartTimeRef.current ? (Date.now() - challengeStartTimeRef.current) / 1000 : 0;
        await logEvent('challenge_attempt', currentUser, { 
            model: 'fractions', 
            questionId: currentQuestion.id, 
            questionText: currentQuestion.questionText,
            level: difficulty, 
            status: isCorrect ? 'correct' : 'incorrect', 
            durationSeconds,
            userAnswer,
            correctAnswer: correctAnswerString,
        });
        syncAnalyticsData();
        
        if (isCorrect) {
            playSuccessSound();
            setChallengeStatus('correct');
            setScore(prev => prev + 10);
            setShowConfetti(true);
        } else {
            playErrorSound();
            setChallengeStatus('incorrect');
        }
    };

    const handleNextChallenge = () => {
        clearWorkspace(false);
        setChallengeStatus('playing');
        if (currentQuestionIndex < filteredQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            challengeStartTimeRef.current = Date.now();
        } else {
            goBackToMenu();
        }
    };
    
    const handleTimeOut = async () => {
        if (!currentQuestion) return;
        
        let userAnswer: string | number;
        let correctAnswerString: string;
        const correctAnswer = currentQuestion.answer;

        switch (currentQuestion.type) {
            case 'add':
            case 'subtract': {
                const userAnswerFraction = challengeAnswerPieces.reduce((acc, piece) => addFractions(acc, piece.fraction), { numerator: 0, denominator: 1 });
                userAnswer = `${userAnswerFraction.numerator}/${userAnswerFraction.denominator}`;
                const correctFraction = correctAnswer as Fraction;
                correctAnswerString = `${correctFraction.numerator}/${correctFraction.denominator}`;
                break;
            }
            case 'compare': {
                const userAnswerFraction = challengeAnswerIndex !== null ? currentQuestion.fractions[challengeAnswerIndex] : null;
                userAnswer = userAnswerFraction ? `${userAnswerFraction.numerator}/${userAnswerFraction.denominator}` : 'N/A';
                const correctFraction = currentQuestion.fractions[correctAnswer as number];
                correctAnswerString = `${correctFraction.numerator}/${correctFraction.denominator}`;
                break;
            }
            case 'order': {
                userAnswer = challengeAnswerOrder.map(f => `${f.numerator}/${f.denominator}`).join(', ');
                const correctOrder = correctAnswer as Fraction[];
                correctAnswerString = correctOrder.map(f => `${f.numerator}/${f.denominator}`).join(', ');
                break;
            }
            default:
                userAnswer = 'N/A';
                correctAnswerString = 'N/A';
        }

        const durationSeconds = challengeStartTimeRef.current ? (Date.now() - challengeStartTimeRef.current) / 1000 : DURATION_MAP[difficulty];
        await logEvent('challenge_attempt', currentUser, { 
            model: 'fractions', 
            questionId: currentQuestion.id, 
            questionText: currentQuestion.questionText,
            level: difficulty, 
            status: 'timed_out',
            durationSeconds,
            userAnswer,
            correctAnswer: correctAnswerString,
        });
        syncAnalyticsData();
        playErrorSound();
        setChallengeStatus('timed_out');
    };

    const handleModeSelection = async (mode: FractionState) => {
        clearWorkspace(true); clearWorkspace(false);
        await logEvent('mode_start', currentUser, { model: 'fractions', mode });
        syncAnalyticsData();
        if (mode === 'challenge') {
            setGameState('challenge_difficulty_selection');
        } else {
            setGameState(mode);
            if (mode === 'training') {
                setTrainingStep(0);
                spokenStepsRef.current.clear();
            }
        }
    };
    
    const getSubtitle = () => {
        switch (gameState) {
            case 'training': return 'Training Mode';
            case 'explore': return 'Explore Mode';
            case 'challenge': return 'Challenge Mode';
            case 'challenge_difficulty_selection': return 'Select Difficulty';
            case 'mode_selection': return 'Choose a Mode';
            default: return null;
        }
    };
    
    const renderChallengeWorkspace = () => {
        if (!currentQuestion) return null;
        switch (currentQuestion.type) {
            case 'add':
            case 'subtract':
                return (
                    <>
                        <FractionChart onPieceDragStart={handlePieceDragStart} />
                        <CalculationWorkspace pieces={challengeAnswerPieces} onDrop={handleDrop} onDragOver={handleDragOver} isDropZoneActive={isDropZoneActive} />
                    </>
                );
            case 'compare':
                return (
                    <div className="w-full flex justify-around items-center gap-8 py-8 animate-pop-in">
                        {currentQuestion.fractions.map((f, i) => (
                            <div key={i} onClick={() => setChallengeAnswerIndex(i)} className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer ${challengeAnswerIndex === i ? 'bg-yellow-400/30 ring-4 ring-yellow-400' : 'hover:bg-white/10'}`}>
                                <FractionPiece fraction={f} />
                            </div>
                        ))}
                    </div>
                );
            case 'order':
                return <OrderWorkspace fractions={currentQuestion.fractions} onOrderChange={setChallengeAnswerOrder} orderDirection={currentQuestion.order!} />;
            default: return null;
        }
    }


    const renderMainContent = () => {
        switch(gameState) {
            case 'welcome': return <WelcomeScreen onStart={() => setGameState('mode_selection')} />;
            case 'mode_selection': return <ModeSelector onSelectMode={handleModeSelection} />;
            case 'challenge_difficulty_selection': return <DifficultySelector onSelectDifficulty={startChallenge} onBack={goBackToMenu} />;
            case 'training':
                return (
                    <div className="fractions-theme w-full flex-grow flex flex-col items-center justify-center p-4">
                        <div className="w-full max-w-4xl flex flex-col items-center animate-pop-in">
                            {currentTrainingStep && <TrainingGuide currentStep={currentTrainingStep} onComplete={goBackToMenu} onContinue={() => advanceStep()} incorrectActionFeedback={incorrectActionFeedback} />}
                            <FractionChart onPieceDragStart={handlePieceDragStart} spotlightOn={currentTrainingStep?.spotlightOn} />
                            <div className="w-full mt-4">
                                <CalculationWorkspace pieces={trainingWorkspacePieces} onDrop={handleDrop} onDragOver={handleDragOver} isDropZoneActive={isDropZoneActive} spotlightOn={currentTrainingStep?.spotlightOn} />
                            </div>
                        </div>
                    </div>
                );
            case 'explore':
                 return (
                    <div className="fractions-theme w-full flex-grow flex flex-col items-center justify-center p-4">
                        <div className="w-full max-w-4xl flex flex-col items-center animate-pop-in">
                            <EquationInfoPanel equation={equation} />
                            <FractionChart onPieceDragStart={handlePieceDragStart} />
                             <div className="w-full mt-4">
                               <CalculationWorkspace equation={equation} onDrop={handleDrop} onDragOver={handleDragOver} isDropZoneActive={isDropZoneActive} />
                                <FractionControls onOperatorSelect={handleSetOperator} onSolve={() => {}} onClear={() => clearWorkspace(false)} equation={equation}/>
                                {equation.isSolved && <CalculationStepsPanel equation={equation} isVisible={equation.isSolved} />}
                            </div>
                        </div>
                    </div>
                );
            case 'challenge':
                return (
                    <div className="fractions-theme w-full flex-grow flex flex-col items-center justify-center p-4">
                        <div className="w-full max-w-4xl flex flex-col items-center animate-pop-in">
                            {currentQuestion && <FractionChallengePanel question={currentQuestion} status={challengeStatus} onCheckAnswer={handleCheckAnswer} onNext={handleNextChallenge} onTimeOut={handleTimeOut} onClearAnswer={() => clearWorkspace(false)} score={score} timeLimit={DURATION_MAP[difficulty]} />}
                            {renderChallengeWorkspace()}
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <Header 
                onHelpClick={() => setShowHelp(true)} 
                currentUser={currentUser} 
                onExit={onExit}
                onBackToModelMenu={['welcome', 'mode_selection'].includes(gameState) ? undefined : goBackToMenu}
                modelTitle="Fraction Foundations"
                modelSubtitle={getSubtitle() ?? undefined}
            />
            <main className="flex-grow flex flex-col items-center justify-start p-2 sm:p-4 pt-8 sm:pt-12">
                {renderMainContent()}
            </main>
            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
            {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
        </div>
    );
};