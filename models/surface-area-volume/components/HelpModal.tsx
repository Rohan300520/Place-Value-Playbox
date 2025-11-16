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
          <h2 id="help-modal-title" className="text-3xl sm:text-4xl font-black font-display" style={{ color: 'var(--text-accent)'}}>How to Use the 3D Shapes Lab</h2>
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
            <p>Master the concepts of volume and surface area by interacting with 3D shapes in a dynamic digital lab environment.</p>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-green-600 font-display">How It Works</h3>
            <ol className="list-decimal list-inside space-y-3">
              <li><strong>Select a Shape:</strong> Choose from Cube, Cuboid, Cylinder, Cone, or Sphere.</li>
              <li><strong>Adjust Dimensions:</strong> Use the sliders in the controls panel to change the shape's length, radius, height, etc. Watch the 3D model update in real-time!</li>
              <li><strong>Unfold the Shape:</strong> Click the "Unfold" button to see the 3D shape flatten into its 2D net. This is the key to understanding surface area!</li>
              <li><strong>Calculate:</strong> Select Volume, LSA, or TSA and hit "Calculate" to see the formula, step-by-step working, and the final answer.</li>
              <li><strong>Explore:</strong> Rotate the 3D model by clicking and dragging. Zoom in and out with your scroll wheel or by pinching.</li>
            </ol>
          </section>
          
          <section>
            <h3 className="text-2xl font-bold text-green-600 font-display">Game Modes</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-sky-600">Training:</strong> A guided tour for each shape, explaining every concept from dimensions to unfolding and final calculations.</li>
              <li><strong className="text-orange-600">Explore:</strong> A sandbox to freely experiment. Change dimensions, unfold shapes, and calculate properties with no rules.</li>
              <li><strong className="text-amber-600">Challenge:</strong> Test your skills with timed questions that require you to apply the formulas you've learned.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
