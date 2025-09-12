import React, { useState, useEffect, useRef } from 'react';
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
  color: 'blue' | 'green' | 'yellow' | 'purple';
  isSpotlighted?: boolean;
  isTouchTarget?: boolean;
  appState: string;
}

const colorClasses = {
  blue: { bg: 'bg-sky-900/50', border: 'border-sky-400', text: 'text-sky-200', glow: 'shadow-sky-400/20', ring: 'ring-sky-300' },
  green: { bg: 'bg-teal-900/50', border: 'border-teal-400', text: 'text-teal-200', glow: 'shadow-teal-400/20', ring: 'ring-teal-300' },
  yellow: { bg: 'bg-amber-900/50', border: 'border-amber-400', text: 'text-amber-200', glow: 'shadow-amber-400/20', ring: 'ring-amber-300' },
  purple: { bg: 'bg-purple-900/50', border: 'border-purple-400', text: 'text-purple-200', glow: 'shadow-purple-400/20', ring: 'ring-purple-300' },
};

export const PlaceValueColumn: React.FC<PlaceValueColumnProps> = ({ 
  title, category, blocks, onDrop, onDragOver, isRegroupingDestination, 
  isDropAllowed, isDragging, color, isSpotlighted, isTouchTarget, appState
}) => {
  const styles = colorClasses[color];
  const [isPulsing, setIsPulsing] = useState(false);
  const prevBlockCount = useRef(blocks.length);

  useEffect(() => {
    if (blocks.length > prevBlockCount.current) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 500); // Duration of pulse animation
      return () => clearTimeout(timer);
    }
    prevBlockCount.current = blocks.length;
  }, [blocks.length]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents the event from bubbling up to the main container
    onDrop(category);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevents the event from bubbling up to the main container.
    onDragOver(e, category);
  };

  let borderStyle = styles.border;
  const isBeingDraggedOver = isDragging || isTouchTarget;
  
  if (isBeingDraggedOver) {
    if (isDropAllowed) {
      borderStyle = isSpotlighted ? `border-blue-400 ring-4 ${styles.ring}` : `border-green-400 ring-4 ring-green-300`;
    } else {
      borderStyle = 'border-red-500 ring-4 ring-red-300';
    }
  } else if (isSpotlighted) {
    borderStyle = `border-blue-400 ring-4 ${styles.ring}`;
  }


  return (
    <div className={`flex flex-col rounded-2xl shadow-lg ${styles.glow} transition-all duration-300 ${isSpotlighted ? 'relative z-20' : ''} ${styles.bg}`}>
      <h2 className={`text-xl sm:text-2xl font-black text-center p-2 sm:p-4 border-b-4 ${styles.text} ${styles.border}`}>
        {title}
      </h2>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        data-droptarget={category}
        className={`flex-grow min-h-[180px] sm:min-h-[300px] p-1 sm:p-2 md:p-4 transition-all duration-300 rounded-b-2xl border-4 border-dashed bg-black/20 border-transparent ${borderStyle} ${isRegroupingDestination ? 'animate-pulse' : ''} ${isSpotlighted && !isBeingDraggedOver ? 'animate-guide-pulse' : ''} ${isPulsing ? 'animate-column-pulse' : ''}`}
      >
        <div className="flex flex-wrap-reverse items-end justify-center gap-1 h-full content-start">
          {blocks.map(block => (
            <NumberBlock 
              key={block.id} 
              id={block.id}
              category={category}
              value={block.value} 
              isDraggable={false}
              isDraggableFromColumn={appState === 'playground'}
              // onDragStart is handled by App.tsx through context or prop drilling if needed
              isAnimating={block.isAnimating}
              isNewlyRegrouped={block.isNewlyRegrouped}
            />
          ))}
        </div>
      </div>
    </div>
  );
};