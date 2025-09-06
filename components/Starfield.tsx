
import React, { useMemo } from 'react';

export const Starfield: React.FC = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => {
      const size = Math.random() * 2.5 + 1;
      const style = {
        width: `${size}px`,
        height: `${size}px`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 3 + 2}s`
      };
      return <div key={i} className="star" style={style} />;
    });
  }, []);

  return <div className="fixed top-0 left-0 w-full h-full -z-10" aria-hidden="true">{stars}</div>;
};
