
import React, { useState } from 'react';
import type { AppState, UserInfo, SchoolLevel } from '../types';
import { Sidebar } from './Sidebar';

const MODELS_CONFIG: Record<SchoolLevel, { 
    id: AppState; 
    title: string; 
    description: string;
    imageUrl: string;
    color: string;
    shadow: string;
    border: string;
}[]> = {
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
            imageUrl: '/assets/fractions_thumbnail.jpeg',
            color: 'from-emerald-400 to-emerald-600',
            shadow: 'shadow-emerald-500/40',
            border: 'border-emerald-800'
        }
    ],
    'High School': [
        { 
            id: 'surface_area_volume' as AppState, 
            title: 'Surface Area & Volume', 
            description: 'Explore 3D shapes, unfold their nets, and master volume and surface area calculations.',
            imageUrl: '/assets/surface-area-thumbnail.svg',
            color: 'from-indigo-400 to-indigo-600',
            shadow: 'shadow-indigo-500/40',
            border: 'border-indigo-800'
        }
    ],
};

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

const NAV_ICONS: Record<SchoolLevel, React.ReactNode> = {
    'Lower School': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    'Middle School': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    'High School': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
};


// --- MAIN COMPONENT ---

export const ModelSelectionScreen: React.FC<{ onSelectModel: (model: AppState) => void, currentUser: UserInfo | null }> = ({ onSelectModel, currentUser }) => {
    const [activeLevel, setActiveLevel] = useState<SchoolLevel>('Lower School');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out? This will end your current session.')) {
            localStorage.removeItem('app_license');
            localStorage.removeItem('app_user_info');
            window.location.reload();
        }
    };
    
    const modelsToDisplay = MODELS_CONFIG[activeLevel];

    return (
        <div className="w-full flex-1 flex flex-col lg:flex-row">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                activeLevel={activeLevel}
                onSelectLevel={(level) => {
                    setActiveLevel(level);
                    setIsSidebarOpen(false);
                }}
                currentUser={currentUser}
                onLogout={() => {
                    handleLogout();
                    setIsSidebarOpen(false);
                }}
            />
            
            {/* --- Desktop Sidebar --- */}
            <aside 
                className="hidden lg:flex w-72 flex-col p-6 shadow-2xl z-10 border-r flex-shrink-0"
                style={{ backgroundColor: 'var(--modal-bg)', borderColor: 'var(--border-primary)' }}
            >
                <img src="/assets/logo.jpeg" alt="SMART C Logo" className="h-16 mx-auto mb-8" />
                
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

            {/* --- Main Content Area --- */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 shadow-md z-10" style={{ backgroundColor: 'var(--modal-bg)', borderBottom: '1px solid var(--border-primary)'}}>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2" aria-label="Open navigation menu">
                        <svg className="h-8 w-8" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <img src="/assets/logo.jpeg" alt="SMART C Logo" className="h-10 mx-auto" />
                </header>

                <main className="flex-1 p-4 sm:p-10">
                    <div className="w-full max-w-7xl mx-auto">
                        <h1 className="text-4xl sm:text-6xl font-black font-display mb-10" style={{ color: 'var(--text-primary)'}}>
                            {activeLevel} Models
                        </h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                            {modelsToDisplay.map(model => <ModelCard key={model.id} {...model} onSelect={onSelectModel} />)}
                            {modelsToDisplay.length === 0 && <ComingSoonCard />}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
