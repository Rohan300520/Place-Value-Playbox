import React, { useState } from 'react';

type StemTab = 'biology' | 'computing';

const ConceptCard: React.FC<{ title: string, subtitle: string, icon: React.ReactNode, description: string, color: string }> = ({ title, subtitle, icon, description, color }) => (
    <div className="flex flex-col items-center text-center p-2 flex-1 min-w-[120px]">
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-2 border-4 ${color.replace('text-', 'border-')}`}>
            {icon}
        </div>
        <h3 className={`text-xl sm:text-2xl font-black ${color}`}>{title}</h3>
        <p className="text-sm sm:text-base font-bold text-slate-300 h-12 sm:h-auto">{subtitle}</p>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 hidden sm:block">{description}</p>
    </div>
);

const Arrow: React.FC = () => (
    <div className="text-4xl font-black text-sky-400 my-2 sm:my-0 sm:mx-2 self-center sm:rotate-0 rotate-90">
        →
    </div>
);

const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`px-4 py-2 sm:px-6 sm:py-3 text-lg font-bold rounded-t-lg transition-colors ${active ? 'bg-slate-700/50 text-emerald-300 border-b-4 border-emerald-300' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}>
        {children}
    </button>
)

const BiologyConnection = () => (
    <div className="bg-slate-800/50 p-4 rounded-xl border border-purple-400/20 w-full animate-pop-in">
        <h3 className="text-center text-2xl font-bold text-purple-300 mb-4">The Blueprints of Life</h3>
        <div className="flex flex-col sm:flex-row items-stretch justify-around">
            <ConceptCard title="Cell" subtitle="Basic Unit of Life" description="The smallest living part." color="text-sky-400" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></svg>} />
            <Arrow />
            <ConceptCard title="Tissue" subtitle="Group of Cells" description="Many cells working together." color="text-emerald-400" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4z" /></svg>} />
            <Arrow />
            <ConceptCard title="Organ" subtitle="Group of Tissues" description="Tissues forming a heart or lungs." color="text-amber-400" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>} />
            <Arrow />
            <ConceptCard title="System" subtitle="Group of Organs" description="Organs that work together (e.g., digestive system)." color="text-red-400" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} />
            <Arrow />
            <ConceptCard title="Organism" subtitle="A Complete Being" description="All systems combined to make a living thing." color="text-fuchsia-400" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>} />
        </div>
    </div>
);

const ComputingConnection = () => (
    <div className="bg-slate-800/50 p-4 rounded-xl border border-cyan-400/20 w-full animate-pop-in">
        <h3 className="text-center text-2xl font-bold text-cyan-300 mb-4">The Secret Code of Computers</h3>
        <div className="flex flex-col sm:flex-row items-stretch justify-around">
            <ConceptCard title="Bit" subtitle="The Smallest Switch" description="A single 0 or 1." color="text-sky-400" icon={<div className="font-black text-2xl">01</div>} />
            <Arrow />
            <ConceptCard title="Byte" subtitle="A Group of 8 Bits" description="Enough to store a letter, like 'A'." color="text-emerald-400" icon={<div className="font-black text-lg">01000001</div>} />
            <Arrow />
            <ConceptCard title="Kilobyte" subtitle="~1000 Bytes" description="Enough to store a short email." color="text-amber-400" icon={<div className="font-black text-3xl">KB</div>} />
            <Arrow />
            <ConceptCard title="Megabyte" subtitle="~1000 Kilobytes" description="Enough to store a song." color="text-red-400" icon={<div className="font-black text-3xl">MB</div>} />
            <Arrow />
            <ConceptCard title="Gigabyte" subtitle="~1000 Megabytes" description="Enough to store a movie." color="text-fuchsia-400" icon={<div className="font-black text-3xl">GB</div>} />
        </div>
    </div>
);


export const StemConnection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<StemTab>('biology');

    return (
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-white animate-pop-in">
            <main className="bg-slate-900/50 backdrop-blur-sm border border-sky-400/20 p-4 sm:p-8 rounded-3xl shadow-2xl shadow-sky-500/20 max-w-6xl w-full">
                <h2 className="text-center text-3xl sm:text-5xl font-black text-emerald-300 mb-2">Building Bigger Things!</h2>
                <p className="text-center text-md sm:text-lg text-slate-300 max-w-3xl mx-auto mb-6">
                    Just like we group ones to make thousands, the world around us groups small pieces to build amazing, complex systems!
                </p>

                <div className="flex justify-center border-b border-slate-600 mb-6">
                    <TabButton active={activeTab === 'biology'} onClick={() => setActiveTab('biology')}>The Blueprints of Life</TabButton>
                    <TabButton active={activeTab === 'computing'} onClick={() => setActiveTab('computing')}>The Code of Computers</TabButton>
                </div>
                
                {activeTab === 'biology' && <BiologyConnection />}
                {activeTab === 'computing' && <ComputingConnection />}

            </main>
        </div>
    );
}
