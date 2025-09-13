import React from 'react';

interface ModelIntroScreenProps {
  onContinue: () => void;
}

export const ModelIntroScreen: React.FC<ModelIntroScreenProps> = ({ onContinue }) => {
  const learningObjectives = [
    'Place Value Chart',
    'Number Words',
    'Addition',
    'Subtraction',
    'Multiplication',
    'Division'
  ];

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 text-center w-full max-w-5xl mx-auto">
      <div 
        className="w-full backdrop-blur-sm border p-6 sm:p-8 rounded-3xl shadow-xl animate-pop-in"
        style={{
          backgroundColor: 'var(--backdrop-bg)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Image Column */}
          <div className="flex justify-center items-center">
            <img 
              src="/assets/place-value-box-model.png" 
              alt="Place Value Box Model" 
              className="rounded-2xl shadow-lg w-full max-w-md object-contain" 
            />
          </div>

          {/* Objectives Column */}
          <div className="text-left">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight font-display mb-6" style={{ color: 'var(--text-accent)' }}>
              Learning Objectives
            </h2>
            <ul className="space-y-3">
              {learningObjectives.map((objective) => (
                <li key={objective} className="flex items-center text-xl sm:text-2xl">
                  <svg className="w-8 h-8 text-green-500 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  <span style={{ color: 'var(--text-secondary)' }}>{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <button
            onClick={onContinue}
            className="text-white font-bold text-2xl sm:text-3xl py-3 px-8 sm:py-4 sm:px-12 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 border-b-8 active:border-b-4 font-display wobble-on-hover"
            style={{ 
                backgroundColor: 'var(--btn-action-bg)',
                borderColor: 'var(--btn-action-border)',
                boxShadow: '0 10px 15px -3px var(--shadow-color)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-action-hover)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-action-bg)'}
          >
            Continue to Playbox
          </button>
        </div>
      </div>
    </div>
  );
};
