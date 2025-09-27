import React, { useState, useEffect, useCallback, useId, useMemo } from 'react';

// --- TYPES ---
type Stage = 'intro' | 'build_epithelial' | 'build_blood' | 'build_muscle' | 'assemble_artery' | 'final_simulation';
type CellType = 'epithelial' | 'rbc' | 'wbc' | 'platelet' | 'muscle';
type TissueType = 'epithelial' | 'blood' | 'muscle';
type DroppableArea = 'epithelial' | 'muscle' | 'lumen';

interface Cell {
  id: string;
  type: CellType;
  style: React.CSSProperties;
  state: 'source' | 'placed' | 'regrouping';
}

const CELL_BUILD_REQUIREMENT = 8;

// --- ASSET PATHS ---
const ASSETS = {
  'epithelial': '/assets/endothelial-cell.png',
  'rbc': '/assets/rbc.png',
  'wbc': '/assets/wbc.png',
  'platelet': '/assets/platelet.png',
  'muscle': '/assets/muscle-cell.jpeg',
  'epithelial-tissue': '/assets/epithelial-tissue.jpeg',
  'muscle-tissue': '/assets/muscle-tissue.jpeg',
  'blood-tissue': '/assets/blood-tissue.png',
};

// --- HELPER & UI COMPONENTS ---

const DraggableCell: React.FC<{ type: CellType, onDragStart: (type: CellType) => void }> = ({ type, onDragStart }) => (
    <div className="flex flex-col items-center gap-2">
        <img
          src={ASSETS[type]}
          alt={`${type} cell`}
          draggable
          onDragStart={() => onDragStart(type)}
          className="w-16 h-16 object-contain cursor-grab transition-transform hover:scale-110"
        />
        <span className="font-semibold capitalize text-sm">{type.replace('rbc', 'Red Blood Cell').replace('wbc', 'White Blood Cell')}</span>
    </div>
);

const DraggableTissue: React.FC<{ 
    type: TissueType, 
    onDragStart: (type: TissueType) => void, 
    onDragEnd: () => void,
    isPlaced: boolean 
}> = ({ type, onDragStart, onDragEnd, isPlaced }) => {
    if (isPlaced) return null;
    return (
        <div
            draggable
            onDragStart={() => onDragStart(type)}
            onDragEnd={onDragEnd}
            className="flex flex-col items-center gap-2 p-3 bg-white/20 rounded-2xl cursor-grab transition-all hover:bg-white/30 hover:scale-105 border-2 border-white/30 animate-bouncy-pop-in"
        >
            <img src={ASSETS[`${type}-tissue`]} alt={`${type} tissue`} className="w-28 h-28 object-cover rounded-lg shadow-lg"/>
            <span className="font-bold capitalize text-lg">{type} Tissue</span>
        </div>
    );
}

const AnimatedBloodCell: React.FC<{ type: CellType }> = ({ type }) => {
    const style = useMemo(() => ({
        top: `${Math.random() * 60 + 20}%`,
        animation: `flow ${Math.random() * 4 + 3}s linear ${Math.random() * 5}s infinite`,
        transform: `scale(${Math.random() * 0.5 + 0.7})`,
    }), []);
    return <img src={ASSETS[type]} className="absolute w-8 h-8 object-contain" style={style} alt={`${type} flowing`}/>;
};


// --- STAGE COMPONENTS ---

const IntroScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
    <div className="text-center animate-pop-in">
        <h2 className="text-4xl md:text-6xl font-black text-indigo-700 tracking-tight font-display">From Cells to an Artery!</h2>
        <p className="mt-4 text-lg sm:text-xl max-w-3xl mx-auto">
            Let's discover how tiny cells group together to form tissues, and how different tissues work together to build a vital organ like an artery.
        </p>
        <button onClick={onStart} className="mt-8 bg-orange-500 hover:bg-orange-600 text-white font-bold text-2xl py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all border-b-4 border-orange-700 active:border-b-2 animate-guide-pulse">
            Let's Build!
        </button>
    </div>
);

