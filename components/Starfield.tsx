import React, { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const CloudsContent: React.FC = () => {
  const clouds = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const size = Math.random() * 150 + 50; // Cloud size
      const style = {
        width: `${size * 2}px`,
        height: `${size}px`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 30}s`,
        animationDuration: `${Math.random() * 50 + 30}s`
      };
      return <div key={i} className="cloud" style={style} />;
    });
  }, []);

  return <div className="background-container" aria-hidden="true">{clouds}</div>;
};

const StarfieldContent: React.FC = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => {
      const size = Math.random() * 2 + 1;
      const style = {
        width: `${size}px`,
        height: `${size}px`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 5 + 3}s`
      };
      return <div key={i} className="star" style={style} />;
    });
  }, []);

  return <div className="background-container" aria-hidden="true">{stars}</div>;
};

export const BackgroundManager: React.FC = () => {
    const { theme } = useTheme();
    return theme === 'light' ? <CloudsContent /> : <StarfieldContent />;
}
