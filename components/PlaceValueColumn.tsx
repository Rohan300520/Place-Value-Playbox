
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
  isTouchTarget?: boolean;
}

const colorClasses = {
  blue: { bg: 'bg-sky-300', border: 'border-sky-500', text: 'text-sky-900', shadow: 'shadow-sky-400/50' },
  green: { bg: 'bg-teal-300', border: 'border-teal-500', text: 'text-teal-900', shadow: 'shadow-teal-400/50' },
  yellow: { bg: 'bg-amber-300', border: 'border-amber-500', text: 'text-amber-900', shadow: 'shadow-amber-400/50' },
};

export const PlaceValueColumn: React.FC<PlaceValueColumnProps> = ({ 
  title, category, blocks, onDrop, onDragOver, isRegroupingDestination, 
  isDropAllowed, isDragging, color, isSpotlighted, isTouchTarget
}) => {
  const styles = colorClasses[color];

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDrop(category);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    onDragOver(e, category);
  };

  let borderStyle = styles.border;
  const isBeingDraggedOver = isDragging || isTouchTarget;
  
  if (isBeingDraggedOver) {
    if (isDropAllowed) {
      borderStyle = isSpotlighted ? 'border-blue-500 ring-4 ring-blue-300' : 'border-green-500 ring-4 ring-green-300';
    } else {
      borderStyle = 'border-red-500 ring-4 ring-red-300';
    }
  } else if (isSpotlighted) {
    borderStyle = 'border-blue-500 ring-4 ring-blue-300';
  }


  return (
    <div className={`flex flex-col ${styles.bg} rounded-2xl shadow-lg ${styles.shadow} transition-all duration-300 ${isSpotlighted ? 'relative z-20' : ''}`}>
      <h2 className={`text-xl sm:text-3xl font-black text-center p-2 sm:p-4 ${styles.text} border-b-4 ${styles.border}`}>
        {title}
      </h2>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        data-droptarget={category}
        className={`flex-grow min-h-[180px] sm:min-h-[300px] p-2 sm:p-4 transition-all duration-300 rounded-b-2xl border-4 border-dashed border-transparent ${borderStyle} ${isRegroupingDestination ? 'animate-pulse' : ''} ${isSpotlighted && !isBeingDraggedOver ? 'animate-guide-pulse' : ''}`}
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
