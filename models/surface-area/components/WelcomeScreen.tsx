import React from 'react';

interface WelcomeScreenProps {
    onStart: () => void;
    title: string;
    grade: 'IX' | 'X';
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, title, grade }) => {
    return (
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center animate-pop-in">
            <div className="backdrop-blur-sm border p-8 sm:p-12 rounded-3xl shadow-2xl" style={{ backgroundColor: 'var(--blueprint-panel-bg)', borderColor: 'var(--blueprint-border)' }}>
                <h1 className="text-4xl md:text-7xl font-black tracking-tight font-display" style={{ color: 'var(--blueprint-text-primary)' }}>
                    Surface Area & Volumes
                </h1>
                <h2 className="text-3xl md:text-5xl font-black mt-2 font-display" style={{ color: 'var(--blueprint-accent)' }}>
                    {title} (Class {grade})
                </h2>
                <p className="mt-6 text-lg sm:text-xl max-w-2xl mx-auto" style={{ color: 'var(--blueprint-text-secondary)' }}>
                    An interactive 3D environment to explore, visualize, and understand the properties of geometric solids.
                </p>
                <button
                    onClick={onStart}
                    className="mt-10 text-white font-bold text-2xl sm:text-3xl py-4 px-12 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 animate-guide-pulse border-b-8 active:border-b-4 font-display"
                    style={{
                        backgroundColor: 'var(--btn-action-bg)',
                        borderColor: 'var(--btn-action-border)',
                    }}
                >
                    Start Exploring
                </button>
            </div>
        </div>
    );
};
