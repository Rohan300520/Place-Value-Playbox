import React from 'react';
// Fix: Corrected import path for types
import type { BlockValue, PlaceValueCategory } from '../types';

interface NumberBlockProps {
  value: BlockValue;
  isDraggable: boolean;
  onDragStart?: (value: BlockValue, origin?: { category: PlaceValueCategory, id: string }) => void;
  onTouchStart?: (value: BlockValue, event: React.TouchEvent) => void;
  onClick?: () => void;
  isAnimating?: boolean;
  isNewlyRegrouped?: boolean;
  
  // For dragging from a column
  id?: string;
  category?: PlaceValueCategory;
}

const blockColorStyles = {
    1: { background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', border: '#7dd3fc', shadow: 'rgba(14, 165, 233, 0.8)'},
    10: { background: 'linear-gradient(135deg, #34d399, #10b981)', border: '#6ee7b7', shadow: 'rgba(16, 185, 129, 0.8)'},
    100: { background: 'linear-gradient(135deg, #facc15, #f59e0b)', border: '#fde047', shadow: 'rgba(245, 158, 11, 0.8)'},
    1000: { background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', border: '#c4b5fd', shadow: 'rgba(147, 51, 234, 0.8)'},
}

export const NumberBlock: React.FC<NumberBlockProps> = ({ 
  value, isDraggable, onDragStart, onTouchStart, isAnimating, isNewlyRegrouped,
  id, category, onClick
}) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (onDragStart) {
      // If id and category are present, it's being dragged from a column.
      const origin = (id && category) ? { category, id } : undefined;
      onDragStart(value, origin);
      e.dataTransfer.effectAllowed = "copyMove";
      e.dataTransfer.setData('text/plain', value.toString());
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Only allow touch from source blocks for simplicity
    if (onTouchStart && isDraggable && !category) { 
      onTouchStart(value, e);
    }
  };

  let blockBaseStyle = '';
  let blockContent = null;
  
  const { background, border, shadow } = blockColorStyles[value];
  
  switch (value) {
    case 1:
      blockBaseStyle = 'w-4 h-4 sm:w-6 sm:h-6 shadow-md';
      break;
    case 10:
      blockBaseStyle = 'w-4 h-16 sm:w-6 sm:h-24 shadow-lg flex flex-col justify-around items-center py-1';
      blockContent = Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="w-2 h-0.5 sm:w-4 sm:h-1 bg-black/20 rounded-full"></div>
      ));
      break;
    case 100:
      blockBaseStyle = 'w-16 h-16 sm:w-24 sm:h-24 shadow-xl grid grid-cols-10 gap-px p-0.5 sm:p-1';
      blockContent = Array.from({ length: 100 }).map((_, i) => (
         <div key={i} className="w-full h-full bg-black/20 rounded-sm"></div>
      ));
      break;
    case 1000:
        blockBaseStyle = 'w-16 h-16 sm:w-24 sm:h-24 shadow-2xl p-1 sm:p-2';
        blockContent = (
            <div className="relative w-full h-full">
                <div className="absolute w-full h-full bg-black/30"></div>
                <div className="absolute w-full h-full bg-black/30" style={{ transform: 'translateZ(-20px) rotateY(90deg)', transformOrigin: 'right center' }}></div>
                <div className="absolute w-full h-full bg-black/30" style={{ transform: 'translateZ(-20px) rotateX(-90deg)', transformOrigin: 'top center' }}></div>
            </div>
        );
        break;
  }
  
  const animationClass = isAnimating === true
    ? 'animate-regroup-swirl-out'
    : isAnimating === false
    ? 'animate-poof-out'
    : 'animate-bouncy-pop-in';


  const blockElement = (
    <div
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      onTouchStart={isDraggable ? handleTouchStart : undefined}
      onClick={onClick}
      data-value={value}
      data-id={id}
      data-category={category}
      className={`${blockBaseStyle} rounded-md transition-transform transform ${isDraggable ? 'hover:scale-110 cursor-pointer active:cursor-grabbing' : 'cursor-default'} ${animationClass}`}
      style={{ 
        background,
        border: `2px solid ${border}`,
        animationDelay: `${Math.random() * 0.1}s`,
        filter: `drop-shadow(0 0 5px ${shadow})`
      }}
    >
      {blockContent}
    </div>
  );

  return isNewlyRegrouped ? <div className="relative sparkle-effect">{blockElement}</div> : blockElement;
};
