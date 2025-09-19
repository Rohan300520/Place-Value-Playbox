import React, { useState, useEffect, useCallback, useId } from 'react';

// --- SVG Icon Components ---

const CellIcon: React.FC<{ isPulsing?: boolean }> = ({ isPulsing = true }) => (
    <svg viewBox="0 0 100 100" className={`w-12 h-12 ${isPulsing ? 'animate-cell-pulse' : ''}`}>
        <defs>
            <radialGradient id="cellcyto" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fde68a"/>
                <stop offset="100%" stopColor="#f59e0b"/>
            </radialGradient>
            <radialGradient id="cellnucleus" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#c084fc"/>
                <stop offset="100%" stopColor="#9333ea"/>
            </radialGradient>
        </defs>
        <path d="M 95,50 C 95,74.8 74.8,95 50,95 C 25.2,95 5,74.8 5,50 C 5,25.2 25.2,5 50,5 C 74.8,5 95,25.2 95,50 Z" fill="url(#cellcyto)" stroke="#b45309" strokeWidth="2"/>
        <path d="M 68,50 C 68,59.9 59.9,68 50,68 C 40.1,68 32,59.9 32,50 C 32,40.1 40.1,32 50,32 C 59.9,32 68,40.1 68,50 Z" fill="url(#cellnucleus)" stroke="#6b21a8" strokeWidth="1"/>
        <circle cx="50" cy="50" r="5" fill="#581c87"/>
        <ellipse cx="25" cy="35" rx="10" ry="5" fill="#f87171" transform="rotate(-30 25 35)" stroke="#b91c1c" strokeWidth="1"/>
        <ellipse cx="75" cy="65" rx="12" ry="6" fill="#f87171" transform="rotate(20 75 65)" stroke="#b91c1c" strokeWidth="1"/>
        <path d="M 20,60 C 25,70 35,75 40,70" fill="none" stroke="#65a30d" strokeWidth="3" strokeLinecap="round"/>
        <path d="M 70,25 C 75,30 80,40 75,45" fill="none" stroke="#65a30d" strokeWidth="3" strokeLinecap="round"/>
    </svg>
);

const TissueIcon: React.FC = () => (
    <svg viewBox="0 0 100 100" className="w-20 h-20">
        <defs>
            <linearGradient id="tissueGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fca5a5"/>
                <stop offset="100%" stopColor="#f87171"/>
            </linearGradient>
            <radialGradient id="tissueNucleus" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#9f1239"/>
                <stop offset="100%" stopColor="#500724"/>
            </radialGradient>
        </defs>
        <g stroke="#991b1b" strokeWidth="1">
            <path d="M 50 10 L 20 25 L 20 55 L 50 70 L 80 55 L 80 25 Z" fill="url(#tissueGrad)"/>
            <path d="M 50 10 L 35 17 L 35 40 L 50 48 Z" fill="#ef4444"/>
            <circle cx="50" cy="42" r="6" fill="url(#tissueNucleus)"/>

            <path d="M 20 25 L 0 35 L 0 65 L 20 55" fill="url(#tissueGrad)"/>
            <circle cx="12" cy="45" r="5" fill="url(#tissueNucleus)"/>

            <path d="M 80 25 L 100 35 L 100 65 L 80 55" fill="url(#tissueGrad)"/>
            <circle cx="88" cy="45" r="5" fill="url(#tissueNucleus)"/>

            <path d="M 50 70 L 20 85 L 20 95 L 50 80 Z" fill="url(#tissueGrad)"/>
            <circle cx="35" cy="82" r="4" fill="url(#tissueNucleus)"/>
            
            <path d="M 50 70 L 80 85 L 80 95 L 50 80 Z" fill="url(#tissueGrad)"/>
            <circle cx="65" cy="82" r="4" fill="url(#tissueNucleus)"/>
        </g>
    </svg>
);

