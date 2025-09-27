import React, { useState, useEffect, useCallback, useId, useMemo } from 'react';

type Stage = 'build' | 'assemble' | 'complete';
type TissueType = 'endothelium' | 'muscle';
type Cell = { id: string; state: 'visible' | 'regrouping' | 'forming'; top: string; left: string; };

const TISSUE_BUILD_REQUIREMENT = 10;

// --- Helper Components for Visuals ---

const EndothelialCell: React.FC<{ draggable?: boolean; onDragStart?: (type: TissueType) => void; }> = ({ draggable, onDragStart }) => (
    <img
      src="/assets/endothelial-cell.png"
      alt="Endothelial Cell"
      draggable={draggable}
      onDragStart={() => onDragStart?.('endothelium')}
      className={`w-12 h-12 object-contain ${draggable ? 'cursor-grab' : ''}`}
    />
);

const MuscleCell: React.FC<{ draggable?: boolean; onDragStart?: (type: TissueType) => void; }> = ({ draggable, onDragStart }) => (
    <img
      src="/assets/muscle-cell.png"
      alt="Muscle Cell"
      draggable={draggable}
      onDragStart={() => onDragStart?.('muscle')}
      className={`w-16 h-8 object-contain ${draggable ? 'cursor-grab' : ''}`}
    />
);

const BloodCell: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div className="absolute w-8 h-8 rounded-full shadow-lg" style={{
        ...style,
        background: 'radial-gradient(circle at 30% 30%, #ff8a8a, #d32f2f)',
        border: '1px solid #b71c1c'
    }}>
    </div>
);


const TissueBlock: React.FC<{ type: TissueType; isDraggable: boolean; onDragStart: (type: TissueType) => void; }> = ({ type, isDraggable, onDragStart }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('tissueType', type);
    onDragStart(type);
  };

  if (type === 'endothelium') {
    return (
      <div draggable={isDraggable} onDragStart={isDraggable ? handleDragStart : undefined} className={`p-2 rounded-lg bg-white/30 cursor-grab ${isDraggable ? '' : 'cursor-not-allowed'}`}>
        <img src="/assets/epithelial-tissue.png" alt="Endothelium Tissue" className="w-32 h-auto rounded" />
        <p className="font-bold text-center text-white mt-1">Endothelium</p>
      </div>
    );
  } else {
    return (
      <div draggable={isDraggable} onDragStart={isDraggable ? handleDragStart : undefined} className={`p-2 rounded-lg bg-white/30 cursor-grab flex flex-col items-center gap-1 ${isDraggable ? '' : 'cursor-not-allowed'}`}>
        <div className="relative w-24 h-16">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="absolute" style={{ top: `${i * 12}px`, left: `${(i % 2) * 10}px` }}>
                    <MuscleCell />
                </div>
            ))}
        </div>
        <p className="font-bold text-center text-white mt-1">Smooth Muscle</p>
      </div>
    );
  }
};


// --- Main Stem Connection Component ---

