import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { Fraction, FractionState, Difficulty, FractionChallengeQuestion, UserInfo, WorkspacePiece, FractionTrainingStep, EquationState, FractionOperator } from '../../types';
import { Header } from '../../components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { FractionIntroScreen } from './components/FractionIntroScreen';
import { ModeSelector } from './components/ModeSelector';
import { DifficultySelector } from '../../components/DifficultySelector';
import { FractionChart } from './components/FractionWall';
import { CalculationWorkspace } from './components/CalculationWorkspace';
import { CompareWorkspace } from './components/CompareWorkspace';
import { FractionChallengePanel } from './components/FractionChallengePanel';
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
import { OrderWorkspace } from './components/OrderWorkspace';
import { addFractions, subtractFractions, simplifyFraction, lcm, getFractionalValue, fractionsAreEqual } from './utils/fractions';


const DURATION_MAP: Record<Difficulty, number> = { easy: 60, medium: 45, hard: 30 };

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
    const [draggedWorkspacePieceId, setDraggedWorkspacePieceId] = useState<string | null>(null);
    
    // Training State
    const [trainingStep, setTrainingStep] = useState(0);
    const [workspacePieces, setWorkspacePieces] = useState<WorkspacePiece[]>([]); // Only for training
    const [incorrectActionFeedback, setIncorrectActionFeedback] = useState<string | null>(null);
    const spokenStepsRef = useRef<Set<number>>(new Set());
    const { isSpeechEnabled } = useAudio();
    const currentTrainingStep = useMemo(() => fractionTrainingPlan.find(s => s.step === trainingStep) || null, [trainingStep]);

    // Explore Mode State
    const [equation, setEquation] = useState<EquationState>(EMPTY_EQUATION);
    
    // Challenge Mode State
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [questions, setQuestions] = useState<FractionChallengeQuestion[]>([]);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [challengeStatus, setChallengeStatus] = useState<'playing' | 'correct' | 'incorrect' | 'timed_out'>('playing');
    const [score, setScore] = useState(0);
    const [userAnswer, setUserAnswer] = useState<Fraction | Fraction[] | number | null>(null);
    const challengeStartTimeRef = useRef<number | null>(null);
    const currentQuestion = useMemo(() => questions[questionIndex] || null, [questions, questionIndex]);

    const clearWorkspace = useCallback((forTraining: boolean) => {
        if (forTraining) {
            setWorkspacePieces([]);
        } else {
            setEquation(EMPTY_EQUATION);
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

    const handleWorkspacePieceDragStart = (e: React.DragEvent<HTMLDivElement>, pieceId: string) => {
        e.dataTransfer.setData('application/x-workspace-piece', pieceId);
        e.dataTransfer.effectAllowed = "move";
        setDraggedWorkspacePieceId(pieceId);
    };

    const handleWorkspacePieceDragEnd = () => {
        setDraggedWorkspacePieceId(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDropZoneActive(false);
        const fractionData = e.dataTransfer.getData('application/json');
        if (!fractionData) return;

        const fraction = JSON.parse(fractionData) as Fraction;
        const newPiece: WorkspacePiece = {
            id: `wp-${Date.now()}`,
            fraction,
            position: { x: 0, y: 0 },
            state: 'idle',
        };

        if (gameState === 'training') {
            setWorkspacePieces(prev => [...prev, newPiece]);
        } else if ((gameState === 'explore' || gameState === 'challenge') && !equation.isSolved) {
            setEquation(prev => {
                const newTerms = [...prev.terms];
                const lastTermIndex = newTerms.length - 1;
                const currentTerm = newTerms[lastTermIndex];
                
                const newPieces = [...currentTerm.pieces, newPiece];
                const newFraction = addFractions(currentTerm.fraction, fraction);
                
                newTerms[lastTermIndex] = { fraction: newFraction, pieces: newPieces };

                return { ...prev, terms: newTerms };
            });
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const removePieceFromEquation = (pieceId: string) => {
        setEquation(prev => {
            const newTerms = prev.terms.map(term => {
                if (!term.pieces.some(p => p.id === pieceId)) {
                    return term;
                }
    
                const newPieces = term.pieces.filter(p => p.id !== pieceId);
                const newFraction = newPieces.length > 0
                    ? newPieces.reduce((acc: Fraction | null, currentPiece) => addFractions(acc, currentPiece.fraction), null)
                    : null;
    
                return { ...term, pieces: newPieces, fraction: newFraction };
            });
            return { ...prev, terms: newTerms };
        });
    };
    
    const handleDropOnBackground = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const pieceId = e.dataTransfer.getData('application/x-workspace-piece');
        if (pieceId) {
            removePieceFromEquation(pieceId);
        }
        setIsDropZoneActive(false);
    };
    
    const handleSetOperator = (op: FractionOperator) => {
        if (gameState === 'explore' && !equation.isSolved) {
             setEquation(prev => {
                const lastTerm = prev.terms[prev.terms.length - 1];
                if (lastTerm.fraction) {
                    return {
                        ...prev,
                        operators: [...prev.operators, op],
                        terms: [...prev.terms, { fraction: null, pieces: [] }],
                    };
                }
                return prev;
            });
        }
    }

    const handleSolveEquation = () => {
        if (gameState !== 'explore' || equation.terms.length < 2 || equation.isSolved) return;

        const { terms, operators } = equation;
        
        if (!terms[terms.length - 1].fraction) return;

        let currentResult = terms[0].fraction!;
        
        for (let i = 0; i < operators.length; i++) {
            const nextTerm = terms[i + 1].fraction!;
            if (operators[i] === '+') {
                currentResult = addFractions(currentResult, nextTerm);
            } else {
                currentResult = subtractFractions(currentResult, nextTerm);
            }
        }

        const unsimplifiedResult: Fraction = currentResult;
        const finalResult = simplifyFraction(unsimplifiedResult);
        
        const resultPieces: WorkspacePiece[] = [];
        if (finalResult.numerator > 0) {
             // For improper fractions, create whole pieces and a remainder piece
            const wholeParts = Math.floor(finalResult.numerator / finalResult.denominator);
            const remainderNum = finalResult.numerator % finalResult.denominator;

            for (let i = 0; i < wholeParts; i++) {
                resultPieces.push({ id: `result-whole-${i}`, fraction: { numerator: 1, denominator: 1 }, position: { x: 0, y: 0 } });
            }
            if (remainderNum > 0) {
                resultPieces.push({ id: `result-rem-${Date.now()}`, fraction: { numerator: remainderNum, denominator: finalResult.denominator }, position: { x: 0, y: 0 } });
            }
        }

        setEquation(prev => ({ ...prev, isSolved: true, unsimplifiedResult, result: finalResult, resultPieces }));
    };

    const goBackToMenu = useCallback(() => {
        clearWorkspace(true);
        clearWorkspace(false);
        setGameState('mode_selection');
        spokenStepsRef.current.clear();
        setTrainingStep(0);
        cancelSpeech();
    }, [clearWorkspace]);

    const handleBarClick = useCallback((clickedFraction: Fraction) => {
        if (gameState !== 'training' || !currentTrainingStep) return;
        if (currentTrainingStep.type === 'action' && currentTrainingStep.requiredAction === 'click_bar') {
            if (fractionsAreEqual(clickedFraction, currentTrainingStep.requiredValue as Fraction)) {
                setIncorrectActionFeedback(null);
                advanceStep();
            } else {
                setIncorrectActionFeedback("That's not the longer one. Try again!");
                setTimeout(() => setIncorrectActionFeedback(null), 2500);
            }
        }
    }, [gameState, currentTrainingStep, advanceStep]);
    
    const handleSolveTraining = () => {
        if (gameState === 'training' && currentTrainingStep?.requiredAction === 'solve') {
            const solvedEquation: EquationState = {
                terms: [
                    { fraction: { numerator: 1, denominator: 3 }, pieces: [] },
                    { fraction: { numerator: 1, denominator: 6 }, pieces: [] }
                ],
                operators: ['+'],
                unsimplifiedResult: { numerator: 3, denominator: 6 },
                result: { numerator: 1, denominator: 2 },
                resultPieces: [{ id: `result-${Date.now()}`, fraction: { numerator: 1, denominator: 2 }, position: { x: 0, y: 0 } }],
                isSolved: true,
            };
            setEquation(solvedEquation);
            advanceStep();
        }
    };
    
    // --- Challenge Logic ---

    const startChallenge = useCallback((diff: Difficulty) => {
        const filtered = challenges.filter(q => q.level === diff);
        setQuestions([...filtered].sort(() => Math.random() - 0.5));
        setDifficulty(diff);
        setQuestionIndex(0);
        setScore(0);
        setChallengeStatus('playing');
        setUserAnswer(null);
        clearWorkspace(false);
        setGameState('challenge');
        challengeStartTimeRef.current = Date.now();
    }, [clearWorkspace]);

    const handleCheckAnswer = useCallback(async () => {
        if (!currentQuestion) return;

        let isCorrect = false;
        const answer = currentQuestion.answer;
        let finalUserAnswer: Fraction | Fraction[] | number | null = userAnswer;

        if (currentQuestion.type === 'add' || currentQuestion.type === 'subtract') {
            const workspaceAnswer = simplifyFraction(equation.terms[0].fraction || { numerator: 0, denominator: 1 });
            finalUserAnswer = workspaceAnswer;
            isCorrect = fractionsAreEqual(workspaceAnswer, answer as Fraction);
        } else if (currentQuestion.type === 'compare') {
            isCorrect = userAnswer === answer;
            if (typeof userAnswer === 'number' && userAnswer >= 0 && userAnswer < currentQuestion.fractions.length) {
                finalUserAnswer = currentQuestion.fractions[userAnswer];
            }
        } else if (currentQuestion.type === 'order') {
            const orderedAnswer = answer as Fraction[];
            const orderedUserAnswer = userAnswer as Fraction[];
            if (orderedUserAnswer.length === orderedAnswer.length) {
                isCorrect = orderedUserAnswer.every((f, i) => fractionsAreEqual(f, orderedAnswer[i]));
            }
        }

        const durationSeconds = challengeStartTimeRef.current ? (Date.now() - challengeStartTimeRef.current) / 1000 : 0;
        await logEvent('challenge_attempt', currentUser, {
            model: 'fractions', questionId: currentQuestion.id, questionText: currentQuestion.questionText,
            level: difficulty, status: isCorrect ? 'correct' : 'incorrect', durationSeconds,
            userAnswer: JSON.stringify(finalUserAnswer), correctAnswer: JSON.stringify(answer),
        });

        if (isCorrect) {
            setChallengeStatus('correct');
            setScore(s => s + 10);
            setShowConfetti(true);
        } else {
            setChallengeStatus('incorrect');
        }
    }, [currentQuestion, userAnswer, equation.terms, currentUser, difficulty]);
    
    const handleNextChallenge = useCallback(() => {
        if (questionIndex < questions.length - 1) {
            setQuestionIndex(i => i + 1);
            setChallengeStatus('playing');
            setUserAnswer(null);
            clearWorkspace(false);
            challengeStartTimeRef.current = Date.now();
        } else {
            goBackToMenu();
        }
    }, [questionIndex, questions, clearWorkspace, goBackToMenu]);
    
    const handleTimeOut = useCallback(async () => {
        if (!currentQuestion) return;
        await logEvent('challenge_attempt', currentUser, { model: 'fractions', questionId: currentQuestion.id, status: 'timed_out' });
        setChallengeStatus('timed_out');
    }, [currentQuestion, currentUser]);

    const handleCompareSelection = useCallback((fraction: Fraction) => {
        if (gameState !== 'challenge' || currentQuestion?.type !== 'compare') return;
        const fractionIndex = currentQuestion.fractions.findIndex(f => fractionsAreEqual(f, fraction));
        if (fractionIndex !== -1) {
            setUserAnswer(fractionIndex);
        }
    }, [gameState, currentQuestion]);


    useEffect(() => {
        return () => cancelSpeech();
    }, []);
    
    useEffect(() => {
        if (gameState !== 'training' || !currentTrainingStep) return;

        let isMounted = true;
        const step = currentTrainingStep;
        
        const executeStep = async () => {
            if (isSpeechEnabled && !spokenStepsRef.current.has(step.step)) {
                cancelSpeech();
                spokenStepsRef.current.add(step.step);
                await speak(step.text, 'en-US');
            }
            if (!isMounted) return;

            if (step.animation === 'split' && step.animationTarget && step.animationSplitResult) {
                const targetFraction = step.animationTarget;
                const splitResultFraction = step.animationSplitResult;
                
                setWorkspacePieces(prev => {
                    const targetIndex = prev.findIndex(p => fractionsAreEqual(p.fraction, targetFraction) && p.state === 'idle');
                    if (targetIndex === -1) return prev;
                    const targetPiece = prev[targetIndex];
                    const newWorkspace = [...prev];
                    newWorkspace[targetIndex] = { ...targetPiece, state: 'removing' };
                    const numPieces = (targetFraction.numerator * splitResultFraction.denominator) / targetFraction.denominator;
                    const newPieces: WorkspacePiece[] = Array.from({ length: numPieces }).map((_, i) => ({
                        ...targetPiece,
                        id: `${targetPiece.id}-s${i+1}`,
                        fraction: splitResultFraction,
                        state: 'splitting'
                    }));
                    newWorkspace.splice(targetIndex, 0, ...newPieces);
                    return newWorkspace;
                });
                setTimeout(() => {
                    setWorkspacePieces(prev => {
                        const finalPieces = prev.filter(p => p.state !== 'removing');
                        return finalPieces.map(p => p.state === 'splitting' ? { ...p, state: 'idle' } : p);
                    });
                }, 1000);
            }

            if (step.animation === 'merge') {
                const piecesToMerge = workspacePieces.filter(p => fractionsAreEqual(p.fraction, { numerator: 1, denominator: 2 })).slice(0, 2);
                if (piecesToMerge.length === 2) {
                    setWorkspacePieces(prev => prev.map(p => piecesToMerge.some(pm => pm.id === p.id) ? { ...p, state: 'merging' } : p));
                    setTimeout(() => {
                        setWorkspacePieces(prev => {
                            const remainingPieces = prev.filter(p => p.state !== 'merging');
                            const newWholePiece: WorkspacePiece = { id: `wp-whole-${Date.now()}`, fraction: { numerator: 1, denominator: 1 }, position: { x: 0, y: 0 }, state: 'idle' };
                            return [newWholePiece, ...remainingPieces];
                        });
                    }, 800);
                }
            }
            
            if (step.animation === 'simplify' && step.animationTarget && step.animationTargetCount && step.animationResult) {
                const piecesToSimplify = workspacePieces.filter(p => fractionsAreEqual(p.fraction, step.animationTarget!) && p.state === 'idle').slice(0, step.animationTargetCount);
                if (piecesToSimplify.length === step.animationTargetCount) {
                    setWorkspacePieces(prev => prev.map(p => 
                        piecesToSimplify.some(ps => ps.id === p.id) ? { ...p, state: 'merging' } : p
                    ));
                    setTimeout(() => {
                        setWorkspacePieces(prev => {
                            const remainingPieces = prev.filter(p => p.state !== 'merging');
                            const newSimplifiedPiece: WorkspacePiece = { 
                                id: `wp-simplified-${Date.now()}`, 
                                fraction: step.animationResult!, 
                                position: { x: 0, y: 0 }, 
                                state: 'idle' 
                            };
                            return [newSimplifiedPiece, ...remainingPieces];
                        });
                    }, 800);
                }
            }

            if (step.animation === 'remove' && step.animationTarget) {
                const targetFraction = step.animationTarget as Fraction;
                setWorkspacePieces(prev => {
                    let targetIndex = -1;
                    for (let i = prev.length - 1; i >= 0; i--) {
                        if (fractionsAreEqual(prev[i].fraction, targetFraction) && prev[i].state === 'idle') {
                            targetIndex = i;
                            break;
                        }
                    }

                    if (targetIndex === -1) return prev;
                    const newWorkspace = [...prev];
                    newWorkspace[targetIndex] = { ...newWorkspace[targetIndex], state: 'removing' };
                    return newWorkspace;
                });
                setTimeout(() => {
                    setWorkspacePieces(prev => prev.filter(p => p.state !== 'removing'));
                }, 1000);
            }

            if (step.type === 'intro' || step.type === 'feedback') {
                if (!isSpeechEnabled) await new Promise(r => setTimeout(r, step.duration || 4000));
                if (isMounted) advanceStep();
            } else if (step.type === 'action' && step.requiredAction === 'drag_piece') {
                const requiredFraction = step.requiredValue as Fraction;
                const count = workspacePieces.filter(p => fractionsAreEqual(p.fraction, requiredFraction)).length;
                if (count >= (step.requiredCount || 1)) {
                    if (isMounted) advanceStep();
                }
            }
        }
        
        executeStep();
        return () => { isMounted = false };
    }, [gameState, trainingStep, currentTrainingStep, isSpeechEnabled, workspacePieces, advanceStep]);

    const handleModeSelection = async (mode: FractionState) => {
        clearWorkspace(true);
        clearWorkspace(false);
        setGameState(mode);
        await logEvent('mode_start', currentUser, { model: 'fractions', mode });
        syncAnalyticsData();
        if (mode === 'training') {
            setTrainingStep(0);
            spokenStepsRef.current.clear();
        } else if (mode === 'challenge') {
            setGameState('challenge_difficulty_selection');
        }
    };
    
    const getSubtitle = () => {
        switch (gameState) {
            case 'training': return 'Training Mode';
            case 'explore': return 'Explore Mode';
            case 'challenge': return `Challenge Mode (${difficulty})`;
            case 'mode_selection': return 'Choose a Mode';
            case 'model_intro': return 'Learning Objectives';
            case 'challenge_difficulty_selection': return 'Choose Difficulty';
            default: return null;
        }
    };

    const trainingRequiredFraction = (gameState === 'training' && currentTrainingStep?.requiredAction === 'drag_piece' && currentTrainingStep.requiredValue && !Array.isArray(currentTrainingStep.requiredValue))
        ? currentTrainingStep.requiredValue as Fraction
        : null;

    const renderMainContent = () => {
        switch(gameState) {
            case 'welcome': return <WelcomeScreen onStart={() => setGameState('model_intro')} />;
            case 'model_intro': return <FractionIntroScreen onContinue={() => setGameState('mode_selection')} />;
            case 'mode_selection': return <ModeSelector onSelectMode={handleModeSelection} />;
            case 'challenge_difficulty_selection': return <DifficultySelector onSelectDifficulty={startChallenge} onBack={goBackToMenu} />;
            case 'training':
                return (
                    <div className="fractions-theme w-full flex-grow flex flex-col items-center p-4">
                        <div className="w-full max-w-7xl flex flex-col items-center animate-pop-in">
                            {currentTrainingStep && <TrainingGuide currentStep={currentTrainingStep} onComplete={goBackToMenu} onContinue={() => advanceStep()} incorrectActionFeedback={incorrectActionFeedback} />}
                            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                                <div className="max-h-[70vh] overflow-y-auto pr-2 rounded-lg">
                                    <FractionChart onPieceDragStart={handlePieceDragStart} spotlightOn={currentTrainingStep?.spotlightOn} trainingRequiredFraction={trainingRequiredFraction} />
                                </div>
                                <div className="flex flex-col gap-4">
                                    <CalculationWorkspace pieces={workspacePieces} onDrop={handleDrop} onDragOver={handleDragOver} isDropZoneActive={isDropZoneActive} spotlightOn={currentTrainingStep?.spotlightOn} onBarClick={currentTrainingStep?.requiredAction === 'click_bar' ? handleBarClick : undefined} />
                                    <div className="mt-4 flex justify-between items-center">
                                        {currentTrainingStep?.requiredAction === 'solve' && (
                                            <button onClick={handleSolveTraining} className={`control-button bg-green-600 border-green-800 hover:bg-green-500 ${currentTrainingStep.spotlightOn === 'solve_button' ? 'animate-guide-pulse' : ''}`}>Solve</button>
                                        )}
                                        <button onClick={() => clearWorkspace(true)} className="control-button bg-red-600 border-red-800 hover:bg-red-500 ml-auto">Clear Workspace</button>
                                    </div>
                                    {equation.isSolved && <CalculationStepsPanel equation={equation} isVisible={equation.isSolved} />}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'explore':
                 return (
                    <div 
                        className="fractions-theme w-full flex-grow flex flex-col items-center p-4"
                        onDrop={handleDropOnBackground}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <div className="w-full max-w-7xl flex flex-col items-center animate-pop-in">
                            <EquationInfoPanel equation={equation} />
                            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                                <div className="max-h-[70vh] overflow-y-auto pr-2 rounded-lg">
                                    <FractionChart onPieceDragStart={handlePieceDragStart} />
                                </div>
                                <div className="flex flex-col gap-4">
                                    <CalculationWorkspace 
                                        equation={equation} 
                                        onDrop={handleDrop} 
                                        onDragOver={handleDragOver} 
                                        isDropZoneActive={isDropZoneActive}
                                        onWorkspacePieceDragStart={handleWorkspacePieceDragStart}
                                        onWorkspacePieceDragEnd={handleWorkspacePieceDragEnd}
                                    />
                                    <FractionControls 
                                        onOperatorSelect={handleSetOperator}
                                        onSolve={handleSolveEquation}
                                        onClear={() => clearWorkspace(false)}
                                        equation={equation}
                                    />
                                    {equation.isSolved && <CalculationStepsPanel equation={equation} isVisible={equation.isSolved} />}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'challenge':
                if (!currentQuestion) return <div className="text-2xl font-chalk text-chalk-yellow">Loading challenges...</div>;
                
                const isCompareMode = currentQuestion.type === 'compare';
                const isOrderMode = currentQuestion.type === 'order';
                const isAddSubMode = currentQuestion.type === 'add' || currentQuestion.type === 'subtract';
                
                return (
                    <div 
                        className="fractions-theme w-full flex-grow flex flex-col items-center p-4"
                        onDrop={handleDropOnBackground}
                        onDragOver={(e) => e.preventDefault()}
                    >
                       <div className="w-full max-w-5xl">
                            <FractionChallengePanel
                                status={challengeStatus}
                                question={currentQuestion}
                                onCheckAnswer={handleCheckAnswer}
                                onNext={handleNextChallenge}
                                onTimeOut={handleTimeOut}
                                onClearAnswer={() => clearWorkspace(false)}
                                score={score}
                                timeLimit={DURATION_MAP[difficulty]}
                            />

                            {isOrderMode && (
                                <OrderWorkspace
                                    fractions={currentQuestion.fractions}
                                    onOrderChange={(ordered) => setUserAnswer(ordered)}
                                    orderDirection={currentQuestion.order!}
                                />
                            )}
                            
                            {isCompareMode && (
                                <CompareWorkspace
                                    fractions={currentQuestion.fractions}
                                    selectedFraction={typeof userAnswer === 'number' ? currentQuestion.fractions[userAnswer] : null}
                                    onSelect={handleCompareSelection}
                                />
                            )}

                            {isAddSubMode && (
                                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                                    <div className="max-h-[70vh] overflow-y-auto pr-2 rounded-lg">
                                        <FractionChart onPieceDragStart={handlePieceDragStart} />
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <p className="text-chalk-light font-semibold text-center text-lg">
                                            Build your answer in the workspace below.
                                        </p>
                                        <CalculationWorkspace
                                            equation={equation}
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            isDropZoneActive={isDropZoneActive}
                                            onWorkspacePieceDragStart={handleWorkspacePieceDragStart}
                                            onWorkspacePieceDragEnd={handleWorkspacePieceDragEnd}
                                        />
                                    </div>
                                </div>
                            )}
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
                onBackToModelMenu={['welcome', 'model_intro', 'mode_selection'].includes(gameState) ? undefined : goBackToMenu}
                modelTitle="Fraction Foundations"
                modelSubtitle={getSubtitle() ?? undefined}
            />
            <main className="flex-grow flex flex-col items-center justify-start p-4">
                {renderMainContent()}
            </main>
            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
            {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
        </div>
    );
};