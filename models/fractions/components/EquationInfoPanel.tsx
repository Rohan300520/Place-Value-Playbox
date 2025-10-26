import React from 'react';
import type { EquationState, Fraction } from '../../../types';
import { getFractionalValue } from '../utils/fractions';

interface EquationInfoPanelProps {
    equation: EquationState;
}

const getFractionInfo = (fraction: Fraction | null): string => {
    if (!fraction || fraction.numerator === 0) return '';
    
    const value = getFractionalValue(fraction);
    if (value < 1) {
        return `Proper Fraction`;
    } else if (value === 1) {
        return `Whole Number`;
    } else {
        const whole = Math.floor(value);
        const remainderNum = fraction.numerator % fraction.denominator;
        if (remainderNum === 0) {
            return `Improper Fraction (equals ${whole})`;
        }
        return `Improper (${whole} ${remainderNum}/${fraction.denominator} Mixed)`;
    }
};

export const EquationInfoPanel: React.FC<EquationInfoPanelProps> = ({ equation }) => {
    if (!equation || equation.terms.length === 0) return null;
    
    const lastTerm = equation.terms[equation.terms.length - 1];
    // Show the last term with content. If the last one is empty (e.g., after clicking '+'), show the one before it.
    const termToShow = lastTerm.fraction ? lastTerm : (equation.terms.length > 1 ? equation.terms[equation.terms.length - 2] : null);

    if (!termToShow?.fraction) {
        return null;
    }

    return (
        <div className="w-full mb-4 p-3 rounded-lg chalk-bg-light text-chalk-light font-sans animate-pop-in">
            <div className="flex justify-around items-center text-center">
                <div>
                    <p className="font-bold text-chalk-cyan">Current Term</p>
                    <p className="font-mono text-2xl font-black">{termToShow.fraction.numerator}/{termToShow.fraction.denominator}</p>
                    <p className="text-sm">{getFractionInfo(termToShow.fraction)}</p>
                </div>
            </div>
        </div>
    );
};