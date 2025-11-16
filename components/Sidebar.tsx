import React from 'react';
import type { SchoolLevel, UserInfo } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLevel: (level: SchoolLevel) => void;
  activeLevel: SchoolLevel;
  currentUser: UserInfo | null;
  onLogout: () => void;
}

const NAV_ICONS: Record<SchoolLevel, React.ReactNode> = {
    'Lower School': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    'Middle School': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    'High School': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
};

const NavButton: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full text-left p-4 rounded-lg transition-all duration-200 text-lg font-bold ${
            isActive 
            ? 'bg-orange-500 text-white shadow-md' 
            : 'hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        style={{ color: isActive ? '' : 'var(--text-secondary)' }}
    >
        <span className="mr-4">{icon}</span>
        {label}
    </button>
);

const MODEL_LEVELS: SchoolLevel[] = ['Lower School', 'Middle School', 'High School'];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeLevel, onSelectLevel, currentUser, onLogout }) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div
        className={`fixed top-0 left-0 h-full w-72 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
        style={{ backgroundColor: 'var(--modal-bg)'}}
      >
        <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-primary)'}}>
          <h2 id="sidebar-title" className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)'}}>Math Models</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full"
            style={{ color: 'var(--text-secondary)'}}
            aria-label="Close sidebar"
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
            <div className="text-left mb-4">
                <p className="text-sm" style={{ color: 'var(--text-secondary)'}}>Welcome back,</p>
                <p className="font-bold text-2xl font-display" style={{ color: 'var(--text-primary)'}}>{currentUser?.name || 'Explorer'}</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)'}}>{currentUser?.school}</p>
            </div>

            <nav className="space-y-2">
                {MODEL_LEVELS.map((level) => (
                    <NavButton 
                        key={level}
                        label={level}
                        icon={NAV_ICONS[level]}
                        isActive={activeLevel === level}
                        onClick={() => onSelectLevel(level)}
                    />
                ))}
            </nav>
        </div>

        <div className="mt-auto p-4">
            <button
                onClick={onLogout}
                className="flex items-center gap-3 p-4 w-full rounded-lg transition-colors duration-200 font-bold text-lg hover:bg-red-500 hover:text-white"
                style={{ color: 'var(--text-secondary)'}}
                aria-label="Logout"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
            </button>
        </div>
      </div>
    </>
  );
};