const TissueBuilder: React.FC<{
    title: string;
    cellTypes: CellType[];
    onComplete: () => void;
}> = ({ title, cellTypes, onComplete }) => {
    const [cells, setCells] = useState<Cell[]>([]);
    const [draggedCell, setDraggedCell] = useState<CellType | null>(null);
    const [isRegrouping, setIsRegrouping] = useState(false);
    const baseId = useId();

    useEffect(() => {
        setCells([]);
        setIsRegrouping(false);
    }, [title]);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedCell && cellTypes.includes(draggedCell) && cells.length < CELL_BUILD_REQUIREMENT) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const newCell: Cell = {
                id: `${baseId}-${draggedCell}-${cells.length}`,
                type: draggedCell,
                state: 'placed',
                style: {
                    position: 'absolute',
                    top: `${y - 32}px`,
                    left: `${x - 32}px`,
                    '--target-top': `${y - 32}px`,
                    '--target-left': `${x - 32}px`,
                } as React.CSSProperties,
            };
            setCells(prev => [...prev, newCell]);
        }
        setDraggedCell(null);
    };

    useEffect(() => {
        if (cells.length >= CELL_BUILD_REQUIREMENT && !isRegrouping) {
            setIsRegrouping(true);
            setTimeout(() => setCells(prev => prev.map(c => ({...c, state: 'regrouping'}))), 500);
            setTimeout(onComplete, 1500);
        }
    }, [cells, onComplete, isRegrouping]);

    const tissueType = title.split(' ')[0].toLowerCase() as TissueType;

    return (
        <div className="w-full flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:w-2/3">
                <div 
                    onDrop={handleDrop} 
                    onDragOver={(e) => e.preventDefault()}
                    className={`relative w-full rounded-2xl shadow-inner min-h-[400px] p-4 transition-all duration-300 ${draggedCell ? 'bg-black/10 ring-4 ring-orange-400' : 'bg-black/5'}`}
                >
                    {isRegrouping ? (
                         <div className="w-full h-full flex items-center justify-center animate-bouncy-pop-in">
                            <img src={ASSETS[`${tissueType}-tissue`]} alt={`${tissueType} tissue`} className="w-64 h-64 object-cover rounded-lg shadow-2xl"/>
                        </div>
                    ) : (
                        cells.map(cell => (
                            <img
                                key={cell.id}
                                src={ASSETS[cell.type]}
                                alt=""
                                className={`w-16 h-16 object-contain pointer-events-none ${cell.state === 'regrouping' ? 'animate-regroup-to-center' : 'animate-form-from-center opacity-0'}`}
                                style={cell.style}
                            />
                        ))
                    )}
                </div>
            </div>
            <div className="w-full md:w-1/3 flex flex-col items-center p-4 bg-white/10 rounded-2xl">
                <h3 className="text-2xl font-bold font-display mb-4">{title}</h3>
                <div className="mb-4 text-3xl font-black font-display text-green-600 bg-white/30 rounded-full w-20 h-20 flex items-center justify-center border-4 border-white/50">
                    {isRegrouping ? '✓' : `${cells.length}/${CELL_BUILD_REQUIREMENT}`}
                </div>
                <div className="flex flex-col gap-4">
                    {cellTypes.map(type => <DraggableCell key={type} type={type} onDragStart={setDraggedCell} />)}
                </div>
                <p className="mt-4 text-sm text-center">Drag {CELL_BUILD_REQUIREMENT} cells into the area to build the tissue.</p>
            </div>
        </div>
    );
};

