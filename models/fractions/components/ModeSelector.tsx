import React from 'react';
import type { FractionState } from '../../../types';

interface ModeSelectorProps {
  onSelectMode: (mode: FractionState) => void;
}

const ModeCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
  shadow: string;
  borderColor: string;
}> = ({ title, description, icon, onClick, color, shadow, borderColor }) => {
  return (
    <button
      onClick={onClick}
      className={`p-6 sm:p-8 rounded-3xl shadow-lg text-left text-white w-full max-w-sm transform hover:-translate-y-2 transition-transform duration-300 border-b-8 active:border-b-4 ${color} ${shadow} ${borderColor}`}
    >
      <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white/30 rounded-full mb-4">
          {icon}
      </div>
      <h3 className="text-3xl sm:text-4xl font-black tracking-tight font-display">{title}</h3>
      <p className="mt-2 text-base sm:text-lg opacity-90">{description}</p>
    </button>
  );
};

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectMode }) => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pop-in" style={{ animationDelay: '0.2s' }}>
        <ModeCard
          title="Training"
          description="Learn the basics with a fun, step-by-step guide."
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 00.002 1.788l7 3.5a1 1 0 00.786 0l7-3.5a1 1 0 00-.002-1.788l-7-3.5zM3 9.44l7 3.5 7-3.5-7-3.5-7 3.5z" /><path d="M1 11.563l7 3.5a1 1 0 00.786 0l7-3.5a1 1 0 00-1-1.788l-6.214 3.107-6.214-3.107a1 1 0 00-1 1.788z" /></svg>}
          onClick={() => onSelectMode('training')}
          color="bg-gradient-to-br from-sky-400 to-sky-600"
          shadow="shadow-sky-500/40"
          borderColor="border-sky-800"
        />
        <ModeCard
          title="Explore"
          description="Freely experiment with fractions and discover equivalents."
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>}
          onClick={() => onSelectMode('explore')}
          color="bg-gradient-to-br from-emerald-400 to-emerald-600"
          shadow="shadow-emerald-500/40"
          borderColor="border-emerald-800"
        />
        <ModeCard
          title="Challenge"
          description="Test your skills against the clock with tricky questions."
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>}
          onClick={() => onSelectMode('challenge')}
          color="bg-gradient-to-br from-amber-400 to-amber-600"
          shadow="shadow-amber-500/40"
          borderColor="border-amber-800"
        />
      </div>
    </div>
  );
};