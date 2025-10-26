import React from 'react';
import type { WorkspacePiece, Fraction, EquationState } from '../../../types';
import { FractionPiece } from './FractionBlock';
import { getFractionalValue } from '../utils/fractions';

interface CalculationWorkspaceProps {
    pieces?: WorkspacePiece[]; // For training mode
    equation?: EquationState; // For explore mode
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    isDropZoneActive: boolean;
    spotlightOn?: string | null;
    onBarClick?: (fraction: Fraction) => void;
}

const renderPieceGroup = (group: WorkspacePiece[], onBarClick?: (fraction: Fraction) => void) => {
    if (!group || group.length === 0) return null;

    const totalNumerator = group.reduce((sum, piece) => sum + piece.fraction.numerator, 0);
    const denominator = group[0].fraction.denominator;
    const totalWidthPercentage = (totalNumerator / denominator) * 100;

    const handleBarClick = () => {
        if (onBarClick) {
            onBarClick({ numerator: totalNumerator, denominator });
        }
    };
    
    return (
        <div 
            className={`flex flex-row gap-px transition-opacity animate-pop-in ${onBarClick ? 'cursor-pointer hover:opacity-80' : ''}`}
            style={{ width: `${totalWidthPercentage}%` }}
            onClick={handleBarClick}
        >
            {group.map(piece => (
                <div key={piece.id} className="flex-1">
                    <FractionPiece fraction={piece.fraction} />
                </div>
            ))}
        </div>
    );
};


export const CalculationWorkspace: React.FC<CalculationWorkspaceProps> = ({ pieces, equation, onDrop, onDragOver, isDropZoneActive, spotlightOn, onBarClick }) => {
    const isExploreMode = !!equation;

    // Unify data structure for rendering
    let equationForRender: EquationState;

    if (isExploreMode) {
        equationForRender = equation;
    } else {
        const groupedPieces: WorkspacePiece[][] = [];
        if (pieces && pieces.length > 0) {
            let currentGroup: WorkspacePiece[] = [];
            for (let i = 0; i < pieces.length; i++) {
                const piece = pieces[i];
                const prevPiece = pieces[i - 1];

                // If pieces have same denominator and are idle, group them. Otherwise start a new group.
                if (currentGroup.length > 0 && piece.state === 'idle' && prevPiece.state === 'idle' && piece.fraction.denominator === prevPiece.fraction.denominator) {
                    currentGroup.push(piece);
                } else {
                    if (currentGroup.length > 0) {
                        groupedPieces.push(currentGroup);
                    }
                    currentGroup = [piece];
                }
            }
            if (currentGroup.length > 0) {
                groupedPieces.push(currentGroup);
            }
        }

        equationForRender = {
            terms: groupedPieces.map(group => ({ fraction: null, pieces: group })),
            operators: [],
            result: null,
            resultPieces: [],
            isSolved: false,
        };
    }

    const hasContent = equationForRender.terms.some(t => t.pieces.length > 0);

    const containerClasses = `w-full min-h-[20rem] p-6 rounded-2xl chalk-border flex flex-col justify-start relative transition-all duration-300 gap-2 ${isDropZoneActive ? 'bg-slate-700/50' : ''}`;
    const alignmentClass = isExploreMode ? 'items-start' : 'items-start';

    return (
        <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className={`${containerClasses} ${alignmentClass}`}
        >
            {spotlightOn === 'whole_bar' && <div className="w-full h-12 rounded-lg bg-amber-600 opacity-90 animate-pop-in my-2 animate-guide-pulse"><div className="relative flex items-center justify-center h-full"><span className="text-white font-chalk text-2xl" style={{ textShadow: '2px 2px 3px rgba(0,0,0,0.5)' }}>1 WHOLE</span></div></div>}

            {!hasContent && !isDropZoneActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-xl text-chalk-light">Drag pieces from the chart into this workspace.</p>
                </div>
            )}
            
            {/* UNIFIED RENDER LOGIC */}
            <div className="w-full">
                {equationForRender.isSolved ? (
                    // SOLVED VIEW:
                    <div className="w-full flex flex-col items-start animate-pop-in">
                        <div className="border-t-4 border-chalk-yellow w-full my-4"></div>
                        {(() => {
                            const result = equationForRender.result;
                            const pieces = equationForRender.resultPieces;
                            if (!result || !pieces.length) return null;

                            const resultValue = getFractionalValue(result);

                            // If the visual representation would be too wide (e.g., > 120%),
                            // render it as a single, non-scaled block to prevent overflow.
                            if (resultValue > 1.2) {
                                return (
                                    <div className="w-full max-w-md self-center px-4">
                                        <FractionPiece fraction={result} />
                                    </div>
                                );
                            } else {
                                // Otherwise, render the fraction to scale.
                                return renderPieceGroup(pieces);
                            }
                        })()}
                    </div>
                ) : (
                    // BUILDING VIEW: Show the terms horizontally.
                    <div className={`flex gap-4 ${isExploreMode ? 'flex-wrap flex-row items-center' : 'flex-col w-full items-start'}`}>
                        {equationForRender.terms.map((term, index) => {
                            // Special handling for animating pieces in training mode
                            if (!isExploreMode && term.pieces.length === 1 && term.pieces[0].state !== 'idle') {
                                const piece = term.pieces[0];
                                const animationClass = piece.state === 'splitting' ? 'animate-bouncy-pop-in' : piece.state === 'removing' ? 'animate-slide-out-left' : piece.state === 'merging' ? 'animate-piece-merge' : '';
                                return (
                                     <div key={piece.id} className={`flex flex-row gap-px ${animationClass}`} style={{ width: `${(piece.fraction.numerator / piece.fraction.denominator) * 100}%` }}>
                                        <div className="flex-1"><FractionPiece fraction={piece.fraction} /></div>
                                    </div>
                                );
                            }

                            return (
                                <React.Fragment key={`term-${index}`}>
                                    {renderPieceGroup(term.pieces, onBarClick)}
                                    {isExploreMode && equationForRender.operators[index] && (
                                        <span className="text-5xl font-chalk text-chalk-yellow animate-pop-in">
                                            {equationForRender.operators[index]}
                                        </span>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
