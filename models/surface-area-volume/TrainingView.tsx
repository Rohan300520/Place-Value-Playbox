
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { UserInfo, ShapeType, ShapeDimensions, CalculationType, CalculationResult, SurfaceAreaTrainingStep } from '../../types';
import { ShapeSelector } from './components/ShapeSelector';
import { ShapeViewer } from './components/ShapeViewer';
import { ControlsPanel } from './components/ControlsPanel';
import { CalculationPanel } from './components/CalculationPanel';
import { TrainingGuide } from './components/TrainingGuide';
import { SHAPE_DATA, TRAINING_PLANS } from './utils/trainingPlan';
import { speak, cancelSpeech } from '../../utils/speech';
import { useAudio } from '../../contexts/AudioContext';

interface TrainingViewProps {
    currentUser: UserInfo | null;
    onComplete: () => void;
}

export const TrainingView: React.FC<TrainingViewProps> = ({ currentUser, onComplete }) => {
    const [selectedShape, setSelectedShape] = useState<ShapeType | null>(null);
    const [dimensions, setDimensions] = useState<ShapeDimensions>({});
    const [calculationType, setCalculationType] = useState<CalculationType>('volume');
    const [calculationResult, setCalculationResult] = useState<CalculationResult>(null);
    const [isUnfolded, setIsUnfolded] = useState(false);
    
    const [stepIndex, setStepIndex] = useState(0);
    const [trainingPlan, setTrainingPlan] = useState<SurfaceAreaTrainingStep[]>([]);
    const [isWaitingForAction, setIsWaitingForAction] = useState(false);
    
    const { isSpeechEnabled } = useAudio();
    const spokenSteps = React.useRef(new Set<number>());

    const currentStep = trainingPlan[stepIndex];
    
    // Ref to prevent stale closures in action handlers
    const actionStateRef = useRef({ isWaiting: false, step: currentStep });
    actionStateRef.current = { isWaiting: isWaitingForAction, step: currentStep };

    const advanceStep = useCallback(() => {
        setIsWaitingForAction(false);
        setStepIndex(prev => Math.min(prev + 1, trainingPlan.length - 1));
    }, [trainingPlan.length]);

    useEffect(() => {
        if (!currentStep) return;

        let isMounted = true;
        const processStep = async () => {
            if (currentStep.unfoldOnStep) {
                setIsUnfolded(true);
            }

            // If the current action is to select a calc type that's already selected, just advance.
            if (currentStep.type === 'action' && currentStep.requiredAction === 'select_calc_type' && calculationType === currentStep.requiredValue) {
                setTimeout(advanceStep, 300); // Small delay for smoother UX
                return;
            }

            if (isSpeechEnabled && !spokenSteps.current.has(currentStep.step)) {
                spokenSteps.current.add(currentStep.step);
                await speak(currentStep.text, 'en-US');
            }
            if (!isMounted) return;

            if (currentStep.type === 'intro' || currentStep.type === 'feedback') {
                if (!isSpeechEnabled) {
                    await new Promise(resolve => setTimeout(resolve, currentStep.duration || 4000));
                }
                 if (isMounted) advanceStep();
            } else if (currentStep.type === 'action' || currentStep.type === 'complete') {
                setIsWaitingForAction(true);
            }
        };

        processStep();
        return () => { isMounted = false; }
    }, [currentStep, advanceStep, isSpeechEnabled, calculationType]);

    const handleAction = useCallback((action: SurfaceAreaTrainingStep['requiredAction'], value?: any) => {
        const { isWaiting, step } = actionStateRef.current;

        if (isWaiting && step?.requiredAction === action) {
            if (step.requiredValue === undefined || step.requiredValue === value) {
                setIsWaitingForAction(false); // Prevent double-clicks
                advanceStep();
            }
        }
    }, [advanceStep]);
    
    const handleSelectShape = useCallback((shape: ShapeType) => {
        const plan = TRAINING_PLANS[shape];
        if (plan && plan.length > 0) {
            setSelectedShape(shape);
            setDimensions(SHAPE_DATA[shape].defaultDimensions);
            setTrainingPlan(plan);
            setStepIndex(0);
            setIsUnfolded(false);
            setCalculationResult(null);
            setCalculationType('volume');
            spokenSteps.current.clear();
        } else {
            alert("Training for this shape is coming soon!");
        }
    }, []);

    const handleCalculate = () => {
        if (!selectedShape) return;
        const result = SHAPE_DATA[selectedShape].calculate(dimensions, calculationType);
        setCalculationResult(result);
        handleAction('calculate', calculationType);
    };
    
    if (!selectedShape) {
        return <ShapeSelector onSelectShape={handleSelectShape} isTraining={true} />;
    }
    
    const shapeInfo = SHAPE_DATA[selectedShape];

    return (
        <div className="w-full flex-grow flex flex-col lg:flex-row gap-4 animate-pop-in min-h-0 lg:h-full">
            {/* Left Panel: 3D Viewer - Full height on desktop */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4 lg:h-full">
                <div className="flex-grow rounded-2xl shadow-lg border relative min-h-[300px] sm:min-h-[400px] lg:min-h-0 lg:h-full" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)' }}>
                    <ShapeViewer 
                        shapeType={selectedShape}
                        dimensions={dimensions}
                        isUnfolded={isUnfolded}
                        renderMode={'solid'}
                        highlightPartId={currentStep?.highlightPartId ?? null}
                        isTraining={true}
                    />
                </div>
            </div>
            
            {/* Right Panel: Guide, Controls & Calculation - Scrollable on desktop */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4 lg:h-full lg:overflow-y-auto lg:pr-2 custom-scrollbar">
                <TrainingGuide currentStep={currentStep} onContinue={() => handleAction('continue')} onComplete={onComplete} />
                <ControlsPanel 
                    shapeConfig={shapeInfo}
                    dimensions={dimensions}
                    onDimensionsChange={(dims) => {
                        setDimensions(dims);
                        handleAction('change_dimension');
                    }}
                    calculationType={calculationType}
                    onCalculationTypeChange={(type) => {
                        setCalculationType(type);
                        handleAction('select_calc_type', type);
                    }}
                    onCalculate={handleCalculate}
                    isUnfolded={isUnfolded}
                    onToggleUnfold={() => {
                        setIsUnfolded(v => !v);
                        handleAction('unfold');
                    }}
                    renderMode={'solid'}
                    onRenderModeChange={() => {}}
                    isTraining={true}
                    spotlightOn={currentStep?.spotlightOn}
                />
                {calculationResult && <CalculationPanel result={calculationResult} onHoverPart={() => {}} onLeavePart={() => {}}/>}
            </div>
        </div>
    );
};
