import React from 'react';
import type { EquationState, FractionOperator } from '../../../types';

interface FractionControlsProps {
    onOperatorSelect: (operator: FractionOperator) => void;
    onSolve: () => void;
    onWorkout: () => void;
    onClear: () => void;
    equation: EquationState;
}

export const FractionControls: React.FC<FractionControlsProps> = ({ onOperatorSelect, onSolve, onWorkout, onClear, equation }) => {
    const { terms, operators, isSolved } = equation;
    
    const lastTerm = terms[terms.length - 1];
    
    const canSelectOperator = lastTerm.fraction !== null && !isSolved;
    const canSolveOrWorkout = terms.length >= 2 && operators.length === terms.length - 1 && lastTerm.fraction !== null && !isSolved;
    const canClear = terms.length > 1 || terms[0].fraction !== null || isSolved;

    return (
        <div className="w-full mt-4 p-4 rounded-2xl chalk-bg-light flex justify-center sm:justify-between items-center flex-wrap gap-2 sm:gap-4">
            <div className="flex gap-4">
                <button 
                    onClick={() => onOperatorSelect('+')}
                    disabled={!canSelectOperator}
                    className={`control-button bg-sky-600 border-sky-800 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none`}
                >
                    +
                </button>
                 <button 
                    onClick={() => onOperatorSelect('-')}
                    disabled={!canSelectOperator}
                    className={`control-button bg-sky-600 border-sky-800 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none`}
                >
                    -
                </button>
            </div>
            
            <div className="flex gap-4">
                <button 
                    onClick={onWorkout}
                    disabled={!canSolveOrWorkout}
                    className="control-button bg-indigo-500 border-indigo-700 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                    Workout
                </button>
                <button 
                    onClick={onSolve}
                    disabled={!canSolveOrWorkout}
                    className="control-button bg-green-600 border-green-800 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                    = Solve
                </button>
            </div>

             <button 
                onClick={onClear}
                disabled={!canClear}
                className="control-button bg-red-600 border-red-800 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
                Clear
            </button>
        </div>
    );
};