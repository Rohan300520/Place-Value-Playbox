import React, { useState, useCallback, useRef, useEffect } from 'react';

// A single, self-contained component for the cone visual
const ConeVisual: React.FC<{ isFilled: boolean; children?: React.ReactNode }> = ({ isFilled, children }) => (
    <div className="relative w-20 h-[96px]">
        {/* The cone 'water' */}
        <div
            className="cone-water transition-opacity duration-300"
            style={{ opacity: isFilled ? 1 : 0 }}
        >
        </div>
        {/* The cone outline */}
        <svg viewBox="0 0 80 96" className="absolute inset-0 w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 96L0 16L80 16L40 96Z" fill="rgba(107, 114, 128, 0.3)" />
            <path d="M40 0L40 16" stroke="#4b5563" strokeWidth="4" strokeLinecap="round" />
        </svg>
        {children}
    </div>
);


export const VolumeComparisonView: React.FC = () => {
    const [cylinderFillLevel, setCylinderFillLevel] = useState(0); // 0, 1, 2, 3
    const [filledCones, setFilledCones] = useState([true, true, true]);
    const [animationState, setAnimationState] = useState<{
        index: number | null;
        phase: 'idle' | 'moving' | 'pouring' | 'returning';
    }>({ index: null, phase: 'idle' });
    const [animPositions, setAnimPositions] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const sourceConesRef = useRef<(HTMLButtonElement | null)[]>([]);
    const cylinderRef = useRef<HTMLDivElement>(null);

    const handlePour = useCallback((index: number) => {
        if (animationState.phase !== 'idle' || !filledCones[index]) return;

        const containerRect = containerRef.current?.getBoundingClientRect();
        const coneRect = sourceConesRef.current[index]?.getBoundingClientRect();
        const cylinderRect = cylinderRef.current?.getBoundingClientRect();

        if (containerRect && coneRect && cylinderRect) {
            setAnimPositions({
                startX: coneRect.left - containerRect.left,
                startY: coneRect.top - containerRect.top,
                endX: cylinderRect.left - containerRect.left + (cylinderRect.width / 2) - (coneRect.width / 2),
                endY: cylinderRect.top - containerRect.top - 50 // Position above the cylinder
            });

            setAnimationState({ index, phase: 'moving' });
        }
    }, [animationState.phase, filledCones]);

    useEffect(() => {
        if (animationState.phase === 'moving') {
            const timer = setTimeout(() => setAnimationState(s => ({ ...s, phase: 'pouring' })), 500);
            return () => clearTimeout(timer);
        }
        if (animationState.phase === 'pouring') {
            const timer = setTimeout(() => {
                setCylinderFillLevel(prev => prev + 1);
                setFilledCones(prev => {
                    const newFilled = [...prev];
                    if(animationState.index !== null) newFilled[animationState.index] = false;
                    return newFilled;
                });
                setAnimationState(s => ({ ...s, phase: 'returning' }));
            }, 1500);
            return () => clearTimeout(timer);
        }
        if (animationState.phase === 'returning') {
            const timer = setTimeout(() => setAnimationState({ index: null, phase: 'idle' }), 500);
            return () => clearTimeout(timer);
        }
    }, [animationState]);


    const handleReset = useCallback(() => {
        if (animationState.phase !== 'idle') return;
        setCylinderFillLevel(0);
        setFilledCones([true, true, true]);
    }, [animationState.phase]);
    
    const isFinished = cylinderFillLevel === 3;

    return (
        <div ref={containerRef} className="w-full flex-grow flex flex-col items-center gap-4 animate-pop-in p-4 relative">
             {animationState.index !== null && (
                <div
                    className="animating-cone-container absolute"
                    style={{
                        '--start-x': `${animPositions.startX}px`,
                        '--start-y': `${animPositions.startY}px`,
                        '--end-x': `${animPositions.endX}px`,
                        '--end-y': `${animPositions.endY}px`,
                        left: 0,
                        top: 0,
                        transform: `translateX(var(--start-x)) translateY(var(--start-y))`,
                        opacity: animationState.phase === 'idle' ? 0 : 1,
                        transition: 'transform 0.5s ease-in-out, opacity 0.2s',
                        ...(animationState.phase === 'moving' && { transform: `translateX(var(--end-x)) translateY(var(--end-y))` }),
                        ...(animationState.phase === 'pouring' && { transform: `translateX(var(--end-x)) translateY(var(--end-y))` }),
                        ...(animationState.phase === 'returning' && { transform: `translateX(var(--start-x)) translateY(var(--start-y))`, opacity: 0, transition: 'transform 0.5s ease-in-out, opacity 0.5s 0.3s' })
                    } as React.CSSProperties}
                >
                    <div 
                        className="pouring-cone-visual relative w-full h-full"
                        style={{
                            transition: 'transform 1.5s ease-in-out',
                            ...(animationState.phase === 'pouring' && { transform: 'rotate(-110deg)' })
                        }}
                    >
                        <ConeVisual isFilled={false}>
                            <div
                                className="cone-water"
                                style={{
                                    opacity: 1,
                                    transition: 'height 1s ease-in-out 0.25s',
                                    ...(animationState.phase === 'pouring' && { height: '0%' }),
                                }}
                            >
                            </div>
                        </ConeVisual>
                        <div 
                            className="pouring-stream absolute bottom-[-60px] left-[calc(50%-5px)] w-[10px] h-[80px] bg-sky-500 rounded-b-full"
                            style={{ 
                                transform: animationState.phase === 'pouring' ? 'scaleY(1)' : 'scaleY(0)',
                            }}
                        />
                    </div>
                </div>
            )}
            <div 
                className="w-full h-64 md:h-auto md:flex-1 rounded-2xl shadow-lg border p-6 flex flex-col md:flex-row items-center justify-around gap-8" 
                style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)' }}
            >
                {/* Left Side: Cone Sources */}
                <div className="flex flex-col items-center gap-4">
                     <h3 className="text-xl font-bold font-display" style={{color: 'var(--text-secondary)'}}>Source Cones</h3>
                    <div className="flex items-end justify-center gap-8">
                        {[0, 1, 2].map(index => (
                             <button
                                key={index}
                                ref={el => { sourceConesRef.current[index] = el; }}
                                onClick={() => handlePour(index)}
                                disabled={!filledCones[index] || animationState.phase !== 'idle'}
                                className="flex flex-col items-center gap-2 group disabled:cursor-not-allowed transition-opacity"
                                style={{ opacity: animationState.index === index ? 0 : 1 }}
                            >
                                <ConeVisual isFilled={filledCones[index]} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Arrow */}
                <svg className="w-16 h-16 text-sky-400 transform rotate-90 md:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>

                {/* Right Side: Cylinder Target */}
                <div ref={cylinderRef} className="flex flex-col items-center gap-4">
                    <h3 className="text-xl font-bold font-display" style={{color: 'var(--text-secondary)'}}>Target Cylinder</h3>
                    <div 
                        className="w-48 h-64 rounded-t-lg flex items-end"
                        style={{ backgroundColor: 'rgba(107, 114, 128, 0.3)' }}
                    >
                        <div 
                            className="w-full bg-sky-500 rounded-t-md transition-all duration-500 ease-in-out"
                            style={{ 
                                height: `${(cylinderFillLevel / 3) * 100}%`,
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
                    <p style={{ color: 'var(--text-secondary)' }}>Click a full cone to pour it into the cylinder. It takes **three** cones to fill one cylinder of the same height and radius.</p>
                    <p className="font-mono text-xl font-bold mt-1">V<sub className="text-sm">cone</sub> = (1/3) × V<sub className="text-sm">cylinder</sub></p>
                </div>
                <div className="flex items-center justify-center gap-4 pt-2">
                     <button
                        onClick={handleReset}
                        disabled={animationState.phase !== 'idle'}
                        className="px-6 py-3 font-bold text-xl rounded-lg shadow-lg transition-all border-b-4 active:border-b-2 transform hover:scale-105 bg-red-600 hover:bg-red-700 border-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};