const ArteryAssembler: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [placedTissues, setPlacedTissues] = useState<Record<DroppableArea, boolean>>({ epithelial: false, muscle: false, lumen: false });
    const [draggedTissue, setDraggedTissue] = useState<TissueType | null>(null);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetArea: DroppableArea) => {
        e.preventDefault();
        e.stopPropagation();
        
        const targetMap: Record<TissueType, DroppableArea> = {
            muscle: 'muscle',
            epithelial: 'epithelial',
            blood: 'lumen'
        };

        if (draggedTissue && targetMap[draggedTissue] === targetArea) {
            setPlacedTissues(prev => ({ ...prev, [targetArea]: true }));
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    useEffect(() => {
        if (placedTissues.epithelial && placedTissues.muscle && placedTissues.lumen) {
            setTimeout(onComplete, 1000);
        }
    }, [placedTissues, onComplete]);

    const getHighlightClass = (target: DroppableArea) => {
        if (!draggedTissue) return '';
        const targetMap: Record<TissueType, DroppableArea> = { muscle: 'muscle', epithelial: 'epithelial', blood: 'lumen' };
        return targetMap[draggedTissue] === target ? 'animate-guide-pulse shadow-2xl shadow-yellow-400' : '';
    };

    return (
        <div className="w-full flex flex-col lg:flex-row gap-8 items-center justify-center">
            {/* 3D Artery Diagram */}
            <div className="w-full lg:w-2/3 flex items-center justify-center min-h-[400px]">
                <div className="relative w-[400px] h-[400px]" style={{ perspective: '1000px' }}>
                    <div className="absolute inset-0 w-full h-full" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(60deg) rotateZ(20deg)' }}>
                       {/* Outermost layer - static */}
                       <div className="absolute inset-0 rounded-full bg-amber-200 border-8 border-amber-300 shadow-inner" style={{ transform: 'translateZ(-40px)' }} />

                        {/* Muscle Drop Zone */}
                        <div
                            onDrop={e => handleDrop(e, 'muscle')}
                            onDragOver={handleDragOver}
                            className={`absolute inset-[12%] rounded-full transition-all duration-300 ${getHighlightClass('muscle')}`}
                            style={{ transform: 'translateZ(-20px)' }}
                        >
                            {placedTissues.muscle ?
                                <div className="w-full h-full rounded-full bg-red-500 animate-pop-in shadow-inner" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(185, 28, 28, 0.5) 10px, rgba(185, 28, 28, 0.5) 20px)' }}/> :
                                <div className="w-full h-full rounded-full bg-red-800/50 border-4 border-dashed border-red-300 flex items-center justify-center">
                                    <span className="font-bold text-lg text-white -rotate-[20deg]">Muscle Wall</span>
                                </div>
                            }
                        </div>
                        
                        {/* Epithelial Drop Zone */}
                        <div
                            onDrop={e => handleDrop(e, 'epithelial')}
                            onDragOver={handleDragOver}
                            className={`absolute inset-[35%] rounded-full transition-all duration-300 ${getHighlightClass('epithelial')}`}
                            style={{ transform: 'translateZ(0px)' }}
                        >
                            {placedTissues.epithelial ?
                                <img src={ASSETS['epithelial-tissue']} className="w-full h-full object-cover rounded-full animate-pop-in" alt="Epithelial layer" /> :
                                <div className="w-full h-full rounded-full bg-pink-800/50 border-4 border-dashed border-pink-300 flex items-center justify-center">
                                     <span className="font-bold text-md text-white -rotate-[20deg]">Inner Lining</span>
                                </div>
                            }
                        </div>

                        {/* Lumen Drop Zone */}
                        <div
                            onDrop={e => handleDrop(e, 'lumen')}
                            onDragOver={handleDragOver}
                            className={`absolute inset-[55%] rounded-full transition-all duration-300 ${getHighlightClass('lumen')}`}
                            style={{ transform: 'translateZ(20px)' }}
                        >
                             {placedTissues.lumen ?
                                <div className="w-full h-full rounded-full bg-red-900 animate-pop-in shadow-inner" /> :
                                <div className="w-full h-full rounded-full bg-red-900/70 border-4 border-dashed border-red-400 flex items-center justify-center">
                                    <span className="font-bold text-sm text-white -rotate-[20deg]">Lumen (Blood)</span>
                                </div>
                            }
                        </div>

                    </div>
                </div>
            </div>

            {/* Draggable Tissues */}
            <div className="w-full lg:w-1/3 flex lg:flex-col items-center p-4 bg-white/10 rounded-2xl h-full justify-center gap-4">
                 <DraggableTissue type="muscle" onDragStart={setDraggedTissue} onDragEnd={() => setDraggedTissue(null)} isPlaced={placedTissues.muscle} />
                 <DraggableTissue type="epithelial" onDragStart={setDraggedTissue} onDragEnd={() => setDraggedTissue(null)} isPlaced={placedTissues.epithelial} />
                 <DraggableTissue type="blood" onDragStart={setDraggedTissue} onDragEnd={() => setDraggedTissue(null)} isPlaced={placedTissues.lumen} />
            </div>
        </div>
    );
};


