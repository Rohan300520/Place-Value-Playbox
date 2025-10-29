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
    onWorkspacePieceDragStart?: (e: React.DragEvent<HTMLDivElement>, pieceId: string) => void;
    onWorkspacePieceDragEnd?: () => void;
}

const renderPieceGroup = (
    group: WorkspacePiece[], 
    onBarClick?: (fraction: Fraction) => void,
    onWorkspacePieceDragStart?: (e: React.DragEvent<HTMLDivElement>, pieceId: string) => void,
    onWorkspacePieceDragEnd?: () => void
) => {
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
};


export const CalculationWorkspace: React.FC<CalculationWorkspaceProps> = ({ pieces, equation, onDrop, onDragOver, isDropZoneActive, spotlightOn, onBarClick, onWorkspacePieceDragStart, onWorkspacePieceDragEnd }) => {
    const isExploreMode = !!equation;

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
    const alignmentClass = 'items-start'; // Always align items to the start for consistent bar layout

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
            
            <div className="w-full">
                {equationForRender.isSolved ? (
                    <div className="w-full flex flex-col items-start animate-pop-in">
                        <div className="border-t-4 border-chalk-yellow w-full my-4"></div>
                        {equationForRender.resultPieces.map((piece, index) => {
                             const value = getFractionalValue(piece.fraction);
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
                                    
                                    return Object.values(piecesByDenominator).map((pieceGroup, i) => (
                                        <div key={i} className="w-full">
                                            {renderPieceGroup(pieceGroup, onBarClick, onWorkspacePieceDragStart, onWorkspacePieceDragEnd)}
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