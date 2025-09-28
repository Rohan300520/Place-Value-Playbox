
import React, { useState, useEffect, useCallback, useId, useMemo, useRef } from 'react';

// --- TYPES ---
type Stage = 'intro' | 'build_epithelial' | 'build_blood' | 'build_muscle' | 'assemble_artery' | 'final_simulation';
type CellType = 'epithelial' | 'rbc' | 'wbc' | 'platelet' | 'muscle';
type TissueType = 'epithelial' | 'blood' | 'muscle';
type DroppableArea = 'epithelial' | 'muscle' | 'blood';

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
  // Using more realistic textures for the assembler
  'epithelial-tissue': '/assets/epithelial-tissue-glossy.jpg',
  'muscle-tissue': '/assets/muscle-tissue-fibrous.jpg',
  'blood-tissue': '/assets/blood-tissue-animated.png',
};

// --- HELPER & UI COMPONENTS ---

const DraggableCell: React.FC<{ 
    type: CellType, 
    onDragStart: (type: CellType) => void,
    onClick: (type: CellType) => void,
}> = ({ type, onDragStart, onClick }) => (
    <div 
      className="flex flex-col items-center gap-2 cursor-pointer"
      onClick={() => onClick(type)}
    >
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
    onClick: (type: TissueType) => void,
    isPlaced: boolean 
}> = ({ type, onDragStart, onDragEnd, onClick, isPlaced }) => {
    if (isPlaced) return null;
    return (
        <div
            draggable
            onDragStart={() => onDragStart(type)}
            onDragEnd={onDragEnd}
            onClick={() => onClick(type)}
            className="flex flex-col items-center gap-2 p-3 bg-white/20 rounded-2xl cursor-pointer transition-all hover:bg-white/30 hover:scale-105 border-2 border-white/30 animate-bouncy-pop-in"
        >
            <img src={ASSETS[`${type}-tissue`]} alt={`${type} tissue`} className="w-28 h-28 object-cover rounded-lg shadow-lg"/>
            <span className="font-bold capitalize text-lg">{type} Tissue</span>
        </div>
    );
}

