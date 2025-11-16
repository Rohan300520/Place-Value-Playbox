import React from 'react';
import type { ShapeType } from '../../../types';
import { SHAPE_DATA } from '../utils/shapeData';
import { TRAINING_PLANS } from '../utils/trainingPlan';
import { speak } from '../../../utils/speech';
import { useAudio } from '../../../contexts/AudioContext';

interface ShapeSelectorProps {
    onSelectShape: (shape: ShapeType) => void;
    isTraining?: boolean;
}

const SHAPES: ShapeType[] = ['cube', 'cuboid', 'cylinder', 'cone', 'sphere'];
const SHAPES_WITH_TRAINING = Object.keys(TRAINING_PLANS).filter(key => TRAINING_PLANS[key as ShapeType].length > 0) as ShapeType[];

const ShapeCard: React.FC<{
  shape: ShapeType;
  onClick: () => void;
  isTraining?: boolean;
}> = ({ shape, onClick, isTraining }) => {
    const { name, thumbnail } = SHAPE_DATA[shape];
    const isDisabled = isTraining && !SHAPES_WITH_TRAINING.includes(shape);

    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`group p-6 rounded-3xl shadow-lg text-left text-white w-full max-w-sm transform hover:-translate-y-2 transition-transform duration-300 border-b-8 active:border-b-4 flex flex-col items-center gap-4 bg-gradient-to-br from-gray-700 to-gray-800 border-gray-900 shadow-gray-900/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0`}
        >
            <img src={thumbnail} alt={name} className="w-32 h-32 object-contain" />
            <h3 className="text-3xl font-black tracking-tight font-display">{name}</h3>
            {isDisabled && <span className="text-sm font-bold bg-yellow-500 text-black px-2 py-1 rounded-full">Coming Soon</span>}
        </button>
    );
};

export const ShapeSelector: React.FC<ShapeSelectorProps> = ({ onSelectShape, isTraining }) => {
    const { isSpeechEnabled } = useAudio();
    const title = isTraining ? "Select a Shape for Training" : "Select a Shape to Explore";

    const handleSelect = (shape: ShapeType) => {
        if (isSpeechEnabled) {
            speak(`Selected ${SHAPE_DATA[shape].name}.`, 'en-US');
        }
        onSelectShape(shape);
    };
    
    return (
        <div className="flex-grow flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl sm:text-5xl font-black font-display mb-10 text-center" style={{ color: 'var(--text-accent)' }}>
                {title}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 animate-pop-in">
                {SHAPES.map(shape => (
                    <ShapeCard key={shape} shape={shape} onClick={() => handleSelect(shape)} isTraining={isTraining} />
                ))}
            </div>
        </div>
    );
};
