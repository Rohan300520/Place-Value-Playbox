import React from 'react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div 
        className="border rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-pop-in"
        style={{ backgroundColor: 'var(--modal-bg)', borderColor: 'var(--border-primary)'}}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="help-modal-title" className="text-3xl sm:text-4xl font-black font-display" style={{ color: 'var(--text-accent)'}}>How to Use Fraction Foundations</h2>
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-full h-10 w-10 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform border-b-4 border-red-700 active:border-b-2"
            aria-label="Close help modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6 text-lg" style={{ color: 'var(--text-secondary)'}}>
          <section>
            <h3 className="text-2xl font-bold text-green-600 font-display">The Goal</h3>
            <p>Learn fraction arithmetic by building and solving equations visually on the Calculation Canvas.</p>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-green-600 font-display">How It Works</h3>
            <ol className="list-decimal list-inside space-y-3">
              <li><strong>Select a Fraction:</strong> Click a fraction piece on the Fraction Wall (e.g., '1/2'). It will appear on the Calculation Canvas below.</li>
              <li><strong>Choose an Operator:</strong> Click the '+' or '-' button in the control panel to add it to your equation.</li>
              <li><strong>Select a Second Fraction:</strong> Click another fraction on the Wall (e.g., '1/4') to complete your equation.</li>
              <li><strong>Solve!:</strong> Click the 'Solve' button. Watch as the fractions animate to find a common size and then combine to show the final answer!</li>
              <li><strong>Clear:</strong> Use the 'Clear' button at any time to start a new equation.</li>
            </ol>
          </section>
          
          <section>
            <h3 className="text-2xl font-bold text-green-600 font-display">Game Modes</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-sky-600">Training:</strong> A step-by-step guide that walks you through building and solving your first equation.</li>
              <li><strong className="text-orange-600">Explore:</strong> A sandbox to freely build and solve any fraction equation you can imagine.</li>
              <li><strong className="text-amber-600">Challenge:</strong> Test your skills by building the correct equation to answer timed questions.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
