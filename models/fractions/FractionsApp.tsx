import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { Fraction, FractionState, Difficulty, FractionChallengeQuestion, UserInfo, WorkspacePiece, FractionTrainingStep, EquationState, FractionOperator } from '../../types';
import { Header } from '../../components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { FractionIntroScreen } from './components/FractionIntroScreen';
import { ModeSelector } from './components/ModeSelector';
import { DifficultySelector } from '../../components/DifficultySelector';
import { FractionChart } from './components/FractionWall';
import { CalculationWorkspace } from './components/CalculationCanvas';
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
import { WorkoutControls } from './components/WorkoutControls';
import { EquationInfoPanel } from './components/EquationInfoPanel';
import { OrderWorkspace } from './components/OrderWorkspace';
import { addFractions, subtractFractions, simplifyFraction, lcm, getFractionalValue, fractionsAreEqual } from './utils/fractions';
import { ActivityPanel } from './components/ActivityPanel';
import { MultipleChoiceOptions } from './components/MultipleChoiceOptions';
import { PizzaVisual } from './components/PizzaVisual';


const DURATION_MAP: Record<Difficulty, number> = { easy: 60, medium: 45, hard: 30 };
const DENOMINATORS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 16];
const ANIMATION_DURATION = 1500;

const EMPTY_EQUATION: EquationState = {
    terms: [{ fraction: null, pieces: [] }],
    operators: [],
    result: null,
    resultPieces: [],
    unsimplifiedResult: null,
    unsimplifiedResultPieces: [],
    isSolved: false,
    isWorkoutActive: false,
    workoutStep: 'idle',
    autoAdvanceWorkout: false,
};

