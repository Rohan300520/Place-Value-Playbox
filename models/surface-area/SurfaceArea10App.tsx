import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Header } from '../../components/Header';
import type { UserInfo, ShapeType, ShapeDimensions, CalculationType, CalculationResult, SurfaceAreaState, Difficulty, SurfaceAreaChallengeQuestion, SurfaceAreaTrainingStep } from '../../types';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ModeSelector } from './components/ModeSelector';
import { ShapeSelector } from './components/ShapeSelector';
import { Canvas3D } from './components/Canvas3D';
import { InputPanel } from './components/InputPanel';
import { SolutionPanel } from './components/SolutionPanel';
import { DifficultySelector } from '../../components/DifficultySelector';
import { ChallengePanel } from './components/ChallengePanel';
import { TrainingGuide } from './components/TrainingGuide';
import { HelpModal } from './components/HelpModal';
import { SHAPE_DATA, CLASS_10_SHAPES } from './utils/formulas';
import { challenges } from './utils/challenges';
import { trainingPlan10 } from './utils/training';
import { logEvent, syncAnalyticsData } from '../../utils/analytics';
import { Confetti } from '../../components/Confetti';
import { useAudio } from '../../contexts/AudioContext';
import { speak, cancelSpeech } from '../../utils/speech';

const DURATION_MAP: Record<Difficulty, number> = { easy: 120, medium: 90, hard: 60 };

