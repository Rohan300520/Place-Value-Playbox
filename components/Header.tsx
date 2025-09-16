import React from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { SpeechToggle } from './SpeechToggle';

interface HeaderProps {
  onMenuClick: () => void;
  onHelpClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, onHelpClick }) => {
  return (
    <header className="backdrop-blur-sm sticky top-0 z-30 w-full" style={{ 
        backgroundColor: 'var(--header-bg)',
        borderBottom: '1px solid var(--border-primary)',
    }}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Open sidebar"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex-shrink-0 ml-4 flex items-center" style={{ color: 'var(--text-primary)'}}>
              <img src="/assets/logo.svg" alt="SMART C Logo" className="h-12 md:h-16" />
            </div>
          </div>
          <div className="flex items-center gap-4">
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