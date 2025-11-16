import React from 'react';

interface ObjectivesScreenProps {
  onContinue: () => void;
}

export const ObjectivesScreen: React.FC<ObjectivesScreenProps> = ({ onContinue }) => {
  const learningObjectives = [
    'Identify 3D shapes: Cube, Cuboid, Cylinder, Cone, Sphere.',
    'Understand dimensions like length, breadth, height, and radius.',
    'Calculate the Volume of each solid shape.',
    'Visualize and understand the concept of a shape\'s Net.',
    'Calculate Lateral and Total Surface Area (LSA & TSA).',
    'Apply formulas to solve real-world problems.',
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
          <div className="flex justify-center items-center">
            <img 
              src="/assets/surface-area-thumbnail.svg"
              alt="3D Shapes" 
              className="rounded-2xl shadow-lg w-full max-w-sm object-contain" 
            />
          </div>
          <div className="text-left">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight font-display mb-6" style={{ color: 'var(--text-accent)' }}>
              Learning Objectives
            </h2>
            <ul className="space-y-3">
              {learningObjectives.map((objective) => (
                <li key={objective} className="flex items-start text-lg sm:text-xl">
                  <svg className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
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
          >
            Continue to Lab
          </button>
        </div>
      </div>
    </div>
  );
};
