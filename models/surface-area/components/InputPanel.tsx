// Fix: Implemented the input panel component for the surface area models.
import React from 'react';
import type { ShapeType, ShapeDimensions, CalculationType } from '../../../types';
import { SHAPE_DATA } from '../utils/formulas';

interface InputPanelProps {
    shape: ShapeType;
    dimensions: ShapeDimensions;
    onDimensionChange: (dims: ShapeDimensions) => void;
    onCalculate: (type: CalculationType) => void;
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
        <label className="flex justify-between items-center text-lg font-bold" style={{ color: 'var(--blueprint-text-secondary)'}}>
            <span>{label}</span>
            <span className="font-mono text-xl" style={{ color: 'var(--blueprint-text-primary)'}}>{value.toFixed(1)}</span>
        </label>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg blueprint-slider mt-2"
        />
    </div>
);

export const InputPanel: React.FC<InputPanelProps> = ({ shape, dimensions, onDimensionChange, onCalculate }) => {
    const shapeInfo = SHAPE_DATA[shape];

    const handleSliderChange = (key: string, value: number) => {
        onDimensionChange({ ...dimensions, [key]: value });
    };

    return (
        <div className="w-full p-6 rounded-2xl shadow-lg border backdrop-blur-sm" style={{ backgroundColor: 'var(--blueprint-panel-bg)', borderColor: 'var(--blueprint-border)' }}>
            <h3 className="text-3xl font-bold font-display mb-6" style={{ color: 'var(--blueprint-accent)' }}>
                {shapeInfo.name} Dimensions
            </h3>
            
            <div className="space-y-6">
                {shapeInfo.dimensions.map(dim => (
                    <DimensionSlider 
                        key={dim.key}
                        label={dim.name}
                        value={dimensions[dim.key] ?? 0}
                        min={dim.min}
                        max={dim.max}
                        step={dim.step}
                        onChange={(val) => handleSliderChange(dim.key, val)}
                    />
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {shapeInfo.formulas.volume && (
                     <button onClick={() => onCalculate('volume')} className="calc-button bg-sky-500 border-sky-700 hover:bg-sky-600">Volume</button>
                )}
                 {shapeInfo.formulas.lsa && (
                     <button onClick={() => onCalculate('lsa')} className="calc-button bg-emerald-500 border-emerald-700 hover:bg-emerald-600">{shapeInfo.lsaName}</button>
                )}
                 {shapeInfo.formulas.tsa && (
                     <button onClick={() => onCalculate('tsa')} className="calc-button bg-amber-500 border-amber-700 hover:bg-amber-600">TSA</button>
                )}
            </div>
        </div>
    );
};
