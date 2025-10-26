import React from 'react';
import type { WorkspacePiece, Fraction, EquationState } from '../../../types';
import { FractionPiece } from './FractionBlock';

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
    // Determine which pieces to render based on mode
    const isExploreMode = !!equation;
    const piecesToRender = isExploreMode ? [] : (pieces || []);
    
    // Group consecutive pieces for training mode
    const groupedPieces: WorkspacePiece[][] = [];
    if (!isExploreMode && piecesToRender.length > 0) {
        let currentGroup: WorkspacePiece[] = [];
        for (let i = 0; i < piecesToRender.length; i++) {
            const piece = piecesToRender[i];
            const prevPiece = piecesToRender[i - 1];
            if (piece.state !== 'idle' || currentGroup.length === 0 || piece.fraction.denominator !== prevPiece.fraction.denominator || prevPiece.state !== 'idle') {
                if (currentGroup.length > 0) groupedPieces.push(currentGroup);
                currentGroup = [piece];
            } else {
                currentGroup.push(piece);
            }
        }
        if (currentGroup.length > 0) groupedPieces.push(currentGroup);
    }
    
    const hasContent = isExploreMode ? (equation.terms[0].pieces.length > 0) : (piecesToRender.length > 0);

    return (
        <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className={`w-full min-h-[20rem] p-6 rounded-2xl chalk-border flex flex-col justify-start items-start relative transition-all duration-300 gap-2 ${isDropZoneActive ? 'bg-slate-700/50' : ''}`}
        >
            {spotlightOn === 'whole_bar' && <div className="w-full h-12 rounded-lg bg-amber-600 opacity-90 animate-pop-in my-2 animate-guide-pulse"><div className="relative flex items-center justify-center h-full"><span className="text-white font-chalk text-2xl" style={{ textShadow: '2px 2px 3px rgba(0,0,0,0.5)' }}>1 WHOLE</span></div></div>}

            {!hasContent && !isDropZoneActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-xl text-chalk-light">Drag pieces from the chart into this workspace.</p>
                </div>
            )}
            
            {/* EXPLORE MODE RENDERING */}
            {isExploreMode && (
                <div className="w-full">
                    {equation.isSolved ? (
                        // SOLVED VIEW: Only show the result.
                        <div className="w-full flex animate-pop-in">
                            {renderPieceGroup(equation.resultPieces)}
                        </div>
                    ) : (
                        // BUILDING VIEW: Show the terms horizontally.
                        <div className="flex flex-wrap items-center gap-4">
                            {equation.terms.map((term, index) => (
                                <React.Fragment key={`term-${index}`}>
                                    {renderPieceGroup(term.pieces)}
                                    {equation.operators[index] && (
                                        <span className="text-5xl font-chalk text-chalk-yellow animate-pop-in">
                                            {equation.operators[index]}
                                        </span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TRAINING MODE RENDERING */}
            {!isExploreMode && groupedPieces.map((group, groupIndex) => {
                if (group.length === 1 && group[0].state !== 'idle') {
                    const piece = group[0];
                    const animationClass = piece.state === 'splitting' ? 'animate-bouncy-pop-in' : piece.state === 'removing' ? 'animate-slide-out-left' : piece.state === 'merging' ? 'animate-piece-merge' : '';
                    return (
                         <div key={piece.id} className={`flex flex-row gap-px ${animationClass}`} style={{ width: `${(piece.fraction.numerator / piece.fraction.denominator) * 100}%` }}>
                            <div className="flex-1"><FractionPiece fraction={piece.fraction} /></div>
                        </div>
                    );
                }
                return <div key={groupIndex}>{renderPieceGroup(group, onBarClick)}</div>;
            })}
        </div>
    );
};