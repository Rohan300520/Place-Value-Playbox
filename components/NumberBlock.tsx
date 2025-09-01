import React from 'react';
import type { BlockValue } from '../types';

interface NumberBlockProps {
  value: BlockValue;
  isDraggable: boolean;
  onDragStart?: (value: BlockValue) => void;
  isAnimating?: boolean;
}

export const NumberBlock: React.FC<NumberBlockProps> = ({ value, isDraggable, onDragStart, isAnimating }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (onDragStart) {
      onDragStart(value);
      e.dataTransfer.effectAllowed = "copy";
    }
  };

  let blockStyle = '';
  let blockContent = null;
  
  switch (value) {
    case 1:
      blockStyle = 'w-6 h-6 bg-sky-500 hover:bg-sky-400 border-2 border-sky-700 shadow-md';
      break;
    case 10:
      blockStyle = 'w-6 h-24 bg-emerald-500 hover:bg-emerald-400 border-2 border-emerald-700 shadow-lg flex flex-col justify-around items-center py-1';
      blockContent = Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="w-4 h-1 bg-emerald-700/50 rounded-full"></div>
      ));
      break;
    case 100:
      blockStyle = 'w-24 h-24 bg-amber-400 hover:bg-amber-300 border-2 border-amber-600 shadow-xl grid grid-cols-10 gap-px p-1';
      blockContent = Array.from({ length: 100 }).map((_, i) => (
         <div key={i} className="w-full h-full bg-amber-600/50 rounded-sm"></div>
      ));
      break;
  }

  return (
    <div
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      className={`${blockStyle} rounded-md transition-transform transform hover:scale-105 ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} ${isAnimating ? 'animate-regroup-out' : 'animate-pop-in'}`}
      style={{ animationDelay: `${Math.random() * 0.1}s` }}
    >
      {blockContent}
    </div>
  );
};