import React, { useState, useEffect, useRef } from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { SpeechToggle } from './SpeechToggle';
import type { UserInfo } from '../types';

interface HeaderProps {
  onHelpClick: () => void;
  currentUser: UserInfo | null;
  onExit: () => void; // Exits to the main model selection screen
  onBackToModelMenu?: () => void; // Navigates back within a model (e.g., playground to mode selection)
  modelTitle?: string;
  modelSubtitle?: string;
  showScore?: boolean;
  score?: number;
  scoreInWords?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  onHelpClick, 
  currentUser, 
  onExit, 
  onBackToModelMenu,
  modelTitle,
  modelSubtitle,
  showScore,
  score,
  scoreInWords,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevTotalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (showScore && prevTotalRef.current !== undefined && prevTotalRef.current !== score) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
    prevTotalRef.current = score;
  }, [score, showScore]);

  return (
    <header className="backdrop-blur-sm sticky top-0 z-30 w-full" style={{ 
        backgroundColor: 'var(--header-bg)',
        borderBottom: '1px solid var(--border-primary)',
    }}>
      <div className="max-w-8xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 md:h-20">
          
          {/* Left Section */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
                onClick={onExit}
                className="flex items-center gap-1 sm:gap-2 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Exit to model selection"
              >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7" />
              </svg>
              <span className="font-bold hidden sm:inline">All Models</span>
            </button>
            {onBackToModelMenu && (
               <button
                  onClick={onBackToModelMenu}
                  className="flex items-center gap-1 sm:gap-2 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset"
                  style={{ color: 'var(--text-secondary)' }}
                  aria-label="Go back to mode selection"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-bold hidden sm:inline">Back</span>
              </button>
            )}
          </div>

          {/* Center Section (Title) */}
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-center px-24 pointer-events-none">
            <div className="text-center truncate">
              {modelTitle && <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight font-display truncate" style={{ color: 'var(--text-primary)' }}>{modelTitle}</h1>}
              {modelSubtitle && <h2 className="text-md sm:text-xl lg:text-2xl font-bold tracking-tight -mt-1 sm:-mt-2 truncate" style={{ color: 'var(--text-accent)'}}>{modelSubtitle}</h2>}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
              {showScore && (
                 <div className={`text-center rounded-2xl px-2 sm:px-4 py-1 shadow-inner ${isAnimating ? 'animate-tada' : ''}`} style={{
                    backgroundColor: 'var(--panel-bg)',
                    border: '1px solid var(--border-primary)',
                }}>
                  <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-green-600 tabular-nums tracking-tighter" style={{ textShadow: '0 0 10px rgba(22, 163, 74, 0.3)' }}>
                    {new Intl.NumberFormat().format(score || 0)}
                  </div>
                  <div className="text-xs sm:text-base font-bold capitalize min-h-[1rem] sm:min-h-[1.5rem] flex items-center justify-center" style={{ color: 'var(--text-secondary)'}}>
                      {(score || 0) > 0 ? scoreInWords : '\u00A0'}
                  </div>
                </div>
              )}
              <SpeechToggle />
              <button
                onClick={onHelpClick}
                className="p-2 rounded-full transition-colors duration-300"
                style={{
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--panel-bg)',
                }}
                aria-label="Open help and instructions"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};