const OrganIcon: React.FC = () => (
    <svg viewBox="0 0 100 100" className="w-24 h-24">
        <defs>
            <linearGradient id="organGradHeart" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fca5a5"/>
                <stop offset="100%" stopColor="#dc2626"/>
            </linearGradient>
             <linearGradient id="aortaGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#b91c1c" />
                <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
            <linearGradient id="veinGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
        </defs>
        <path d="M50 25 C 20 25, 10 55, 50 95 C 90 55, 80 25, 50 25 Z" fill="url(#organGradHeart)" stroke="#991b1b" strokeWidth="3"/>
        {/* Superior Vena Cava (vein) */}
        <path d="M 60 25 C 60 15, 65 10, 70 10 L 75 10 L 75 30 C 70 30, 65 30, 60 25" fill="url(#veinGrad)" stroke="#1e3a8a" strokeWidth="2" />
        {/* Aorta (artery) */}
        <path d="M 40 25 C 40 10, 20 10, 20 25 S 40 40, 50 30" fill="url(#aortaGrad)" stroke="#7f1d1d" strokeWidth="2" />
        {/* Internal Details */}
        <path d="M 50 40 V 85" stroke="#991b1b" strokeWidth="2" opacity="0.5"/>
        <path d="M 35 60 C 45 50, 55 50, 65 60" fill="none" stroke="#991b1b" strokeWidth="2" opacity="0.6"/>
    </svg>
);

const OrganSystemIcon: React.FC = () => (
     <svg viewBox="0 0 100 100" className="w-28 h-28">
        <defs>
            <linearGradient id="stomachGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fb923c"/>
                <stop offset="100%" stopColor="#ea580c"/>
            </linearGradient>
            <linearGradient id="intestineGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f472b6"/>
                <stop offset="100%" stopColor="#db2777"/>
            </linearGradient>
            <linearGradient id="liverGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7f1d1d"/>
                <stop offset="100%" stopColor="#b91c1c"/>
            </linearGradient>
        </defs>
        
        {/* Liver */}
        <path d="M 30 25 C 60 15, 80 25, 80 45 L 25 45 C 20 35, 25 25, 30 25" fill="url(#liverGrad)" stroke="#450a0a" strokeWidth="2"/>

        {/* Esophagus */}
        <path d="M 45 5 L 45 25" stroke="#f472b6" strokeWidth="6" strokeLinecap="round"/>

        {/* Stomach */}
        <path d="M 45 25 C 30 25, 20 50, 50 50 C 80 50, 75 30, 60 30" fill="url(#stomachGrad)" stroke="#9a3412" strokeWidth="2"/>
        
        {/* Small Intestine */}
        <path d="M 40 55 C 60 55, 65 65, 45 65 C 25 65, 30 75, 50 75 C 70 75, 75 85, 55 85" stroke="url(#intestineGrad)" strokeWidth="5" strokeLinecap="round" fill="none"/>

    </svg>
);

const icons = {
  cell: CellIcon,
  tissue: TissueIcon,
  organ: OrganIcon,
  organSystem: OrganSystemIcon,
};

type BioUnit = 'cell' | 'tissue' | 'organ' | 'organSystem';
interface Item {
  id: string;
  type: BioUnit;
  state: 'visible' | 'regrouping' | 'forming';
  top: string;
  left: string;
}

const HIERARCHY: BioUnit[] = ['cell', 'tissue', 'organ', 'organSystem'];
const PLACE_VALUE_MAP: Record<BioUnit, { name: string; color: 'blue' | 'green' | 'yellow' | 'purple'; plural: string }> = {
  cell: { name: 'Ones', color: 'blue', plural: 'Cells' },
  tissue: { name: 'Tens', color: 'green', plural: 'Tissues' },
  organ: { name: 'Hundreds', color: 'yellow', plural: 'Organs' },
  organSystem: { name: 'Thousands', color: 'purple', plural: 'Organ Systems' },
};


