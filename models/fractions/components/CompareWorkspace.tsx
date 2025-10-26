import React from 'react';
import type { Fraction } from '../../../types';
import { FractionPiece } from './FractionBlock';
import { fractionsAreEqual } from '../utils/fractions';

interface CompareWorkspaceProps {
    fractions: Fraction[];
    selectedFraction: Fraction | null;
    onSelect: (fraction: Fraction) => void;
}

export const CompareWorkspace: React.FC<CompareWorkspaceProps> = ({ fractions, selectedFraction, onSelect }) => {
    return (
        <div className="w-full p-6 mt-4 rounded-2xl chalk-border flex flex-col items-center gap-6 animate-pop-in">
            <div className="w-full flex flex-col items-center gap-4">
                {fractions.map((fraction, index) => {
                    const isSelected = fractionsAreEqual(fraction, selectedFraction);
                    return (
                        <button
                            key={index}
                            onClick={() => onSelect(fraction)}
                            className={`w-full max-w-xl p-2 rounded-lg transition-all duration-200 ${isSelected ? 'bg-yellow-400/30 ring-2 ring-yellow-400' : 'hover:bg-white/10'}`}
                        >
                            <div style={{ width: `${(fraction.numerator / fraction.denominator) * 100}%`}}>
                                <FractionPiece fraction={fraction} />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
