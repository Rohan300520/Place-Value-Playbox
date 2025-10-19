import React, { useState } from 'react';
import type { Fraction, FractionTrainingStep } from '../../../types';

interface NumberLineProps {
    denominator?: number;
    onSelectPoint?: (fraction: Fraction) => void;
    currentStep?: FractionTrainingStep | null;
    isExploreMode?: boolean;
}

const DENOMINATORS = [2, 3, 4, 6, 8, 12, 16];

function fractionsAreEqual(f1: Fraction | null, f2: Fraction | null): boolean {
    if (!f1 || !f2) return false;
    return f1.numerator * f2.denominator === f2.numerator * f1.denominator;
}

export const NumberLine: React.FC<NumberLineProps> = ({ 
    denominator: propsDenominator, 
    onSelectPoint, 
    currentStep, 
    isExploreMode = false 
}) => {
    // Internal state for explore mode
    const [exploreDenominator, setExploreDenominator] = useState(4);
    const [selectedPoint, setSelectedPoint] = useState<Fraction | null>(null);

    const denominator = isExploreMode ? exploreDenominator : propsDenominator ?? 4;
    
    const handleSelect = (fraction: Fraction) => {
        if (isExploreMode) {
            setSelectedPoint(fraction);
        } else if (onSelectPoint) {
            onSelectPoint(fraction);
        }
    };

    const spotlightPoint = currentStep?.spotlightOn?.startsWith('number_line_point-') 
        ? currentStep.spotlightOn.split('-')[1]
        : null;
    
    const getFractionFromSpotlight = (): Fraction | null => {
        if (!spotlightPoint) return null;
        const [num, den] = spotlightPoint.split('/');
        return { numerator: parseInt(num), denominator: parseInt(den) };
    }
    const spotlightFraction = getFractionFromSpotlight();

    return (
        <div className="w-full p-6 rounded-2xl chalk-border flex flex-col items-center">
            <h2 className="text-3xl font-chalk text-center text-chalk-yellow mb-4">Fractions on a Number Line</h2>
            <p className="text-lg text-chalk-light mb-8">Click on a point on the ruler to see the fraction.</p>
            
            {isExploreMode && (
                <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                    <p className="text-lg font-chalk text-chalk-light mr-2">Divisions:</p>
                    {DENOMINATORS.map(d => (
                        <button 
                            key={d}
                            onClick={() => setExploreDenominator(d)}
                            className={`control-button text-base px-3 py-1 ${denominator === d ? 'bg-orange-500 border-orange-700' : 'bg-gray-500 border-gray-700 hover:bg-gray-400'}`}
                        >
                            {d}ths
                        </button>
                    ))}
                </div>
            )}

            <div className="w-full max-w-4xl relative h-24">
                {/* Main Ruler Bar */}
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-8 bg-gradient-to-b from-[#d4a373] to-[#a0522d] rounded-lg shadow-inner shadow-black/30 border-2 border-[#5c2c06]" />
                
                {/* Ticks and Labels */}
                <div className="w-full h-full flex justify-between items-center px-1">
                    {Array.from({ length: denominator + 1 }).map((_, i) => {
                        const fraction: Fraction = { numerator: i, denominator };
                        const isSpotlighted = !isExploreMode && fractionsAreEqual(fraction, spotlightFraction);
                        const isSelected = isExploreMode && fractionsAreEqual(fraction, selectedPoint);

                        return (
                            <div 
                                key={i} 
                                className="relative h-full flex flex-col items-center justify-center cursor-pointer group"
                                onClick={() => handleSelect(fraction)}
                            >
                                {/* The Tick Mark */}
                                <div className={`w-1 bg-[#5c2c06] transition-all duration-300 ${i === 0 || i === denominator ? 'h-8' : i % 2 === 0 ? 'h-6' : 'h-4'}`} />
                                
                                {/* The Label */}
                                <div className={`absolute -bottom-10 p-2 rounded-lg transition-all duration-300`}>
                                    <p className={`font-sans font-bold text-lg transition-colors duration-300 group-hover:text-chalk-cyan ${isSpotlighted || isSelected ? 'text-chalk-yellow' : 'text-chalk-light'}`}>
                                        {i === 0 ? '0' : i === denominator ? '1' : `${i}/${denominator}`}
                                    </p>
                                </div>

                                {/* Spotlight/Selection Marker */}
                                {(isSpotlighted || isSelected) && (
                                    <div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-chalk-yellow/50 border-2 border-chalk-yellow animate-guide-pulse" />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};