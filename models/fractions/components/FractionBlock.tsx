import React from 'react';
import type { Fraction } from '../../../types';

interface FractionPieceProps {
  fraction: Fraction;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, fraction: Fraction) => void;
  isDraggable?: boolean;
}

const BLOCK_COLORS = [
    '#D97706', // 1 (amber-600)
    '#EF4444', // 2 (red-500)
    '#EC4899', // 3 (pink-500)
    '#F59E0B', // 4 (amber-500)
    '#8B5CF6', // 6 (violet-500)
    '#10B981', // 8 (emerald-500)
    '#3B82F6', // 12 (blue-500)
    '#6366F1', // 16 (indigo-500)
];
const DENOMINATORS = [1, 2, 3, 4, 6, 8, 12, 16];

export const FractionPiece: React.FC<FractionPieceProps> = ({ fraction, onClick, onDragStart, isDraggable = false }) => {
    if (!fraction || fraction.denominator === 0) return null;
    const { numerator, denominator } = fraction;

    const colorIndex = DENOMINATORS.indexOf(denominator);
    const color = colorIndex !== -1 ? BLOCK_COLORS[colorIndex] : '#a1a1aa';

    const backgroundStyle = {
        background: `linear-gradient(135deg, ${color}cc, ${color}ff)`,
        boxShadow: `inset 0 -6px 0 ${color}aa, 2px 2px 5px rgba(0,0,0,0.2)`,
    };
    
    const text = denominator === 1 ? '1' : `${numerator}/${denominator}`;

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        if (onDragStart) {
            onDragStart(e, fraction);
        }
    }

    return (
        <div
            draggable={isDraggable}
            onDragStart={handleDragStart}
            onClick={onClick}
            className={`relative flex items-center justify-center h-12 rounded-lg text-white font-chalk text-2xl transition-transform duration-200 border-2 border-black/20 ${isDraggable ? 'cursor-grab active:cursor-grabbing hover:scale-105 hover:shadow-xl' : 'cursor-not-allowed'}`}
            style={backgroundStyle}
        >
            <span className="absolute inset-0 flex items-center justify-center" style={{ textShadow: '2px 2px 3px rgba(0,0,0,0.5)' }}>
                {text}
            </span>
        </div>
    );
};