

import React from 'react';
import type { AppState } from '../types';
import { Starfield } from './Starfield';

interface ModeSelectorProps {
  onSelectMode: (mode: AppState) => void;
}

const ModeCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
  shadow: string;
}> = ({ title, description, icon, onClick, color, shadow }) => {
  return (
    <button
      onClick={onClick}
      className={`p-6 sm:p-8 rounded-3xl shadow-lg text-left text-white w-full max-w-sm transform hover:-translate-y-2 transition-transform duration-300 border border-white/20 ${color} ${shadow}`}
    >
      <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-full mb-4">
          {icon}
      </div>
      <h3 className="text-3xl sm:text-4xl font-black tracking-tight">{title}</h3>
      <p className="mt-2 text-base sm:text-lg opacity-90">{description}</p>
    </button>
  );
};

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
       <Starfield />
       <div className="text-center mb-8 sm:mb-12 animate-pop-in">
            <h1 className="text-4xl md:text-7xl font-black text-sky-300 tracking-tight" style={{ textShadow: '0 0 15px #38bdf8' }}>
                Choose Your Adventure!
            </h1>
       </div>
      <div className="flex flex-col lg:flex-row gap-8 animate-pop-in" style={{ animationDelay: '0.2s' }}>
        <ModeCard
          title="Training"
          description="Learn how to play with a fun, step-by-step guide."
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 00.002 1.788l7 3.5a1 1 0 00.786 0l7-3.5a1 1 0 00-.002-1.788l-7-3.5zM3 9.44l7 3.5 7-3.5-7-3.5-7 3.5z" /><path d="M1 11.563l7 3.5a1 1 0 00.786 0l7-3.5a1 1 0 00-1-1.788l-6.214 3.107-6.214-3.107a1 1 0 00-1 1.788z" /></svg>}
          onClick={() => onSelectMode('training')}
          color="bg-gradient-to-br from-sky-500 to-blue-600"
          shadow="shadow-sky-500/40"
        />
        <ModeCard
          title="Playground"
          description="Freely explore and build any number you can imagine."
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>}
          onClick={() => onSelectMode('playground')}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
          shadow="shadow-emerald-500/40"
        />
        <ModeCard
          title="Challenge"
          description="Test your skills and launch a rocket with every win!"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>}
          onClick={() => onSelectMode('challenge')}
          color="bg-gradient-to-br from-amber-500 to-orange-600"
          shadow="shadow-amber-500/40"
        />
      </div>
    </div>
  );
};
