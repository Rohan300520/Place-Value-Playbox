import React, { useState } from 'react';
import type { AppState, UserInfo } from '../types';

const MODELS_CONFIG = {
    'Lower School': [
        { 
            id: 'place_value_playbox' as AppState, 
            title: 'Place Value Playbox', 
            description: 'An interactive playground to learn about Ones, Tens, Hundreds, and Thousands.',
            imageUrl: '/assets/place-value-box-model.png',
            color: 'from-sky-400 to-sky-600',
            shadow: 'shadow-sky-500/40',
            border: 'border-sky-800'
        }
    ],
    'Middle School': [
        { 
            id: 'fractions' as AppState, 
            title: 'Fraction Foundations', 
            description: 'Explore fractions visually with an interactive chart-based model.',
            imageUrl: '/assets/fractions_thumbnail.png',
            color: 'from-emerald-400 to-emerald-600',
            shadow: 'shadow-emerald-500/40',
            border: 'border-emerald-800'
        }
    ],
    'High School': [
        { 
            id: 'surface_area_9' as AppState, 
            title: 'Solid Shapes Explorer (IX)', 
            description: 'Visualize and calculate properties of 3D shapes like cubes, cones, and spheres.',
            imageUrl: '/assets/surface_area_9_thumbnail.png',
            color: 'from-indigo-400 to-indigo-600',
            shadow: 'shadow-indigo-500/40',
            border: 'border-indigo-800'
        },
        { 
            id: 'surface_area_10' as AppState, 
            title: 'Combined Solids Workshop (X)', 
            description: 'Explore composite shapes, frustums, and volume conversions in 3D.',
            imageUrl: '/assets/surface_area_10_thumbnail.png',
            color: 'from-rose-400 to-rose-600',
            shadow: 'shadow-rose-500/40',
            border: 'border-rose-800'
        }
    ]
};

type SchoolLevel = 'Lower School' | 'Middle School' | 'High School';

// --- UI COMPONENTS ---

const ModelCard: React.FC<{
    id: AppState;
    title: string;
    description: string;
    imageUrl: string;
    color: string;
    shadow: string;
    border: string;
    onSelect: (model: AppState) => void;
}> = ({ id, title, description, imageUrl, color, shadow, border, onSelect }) => (
    <button
        onClick={() => onSelect(id)}
        className={`group bg-gradient-to-br ${color} ${shadow} ${border} text-white rounded-3xl shadow-lg p-6 w-full max-w-sm transform hover:-translate-y-2 transition-transform duration-300 border-b-8 active:border-b-4 text-left flex flex-col animate-pop-in`}
    >
        <img src={imageUrl} alt={title} className="rounded-2xl shadow-md w-full h-48 object-cover mb-6 transition-transform duration-300 group-hover:scale-105" />
        <h3 className="text-3xl font-black tracking-tight font-display">{title}</h3>
        <p className="mt-2 text-base opacity-90 flex-grow">{description}</p>
    </button>
);

const ComingSoonCard: React.FC = () => (
     <div 
        className="border-4 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 w-full max-w-sm text-center h-[436px] animate-pop-in"
        style={{borderColor: 'var(--border-primary)'}}
    >
        <div className="text-6xl mb-4">🚀</div>
        <h3 className="text-3xl font-bold font-display" style={{color: 'var(--text-accent)'}}>More Models Coming Soon!</h3>
        <p className="mt-2 text-lg" style={{color: 'var(--text-secondary)'}}>Stay tuned for more interactive learning adventures.</p>
    </div>
);

const NavButton: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full text-left p-4 rounded-lg transition-all duration-200 text-lg font-bold ${
            isActive 
            ? 'bg-orange-500 text-white shadow-md' 
            : 'hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        style={{ color: isActive ? '' : 'var(--text-secondary)' }}
    >
        <span className="mr-4">{icon}</span>
        {label}
    </button>
);

const NAV_ICONS = {
    'Lower School': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    'Middle School': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    'High School': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>,
};


// --- MAIN COMPONENT ---

export const ModelSelectionScreen: React.FC<{ onSelectModel: (model: AppState) => void, currentUser: UserInfo | null }> = ({ onSelectModel, currentUser }) => {
    const [activeLevel, setActiveLevel] = useState<SchoolLevel>('Lower School');

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out? This will end your current session.')) {
            localStorage.removeItem('app_license');
            localStorage.removeItem('app_user_info');
            window.location.reload();
        }
    };
    
    const modelsToDisplay = MODELS_CONFIG[activeLevel];

    return (
        <div className="w-full">
            {/* --- Sidebar --- */}
            <aside 
                className="fixed top-0 left-0 w-72 h-screen flex flex-col p-6 shadow-2xl z-10 border-r"
                style={{ backgroundColor: 'var(--modal-bg)', borderColor: 'var(--border-primary)' }}
            >
                <img src="/assets/logo.svg" alt="SMART C Logo" className="h-16 mb-8" />
                
                <div className="text-left mb-8">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)'}}>Welcome back,</p>
                    <p className="font-bold text-2xl font-display" style={{ color: 'var(--text-primary)'}}>{currentUser?.name || 'Explorer'}</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)'}}>{currentUser?.school}</p>
                </div>

                <nav className="flex-grow space-y-2">
                    {Object.keys(MODELS_CONFIG).map((level) => (
                        <NavButton 
                            key={level}
                            label={level}
                            icon={NAV_ICONS[level as SchoolLevel]}
                            isActive={activeLevel === level}
                            onClick={() => setActiveLevel(level as SchoolLevel)}
                        />
                    ))}
                </nav>

                <div className="mt-auto">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 p-4 w-full rounded-lg transition-colors duration-200 font-bold text-lg hover:bg-red-500 hover:text-white"
                        style={{ color: 'var(--text-secondary)'}}
                        aria-label="Logout"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                    </button>
                    <p className="text-center text-xs mt-4" style={{ color: 'var(--text-secondary)'}}>
                        &copy; {new Date().getFullYear()} SMART C
                    </p>
                </div>
            </aside>

            {/* --- Main Content --- */}
            <main className="ml-72 p-10">
                <div className="w-full max-w-7xl mx-auto">
                    <h1 className="text-6xl font-black font-display mb-10" style={{ color: 'var(--text-primary)'}}>
                        {activeLevel} Models
                    </h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {modelsToDisplay.map(model => <ModelCard key={model.id} {...model} onSelect={onSelectModel} />)}
                        {modelsToDisplay.length === 0 && <ComingSoonCard />}
                    </div>
                </div>
            </main>
        </div>
    );
};