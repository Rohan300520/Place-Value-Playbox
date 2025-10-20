import React, { useState } from 'react';
import type { CalculationResult } from '../../../types';

interface SolutionPanelProps {
    result: CalculationResult;
}

export const SolutionPanel: React.FC<SolutionPanelProps> = ({ result }) => {
    const [isCopied, setIsCopied] = useState(false);

    if (!result) return null;

    const fullText = [
        result.formula,
        ...result.steps.map(step => `${step.description}:\n${step.calculation}\n= ${step.result}`)
    ].join('\n\n');

    const handleCopy = () => {
        navigator.clipboard.writeText(fullText).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="w-full p-6 rounded-2xl shadow-lg border backdrop-blur-sm mt-6 animate-pop-in" style={{ backgroundColor: 'var(--blueprint-panel-bg)', borderColor: 'var(--blueprint-border)' }}>
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-2xl font-bold font-display" style={{ color: 'var(--blueprint-accent)' }}>Solution Steps</h3>
                 <button onClick={handleCopy} className="px-3 py-1 text-sm font-bold rounded-md flex items-center gap-2" style={{ backgroundColor: 'var(--blueprint-input-bg)', color: 'var(--blueprint-text-secondary)', border: '1px solid var(--blueprint-border)' }}>
                    {isCopied ? 'Copied!' : 'Copy'}
                 </button>
            </div>
           
            <div className="space-y-4 font-mono">
                <div className="p-3 rounded-md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
                    <p className="text-sm" style={{ color: 'var(--blueprint-text-secondary)' }}>Formula</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--blueprint-text-primary)' }}>{result.formula}</p>
                </div>
                
                {result.steps.map((step, index) => (
                    <div key={index} className="p-3 rounded-md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
                        <p className="text-sm" style={{ color: 'var(--blueprint-text-secondary)' }}>{step.description}</p>
                        <p className="text-lg" style={{ color: 'var(--blueprint-text-primary)' }}>{step.calculation}</p>
                        <p className="text-lg font-bold" style={{ color: 'var(--blueprint-text-primary)' }}>= {step.result}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};