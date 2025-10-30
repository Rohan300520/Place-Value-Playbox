import React, { useState, useEffect } from 'react';
import type { Fraction } from '../../../types';
import { FractionPiece } from './FractionBlock';
import { fractionsAreEqual } from '../utils/fractions';

interface OrderWorkspaceProps {
    fractions: Fraction[];
    onOrderChange: (orderedFractions: Fraction[]) => void;
    orderDirection: 'ascending' | 'descending';
}

const DropTarget: React.FC<{ fraction: Fraction | null, onDrop: () => void, onDragOver: (e: React.DragEvent) => void, onDragLeave: () => void, isOver: boolean }> = ({ fraction, onDrop, onDragOver, onDragLeave, isOver }) => (
    <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`w-32 h-20 border-4 border-dashed rounded-lg flex items-center justify-center transition-colors duration-200 ${isOver ? 'border-yellow-400 bg-yellow-400/20' : 'border-chalk-border'}`}
    >
        {fraction && (
            <div className="p-1 w-24">
                <FractionPiece fraction={fraction} />
            </div>
        )}
    </div>
);

export const OrderWorkspace: React.FC<OrderWorkspaceProps> = ({ fractions, onOrderChange, orderDirection }) => {
    const [sourceFractions, setSourceFractions] = useState<Fraction[]>([]);
    const [targetFractions, setTargetFractions] = useState<(Fraction | null)[]>([]);
    const [draggedFraction, setDraggedFraction] = useState<Fraction | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    useEffect(() => {
        setSourceFractions([...fractions].sort(() => Math.random() - 0.5));
        setTargetFractions(Array(fractions.length).fill(null));
    }, [fractions]);

    const handleDragStart = (fraction: Fraction) => {
        setDraggedFraction(fraction);
    };

    const handleDrop = (targetIndex: number) => {
        if (!draggedFraction) return;
        if (targetFractions[targetIndex]) return;

        const newTargets = [...targetFractions];
        newTargets[targetIndex] = draggedFraction;
        setTargetFractions(newTargets);
        onOrderChange(newTargets.filter(f => f !== null) as Fraction[]);

        setSourceFractions(source => source.filter(f => !fractionsAreEqual(f, draggedFraction)));
        setDraggedFraction(null);
        setDragOverIndex(null);
    };
    
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleReset = () => {
        setSourceFractions([...fractions].sort(() => Math.random() - 0.5));
        setTargetFractions(Array(fractions.length).fill(null));
        onOrderChange([]);
    };

    return (
        <div className="w-full flex flex-col items-center gap-8 p-6 chalk-bg-light rounded-lg">
            {/* Source Area */}
            <div className="p-4 rounded-lg min-h-[6rem] w-full flex flex-wrap justify-center items-center gap-4 border-2 border-dashed border-chalk-border">
                {sourceFractions.length > 0 ? (
                    sourceFractions.map((f, i) => (
                         <div
                            key={i}
                            draggable
                            onDragStart={() => handleDragStart(f)}
                            className="cursor-grab active:cursor-grabbing p-1 w-24"
                        >
                            <FractionPiece fraction={f} isDraggable={true} />
                        </div>
                    ))
                ) : (
                    <p className="text-chalk-light font-semibold">All fractions placed!</p>
                )}
            </div>

            {/* Target Area */}
            <div className="flex items-center gap-4">
                <p className="font-chalk text-2xl text-chalk-yellow">{orderDirection === 'ascending' ? 'Smallest' : 'Largest'}</p>
                <svg className="w-12 h-12 text-chalk-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                 <p className="font-chalk text-2xl text-chalk-light">{orderDirection === 'ascending' ? 'Largest' : 'Smallest'}</p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4">
                {targetFractions.map((f, i) => (
                    <DropTarget
                        key={i}
                        fraction={f}
                        onDrop={() => handleDrop(i)}
                        onDragOver={(e) => handleDragOver(e, i)}
                        onDragLeave={() => setDragOverIndex(null)}
                        isOver={dragOverIndex === i}
                    />
                ))}
            </div>

            <button onClick={handleReset} className="control-button bg-red-600 border-red-800 hover:bg-red-500">
                Reset Order
            </button>
        </div>
    );
};