import React from 'react';
import { useAudio } from '../contexts/AudioContext';

export const SpeechToggle: React.FC = () => {
  const { isSpeechEnabled, toggleSpeech } = useAudio();

  return (
    <button
      onClick={toggleSpeech}
      className="p-2 rounded-full transition-colors duration-300"
      style={{
        color: 'var(--text-secondary)',
        backgroundColor: 'var(--panel-bg)',
      }}
      aria-label={`Turn ${isSpeechEnabled ? 'off' : 'on'} instruction audio`}
    >
      {isSpeechEnabled ? (
        // Speaker On Icon
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      ) : (
        // Speaker Off Icon
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l2 2" />
        </svg>
      )}
    </button>
  );
};
