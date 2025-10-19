import React from 'react';
import type { Fraction } from '../../../types';

interface CalculationExplanationPanelProps {
  original: Fraction;
  target: Fraction;
}

const FractionDisplay: React.FC<{ fraction: Fraction, numColor: string, denColor: string }> = ({ fraction, numColor, denColor }) => (
    <div className="flex flex-col items-center font-chalk text-7xl">
        <span className={numColor}>{fraction.numerator}</span>
        <div className="border-t-4 border-chalk-light w-16 my-1"></div>
        <span className={denColor}>{fraction.denominator}</span>
    </div>
);

export const CalculationExplanationPanel: React.FC<CalculationExplanationPanelProps> = ({ original, target }) => {
  const multiplier = target.denominator / original.denominator;

  // Don't show if there's no multiplication to explain
  if (multiplier === 1) return null;

  return (
    <div className="absolute inset-0 bg-black/70 z-20 flex items-center justify-center animate-pop-in p-4">
      <div className="p-8 rounded-2xl chalk-border chalk-bg-light text-chalk-light text-center max-w-2xl w-full">
        <h3 className="text-4xl font-chalk text-chalk-yellow mb-4">Finding a Common Denominator</h3>
        <p className="text-xl mb-8">To make the pieces match, we multiply the top and bottom by <span className="text-chalk-green font-bold">{multiplier}</span>.</p>
        
        <div className="flex items-center justify-center gap-6 p-6 bg-slate-900/50 rounded-xl">
          {/* Original Fraction */}
          <FractionDisplay fraction={original} numColor="text-chalk-cyan" denColor="text-chalk-yellow" />

          <div className="text-5xl font-chalk text-chalk-light">×</div>

          {/* Multiplier Fraction */}
          <FractionDisplay fraction={{ numerator: multiplier, denominator: multiplier }} numColor="text-chalk-green" denColor="text-chalk-green" />

          <div className="text-5xl font-chalk text-chalk-light">=</div>
          
          {/* Target Fraction */}
          <FractionDisplay fraction={target} numColor="text-chalk-cyan" denColor="text-chalk-yellow" />
        </div>
      </div>
    </div>
  );
};
