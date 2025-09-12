import React from 'react';
import { NumberBlock } from './NumberBlock';

export const WelcomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-slate-900/50 backdrop-blur-sm border border-sky-400/20 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-sky-500/20 animate-pop-in">
        <h1 className="text-4xl md:text-7xl font-black text-sky-300 tracking-tight animate-float" style={{ animationDelay: '0.1s' }}>
          Welcome to the
        </h1>
        <h2 className="text-5xl md:text-8xl font-black text-emerald-400 tracking-tighter mt-2 animate-float" style={{ animationDelay: '0.2s', textShadow: '0 0 15px #34d399' }}>
          Place Value Playbox!
        </h2>
        
        <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
            Learn about hundreds, tens, and ones in a fun, interactive way. Drag the blocks to build numbers and watch the magic happen!
        </p>

        <div className="flex justify-center items-center gap-4 sm:gap-8 mt-6 sm:mt-10">
            <div className="flex flex-col items-center">
                <NumberBlock value={1} isDraggable={false} />
                <span className="mt-2 font-bold text-sky-400 text-base sm:text-lg">Ones</span>
            </div>
            <div className="flex flex-col items-center">
                <NumberBlock value={10} isDraggable={false} />
                <span className="mt-2 font-bold text-emerald-400 text-base sm:text-lg">Tens</span>
            </div>
            <div className="flex flex-col items-center">
                <NumberBlock value={100} isDraggable={false} />
                <span className="mt-2 font-bold text-amber-400 text-base sm:text-lg">Hundreds</span>
            </div>
        </div>

        <button
          onClick={onStart}
          className="mt-8 sm:mt-12 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold text-2xl sm:text-3xl py-3 px-8 sm:py-4 sm:px-12 rounded-2xl shadow-xl shadow-yellow-400/30 transform hover:scale-110 transition-all duration-300 animate-guide-pulse"
        >
          Let's Play!
        </button>
      </div>
    </div>
  );
};
