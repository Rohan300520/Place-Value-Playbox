import React from 'react';
import type { Fraction } from '../../../types';

interface FractionPieceProps {
  fraction: Fraction;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  isDraggable?: boolean;
}

const BLOCK_COLORS = [
    '#D35400', // 1 (Orange)
    '#27AE60', // 2 (Green)
    '#483D8B', // 3 (Dark Slate Blue)
    '#2980B9', // 4 (Light Blue)
    '#16A085', // 5 (Teal)
    '#A52A2A', // 6 (Brown)
    '#8E44AD', // 7 (Purple)
    '#C71585', // 8 (Medium Violet Red)
    '#34495E', // 9 (Dark Grey)
    '#BDC3C7', // 10 (Silver)
    '#C0392B', // 12 (Red)
    '#F1C40F', // 16 (Yellow)
];
const DENOMINATORS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 16];

const getTextStyle = (backgroundColor: string): { className: string; style: React.CSSProperties } => {
    const upperBg = backgroundColor.toUpperCase();
    // Yellow and Silver are too bright for white text, so switch to dark text.
    if (upperBg === '#F1C40F' || upperBg === '#BDC3C7') {
        return {
            className: 'text-slate-900', // Dark text
            style: { textShadow: '1px 1px 2px rgba(255,255,255,0.4)' } // Light shadow for contrast
        };
    }
    return {
        className: 'text-white',
        style: { textShadow: '2px 2px 3px rgba(0,0,0,0.5)' }
    };
};

export const FractionPiece: React.FC<FractionPieceProps> = ({ fraction, onDragStart, onDragEnd, isDraggable = false }) => {
    if (!fraction || fraction.denominator === 0) return null;
    const { numerator, denominator } = fraction;

    const colorIndex = DENOMINATORS.indexOf(denominator);
    const color = colorIndex !== -1 ? BLOCK_COLORS[colorIndex] : '#a1a1aa';

    const backgroundStyle = {
        background: `linear-gradient(135deg, ${color}cc, ${color}ff)`,
        boxShadow: `inset 0 -6px 0 ${color}aa, 2px 2px 5px rgba(0,0,0,0.2)`,
    };
    
    const text = denominator === 1 ? 'WHOLE' : `${numerator}/${denominator}`;
    const textStyle = getTextStyle(color);

    let fontSizeClass = 'text-2xl';
    if (denominator >= 9 && denominator <= 12) {
        fontSizeClass = 'text-xl';
    } else if (denominator > 12) {
        fontSizeClass = 'text-base';
    }

    const interactiveClass = isDraggable
      ? 'cursor-grab active:cursor-grabbing hover:scale-105 hover:shadow-xl'
      : 'cursor-default';

    return (
        <div
            draggable={isDraggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={`relative flex items-center justify-center h-12 rounded-lg ${textStyle.className} font-chalk ${fontSizeClass} transition-all duration-200 border-2 border-black/20 ${interactiveClass}`}
            style={backgroundStyle}
        >
            <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap" style={textStyle.style}>
                {text}
            </span>
        </div>
    );
};
