
import React, { useState, useEffect, useRef } from 'react';
import type { AppState } from '../types';

interface HeaderProps {
  total: number;
  appState: AppState;
  onBack?: () => void;
  totalInWords: string;
}

export const Header: React.FC<HeaderProps> = ({ total, appState, onBack, totalInWords }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  // FIX: Explicitly initialize useRef with `undefined` to satisfy the TypeScript compiler.
  const prevTotalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (prevTotalRef.current !== undefined && prevTotalRef.current !== total) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000); 
      return () => clearTimeout(timer);
    }
    prevTotalRef.current = total;
  }, [total]);

  if (appState === 'training') {
    return (
      <header className="bg-slate-800/70 backdrop-blur-sm border border-sky-400/20 rounded-2xl shadow-lg p-3 sm:p-4 flex justify-center items-center w-full relative">
         <button 
           onClick={onBack}
           className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full h-8 w-8 sm:h-12 sm:w-12 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
           aria-label="Go back to mode selection"
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
         </button>
        <h1 className="text-2xl sm:text-4xl font-black text-sky-300 tracking-tight">
          Training Mode
        </h1>
      </header>
    );
  }
  
  const formattedTotal = new Intl.NumberFormat().format(total);
  const showBack = appState === 'playground' || appState === 'challenge';

  return (
    <header className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-400/20 p-2 sm:p-4 flex flex-col sm:flex-row justify-between items-center w-full relative">
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
      <h1 className="text-2xl sm:text-4xl font-black text-sky-300 tracking-tight text-center w-full sm:text-center sm:ml-0 ml-12">
        Place Value Playbox
      </h1>
      <div className={`mt-2 sm:mt-0 sm:absolute sm:top-1/2 sm:right-2 md:right-6 sm:-translate-y-1/2 text-center bg-slate-800/50 rounded-2xl px-4 sm:px-6 py-2 shadow-inner border border-sky-400/20 ${isAnimating ? 'animate-tada' : ''}`}>
        <div className="text-5xl sm:text-6xl font-black text-emerald-400 tabular-nums tracking-tighter" style={{ textShadow: '0 0 10px #34d399' }}>
          {formattedTotal}
        </div>
        <div className="text-base sm:text-lg font-bold text-slate-400 capitalize min-h-[1.5rem] sm:min-h-[1.75rem] flex items-center justify-center">
            {total > 0 ? totalInWords : '\u00A0'}
        </div>
      </div>
    </header>
  );
};
