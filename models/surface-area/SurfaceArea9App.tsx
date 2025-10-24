import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Header } from '../../components/Header';
import type { UserInfo, ShapeType, ShapeDimensions, CalculationType, CalculationResult, SurfaceAreaState, Difficulty, SurfaceAreaChallengeQuestion, SurfaceAreaTrainingStep, RenderMode } from '../../types';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ModeSelector } from './components/ModeSelector';
import { Canvas3D } from './components/Canvas3D';
import { SolutionPanel } from './components/SolutionPanel';
import { DifficultySelector } from '../../components/DifficultySelector';
import { ChallengePanel } from './components/ChallengePanel';
import { TrainingGuide } from './components/TrainingGuide';
import { HelpModal } from './components/HelpModal';
import { ControlPanel } from './components/ControlPanel';
import { SHAPE_DATA, CLASS_9_SHAPES } from './utils/formulas';
import { challenges } from './utils/challenges';
import { trainingPlans9 } from './utils/training';
import { logEvent, syncAnalyticsData } from '../../utils/analytics';
import { Confetti } from '../../components/Confetti';
import { useAudio } from '../../contexts/AudioContext';
import { speak, cancelSpeech } from '../../utils/speech';

const DURATION_MAP: Record<Difficulty, number> = { easy: 120, medium: 90, hard: 60 };

