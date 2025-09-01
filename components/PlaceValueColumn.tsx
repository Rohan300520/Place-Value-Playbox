import React from 'react';
import type { Block, PlaceValueCategory } from '../types';
import { NumberBlock } from './NumberBlock';

interface PlaceValueColumnProps {
  title: string;
  category: PlaceValueCategory;
  blocks: Block[];
  onDrop: (category: PlaceValueCategory) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>, category: PlaceValueCategory) => void;
  isRegroupingDestination: boolean;
  isDropAllowed: boolean;
  isDragging: boolean;
  color: 'blue' | 'green' | 'yellow';
  isSpotlighted?: boolean;
}

const colorClasses = {
  blue: { bg: 'bg-sky-200', border: 'border-sky-400', text: 'text-sky-800', shadow: 'shadow-sky-300/50' },
  green: { bg: 'bg-emerald-200', border: 'border-emerald-400', text: 'text-emerald-800', shadow: 'shadow-emerald-300/50' },
  yellow: { bg: 'bg-amber-200', border: 'border-amber-400', text: 'text-amber-800', shadow: 'shadow-amber-300/50' },
};

export const PlaceValueColumn: React.FC<PlaceValueColumnProps> = ({ 
  title, category, blocks, onDrop, onDragOver, isRegroupingDestination, 
  isDropAllowed, isDragging, color, isSpotlighted
}) => {
  const styles = colorClasses[color];

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDrop(category);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    onDragOver(e, category);
  };

  let borderStyle = isDragging
    ? isDropAllowed
      ? 'border-green-500 ring-4 ring-green-300'
      : 'border-red-500 ring-4 ring-red-300'
    : styles.border;
  
  if (isSpotlighted && !isDragging) {
    borderStyle = 'border-blue-500 ring-4 ring-blue-300';
  }

  return (
    <div className={`flex flex-col ${styles.bg} rounded-2xl shadow-lg ${styles.shadow} transition-all duration-300 ${isSpotlighted ? 'relative z-20' : ''}`}>
      <h2 className={`text-2xl sm:text-3xl font-black text-center p-4 ${styles.text} border-b-4 ${styles.border}`}>
        {title}
      </h2>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`flex-grow min-h-[300px] p-4 transition-all duration-300 rounded-b-2xl border-4 border-dashed border-transparent ${borderStyle} ${isRegroupingDestination ? 'animate-pulse' : ''} ${isSpotlighted && !isDragging ? 'animate-guide-pulse' : ''}`}
      >
        <div className="flex flex-wrap-reverse items-end justify-center gap-1 h-full content-start">
          {blocks.map(block => (
            <NumberBlock 
              key={block.id} 
              value={block.value} 
              isDraggable={false}
              isAnimating={block.isAnimating}
            />
          ))}
        </div>
      </div>
    </div>
  );
};