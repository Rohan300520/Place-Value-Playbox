import React from 'react';
import type { Fraction, TrainingActivity } from '../../../types';
import { FractionPiece } from './FractionBlock';
import { getFractionalValue } from '../utils/fractions';

interface ActivityPanelProps {
    activity: TrainingActivity;
    feedback: { type: 'error' | 'success' | 'hint', message: string } | null;
    onCheck: () => void;
    onReset: () => void;
}

const FractionBar: React.FC<{ fraction: Fraction, label: string }> = ({ fraction, label }) => {
    const value = getFractionalValue(fraction);
    const widthPercent = Math.min(value * 100, 100);
    return (
        <div className="w-full">
            <p className="font-chalk text-xl text-chalk-light mb-1">{label}</p>
            <div className="w-full h-12 rounded-lg bg-chalk-bg-light border-2 border-chalk-border p-1">
                <div className="h-full" style={{ width: `${widthPercent}%` }}>
                    <FractionPiece fraction={fraction} />
                </div>
            </div>
        </div>
    );
};

export const ActivityPanel: React.FC<ActivityPanelProps> = ({ activity, feedback, onCheck, onReset }) => {
    
    const getFeedbackColor = () => {
        if (!feedback) return '';
        switch (feedback.type) {
            case 'success': return 'text-green-400 border-green-500 bg-green-900/50';
            case 'error': return 'text-red-400 border-red-500 bg-red-900/50';
            case 'hint': return 'text-yellow-400 border-yellow-500 bg-yellow-900/50';
        }
    };

    return (
        <div className="w-full p-4 rounded-2xl chalk-border chalk-bg-light mb-4 animate-pop-in">
            {activity.type === 'build' && (
                <div className="text-center">
                    <p className="font-chalk text-2xl text-chalk-cyan">Build This Fraction</p>
                    <div className="inline-flex flex-col items-center my-2">
                        <span className="font-chalk text-8xl text-chalk-yellow">{activity.target.numerator}</span>
                        <div className="border-t-8 border-chalk-yellow w-24"></div>
                        <span className="font-chalk text-8xl text-chalk-yellow">{activity.target.denominator}</span>
                    </div>
                </div>
            )}
            {activity.type === 'equivalent' && (
                <div className="text-center">
                    <p className="font-chalk text-2xl text-chalk-cyan">Find a Fraction Equal To This</p>
                    <div className="max-w-md mx-auto my-4">
                        <FractionBar fraction={activity.target} label="Target Size" />
                    </div>
                    <p className="text-chalk-light text-sm">(Hint: Use pieces with a different denominator!)</p>
                </div>
            )}
            {activity.type === 'improper_to_mixed' && (
                <div className="text-center">
                    <p className="font-chalk text-2xl text-chalk-cyan">Convert to a Mixed Fraction</p>
                    <div className="inline-flex flex-col items-center my-2">
                        <span className="font-chalk text-8xl text-chalk-yellow">{activity.target.numerator}</span>
                        <div className="border-t-8 border-chalk-yellow w-24"></div>
                        <span className="font-chalk text-8xl text-chalk-yellow">{activity.target.denominator}</span>
                    </div>
                    <p className="text-chalk-light text-sm">Build its mixed fraction equivalent (e.g., 1 and 2/3) in the workspace.</p>
                </div>
            )}


            {feedback && (
                <div className={`mt-4 p-3 rounded-lg border-2 text-center font-bold text-lg ${getFeedbackColor()}`}>
                    {feedback.message}
                </div>
            )}

            <div className="mt-4 flex justify-center items-center gap-4">
                <button onClick={onReset} className="control-button bg-amber-600 border-amber-800 hover:bg-amber-500">
                    Reset Workspace
                </button>
                <button onClick={onCheck} className="control-button bg-green-600 border-green-800 hover:bg-green-500">
                    Check Answer
                </button>
            </div>
        </div>
    );
};