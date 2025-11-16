import React from 'react';

interface RealWorldModalProps {
  shapeName: string;
  examples: { name: string; img: string }[];
  onClose: () => void;
}

export const RealWorldModal: React.FC<RealWorldModalProps> = ({ shapeName, examples, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="examples-modal-title"
    >
      <div 
        className="border rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-pop-in"
        style={{ backgroundColor: 'var(--modal-bg)', borderColor: 'var(--border-primary)'}}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="examples-modal-title" className="text-3xl sm:text-4xl font-black font-display" style={{ color: 'var(--text-accent)'}}>
            Real World {shapeName}s
          </h2>
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-full h-10 w-10 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform border-b-4 border-red-700 active:border-b-2"
            aria-label="Close examples modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!examples || examples.length === 0 ? (
          <p className="text-center text-lg" style={{ color: 'var(--text-secondary)' }}>
            No examples available for this shape yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {examples.map((example, index) => (
              <div key={index} className="flex flex-col items-center gap-2 animate-pop-in" style={{ animationDelay: `${index * 100}ms`}}>
                <img src={example.img} alt={example.name} className="w-full h-32 object-contain bg-white/10 rounded-lg p-2 shadow-md" />
                <p className="font-bold text-center text-lg" style={{ color: 'var(--text-secondary)' }}>{example.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
