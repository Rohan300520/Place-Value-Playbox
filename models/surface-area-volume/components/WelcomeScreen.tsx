import React from 'react';

export const WelcomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
      <div className="backdrop-blur-sm border p-6 sm:p-8 rounded-3xl shadow-xl animate-pop-in max-w-4xl" style={{
          backgroundColor: 'var(--backdrop-bg)',
          borderColor: 'var(--border-primary)',
      }}>
        <div className="flex justify-center items-center gap-4">
            <img src="/assets/geo-bot.svg" alt="Geo-Bot Mascot" className="w-24 h-24 hidden sm:block animate-bot-float" />
            <div>
                <h1 className="text-4xl md:text-7xl font-black tracking-tight font-display" style={{ animationDelay: '0.1s', color: 'var(--text-accent)' }}>
                  Welcome to the
                </h1>
                <h2 className="text-5xl md:text-8xl font-black text-indigo-500 tracking-tighter mt-2 font-display" style={{ animationDelay: '0.2s', textShadow: '0 0 15px rgba(99, 102, 241, 0.4)' }}>
                  3D Shapes Lab!
                </h2>
            </div>
        </div>
        
        <p className="mt-4 sm:mt-6 text-lg sm:text-xl max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)'}}>
            I'm Geo-Bot! Let's explore the world of 3D geometry together. Build, unfold, and measure shapes like cubes, cylinders, and spheres to see how they work!
        </p>
        
        <div className="mt-8 border-t-2 pt-6" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center justify-center gap-4">
            <img src="/assets/logo.jpeg" alt="SMART C Logo" className="h-14" />
            <div className="text-left">
              <p className="text-sm font-bold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                An interactive digital lab from the creators at
              </p>
              <p className="text-2xl font-display font-bold -mt-1" style={{ color: 'var(--text-accent)' }}>
                SMART C
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onStart}
          className="mt-8 text-white font-bold text-2xl sm:text-3xl py-3 px-8 sm:py-4 sm:px-12 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 animate-guide-pulse border-b-8 active:border-b-4 font-display wobble-on-hover"
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
