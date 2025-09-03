
import React from 'react';
import type { AppState } from '../types';

interface HeaderProps {
  total: number;
  appState: AppState;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ total, appState, onBack }) => {
  if (appState === 'training') {
    return (
      <header className="bg-slate-200 rounded-2xl shadow-lg p-3 sm:p-4 flex justify-center items-center w-full relative">
        <h1 className="text-2xl sm:text-4xl font-black text-blue-800 tracking-tight">
          Training Mode
        </h1>
      </header>
    );
  }
  
  const formattedTotal = new Intl.NumberFormat().format(total);
  const showBack = appState === 'playground' || appState === 'challenge';

  return (
    <header className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-2 sm:p-4 flex flex-col sm:flex-row justify-between items-center w-full relative">
       {showBack && (
         <button 
           onClick={onBack}
           className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full h-8 w-8 sm:h-12 sm:w-12 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
           aria-label="Go back to mode selection"
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
         </button>
       )}
      <h1 className="text-2xl sm:text-4xl font-black text-blue-800 tracking-tight text-center w-full sm:text-center sm:ml-0 ml-12">
        Place Value Playbox
      </h1>
      <div className="mt-2 sm:mt-0 sm:absolute sm:top-1/2 sm:right-2 md:right-6 sm:-translate-y-1/2 text-center">
        <span className="text-lg sm:text-xl font-bold text-gray-600">Total Value</span>
        <div className="text-4xl sm:text-6xl font-black text-emerald-600 sm:mt-1 tabular-nums tracking-tighter">
          {formattedTotal}
        </div>
      </div>
    </header>
  );
};
