import React, { useState, useEffect } from 'react';
import type { Fraction } from '../../../types';

interface PizzaVisualProps {
    totalSlices: number;
    onSelectionChange: (fraction: Fraction) => void;
}

const PizzaSlice: React.FC<{
    index: number,
    totalSlices: number,
    isSelected: boolean,
    onSelect: () => void
}> = ({ index, totalSlices, isSelected, onSelect }) => {
    const angle = (2 * Math.PI) / totalSlices;
    const startAngle = index * angle;
    const endAngle = (index + 1) * angle;
    const radius = 100;
    const innerRadius = 15;

    const getCoords = (a: number, r: number) => ({
        x: 100 + r * Math.cos(a - Math.PI / 2),
        y: 100 + r * Math.sin(a - Math.PI / 2)
    });

    const p1 = getCoords(startAngle, innerRadius);
    const p2 = getCoords(startAngle, radius);
    const p3 = getCoords(endAngle, radius);
    const p4 = getCoords(endAngle, innerRadius);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const pathData = [
        `M ${p1.x} ${p1.y}`, // Move to inner start
        `L ${p2.x} ${p2.y}`, // Line to outer start
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${p3.x} ${p3.y}`, // Arc to outer end
        `L ${p4.x} ${p4.y}`, // Line to inner end
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${p1.x} ${p1.y}`, // Arc back to inner start
    ].join(' ');

    return (
        <path
            d={pathData}
            fill={isSelected ? '#fde047' : '#e5e7eb'}
            stroke="#4a5061"
            strokeWidth="2"
            onClick={onSelect}
            className="cursor-pointer transition-all duration-200 hover:opacity-80"
        />
    );
}

export const PizzaVisual: React.FC<PizzaVisualProps> = ({ totalSlices, onSelectionChange }) => {
    const [selected, setSelected] = useState<boolean[]>(Array(totalSlices).fill(false));

    const toggleSlice = (index: number) => {
        const newSelected = [...selected];
        newSelected[index] = !newSelected[index];
        setSelected(newSelected);
    };

    useEffect(() => {
        const selectedCount = selected.filter(Boolean).length;
        onSelectionChange({ numerator: selectedCount, denominator: totalSlices });
    }, [selected, totalSlices, onSelectionChange]);

    const selectedCount = selected.filter(Boolean).length;

    return (
        <div className="w-full flex flex-col items-center gap-4 p-4 chalk-bg-light rounded-lg">
            <svg viewBox="0 0 200 200" className="w-64 h-64">
                {/* Pizza Crust */}
                <circle cx="100" cy="100" r="100" fill="#D2B48C" />
                <circle cx="100" cy="100" r="95" fill="#f87171" />

                {Array.from({ length: totalSlices }).map((_, i) => (
                    <PizzaSlice
                        key={i}
                        index={i}
                        totalSlices={totalSlices}
                        isSelected={selected[i]}
                        onSelect={() => toggleSlice(i)}
                    />
                ))}
            </svg>
             <p className="font-chalk text-2xl text-chalk-cyan">
                Selected: {selectedCount} / {totalSlices}
            </p>
        </div>
    );
};