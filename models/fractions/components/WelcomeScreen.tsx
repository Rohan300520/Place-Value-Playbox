import React from 'react';

export const WelcomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
      <div className="backdrop-blur-sm border p-6 sm:p-8 rounded-3xl shadow-xl animate-pop-in" style={{
          backgroundColor: 'var(--backdrop-bg)',
          borderColor: 'var(--border-primary)',
      }}>
        <h1 className="text-4xl md:text-7xl font-black tracking-tight animate-float font-display" style={{ animationDelay: '0.1s', color: 'var(--text-accent)' }}>
          Welcome to
        </h1>
        <h2 className="text-5xl md:text-8xl font-black text-green-600 tracking-tighter mt-2 animate-float font-display" style={{ animationDelay: '0.2s', textShadow: '0 0 15px rgba(22, 163, 74, 0.2)' }}>
          Fraction Foundations!
        </h2>
        
        <p className="mt-4 sm:mt-6 text-lg sm:text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)'}}>
            Explore the world of fractions with an interactive wall. Learn to identify, compare, and add fractions in a fun, visual way!
        </p>

        <img 
            src="/assets/fractions_thumbnail.png" 
            alt="Fraction Wall Example" 
            className="my-6 sm:my-8 rounded-2xl shadow-lg w-full max-w-md mx-auto"
        />

        <button
          onClick={onStart}
          className="mt-4 text-white font-bold text-2xl sm:text-3xl py-3 px-8 sm:py-4 sm:px-12 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 animate-guide-pulse border-b-8 active:border-b-4 font-display wobble-on-hover"
          style={{ 
              backgroundColor: 'var(--btn-action-bg)',
              borderColor: 'var(--btn-action-border)',
              boxShadow: '0 10px 15px -3px var(--shadow-color)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-action-hover)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-action-bg)'}
        >
          Let's Begin!
        </button>
      </div>
    </div>
  );
};