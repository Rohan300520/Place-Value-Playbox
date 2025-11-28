
import React, { useState, useCallback } from 'react';
import type { UserInfo, ShapeType, ShapeDimensions, CalculationType, CalculationResult } from '../../types';
import { ShapeSelector } from './components/ShapeSelector';
import { ShapeViewer } from './components/ShapeViewer';
import { ControlsPanel } from './components/ControlsPanel';
import { CalculationPanel } from './components/CalculationPanel';
import { SHAPE_DATA } from './utils/shapeData';

interface ExploreViewProps {
    currentUser: UserInfo | null;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ currentUser }) => {
    const [selectedShape, setSelectedShape] = useState<ShapeType | null>(null);
    const [dimensions, setDimensions] = useState<ShapeDimensions>({});
    const [calculationType, setCalculationType] = useState<CalculationType>('volume');
    const [calculationResult, setCalculationResult] = useState<CalculationResult>(null);
    const [isUnfolded, setIsUnfolded] = useState(false);
    const [renderMode, setRenderMode] = useState<'solid' | 'wireframe'>('solid');
    const [highlightedPart, setHighlightedPart] = useState<string | string[] | null>(null);

    const handleSelectShape = useCallback((shape: ShapeType) => {
        setSelectedShape(shape);
        setDimensions(SHAPE_DATA[shape].defaultDimensions);
        setCalculationResult(null);
        setIsUnfolded(false);
    }, []);

    const handleCalculate = useCallback(() => {
        if (!selectedShape) return;
        const result = SHAPE_DATA[selectedShape].calculate(dimensions, calculationType);
        setCalculationResult(result);
    }, [selectedShape, dimensions, calculationType]);

    if (!selectedShape) {
        return <ShapeSelector onSelectShape={handleSelectShape} />;
    }
    
    const shapeInfo = SHAPE_DATA[selectedShape];

    return (
        <div className="w-full flex-grow flex flex-col lg:flex-row gap-4 animate-pop-in min-h-0 lg:h-full">
            {/* Left Panel: 3D Viewer - Takes up available space */}
            <div className="w-full lg:w-2/3 xl:w-3/4 flex flex-col gap-4 lg:h-full">
                <div className="flex-grow rounded-2xl shadow-lg border relative min-h-[400px] lg:min-h-0 lg:h-full" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)' }}>
                    <ShapeViewer 
                        shapeType={selectedShape}
                        dimensions={dimensions}
                        isUnfolded={isUnfolded}
                        renderMode={renderMode}
                        highlightPartId={highlightedPart}
                    />
                    <button 
                        onClick={() => setSelectedShape(null)}
                        className="absolute top-3 left-3 flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/70 text-white font-bold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition-all z-10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                </div>
            </div>
            
            {/* Right Panel: Controls & Calculation - Scrollable on desktop */}
            <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-4 lg:h-full lg:overflow-y-auto lg:pr-2 custom-scrollbar">
                <ControlsPanel 
                    shapeConfig={shapeInfo}
                    dimensions={dimensions}
                    onDimensionsChange={setDimensions}
                    calculationType={calculationType}
                    onCalculationTypeChange={setCalculationType}
                    onCalculate={handleCalculate}
                    isUnfolded={isUnfolded}
                    onToggleUnfold={() => setIsUnfolded(v => !v)}
                    renderMode={renderMode}
                    onRenderModeChange={setRenderMode}
                />
                {calculationResult && (
                    <CalculationPanel 
                        result={calculationResult} 
                        onHoverPart={(partId) => setHighlightedPart(partId)}
                        onLeavePart={() => setHighlightedPart(null)}
                    />
                )}
            </div>
        </div>
    );
};
