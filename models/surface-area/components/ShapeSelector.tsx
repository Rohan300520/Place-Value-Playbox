import React from 'react';
import type { ShapeType, TrainingSpotlight } from '../../../types';
import { SHAPE_DATA } from '../utils/formulas';

interface ShapeSelectorProps {
    onSelect: (shape: ShapeType) => void;
    shapes: ShapeType[];
    spotlightOn?: TrainingSpotlight | null;
}

const ShapeCard: React.FC<{
    shape: ShapeType;
    onClick: () => void;
    isSpotlighted?: boolean;
}> = ({ shape, onClick, isSpotlighted }) => {
    const shapeInfo = SHAPE_DATA[shape];
    return (
        <button
            onClick={onClick}
            className={`group w-full p-6 rounded-2xl shadow-lg border text-center transition-all duration-300 transform hover:-translate-y-2 ${isSpotlighted ? 'animate-guide-pulse' : ''}`}
            style={{ backgroundColor: 'var(--blueprint-panel-bg)', borderColor: 'var(--blueprint-border)' }}
        >
            <img src={shapeInfo.iconUrl} alt={shapeInfo.name} className="w-32 h-32 mx-auto mb-4 transition-transform duration-300 group-hover:scale-110" />
            <h3 className="text-2xl font-bold font-display" style={{ color: 'var(--blueprint-text-primary)' }}>
                {shapeInfo.name}
            </h3>
        </button>
    );
};

export const ShapeSelector: React.FC<ShapeSelectorProps> = ({ onSelect, shapes, spotlightOn }) => {
    return (
        <div className="w-full max-w-5xl mx-auto animate-pop-in">
            <h2 className="text-4xl md:text-5xl font-black font-display text-center mb-10" style={{ color: 'var(--blueprint-accent)' }}>
                Select a Shape to Explore
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {shapes.map(shapeKey => (
                    <ShapeCard
                        key={shapeKey}
                        shape={shapeKey}
                        onClick={() => onSelect(shapeKey)}
                        isSpotlighted={spotlightOn === `shape-${shapeKey}`}
                    />
                ))}
            </div>
        </div>
    );
};
