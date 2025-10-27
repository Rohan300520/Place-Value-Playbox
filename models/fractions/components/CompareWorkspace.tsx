import React from 'react';
import type { Fraction } from '../../../types';
import { FractionPiece } from './FractionBlock';
import { fractionsAreEqual } from '../utils/fractions';

// NEW VISUAL COMPONENT
const FractionBarVisual: React.FC<{ fraction: Fraction, isSelected: boolean }> = ({ fraction, isSelected }) => {
  const segments = Array.from({ length: fraction.denominator });
  return (
    <div className={`w-full p-3 rounded-lg transition-all duration-200 ${isSelected ? 'bg-yellow-400/30 ring-2 ring-yellow-400' : 'hover:bg-white/10'}`}>
        <div className="flex items-center justify-between mb-2">
            <div className="w-24">
                <FractionPiece fraction={fraction} />
            </div>
            <p className="font-chalk text-2xl text-chalk-light">{fraction.numerator} out of {fraction.denominator} parts</p>
        </div>
        <div className="flex w-full h-12 rounded-lg overflow-hidden border-2 border-chalk-border bg-chalk-bg-light">
            {segments.map((_, i) => (
                <div 
                    key={i}
                    className="flex-1 border-r-2 border-chalk-border/50 last:border-r-0"
                    style={{ backgroundColor: i < fraction.numerator ? 'var(--chalk-cyan)' : 'transparent' }}
                />
            ))}
        </div>
    </div>
  );
};

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
                            className="w-full max-w-xl"
                        >
                           <FractionBarVisual fraction={fraction} isSelected={isSelected} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};