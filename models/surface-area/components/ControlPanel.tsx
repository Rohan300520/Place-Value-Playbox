import React from 'react';
import type { ShapeType, ShapeDimensions, CalculationType, SurfaceAreaTrainingStep, RenderMode } from '../../../types';
import { SHAPE_DATA } from '../utils/formulas';

interface ControlPanelProps {
    shapes: ShapeType[];
    selectedShape: ShapeType | null;
    onShapeSelect: (shape: ShapeType) => void;
    dimensions: ShapeDimensions;
    onDimensionChange: (newDimensions: ShapeDimensions) => void;
    calculationType: CalculationType;
    onCalculationTypeChange: (type: CalculationType) => void;
    onCalculate: () => void;
    isUnfolded: boolean;
    onToggleUnfold: () => void;
    unit: string;
    renderMode: RenderMode;
    onRenderModeChange: (mode: RenderMode) => void;
    isComparisonView: boolean;
    onToggleComparison: () => void;
    isTraining: boolean;
    trainingStep: SurfaceAreaTrainingStep | null;
}

const ShapeButton: React.FC<{ shape: ShapeType, selectedShape: ShapeType | null, onSelect: (s: ShapeType) => void, isSpotlighted?: boolean, disabled?: boolean }> = ({ shape, selectedShape, onSelect, isSpotlighted, disabled }) => {
    const info = SHAPE_DATA[shape];
    const isActive = selectedShape === shape;
    return (
        <button
            onClick={() => onSelect(shape)}
            disabled={disabled}
            className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${isSpotlighted ? 'animate-guide-pulse' : ''} ${isActive ? 'bg-[var(--blueprint-accent)]/20' : 'hover:bg-white/10'}`}
        >
            <img src={info.iconUrl} alt={info.name} className="w-12 h-12" />
            <span className={`mt-1 text-xs font-bold ${isActive ? 'text-[var(--blueprint-accent)]' : 'text-[var(--blueprint-text-secondary)]'}`}>{info.name}</span>
        </button>
    );
};

const DimensionSlider: React.FC<{
    label: string, value: number, min: number, max: number, step: number,
    onChange: (value: number) => void, isSpotlighted: boolean, unit: string, disabled?: boolean
}> = ({ label, value, min, max, step, onChange, isSpotlighted, unit, disabled }) => (
    <div className={`w-full p-2 rounded-lg ${isSpotlighted ? 'animate-guide-pulse' : ''} ${disabled ? 'opacity-50' : ''}`}>
        <div className="flex justify-between items-center mb-1">
            <label className="font-bold" style={{ color: 'var(--blueprint-text-secondary)' }}>{label}</label>
            <div className="flex items-center gap-1">
                <input type="number" value={value} min={min} max={max} step={step} onChange={(e) => onChange(parseFloat(e.target.value))}
                    disabled={disabled}
                    className="w-16 p-1 text-center font-mono font-bold rounded-md border-2 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--blueprint-input-bg)', borderColor: 'var(--blueprint-border)', color: 'var(--blueprint-text-primary)' }}
                />
                <span className="font-bold w-8 text-left text-sm" style={{ color: 'var(--blueprint-text-secondary)' }}>
                    {unit !== 'units' ? unit : ''}
                </span>
            </div>
        </div>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full disabled:cursor-not-allowed" disabled={disabled} />
    </div>
);

const TabButton: React.FC<{ label: string, onClick: () => void, isActive: boolean, isSpotlighted?: boolean, disabled?: boolean }> = ({ label, onClick, isActive, isSpotlighted, disabled }) => (
    <button onClick={onClick} disabled={disabled}
        className={`flex-1 font-bold font-display text-sm py-2 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
            isActive ? 'bg-[var(--blueprint-accent)] text-white shadow-md' : 'bg-[var(--blueprint-input-bg)] text-[var(--blueprint-text-secondary)] hover:bg-[var(--blueprint-panel-bg)]'
        } ${isSpotlighted ? 'animate-guide-pulse' : ''}`}
    >
        {label}
    </button>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({
    shapes, selectedShape, onShapeSelect, dimensions, onDimensionChange, calculationType, onCalculationTypeChange, onCalculate,
    isUnfolded, onToggleUnfold, unit, renderMode, onRenderModeChange, isComparisonView, onToggleComparison,
    isTraining, trainingStep
}) => {
    const shapeInfo = selectedShape ? SHAPE_DATA[selectedShape] : null;
    const spotlightOn = trainingStep?.spotlightOn;
    
    // --- Training Mode Logic ---
    const isDimensionSliderDisabled = (dimKey: string) => {
        if (!isTraining || !trainingStep) return false;
        if (trainingStep.requiredAction === 'change_dimension') {
            const specificDimSpotlight = trainingStep.spotlightOn?.startsWith('dimension-');
            if (specificDimSpotlight) {
                return trainingStep.spotlightOn !== `dimension-${dimKey}`;
            }
            return false;
        }
        return true;
    };

    const isCalcTypeDisabled = (type: CalculationType) => {
        if (!isTraining || !trainingStep) return false;
        return !(trainingStep.requiredAction === 'select_calc_type' && trainingStep.requiredValue === type);
    };

    return (
        <div className="w-full p-4 rounded-2xl shadow-lg border backdrop-blur-sm space-y-4" style={{ backgroundColor: 'var(--blueprint-panel-bg)', borderColor: 'var(--blueprint-border)' }}>
            <div>
                <h3 className="text-lg font-bold font-display mb-2 text-center" style={{ color: 'var(--blueprint-text-secondary)' }}>Select Shape</h3>
                <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-black/20">
                    {shapes.map(s => <ShapeButton key={s} shape={s} selectedShape={selectedShape} onSelect={onShapeSelect} isSpotlighted={spotlightOn === `shape-${s}`} disabled={isTraining && !!selectedShape} />)}
                </div>
            </div>

            {shapeInfo && (
                <div className="space-y-4 animate-pop-in">
                    <div className="border-t-2 pt-4" style={{ borderColor: 'var(--blueprint-border)' }}>
                        <h3 className="text-lg font-bold font-display mb-2 text-center" style={{ color: 'var(--blueprint-text-secondary)' }}>Parameters</h3>
                        <div className={`space-y-2 p-2 rounded-lg ${spotlightOn === 'dimension' ? 'animate-guide-pulse' : ''}`}>
                            {shapeInfo.dimensions.map(dim => (
                                <DimensionSlider key={dim.key} label={dim.name} value={dimensions[dim.key] || 0} min={dim.min} max={dim.max} step={dim.step}
                                    onChange={value => onDimensionChange({ ...dimensions, [dim.key]: value })}
                                    isSpotlighted={spotlightOn === `dimension-${dim.key}`} unit={unit}
                                    disabled={isDimensionSliderDisabled(dim.key)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="border-t-2 pt-4" style={{ borderColor: 'var(--blueprint-border)' }}>
                        <h3 className="text-lg font-bold font-display mb-2 text-center" style={{ color: 'var(--blueprint-text-secondary)' }}>Calculation</h3>
                        <div className="flex items-center gap-2">
                            <TabButton label="Volume" onClick={() => onCalculationTypeChange('volume')} isActive={calculationType === 'volume'} isSpotlighted={spotlightOn === 'calc_type-volume'} disabled={isCalcTypeDisabled('volume')} />
                            <TabButton label={shapeInfo.lsaName} onClick={() => onCalculationTypeChange('lsa')} isActive={calculationType === 'lsa'} disabled={!shapeInfo.formulas.lsa || isCalcTypeDisabled('lsa')} isSpotlighted={spotlightOn === 'calc_type-lsa'} />
                            <TabButton label="TSA" onClick={() => onCalculationTypeChange('tsa')} isActive={calculationType === 'tsa'} disabled={!shapeInfo.formulas.tsa || isCalcTypeDisabled('tsa')} isSpotlighted={spotlightOn === 'calc_type-tsa'} />
                        </div>
                    </div>
                     
                    <div className="border-t-2 pt-4" style={{ borderColor: 'var(--blueprint-border)' }}>
                        <h3 className="text-lg font-bold font-display mb-2 text-center" style={{ color: 'var(--blueprint-text-secondary)' }}>View Options</h3>
                         <div className="flex items-center gap-2">
                            <TabButton label="Solid" onClick={() => onRenderModeChange('solid')} isActive={renderMode === 'solid'} disabled={isTraining} />
                            <TabButton label="Wireframe" onClick={() => onRenderModeChange('wireframe')} isActive={renderMode === 'wireframe'} disabled={isTraining} />
                         </div>
                         <div className="flex items-center gap-2 mt-2">
                            <TabButton label={isUnfolded ? 'Fold Shape' : 'Unfold Net'} onClick={onToggleUnfold} isActive={isUnfolded} isSpotlighted={spotlightOn === 'unfold_button'} disabled={isTraining && trainingStep?.requiredAction !== 'unfold'} />
                         </div>
                          {(selectedShape === 'cylinder' || selectedShape === 'cone') && (
                            <button 
                                onClick={onToggleComparison} 
                                className={`w-full mt-2 font-bold font-display text-sm py-2 rounded-lg transition-all duration-200 bg-[var(--blueprint-input-bg)] text-[var(--blueprint-text-secondary)] hover:bg-[var(--blueprint-panel-bg)] disabled:opacity-30 disabled:cursor-not-allowed ${spotlightOn === 'comparison_button' ? 'animate-guide-pulse' : ''}`}
                                disabled={isTraining && trainingStep?.requiredAction !== 'toggle_comparison'}
                            >
                                {isComparisonView ? 'Exit Comparison' : 'Compare Cone & Cylinder'}
                            </button>
                        )}
                    </div>

                    <button onClick={onCalculate}
                        disabled={isTraining && trainingStep?.requiredAction !== 'calculate'}
                        className={`w-full text-white font-bold text-xl py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 border-b-4 active:border-b-2 font-display disabled:opacity-30 disabled:cursor-not-allowed ${spotlightOn === 'calculate_button' ? 'animate-guide-pulse' : ''}`}
                        style={{ backgroundColor: 'var(--btn-action-bg)', borderColor: 'var(--btn-action-border)' }}
                    >
                        Calculate
                    </button>
                </div>
            )}
        </div>
    );
};