export const StemConnection: React.FC = () => {
  const [stage, setStage] = useState<Stage>('build');
  const baseId = useId();

  // Build Stage State
  const [endothelialCells, setEndothelialCells] = useState<Cell[]>([]);
  const [muscleCells, setMuscleCells] = useState<Cell[]>([]);
  const [builtTissues, setBuiltTissues] = useState({ endothelium: false, muscle: false });
  const [draggedCell, setDraggedCell] = useState<TissueType | null>(null);

  // Assemble Stage State
  const [placedTissues, setPlacedTissues] = useState({ endothelium: false, muscle: false });
  const [draggedTissue, setDraggedTissue] = useState<TissueType | null>(null);
  const [dropFeedback, setDropFeedback] = useState<{ type: 'success' | 'error'; tissue: TissueType } | null>(null);

  const addCell = (type: TissueType, targetElement: HTMLElement) => {
    const rect = targetElement.getBoundingClientRect();
    const newCell: Cell = {
      id: `${baseId}-${type}-${Date.now()}`,
      state: 'forming',
      top: `${Math.random() * (rect.height - 48)}px`, // 48px is h-12 for endothelial cell
      left: `${Math.random() * (rect.width - 64)}px`, // 64px is w-16 for muscle cell
    };
    if (type === 'endothelium') {
      setEndothelialCells(prev => [...prev, newCell]);
    } else {
      setMuscleCells(prev => [...prev, newCell]);
    }
  };

  const handleCellDragStart = (type: TissueType) => {
    setDraggedCell(type);
  };

  const handleDropOnBuildArea = (e: React.DragEvent<HTMLDivElement>, targetType: TissueType) => {
    e.preventDefault();
    const currentCellList = targetType === 'endothelium' ? endothelialCells : muscleCells;
    const visibleCells = currentCellList.filter(c => c.state !== 'regrouping');

    if (draggedCell === targetType && visibleCells.length < TISSUE_BUILD_REQUIREMENT) {
      addCell(targetType, e.currentTarget);
    }
    setDraggedCell(null);
  };

  const handleDragOverBuildArea = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };


  const checkAndRegroup = useCallback((type: TissueType) => {
    const cellList = type === 'endothelium' ? endothelialCells : muscleCells;
    const setCellList = type === 'endothelium' ? setEndothelialCells : setMuscleCells;

    const visibleCells = cellList.filter(c => c.state === 'visible');
    if (visibleCells.length >= TISSUE_BUILD_REQUIREMENT) {
      setCellList(prev => prev.map(cell => visibleCells.slice(0, TISSUE_BUILD_REQUIREMENT).map(c => c.id).includes(cell.id) ? { ...cell, state: 'regrouping' } : cell));
      
      setTimeout(() => {
        setCellList([]);
        setBuiltTissues(prev => ({ ...prev, [type]: true }));
      }, 700);
    }
  }, [endothelialCells, muscleCells]);
  
  useEffect(() => {
    if (builtTissues.endothelium === false) checkAndRegroup('endothelium');
    if (builtTissues.muscle === false) checkAndRegroup('muscle');
  }, [endothelialCells, muscleCells, builtTissues, checkAndRegroup]);

  useEffect(() => {
      const timer = setTimeout(() => {
          setEndothelialCells(prev => prev.map(c => c.state === 'forming' ? {...c, state: 'visible'} : c));
          setMuscleCells(prev => prev.map(c => c.state === 'forming' ? {...c, state: 'visible'} : c));
      }, 500);
      return () => clearTimeout(timer);
  }, [endothelialCells, muscleCells]);

  useEffect(() => {
    if (placedTissues.endothelium && placedTissues.muscle) {
      setTimeout(() => setStage('complete'), 1000);
    }
  }, [placedTissues]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetType: TissueType) => {
    e.preventDefault();
    const droppedType = e.dataTransfer.getData('tissueType') as TissueType;
    if (droppedType === targetType) {
      setPlacedTissues(prev => ({ ...prev, [targetType]: true }));
      setDropFeedback({ type: 'success', tissue: targetType });
    } else {
      setDropFeedback({ type: 'error', tissue: targetType });
    }
    setDraggedTissue(null);
    setTimeout(() => setDropFeedback(null), 1000);
  };
  
  const bloodCells = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      style: {
          top: `${Math.random() * 80 + 10}%`,
          animation: `flow ${Math.random() * 3 + 2}s linear ${Math.random() * 3}s infinite`,
      }
  })), []);


  return (
    <div className="flex-grow w-full flex flex-col items-center justify-start p-2 sm:p-4 text-center animate-pop-in">
        <style>{`
            @keyframes flow {
                0% { left: -10%; }
                100% { left: 110%; }
            }
        `}</style>
        <div className="backdrop-blur-sm border p-4 sm:p-6 rounded-3xl shadow-xl w-full max-w-7xl" style={{ backgroundColor: 'var(--backdrop-bg)', borderColor: 'var(--border-primary)'}}>
            <h1 className="text-4xl md:text-6xl font-black text-indigo-700 tracking-tight font-display">
                Build an Artery!
            </h1>
            <p className="mt-2 text-lg sm:text-xl max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)'}}>
                {stage === 'build' && "First, build the tissues. Drag and drop 10 cells of each type into the correct build area."}
                {stage === 'assemble' && "Great job! Now drag your completed tissues to the correct layers on the artery diagram."}
                {stage === 'complete' && "Excellent! You've built a functional artery. Watch the blood cells flow through."}
            </p>
        </div>

        {stage === 'build' && (
            <>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-7xl">
                {(['endothelium', 'muscle'] as TissueType[]).map(type => {
                    const cells = type === 'endothelium' ? endothelialCells : muscleCells;
                    const isBuilt = builtTissues[type];
                    const isDraggingOver = draggedCell === type;
                    return (
                        <div 
                            key={type}
                            onDrop={(e) => handleDropOnBuildArea(e, type)}
                            onDragOver={handleDragOverBuildArea}
                            className={`flex flex-col rounded-2xl shadow-xl transition-all duration-300 ${isDraggingOver ? 'ring-4 ring-orange-400 scale-105' : 'ring-0'}`} 
                            style={{ backgroundColor: `var(--col-${type === 'endothelium' ? 'blue' : 'green'}-bg)` }}>
                            <div className="p-3 border-b-4 text-center" style={{ borderColor: `var(--col-${type === 'endothelium' ? 'blue' : 'green'}-border)` }}>
                                <h2 className="font-display text-2xl font-black capitalize" style={{ color: `var(--col-${type === 'endothelium' ? 'blue' : 'green'}-text)` }}>{type} Build Area</h2>
                            </div>
                            <div className="flex-grow min-h-[250px] p-2 relative">
                                <div className="absolute -top-2 right-2 text-white text-3xl font-black rounded-full h-14 w-14 flex items-center justify-center border-4 border-white/80 shadow-lg font-display" style={{ backgroundColor: `var(--col-${type === 'endothelium' ? 'blue' : 'green'}-border)` }}>
                                    {isBuilt ? '✓' : cells.filter(c => c.state !== 'regrouping').length}
                                </div>
                                {isBuilt ? (
                                    <div className="w-full h-full flex items-center justify-center animate-bouncy-pop-in">
                                        <p className="text-3xl font-bold font-display" style={{ color: `var(--col-${type === 'endothelium' ? 'blue' : 'green'}-text)` }}>Tissue Built!</p>
                                    </div>
                                ) : cells.map(cell => (
                                    // Fix: Cast the style object to React.CSSProperties to allow CSS custom properties.
                                    <div key={cell.id} className="absolute pointer-events-none" style={{ top: cell.top, left: cell.left, '--target-top': cell.top, '--target-left': cell.left } as React.CSSProperties}>
                                        <div className={cell.state === 'regrouping' ? 'animate-regroup-to-center' : cell.state === 'forming' ? 'animate-form-from-center opacity-0' : 'animate-bouncy-pop-in animate-cell-pulse'}>
                                            {type === 'endothelium' ? <EndothelialCell /> : <MuscleCell />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {(!builtTissues.endothelium || !builtTissues.muscle) ? (
                <div className="mt-6 flex justify-center items-end gap-12 p-4 rounded-2xl w-full max-w-lg" style={{ backgroundColor: 'var(--panel-bg)'}}>
                    {!builtTissues.endothelium && (
                        <div className="flex flex-col items-center">
                            <EndothelialCell draggable onDragStart={handleCellDragStart} />
                            <p className="font-bold mt-1 text-sm" style={{color: 'var(--text-secondary)'}}>Drag to Build</p>
                        </div>
                    )}
                    {!builtTissues.muscle && (
                        <div className="flex flex-col items-center">
                            <MuscleCell draggable onDragStart={handleCellDragStart} />
                            <p className="font-bold mt-1 text-sm" style={{color: 'var(--text-secondary)'}}>Drag to Build</p>
                        </div>
                    )}
                </div>
            ) : null}

            {builtTissues.endothelium && builtTissues.muscle && (
                 <button onClick={() => setStage('assemble')} className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold text-2xl py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all border-b-4 border-orange-700 active:border-b-2 animate-guide-pulse">
                    Proceed to Assembly
                </button>
            )}
            </>
        )}

        {stage === 'assemble' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-7xl items-center">
                <div className="md:col-span-1 flex flex-col items-center justify-center gap-4 p-4 rounded-2xl h-full" style={{ backgroundColor: 'var(--panel-bg)'}}>
                    <h3 className="font-bold text-2xl font-display" style={{ color: 'var(--text-accent)'}}>Your Tissues</h3>
                    {!placedTissues.endothelium && <TissueBlock type="endothelium" isDraggable={true} onDragStart={setDraggedTissue} />}
                    {!placedTissues.muscle && <TissueBlock type="muscle" isDraggable={true} onDragStart={setDraggedTissue} />}
                </div>
                <div className="md:col-span-2 relative w-full aspect-square max-w-xl mx-auto flex items-center justify-center">
                    {/* Layer 1: Outer Coat (Tunica Adventitia) - The outermost layer */}
                    <div className="absolute inset-0 bg-amber-100 rounded-full border-8 border-amber-200 shadow-inner" />
                    
                    {/* Layer 2: Smooth Muscle (Tunica Media) - The middle layer and drop zone */}
                    <div onDrop={(e) => handleDrop(e, 'muscle')} onDragOver={(e) => e.preventDefault()} 
                         className={`absolute inset-[15%] rounded-full transition-all duration-300 border-4 border-dashed 
                                    ${draggedTissue === 'muscle' ? 'scale-105 bg-red-300/50' : 'bg-transparent'}
                                    ${placedTissues.muscle ? 'border-red-600' : 'border-red-500'}`}>
                        {/* This div shows the placed muscle tissue */}
                        <div className={`absolute inset-0 rounded-full bg-red-500 transition-opacity duration-500 ${placedTissues.muscle ? 'opacity-100' : 'opacity-0'}`} 
                             style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(185, 28, 28, 0.5) 10px, rgba(185, 28, 28, 0.5) 20px)'}} />
                        {dropFeedback?.tissue === 'muscle' && <div className={`absolute inset-0 rounded-full animate-ping ${dropFeedback.type === 'success' ? 'bg-green-400' : 'bg-red-500'}`} />}
                    </div>

                    {/* Layer 3: Endothelium (Tunica Intima) - The innermost layer and drop zone */}
                    <div onDrop={(e) => handleDrop(e, 'endothelium')} onDragOver={(e) => e.preventDefault()} 
                         className={`absolute inset-[40%] rounded-full transition-all duration-300 border-4 border-dashed overflow-hidden
                                    ${draggedTissue === 'endothelium' ? 'scale-105 bg-pink-300/50' : 'bg-transparent'}
                                    ${placedTissues.endothelium ? 'border-pink-600' : 'border-pink-500'}`}>
                        {/* This image shows the placed endothelium tissue */}
                         {placedTissues.endothelium && 
                            <img src="/assets/epithelial-tissue.png" className={`w-full h-full object-cover rounded-full transition-opacity duration-500`} alt="Endothelium layer" />
                         }
                        {dropFeedback?.tissue === 'endothelium' && <div className={`absolute inset-0 rounded-full animate-ping ${dropFeedback.type === 'success' ? 'bg-green-400' : 'bg-red-500'}`} />}
                    </div>

                    {/* Center: Lumen (the central cavity) */}
                    <div className="absolute inset-[48%] rounded-full bg-red-900 shadow-inner" />

                    {/* Labels to guide the user */}
                    <div className="absolute text-center pointer-events-none">
                        {!placedTissues.muscle && <p className="font-bold text-white text-xl -translate-y-24 bg-black/50 rounded p-1">Drop Smooth Muscle Here</p>}
                        {!placedTissues.endothelium && <p className="font-bold text-white text-xl translate-y-2 bg-black/50 rounded p-1">Drop Endothelium Here</p>}
                    </div>
                </div>
            </div>
        )}

        {stage === 'complete' && (
            <div className="mt-4 relative w-full aspect-square max-w-xl mx-auto flex items-center justify-center animate-pop-in">
                {/* Layer 1: Outer Coat */}
                <div className="absolute inset-0 bg-amber-100 rounded-full border-8 border-amber-200 shadow-inner" />
                {/* Layer 2: Smooth Muscle */}
                <div className="absolute inset-[15%] rounded-full bg-red-500" 
                     style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(185, 28, 28, 0.5) 10px, rgba(185, 28, 28, 0.5) 20px)'}} />
                {/* Layer 3: Endothelium */}
                <div className="absolute inset-[40%] rounded-full">
                    <img src="/assets/epithelial-tissue.png" className="w-full h-full object-cover rounded-full" alt="Endothelium layer" />
                </div>
                {/* Lumen with flowing blood cells */}
                <div className="absolute inset-[48%] rounded-full bg-red-900 shadow-inner overflow-hidden">
                    {bloodCells.map(cell => <BloodCell key={cell.id} style={cell.style} />)}
                </div>
                {/* Labels for the completed view */}
                <div className="absolute inset-0 pointer-events-none text-white font-bold text-sm">
                    <div className="absolute top-[5%] left-1/2 -translate-x-1/2 p-1 bg-black/50 rounded">Outer Coat</div>
                    <div className="absolute top-1/2 left-[5%] -translate-y-1/2 p-1 bg-black/50 rounded">Smooth Muscle</div>
                    <div className="absolute top-[60%] left-[30%] p-1 bg-black/50 rounded">Endothelium</div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 bg-black/50 rounded">Lumen</div>
                </div>
            </div>
        )}

    </div>
  );
};