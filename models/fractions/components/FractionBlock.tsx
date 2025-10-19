import React from 'react';
import type { Fraction } from '../../../types';

interface FractionBlockProps {
  fraction: Fraction;
  onClick?: () => void;
  isResult?: boolean;
  subdivisionTarget?: Fraction;
}

// Color palette for the wooden blocks based on denominator
const BLOCK_COLORS = [
    '#c27c3e', // 1
    '#d68f53', // 2
    '#e3a068', // 3
    '#f2b17c', // 4
    '#e69a8d', // 6
    '#d9879a', // 8
    '#c27b9f', // 12
    '#a870a3', // 16
];
const DENOMINATORS = [1, 2, 3, 4, 6, 8, 12, 16];

export const FractionBlock: React.FC<FractionBlockProps> = ({ fraction, onClick, isResult = false, subdivisionTarget }) => {
    if (!fraction) return null;
    const { numerator, denominator } = fraction;

    if (denominator === 0) return null;

    const colorIndex = DENOMINATORS.indexOf(denominator);
    const color = colorIndex !== -1 ? BLOCK_COLORS[colorIndex] : '#a1a1aa'; // Default color

    // Calculate width based on the fraction's value
    const value = numerator / denominator;
    const width = isResult ? `auto` : `${Math.min(value * 100, 100)}%`;
    const minWidth = isResult ? '10rem' : 'auto';
    
    const needsSubdivision = subdivisionTarget && subdivisionTarget.denominator !== fraction.denominator;
    const conversionFactor = needsSubdivision ? subdivisionTarget.denominator / fraction.denominator : 1;
    
    const subdivideStyle = needsSubdivision ? {
        '--subdivide-size': `${100 / conversionFactor}%`,
    } as React.CSSProperties : {};
    
    const backgroundStyle = {
      background: `
        repeating-linear-gradient(
            to right,
            transparent,
            transparent calc(var(--subdivide-size, 100%) - 2px),
            rgba(0,0,0,0.3) calc(var(--subdivide-size, 100%) - 2px),
            rgba(0,0,0,0.3) var(--subdivide-size, 100%)
        ),
        linear-gradient(135deg, ${color}cc, ${color}ff)
      `,
      backgroundSize: `100% 100%, 100% 100%`,
      boxShadow: `inset 0 -6px 0 ${color}aa, 2px 2px 5px rgba(0,0,0,0.2)`,
    };
    
    const text = denominator === 1 && numerator === 1 ? 'WHOLE' : `${numerator}/${denominator}`;

    return (
        <div
            onClick={onClick}
            className={`relative flex items-center justify-center h-12 rounded-lg text-white font-chalk text-2xl transition-transform duration-200 ${onClick ? 'cursor-pointer hover:scale-105' : ''} ${needsSubdivision ? 'animate-subdivide' : ''}`}
            style={{ ...backgroundStyle, width, minWidth, ...subdivideStyle }}
        >
            {/* Static subdivisions for visualization */}
            {Array.from({ length: denominator }).map((_, i) => (
                <div key={i} className="flex-1 h-full border-r-2 border-white/20 last:border-r-0"></div>
            ))}
            <span className="absolute inset-0 flex items-center justify-center" style={{ textShadow: '2px 2px 3px rgba(0,0,0,0.5)' }}>
                {text}
            </span>
        </div>
    );
};