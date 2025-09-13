import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Language } from '../types';

const LANGUAGES: { code: Language; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
];

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full flex items-center gap-2 transition-colors duration-300"
        style={{
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--panel-bg)',
        }}
        aria-label={`Change language, current is ${language}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M12 21a9.004 9.004 0 008.75-6.132l-2.88-2.88A18.022 18.022 0 0110.048 18M12 9a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
        <span className="font-bold uppercase">{language}</span>
      </button>

      {isOpen && (
        <div 
            className="absolute right-0 mt-2 w-40 rounded-lg shadow-xl py-1 animate-pop-in"
            style={{ backgroundColor: 'var(--modal-bg)', border: '1px solid var(--border-primary)'}}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="language-menu-button"
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-lg hover:bg-orange-400 hover:text-white transition-colors"
              style={{ color: 'var(--text-secondary)'}}
              role="menuitem"
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
