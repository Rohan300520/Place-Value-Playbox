import React, { useState, useEffect, useCallback, useId } from 'react';

// --- SVG Icon Components ---

const CellIcon: React.FC<{ isPulsing?: boolean }> = ({ isPulsing = true }) => (
  <svg viewBox="0 0 100 100" className={`w-12 h-12 ${isPulsing ? 'animate-cell-pulse' : ''}`}>
    <defs>
      <radialGradient id="cellGrad">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#3b82f6" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#cellGrad)" stroke="#2563eb" strokeWidth="4" />
    <circle cx="50" cy="50" r="15" fill="#dbeafe" opacity="0.7" />
  </svg>
);

const TissueIcon: React.FC = () => (
  <svg viewBox="0 0 100 100" className="w-20 h-20">
    <defs>
      <radialGradient id="tissueGrad">
        <stop offset="0%" stopColor="#4ade80" />
        <stop offset="100%" stopColor="#16a34a" />
      </radialGradient>
    </defs>
    <circle cx="35" cy="35" r="20" fill="url(#tissueGrad)" stroke="#15803d" strokeWidth="3" />
    <circle cx="65" cy="35" r="20" fill="url(#tissueGrad)" stroke="#15803d" strokeWidth="3" />
    <circle cx="35" cy="65" r="20" fill="url(#tissueGrad)" stroke="#15803d" strokeWidth="3" />
    <circle cx="65" cy="65" r="20" fill="url(#tissueGrad)" stroke="#15803d" strokeWidth="3" />
    <circle cx="50" cy="50" r="18" fill="url(#tissueGrad)" stroke="#15803d" strokeWidth="3" />
  </svg>
);

const OrganIcon: React.FC = () => (
    <svg viewBox="0 0 100 100" className="w-24 h-24">
        <defs>
            <radialGradient id="organGrad">
                <stop offset="0%" stopColor="#facc15"/>
                <stop offset="100%" stopColor="#f59e0b"/>
            </radialGradient>
        </defs>
        <path d="M50 10 C 20 10, 10 40, 50 90 C 90 40, 80 10, 50 10 Z" fill="url(#organGrad)" stroke="#b45309" strokeWidth="4"/>
        <path d="M50 20 C 35 20, 30 40, 50 70 C 70 40, 65 20, 50 20 Z" fill="none" stroke="#fef3c7" strokeWidth="3" strokeDasharray="5,5"/>
    </svg>
);

const OrganSystemIcon: React.FC = () => (
    <svg viewBox="0 0 100 100" className="w-28 h-28">
        <defs>
            <radialGradient id="systemGrad">
                <stop offset="0%" stopColor="#a78bfa"/>
                <stop offset="100%" stopColor="#7c3aed"/>
            </radialGradient>
        </defs>
        <path d="M50,15 C20,15 20,40 35,55 S70,60 70,40 C70,15 80,15 50,15 Z" fill="url(#systemGrad)" stroke="#5b21b6" strokeWidth="4" />
        <circle cx="50" cy="75" r="15" fill="url(#systemGrad)" stroke="#5b21b6" strokeWidth="4" />
        <rect x="45" y="55" width="10" height="20" fill="#a78bfa" />
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
