import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { Fraction, FractionState, Difficulty, FractionChallengeQuestion, UserInfo, WorkspacePiece, FractionTrainingStep, EquationState, FractionOperator } from '../../types';
import { Header } from '../../components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ModeSelector } from './components/ModeSelector';
import { DifficultySelector } from '../../components/DifficultySelector';
import { FractionChart } from './components/FractionWall';
import { Workspace } from './components/CalculationCanvas';
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

function fractionsAreEqual(f1: Fraction | null, f2: Fraction | null): boolean {
    if (!f1 || !f2) return false;
    if(f1.numerator === 0 && f2.numerator === 0) return true;
    return f1.numerator * f2.denominator === f2.numerator * f1.denominator;
}

const DURATION_MAP: Record<Difficulty, number> = { easy: 45, medium: 35, hard: 25 };

export const FractionsApp: React.FC<{ onExit: () => void; currentUser: UserInfo | null }> = ({ onExit, currentUser }) => {
    const [gameState, setGameState] = useState<FractionState>('welcome');
    const [showHelp, setShowHelp] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [workspacePieces, setWorkspacePieces] = useState<WorkspacePiece[]>([]);
    const [isDropZoneActive, setIsDropZoneActive] = useState(false);
    
    // Training State
    const [trainingStep, setTrainingStep] = useState(0);
    const [incorrectActionFeedback, setIncorrectActionFeedback] = useState<string | null>(null);
    const spokenStepsRef = useRef<Set<number>>(new Set());
    const { isSpeechEnabled } = useAudio();
    const currentTrainingStep = useMemo(() => fractionTrainingPlan.find(s => s.step === trainingStep) || null, [trainingStep]);

    // Solution Panel State
    const [showSolutionPanel, setShowSolutionPanel] = useState(false);
    const [equationForSolution, setEquationForSolution] = useState<EquationState | null>(null);
    
    const clearWorkspace = useCallback(() => {
        setWorkspacePieces([]);
        setShowSolutionPanel(false);
        setEquationForSolution(null);
    }, []);

    const advanceStep = useCallback(() => {
        const step = fractionTrainingPlan.find(s => s.step === trainingStep);
        if (step?.clearWorkspaceAfter) {
            clearWorkspace();
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
        if (fractionData) {
            const fraction = JSON.parse(fractionData) as Fraction;
            const newPiece: WorkspacePiece = {
                id: `wp-${Date.now()}`,
                fraction,
                position: { x: 0, y: workspacePieces.length * 50 }, // Simple stacking
                state: 'idle',
            };
            setWorkspacePieces(prev => [...prev, newPiece]);
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };


    const goBackToMenu = useCallback(() => {
        clearWorkspace();
        setGameState('mode_selection');
        spokenStepsRef.current.clear();
        setTrainingStep(0);
        cancelSpeech();
    }, [clearWorkspace]);

    const handleBarClick = useCallback((clickedFraction: Fraction) => {
        if (gameState !== 'training' || !currentTrainingStep) return;

        if (
            currentTrainingStep.type === 'action' &&
            currentTrainingStep.requiredAction === 'click_bar'
        ) {
            if (fractionsAreEqual(clickedFraction, currentTrainingStep.requiredValue as Fraction)) {
                setIncorrectActionFeedback(null);
                advanceStep();
            } else {
                setIncorrectActionFeedback("That's not the longer one. Try again!");
                setTimeout(() => setIncorrectActionFeedback(null), 2500);
            }
        }
    }, [gameState, currentTrainingStep, advanceStep]);
    
    const handleSolve = () => {
        if (gameState === 'training' && currentTrainingStep?.requiredAction === 'solve') {
            const equation = {
                term1: { numerator: 1, denominator: 3 },
                operator: '+' as FractionOperator,
                term2: { numerator: 1, denominator: 6 },
                unsimplifiedResult: { numerator: 3, denominator: 6 },
                result: { numerator: 1, denominator: 2 },
                isSolved: true,
            };
            setEquationForSolution(equation);
            setShowSolutionPanel(true);
            advanceStep();
        }
    };


    useEffect(() => {
        // Cleanup speech on unmount
        return () => {
            cancelSpeech();
        }
    }, []);
    
    useEffect(() => {
        if (gameState !== 'training' || !currentTrainingStep) return;

        let isMounted = true;
        const step = currentTrainingStep;
        
        const executeStep = async () => {
            if (isSpeechEnabled && !spokenStepsRef.current.has(step.step)) {
                // To improve reliability, cancel any lingering speech from a previous, fast-advancing step.
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
                if (!isSpeechEnabled) {
                    await new Promise(r => setTimeout(r, step.duration || 4000));
                }
                if (isMounted) advanceStep();
            } else if (step.type === 'action') {
                if (step.requiredAction === 'drag_piece') {
                    const requiredFraction = step.requiredValue as Fraction;
                    const count = workspacePieces.filter(p => 
                        fractionsAreEqual(p.fraction, requiredFraction)
                    ).length;

                    if (count >= (step.requiredCount || 1)) {
                        if (isMounted) advanceStep();
                    }
                }
            }
        }
        
        executeStep();
        return () => { isMounted = false };
    }, [gameState, trainingStep, currentTrainingStep, isSpeechEnabled, workspacePieces, advanceStep]);

    const handleModeSelection = async (mode: FractionState) => {
        clearWorkspace();
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
            case 'explore':
                return (
                    <div className="fractions-theme w-full flex-grow flex flex-col items-center justify-center p-4">
                        <div className="w-full max-w-4xl flex flex-col items-center animate-pop-in">
                            {gameState === 'training' && currentTrainingStep && (
                                <TrainingGuide currentStep={currentTrainingStep} onComplete={goBackToMenu} onContinue={() => advanceStep()} incorrectActionFeedback={incorrectActionFeedback} />
                            )}
                            <FractionChart 
                                onPieceDragStart={handlePieceDragStart} 
                                spotlightOn={currentTrainingStep?.spotlightOn}
                                trainingRequiredFraction={trainingRequiredFraction}
                            />
                            <div className="w-full mt-4">
                                <Workspace 
                                    pieces={workspacePieces}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    isDropZoneActive={isDropZoneActive}
                                    spotlightOn={currentTrainingStep?.spotlightOn}
                                    onBarClick={gameState === 'training' && currentTrainingStep?.requiredAction === 'click_bar' ? handleBarClick : undefined}
                                />
                                <div className="mt-4 flex justify-between items-center">
                                    <div>
                                        {gameState === 'training' && currentTrainingStep?.requiredAction === 'solve' && (
                                            <button
                                                onClick={handleSolve}
                                                className={`control-button bg-green-600 border-green-800 hover:bg-green-500 ${currentTrainingStep.spotlightOn === 'solve_button' ? 'animate-guide-pulse' : ''}`}
                                            >
                                                Solve
                                            </button>
                                        )}
                                    </div>
                                    <button onClick={() => clearWorkspace()} className="control-button bg-red-600 border-red-800 hover:bg-red-500">
                                        Clear Workspace
                                    </button>
                                </div>
                                {showSolutionPanel && equationForSolution && (
                                    <CalculationStepsPanel equation={equationForSolution} isVisible={showSolutionPanel} />
                                )}
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