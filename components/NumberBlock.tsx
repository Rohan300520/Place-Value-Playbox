
import React from 'react';
import type { BlockValue } from '../types';

interface NumberBlockProps {
  value: BlockValue;
  isDraggable: boolean;
  onDragStart?: (value: BlockValue) => void;
  onTouchStart?: (value: BlockValue, event: React.TouchEvent) => void;
  isAnimating?: boolean;
  isNewlyRegrouped?: boolean;
}

export const NumberBlock: React.FC<NumberBlockProps> = ({ value, isDraggable, onDragStart, onTouchStart, isAnimating, isNewlyRegrouped }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (onDragStart) {
      onDragStart(value);
      e.dataTransfer.effectAllowed = "copy";
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (onTouchStart) {
      onTouchStart(value, e);
    }
  };

  let blockStyle = '';
  let blockContent = null;
  let shadowColor = 'rgba(255, 255, 255, 0.7)';
  
  switch (value) {
    case 1:
      blockStyle = 'w-4 h-4 sm:w-6 sm:h-6 bg-sky-400 hover:bg-sky-300 border-2 border-sky-200 shadow-md';
      shadowColor = 'rgba(56, 189, 248, 0.8)';
      break;
    case 10:
      blockStyle = 'w-4 h-16 sm:w-6 sm:h-24 bg-emerald-400 hover:bg-emerald-300 border-2 border-emerald-200 shadow-lg flex flex-col justify-around items-center py-1';
      blockContent = Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="w-2 h-0.5 sm:w-4 sm:h-1 bg-emerald-800/50 rounded-full"></div>
      ));
      shadowColor = 'rgba(45, 212, 191, 0.8)';
      break;
    case 100:
      blockStyle = 'w-16 h-16 sm:w-24 sm:h-24 bg-amber-400 hover:bg-amber-300 border-2 border-amber-200 shadow-xl grid grid-cols-10 gap-px p-0.5 sm:p-1';
      blockContent = Array.from({ length: 100 }).map((_, i) => (
         <div key={i} className="w-full h-full bg-amber-800/50 rounded-sm"></div>
      ));
      shadowColor = 'rgba(251, 191, 36, 0.8)';
      break;
  }

  const blockElement = (
    <div
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      onTouchStart={isDraggable ? handleTouchStart : undefined}
      className={`${blockStyle} rounded-md transition-transform transform hover:scale-110 ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} ${isAnimating ? 'animate-regroup-swirl-out' : 'animate-bouncy-pop-in'}`}
      style={{ 
        animationDelay: `${Math.random() * 0.1}s`,
        filter: `drop-shadow(0 0 4px ${shadowColor})`
      }}
    >
      {blockContent}
    </div>
  );

  return isNewlyRegrouped ? <div className="relative sparkle-effect">{blockElement}</div> : blockElement;
};