export const SurfaceArea9App: React.FC<{ onExit: () => void; currentUser: UserInfo | null }> = ({ onExit, currentUser }) => {
    const [viewState, setViewState] = useState<SurfaceAreaState>('welcome');
    const [selectedShape, setSelectedShape] = useState<ShapeType | null>(null);
    const [dimensions, setDimensions] = useState<ShapeDimensions>({});
    const [calculationType, setCalculationType] = useState<CalculationType>('volume');
    const [result, setResult] = useState<CalculationResult>(null);
    const [comparisonResult, setComparisonResult] = useState<CalculationResult>(null);
    const [isUnfolded, setIsUnfolded] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [highlightedPart, setHighlightedPart] = useState<string | string[] | null>(null);
    const [renderMode, setRenderMode] = useState<RenderMode>('solid');
    const [isComparisonView, setIsComparisonView] = useState(false);

    // --- Challenge State ---
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [questions, setQuestions] = useState<SurfaceAreaChallengeQuestion[]>([]);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [challengeStatus, setChallengeStatus] = useState<'playing' | 'correct' | 'incorrect' | 'timed_out'>('playing');
    const [score, setScore] = useState(0);
    const [lastCalculatedValue, setLastCalculatedValue] = useState<number | null>(null);
    const challengeStartTimeRef = useRef<number | null>(null);

    // --- Training State ---
    const [trainingStep, setTrainingStep] = useState(0);
    const [currentTrainingPlan, setCurrentTrainingPlan] = useState<SurfaceAreaTrainingStep[] | null>(null);
    const currentTrainingStep = useMemo(() => currentTrainingPlan?.[trainingStep] || null, [currentTrainingPlan, trainingStep]);
    const dimensionChangedRef = useRef(false);

    // --- Audio State ---
    const { isSpeechEnabled } = useAudio();
    const spokenStepsRef = useRef(new Set<string>());

    const resetCalculator = useCallback((isFullReset: boolean = true) => {
        setResult(null);
        setComparisonResult(null);
        setIsUnfolded(false);
        setLastCalculatedValue(null);
        setHighlightedPart(null);
        setIsComparisonView(false);
        if (isFullReset) {
            setSelectedShape(null);
            setDimensions({});
        }
        if (viewState === 'training') {
            setCurrentTrainingPlan(null);
            setTrainingStep(0);
        }
    }, [viewState]);
    
    const handleShapeSelect = (shape: ShapeType) => {
        const shapeInfo = SHAPE_DATA[shape];
        setSelectedShape(shape);
        setDimensions(shapeInfo.defaultDimensions);
        setCalculationType('volume');
        resetCalculator(false);

        if (viewState === 'training') {
            const plan = trainingPlans9[shape];
            if (plan) {
                setCurrentTrainingPlan(plan);
                setTrainingStep(0);
            }
        }
    };

    const handleDimensionChange = (newDimensions: ShapeDimensions) => {
        setDimensions(newDimensions);
        setResult(null);
        setComparisonResult(null);
        setLastCalculatedValue(null);
        setHighlightedPart(null);
        if(viewState === 'training') dimensionChangedRef.current = true;
    };
    
    const handleCalculationTypeChange = (type: CalculationType) => {
        setCalculationType(type);
        setResult(null);
        setComparisonResult(null);
        setLastCalculatedValue(null);
        setHighlightedPart(null);
    };

    const handleCalculate = () => {
        if (!selectedShape) return;
        const shapeInfo = SHAPE_DATA[selectedShape];
        const calculationFn = shapeInfo.formulas[calculationType];
        if (calculationFn) {
            const calcResult = calculationFn(dimensions);
            setResult(calcResult);

            if (calculationType === 'lsa') {
                setHighlightedPart(shapeInfo.lsaPartIds || null);
            } else {
                setHighlightedPart(null);
            }

            if (viewState === 'challenge') {
                setLastCalculatedValue(calcResult.value);
            }
        }
    };

    const handleToggleComparison = () => {
        const turningOn = !isComparisonView;
        setIsComparisonView(turningOn);

        if (turningOn) {
            const dims = { r: 2.5, h: 5 };
            setSelectedShape('cylinder');
            setDimensions(dims);
            setCalculationType('volume');
            setIsUnfolded(false);
            setRenderMode('solid');
            
            const cylResult = SHAPE_DATA.cylinder.formulas.volume!(dims);
            const coneResult = SHAPE_DATA.cone.formulas.volume!(dims);
            setResult(cylResult);
            setComparisonResult(coneResult);
        } else {
            resetCalculator(true);
        }
    };

    const goBackToMenu = useCallback(() => {
        resetCalculator(true);
        if (viewState === 'explore' || viewState === 'training' || viewState === 'challenge') {
            setViewState('mode_selection');
        } else {
            setViewState('welcome');
        }
    }, [viewState, resetCalculator]);

    const handleModeSelect = async (mode: 'training' | 'explore' | 'challenge') => {
        resetCalculator(true);
        await logEvent('mode_start', currentUser, { model: 'surface_area_9', mode });
        syncAnalyticsData();
        if (mode === 'challenge') {
            setViewState('challenge_difficulty_selection');
        } else {
            setViewState(mode);
            if (mode === 'training') {
                setTrainingStep(0);
                spokenStepsRef.current.clear();
            }
        }
    };

    // --- Challenge Logic ---
    const startChallenge = (diff: Difficulty) => {
        const classQuestions = challenges.filter(q => q.class === 9 && q.level === diff);
        setQuestions([...classQuestions].sort(() => 0.5 - Math.random()));
        setDifficulty(diff);
        setQuestionIndex(0);
        setScore(0);
        setChallengeStatus('playing');
        resetCalculator(true);
        setViewState('challenge');
        challengeStartTimeRef.current = Date.now();
    };

    const handleChallengeCheck = async () => {
        const question = questions[questionIndex];
        if (!question || !selectedShape || lastCalculatedValue === null) return;

        const isCorrectShape = selectedShape === question.shape;
        const isCorrectCalcType = calculationType === question.calculationType;
        const answerDifference = Math.abs(lastCalculatedValue - question.answer);
        const isCorrectAnswer = answerDifference <= (question.tolerance || 0.01);

        const isCorrect = isCorrectShape && isCorrectCalcType && isCorrectAnswer;
        
        const durationSeconds = challengeStartTimeRef.current ? (Date.now() - challengeStartTimeRef.current) / 1000 : 0;
        await logEvent('challenge_attempt', currentUser, {
            model: 'surface_area_9',
            questionId: question.id,
            questionText: question.question,
            level: difficulty,
            status: isCorrect ? 'correct' : 'incorrect',
            durationSeconds,
            userAnswer: lastCalculatedValue,
            correctAnswer: question.answer,
        });
        syncAnalyticsData();

        if (isCorrect) {
            setChallengeStatus('correct');
            setScore(s => s + 10);
            setShowConfetti(true);
        } else {
            setChallengeStatus('incorrect');
        }
    };
    
    const handleChallengeTimeout = async () => {
        const question = questions[questionIndex];
        if (!question) return;
        await logEvent('challenge_attempt', currentUser, {
            model: 'surface_area_9',
            questionId: question.id,
            questionText: question.question,
            level: difficulty,
            status: 'timed_out',
            durationSeconds: DURATION_MAP[difficulty],
            userAnswer: lastCalculatedValue,
            correctAnswer: question.answer,
        });
        syncAnalyticsData();
        setChallengeStatus('timed_out');
    };

    const handleNextChallenge = () => {
        if (questionIndex < questions.length - 1) {
            setQuestionIndex(i => i + 1);
            setChallengeStatus('playing');
            resetCalculator(true);
            challengeStartTimeRef.current = Date.now();
        } else {
            goBackToMenu(); // End of challenges
        }
    };

    // --- Training Logic ---
    const advanceTrainingStep = useCallback(() => {
        dimensionChangedRef.current = false;
        setHighlightedPart(null);
        setTrainingStep(t => t + 1);
    }, []);
    
    useEffect(() => {
        const step = currentTrainingStep;
        if (viewState !== 'training' || !step || !selectedShape) {
            if (viewState !== 'training') {
                cancelSpeech();
                spokenStepsRef.current.clear();
            }
            return;
        }
        let isComponentMounted = true;
        const executeStep = async () => {
            setHighlightedPart(step.highlightPartId ?? null);
            const stepKey = `${selectedShape}-${step.step}`;

            if (isSpeechEnabled && !spokenStepsRef.current.has(stepKey)) {
                cancelSpeech();
                await speak(step.text, 'en-US');
                spokenStepsRef.current.add(stepKey);
            }
            switch (step.type) {
                case 'intro': case 'feedback':
                    if (!isSpeechEnabled) await new Promise(r => setTimeout(r, step.duration));
                    if (isComponentMounted) advanceTrainingStep();
                    break;
                case 'action':
                    let actionCompleted = false;
                    if (step.requiredAction === 'select_shape' && selectedShape === step.requiredValue) actionCompleted = true;
                    else if (step.requiredAction === 'change_dimension' && dimensionChangedRef.current) actionCompleted = true;
                    else if (step.requiredAction === 'select_calc_type' && calculationType === step.requiredValue) actionCompleted = true;
                    else if (step.requiredAction === 'calculate' && result) actionCompleted = true;
                    else if (step.requiredAction === 'unfold' && isUnfolded) actionCompleted = true;
                    else if (step.requiredAction === 'toggle_comparison' && isComparisonView) actionCompleted = true;
                    else if (step.requiredAction === 'return_to_selector') {
                        resetCalculator(true);
                        advanceTrainingStep();
                        return;
                    }
                    if (actionCompleted) advanceTrainingStep();
                    break;
                case 'complete': break;
            }
        };
        executeStep();
        return () => { isComponentMounted = false; };
    }, [viewState, trainingStep, currentTrainingStep, selectedShape, calculationType, result, isUnfolded, isSpeechEnabled, advanceTrainingStep, resetCalculator, dimensions, isComparisonView]);


    const renderContent = () => {
        const currentQuestion = questions[questionIndex];
        const unit = (viewState === 'challenge' && currentQuestion?.unit) ? currentQuestion.unit : 'units';
        
        const mainContent = (
            <>
                { (selectedShape || isComparisonView) ? (
                    <div className="flex flex-col lg:flex-row gap-6 w-full flex-1">
                        <div className="w-full lg:w-1/4">
                             <ControlPanel
                                shapes={CLASS_9_SHAPES}
                                selectedShape={selectedShape}
                                onShapeSelect={handleShapeSelect}
                                dimensions={dimensions}
                                onDimensionChange={handleDimensionChange}
                                calculationType={calculationType}
                                onCalculationTypeChange={handleCalculationTypeChange}
                                onCalculate={handleCalculate}
                                isUnfolded={isUnfolded}
                                onToggleUnfold={() => setIsUnfolded(!isUnfolded)}
                                unit={unit}
                                renderMode={renderMode}
                                onRenderModeChange={setRenderMode}
                                isComparisonView={isComparisonView}
                                onToggleComparison={handleToggleComparison}
                                isTraining={viewState === 'training'}
                                trainingStep={currentTrainingStep}
                            />
                        </div>
                        <div className="h-96 lg:h-auto lg:flex-1">
                            <Canvas3D 
                                shape={selectedShape!} 
                                dimensions={dimensions} 
                                isUnfolded={isUnfolded} 
                                highlightedPartId={highlightedPart}
                                renderMode={renderMode}
                                comparisonData={isComparisonView ? { shape: 'cone', dimensions } : undefined}
                                />
                        </div>
                        <div className="w-full lg:w-1/4">
                            {result && <SolutionPanel result={result} unit={unit} onHighlightPart={setHighlightedPart} isComparisonView={isComparisonView} comparisonResult={comparisonResult} />}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                         <ControlPanel
                            shapes={CLASS_9_SHAPES}
                            selectedShape={selectedShape}
                            onShapeSelect={handleShapeSelect}
                            dimensions={dimensions}
                            onDimensionChange={handleDimensionChange}
                            calculationType={calculationType}
                            onCalculationTypeChange={handleCalculationTypeChange}
                            onCalculate={handleCalculate}
                            isUnfolded={isUnfolded}
                            onToggleUnfold={() => setIsUnfolded(!isUnfolded)}
                            unit={unit}
                            renderMode={renderMode}
                            onRenderModeChange={setRenderMode}
                            isComparisonView={isComparisonView}
                            onToggleComparison={handleToggleComparison}
                            isTraining={viewState === 'training'}
                            trainingStep={currentTrainingStep}
                        />
                    </div>
                )}
            </>
        );


        switch (viewState) {
            case 'welcome':
                return <WelcomeScreen onStart={() => setViewState('mode_selection')} title="Solid Shapes Explorer" grade="IX" />;
            case 'mode_selection':
                return <ModeSelector onSelectMode={handleModeSelect} />;
            case 'challenge_difficulty_selection':
                return <DifficultySelector onSelectDifficulty={startChallenge} onBack={() => setViewState('mode_selection')} />;
            
            case 'training':
            case 'explore':
            case 'challenge':
                 return (
                    <div className="w-full flex-1 flex flex-col items-center">
                         {viewState === 'challenge' && currentQuestion && (
                             <div className="w-full max-w-4xl mb-4">
                                <ChallengePanel question={currentQuestion} status={challengeStatus} onNext={handleNextChallenge} onTimeOut={handleChallengeTimeout} onCheckAnswer={handleChallengeCheck} lastCalculatedValue={lastCalculatedValue} score={score} timeLimit={DURATION_MAP[difficulty]} isSpeechEnabled={isSpeechEnabled} />
                            </div>
                        )}
                        {viewState === 'training' && currentTrainingStep && (
                            <div className="w-full max-w-6xl mb-4">
                                <TrainingGuide currentStep={currentTrainingStep} onComplete={goBackToMenu} onContinue={advanceTrainingStep} />
                            </div>
                        )}
                        {mainContent}
                    </div>
                );
        }
    };
    
    const getSubtitle = () => {
        switch(viewState) {
            case 'explore': return 'Explore Mode';
            case 'training': return currentTrainingPlan ? SHAPE_DATA[selectedShape!]?.name : 'Training Mode';
            case 'challenge': return 'Challenge Mode';
            default: return 'Class IX';
        }
    };

    return (
        <div className="flex-1 flex flex-col font-sans geometry-theme" style={{
            backgroundColor: 'var(--blueprint-bg)',
            backgroundImage: `
                linear-gradient(var(--blueprint-grid) 1px, transparent 1px),
                linear-gradient(90deg, var(--blueprint-grid) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
        }}>
            <Header
                onHelpClick={() => setShowHelp(true)}
                currentUser={currentUser}
                onExit={onExit}
                onBackToModelMenu={viewState !== 'welcome' && viewState !== 'mode_selection' ? goBackToMenu : undefined}
                modelTitle="Solid Shapes Explorer"
                modelSubtitle={getSubtitle()}
            />
            <main className="flex-1 flex items-center justify-center p-2 sm:p-4">
                {renderContent()}
            </main>
            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
            {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
        </div>
    );
};