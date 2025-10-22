import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { Fraction, FractionState, Difficulty, FractionChallengeQuestion, UserInfo, EquationState, FractionOperator, TrainingAction, ExploreView } from '../../types';
import { Header } from '../../components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ModeSelector } from './components/ModeSelector';
import { DifficultySelector } from '../../components/DifficultySelector';
import { FractionWall } from './components/FractionWall';
import { CalculationCanvas } from './components/CalculationCanvas';
import { FractionControls } from './components/FractionControls';
import { FractionChallengePanel } from './components/FractionChallengePanel';
import { TrainingGuide } from './components/TrainingGuide';
import { NumberLine } from './components/NumberLine';
import { ConceptIntro } from './components/ConceptIntro';
import { ExploreViewSwitcher } from './components/ExploreViewSwitcher';
import { Confetti } from '../../components/Confetti';
import { challenges } from './utils/challenges';
import { fractionTrainingPlan } from './utils/training';
import { logEvent, syncAnalyticsData } from '../../utils/analytics';
import { speak, cancelSpeech } from '../../utils/speech';
import { useAudio } from '../../contexts/AudioContext';
import { HelpModal } from './components/HelpModal';
import { CalculationStepsPanel } from './components/CalculationStepsPanel';

function fractionsAreEqual(f1: Fraction | null, f2: Fraction | null): boolean {
    if (!f1 || !f2) return false;
    // Handle cases where a simplified fraction might be compared to a non-simplified one.
    if(f1.numerator === 0 && f2.numerator === 0) return true;
    return f1.numerator * f2.denominator === f2.numerator * f1.denominator;
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

function simplify(fraction: Fraction): Fraction {
    if (fraction.numerator === 0) return { numerator: 0, denominator: 1 };
    const commonDivisor = gcd(Math.abs(fraction.numerator), Math.abs(fraction.denominator));
    return {
        numerator: fraction.numerator / commonDivisor,
        denominator: fraction.denominator / commonDivisor,
    };
}

const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

const DURATION_MAP: Record<Difficulty, number> = { easy: 45, medium: 35, hard: 25 };

const initialEquationState: EquationState = { term1: null, operator: null, term2: null, result: null, unsimplifiedResult: null, isSolved: false };

export const FractionsApp: React.FC<{ onExit: () => void; currentUser: UserInfo | null }> = ({ onExit, currentUser }) => {
    const [gameState, setGameState] = useState<FractionState>('welcome');
    const [equation, setEquation] = useState<EquationState>(initialEquationState);
    const [wallPulse, setWallPulse] = useState<Fraction | null>(null);
    const [showHelp, setShowHelp] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    
    // Explore State
    const [exploreView, setExploreView] = useState<ExploreView>('operations');

    // Challenge State
    const [challengeAnswer, setChallengeAnswer] = useState<Fraction | null>(null);
    const [challengeStatus, setChallengeStatus] = useState<'playing' | 'correct' | 'incorrect' | 'timed_out'>('playing');
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [filteredQuestions, setFilteredQuestions] = useState<FractionChallengeQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const challengeStartTimeRef = React.useRef<number | null>(null);

    // Training State
    const [trainingStep, setTrainingStep] = useState(0);
    const [trainingFeedback, setTrainingFeedback] = useState<string | null>(null);
    const [conceptDenominator, setConceptDenominator] = useState(4);
    const [conceptSelectedPieces, setConceptSelectedPieces] = useState<boolean[]>(Array(4).fill(false));
    const [numberLineDenominator, setNumberLineDenominator] = useState(4);
    const [selectedNumberLinePoint, setSelectedNumberLinePoint] = useState<Fraction | null>(null);
    const spokenStepsRef = useRef<Set<number>>(new Set());

    const { isSpeechEnabled } = useAudio();
    const currentTrainingStep = useMemo(() => fractionTrainingPlan.find(s => s.step === trainingStep) || null, [trainingStep]);

    const handleSelectFraction = (fraction: Fraction) => {
        if (gameState === 'challenge') {
             setChallengeAnswer(prevAnswer => {
                if (!prevAnswer) return fraction;
                const newNumerator = prevAnswer.numerator * fraction.denominator + fraction.numerator * prevAnswer.denominator;
                const newDenominator = prevAnswer.denominator * fraction.denominator;
                return simplify({ numerator: newNumerator, denominator: newDenominator });
            });
        } else {
            setEquation(prev => {
                if (prev.isSolved) return prev;
                if (!prev.term1) return { ...prev, term1: fraction };
                if (prev.operator && !prev.term2) return { ...prev, term2: fraction };
                return prev;
            });
        }
    };
    
    const handleSelectOperator = (op: FractionOperator) => {
        setEquation(prev => {
           if (!prev.term1 || prev.isSolved) return prev;
           return { ...prev, operator: op };
        });
    }

    const clearEquation = useCallback(() => {
        setEquation(initialEquationState);
        setWallPulse(null);
        if (gameState === 'challenge') {
            setChallengeAnswer(null);
        }
    }, [gameState]);

    const handleSolve = () => {
        const { term1, term2, operator } = equation;
        if (!term1 || !term2 || !operator) return;

        let resultNumerator, resultDenominator;

        if (term1.denominator === term2.denominator) {
            resultDenominator = term1.denominator;
            resultNumerator = operator === '+' ? term1.numerator + term2.numerator : term1.numerator - term2.numerator;
        } else {
            const commonDen = lcm(term1.denominator, term2.denominator);
            const num1 = term1.numerator * (commonDen / term1.denominator);
            const num2 = term2.numerator * (commonDen / term2.denominator);
            resultDenominator = commonDen;
            resultNumerator = operator === '+' ? num1 + num2 : num1 - num2;
        }
        
        const unsimplifiedResult = { numerator: resultNumerator, denominator: resultDenominator };
        const simplifiedResult = simplify(unsimplifiedResult);

        setEquation(prev => ({ ...prev, result: simplifiedResult, unsimplifiedResult, isSolved: true }));

        // Pulse the corresponding bar on the wall
        setTimeout(() => {
            if(simplifiedResult.numerator > 0) { // Only pulse for non-zero results
                setWallPulse(simplifiedResult);
                setTimeout(() => setWallPulse(null), 1500);
            }
        }, 8000); // Delay to match full animation sequence
    };

    const goBackToMenu = useCallback(() => {
        clearEquation();
        setExploreView('operations');
        setGameState('mode_selection');
        spokenStepsRef.current.clear();
    }, [clearEquation]);

    const handleConceptAction = (action: { type: TrainingAction, value: number }) => {
        if (!currentTrainingStep || currentTrainingStep.type !== 'action') return;
        
        const { requiredAction, requiredValue, count } = currentTrainingStep;
        let isCorrect = false;

        if (action.type === requiredAction) {
            if (requiredAction === 'set_denominator' && action.value === requiredValue) {
                setConceptDenominator(action.value);
                setConceptSelectedPieces(Array(action.value).fill(false));
                isCorrect = true;
            } else if (requiredAction === 'select_pieces') {
                const newSelected = [...conceptSelectedPieces];
                newSelected[action.value] = !newSelected[action.value];
                setConceptSelectedPieces(newSelected);
                // The check for advancing the step is based on the total number of selected pieces
                const selectedCount = newSelected.filter(Boolean).length;
                if (selectedCount === count) {
                    isCorrect = true;
                }
            }
        }
        
        if(isCorrect) {
            setTrainingStep(prev => prev + 1);
        }
    };
    
    useEffect(() => {
        if (gameState !== 'training' || !currentTrainingStep) return;

        let isComponentMounted = true;

        const handleAutoProgressStep = async () => {
            setTrainingFeedback(currentTrainingStep.text);

            if (isSpeechEnabled && !spokenStepsRef.current.has(currentTrainingStep.step)) {
                spokenStepsRef.current.add(currentTrainingStep.step);
                await speak(currentTrainingStep.text, 'en-US');
            } else {
                await new Promise(resolve => setTimeout(resolve, currentTrainingStep.duration || 3000));
            }

            if (!isComponentMounted) return;

            setTrainingFeedback(null);
            if (currentTrainingStep.clearBoardAfter) {
                clearEquation();
            }
            if (currentTrainingStep.ui === 'number_line' && typeof currentTrainingStep.requiredValue === 'number') {
                setNumberLineDenominator(currentTrainingStep.requiredValue);
            }
            setTrainingStep(prev => prev + 1);
        };
        
        const handleActionStep = () => {
             if (isSpeechEnabled && !spokenStepsRef.current.has(currentTrainingStep.step)) {
                speak(currentTrainingStep.text, 'en-US');
                spokenStepsRef.current.add(currentTrainingStep.step);
            }

            if (currentTrainingStep.ui === 'operations') {
                const { requiredAction, requiredValue } = currentTrainingStep;
                const checkCondition = () => {
                    switch(requiredAction) {
                        case 'select_term1': return fractionsAreEqual(equation.term1, requiredValue as Fraction);
                        case 'select_operator': return equation.operator === requiredValue;
                        case 'select_term2': return fractionsAreEqual(equation.term2, requiredValue as Fraction);
                        case 'solve': return equation.isSolved;
                        default: return false;
                    }
                };
                if (checkCondition()) {
                    setTrainingStep(prev => prev + 1);
                }
            } else if (currentTrainingStep.ui === 'number_line') {
                if (fractionsAreEqual(selectedNumberLinePoint, currentTrainingStep.requiredValue as Fraction)) {
                    setTrainingStep(prev => prev + 1);
                    setSelectedNumberLinePoint(null); // Reset for next step
                }
            }
        };
        
        if (currentTrainingStep.type === 'action' || currentTrainingStep.type === 'complete') {
            cancelSpeech();
        }

        if (currentTrainingStep.type === 'intro' || currentTrainingStep.type === 'feedback') {
            handleAutoProgressStep();
        } else if (currentTrainingStep.type === 'action') {
            handleActionStep();
        } else if (currentTrainingStep.type === 'complete' && isSpeechEnabled && !spokenStepsRef.current.has(currentTrainingStep.step)) {
            speak(currentTrainingStep.text, 'en-US');
            spokenStepsRef.current.add(currentTrainingStep.step);
        }

        return () => { isComponentMounted = false; };
    }, [gameState, trainingStep, currentTrainingStep, equation, isSpeechEnabled, clearEquation, selectedNumberLinePoint]);
    
    // Handle Challenge Logic
    const startChallenge = useCallback((diff: Difficulty) => {
        const questions = challenges.filter(q => q.level === diff);
        setFilteredQuestions([...questions].sort(() => 0.5 - Math.random()));
        setDifficulty(diff);
        setCurrentQuestionIndex(0);
        setScore(0);
        clearEquation();
        setChallengeStatus('playing');
        setGameState('challenge');
        challengeStartTimeRef.current = Date.now();
    }, [clearEquation]);
    
     const handleCheckAnswer = async () => {
        const question = filteredQuestions[currentQuestionIndex];
        if (!question || !challengeAnswer) return;

        let isCorrect = fractionsAreEqual(challengeAnswer, question.answer as Fraction);
        const questionText = `${question.term1.numerator}/${question.term1.denominator} ${question.operator} ${question.term2.numerator}/${question.term2.denominator}`;
        
        const durationSeconds = challengeStartTimeRef.current ? (Date.now() - challengeStartTimeRef.current) / 1000 : 0;
        await logEvent('challenge_attempt', currentUser, {
            model: 'fractions',
            questionId: question.id,
            questionText: questionText,
            level: difficulty,
            status: isCorrect ? 'correct' : 'incorrect',
            durationSeconds,
            userAnswer: `${challengeAnswer.numerator}/${challengeAnswer.denominator}`,
            correctAnswer: `${(question.answer as Fraction).numerator}/${(question.answer as Fraction).denominator}`,
        });
        syncAnalyticsData();
        
        if (isCorrect) {
            setScore(s => s + 10);
            setChallengeStatus('correct');
            setShowConfetti(true);
        } else {
            setChallengeStatus('incorrect');
        }
    };
    
    const handleNextChallenge = () => {
        clearEquation();
        setChallengeStatus('playing');
        if (currentQuestionIndex < filteredQuestions.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
            challengeStartTimeRef.current = Date.now();
        } else {
            goBackToMenu();
        }
    };
    
    const handleTimeOut = async () => {
        const question = filteredQuestions[currentQuestionIndex];
        if (!question) return;
        setChallengeStatus('timed_out');
        const questionText = `${question.term1.numerator}/${question.term1.denominator} ${question.operator} ${question.term2.numerator}/${question.term2.denominator}`;
        
        await logEvent('challenge_attempt', currentUser, {
            model: 'fractions',
            questionId: question.id,
            questionText: questionText,
            level: difficulty,
            status: 'timed_out',
            durationSeconds: DURATION_MAP[difficulty],
            userAnswer: challengeAnswer ? `${challengeAnswer.numerator}/${challengeAnswer.denominator}` : 'N/A',
            correctAnswer: `${(question.answer as Fraction).numerator}/${(question.answer as Fraction).denominator}`,
        });
        syncAnalyticsData();
    };

    const handleModeSelection = async (mode: FractionState) => {
        clearEquation();
        setGameState(mode);
        await logEvent('mode_start', currentUser, { model: 'fractions', mode });
        syncAnalyticsData();
        if (mode === 'challenge') {
            setGameState('challenge_difficulty_selection');
        } else if (mode === 'explore') {
            setExploreView('operations');
        } else if (mode === 'training') {
            setTrainingStep(0);
            setConceptDenominator(4);
            setConceptSelectedPieces(Array(4).fill(false));
            setNumberLineDenominator(4);
            setSelectedNumberLinePoint(null);
            spokenStepsRef.current.clear();
        }
    };

    const getSubtitle = () => {
        switch (gameState) {
            case 'training': return 'Training Mode';
            case 'challenge': return 'Challenge Mode';
            case 'explore': return 'Explore Mode';
            case 'mode_selection': return 'Choose a Mode';
            case 'challenge_difficulty_selection': return 'Select Difficulty';
            default: return null;
        }
    };

    const renderMainContent = () => {
        switch(gameState) {
            case 'welcome': return <WelcomeScreen onStart={() => setGameState('mode_selection')} />;
            case 'mode_selection': return <ModeSelector onSelectMode={handleModeSelection} />;
            case 'challenge_difficulty_selection': return <DifficultySelector onSelectDifficulty={startChallenge} onBack={goBackToMenu} />;
            case 'explore':
                return (
                    <div className="fractions-theme w-full flex-grow flex flex-col items-center justify-center">
                        <div className="w-full max-w-7xl flex flex-col items-center animate-pop-in p-4 rounded-2xl bg-slate-900/20">
                            <ExploreViewSwitcher activeView={exploreView} onSelectView={setExploreView} />
                            {exploreView === 'operations' && (
                                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-4">
                                    <div className="lg:sticky top-24"><FractionWall onSelect={handleSelectFraction} pulseOn={wallPulse} /></div>
                                    <div className="flex flex-col gap-4">
                                        <CalculationCanvas equation={equation} />
                                        <FractionControls onOperatorSelect={handleSelectOperator} onSolve={handleSolve} onClear={clearEquation} equation={equation} />
                                        <CalculationStepsPanel equation={equation} />
                                    </div>
                                </div>
                            )}
                            {exploreView === 'anatomy' && <div className="mt-6"><ConceptIntro isTrainingMode={false} /></div>}
                            {exploreView === 'number_line' && <div className="mt-6"><NumberLine isExploreMode={true} /></div>}
                        </div>
                    </div>
                );
            case 'training':
                const trainingUI = currentTrainingStep?.ui || 'operations';
                return (
                     <div className="fractions-theme w-full flex-grow flex flex-col items-center justify-center">
                        <div className="w-full max-w-7xl flex flex-col items-center animate-pop-in p-4 rounded-2xl bg-slate-900/20">
                            <TrainingGuide 
                                currentStep={currentTrainingStep} 
                                onComplete={goBackToMenu} 
                                feedback={trainingFeedback}
                                onContinue={() => setTrainingStep(prev => prev + 1)}
                            />
                            
                            {trainingUI === 'concept' ? (
                                <ConceptIntro 
                                    isTrainingMode={true}
                                    onAction={handleConceptAction}
                                    currentStep={currentTrainingStep}
                                    denominator={conceptDenominator}
                                    selectedPieces={conceptSelectedPieces}
                                />
                            ) : trainingUI === 'number_line' ? (
                                <NumberLine
                                    denominator={numberLineDenominator}
                                    onSelectPoint={setSelectedNumberLinePoint}
                                    currentStep={currentTrainingStep}
                                />
                            ) : (
                                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-4">
                                    <div className="lg:sticky top-24">
                                        <FractionWall 
                                            onSelect={handleSelectFraction} 
                                            pulseOn={wallPulse}
                                            spotlightOn={currentTrainingStep?.spotlightOn && typeof currentTrainingStep.spotlightOn === 'object' ? currentTrainingStep.spotlightOn : undefined}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <CalculationCanvas equation={equation} />
                                        {/* Fix: Narrow the type of spotlightOn to only pass values expected by FractionControls. */}
                                        <FractionControls
                                            onOperatorSelect={handleSelectOperator}
                                            onSolve={handleSolve}
                                            onClear={clearEquation}
                                            equation={equation}
                                            spotlightOn={
                                                typeof currentTrainingStep?.spotlightOn === 'string' &&
                                                (currentTrainingStep.spotlightOn === '+' ||
                                                    currentTrainingStep.spotlightOn === '-' ||
                                                    currentTrainingStep.spotlightOn === 'solve')
                                                    ? currentTrainingStep.spotlightOn
                                                    : undefined
                                            }
                                        />
                                        <CalculationStepsPanel equation={equation} />
                                    </div>
                                </div>
                            )}
                        </div>
                     </div>
                );
            default: // Challenge Mode
                const currentQuestion = filteredQuestions[currentQuestionIndex];
                return (
                    <div className="fractions-theme w-full flex-grow flex flex-col items-center justify-center">
                        <div className="w-full max-w-7xl flex flex-col items-center animate-pop-in p-4 rounded-2xl bg-slate-900/20">
                            {gameState === 'challenge' && currentQuestion && (
                                <FractionChallengePanel 
                                    status={challengeStatus}
                                    question={currentQuestion}
                                    onCheckAnswer={handleCheckAnswer}
                                    onClearAnswer={clearEquation}
                                    onNext={handleNextChallenge}
                                    onTimeOut={handleTimeOut}
                                    score={score}
                                    timeLimit={DURATION_MAP[difficulty]}
                                />
                            )}

                            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-4">
                                <div className="lg:sticky top-24">
                                    <FractionWall onSelect={handleSelectFraction} pulseOn={wallPulse} />
                                </div>

                                <div className="flex flex-col gap-4">
                                    <CalculationCanvas equation={{...initialEquationState, term1: challengeAnswer}} isChallengeMode={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                );
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
                showScore={gameState === 'challenge'}
                score={score}
            />
            <main className="flex-grow flex flex-col items-center justify-center p-2 sm:p-4">
                {renderMainContent()}
            </main>
            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
            {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
        </div>
    );
};
