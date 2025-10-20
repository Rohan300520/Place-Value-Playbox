import React from 'react';
import type { ShapeType, ShapeDimensions, CalculationType } from '../../../types';
import { SHAPE_DATA } from '../utils/formulas';

interface InputPanelProps {
    shape: ShapeType;
    dimensions: ShapeDimensions;
    onDimensionChange: (newDimensions: ShapeDimensions) => void;
    calculationType: CalculationType;
    onCalculationTypeChange: (type: CalculationType) => void;
    onCalculate: () => void;
    isUnfolded: boolean;
    onToggleUnfold: () => void;
    isClass10?: boolean;
}

const DimensionSlider: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
}> = ({ label, value, min, max, step, onChange }) => (
    <div className="w-full">
        <div className="flex justify-between items-center mb-1">
            <label className="font-bold text-lg" style={{ color: 'var(--blueprint-text-secondary)' }}>{label}</label>
            <input
                type="number"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-20 p-1 text-center font-mono font-bold text-lg rounded-md border-2"
                style={{
                    backgroundColor: 'var(--blueprint-input-bg)',
                    borderColor: 'var(--blueprint-border)',
                    color: 'var(--blueprint-text-primary)'
                }}
            />
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full"
        />
    </div>
);

const CalculationTypeButton: React.FC<{
    label: string;
    type: CalculationType;
    activeType: CalculationType;
    onClick: (type: CalculationType) => void;
    disabled?: boolean;
}> = ({ label, type, activeType, onClick, disabled }) => (
    <button
        onClick={() => onClick(type)}
        disabled={disabled}
        className={`flex-1 font-bold font-display text-lg py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            activeType === type
                ? 'bg-[var(--blueprint-accent)] text-white shadow-md'
                : 'bg-[var(--blueprint-input-bg)] text-[var(--blueprint-text-secondary)] hover:bg-[var(--blueprint-panel-bg)]'
        }`}
    >
        {label}
    </button>
);


export const InputPanel: React.FC<InputPanelProps> = ({
    shape, dimensions, onDimensionChange, calculationType, onCalculationTypeChange, onCalculate,
    isUnfolded, onToggleUnfold, isClass10
}) => {
    const shapeInfo = SHAPE_DATA[shape];

    return (
        <div className="w-full p-6 rounded-2xl shadow-lg border backdrop-blur-sm space-y-6" style={{ backgroundColor: 'var(--blueprint-panel-bg)', borderColor: 'var(--blueprint-border)' }}>
            <h2 className="text-3xl font-black font-display text-center" style={{ color: 'var(--blueprint-text-primary)' }}>
                {shapeInfo.name}
            </h2>

            {/* --- Dimension Sliders --- */}
            <div className="space-y-4">
                {shapeInfo.dimensions.map(dim => (
                    <DimensionSlider
                        key={dim.key}
                        label={dim.name}
                        value={dimensions[dim.key] || 0}
                        min={dim.min}
                        max={dim.max}
                        step={dim.step}
                        onChange={value => onDimensionChange({ ...dimensions, [dim.key]: value })}
                    />
                ))}
            </div>

            {/* --- Calculation Type Selector --- */}
            <div className="flex items-center gap-2">
                <CalculationTypeButton label="Volume" type="volume" activeType={calculationType} onClick={onCalculationTypeChange} />
                <CalculationTypeButton label={shapeInfo.lsaName} type="lsa" activeType={calculationType} onClick={onCalculationTypeChange} disabled={!shapeInfo.formulas.lsa} />
                <CalculationTypeButton label="TSA" type="tsa" activeType={calculationType} onClick={onCalculationTypeChange} disabled={!shapeInfo.formulas.tsa} />
            </div>

            {/* --- Action Buttons --- */}
            <div className="flex gap-4">
                {!isClass10 && (
                     <button 
                        onClick={onToggleUnfold}
                        className="flex-1 font-bold font-display text-lg py-3 rounded-lg transition-colors duration-200"
                        style={{
                            backgroundColor: isUnfolded ? 'var(--blueprint-accent)' : 'var(--blueprint-input-bg)',
                            color: isUnfolded ? 'white' : 'var(--blueprint-text-secondary)',
                            border: '2px solid var(--blueprint-border)'
                        }}
                    >
                        {isUnfolded ? 'Fold Shape' : 'Unfold Net'}
                    </button>
                )}
                <button
                    onClick={onCalculate}
                    className="flex-[2] text-white font-bold text-2xl py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 border-b-4 active:border-b-2 font-display"
                    style={{
                        backgroundColor: 'var(--btn-action-bg)',
                        borderColor: 'var(--btn-action-border)',
                    }}
                >
                    Calculate
                </button>
            </div>
        </div>
    );
};