import React, { useState, useEffect, useCallback, useId } from 'react';

type Stage = 'build' | 'assemble' | 'complete';
type TissueType = 'endothelium' | 'muscle';
type Cell = { id: string; state: 'visible' | 'regrouping' | 'forming'; top: string; left: string; };

const TISSUE_BUILD_REQUIREMENT = 10;

// --- Helper Components for Visuals ---

const EndothelialCell: React.FC = () => (
  <div className="w-10 h-8 bg-pink-300 border-2 border-pink-500 rounded-md transform -skew-x-12" />
);

const MuscleCell: React.FC = () => (
  <div className="w-16 h-4 bg-red-400 border-2 border-red-600 rounded-full" />
);

const BloodCell: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div className="absolute w-8 h-8 bg-red-500 rounded-full border-2 border-red-800 shadow-inner" style={style}>
        <div className="w-4 h-4 bg-red-400 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
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
        {Array.from({ length: 4 }).map((_, i) => <MuscleCell key={i} />)}
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

  // Assemble Stage State
  const [placedTissues, setPlacedTissues] = useState({ endothelium: false, muscle: false });
  const [draggedTissue, setDraggedTissue] = useState<TissueType | null>(null);
  const [dropFeedback, setDropFeedback] = useState<{ type: 'success' | 'error'; tissue: TissueType } | null>(null);

  const addCell = (type: TissueType) => {
    const newCell: Cell = {
      id: `${baseId}-${type}-${Date.now()}`,
      state: 'forming',
      top: `${Math.random() * 70 + 15}%`,
      left: `${Math.random() * 70 + 15}%`,
    };
    if (type === 'endothelium') {
      setEndothelialCells(prev => [...prev, newCell]);
    } else {
      setMuscleCells(prev => [...prev, newCell]);
    }
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
  
  const bloodCells = React.useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
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
                {stage === 'build' && "First, build the tissues. Add 10 cells of each type to form a tissue layer."}
                {stage === 'assemble' && "Great job! Now drag your completed tissues to the correct layers on the artery diagram."}
                {stage === 'complete' && "Excellent! You've built a functional artery. Watch the blood cells flow through."}
            </p>
        </div>

        {stage === 'build' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-7xl">
                {(['endothelium', 'muscle'] as TissueType[]).map(type => {
                    const cells = type === 'endothelium' ? endothelialCells : muscleCells;
                    const isBuilt = builtTissues[type];
                    return (
                        <div key={type} className={`flex flex-col rounded-2xl shadow-xl`} style={{ backgroundColor: `var(--col-${type === 'endothelium' ? 'blue' : 'green'}-bg)` }}>
                            <div className="p-3 border-b-4 text-center" style={{ borderColor: `var(--col-${type === 'endothelium' ? 'blue' : 'green'}-border)` }}>
                                <h2 className="font-display text-2xl font-black capitalize" style={{ color: `var(--col-${type === 'endothelium' ? 'blue' : 'green'}-text)` }}>{type}</h2>
                                {!isBuilt && <button onClick={() => addCell(type)} className="mt-2 bg-white/50 hover:bg-white/80 font-bold py-1 px-4 rounded-lg border-b-2 border-slate-400">Add Cell</button>}
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
                                    <div key={cell.id} className="absolute" style={{ top: cell.top, left: cell.left, '--target-top': cell.top, '--target-left': cell.left }}>
                                        <div className={cell.state === 'regrouping' ? 'animate-regroup-to-center' : cell.state === 'forming' ? 'animate-form-from-center opacity-0' : 'animate-bouncy-pop-in'}>
                                            {type === 'endothelium' ? <EndothelialCell /> : <MuscleCell />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
        {builtTissues.endothelium && builtTissues.muscle && stage === 'build' && (
             <button onClick={() => setStage('assemble')} className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold text-2xl py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all border-b-4 border-orange-700 active:border-b-2 animate-guide-pulse">
                Proceed to Assembly
            </button>
        )}

        {stage === 'assemble' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-7xl items-center">
                <div className="md:col-span-1 flex flex-col items-center justify-center gap-4 p-4 rounded-2xl h-full" style={{ backgroundColor: 'var(--panel-bg)'}}>
                    <h3 className="font-bold text-2xl font-display" style={{ color: 'var(--text-accent)'}}>Your Tissues</h3>
                    {!placedTissues.endothelium && <TissueBlock type="endothelium" isDraggable={true} onDragStart={setDraggedTissue} />}
                    {!placedTissues.muscle && <TissueBlock type="muscle" isDraggable={true} onDragStart={setDraggedTissue} />}
                </div>
                <div className="md:col-span-2 relative w-full aspect-square max-w-xl mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 bg-gray-600 rounded-full border-8 border-gray-700" />
                    <div onDrop={(e) => handleDrop(e, 'muscle')} onDragOver={(e) => e.preventDefault()} className={`absolute inset-[10%] rounded-full transition-all duration-300 ${placedTissues.muscle ? 'bg-red-400/80 border-red-600' : 'bg-red-300/30 border-red-500'} border-4 border-dashed ${draggedTissue === 'muscle' ? 'scale-105' : ''}`}>
                         {dropFeedback?.tissue === 'muscle' && <div className={`absolute inset-0 rounded-full animate-ping ${dropFeedback.type === 'success' ? 'bg-green-400' : 'bg-red-500'}`} />}
                    </div>
                    <div onDrop={(e) => handleDrop(e, 'endothelium')} onDragOver={(e) => e.preventDefault()} className={`absolute inset-[35%] rounded-full transition-all duration-300 ${placedTissues.endothelium ? 'bg-pink-300/80 border-pink-500' : 'bg-pink-300/30 border-pink-500'} border-4 border-dashed ${draggedTissue === 'endothelium' ? 'scale-105' : ''}`}>
                         {dropFeedback?.tissue === 'endothelium' && <div className={`absolute inset-0 rounded-full animate-ping ${dropFeedback.type === 'success' ? 'bg-green-400' : 'bg-red-500'}`} />}
                    </div>
                    <div className="absolute text-center">
                        {!placedTissues.muscle && <p className="font-bold text-white text-xl -translate-y-16">Smooth Muscle Layer</p>}
                        {!placedTissues.endothelium && <p className="font-bold text-white text-xl translate-y-8">Endothelium Layer</p>}
                    </div>
                </div>
            </div>
        )}

        {stage === 'complete' && (
            <div className="mt-4 relative w-full aspect-square max-w-xl mx-auto flex items-center justify-center animate-pop-in">
                <img src="/assets/artery-cross-section.png" alt="Completed Artery" className="w-full h-full object-contain" />
                <div className="absolute inset-[48%] rounded-full overflow-hidden">
                    {bloodCells.map(cell => <BloodCell key={cell.id} style={cell.style} />)}
                </div>
            </div>
        )}

    </div>
  );
};
