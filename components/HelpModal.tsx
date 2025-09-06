
import React from 'react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div 
        className="bg-slate-800 border border-sky-400/30 rounded-2xl shadow-2xl shadow-sky-500/20 p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="help-modal-title" className="text-3xl sm:text-4xl font-black text-sky-300">How to Play</h2>
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-full h-10 w-10 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
            aria-label="Close help modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6 text-slate-300 text-lg">
          <section>
            <h3 className="text-2xl font-bold text-emerald-400 mb-2">The Goal</h3>
            <p>Learn about place value (Ones, Tens, Hundreds) by building numbers with blocks. It's a fun way to see how numbers are made!</p>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-emerald-400 mb-2">Game Modes</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-sky-400">Training:</strong> A friendly step-by-step guide to teach you the basics of dragging, dropping, and regrouping.</li>
              <li><strong className="text-emerald-400">Playground:</strong> A free-play area to explore and build any number you can imagine. There are no rules here!</li>
              <li><strong className="text-amber-400">Challenge:</strong> Test your skills! You'll be given a target number to build. Get it right to earn points and move to the next challenge.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-emerald-400 mb-2">How It Works</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Drag & Drop:</strong> Click and hold a block from the bottom panel and drag it into the correct column above.</li>
              <li><strong>The Magic of Regrouping:</strong> When you collect 10 blocks in the 'Ones' column, they will magically transform into one 'Ten' block! The same thing happens when you get 10 'Tens'—they become one 'Hundred' block.</li>
            </ul>
          </section>

          <div className="border-t-2 border-sky-400/20 my-8"></div>

          <section>
            <h3 id="about-section-title" className="text-3xl font-black text-sky-300 mb-2">About</h3>
            <p><strong>Place Value Playbox</strong> is an interactive educational tool designed to make learning math concepts fun for young children. By visualizing numbers and regrouping, it helps build a strong foundation for future math skills.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
