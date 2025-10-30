import React from 'react';
import type { WorkspacePiece } from '../../../types';
import { FractionPiece } from './FractionBlock';

interface SplittingPieceProps {
    piece: WorkspacePiece;
}

export const SplittingPiece: React.FC<SplittingPieceProps> = ({ piece }) => {
    if (!piece.splitInto) return null;

    const multiplier = piece.splitInto.denominator / piece.fraction.denominator;
    const cutLines = Array.from({ length: multiplier - 1 });

    return (
        <div className="relative flex-1 animate-fade-out-slow">
            <FractionPiece fraction={piece.fraction} />
            <svg
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 24"
            >
                {cutLines.map((_, i) => (
                    <line
                        key={i}
                        x1={(100 / multiplier) * (i + 1)}
                        y1="0"
                        x2={(100 / multiplier) * (i + 1)}
                        y2="24"
                        stroke="white"
                        strokeWidth="1"
                        strokeDasharray="24"
                        style={{ animation: 'piece-cut-lines-anim 0.5s ease-out forwards' }}
                    />
                ))}
            </svg>
        </div>
    );
};