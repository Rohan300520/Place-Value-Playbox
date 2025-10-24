import React from 'react';
import type { SurfaceAreaState } from '../../../types';

interface ModeSelectorProps {
  onSelectMode: (mode: 'training' | 'explore' | 'challenge') => void;
}

const ModeCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, description, icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-8 rounded-3xl shadow-lg text-left w-full max-w-sm transform hover:-translate-y-2 transition-transform duration-300 border-b-8 active:border-b-4"
      style={{
        backgroundColor: 'var(--blueprint-panel-bg)',
        borderColor: 'var(--blueprint-border)',
        borderBottomColor: 'var(--blueprint-accent-dark)'
      }}
    >
      <div className="flex items-center justify-center w-16 h-16 bg-[var(--blueprint-accent)] rounded-full mb-4 text-white">
          {icon}
      </div>
      <h3 className="text-3xl font-black tracking-tight font-display" style={{ color: 'var(--blueprint-text-primary)'}}>{title}</h3>
      <p className="mt-2 text-lg" style={{ color: 'var(--blueprint-text-secondary)'}}>{description}</p>
    </button>
  );
};

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectMode }) => {
  return (
    <div className="w-full flex-grow flex flex-col items-center p-4 pt-10 sm:pt-16">
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight font-display" style={{ color: 'var(--blueprint-accent)'}}>Choose Your Mode</h2>
      </div>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pop-in">
        <ModeCard
          title="Training"
          description="Learn the tools with a step-by-step interactive guide."
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 00.002 1.788l7 3.5a1 1 0 00.786 0l7-3.5a1 1 0 00-.002-1.788l-7-3.5zM3 9.44l7 3.5 7-3.5-7-3.5-7 3.5z" /><path d="M1 11.563l7 3.5a1 1 0 00.786 0l7-3.5a1 1 0 00-1-1.788l-6.214 3.107-6.214-3.107a1 1 0 00-1 1.788z" /></svg>}
          onClick={() => onSelectMode('training')}
        />
        <ModeCard
          title="Explore"
          description="A free-play sandbox to experiment with any shape and calculation."
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>}
          onClick={() => onSelectMode('explore')}
        />
        <ModeCard
          title="Challenge"
          description="Solve textbook problems against the clock to test your knowledge."
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>}
          onClick={() => onSelectMode('challenge')}
        />
      </div>
    </div>
  );
};