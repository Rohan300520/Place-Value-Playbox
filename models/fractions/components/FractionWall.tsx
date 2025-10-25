import React from 'react';
import type { Fraction } from '../../../types';
import { FractionPiece } from './FractionBlock';

const DENOMINATORS = [1, 2, 3, 4, 6, 8, 12];

interface FractionChartProps {
    onPieceDragStart: (e: React.DragEvent<HTMLDivElement>, fraction: Fraction) => void;
    spotlightOn?: string | null;
    trainingRequiredFraction?: Fraction | null;
}

function fractionsAreEqual(f1: Fraction | null, f2: Fraction | null): boolean {
    if (!f1 || !f2) return false;
    if(f1.numerator === 0 && f2.numerator === 0) return true;
    return f1.numerator * f2.denominator === f2.numerator * f1.denominator;
}

export const FractionChart: React.FC<FractionChartProps> = ({ onPieceDragStart, spotlightOn, trainingRequiredFraction }) => {
    
    const isTrainingDragStep = !!trainingRequiredFraction;

    return (
        <div className="w-full p-4 rounded-2xl chalk-bg-light space-y-2">
            {DENOMINATORS.map(d => {
                const isSpotlighted = spotlightOn === `chart_row-${d}`;
                const currentFraction = { numerator: 1, denominator: d };

                const isCorrectPieceForTraining = isTrainingDragStep 
                    ? fractionsAreEqual(currentFraction, trainingRequiredFraction)
                    : false;

                const isDraggable = !isTrainingDragStep || isCorrectPieceForTraining;

                return (
                    <div 
                        key={d} 
                        className={`flex gap-1 transition-all duration-300 p-1 rounded-lg ${isSpotlighted ? 'animate-guide-pulse' : ''} ${isTrainingDragStep && !isDraggable ? 'opacity-50' : ''}`}
                    >
                        {Array.from({ length: d }).map((_, i) => (
                            <div key={i} className="flex-1">
                                <FractionPiece 
                                    fraction={currentFraction}
                                    isDraggable={isDraggable}
                                    onDragStart={onPieceDragStart}
                                />
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};