const denominatorToWord = (den: number): string => {
    switch (den) {
        case 1: return 'whole';
        case 2: return 'half';
        case 3: return 'third';
        case 4: return 'fourth';
        case 5: return 'fifth';
        case 6: return 'sixth';
        case 7: return 'seventh';
        case 8: return 'eighth';
        case 9: return 'ninth';
        case 10: return 'tenth';
        case 12: return 'twelfth';
        case 16: return 'sixteenth';
        default: return `${den}th`;
    }
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
    const [activityFeedback, setActivityFeedback] = useState<{ type: 'error' | 'success' | 'hint', message: string } | null>(null);
    const spokenStepsRef = useRef<Set<number>>(new Set());
    const { isSpeechEnabled } = useAudio();
    const currentTrainingStep = useMemo(() => fractionTrainingPlan.find(s => s.step === trainingStep) || null, [trainingStep]);

    // Explore & Challenge Mode State
    const [equation, setEquation] = useState<EquationState>(EMPTY_EQUATION);
    
    // Challenge Mode State
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [questions, setQuestions] = useState<FractionChallengeQuestion[]>([]);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [challengeStatus, setChallengeStatus] = useState<'playing' | 'correct' | 'incorrect' | 'timed_out'>('playing');
    const [score, setScore] = useState(0);
    const [userAnswer, setUserAnswer] = useState<Fraction | Fraction[] | number | null>(null);
    const [solvedAnswerForPanel, setSolvedAnswerForPanel] = useState<Fraction | Fraction[] | number | null>(null);
    const challengeStartTimeRef = useRef<number | null>(null);
    const currentQuestion = useMemo(() => questions[questionIndex] || null, [questions, questionIndex]);

    const clearWorkspace = useCallback((forTraining: boolean) => {
        if (forTraining) {
            setWorkspacePieces([]);
        } else {
            if (isSpeechEnabled && gameState === 'explore' && (equation.terms.length > 1 || equation.terms[0].fraction !== null || equation.isSolved)) {
                speak("Workspace cleared.", 'en-US');
            }
            setEquation(EMPTY_EQUATION);
        }
    }, [isSpeechEnabled, gameState, equation]);

    const advanceStep = useCallback(() => {
        const step = fractionTrainingPlan.find(s => s.step === trainingStep);
        if (step?.clearWorkspaceAfter) {
            clearWorkspace(true);
        }
        setIncorrectActionFeedback(null);
        setActivityFeedback(null);
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

    const addPieceToWorkspace = (fraction: Fraction) => {
        const newPiece: WorkspacePiece = {
            id: `wp-${Date.now()}-${Math.random()}`,
            fraction,
            position: { x: 0, y: 0 },
            state: 'idle',
        };

        if (isSpeechEnabled && gameState === 'explore') {
            const pieceName = denominatorToWord(fraction.denominator);
            speak(`Added one ${pieceName}.`, 'en-US');
        }

        if (gameState === 'training') {
            setWorkspacePieces(prev => [...prev, newPiece]);
        } else if ((gameState === 'explore' || gameState === 'challenge') && !equation.isSolved && !equation.isWorkoutActive) {
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
    
    const handleChartPieceClick = (fraction: Fraction) => {
        if ((gameState !== 'explore' && gameState !== 'challenge') || equation.isSolved || equation.isWorkoutActive) {
            return;
        }
        // For challenge mode, only allow adding pieces for add/subtract questions
        if (gameState === 'challenge' && currentQuestion && (currentQuestion.type !== 'add' && currentQuestion.type !== 'subtract')) {
            return;
        }
        addPieceToWorkspace(fraction);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDropZoneActive(false);
        const fractionData = e.dataTransfer.getData('application/json');
        if (!fractionData) return;
        const fraction = JSON.parse(fractionData) as Fraction;
        addPieceToWorkspace(fraction);
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const removePieceFromEquation = (pieceId: string) => {
        if (equation.isWorkoutActive) return;
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
        if ((gameState === 'explore' || gameState === 'challenge') && !equation.isSolved && !equation.isWorkoutActive) {
            if (isSpeechEnabled && gameState === 'explore') {
                const word = op === '+' ? 'plus' : 'minus';
                speak(word, 'en-US');
            }
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
        if (((gameState !== 'explore' && gameState !== 'challenge') || equation.isSolved) && !(gameState === 'explore' && equation.isWorkoutActive)) return;
        
        if (equation.isWorkoutActive && gameState === 'explore') {
             if (isSpeechEnabled) {
                speak("Solving directly.", 'en-US');
            }
        }

        const { terms, operators } = equation;
        
        if (terms.length < 2 || !terms[terms.length - 1].fraction) return;

        let currentResult: Fraction = terms[0].fraction!;
        
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
        
        if (isSpeechEnabled && (gameState === 'explore' || (gameState === 'challenge' && !equation.isWorkoutActive))) {
            speak(`Equals ${finalResult.numerator} over ${finalResult.denominator}.`, 'en-US');
        }
        
        setEquation(prev => ({ ...prev, isSolved: true, isWorkoutActive: false, workoutStep: 'done', unsimplifiedResult, result: finalResult, resultPieces }));
    };

    // --- Workout Logic ---
    const handleStartWorkout = () => {
        if (isSpeechEnabled && gameState === 'explore') {
            speak("Let's solve this step by step. First, find a common denominator.", 'en-US');
        }
        setEquation(prev => ({...prev, isWorkoutActive: true, workoutStep: 'commonDenominator'}));
    };

    const handleWorkoutNextStep = useCallback(() => {
        const { workoutStep, terms, operators, unsimplifiedResult, result } = equation;

        if (workoutStep === 'commonDenominator') {
            if (isSpeechEnabled && gameState === 'explore') {
                speak("Converting to a common denominator.", 'en-US');
            }
            const allDenominators = terms.map(t => t.fraction!.denominator);
            const commonDen = allDenominators.reduce((a, b) => lcm(a, b));
            const needsConversion = allDenominators.some(d => d !== commonDen);

            if (!needsConversion) { // Skip if not needed
                setEquation(prev => ({ ...prev, workoutStep: 'combine', autoAdvanceWorkout: true }));
                return;
            }

            const animatedTerms = terms.map(term => ({
                ...term,
                pieces: term.pieces.map(p => ({ ...p, state: 'splitting' as const, splitInto: { numerator: 1, denominator: commonDen } }))
            }));
            setEquation(prev => ({ ...prev, terms: animatedTerms }));

            setTimeout(() => {
                const finalTerms = terms.map(term => {
                    const multiplier = commonDen / term.fraction!.denominator;
                    const finalPieces: WorkspacePiece[] = term.pieces.flatMap(p => 
                        Array.from({ length: p.fraction.numerator * multiplier }).map((_, i) => ({
                            id: `${p.id}-splt-${i}`, fraction: { numerator: 1, denominator: commonDen }, position: { x: 0, y: 0 }, state: 'idle'
                        }))
                    );
                    return { 
                        fraction: { numerator: term.fraction!.numerator * multiplier, denominator: commonDen },
                        pieces: finalPieces 
                    };
                });
                setEquation(prev => ({ ...prev, terms: finalTerms, workoutStep: 'combine' }));
            }, ANIMATION_DURATION);

        } else if (workoutStep === 'combine') {
            if (isSpeechEnabled && gameState === 'explore') {
                const action = operators[0] === '+' ? 'Combining' : 'Subtracting';
                speak(`${action} the fractions.`, 'en-US');
            }
            let finalPieces: WorkspacePiece[] = [];
            if (operators[0] === '+') {
                 finalPieces = terms.flatMap(t => t.pieces.map(p => ({...p, state: 'combining' as const})));
            } else {
                 finalPieces = [...terms[0].pieces];
                 let piecesToRemoveCount = terms[1].pieces.length;
                 finalPieces = finalPieces.map(p => {
                    if (piecesToRemoveCount > 0 && p.state === 'idle') {
                        piecesToRemoveCount--;
                        return { ...p, state: 'removing' as const };
                    }
                    return p;
                 });
            }
            
            setEquation(prev => ({ ...prev, terms: [{ ...prev.terms[0], pieces: finalPieces }, ...prev.terms.slice(1).map(t => ({...t, pieces: []}))]}));

            setTimeout(() => {
                const remainingPieces = finalPieces.filter(p => p.state !== 'removing');
                const resultFraction = remainingPieces.reduce((acc, p) => addFractions(acc, p.fraction), { numerator: 0, denominator: 1 } as Fraction);
                const simplified = simplifyFraction(resultFraction);
                const canSimplify = !fractionsAreEqual(resultFraction, simplified);
                
                setEquation(prev => ({
                    ...prev,
                    terms: [{ fraction: resultFraction, pieces: remainingPieces.map(p => ({...p, state: 'idle'})) }], operators: [],
                    unsimplifiedResult: resultFraction, result: simplified,
                    workoutStep: canSimplify ? 'simplify' : 'done'
                }));

                if (isSpeechEnabled && gameState === 'explore') {
                    if (canSimplify) {
                        speak("Now, let's simplify the result.", 'en-US');
                    } else {
                        speak(`The result is ${resultFraction.numerator} over ${resultFraction.denominator}. Workout complete.`, 'en-US');
                    }
                }
            }, ANIMATION_DURATION);

        } else if (workoutStep === 'simplify') {
            if (isSpeechEnabled && gameState === 'explore') {
                speak(`Simplifying.`, 'en-US');
            }
            const piecesToMerge = [...equation.terms[0].pieces];
            setEquation(prev => ({ ...prev, terms: [{ ...prev.terms[0], pieces: piecesToMerge.map(p => ({ ...p, state: 'merging' as const })) }]}));

            setTimeout(() => {
                const { result } = equation;
                if (!result) return;
                const resultPieces: WorkspacePiece[] = [];
                const wholeParts = Math.floor(result.numerator / result.denominator);
                const remainderNum = result.numerator % result.denominator;
                if (wholeParts > 0) {
                    for(let i=0; i < wholeParts; i++) {
                        resultPieces.push({ id: `wr-w-${Date.now()}-${i}`, fraction: { numerator: 1, denominator: 1 }, position: { x: 0, y: 0 }, state: 'idle' });
                    }
                }
                if (remainderNum > 0) resultPieces.push({ id: `wr-r-${Date.now()}`, fraction: { numerator: remainderNum, denominator: result.denominator }, position: { x: 0, y: 0 }, state: 'idle' });
                
                if (isSpeechEnabled && result && gameState === 'explore') {
                    speak(`The final answer is ${result.numerator} over ${result.denominator}. Workout complete.`, 'en-US');
                }
                setEquation(prev => ({ ...prev, terms: [{ fraction: result, pieces: resultPieces }], resultPieces, isSolved: true, workoutStep: 'done'}));
            }, ANIMATION_DURATION);
        }
    }, [equation, isSpeechEnabled, gameState]);

    useEffect(() => {
        if (equation.autoAdvanceWorkout) {
            setEquation(prev => ({ ...prev, autoAdvanceWorkout: false }));
            handleWorkoutNextStep();
        }
    }, [equation.autoAdvanceWorkout, handleWorkoutNextStep]);


    const handleFinishWorkout = () => {
        // If workout is done, reset. Otherwise, solve directly.
        if (equation.workoutStep === 'done') {
            if (isSpeechEnabled && gameState === 'explore') {
                speak("Finished.", 'en-US');
            }
            clearWorkspace(false);
        } else {
            handleSolveEquation();
        }
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
                isWorkoutActive: false,
                workoutStep: 'idle',
            };
            setEquation(solvedEquation);
            advanceStep();
        }
    };
    
    // --- Activity Logic ---
    const handleCheckActivityAnswer = () => {
        if (!currentTrainingStep?.activity) return;

        setActivityFeedback(null);
        const { activity } = currentTrainingStep;
        
        const userFraction = workspacePieces.reduce((acc, piece) => addFractions(acc, piece.fraction), { numerator: 0, denominator: 1 });

        if (userFraction.numerator === 0 && userFraction.denominator === 1) {
            setActivityFeedback({ type: 'hint', message: "Your workspace is empty. Drag some pieces to build your answer!" });
            return;
        }

        if (activity.type === 'build') {
            const target = activity.target;
            const userDenominator = workspacePieces[0]?.fraction.denominator;

            if (workspacePieces.some(p => p.fraction.denominator !== userDenominator)) {
                setActivityFeedback({ type: 'error', message: "Oops! All your pieces must be the same size (have the same denominator)." });
                return;
            }

            if (userDenominator !== target.denominator) {
                setActivityFeedback({ type: 'error', message: `You used 1/${userDenominator} pieces, but we need 1/${target.denominator} pieces for this fraction.` });
                return;
            }

            if (userFraction.numerator !== target.numerator) {
                setActivityFeedback({ type: 'hint', message: `You have ${userFraction.numerator} pieces, but you need ${target.numerator}. Keep trying!` });
                return;
            }

            setActivityFeedback({ type: 'success', message: "Perfect! You built it correctly. Well done!" });
            setShowConfetti(true);
            setTimeout(() => advanceStep(), 3000);

        } else if (activity.type === 'equivalent') {
            const target = activity.target;

            if (workspacePieces.some(p => p.fraction.denominator === target.denominator)) {
                setActivityFeedback({ type: 'hint', message: "Good start, but try to use pieces with a DIFFERENT denominator than the target." });
                return;
            }

            const userValue = getFractionalValue(userFraction);
            const targetValue = getFractionalValue(target);

            if (Math.abs(userValue - targetValue) < 0.001) {
                const simplifiedUserFraction = simplifyFraction(userFraction);
                setActivityFeedback({ type: 'success', message: `Yes! ${simplifiedUserFraction.numerator}/${simplifiedUserFraction.denominator} is the same size as ${target.numerator}/${target.denominator}. Excellent!` });
                setShowConfetti(true);
                setTimeout(() => advanceStep(), 4000);
            } else if (userValue < targetValue) {
                setActivityFeedback({ type: 'hint', message: "You're on the right track, but your fraction is a little too small. Try adding more pieces." });
            } else {
                setActivityFeedback({ type: 'hint', message: "Almost! Your fraction is a little too big. Try removing a piece." });
            }
        } else if (activity.type === 'improper_to_mixed') {
            const target = activity.target;
            
            const expectedWholeParts = Math.floor(target.numerator / target.denominator);
            const expectedNumerator = target.numerator % target.denominator;
            const expectedDenominator = target.denominator;

            const userWholeParts = workspacePieces.filter(p => p.fraction.denominator === 1).reduce((sum, p) => sum + p.fraction.numerator, 0);
            const userFractionalPieces = workspacePieces.filter(p => p.fraction.denominator !== 1);
            
            if (userFractionalPieces.length > 0 && userFractionalPieces.some(p => p.fraction.denominator !== userFractionalPieces[0].fraction.denominator)) {
                setActivityFeedback({ type: 'error', message: "Oops! All your fractional pieces must be the same size." });
                return;
            }
            if (userFractionalPieces.length > 0 && userFractionalPieces[0].fraction.denominator !== expectedDenominator) {
                 setActivityFeedback({ type: 'error', message: `You need to use 1/${expectedDenominator} pieces for the fractional part.` });
                return;
            }
            
            const userNumerator = userFractionalPieces.reduce((sum, p) => sum + p.fraction.numerator, 0);

            if (userWholeParts === expectedWholeParts && userNumerator === expectedNumerator) {
                setActivityFeedback({ type: 'success', message: `That's it! ${target.numerator}/${target.denominator} is the same as ${expectedWholeParts} and ${expectedNumerator}/${expectedDenominator}.` });
                setShowConfetti(true);
                setTimeout(() => advanceStep(), 4000);
            } else {
                 setActivityFeedback({ type: 'hint', message: `Not quite. Remember how many ${expectedDenominator} pieces make one whole. Keep trying!` });
            }
        }
    };
    
    const handleResetActivity = () => {
        clearWorkspace(true);
        setActivityFeedback(null);
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
        setSolvedAnswerForPanel(null);
        clearWorkspace(false);
        setGameState('challenge');
        challengeStartTimeRef.current = Date.now();
    }, [clearWorkspace]);

    const handleCheckAnswer = useCallback(async () => {
        if (!currentQuestion) return;

        let isCorrect = false;
        const answer = currentQuestion.answer;
        let finalUserAnswer: Fraction | Fraction[] | number | null = userAnswer;

        if (currentQuestion.displayType === 'mcq' || currentQuestion.displayType === 'pizza') {
            if (userAnswer && typeof userAnswer === 'object' && 'numerator' in userAnswer) {
                 isCorrect = fractionsAreEqual(userAnswer as Fraction, answer as Fraction);
            }
        } else if (currentQuestion.type === 'add' || currentQuestion.type === 'subtract') {
            const workspaceAnswer = equation.isWorkoutActive 
                ? equation.result
                : simplifyFraction(equation.terms[0].fraction || { numerator: 0, denominator: 1 });
            
            if (workspaceAnswer) {
                finalUserAnswer = workspaceAnswer;
                isCorrect = fractionsAreEqual(workspaceAnswer, answer as Fraction);
            }
        } else if (currentQuestion.type === 'compare') {
            isCorrect = userAnswer === answer;
            if (typeof userAnswer === 'number' && userAnswer >= 0 && userAnswer < currentQuestion.fractions.length) {
                finalUserAnswer = currentQuestion.fractions[userAnswer];
            }
        } else if (currentQuestion.type === 'order') {
            const orderedAnswer = answer as Fraction[];
            const orderedUserAnswer = userAnswer as Fraction[];
            if (orderedUserAnswer && orderedUserAnswer.length === orderedAnswer.length) {
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
            setSolvedAnswerForPanel(finalUserAnswer);
        } else {
            setChallengeStatus('incorrect');
            setSolvedAnswerForPanel(answer);
        }
    }, [currentQuestion, userAnswer, equation, currentUser, difficulty]);
    
    const handleNextChallenge = useCallback(() => {
        if (questionIndex < questions.length - 1) {
            setQuestionIndex(i => i + 1);
            setChallengeStatus('playing');
            setUserAnswer(null);
            setSolvedAnswerForPanel(null);
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
        setSolvedAnswerForPanel(currentQuestion.answer);
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
            case 'training': {
                const isActivity = currentTrainingStep?.type === 'activity';
                const activityOptions = currentTrainingStep?.activity?.options;
                const disabledDenominators = (isActivity && currentTrainingStep.activity?.type === 'equivalent')
                    ? [currentTrainingStep.activity.target.denominator, ...(activityOptions?.allowedDenominators ? DENOMINATORS.filter(d => !activityOptions.allowedDenominators!.includes(d)) : [])]
                    : [];

                return (
                    <div className="fractions-theme w-full flex-grow flex flex-col items-center p-4">
                        <div className="w-full max-w-7xl flex flex-col items-center animate-pop-in">
                            {currentTrainingStep && !isActivity && <TrainingGuide currentStep={currentTrainingStep} onComplete={goBackToMenu} onContinue={() => advanceStep()} incorrectActionFeedback={incorrectActionFeedback} />}
                            {isActivity && currentTrainingStep.activity && (
                                <ActivityPanel 
                                    activity={currentTrainingStep.activity}
                                    feedback={activityFeedback}
                                    onCheck={handleCheckActivityAnswer}
                                    onReset={handleResetActivity}
                                />
                            )}
                            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                                <div className="max-h-[70vh] overflow-y-auto pr-2 rounded-lg">
                                    <FractionChart onPieceDragStart={handlePieceDragStart} spotlightOn={currentTrainingStep?.spotlightOn} trainingRequiredFraction={trainingRequiredFraction} disabledDenominators={disabledDenominators} />
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
            }
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
                                    <FractionChart onPieceDragStart={handlePieceDragStart} onPieceClick={handleChartPieceClick} />
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
                                    {equation.isWorkoutActive ? (
                                        <WorkoutControls
                                            workoutStep={equation.workoutStep}
                                            onNextStep={handleWorkoutNextStep}
                                            onFinish={handleFinishWorkout}
                                            equation={equation}
                                        />
                                    ) : (
                                        <FractionControls 
                                            onOperatorSelect={handleSetOperator}
                                            onSolve={handleSolveEquation}
                                            onWorkout={handleStartWorkout}
                                            onClear={() => clearWorkspace(false)}
                                            equation={equation}
                                        />
                                    )}
                                    {equation.isSolved && !equation.isWorkoutActive && <CalculationStepsPanel equation={equation} isVisible={equation.isSolved} />}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'challenge':
                if (!currentQuestion) return <div className="text-2xl font-chalk text-chalk-yellow">Loading challenges...</div>;
                
                const displayType = currentQuestion.displayType || 'chart';
                const isOrderMode = currentQuestion.type === 'order';
                const isCompareMode = currentQuestion.type === 'compare';
                
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
                                onClearAnswer={() => { clearWorkspace(false); setUserAnswer(null); }}
                                score={score}
                                timeLimit={DURATION_MAP[difficulty]}
                                isWorkoutActive={equation.isWorkoutActive}
                                solvedAnswer={solvedAnswerForPanel}
                            />

                             <div className="mt-4">
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

                                {displayType === 'mcq' && currentQuestion.mcqOptions && (
                                    <MultipleChoiceOptions 
                                        options={currentQuestion.mcqOptions}
                                        selectedOption={userAnswer as Fraction | null}
                                        onSelect={(fraction) => setUserAnswer(fraction)}
                                    />
                                )}

                                {displayType === 'pizza' && (
                                    <PizzaVisual
                                        // FIX: Cast `currentQuestion.answer` to Fraction. The data structure for 'pizza'
                                        // displayType guarantees that the answer will be a Fraction object.
                                        totalSlices={(currentQuestion.answer as Fraction).denominator}
                                        onSelectionChange={(fraction) => setUserAnswer(fraction)}
                                    />
                                )}

                                {displayType === 'chart' && (currentQuestion.type === 'add' || currentQuestion.type === 'subtract') && (
                                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                                        <div className="max-h-[70vh] overflow-y-auto pr-2 rounded-lg">
                                            <FractionChart onPieceDragStart={handlePieceDragStart} onPieceClick={handleChartPieceClick} />
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <p className="text-chalk-light font-semibold text-center text-lg">
                                                Build your answer below, or use the Workout mode to solve step-by-step.
                                            </p>
                                            <CalculationWorkspace
                                                equation={equation}
                                                onDrop={handleDrop}
                                                onDragOver={handleDragOver}
                                                isDropZoneActive={isDropZoneActive}
                                                onWorkspacePieceDragStart={handleWorkspacePieceDragStart}
                                                onWorkspacePieceDragEnd={handleWorkspacePieceDragEnd}
                                            />
                                            {equation.isWorkoutActive ? (
                                                <WorkoutControls
                                                    workoutStep={equation.workoutStep}
                                                    onNextStep={handleWorkoutNextStep}
                                                    onFinish={handleFinishWorkout}
                                                    equation={equation}
                                                />
                                            ) : (
                                                <FractionControls 
                                                    onOperatorSelect={handleSetOperator}
                                                    onSolve={handleSolveEquation}
                                                    onWorkout={handleStartWorkout}
                                                    onClear={() => clearWorkspace(false)}
                                                    equation={equation}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                             </div>
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