const FinalSimulation: React.FC = () => {
    const bloodCellTypes: CellType[] = useMemo(() => 
        Array.from({ length: 30 }).map(() => {
            const rand = Math.random();
            if (rand < 0.8) return 'rbc';
            if (rand < 0.95) return 'platelet';
            return 'wbc';
        }), []);

    return (
        <div className="w-full flex items-center justify-center animate-pop-in">
             <div className="relative w-full max-w-2xl aspect-[16/9]" style={{ perspective: '1000px' }}>
                <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(60deg)' }}>
                    {/* Artery Tube */}
                    <div className="absolute w-full h-full rounded-[100px] bg-[#f8e6b1]" style={{ transform: 'translateZ(-150px)' }} />
                    <div className="absolute w-full h-full rounded-[100px] bg-[#d97d8c]" style={{ transform: 'translateZ(-100px)', backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px)' }} />
                    <div className="absolute w-full h-full rounded-[100px] bg-[#f8d7da] border-8 border-[#f2b6bc]" style={{ transform: 'translateZ(-50px)' }} />
                    {/* Lumen with blood flow */}
                    <div className="absolute w-full h-full rounded-[100px] bg-[#3d0000] overflow-hidden">
                        {bloodCellTypes.map((type, i) => <AnimatedBloodCell key={i} type={type} />)}
                    </div>
                </div>

                {/* Labels */}
                 <div className="absolute inset-0 pointer-events-none text-white font-bold">
                     <p className="absolute top-[5%] left-[50%] -translate-x-1/2 p-2 bg-black/50 rounded">Muscle Wall (Tunica Media)</p>
                     <p className="absolute top-[30%] left-[50%] -translate-x-1/2 p-2 bg-black/50 rounded">Epithelial Lining (Tunica Intima)</p>
                     <p className="absolute top-[50%] left-[50%] -translate-x-1/2 p-2 bg-black/50 rounded">Blood Flow in Lumen</p>
                 </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
export const StemConnection: React.FC = () => {
    const [stage, setStage] = useState<Stage>('intro');

    const stageConfig = useMemo(() => ({
        'intro': {
            title: "Let's Get Started!",
            description: "Learn how our body is built, from cells to organs.",
            content: <IntroScreen onStart={() => setStage('build_epithelial')} />
        },
        'build_epithelial': {
            title: "Build Epithelial Tissue",
            description: "These cells form protective layers, like our skin!",
            content: <TissueBuilder key="build_epithelial" title="Epithelial Tissue" cellTypes={['epithelial']} onComplete={() => setStage('build_blood')} />
        },
        'build_blood': {
            title: "Build Blood Tissue",
            description: "These cells travel through our body, carrying oxygen and fighting germs.",
            content: <TissueBuilder key="build_blood" title="Blood Tissue" cellTypes={['rbc', 'wbc', 'platelet']} onComplete={() => setStage('build_muscle')} />
        },
        'build_muscle': {
            title: "Build Muscle Tissue",
            description: "These cells help us move and keep our organs working.",
            content: <TissueBuilder key="build_muscle" title="Muscle Tissue" cellTypes={['muscle']} onComplete={() => setStage('assemble_artery')} />
        },
        'assemble_artery': {
            title: "Assemble the Artery",
            description: "Drag the tissues to their correct places. The right spot will glow!",
            content: <ArteryAssembler onComplete={() => setStage('final_simulation')} />
        },
        'final_simulation': {
            title: "Artery in Action!",
            description: "Excellent! You've built a functional artery. Watch the blood cells flow.",
            content: <FinalSimulation />
        }
    }), []);
    
    const currentStage = stageConfig[stage];

    return (
        <div className="flex-grow w-full flex flex-col items-center justify-start p-2 sm:p-4 text-center animate-pop-in">
             <style>{`
                @keyframes flow {
                    0% { left: -10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { left: 110%; opacity: 0; }
                }
            `}</style>
            <div className="backdrop-blur-sm border p-4 sm:p-6 rounded-3xl shadow-xl w-full max-w-7xl mb-6" style={{ backgroundColor: 'var(--backdrop-bg)', borderColor: 'var(--border-primary)'}}>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight font-display" style={{ color: 'var(--text-accent)'}}>
                    {currentStage.title}
                </h1>
                <p className="mt-2 text-md sm:text-lg max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)'}}>
                   {currentStage.description}
                </p>
            </div>
            
            <div className="w-full max-w-7xl flex-grow flex items-center justify-center">
              {currentStage.content}
            </div>
        </div>
    );
};