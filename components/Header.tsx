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
  const prevTotalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (prevTotalRef.current !== undefined && prevTotalRef.current !== total) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000); 
      return () => clearTimeout(timer);
    }
    prevTotalRef.current = total;
  }, [total]);

  const showBackButton = onBack && (appState === 'playground' || appState === 'challenge' || appState === 'training' || appState === 'stem_connection');

  const getSubTitle = () => {
    switch(appState) {
        case 'training': return 'Training Mode';
        case 'challenge': return 'Challenge Mode';
        case 'playground': return 'Playground';
        case 'stem_connection': return 'STEM Connection';
        case 'mode_selection': return 'Choose Your Adventure!';
        default: return null;
    }
  }
  
  const subTitle = getSubTitle();
  const showScore = appState === 'playground' || appState === 'challenge' || appState === 'training';

  return (
    <header className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-400/20 p-2 sm:p-4 flex justify-between items-center w-full">
      <div className="flex-1">
        {showBackButton && (
          <button 
            onClick={onBack}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full h-8 w-8 sm:h-12 sm:w-12 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform z-10"
            aria-label="Go back to mode selection"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
          </button>
        )}
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <img src="/assets/smart-cerebrum-logo.svg" alt="Smart Cerebrum" className="h-8 sm:h-10" />
        {subTitle && (
            <h2 className="text-lg sm:text-2xl font-bold text-sky-300 tracking-tight -mt-1 sm:-mt-2">
                {subTitle}
            </h2>
        )}
      </div>

      <div className="flex-1 flex justify-end">
        {showScore && (
          <div className={`text-center bg-slate-800/50 rounded-2xl px-3 sm:px-6 py-1 sm:py-2 shadow-inner border border-sky-400/20 ${isAnimating ? 'animate-tada' : ''}`}>
            <div className="text-4xl sm:text-6xl font-black text-emerald-400 tabular-nums tracking-tighter" style={{ textShadow: '0 0 10px #34d399' }}>
              {new Intl.NumberFormat().format(total)}
            </div>
            <div className="text-xs sm:text-lg font-bold text-slate-400 capitalize min-h-[1.25rem] sm:min-h-[1.75rem] flex items-center justify-center">
                {total > 0 ? totalInWords : '\u00A0'}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
