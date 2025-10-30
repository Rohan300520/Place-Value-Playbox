import React from 'react';
import type { WorkspacePiece, Fraction, EquationState, EquationTerm } from '../../../types';
import { FractionPiece } from './FractionBlock';
import { SplittingPiece } from './SplittingPiece';

// FIX: Define the missing props interface for the component.
interface CalculationWorkspaceProps {
    pieces?: WorkspacePiece[]; // For training mode
    equation?: EquationState; // For explore mode
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    isDropZoneActive: boolean;
    spotlightOn?: string | null;
    onBarClick?: (fraction: Fraction) => void;
    onWorkspacePieceDragStart?: (e: React.DragEvent<HTMLDivElement>, pieceId: string) => void;
    onWorkspacePieceDragEnd?: () => void;
}

// Define a threshold for when to switch to a consolidated view for better visibility.
const DENOMINATOR_VISIBILITY_THRESHOLD = 20;


// This function renders a group of pieces. It's complex to handle animations and different visual states.
const renderPieceGroup = (
    group: WorkspacePiece[], 
    isCombining: boolean,
    onBarClick?: (fraction: Fraction) => void,
    onWorkspacePieceDragStart?: (e: React.DragEvent<HTMLDivElement>, pieceId: string) => void,
    onWorkspacePieceDragEnd?: () => void
): React.ReactNode => {
    if (!group || group.length === 0) return null;

    const totalNumerator = group.reduce((sum, piece) => sum + piece.fraction.numerator, 0);
    const denominator = group[0].fraction.denominator;
    const totalValue = totalNumerator / denominator;

    const handleBarClick = () => {
        if (onBarClick) {
            onBarClick({ numerator: totalNumerator, denominator });
        }
    };
    
    const allIdle = group.every(p => !p.state || p.state === 'idle');

    // Creative Solution Part 1: Handle wrapping for improper fractions (e.g., 3/2)
    if (totalValue > 1 && allIdle) {
        const piecesPerWhole = denominator / group[0].fraction.numerator;
        let remainingPieces = [...group];
        const rows: React.ReactNode[] = [];
        
        while (remainingPieces.length > 0) {
            const rowPieces = remainingPieces.splice(0, piecesPerWhole);
            const rowValue = rowPieces.reduce((sum, p) => sum + (p.fraction.numerator / p.fraction.denominator), 0);
            
            // If denominator is large, render this row as a single consolidated block
            if (denominator > DENOMINATOR_VISIBILITY_THRESHOLD) {
                const rowNumerator = rowPieces.reduce((sum, p) => sum + p.fraction.numerator, 0);
                rows.push(
                    <div key={`row-${rows.length}`} style={{ width: `${rowValue * 100}%` }}>
                        <FractionPiece 
                            fraction={{ numerator: rowNumerator, denominator: denominator }}
                            isDraggable={false} 
                        />
                    </div>
                );
            } else {
                 // Otherwise, render individual pieces for the row
                rows.push(
                    <div key={`row-${rows.length}`} className="flex flex-row gap-px" style={{ width: `${rowValue * 100}%` }}>
                        {rowPieces.map(piece => (
                            <div key={piece.id} className="flex-1">
                                <FractionPiece
                                    fraction={piece.fraction}
                                    isDraggable={!!onWorkspacePieceDragStart}
                                    onDragStart={onWorkspacePieceDragStart ? (e) => { e.stopPropagation(); onWorkspacePieceDragStart(e, piece.id)} : undefined}
                                    onDragEnd={onWorkspacePieceDragEnd ? (e) => { e.stopPropagation(); onWorkspacePieceDragEnd()} : undefined}
                                />
                            </div>
                        ))}
                    </div>
                );
            }
        }
        
        return (
            <div 
                className={`w-full flex flex-col gap-2 transition-opacity animate-pop-in ${onBarClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                onClick={handleBarClick}
            >
                {rows}
            </div>
        );
    }
    
    // Creative Solution Part 2: For single-line fractions with large denominators, render one consolidated block
    if (denominator > DENOMINATOR_VISIBILITY_THRESHOLD && allIdle) {
        return (
             <div 
                className={`transition-opacity animate-pop-in ${onBarClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                style={{ width: `${totalValue * 100}%` }}
                onClick={handleBarClick}
            >
                <FractionPiece 
                    fraction={{ numerator: totalNumerator, denominator: denominator }}
                    isDraggable={false} 
                />
            </div>
        );
    }
    
    // Original logic for animations or smaller denominators
    return (
        <div 
            className={`flex flex-row gap-px transition-opacity ${isCombining ? '' : 'animate-pop-in'} ${onBarClick ? 'cursor-pointer hover:opacity-80' : ''}`}
            style={{ width: `${totalValue * 100}%` }}
            onClick={handleBarClick}
        >
            {group.map(piece => {
                if (piece.state === 'splitting' && piece.splitInto) {
                    return <SplittingPiece key={piece.id} piece={piece} />;
                }

                const animationClass = 
                    piece.state === 'removing' ? 'animate-subtract-poof' : 
                    isCombining ? 'transition-all duration-1000 ease-in-out' : '';
                
                return (
                    <div key={piece.id} className={`flex-1 ${animationClass}`} style={{ marginRight: isCombining ? '0' : undefined }}>
                        <FractionPiece 
                            fraction={piece.fraction} 
                            isDraggable={!!onWorkspacePieceDragStart}
                            onDragStart={onWorkspacePieceDragStart ? (e) => { e.stopPropagation(); onWorkspacePieceDragStart(e, piece.id)} : undefined}
                            onDragEnd={onWorkspacePieceDragEnd ? (e) => { e.stopPropagation(); onWorkspacePieceDragEnd()} : undefined}
                        />
                    </div>
                );
            })}
        </div>
    );
};


export const CalculationWorkspace: React.FC<CalculationWorkspaceProps> = ({ pieces, equation, onDrop, onDragOver, isDropZoneActive, spotlightOn, onBarClick, onWorkspacePieceDragStart, onWorkspacePieceDragEnd }) => {
    const isExploreMode = !!equation;

    let equationForRender: EquationState;

    if (isExploreMode) {
        equationForRender = equation;
    } else { // Training Mode
        const term: EquationTerm = { fraction: null, pieces: pieces || [] };
        equationForRender = {
            terms: [term],
            operators: [],
            result: null,
            resultPieces: [],
            isSolved: false,
            isWorkoutActive: false,
            workoutStep: 'idle'
        };
    }

    const hasContent = equationForRender.terms.some(t => t.pieces.length > 0);
    const isMerging = equationForRender.terms.some(t => t.pieces.some(p => p.state === 'merging'));

    const containerClasses = `w-full min-h-[20rem] p-6 rounded-2xl chalk-border flex flex-col justify-start relative transition-all duration-300 gap-2 ${isDropZoneActive ? 'bg-slate-700/50' : ''}`;
    const alignmentClass = 'items-start';

    return (
        <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className={`${containerClasses} ${alignmentClass}`}
        >
            {spotlightOn === 'whole_bar' && <div className="w-full h-12 rounded-lg bg-amber-600 opacity-90 animate-pop-in my-2 animate-guide-pulse"><div className="relative flex items-center justify-center h-full"><span className="text-white font-chalk text-2xl" style={{ textShadow: '2px 2px 3px rgba(0,0,0,0.5)' }}>1 WHOLE</span></div></div>}

            {!hasContent && !isDropZoneActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-xl text-chalk-light">Drag pieces into this workspace.</p>
                </div>
            )}
            
            <div className={`w-full ${isMerging ? 'animate-merge-converge' : ''}`}>
                {equationForRender.isSolved ? (
                    <div className="w-full flex flex-col items-start animate-bouncy-pop-in">
                        <div className="border-t-4 border-chalk-yellow w-full my-4"></div>
                        {equationForRender.resultPieces.map((piece, index) => {
                             const value = piece.fraction.numerator / piece.fraction.denominator;
                             const width = value > 1.2 ? '100%' : `${value * 100}%`;
                             return (
                                <div key={piece.id || index} className="w-full" style={{ width }}>
                                    <FractionPiece fraction={piece.fraction} />
                                </div>
                             )
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col w-full items-start gap-4">
                        {equationForRender.terms.map((term, index) => (
                            <React.Fragment key={`term-${index}`}>
                                {(() => {
                                    const piecesByDenominator = term.pieces.reduce((acc, piece) => {
                                        const den = piece.fraction.denominator;
                                        if (!acc[den]) acc[den] = [];
                                        acc[den].push(piece);
                                        return acc;
                                    }, {} as Record<number, WorkspacePiece[]>);
                                    
                                    const isCombining = term.pieces.some(p => p.state === 'combining');

                                    return Object.values(piecesByDenominator).map((pieceGroup, i) => (
                                        <div key={i} className="w-full merge-container">
                                            {renderPieceGroup(pieceGroup, isCombining, onBarClick, onWorkspacePieceDragStart, onWorkspacePieceDragEnd)}
                                        </div>
                                    ));
                                })()}
                                {isExploreMode && equationForRender.operators[index] && term.fraction && (
                                    <div className="self-center py-2">
                                        <span className="text-5xl font-chalk text-chalk-yellow animate-pop-in">
                                            {equationForRender.operators[index] === ', or' ? <span className="text-2xl">or</span> : equationForRender.operators[index]}
                                        </span>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};