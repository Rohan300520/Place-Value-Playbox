import React from 'react';
import type { Fraction, FractionTrainingStep } from '../../../types';

interface NumberLineProps {
    denominator: number;
    onSelectPoint: (fraction: Fraction) => void;
    currentStep: FractionTrainingStep | null;
}

function fractionsAreEqual(f1: Fraction | null, f2: Fraction | null): boolean {
    if (!f1 || !f2) return false;
    return f1.numerator * f2.denominator === f2.numerator * f1.denominator;
}

export const NumberLine: React.FC<NumberLineProps> = ({ denominator, onSelectPoint, currentStep }) => {
    
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
            <h2 className="text-3xl font-chalk text-center text-chalk-yellow mb-8">Fractions on a Number Line</h2>
            <div className="w-full max-w-3xl relative h-20">
                {/* Main Line */}
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-chalk-border rounded-full" />
                
                {/* Ticks and Labels */}
                <div className="w-full h-full flex justify-between items-center">
                    {Array.from({ length: denominator + 1 }).map((_, i) => {
                        const fraction: Fraction = { numerator: i, denominator };
                        const isSpotlighted = fractionsAreEqual(fraction, spotlightFraction);

                        return (
                            <div 
                                key={i} 
                                className="relative h-full flex flex-col items-center justify-center cursor-pointer group"
                                onClick={() => onSelectPoint(fraction)}
                            >
                                <div className={`w-1 transition-all duration-300 group-hover:bg-chalk-cyan ${isSpotlighted ? 'bg-chalk-yellow' : 'bg-chalk-light'} ${i === 0 || i === denominator ? 'h-8' : 'h-6'}`} />
                                <div className={`absolute -bottom-10 p-2 rounded-lg transition-all duration-300 ${isSpotlighted ? 'animate-guide-pulse' : ''}`}>
                                    <p className={`font-chalk text-xl transition-colors duration-300 group-hover:text-chalk-cyan ${isSpotlighted ? 'text-chalk-yellow' : 'text-chalk-light'}`}>
                                        {i === 0 ? '0' : i === denominator ? '1' : `${i}/${denominator}`}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};