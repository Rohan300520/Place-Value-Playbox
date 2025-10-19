import React from 'react';
import type { Difficulty } from '../../../types';

interface DifficultySelectorProps {
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onBack: () => void;
}

const DifficultyCard: React.FC<{
  title: string;
  description: string;
  icon: string;
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
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-3xl sm:text-4xl font-black tracking-tight font-display">{title}</h3>
      <p className="mt-2 text-base sm:text-lg opacity-90">{description}</p>
    </button>
  );
};

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelectDifficulty, onBack }) => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight font-display" style={{ color: 'var(--text-accent)'}}>Choose Your Challenge</h2>
        <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)'}}>Select a difficulty level to begin.</p>
      </div>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pop-in">
        <DifficultyCard
          title="Easy"
          description="Basic fractions and simple sums, with a 45-second timer."
          icon="😊"
          onClick={() => onSelectDifficulty('easy')}
          color="bg-gradient-to-br from-emerald-400 to-emerald-600"
          shadow="shadow-emerald-500/40"
          borderColor="border-emerald-800"
        />
        <DifficultyCard
          title="Medium"
          description="Equivalent fractions and sums, with a 35-second timer."
          icon="🤔"
          onClick={() => onSelectDifficulty('medium')}
          color="bg-gradient-to-br from-amber-400 to-amber-600"
          shadow="shadow-amber-500/40"
          borderColor="border-amber-800"
        />
        <DifficultyCard
          title="Hard"
          description="Complex sums and comparisons, with a 25-second timer."
          icon="🔥"
          onClick={() => onSelectDifficulty('hard')}
          color="bg-gradient-to-br from-red-500 to-red-700"
          shadow="shadow-red-500/40"
          borderColor="border-red-900"
        />
      </div>
      <button
        onClick={onBack}
        className="mt-12 flex items-center gap-2 font-bold py-3 px-6 rounded-xl shadow-lg border-b-4 active:border-b-2 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4"
        style={{ 
            backgroundColor: 'var(--modal-bg)',
            color: 'var(--text-secondary)',
            borderColor: 'var(--border-primary)'
        }}
        aria-label="Go back to mode selection"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to Modes</span>
      </button>
    </div>
  );
};