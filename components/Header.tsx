import React from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
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
              <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};
