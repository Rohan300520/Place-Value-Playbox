import React, { useState, useEffect } from 'react';
import type { CalculationResult } from '../../../types';

interface CalculationPanelProps {
    result: CalculationResult;
    onHoverPart: (partId: string | string[] | null) => void;
    onLeavePart: () => void;
}

export const CalculationPanel: React.FC<CalculationPanelProps> = ({ result, onHoverPart, onLeavePart }) => {
    const [visibleStep, setVisibleStep] = useState(-1); // -1: hidden, 0: step 1, 1: step 2, etc.

    useEffect(() => {
        setVisibleStep(-1);
    }, [result]);

    if (!result) return null;

    const unit = result.formula.startsWith('V') ? ' units³' : ' units²';

    const handleShowSteps = () => {
        setVisibleStep(0);
    };

    const handleNextStep = () => {
        setVisibleStep(prev => Math.min(prev + 1, result.steps.length - 1));
    };

    return (
        <div className="p-4 rounded-2xl shadow-lg border space-y-2 flex-grow animate-pop-in overflow-y-auto" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)' }}>
            {/* Final Result */}
            <div className="text-center">
                <h3 className="text-lg font-bold" style={{color: 'var(--text-secondary)'}}>Result</h3>
                <p className="text-5xl font-black font-display" style={{color: 'var(--text-accent)'}}>
                    {result.value.toFixed(2)}
                    <span className="text-2xl" style={{color: 'var(--text-secondary)'}}>{unit}</span>
                </p>
            </div>

            {/* Formula */}
            <div className="text-center p-2 bg-black/10 rounded-lg">
                <h4 className="font-bold" style={{color: 'var(--text-secondary)'}}>Formula</h4>
                <p className="font-mono text-xl font-bold">{result.formula}</p>
            </div>
            
            {/* Steps */}
            <div className="space-y-4">
                 <h4 className="font-bold" style={{color: 'var(--text-secondary)'}}>Steps</h4>
                 {visibleStep === -1 ? (
                    <button onClick={handleShowSteps} className="w-full py-2 font-bold rounded-lg bg-sky-600 hover:bg-sky-500 transition-colors">
                        Show Steps
                    </button>
                 ) : (
                    <>
                        {result.steps.slice(0, visibleStep + 1).map((step, index) => (
                            <div key={index} className={`p-2 bg-black/10 rounded-lg transition-all duration-300 ${index === visibleStep ? 'ring-2 ring-sky-400' : ''}`}>
                                <p className="text-sm">{step.description}:</p>
                                <p className="font-mono text-md">{step.calculation} = <span className="font-bold text-green-400">{step.result}</span></p>
                            </div>
                        ))}
                        {visibleStep < result.steps.length - 1 && (
                            <button onClick={handleNextStep} className="w-full py-2 font-bold rounded-lg bg-sky-600 hover:bg-sky-500 transition-colors animate-pulse">
                                Next Step
                            </button>
                        )}
                    </>
                 )}
            </div>

            {/* Derivation */}
            {result.derivation && (
                <div className="space-y-4 pt-4 border-t" style={{borderColor: 'var(--border-primary)'}}>
                     <h4 className="font-bold" style={{color: 'var(--text-secondary)'}}>Formula Derivation</h4>
                     <p className="text-sm italic">{result.derivation.title}</p>
                     {result.derivation.parts.map((part, index) => (
                        <div 
                            key={index} 
                            className="p-2 bg-black/10 rounded-lg transition-colors hover:bg-indigo-500/20 cursor-pointer"
                            onMouseEnter={() => onHoverPart(part.meshId)}
                            onMouseLeave={onLeavePart}
                        >
                            <p className="font-bold">{part.partName}: <span className="font-mono">{part.formula}</span></p>
                        </div>
                     ))}
                </div>
            )}
        </div>
    );
};