export const StemConnection: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [regroupingMessage, setRegroupingMessage] = useState<string | null>(null);
  const baseId = useId();

  const handleAddItem = (type: BioUnit) => {
    const newItem: Item = {
      id: `${baseId}-${type}-${Date.now()}`,
      type,
      state: 'forming',
      top: `${Math.random() * 60 + 20}%`, // Random position within the column
      left: `${Math.random() * 60 + 20}%`,
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleReset = useCallback(() => {
    setItems([]);
    setRegroupingMessage(null);
  }, []);

  useEffect(() => {
    const checkAndRegroup = (
      sourceType: BioUnit,
      targetType: BioUnit,
    ) => {
      const sourceItems = items.filter(item => item.type === sourceType && item.state === 'visible');
      
      if (sourceItems.length >= 10) {
        setRegroupingMessage(`10 ${PLACE_VALUE_MAP[sourceType].plural} become 1 ${PLACE_VALUE_MAP[targetType].plural.slice(0,-1)}!`);
        
        setItems(prev =>
          prev.map(item =>
            sourceItems.slice(0, 10).map(s => s.id).includes(item.id)
              ? { ...item, state: 'regrouping' }
              : item,
          ),
        );
        
        setTimeout(() => {
          setItems(prev => prev.filter(item => item.state !== 'regrouping'));
          handleAddItem(targetType);
          setRegroupingMessage(null);
        }, 700); 
        
        return true;
      }
      return false;
    };

    for (let i = 0; i < HIERARCHY.length - 1; i++) {
        if (checkAndRegroup(HIERARCHY[i], HIERARCHY[i+1])) {
            break;
        }
    }

  }, [items]);
  
  useEffect(() => {
      const formingItems = items.filter(i => i.state === 'forming');
      if(formingItems.length > 0) {
          setTimeout(() => {
              setItems(prev => prev.map(item => item.state === 'forming' ? {...item, state: 'visible'} : item));
          }, 500);
      }
  }, [items])

  return (
    <div className="flex-grow w-full flex flex-col items-center justify-start p-2 sm:p-4 text-center animate-pop-in">
        <div className="backdrop-blur-sm border p-4 sm:p-6 rounded-3xl shadow-xl w-full max-w-7xl" style={{ backgroundColor: 'var(--backdrop-bg)', borderColor: 'var(--border-primary)'}}>
            <h1 className="text-4xl md:text-6xl font-black text-indigo-700 tracking-tight font-display">
                The Blueprints of Life
            </h1>
            <p className="mt-2 text-lg sm:text-xl max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)'}}>
                Just like with numbers, amazing things are built by grouping smaller pieces into bigger ones. Let's build!
            </p>
            <div className="mt-6 flex justify-center items-center gap-4 flex-wrap">
                <button
                    onClick={() => handleAddItem('cell')}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xl py-3 px-8 rounded-xl shadow-lg shadow-sky-500/40 transform hover:scale-105 transition-all border-b-4 border-sky-700 active:border-b-2 font-display wobble-on-hover"
                >
                    + Add Cell
                </button>
                 <button
                    onClick={() => handleAddItem('tissue')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xl py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/40 transform hover:scale-105 transition-all border-b-4 border-emerald-700 active:border-b-2 font-display wobble-on-hover"
                >
                    + Add Tissue
                </button>
                 <button
                    onClick={() => handleAddItem('organ')}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xl py-3 px-8 rounded-xl shadow-lg shadow-amber-500/40 transform hover:scale-105 transition-all border-b-4 border-amber-700 active:border-b-2 font-display wobble-on-hover"
                >
                    + Add Organ
                </button>
                <button
                  onClick={handleReset}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-red-500/40 transform hover:scale-105 transition-all duration-200 border-b-4 border-red-700 active:border-b-2"
                  aria-label="Reset the builder"
                >
                  Clear All
                </button>
            </div>
            
             {regroupingMessage && (
                <div className="mt-4 text-2xl font-bold text-green-600 font-display animate-tada">
                    {regroupingMessage}
                </div>
            )}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-7xl">
            {HIERARCHY.map(unitType => {
                const config = PLACE_VALUE_MAP[unitType];
                const unitItems = items.filter(item => item.type === unitType);
                const IconComponent = icons[unitType];
                return (
                    <div key={unitType} className={`flex flex-col rounded-2xl shadow-xl`} style={{ backgroundColor: `var(--col-${config.color}-bg)`}}>
                        <div className={`text-center p-3 border-b-4`} style={{ borderColor: `var(--col-${config.color}-border)`}}>
                            <h2 className={`font-display text-2xl font-black`} style={{ color: `var(--col-${config.color}-text)`}}>
                                {config.plural}
                            </h2>
                            <p className={`font-bold`} style={{ color: `var(--col-${config.color}-text)`}}>({config.name} Place)</p>
                        </div>
                        <div className="flex-grow min-h-[250px] p-2 relative">
                            <div className={`absolute -top-2 right-2 text-white text-3xl font-black rounded-full h-14 w-14 flex items-center justify-center border-4 border-white/80 shadow-lg font-display`} style={{ backgroundColor: `var(--col-${config.color}-border)`}}>
                                {unitItems.filter(i => i.state !== 'regrouping').length}
                            </div>
                            
                            {unitItems.map(item => (
                                <div
                                    key={item.id}
                                    className="absolute"
                                    style={{ 
                                        top: item.top, 
                                        left: item.left, 
                                        ...(item.state === 'forming' && {
                                            '--target-top': item.top,
                                            '--target-left': item.left
                                        })
                                    }}
                                >
                                    <div className={
                                        item.state === 'regrouping' ? 'animate-regroup-to-center' :
                                        item.state === 'forming' ? 'animate-form-from-center opacity-0' : ''
                                    }>
                                        <IconComponent isPulsing={item.type === 'cell'} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
  );
};