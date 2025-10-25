import React from 'react';
import type { WorkspacePiece, Fraction } from '../../../types';
import { FractionPiece } from './FractionBlock';

interface WorkspaceProps {
    pieces: WorkspacePiece[];
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    isDropZoneActive: boolean;
    spotlightOn?: string | null;
    onBarClick?: (fraction: Fraction) => void;
}

const WholeBar: React.FC<{ isSpotlighted?: boolean }> = ({ isSpotlighted }) => (
    <div className={`w-full h-12 rounded-lg bg-amber-600 opacity-90 animate-pop-in my-2 ${isSpotlighted ? 'animate-guide-pulse' : ''}`}>
        <div className="relative flex items-center justify-center h-full">
            <span className="text-white font-chalk text-2xl" style={{ textShadow: '2px 2px 3px rgba(0,0,0,0.5)' }}>1 WHOLE</span>
        </div>
    </div>
)

export const Workspace: React.FC<WorkspaceProps> = ({ pieces, onDrop, onDragOver, isDropZoneActive, spotlightOn, onBarClick }) => {
    // Group consecutive pieces of the same denominator to form horizontal bars.
    const groupedPieces: WorkspacePiece[][] = [];
    if (pieces.length > 0) {
        let currentGroup: WorkspacePiece[] = [];
        for (let i = 0; i < pieces.length; i++) {
            const piece = pieces[i];
            const prevPiece = pieces[i - 1];

            // Start a new group if the piece is animating, has a different denominator, or the previous group is empty
            if (piece.state !== 'idle' || currentGroup.length === 0 || piece.fraction.denominator !== prevPiece.fraction.denominator || prevPiece.state !== 'idle') {
                if (currentGroup.length > 0) {
                    groupedPieces.push(currentGroup);
                }
                currentGroup = [piece];
            } else {
                currentGroup.push(piece);
            }
        }
        if (currentGroup.length > 0) {
            groupedPieces.push(currentGroup);
        }
    }

    return (
        <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className={`w-full min-h-[20rem] p-6 rounded-2xl chalk-border flex flex-col justify-start items-start relative transition-all duration-300 gap-2 ${isDropZoneActive ? 'bg-slate-700/50' : ''}`}
        >
            {spotlightOn === 'whole_bar' && <WholeBar isSpotlighted={true} />}

            {pieces.length === 0 && !isDropZoneActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-xl text-chalk-light">Drag pieces from the chart into this workspace.</p>
                </div>
            )}

            {groupedPieces.map((group, groupIndex) => {
                 // If a piece is animating, render it as its own bar for proper animation display
                if (group.length === 1 && group[0].state !== 'idle') {
                    const piece = group[0];
                    const animationClass = 
                        piece.state === 'splitting' ? 'animate-bouncy-pop-in' :
                        piece.state === 'removing' ? 'animate-slide-out-left' :
                        piece.state === 'merging' ? 'animate-piece-merge' : '';

                    return (
                         <div 
                            key={piece.id} 
                            className={`flex flex-row gap-px ${animationClass}`}
                            style={{ width: `${(piece.fraction.numerator / piece.fraction.denominator) * 100}%` }}
                        >
                            <div className="flex-1">
                                <FractionPiece fraction={piece.fraction} />
                            </div>
                        </div>
                    );
                }
                
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
                        key={groupIndex} 
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
            })}
        </div>
    );
};