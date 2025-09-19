import React, { useState, useEffect, useRef } from 'react';
import type { Block, PlaceValueCategory, BlockValue } from '../types';
import { NumberBlock } from './NumberBlock';

interface PlaceValueColumnProps {
  title: string;
  category: PlaceValueCategory;
  blocks: Block[];
  onDrop: (category: PlaceValueCategory) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>, category: PlaceValueCategory) => void;
  onDragStart: (value: BlockValue, origin: { category: PlaceValueCategory, id: string }) => void;
  isRegroupingDestination: boolean;
  isDropAllowed: boolean;
  isDragging: boolean;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  isSpotlighted?: boolean;
  isTouchTarget?: boolean;
  appState: string;
}

const colorVars = {
  blue: { bg: 'var(--col-blue-bg)', border: 'var(--col-blue-border)', text: 'var(--col-blue-text)', ring: 'ring-sky-500' },
  green: { bg: 'var(--col-green-bg)', border: 'var(--col-green-border)', text: 'var(--col-green-text)', ring: 'ring-emerald-500' },
  yellow: { bg: 'var(--col-yellow-bg)', border: 'var(--col-yellow-border)', text: 'var(--col-yellow-text)', ring: 'ring-amber-500' },
  purple: { bg: 'var(--col-purple-bg)', border: 'var(--col-purple-border)', text: 'var(--col-purple-text)', ring: 'ring-purple-500' },
};

export const PlaceValueColumn: React.FC<PlaceValueColumnProps> = ({ 
  title, category, blocks, onDrop, onDragOver, onDragStart, isRegroupingDestination, 
  isDropAllowed, isDragging, color, isSpotlighted, isTouchTarget, appState
}) => {
  const styles = colorVars[color];
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
    e.stopPropagation(); 
    onDrop(category);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onDragOver(e, category);
  };

  let borderStyle = 'border-transparent';
  const isBeingDraggedOver = isDragging || isTouchTarget;
  
  if (isBeingDraggedOver) {
    if (isDropAllowed) {
      borderStyle = isSpotlighted ? `border-blue-500 ring-4 ${styles.ring}` : `border-green-600 ring-4 ring-green-500`;
    } else {
      borderStyle = 'border-red-600 ring-4 ring-red-500';
    }
  } else if (isSpotlighted) {
    borderStyle = `border-blue-500 ring-4 ${styles.ring}`;
  }


  return (
    <div className={`flex flex-col rounded-2xl shadow-xl transition-all duration-300 ${isSpotlighted ? 'relative z-20' : ''}`} style={{ backgroundColor: styles.bg }}>
      <h2 className={`font-display text-xl sm:text-2xl font-black text-center p-2 sm:p-4 border-b-4`} style={{ color: styles.text, borderColor: styles.border }}>
        {title}
      </h2>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        data-droptarget={category}
        className={`flex-grow min-h-[180px] sm:min-h-[300px] p-1 sm:p-2 md:p-4 transition-all duration-300 rounded-b-2xl border-4 border-dashed bg-black/5 ${borderStyle} ${isRegroupingDestination ? 'animate-pulse' : ''} ${isSpotlighted && !isBeingDraggedOver ? 'animate-guide-pulse' : ''} ${isPulsing ? 'animate-column-pulse' : ''}`}
      >
        { (category === 'hundreds' || category === 'thousands') && blocks.length > 4 ? (
          <div className="relative w-full h-full">
            {blocks.map((block, index) => (
              <div
                key={block.id}
                className="absolute left-1/2 -translate-x-1/2 transition-all duration-300"
                style={{
                  bottom: `${index * 8}px`,
                  zIndex: index,
                  transform: 'scale(0.8)',
                }}
              >
                <NumberBlock 
                  id={block.id}
                  category={category}
                  value={block.value} 
                  isDraggable={appState === 'playground'}
                  onDragStart={onDragStart}
                  isAnimating={block.isAnimating}
                  isNewlyRegrouped={block.isNewlyRegrouped}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap-reverse items-end justify-center gap-1 h-full content-start">
            {blocks.map(block => (
              <NumberBlock 
                key={block.id} 
                id={block.id}
                category={category}
                value={block.value} 
                isDraggable={appState === 'playground'}
                onDragStart={onDragStart}
                isAnimating={block.isAnimating}
                isNewlyRegrouped={block.isNewlyRegrouped}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
