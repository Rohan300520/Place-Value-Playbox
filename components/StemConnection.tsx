import React, { useState, useEffect, useCallback, useId, useRef, useMemo } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { speak } from '../utils/speech';
import { Confetti } from './Confetti';


// --- TYPES ---
type Stage = 'intro' | 'build_epithelial' | 'build_blood' | 'build_muscle' | 'assemble_artery' | 'complete';
type CellType = 'epithelial' | 'rbc' | 'wbc' | 'platelet' | 'muscle';
type TissueType = 'epithelial' | 'blood' | 'muscle';

interface Cell {
  id: string;
  type: CellType;
  style: React.CSSProperties;
  state: 'source' | 'placed' | 'regrouping';
}

// --- CONFIGURATION ---
const ASSET_PATHS = {
  // Cells (for UI)
  'epithelial': '/assets/endothelial-cell.webp',
  'rbc': '/assets/rbc.webp',
  'wbc': '/assets/wbc.webp',
  'platelet': '/assets/platelet.webp',
  'muscle': '/assets/muscle-cell.webp',
  // Tissues (for UI)
  'epithelial-tissue': '/assets/epithelial-tissue.webp',
  'muscle-tissue': '/assets/muscle-tissue-fibrous.jpeg',
  'blood-tissue': '/assets/blood-tissue-animated.png',
  // New assets for 2D Artery
  'artery-outline': '/assets/artery-outline.png',
  'artery-layer-muscle': '/assets/artery-layer-muscle.png',
  'artery-layer-epithelial': '/assets/artery-layer-epithelial.png',
  'artery-layer-blood': '/assets/artery-layer-blood.png',
  'artery-background': '/assets/human-torso.webp',
};

