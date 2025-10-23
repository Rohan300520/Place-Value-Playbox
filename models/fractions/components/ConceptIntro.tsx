import React, { useState } from 'react';
import type { FractionTrainingStep, TrainingAction } from '../../../types';

interface ConceptIntroProps {
  // For training mode
  isTrainingMode?: boolean;
  onAction?: (action: { type: TrainingAction, value: number }) => void;
  currentStep?: FractionTrainingStep | null;
  denominator?: number;
  selectedPieces?: boolean[];
}

const DenominatorButton: React.FC<{ value: number, activeValue: number, onClick: (value: number) => void, isSpotlighted: boolean }> = ({ value, activeValue, onClick, isSpotlighted }) => (
    <button 
        onClick={() => onClick(value)}
        className={`control-button text-lg px-4 py-2 ${activeValue === value ? 'bg-orange-500 border-orange-700' : 'bg-gray-500 border-gray-700 hover:bg-gray-400'} ${isSpotlighted ? 'animate-guide-pulse' : ''}`}
    >
        Cut in {value}
    </button>
);

const FractionPiece: React.FC<{ isSelected: boolean, onClick: () => void }> = ({ isSelected, onClick }) => (
    <div 
        onClick={onClick}
        className="h-full flex-1 border-l-4 border-slate-700/50 first:border-l-0 transition-all duration-300 cursor-pointer"
        style={{
            backgroundColor: isSelected ? 'var(--chalk-cyan)' : 'var(--chalk-bg-light)',
        }}
    />
);

export const ConceptIntro: React.FC<ConceptIntroProps> = ({ 
    isTrainingMode = false, 
    onAction, 
    currentStep,
    denominator: propsDenominator,
    selectedPieces: propsSelectedPieces
}) => {
    // Internal state for standalone mode
    const [internalDenominator, setInternalDenominator] = useState(4);
    const [internalSelectedPieces, setInternalSelectedPieces] = useState<boolean[]>(Array(4).fill(false));

    // Use props for controlled (training) mode, otherwise use internal state
    const denominator = isTrainingMode ? propsDenominator ?? 4 : internalDenominator;
    const selectedPieces = isTrainingMode ? propsSelectedPieces ?? Array(denominator).fill(false) : internalSelectedPieces;
    
    const numerator = selectedPieces.filter(Boolean).length;

    const handleDenominatorChange = (value: number) => {
        if (isTrainingMode && onAction) {
            onAction({ type: 'set_denominator', value });
        } else {
            setInternalDenominator(value);
            setInternalSelectedPieces(Array(value).fill(false));
        }
    };

    const handlePieceClick = (index: number) => {
        if (isTrainingMode && onAction) {
            onAction({ type: 'select_pieces', value: index });
        } else {
            const newSelectedPieces = [...internalSelectedPieces];
            newSelectedPieces[index] = !newSelectedPieces[index];
            setInternalSelectedPieces(newSelectedPieces);
        }
    };

    return (
        <div className={`fractions-theme w-full max-w-4xl flex-grow flex flex-col items-center justify-center ${!isTrainingMode ? 'animate-pop-in' : ''}`}>
            <div className="w-full p-6 rounded-2xl chalk-border">
                <h2 className="text-4xl font-chalk text-center text-chalk-yellow mb-6">The Anatomy of a Fraction</h2>

                <div className={`w-full h-24 rounded-lg flex overflow-hidden shadow-inner bg-slate-800 mb-6 ${currentStep?.spotlightOn === 'pieces' ? 'animate-guide-pulse' : ''}`}>
                    {Array.from({ length: denominator }).map((_, i) => (
                        <FractionPiece key={i} isSelected={selectedPieces[i]} onClick={() => handlePieceClick(i)} />
                    ))}
                </div>

                <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8">
                    <div className="text-center w-full md:w-64">
                        <p className="text-xl font-chalk text-chalk-cyan">Numerator</p>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-chalk-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                        </svg>
                        <p className="text-lg text-chalk-light mt-2">How many pieces you have.</p>
                    </div>

                    <div className="font-chalk text-chalk-light text-center">
                        <div className="text-8xl text-chalk-cyan">{numerator}</div>
                        <div className="border-t-8 border-chalk-light w-32 my-2"></div>
                        <div className="text-8xl text-chalk-yellow">{denominator}</div>
                    </div>

                    <div className="text-center w-full md:w-64">
                         <p className="text-xl font-chalk text-chalk-yellow">Denominator</p>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-chalk-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110 18 9 9 0 010-18z" />
                        </svg>
                        <p className="text-lg text-chalk-light mt-2">How many equal pieces the whole is cut into.</p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t-2 border-dashed border-chalk-border flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <p className="text-xl font-chalk text-chalk-light">Change the cuts:</p>
                        <DenominatorButton value={2} activeValue={denominator} onClick={handleDenominatorChange} isSpotlighted={currentStep?.spotlightOn === 'denominator-2'}/>
                        <DenominatorButton value={4} activeValue={denominator} onClick={handleDenominatorChange} isSpotlighted={currentStep?.spotlightOn === 'denominator-4'}/>
                        <DenominatorButton value={8} activeValue={denominator} onClick={handleDenominatorChange} isSpotlighted={currentStep?.spotlightOn === 'denominator-8'}/>
                    </div>
                </div>
            </div>
        </div>
    );
};