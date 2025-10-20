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
          <h2 id="help-modal-title" className="text-3xl sm:text-4xl font-black font-display" style={{ color: 'var(--text-accent)'}}>How to Use the Explorer</h2>
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
            <p>Visualize 3D shapes, understand their properties, and see how formulas for volume and surface area are applied step-by-step.</p>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-green-600 font-display">How It Works</h3>
            <ol className="list-decimal list-inside space-y-3">
              <li><strong>Select a Shape:</strong> Choose a 3D solid from the menu to load it into the 3D viewer.</li>
              <li><strong>Interact in 3D:</strong> Click and drag to rotate the shape. Scroll to zoom in and out.</li>
              <li><strong>Adjust Dimensions:</strong> Use the sliders in the control panel to change the shape's properties like radius, height, or side length.</li>
              <li><strong>Choose Calculation:</strong> Select whether you want to calculate Volume, Curved/Lateral Surface Area (CSA/LSA), or Total Surface Area (TSA).</li>
              <li><strong>Calculate:</strong> Click the "Calculate" button to see the full, step-by-step solution, including the formula used.</li>
              <li><strong>(Class IX Only) Unfold Net:</strong> Click "Unfold Net" to see the 2D representation of the 3D shape's surfaces.</li>
            </ol>
          </section>
          
          <section>
            <h3 className="text-2xl font-bold text-green-600 font-display">Game Modes</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-sky-600">Training:</strong> A guided tour to learn all the features of the 3D explorer.</li>
              <li><strong className="text-orange-600">Explore:</strong> A free-play sandbox to experiment with any shape and calculation you want.</li>
              <li><strong className="text-amber-600">Challenge:</strong> Solve word problems from your textbook by selecting the correct shape, inputting dimensions, and performing the right calculation.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