export const SurfaceArea10App: React.FC<{ onExit: () => void; currentUser: UserInfo | null }> = ({ onExit, currentUser }) => {
    const [viewState, setViewState] = useState<SurfaceAreaState>('welcome');
    const [selectedShape, setSelectedShape] = useState<ShapeType | null>(null);
    const [dimensions, setDimensions] = useState<ShapeDimensions>({});
    const [calculationType, setCalculationType] = useState<CalculationType>('volume');
    const [result, setResult] = useState<CalculationResult>(null);
    const [showHelp, setShowHelp] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

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
    const currentTrainingStep = useMemo(() => trainingPlan10.find(s => s.step === trainingStep) || null, [trainingStep]);
    const dimensionChangedRef = useRef(false);
    
    // --- Audio State ---
    const { isSpeechEnabled } = useAudio();
    const spokenStepsRef = useRef(new Set<number>());

    const handleShapeSelect = (shape: ShapeType) => {
        const shapeInfo = SHAPE_DATA[shape];
        setSelectedShape(shape);
        setDimensions(shapeInfo.defaultDimensions);
        setCalculationType('volume');
        setResult(null);
        setLastCalculatedValue(null);
    };

    const handleDimensionChange = (newDimensions: ShapeDimensions) => {
        setDimensions(newDimensions);
        setResult(null);
        setLastCalculatedValue(null);
        if(viewState === 'training') dimensionChangedRef.current = true;
    };
    
    const handleCalculationTypeChange = (type: CalculationType) => {
        setCalculationType(type);
        setResult(null);
        setLastCalculatedValue(null);
    };

    const handleCalculate = () => {
        if (!selectedShape) return;
        const shapeInfo = SHAPE_DATA[selectedShape];
        const calculationFn = shapeInfo.formulas[calculationType];
        if (calculationFn) {
            const calcResult = calculationFn(dimensions);
            setResult(calcResult);
            if(viewState === 'challenge') {
                setLastCalculatedValue(calcResult.value);
            }
        }
    };
    
    const resetCalculator = useCallback(() => {
        setSelectedShape(null);
        setResult(null);
        setDimensions({});
        setLastCalculatedValue(null);
    }, []);

    const goBackToMenu = useCallback(() => {
        resetCalculator();
        if (viewState === 'explore' || viewState === 'training' || viewState === 'challenge') {
            setViewState('mode_selection');
        }
    }, [viewState, resetCalculator]);

    const handleModeSelect = async (mode: 'training' | 'explore' | 'challenge') => {
        resetCalculator();
        await logEvent('mode_start', currentUser, { model: 'surface_area_10', mode });
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
        const classQuestions = challenges.filter(q => q.class === 10 && q.level === diff);
        setQuestions([...classQuestions].sort(() => 0.5 - Math.random()));
        setDifficulty(diff);
        setQuestionIndex(0);
        setScore(0);
        setChallengeStatus('playing');
        resetCalculator();
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
            model: 'surface_area_10',
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
            model: 'surface_area_10',
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
            resetCalculator();
            challengeStartTimeRef.current = Date.now();
        } else {
            goBackToMenu();
        }
    };

    // --- Training Logic ---
    useEffect(() => {
        const step = currentTrainingStep;
        if (viewState !== 'training' || !step) {
            cancelSpeech();
            spokenStepsRef.current.clear();
            return;
        }

        let isComponentMounted = true;

        const advance = () => {
            if (!isComponentMounted) return;
            dimensionChangedRef.current = false;
            setTrainingStep(t => t + 1);
        };

        // --- Handle auto-advancing steps ('intro' and 'feedback') ---
        if (step.type === 'intro' || step.type === 'feedback') {
            const performAdvance = async () => {
                if (isSpeechEnabled) {
                    if (!spokenStepsRef.current.has(step.step)) {
                        cancelSpeech();
                        spokenStepsRef.current.add(step.step);
                        await speak(step.text, 'en-US');
                        if (isComponentMounted) await new Promise(resolve => setTimeout(resolve, 500)); // Pause after speech
                    } else {
                        if (isComponentMounted) await new Promise(resolve => setTimeout(resolve, step.duration));
                    }
                } else {
                    if (isComponentMounted) await new Promise(resolve => setTimeout(resolve, step.duration));
                }
                advance();
            };
            performAdvance();
        
        // --- Handle action-based steps ---
        } else if (step.type === 'action') {
            if (isSpeechEnabled && !spokenStepsRef.current.has(step.step)) {
                cancelSpeech();
                speak(step.text, 'en-US');
                spokenStepsRef.current.add(step.step);
            }

            let actionCompleted = false;
            if (step.requiredAction === 'select_shape' && selectedShape === step.requiredValue) actionCompleted = true;
            else if (step.requiredAction === 'change_dimension' && dimensionChangedRef.current) actionCompleted = true;
            else if (step.requiredAction === 'select_calc_type' && calculationType === step.requiredValue) actionCompleted = true;
            else if (step.requiredAction === 'calculate' && result) actionCompleted = true;
            
            if (actionCompleted) {
                advance();
            }
        } else if (step.type === 'complete') {
             if (isSpeechEnabled && !spokenStepsRef.current.has(step.step)) {
                cancelSpeech();
                speak(step.text, 'en-US');
                spokenStepsRef.current.add(step.step);
            }
        }
        
        return () => {
            isComponentMounted = false;
        };
    }, [viewState, trainingStep, currentTrainingStep, selectedShape, calculationType, result, isSpeechEnabled]);


    const renderContent = () => {
        const currentQuestion = questions[questionIndex];
        const unit = (viewState === 'challenge' && currentQuestion?.unit) ? currentQuestion.unit : 'units';

        switch (viewState) {
            case 'welcome':
                return <WelcomeScreen onStart={() => setViewState('mode_selection')} title="Combined Solids Workshop" grade="X" />;
            case 'mode_selection':
                return <ModeSelector onSelectMode={handleModeSelect} />;
            case 'challenge_difficulty_selection':
                return <DifficultySelector onSelectDifficulty={startChallenge} onBack={() => setViewState('mode_selection')} />;
            
            case 'training':
            case 'explore':
            case 'challenge':
                const isShapeSelectionPhase = !selectedShape && (viewState === 'explore' || viewState === 'training' || (viewState === 'challenge' && challengeStatus === 'playing'));
                const showTrainingGuide = viewState === 'training' && currentTrainingStep;
                const showChallengePanel = viewState === 'challenge' && currentQuestion;

                return (
                    <div className="w-full h-full flex flex-col items-center">
                        {showChallengePanel && (
                             <div className="w-full max-w-4xl mb-6">
                                <ChallengePanel 
                                    question={currentQuestion}
                                    status={challengeStatus}
                                    onNext={handleNextChallenge}
                                    onTimeOut={handleChallengeTimeout}
                                    onCheckAnswer={handleChallengeCheck}
                                    lastCalculatedValue={lastCalculatedValue}
                                    score={score}
                                    timeLimit={DURATION_MAP[difficulty]}
                                    isSpeechEnabled={isSpeechEnabled}
                                />
                            </div>
                        )}
                        {isShapeSelectionPhase ? (
                            <ShapeSelector onSelect={handleShapeSelect} shapes={CLASS_10_SHAPES} spotlightOn={currentTrainingStep?.spotlightOn} />
                        ) : (
                            <div className="w-full h-full flex flex-col lg:flex-row gap-8 items-start">
                                <div className="w-full lg:w-3/5 h-[400px] lg:h-[600px] rounded-lg">
                                   <Canvas3D shape={selectedShape!} dimensions={dimensions} isUnfolded={false} />
                                </div>
                                <div className="w-full lg:w-2/5">
                                    <InputPanel
                                        shape={selectedShape!}
                                        dimensions={dimensions}
                                        onDimensionChange={handleDimensionChange}
                                        calculationType={calculationType}
                                        onCalculationTypeChange={handleCalculationTypeChange}
                                        onCalculate={handleCalculate}
                                        isUnfolded={false}
                                        onToggleUnfold={() => {}}
                                        isClass10={true}
                                        spotlightOn={currentTrainingStep?.spotlightOn}
                                        unit={unit}
                                    />
                                    {result && <SolutionPanel result={result} unit={unit} />}
                                </div>
                            </div>
                        )}
                        {showTrainingGuide && <TrainingGuide currentStep={currentTrainingStep} onComplete={goBackToMenu} onContinue={() => setTrainingStep(t => t + 1)} />}
                    </div>
                );
        }
    };
    
    const getSubtitle = () => {
        switch(viewState) {
            case 'explore': return 'Explore Mode';
            case 'training': return 'Training Mode';
            case 'challenge': return 'Challenge Mode';
            default: return 'Class X';
        }
    };

    return (
        <div className="geometry-theme min-h-screen flex flex-col font-sans w-full">
            <Header
                onHelpClick={() => setShowHelp(true)}
                currentUser={currentUser}
                onExit={onExit}
                onBackToModelMenu={viewState !== 'welcome' && viewState !== 'mode_selection' ? goBackToMenu : undefined}
                modelTitle="Combined Solids Workshop"
                modelSubtitle={getSubtitle()}
            />
            <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
                {renderContent()}
            </main>
            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
            {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
        </div>
    );
};
