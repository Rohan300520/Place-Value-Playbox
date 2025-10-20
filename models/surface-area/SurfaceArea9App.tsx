// Fix: Implemented the full component for the Class 9 Surface Area and Volume model.
import React, { useState, useCallback } from 'react';
import type { ShapeType, ShapeDimensions, CalculationType, CalculationResult, UserInfo } from '../../types';
import { Header } from '../../components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ShapeSelector } from './components/ShapeSelector';
import { InputPanel } from './components/InputPanel';
import { SolutionPanel } from './components/SolutionPanel';
import { Canvas3D } from './components/Canvas3D';
import { SHAPE_DATA, CLASS_9_SHAPES } from './utils/formulas';

export const SurfaceArea9App: React.FC<{ onExit: () => void; currentUser: UserInfo | null }> = ({ onExit, currentUser }) => {
    const [gameState, setGameState] = useState<'welcome' | 'shape_selection' | 'explore'>('welcome');
    const [selectedShape, setSelectedShape] = useState<ShapeType | null>(null);
    const [dimensions, setDimensions] = useState<ShapeDimensions>({});
    const [calculation, setCalculation] = useState<CalculationResult | null>(null);

    const handleSelectShape = (shape: ShapeType) => {
        setSelectedShape(shape);
        const defaultDims = SHAPE_DATA[shape].defaultDimensions;
        setDimensions(defaultDims);
        setCalculation(null); // Clear previous calculation
        setGameState('explore');
    };
    
    const handleDimensionChange = (newDimensions: ShapeDimensions) => {
        setDimensions(newDimensions);
        setCalculation(null); // Clear calculation when dimensions change
    };

    const handleCalculate = (type: CalculationType) => {
        if (selectedShape) {
            const formulaFn = SHAPE_DATA[selectedShape].formulas[type];
            if (formulaFn) {
                const result = formulaFn(dimensions);
                setCalculation(result);
            }
        }
    };
    
    const goBackToMenu = useCallback(() => {
        setSelectedShape(null);
        setCalculation(null);
        setGameState('shape_selection');
    }, []);

    const renderMainContent = () => {
        switch (gameState) {
            case 'welcome':
                return <WelcomeScreen onStart={() => setGameState('shape_selection')} title="Solid Shapes Explorer" grade="IX" />;
            case 'shape_selection':
                return <ShapeSelector onSelect={handleSelectShape} shapes={CLASS_9_SHAPES} />;
            case 'explore':
                if (!selectedShape) return null;
                return (
                    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div className="lg:sticky top-24">
                            <Canvas3D shape={selectedShape} dimensions={dimensions} />
                        </div>
                        <div className="flex flex-col gap-6">
                            <InputPanel 
                                shape={selectedShape}
                                dimensions={dimensions}
                                onDimensionChange={handleDimensionChange}
                                onCalculate={handleCalculate}
                            />
                            {calculation && <SolutionPanel result={calculation} />}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans surface-area-theme">
             <Header 
                onHelpClick={() => { /* TODO: Add help modal */ }}
                currentUser={currentUser} 
                onExit={onExit}
                onBackToModelMenu={gameState === 'explore' ? goBackToMenu : undefined}
                modelTitle="Surface Area & Volume"
                modelSubtitle="Class IX"
            />
            <main className="flex-grow flex flex-col items-center justify-center p-4">
                {renderMainContent()}
            </main>
        </div>
    );
};
