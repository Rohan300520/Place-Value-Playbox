import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { cancelSpeech } from '../utils/speech';

interface AudioContextType {
  isSpeechEnabled: boolean;
  toggleSpeech: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem('placeValueSpeechEnabled');
      if (savedState !== null) {
        setIsSpeechEnabled(JSON.parse(savedState));
      }
    } catch (e) {
      console.error("Could not access localStorage for audio settings.", e);
    }
  }, []);

  const toggleSpeech = useCallback(() => {
    const newState = !isSpeechEnabled;
    setIsSpeechEnabled(newState);
    if (!newState) {
        cancelSpeech(); // Cancel any ongoing speech when disabling
    }
    try {
      localStorage.setItem('placeValueSpeechEnabled', JSON.stringify(newState));
    } catch (e) {
      console.error("Could not write audio settings to localStorage.", e);
    }
  }, [isSpeechEnabled]);

  return (
    <AudioContext.Provider value={{ isSpeechEnabled, toggleSpeech }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
