import React, { useState } from 'react';
import type { CalculationResult } from '../../../types';

interface SolutionPanelProps {
    result: CalculationResult;
    unit: string;
    onHighlightPart: (partId: string | null) => void;
    isComparisonView?: boolean;
    comparisonResult?: CalculationResult;
}

const FormulaDerivation: React.FC<{ 
    derivation: Required<CalculationResult>['derivation'], 
    onHighlightPart: (partId: string | null) => void 
}> = ({ derivation, onHighlightPart }) => {
    if (!derivation) return null;

    return (
        <div className="mb-4 p-3 rounded-md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
            <h4 className="text-lg font-bold font-display" style={{ color: 'var(--blueprint-accent)' }}>{derivation.title}</h4>
            <div className="mt-2 space-y-2">
                {derivation.parts.map((part, index) => (
                    <div
                        key={index}
                        onMouseEnter={() => onHighlightPart(part.meshId)}
                        onMouseLeave={() => onHighlightPart(null)}
                        className="p-2 rounded-md transition-colors duration-200 hover:bg-[var(--blueprint-accent)]/20 cursor-pointer"
                    >
                        <p className="font-semibold" style={{ color: 'var(--blueprint-text-primary)' }}>
                            {part.partName}: <span className="font-mono">{part.formula}</span>
                        </p>
                    </div>
                ))}
                {derivation.finalFormula && (
                    <p className="mt-2 pt-2 border-t-2" style={{ borderColor: 'var(--blueprint-border)', color: 'var(--blueprint-text-primary)' }}>
                        <strong>Total: </strong><span className="font-mono">{derivation.finalFormula}</span>
                    </p>
                )}
            </div>
        </div>
    );
};


export const SolutionPanel: React.FC<SolutionPanelProps> = ({ result, unit, onHighlightPart, isComparisonView, comparisonResult }) => {
    const [isCopied, setIsCopied] = useState(false);

    if (!result) return null;
    
    const renderWithUnits = (text: string) => {
        if (unit === 'units') return text;
        return text.replace(/units³/g, `${unit}³`).replace(/units²/g, `${unit}²`);
    };
    
    if (isComparisonView && comparisonResult) {
        const ratio = result.value / comparisonResult.value;
        return (
            <div className="w-full p-6 rounded-2xl shadow-lg border backdrop-blur-sm mt-6 animate-pop-in" style={{ backgroundColor: 'var(--blueprint-panel-bg)', borderColor: 'var(--blueprint-border)' }}>
                <h3 className="text-2xl font-bold font-display" style={{ color: 'var(--blueprint-accent)' }}>Shape Relationship</h3>
                 <p className="text-lg mt-2 mb-4" style={{ color: 'var(--blueprint-text-secondary)'}}>Comparing a cylinder and a cone with the same radius and height.</p>
                
                <div className="space-y-3 font-mono text-lg">
                    <div className="p-3 rounded-md bg-black/30">
                        <p style={{ color: 'var(--blueprint-text-secondary)'}}>Cylinder Volume</p>
                        <p className="font-bold text-xl" style={{ color: 'var(--blueprint-text-primary)'}}>{result.value.toFixed(2)} {unit}³</p>
                    </div>
                     <div className="p-3 rounded-md bg-black/30">
                        <p style={{ color: 'var(--blueprint-text-secondary)'}}>Cone Volume</p>
                        <p className="font-bold text-xl" style={{ color: 'var(--blueprint-text-primary)'}}>{comparisonResult.value.toFixed(2)} {unit}³</p>
                    </div>
                     <div className="p-3 rounded-md bg-[var(--blueprint-accent)]/20">
                        <p style={{ color: 'var(--blueprint-text-secondary)'}}>Ratio (Cylinder : Cone)</p>
                        <p className="font-bold text-xl" style={{ color: 'var(--blueprint-text-primary)'}}>{ratio.toFixed(1)} : 1</p>
                    </div>
                </div>
                 <p className="text-lg mt-4 p-3 bg-green-500/20 rounded-md border border-green-500/50" style={{ color: 'var(--blueprint-text-primary)'}}>
                    <strong>Conclusion:</strong> A cylinder's volume is exactly <strong>3 times</strong> the volume of a cone with an identical base and height.
                </p>
            </div>
        );
    }

    const fullText = [
        result.derivation ? `${result.derivation.title}:\n` + result.derivation.parts.map(p => `${p.partName}: ${p.formula}`).join('\n') : '',
        `\nFinal Formula: ${renderWithUnits(result.formula)}`,
        ...result.steps.map(step => `${step.description}:\n${renderWithUnits(step.calculation)}\n= ${renderWithUnits(step.result)}`)
    ].join('\n\n').trim();

    const handleCopy = () => {
        navigator.clipboard.writeText(fullText).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="w-full p-6 rounded-2xl shadow-lg border backdrop-blur-sm animate-pop-in" style={{ backgroundColor: 'var(--blueprint-panel-bg)', borderColor: 'var(--blueprint-border)' }}>
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-2xl font-bold font-display" style={{ color: 'var(--blueprint-accent)' }}>Solution Steps</h3>
                 <button onClick={handleCopy} className="px-3 py-1 text-sm font-bold rounded-md flex items-center gap-2" style={{ backgroundColor: 'var(--blueprint-input-bg)', color: 'var(--blueprint-text-secondary)', border: '1px solid var(--blueprint-border)' }}>
                    {isCopied ? 'Copied!' : 'Copy'}
                 </button>
            </div>
           
            <div className="space-y-4 font-mono max-h-[600px] overflow-y-auto pr-2">
                {result.derivation && (
                    <FormulaDerivation derivation={result.derivation} onHighlightPart={onHighlightPart} />
                )}

                <div className="p-3 rounded-md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
                    <p className="text-sm" style={{ color: 'var(--blueprint-text-secondary)' }}>Formula</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--blueprint-text-primary)' }}>{renderWithUnits(result.formula)}</p>
                </div>
                
                {result.steps.map((step, index) => (
                    <div key={index} className="p-3 rounded-md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
                        <p className="text-sm" style={{ color: 'var(--blueprint-text-secondary)' }}>{step.description}</p>
                        <p className="text-lg" style={{ color: 'var(--blueprint-text-primary)' }}>{renderWithUnits(step.calculation)}</p>
                        <p className="text-lg font-bold" style={{ color: 'var(--blueprint-text-primary)' }}>= {renderWithUnits(step.result)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};