const AnimatedBloodCell: React.FC<{ type: CellType }> = ({ type }) => {
    const style = useMemo(() => ({
        top: `${Math.random() * 60 + 20}%`,
        // Updated animation for a more realistic, pulsing flow
        animation: `flow-pulse ${Math.random() * 2 + 2.5}s ease-in-out ${Math.random() * 3}s infinite`,
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
    const [feedbackMessage, setFeedbackMessage] = useState<{ title: string; description: string } | null>(null);
    const baseId = useId();
    const tissueType = title.split(' ')[0].toLowerCase() as TissueType;
    const dishRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCells([]);
        setIsRegrouping(false);
        setFeedbackMessage(null);
    }, [title]);

    const addCell = (type: CellType, x: number, y: number) => {
        const newCell: Cell = {
            id: `${baseId}-${type}-${cells.length}`,
            type: type,
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
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedCell && cellTypes.includes(draggedCell) && cells.length < CELL_BUILD_REQUIREMENT) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            addCell(draggedCell, x, y);
        }
        setDraggedCell(null);
    };

    const handleClickToAddCell = (type: CellType) => {
      if (cellTypes.includes(type) && cells.length < CELL_BUILD_REQUIREMENT) {
          const rect = dishRef.current?.getBoundingClientRect() || { width: 500, height: 400 };

          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          // Radius is responsive to container width, ensuring circle fits
          const radius = Math.min(rect.width, rect.height) / 3; 
          const angle = (cells.length / CELL_BUILD_REQUIREMENT) * 2 * Math.PI;

          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          
          addCell(type, x, y);
      }
    };

    useEffect(() => {
        if (cells.length >= CELL_BUILD_REQUIREMENT && !isRegrouping) {
            setIsRegrouping(true);

            let title = '';
            let description = '';

            if (tissueType === 'epithelial') {
                title = "Epithelial Cells form Epithelial Tissue!";
                description = "Great job! These cells create linings for organs, just like the inside of our artery.";
            } else if (tissueType === 'blood') {
                title = "Blood Cells form Blood Tissue!";
                description = "Awesome! This is a special liquid tissue that carries nutrients and oxygen all over your body.";
            } else if (tissueType === 'muscle') {
                title = "Muscle Cells form Muscle Tissue!";
                description = "Fantastic! These strong cells help the artery pump blood by squeezing and relaxing.";
            }
            setFeedbackMessage({ title, description });
            
            setTimeout(() => setCells(prev => prev.map(c => ({...c, state: 'regrouping'}))), 500);
            
            setTimeout(() => {
                onComplete();
                setFeedbackMessage(null);
            }, 4000);
        }
    }, [cells, onComplete, isRegrouping, tissueType]);


    return (
        <div className="w-full flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:w-2/3">
                <div 
                    ref={dishRef}
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
                     {feedbackMessage && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-pop-in z-10 rounded-2xl">
                            <div className="bg-white text-slate-800 p-6 rounded-2xl shadow-xl max-w-md text-center">
                                <h4 className="text-2xl font-bold font-display text-green-600 mb-2">{feedbackMessage.title}</h4>
                                <p className="text-lg">{feedbackMessage.description}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="w-full md:w-1/3 p-4 rounded-2xl shadow-lg" style={{ backgroundColor: 'var(--panel-bg)'}}>
                <h3 className="text-2xl font-bold font-display text-center mb-4">{title}</h3>
                <p className="text-center mb-4">Drag or click {CELL_BUILD_REQUIREMENT} cells to form a tissue.</p>
                <div className="flex justify-center items-center gap-4 flex-wrap p-4 bg-black/10 rounded-xl">
                    {cellTypes.map(type => (
                        <DraggableCell key={type} type={type} onDragStart={setDraggedCell} onClick={handleClickToAddCell} />
                    ))}
                </div>
                <div className="mt-4">
                    <div className="w-full bg-gray-200/50 rounded-full h-6 shadow-inner">
                        <div
                            className="bg-green-500 h-6 rounded-full text-center text-white font-bold transition-all duration-500"
                            style={{ width: `${(cells.length / CELL_BUILD_REQUIREMENT) * 100}%` }}
                        >
                            {cells.length}/{CELL_BUILD_REQUIREMENT}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ArteryAssembler: React.FC<{ builtTissues: TissueType[], onComplete: () => void }> = ({ builtTissues, onComplete }) => {
    const [placedTissues, setPlacedTissues] = useState<DroppableArea[]>([]);
    const [draggedTissue, setDraggedTissue] = useState<TissueType | null>(null);

    const placeTissue = (tissueType: TissueType) => {
        if (!placedTissues.includes(tissueType)) {
            setPlacedTissues(prev => [...prev, tissueType]);
        }
    };
    
    const handleDrop = (area: DroppableArea) => {
        if (draggedTissue && area === draggedTissue) {
            placeTissue(draggedTissue);
        }
        setDraggedTissue(null);
    };

    const handleClickToPlaceTissue = (tissueType: TissueType) => {
        placeTissue(tissueType);
    };
    
    useEffect(() => {
        if (placedTissues.includes('blood') && placedTissues.includes('epithelial') && placedTissues.includes('muscle')) {
            setTimeout(onComplete, 1500);
        }
    }, [placedTissues, onComplete]);

    const isEpithelialPlaced = placedTissues.includes('epithelial');
    const isMusclePlaced = placedTissues.includes('muscle');
    const isBloodPlaced = placedTissues.includes('blood');

    return (
        <div className="w-full flex flex-col items-center gap-8">
            <h2 className="text-3xl font-bold font-display">Assemble the Artery</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full">
                {/* 3D View */}
                <div className="w-full md:w-2/3 h-[400px]" style={{ perspective: '1200px' }}>
                     <style>{`
                        @keyframes artery-pulse {
                            0%, 100% { transform: scale(1); }
                            50% { transform: scale(1.03); }
                        }
                        @keyframes flow-pulse {
                            0% { left: -15%; transform: translateY(2px) scale(0.95); }
                            25% { transform: translateY(-2px) scale(1.05); }
                            50% { transform: translateY(3px) scale(0.9); }
                            75% { transform: translateY(-3px) scale(1.1); }
                            100% { left: 115%; transform: translateY(2px) scale(0.95); }
                        }
                    `}</style>
                    <div className="relative w-full h-full animate-[artery-pulse_1.2s_ease-in-out_infinite]" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-25deg) rotateY(30deg)' }}>
                        {/* Muscle Layer (Outer) */}
                        <div
                            onDrop={() => handleDrop('muscle')} onDragOver={e => e.preventDefault()}
                            className={`absolute inset-0 rounded-full border-[60px] transition-all duration-500 
                                ${isMusclePlaced ? 'border-pink-300' : 'border-pink-300/30'}
                                ${draggedTissue === 'muscle' && !isMusclePlaced ? '!border-orange-400 scale-105 shadow-2xl animate-pulse' : ''}
                                ${draggedTissue && draggedTissue !== 'muscle' ? 'scale-90 opacity-50' : ''}`}
                            style={{
                                transform: 'translateZ(-60px)',
                                backgroundImage: isMusclePlaced 
                                    ? `linear-gradient(to right, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.3) 100%), url(${ASSETS['muscle-tissue']})` 
                                    : 'none',
                                backgroundSize: '200px',
                                // Enhanced inner shadow for more depth and realism
                                boxShadow: 'inset 0 0 40px 10px rgba(0,0,0,0.6), 0 15px 25px rgba(0,0,0,0.3)',
                            }}
                        />
                        {/* Epithelial Layer (Inner lining) */}
                        <div
                            onDrop={() => handleDrop('epithelial')} onDragOver={e => e.preventDefault()}
                            className={`absolute inset-[55px] rounded-full border-[20px] transition-all duration-500 
                                ${isEpithelialPlaced ? 'border-red-200' : 'border-red-200/50'}
                                ${draggedTissue === 'epithelial' && !isEpithelialPlaced ? '!border-orange-400 scale-105 shadow-2xl animate-pulse' : ''}
                                ${draggedTissue && draggedTissue !== 'epithelial' ? 'scale-90 opacity-50' : ''}`}
                             style={{
                                transform: 'translateZ(0px)',
                                backgroundImage: isEpithelialPlaced ? `url(${ASSETS['epithelial-tissue']})` : 'none',
                                backgroundSize: '150px',
                                // Sharper inner shadow to define the edge against the lumen
                                boxShadow: 'inset 0 0 20px 5px rgba(50,0,0,0.5)',
                            }}
                        />
                         {/* Lumen (Blood flow area) */}
                        <div
                            onDrop={() => handleDrop('blood')} onDragOver={e => e.preventDefault()}
                            className={`absolute inset-[70px] rounded-full transition-all duration-500 overflow-hidden
                                ${draggedTissue === 'blood' && !isBloodPlaced ? 'scale-105 animate-pulse' : ''}
                                ${draggedTissue && draggedTissue !== 'blood' ? 'scale-90 opacity-50' : ''}`}
                             style={{ 
                                transform: 'translateZ(10px)',
                                // Use a radial gradient for a realistic tube effect
                                background: isBloodPlaced ? 'radial-gradient(circle, rgba(120,0,0,0.8) 0%, rgba(50,0,0,1) 100%)' : 'rgba(120,0,0,0.3)',
                                // Deeper shadow for a more convincing tube opening
                                boxShadow: 'inset 0 0 35px 15px rgba(0,0,0,0.85)',
                            }}
                        >
                            {isBloodPlaced && (
                                <div className="absolute inset-0 overflow-hidden rounded-full animate-pop-in">
                                    <AnimatedBloodCell type="rbc" /><AnimatedBloodCell type="rbc" /><AnimatedBloodCell type="rbc" />
                                    <AnimatedBloodCell type="wbc" /><AnimatedBloodCell type="platelet" /><AnimatedBloodCell type="rbc" />
                                     <AnimatedBloodCell type="rbc" /><AnimatedBloodCell type="rbc" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Tissue Source */}
                <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
                     {builtTissues.map(tissue => (
                        <DraggableTissue 
                            key={tissue} 
                            type={tissue} 
                            onDragStart={setDraggedTissue} 
                            onDragEnd={() => setDraggedTissue(null)}
                            onClick={handleClickToPlaceTissue}
                            isPlaced={placedTissues.includes(tissue)}
                        />
                     ))}
                </div>
            </div>
        </div>
    );
};

const FinalSimulation: React.FC<{ onRestart: () => void }> = ({ onRestart }) => (
    <div className="text-center animate-pop-in">
        <h2 className="text-4xl md:text-6xl font-black text-green-600 tracking-tight font-display">Congratulations!</h2>
        <p className="mt-4 text-lg sm:text-xl max-w-3xl mx-auto">
            You've built a functioning artery! You've seen how simple cells combine to form complex tissues, which then work together to create organs that keep our bodies running.
        </p>
        <div className="text-6xl my-8">🎉🔬❤️</div>
        <button onClick={onRestart} className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-2xl py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all border-b-4 border-indigo-700 active:border-b-2">
            Play Again
        </button>
    </div>
);


export const StemConnection: React.FC = () => {
    const [stage, setStage] = useState<Stage>('intro');
    const [builtTissues, setBuiltTissues] = useState<TissueType[]>([]);

    const handleTissueComplete = (tissue: TissueType) => {
        if (!builtTissues.includes(tissue)) {
            setBuiltTissues(prev => [...prev, tissue]);
        }
        
        switch (stage) {
            case 'build_epithelial':
                setStage('build_blood');
                break;
            case 'build_blood':
                setStage('build_muscle');
                break;
            case 'build_muscle':
                setStage('assemble_artery');
                break;
        }
    };
    
    const restart = () => {
      setStage('intro');
      setBuiltTissues([]);
    }

    const renderContent = () => {
        switch (stage) {
            case 'intro':
                return <IntroScreen onStart={() => setStage('build_epithelial')} />;
            case 'build_epithelial':
                return <TissueBuilder title="Build Epithelial Tissue" cellTypes={['epithelial']} onComplete={() => handleTissueComplete('epithelial')} />;
            case 'build_blood':
                return <TissueBuilder title="Build Blood Tissue" cellTypes={['rbc', 'wbc', 'platelet']} onComplete={() => handleTissueComplete('blood')} />;
            case 'build_muscle':
                return <TissueBuilder title="Build Muscle Tissue" cellTypes={['muscle']} onComplete={() => handleTissueComplete('muscle')} />;
            case 'assemble_artery':
                return <ArteryAssembler builtTissues={builtTissues} onComplete={() => setStage('final_simulation')} />;
            case 'final_simulation':
                return <FinalSimulation onRestart={restart} />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4 rounded-2xl shadow-xl flex items-center justify-center min-h-[70vh]" style={{ backgroundColor: 'var(--backdrop-bg)'}}>
            {renderContent()}
        </div>
    );
};