const ASSET_INFO = {
  'epithelial': { name: 'Epithelial Cell' },
  'rbc': { name: 'Red Blood Cell' },
  'wbc': { name: 'White Blood Cell' },
  'platelet': { name: 'Platelet' },
  'muscle': { name: 'Muscle Cell' },
  'epithelial-tissue': { name: 'Epithelial Tissue' },
  'muscle-tissue': { name: 'Muscle Tissue' },
  'blood-tissue': { name: 'Blood Tissue' },
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
        <div
          draggable
          onDragStart={() => onDragStart(type)}
          className="w-16 h-16 rounded-full cursor-grab transition-transform hover:scale-110 shadow-md bg-cover bg-center"
          style={{ backgroundImage: `url(${ASSET_PATHS[type]})` }}
          aria-label={ASSET_INFO[type].name}
        />
        <span className="font-semibold capitalize text-sm">{ASSET_INFO[type].name}</span>
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
            <div 
                className="w-28 h-28 rounded-lg shadow-lg bg-cover bg-center" 
                style={{ backgroundImage: `url(${ASSET_PATHS[`${type}-tissue`]})` }}
                aria-label={ASSET_INFO[`${type}-tissue`].name}
            />
            <span className="font-bold capitalize text-lg">{ASSET_INFO[`${type}-tissue`].name}</span>
        </div>
    );
}

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
    const { isSpeechEnabled } = useAudio();
    const [cells, setCells] = useState<Cell[]>([]);
    const [draggedCell, setDraggedCell] = useState<CellType | null>(null);
    const [isRegrouping, setIsRegrouping] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<{ title: string; description: string } | null>(null);
    const [validationMessage, setValidationMessage] = useState<string | null>(null);
    const baseId = useId();
    const tissueType = title.split(' ')[1].toLowerCase() as TissueType;
    const dishRef = useRef<HTMLDivElement>(null);

    const buildRequirement = tissueType === 'blood' ? 9 : 8;

    const cellCounts = useMemo(() => {
        return cells.reduce((acc, cell) => {
            acc[cell.type] = (acc[cell.type] || 0) + 1;
            return acc;
        }, {} as Record<CellType, number>);
    }, [cells]);

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
        if (draggedCell && cellTypes.includes(draggedCell)) {
            if (tissueType === 'blood' && (cellCounts[draggedCell] || 0) >= 3) {
                setDraggedCell(null);
                return; // Prevent adding more than 3 of one type
            }
            if (cells.length < buildRequirement) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                addCell(draggedCell, x, y);
            }
        }
        setDraggedCell(null);
    };

    const handleClickToAddCell = (type: CellType) => {
      if (cellTypes.includes(type)) {
          if (tissueType === 'blood' && (cellCounts[type] || 0) >= 3) {
              return; // Prevent adding more than 3 of one type
          }
          if (cells.length < buildRequirement) {
              const rect = dishRef.current?.getBoundingClientRect() || { width: 500, height: 400, left: 0, top: 0 };
              const radius = Math.min(rect.width, rect.height) / 3.5; 
              const angle = (cells.length / (buildRequirement - 1)) * 2 * Math.PI;
              const x = rect.width / 2 + radius * Math.cos(angle);
              const y = rect.height / 2 + radius * Math.sin(angle);
              addCell(type, x, y);
          }
      }
    };

    useEffect(() => {
        if (tissueType === 'blood') {
            const requiredCounts = { rbc: 3, wbc: 3, platelet: 3 };
            const needed: string[] = [];
            
            const rbcNeeded = requiredCounts.rbc - (cellCounts.rbc || 0);
            if (rbcNeeded > 0) needed.push(`${rbcNeeded} Red Blood Cell${rbcNeeded > 1 ? 's' : ''}`);

            const wbcNeeded = requiredCounts.wbc - (cellCounts.wbc || 0);
            if (wbcNeeded > 0) needed.push(`${wbcNeeded} White Blood Cell${wbcNeeded > 1 ? 's' : ''}`);

            const plateletNeeded = requiredCounts.platelet - (cellCounts.platelet || 0);
            if (plateletNeeded > 0) needed.push(`${plateletNeeded} Platelet${plateletNeeded > 1 ? 's' : ''}`);

            if (needed.length > 0 && cells.length < buildRequirement) {
                setValidationMessage(`Keep going! You still need: ${needed.join(', ')}.`);
            } else {
                 setValidationMessage(null);
            }
        } else {
            setValidationMessage(null);
        }
    }, [cells, cellCounts, tissueType, buildRequirement]);

    useEffect(() => {
        if (isRegrouping) {
            return;
        }

        let canComplete = false;
        if (tissueType === 'blood') {
            if (cellCounts.rbc === 3 && cellCounts.wbc === 3 && cellCounts.platelet === 3) {
                canComplete = true;
            }
        } else {
            if (cells.length >= buildRequirement) {
                canComplete = true;
            }
        }

        if (canComplete) {
            setIsRegrouping(true);
            let title = '';
            let description = '';

            if (tissueType === 'epithelial') {
                title = "Epithelial Cells form Epithelial Tissue!";
                description = "Great job! These cells create linings for organs, just like the inside of our artery.";
            } else if (tissueType === 'blood') {
                title = "Blood Cells form Blood Tissue!";
                description = "Awesome! This is a special blood fluid tissue that carries nutrients and oxygen all over your body.";
            } else if (tissueType === 'muscle') {
                title = "Muscle Cells form Muscle Tissue!";
                description = "Fantastic! These strong cells help the artery pump blood by squeezing and relaxing.";
            }
            setFeedbackMessage({ title, description });
            
            if (isSpeechEnabled) speak(`${title} ${description}`, 'en-US');
            
            setTimeout(() => setCells(prev => prev.map(c => ({...c, state: 'regrouping'}))), 500);
            
            setTimeout(() => {
                onComplete();
                setFeedbackMessage(null);
            }, 4000);
        }
    }, [cells, cellCounts, onComplete, isRegrouping, tissueType, isSpeechEnabled, cellTypes, buildRequirement]);

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
                         <div className="w-full h-full flex flex-col items-center justify-center gap-4 animate-bouncy-pop-in">
                            <div 
                                className="w-64 h-64 rounded-lg shadow-2xl bg-cover bg-center" 
                                style={{ backgroundImage: `url(${ASSET_PATHS[`${tissueType}-tissue`]})` }}
                                aria-label={ASSET_INFO[`${tissueType}-tissue`].name}
                            />
                            {feedbackMessage && (
                                <div className="bg-white text-slate-800 p-4 rounded-2xl shadow-xl max-w-md text-center animate-pop-in mt-4">
                                    <h4 className="text-xl font-bold font-display text-green-600 mb-1">{feedbackMessage.title}</h4>
                                    <p className="text-base">{feedbackMessage.description}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        cells.map(cell => (
                            <div
                                key={cell.id}
                                className={`w-16 h-16 rounded-full pointer-events-none shadow-sm bg-cover bg-center ${cell.state === 'regrouping' ? 'animate-regroup-to-center' : 'animate-form-from-center opacity-0'}`}
                                style={{ ...cell.style, backgroundImage: `url(${ASSET_PATHS[cell.type]})` }}
                            />
                        ))
                    )}
                </div>
            </div>
            <div className="w-full md:w-1/3 p-4 rounded-2xl shadow-lg" style={{ backgroundColor: 'var(--panel-bg)'}}>
                <h3 className="text-2xl font-bold font-display text-center mb-4">{title}</h3>
                <p className="text-center mb-4">Drag or click {buildRequirement} cells to form a tissue.</p>
                <div className="flex justify-center items-center gap-4 flex-wrap p-4 bg-black/10 rounded-xl">
                    {cellTypes.map(type => (
                        <DraggableCell key={type} type={type} onDragStart={setDraggedCell} onClick={handleClickToAddCell} />
                    ))}
                </div>
                <div className="mt-4">
                    <div className="w-full bg-gray-200/50 rounded-full h-6 shadow-inner">
                        <div
                            className="bg-green-500 h-6 rounded-full text-center text-white font-bold transition-all duration-500"
                            style={{ width: `${(cells.length / buildRequirement) * 100}%` }}
                        >
                            {cells.length}/{buildRequirement}
                        </div>
                    </div>
                    {validationMessage && (
                        <p className="mt-2 text-center font-semibold text-orange-600 animate-pulse">
                            {validationMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const ArteryAssembler: React.FC<{ builtTissues: TissueType[], onComplete: () => void }> = ({ builtTissues, onComplete }) => {
    const [placedTissues, setPlacedTissues] = useState<TissueType[]>([]);
    const [draggedTissue, setDraggedTissue] = useState<TissueType | null>(null);
    const [isDropZoneActive, setIsDropZoneActive] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        placeTissue(draggedTissue);
        setIsDropZoneActive(false);
        setDraggedTissue(null);
    };

    const placeTissue = (tissue: TissueType | null) => {
        if (tissue && !placedTissues.includes(tissue)) {
            setPlacedTissues(prev => [...prev, tissue]);
            const tissueName = ASSET_INFO[`${tissue}-tissue`].name;
            setFeedback(`Great! You've added the ${tissueName}.`);
            setTimeout(() => setFeedback(null), 2500);
        }
    };

    const isComplete = useMemo(() => {
        return builtTissues.every(t => placedTissues.includes(t));
    }, [placedTissues, builtTissues]);

    useEffect(() => {
        if (isComplete) {
            const finalMessage = "Congratulations! You built a complete artery that carries blood all over the body!";
            setFeedback(finalMessage);
            setShowConfetti(true);
            setTimeout(onComplete, 4000);
        }
    }, [isComplete, onComplete]);

    return (
        <div className="w-full flex flex-col items-center gap-4">
            {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
            <h2 className="text-3xl font-bold font-display text-center">Assemble the Artery</h2>
            <p className="text-center">Drag the tissues you built to form the artery!</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full mt-4">
                <div 
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDropZoneActive(true); }}
                    onDragLeave={() => setIsDropZoneActive(false)}
                    className="relative w-full max-w-xl h-96 rounded-2xl p-4 transition-all duration-300" 
                    style={{ 
                        backgroundImage: `url(${ASSET_PATHS['artery-background']})`, 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center',
                        border: isDropZoneActive ? '4px dashed #f97316' : '4px dashed transparent'
                    }}
                >
                    <div className="absolute inset-0 w-full h-full pointer-events-none">
                        <img src={ASSET_PATHS['artery-outline']} alt="Artery Outline" className="w-full h-full object-contain opacity-50" />
                        {placedTissues.includes('muscle') && <img src={ASSET_PATHS['artery-layer-muscle']} alt="Muscle Layer" className="absolute inset-0 w-full h-full object-contain animate-pop-in" />}
                        {placedTissues.includes('epithelial') && <img src={ASSET_PATHS['artery-layer-epithelial']} alt="Epithelial Layer" className="absolute inset-0 w-full h-full object-contain animate-pop-in" style={{ animationDelay: '0.1s' }} />}
                        {placedTissues.includes('blood') && <img src={ASSET_PATHS['artery-layer-blood']} alt="Blood Layer" className="absolute inset-0 w-full h-full object-contain animate-pop-in" style={{ animationDelay: '0.2s' }} />}
                    </div>
                </div>
                <div className="flex-shrink-0 flex flex-col gap-4 items-center p-4 bg-black/10 rounded-2xl">
                     <h3 className="font-bold text-lg">Your Tissues</h3>
                     {builtTissues.map(tissue => (
                        <DraggableTissue 
                            key={tissue} 
                            type={tissue} 
                            onDragStart={setDraggedTissue} 
                            onDragEnd={() => setDraggedTissue(null)}
                            onClick={() => placeTissue(tissue)}
                            isPlaced={placedTissues.includes(tissue)}
                        />
                     ))}
                </div>
            </div>
            {feedback && (
                <div className="mt-4 bg-white/90 text-slate-800 p-4 rounded-2xl shadow-xl max-w-md text-center font-bold text-lg animate-pop-in">
                   <p>{feedback}</p>
                </div>
            )}
        </div>
    );
}

const CompletionScreen: React.FC<{ onRestart: () => void }> = ({ onRestart }) => (
    <div className="text-center animate-pop-in flex flex-col items-center">
        <h2 className="text-4xl md:text-6xl font-black text-green-600 tracking-tight font-display">STEM Connection Complete!</h2>
        <p className="mt-4 text-lg sm:text-xl max-w-3xl mx-auto">
            Amazing work! You've seen how tiny cells build tissues, and tissues build organs. Science is all about building blocks!
        </p>
        <button onClick={onRestart} className="mt-8 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-2xl py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all border-b-4 border-indigo-700 active:border-b-2">
            Play Again
        </button>
    </div>
);


// --- MAIN COMPONENT ---
export const StemConnection: React.FC = () => {
    const [stage, setStage] = useState<Stage>('intro');
    const [builtTissues, setBuiltTissues] = useState<TissueType[]>([]);

    const handleTissueComplete = (tissue: TissueType) => {
        setBuiltTissues(prev => [...prev, tissue]);
        if (tissue === 'epithelial') {
            setStage('build_blood');
        } else if (tissue === 'blood') {
            setStage('build_muscle');
        } else if (tissue === 'muscle') {
            setStage('assemble_artery');
        }
    };
    
    const restartModule = () => {
        setStage('intro');
        setBuiltTissues([]);
    }

    const renderStage = () => {
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
                return <ArteryAssembler builtTissues={['epithelial', 'blood', 'muscle']} onComplete={() => setStage('complete')} />;
            case 'complete':
                return <CompletionScreen onRestart={restartModule} />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full max-w-7xl animate-pop-in flex flex-col items-center p-4 sm:p-6 rounded-2xl shadow-xl" style={{ backgroundColor: 'var(--backdrop-bg)'}}>
            {renderStage()}
        </div>
    );
};