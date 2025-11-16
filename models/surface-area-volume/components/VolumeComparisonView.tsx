import React, { useState, useCallback } from 'react';

// A single, self-contained component for the cone visualization
const ConeSource: React.FC<{ isFilled: boolean; index: number }> = ({ isFilled, index }) => (
    <div className="flex flex-col items-center gap-2">
        <div 
            className="w-2 h-4 rounded-full"
            style={{ 
                background: isFilled ? '#3b82f6' : '#4b5563',
                transition: `background 0.5s ease ${index * 100}ms`
            }}
        />
        <div 
            className="w-0 h-0"
            style={{
                borderLeft: '40px solid transparent',
                borderRight: '40px solid transparent',
                borderTop: '80px solid rgba(107, 114, 128, 0.3)'
            }}
        >
            <div 
                className="w-0 h-0 relative -top-20 transition-transform duration-500 ease-in-out"
                style={{
                    borderLeft: '40px solid transparent',
                    borderRight: '40px solid transparent',
                    borderTop: '80px solid #3b82f6',
                    transform: isFilled ? 'scale(1)' : 'scale(0.95) translateY(-10px)',
                    opacity: isFilled ? 1 : 0,
                    transition: 'transform 0.5s ease, opacity 0.5s ease'
                }}
            />
        </div>
    </div>
);


export const VolumeComparisonView: React.FC = () => {
    const [fillLevel, setFillLevel] = useState(0); // 0, 1, 2, 3
    const [isAnimating, setIsAnimating] = useState(false);

    const handleFill = useCallback(() => {
        if (fillLevel < 3 && !isAnimating) {
            setIsAnimating(true);
            setFillLevel(prev => prev + 1);
            setTimeout(() => setIsAnimating(false), 500); // Animation duration
        }
    }, [fillLevel, isAnimating]);

    const handleReset = useCallback(() => {
        if (!isAnimating) {
            setIsAnimating(true);
            setFillLevel(0);
            setTimeout(() => setIsAnimating(false), 500);
        }
    }, [isAnimating]);

    const isFinished = fillLevel === 3;

    return (
        <div className="w-full flex-grow flex flex-col items-center gap-4 animate-pop-in p-4">
            <div 
                className="w-full h-64 md:h-auto md:flex-1 rounded-2xl shadow-lg border p-6 flex flex-col md:flex-row items-center justify-around gap-8" 
                style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)' }}
            >
                {/* Left Side: Cone Sources */}
                <div className="flex flex-col items-center gap-4">
                     <h3 className="text-xl font-bold font-display" style={{color: 'var(--text-secondary)'}}>Source Cones</h3>
                    <div className="flex items-end justify-center gap-8">
                        <ConeSource isFilled={fillLevel < 1} index={0} />
                        <ConeSource isFilled={fillLevel < 2} index={1} />
                        <ConeSource isFilled={fillLevel < 3} index={2} />
                    </div>
                </div>

                {/* Arrow */}
                <svg className="w-16 h-16 text-sky-400 transform rotate-90 md:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>

                {/* Right Side: Cylinder Target */}
                <div className="flex flex-col items-center gap-4">
                    <h3 className="text-xl font-bold font-display" style={{color: 'var(--text-secondary)'}}>Target Cylinder</h3>
                    <div 
                        className="w-48 h-64 rounded-t-lg flex items-end"
                        style={{ backgroundColor: 'rgba(107, 114, 128, 0.3)' }}
                    >
                        <div 
                            className="w-full bg-sky-500 rounded-t-md transition-all duration-500 ease-in-out"
                            style={{ 
                                height: `${(fillLevel / 3) * 100}%`,
                                boxShadow: 'inset 0 0 15px rgba(2, 132, 199, 0.8)'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Control Panel */}
            <div className="w-full max-w-2xl p-4 rounded-2xl shadow-lg border space-y-3" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)' }}>
                <div className="text-center">
                    <h2 className="text-2xl font-bold font-display" style={{ color: 'var(--text-accent)' }}>Cone vs. Cylinder Volume</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>It takes **three** cones to fill one cylinder of the same height and radius.</p>
                    <p className="font-mono text-xl font-bold mt-1">V<sub className="text-sm">cone</sub> = (1/3) × V<sub className="text-sm">cylinder</sub></p>
                </div>
                <div className="flex items-center justify-center gap-4 pt-2">
                    <button
                        onClick={isFinished ? handleReset : handleFill}
                        disabled={isAnimating || isFinished}
                        className={`px-6 py-3 font-bold text-xl rounded-lg shadow-lg transition-all border-b-4 active:border-b-2 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isFinished
                                ? 'bg-orange-500 border-orange-700'
                                : 'bg-sky-500 hover:bg-sky-600 border-sky-700'
                        }`}
                    >
                        {isFinished ? 'Cylinder Full!' : `Fill 1/3`}
                    </button>
                     <button
                        onClick={handleReset}
                        className="px-6 py-3 font-bold text-xl rounded-lg shadow-lg transition-all border-b-4 active:border-b-2 transform hover:scale-105 bg-red-600 hover:bg-red-700 border-red-800"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};
