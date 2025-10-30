import React from 'react';
import type { EquationState } from '../../../types';
import { fractionsAreEqual } from '../utils/fractions';

interface WorkoutControlsProps {
    workoutStep: EquationState['workoutStep'];
    onNextStep: () => void;
    onFinish: () => void;
    equation: EquationState;
}

export const WorkoutControls: React.FC<WorkoutControlsProps> = ({ workoutStep, onNextStep, onFinish, equation }) => {
    
    const getButtonText = () => {
        switch(workoutStep) {
            case 'commonDenominator': return 'Next: Find Common Denominator';
            case 'combine': return 'Next: Combine / Subtract';
            case 'simplify':
                const { unsimplifiedResult, result } = equation;
                const canSimplify = unsimplifiedResult && result && !fractionsAreEqual(unsimplifiedResult, result);
                return canSimplify ? 'Next: Simplify Result' : 'Done';
            case 'done': return 'Finish';
            default: return 'Next Step';
        }
    };
    
    const isNextDisabled = workoutStep === 'idle';
    const isFinishDisabled = workoutStep !== 'done';

    return (
        <div className="w-full mt-4 p-4 rounded-2xl chalk-bg-light flex justify-center items-center flex-wrap gap-4 animate-pop-in">
            <button 
                onClick={onNextStep}
                disabled={isNextDisabled || workoutStep === 'done'}
                className="control-button bg-sky-600 border-sky-800 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
                {getButtonText()}
            </button>
            <button 
                onClick={onFinish}
                className="control-button bg-green-600 border-green-800 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
                {isFinishDisabled ? 'Solve Directly' : 'Finish'}
            </button>
        </div>
    );
};