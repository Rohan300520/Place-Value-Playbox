import React from 'react';
import type { Fraction } from '../../../types';
import { FractionPiece } from './FractionBlock';
import { fractionsAreEqual } from '../utils/fractions';

interface MultipleChoiceOptionsProps {
    options: Fraction[];
    selectedOption: Fraction | null;
    onSelect: (fraction: Fraction) => void;
}

export const MultipleChoiceOptions: React.FC<MultipleChoiceOptionsProps> = ({ options, selectedOption, onSelect }) => {
    return (
        <div className="w-full flex flex-col items-center gap-4 p-4 chalk-bg-light rounded-lg">
             <p className="font-chalk text-2xl text-chalk-cyan">Select the correct answer</p>
            <div className="flex flex-wrap justify-center gap-4">
                {options.map((option, index) => {
                    const isSelected = fractionsAreEqual(option, selectedOption);
                    return (
                        <button
                            key={index}
                            onClick={() => onSelect(option)}
                            className={`p-2 rounded-lg transition-all duration-200 ${isSelected ? 'bg-yellow-400/30 ring-2 ring-yellow-400' : 'hover:bg-white/10'}`}
                        >
                            <div className="w-32">
                                <FractionPiece fraction={option} />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};