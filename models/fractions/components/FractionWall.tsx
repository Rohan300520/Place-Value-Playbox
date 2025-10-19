import React from 'react';
import type { Fraction } from '../../../types';
import { FractionBlock } from './FractionBlock';

const DENOMINATORS = [1, 2, 3, 4, 6, 8, 12, 16];

interface FractionWallProps {
    onSelect: (fraction: Fraction) => void;
    pulseOn?: Fraction | null;
    spotlightOn?: Fraction | null;
}

export const FractionWall: React.FC<FractionWallProps> = ({ onSelect, pulseOn, spotlightOn }) => {
    
    const fractionsToShow = DENOMINATORS.map(d => ({ numerator: 1, denominator: d }));
    
    return (
        <div className="w-full p-4 rounded-2xl chalk-bg-light">
            <div className="space-y-2">
                {fractionsToShow.map((frac, index) => {
                    const isSpotlighted = spotlightOn && frac.denominator === spotlightOn.denominator;
                    const isPulsing = pulseOn && pulseOn.denominator === pulseOn.denominator;
                    
                    return (
                        <div 
                          key={index} 
                          className={`w-full rounded-lg transition-all duration-300 ${isSpotlighted ? 'animate-guide-pulse' : ''} ${isPulsing ? 'animate-celebrate' : ''}`}
                        >
                            <FractionBlock 
                                fraction={frac}
                                onClick={() => onSelect(frac)}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};