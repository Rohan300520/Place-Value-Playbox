import React from 'react';
import type { ShapeDimensions, CalculationType, RenderMode } from '../../../types';

interface ControlsPanelProps {
    shapeConfig: any;
    dimensions: ShapeDimensions;
    onDimensionsChange: (dims: ShapeDimensions) => void;
    calculationType: CalculationType;
    onCalculationTypeChange: (type: CalculationType) => void;
    onCalculate: () => void;
    isUnfolded: boolean;
    onToggleUnfold: () => void;
    renderMode: RenderMode;
    onRenderModeChange: (mode: RenderMode) => void;
    isTraining?: boolean;
    spotlightOn?: string | null;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
    shapeConfig, dimensions, onDimensionsChange, calculationType, onCalculationTypeChange,
    onCalculate, isUnfolded, onToggleUnfold, renderMode, onRenderModeChange,
    isTraining = false, spotlightOn
}) => {

    const handleDimensionChange = (key: string, value: number) => {
        onDimensionsChange({ ...dimensions, [key]: value });
    };

    const isUnfoldable = shapeConfig.name !== 'Sphere';

    const getIsDisabled = (id: string) => {
        return isTraining && spotlightOn !== id;
    };

    return (
        <div className="p-4 rounded-2xl shadow-lg border space-y-4" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)' }}>
            <h2 className="text-2xl font-bold font-display text-center" style={{color: 'var(--text-accent)'}}>{shapeConfig.name} Controls</h2>

            {/* Dimension Sliders */}
            <div className="space-y-4">
                {shapeConfig.dimensions.map((dim: any) => (
                    <div key={dim.key} className={`${spotlightOn === `dimension-${dim.key}` ? 'animate-guide-pulse rounded-lg p-1' : ''}`}>
                        <label htmlFor={dim.key} className="flex justify-between font-bold">
                            <span>{dim.label} (units)</span>
                            <span>{dimensions[dim.key]}</span>
                        </label>
                        <input
                            id={dim.key}
                            type="range"
                            min={dim.min}
                            max={dim.max}
                            step={dim.step}
                            value={dimensions[dim.key]}
                            onChange={(e) => handleDimensionChange(dim.key, parseFloat(e.target.value))}
                            disabled={getIsDisabled(`dimension-${dim.key}`)}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                        />
                    </div>
                ))}
            </div>

            {/* Calculation Type */}
            <div className={`p-2 rounded-lg ${spotlightOn === 'calc-type-selector' ? 'animate-guide-pulse' : ''}`}>
                <h3 className="font-bold mb-2">Calculation Type</h3>
                <div className="flex justify-around bg-gray-900/50 rounded-lg p-1">
                    {(['volume', 'lsa', 'tsa'] as CalculationType[]).map(type => (
                        <button
                            key={type}
                            onClick={() => onCalculationTypeChange(type)}
                            disabled={getIsDisabled('calc-type-selector')}
                            className={`w-full py-1 rounded-md font-bold transition-colors ${calculationType === type ? 'bg-indigo-500 text-white' : 'hover:bg-indigo-500/50'} disabled:opacity-50 disabled:hover:bg-transparent`}
                        >
                            {type.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-2">
                 <button 
                    onClick={onToggleUnfold}
                    disabled={getIsDisabled('unfold-button') || !isUnfoldable}
                    title={!isUnfoldable ? "Unfolding this shape is not supported." : isUnfolded ? "Fold the shape back to 3D" : "Unfold the shape to its 2D net"}
                    className={`p-3 font-bold rounded-lg transition-colors ${spotlightOn === 'unfold-button' ? 'animate-guide-pulse' : ''} ${isUnfolded ? 'bg-orange-500' : 'bg-slate-600 hover:bg-slate-500'} disabled:bg-slate-800 disabled:cursor-not-allowed disabled:text-slate-500`}
                 >
                    {isUnfolded ? 'Fold' : 'Unfold'}
                </button>
            </div>
            
             <button
                onClick={onCalculate}
                disabled={getIsDisabled('calculate-button')}
                className={`w-full py-3 text-xl font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 bg-green-600 hover:bg-green-500 ${spotlightOn === 'calculate-button' ? 'animate-guide-pulse' : ''} disabled:opacity-50 disabled:bg-slate-800 disabled:cursor-not-allowed`}
            >
                Calculate
            </button>
        </div>
    );
};