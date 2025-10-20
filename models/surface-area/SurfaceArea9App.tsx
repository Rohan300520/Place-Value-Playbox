import React, { useState } from 'react';
import { Header } from '../../components/Header';
import type { UserInfo, ShapeType, ShapeDimensions, CalculationType, CalculationResult } from '../../types';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ShapeSelector } from './components/ShapeSelector';
import { Canvas3D } from './components/Canvas3D';
import { InputPanel } from './components/InputPanel';
import { SolutionPanel } from './components/SolutionPanel';
import { SHAPE_DATA, CLASS_9_SHAPES } from './utils/formulas';

export const SurfaceArea9App: React.FC<{ onExit: () => void; currentUser: UserInfo | null }> = ({ onExit, currentUser }) => {
    const [appState, setAppState] = useState<'welcome' | 'shape_selection' | 'calculator'>('welcome');
    const [selectedShape, setSelectedShape] = useState<ShapeType | null>(null);
    const [dimensions, setDimensions] = useState<ShapeDimensions>({});
    const [calculationType, setCalculationType] = useState<CalculationType>('volume');
    const [result, setResult] = useState<CalculationResult>(null);
    const [isUnfolded, setIsUnfolded] = useState(false);

    const handleShapeSelect = (shape: ShapeType) => {
        const shapeInfo = SHAPE_DATA[shape];
        setSelectedShape(shape);
        setDimensions(shapeInfo.defaultDimensions);
        setCalculationType('volume');
        setResult(null);
        setIsUnfolded(false);
        setAppState('calculator');
    };

    const handleDimensionChange = (newDimensions: ShapeDimensions) => {
        setDimensions(newDimensions);
        setResult(null); // Clear result when dimensions change
    };
    
    const handleCalculationTypeChange = (type: CalculationType) => {
        setCalculationType(type);
        setResult(null); // Clear result when type changes
    };

    const handleCalculate = () => {
        if (!selectedShape) return;
        const shapeInfo = SHAPE_DATA[selectedShape];
        const calculationFn = shapeInfo.formulas[calculationType];
        if (calculationFn) {
            setResult(calculationFn(dimensions));
        }
    };
    
    const goBackToMenu = () => {
        setAppState('shape_selection');
        setSelectedShape(null);
        setResult(null);
    };

    const renderContent = () => {
        switch (appState) {
            case 'welcome':
                return <WelcomeScreen onStart={() => setAppState('shape_selection')} title="Solid Shapes Explorer" grade="IX" />;
            case 'shape_selection':
                return <ShapeSelector onSelect={handleShapeSelect} shapes={CLASS_9_SHAPES} />;
            case 'calculator':
                if (!selectedShape) return null;
                return (
                    <div className="w-full h-full flex flex-col lg:flex-row gap-8 items-start">
                        <div className="w-full lg:w-3/5 h-[400px] lg:h-[600px] rounded-lg">
                           <Canvas3D shape={selectedShape} dimensions={dimensions} isUnfolded={isUnfolded} />
                        </div>
                        <div className="w-full lg:w-2/5">
                            <InputPanel
                                shape={selectedShape}
                                dimensions={dimensions}
                                onDimensionChange={handleDimensionChange}
                                calculationType={calculationType}
                                onCalculationTypeChange={handleCalculationTypeChange}
                                onCalculate={handleCalculate}
                                isUnfolded={isUnfolded}
                                onToggleUnfold={() => setIsUnfolded(!isUnfolded)}
                            />
                            {result && <SolutionPanel result={result} />}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="geometry-theme min-h-screen flex flex-col font-sans w-full">
            <Header
                onHelpClick={() => {}}
                currentUser={currentUser}
                onExit={onExit}
                onBackToModelMenu={appState === 'calculator' ? goBackToMenu : undefined}
                modelTitle="Solid Shapes Explorer"
                modelSubtitle="Class IX"
            />
            <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
                {renderContent()}
            </main>
        </div>
    );
};