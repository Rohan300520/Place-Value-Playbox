import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { Fraction, FractionState, Difficulty, FractionChallengeQuestion, UserInfo, WorkspacePiece, FractionTrainingStep, EquationState, FractionOperator } from '../../types';
import { Header } from '../../components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ModeSelector } from './components/ModeSelector';
import { DifficultySelector } from '../../components/DifficultySelector';
import { FractionChart } from './components/FractionWall';
import { CalculationWorkspace } from './components/CalculationWorkspace';
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
import { addFractions, subtractFractions, simplifyFraction, lcm, getFractionalValue, fractionsAreEqual } from './utils/fractions';


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
    
    // Training State
    const [trainingStep, setTrainingStep] = useState(0);
    const [workspacePieces, setWorkspacePieces] = useState<WorkspacePiece[]>([]); // Only for training
    const [incorrectActionFeedback, setIncorrectActionFeedback] = useState<string | null>(null);
    const spokenStepsRef = useRef<Set<number>>(new Set());
    const { isSpeechEnabled } = useAudio();
    const currentTrainingStep = useMemo(() => fractionTrainingPlan.find(s => s.step === trainingStep) || null, [trainingStep]);

    // Explore Mode State
    const [equation, setEquation] = useState<EquationState>(EMPTY_EQUATION);
    
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

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
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
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
    
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
            resultPieces.push({
                id: `result-${Date.now()}`,
                fraction: finalResult,
                position: { x: 0, y: 0 },
                state: 'idle',
            });
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
                resultPieces: [],
                isSolved: true,
            };
            setEquation(solvedEquation);
            advanceStep();
        }
    };

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

            if (step.animation === 'remove' && step.animationTarget) {
                const targetFraction = step.animationTarget as Fraction;
                setWorkspacePieces(prev => {
                    const targetIndex = prev.findLastIndex(p => fractionsAreEqual(p.fraction, targetFraction) && p.state === 'idle');
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
        }
    };
    
    const getSubtitle = () => {
        switch (gameState) {
            case 'training': return 'Training Mode';
            case 'explore': return 'Explore Mode';
            case 'challenge': return 'Challenge Mode';
            case 'mode_selection': return 'Choose a Mode';
            default: return null;
        }
    };

    const trainingRequiredFraction = (gameState === 'training' && currentTrainingStep?.requiredAction === 'drag_piece' && currentTrainingStep.requiredValue && !Array.isArray(currentTrainingStep.requiredValue))
        ? currentTrainingStep.requiredValue as Fraction
        : null;

    const renderMainContent = () => {
        switch(gameState) {
            case 'welcome': return <WelcomeScreen onStart={() => setGameState('mode_selection')} />;
            case 'mode_selection': return <ModeSelector onSelectMode={handleModeSelection} />;
            case 'training':
                return (
                    <div className="fractions-theme w-full flex-grow flex flex-col items-center justify-center p-4">
                        <div className="w-full max-w-4xl flex flex-col items-center animate-pop-in">
                            {currentTrainingStep && <TrainingGuide currentStep={currentTrainingStep} onComplete={goBackToMenu} onContinue={() => advanceStep()} incorrectActionFeedback={incorrectActionFeedback} />}
                            <FractionChart onPieceDragStart={handlePieceDragStart} spotlightOn={currentTrainingStep?.spotlightOn} trainingRequiredFraction={trainingRequiredFraction} />
                            <div className="w-full mt-4">
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
                );
            case 'explore':
                 return (
                    <div className="fractions-theme w-full flex-grow flex flex-col items-center justify-center p-4">
                        <div className="w-full max-w-4xl flex flex-col items-center animate-pop-in">
                            <EquationInfoPanel equation={equation} />
                            <FractionChart onPieceDragStart={handlePieceDragStart} />
                             <div className="w-full mt-4">
                               <CalculationWorkspace equation={equation} onDrop={handleDrop} onDragOver={handleDragOver} isDropZoneActive={isDropZoneActive} />
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
                );
            case 'challenge': // Simplified challenge
                return <div className="text-2xl font-chalk text-chalk-yellow">Challenge Mode Coming Soon for this new UI!</div>;
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