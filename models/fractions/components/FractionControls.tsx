import React from 'react';
import type { EquationState, FractionOperator } from '../../../types';

interface FractionControlsProps {
    onOperatorSelect: (operator: FractionOperator) => void;
    onSolve: () => void;
    onClear: () => void;
    equation: EquationState;
    spotlightOn?: FractionOperator | 'solve';
}

const OperatorButton: React.FC<{
    operator: FractionOperator;
    onClick: () => void;
    disabled: boolean;
    isActive: boolean;
    isSpotlighted: boolean;
}> = ({ operator, onClick, disabled, isActive, isSpotlighted }) => {
    const baseStyle = "w-16 h-16 rounded-full font-display text-4xl shadow-md border-b-4 transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";
    const colorStyle = operator === '+'
        ? `bg-sky-500 border-sky-700 ${isActive ? 'ring-4 ring-sky-300' : ''}`
        : `bg-pink-500 border-pink-700 ${isActive ? 'ring-4 ring-pink-300' : ''}`;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${colorStyle} text-white ${isSpotlighted ? 'animate-guide-pulse' : ''}`}
        >
            {operator}
        </button>
    );
};

export const FractionControls: React.FC<FractionControlsProps> = ({ onOperatorSelect, onSolve, onClear, equation, spotlightOn }) => {
    const { term1, operator, term2, isSolved } = equation;
    
    // Base disabled condition for operators
    const isOperatorDisabled = !term1 || !!operator || isSolved;

    return (
        <div className="w-full flex justify-between items-center p-4 rounded-2xl" style={{ backgroundColor: 'var(--panel-bg)' }}>
            <button
                onClick={onClear}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl shadow-md border-b-4 border-red-700 active:border-b-2 transition-transform transform hover:scale-105"
            >
                Clear
            </button>

            <div className="flex gap-4">
                <OperatorButton
                    operator="+"
                    onClick={() => onOperatorSelect('+')}
                    disabled={isOperatorDisabled || (!!spotlightOn && spotlightOn !== '+')}
                    isActive={operator === '+'}
                    isSpotlighted={spotlightOn === '+'}
                />
                <OperatorButton
                    operator="-"
                    onClick={() => onOperatorSelect('-')}
                    disabled={isOperatorDisabled || (!!spotlightOn && spotlightOn !== '-')}
                    isActive={operator === '-'}
                    isSpotlighted={spotlightOn === '-'}
                />
            </div>
            
            <button
                onClick={onSolve}
                disabled={!term1 || !operator || !term2 || isSolved}
                className={`font-bold py-3 px-8 rounded-xl shadow-lg border-b-4 active:border-b-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-white font-display text-2xl ${spotlightOn === 'solve' ? 'animate-guide-pulse' : ''}`}
                style={{ backgroundColor: 'var(--btn-action-bg)', borderColor: 'var(--btn-action-border)' }}
            >
                Solve
            </button>
        </div>
    );
};