import React, { useMemo } from 'react';
import type { BlockValue, PlaceValueCategory } from '../types';
import { NumberBlock } from './NumberBlock';

interface BlockSourceProps {
  onDragStart: (value: BlockValue, origin?: { category: PlaceValueCategory, id: string }) => void;
  onTouchStart: (value: BlockValue, event: React.TouchEvent) => void;
  isTraining: boolean;
  spotlightOn?: BlockValue;
}

const blockData = [
  { value: 1000 as BlockValue, label: '1000', colorClass: 'text-purple-300' },
  { value: 100 as BlockValue, label: '100', colorClass: 'text-amber-300' },
  { value: 10 as BlockValue, label: '10', colorClass: 'text-emerald-300' },
  { value: 1 as BlockValue, label: '1', colorClass: 'text-sky-300' },
];

interface BlockWrapperProps {
  value: BlockValue;
  onDragStart: (value: BlockValue, origin?: { category: PlaceValueCategory, id: string }) => void;
  onTouchStart: (value: BlockValue, event: React.TouchEvent) => void;
  isSpotlighted: boolean;
  label: string;
  colorClass: string;
}

const BlockWrapper: React.FC<BlockWrapperProps> = React.memo(({ value, onDragStart, onTouchStart, isSpotlighted, label, colorClass }) => {
    const animationDelay = useMemo(() => `${Math.random()}s`, []);
    const animationClass = isSpotlighted ? 'animate-guide-pulse' : 'animate-float';

    return (
        <div 
          className={`flex flex-col items-center p-2 rounded-lg transition-all duration-300 ${animationClass}`}
          style={{ animationDelay: isSpotlighted ? '0s' : animationDelay }}
        >
            <NumberBlock value={value} isDraggable={true} onDragStart={onDragStart} onTouchStart={onTouchStart} />
            <span className={`mt-2 font-bold text-lg ${colorClass}`}>{label}</span>
        </div>
    );
});


export const BlockSource: React.FC<BlockSourceProps> = ({ onDragStart, onTouchStart, isTraining, spotlightOn }) => {
  let blocksToRender = blockData;

  if (isTraining) {
    blocksToRender = blockData.filter(b => b.value === spotlightOn);
  }

  return (
    <div className="flex items-end justify-center gap-4 sm:gap-8 p-4 rounded-xl">
      {blocksToRender.map(block => (
        <BlockWrapper 
          key={block.value}
          value={block.value}
          onDragStart={onDragStart}
          onTouchStart={onTouchStart}
          label={block.label}
          colorClass={block.colorClass}
          isSpotlighted={isTraining && spotlightOn === block.value}
        />
      ))}
    </div>
  );
};