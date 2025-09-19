import React, { useState, useEffect, useCallback, useId } from 'react';

// --- Real Images for Biological Hierarchy ---
const images = {
  cell: '/assets/epithelial-cell.jpg',
  tissue: '/assets/epithelial-tissue.jpg',
  organ: '/assets/stomach-organ.jpg',
  organSystem: '/assets/digestive-system.jpg',
};

const imageStyles: Record<BioUnit, string> = {
    cell: 'w-14 h-14 rounded-full object-cover border-2 border-purple-300/50 shadow-lg',
    tissue: 'w-20 h-20 rounded-lg object-cover border-2 border-red-300/50 shadow-lg',
    organ: 'w-24 h-24 rounded-xl object-cover border-2 border-yellow-300/50 shadow-lg',
    organSystem: 'w-28 h-28 rounded-2xl object-cover border-2 border-pink-300/50 shadow-lg',
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
const PLACE_VALUE_MAP: Record<BioUnit, { name: string; color: 'blue' | 'green' | 'yellow' | 'purple'; plural: string, singular: string }> = {
  cell: { name: 'Ones', color: 'blue', plural: 'Epithelial Cells', singular: 'Epithelial Cell' },
  tissue: { name: 'Tens', color: 'green', plural: 'Epithelial Tissues', singular: 'Epithelial Tissue' },
  organ: { name: 'Hundreds', color: 'yellow', plural: 'Organs (Stomach)', singular: 'Organ (Stomach)' },
  organSystem: { name: 'Thousands', color: 'purple', plural: 'Organ Systems', singular: 'Organ System' },
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
        setRegroupingMessage(`10 ${PLACE_VALUE_MAP[sourceType].plural} become 1 ${PLACE_VALUE_MAP[targetType].singular}!`);
        
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
                Just like with numbers, amazing things are built by grouping smaller pieces into bigger ones. Let's see how epithelial cells form tissues and organs!
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
                const imageSrc = images[unitType];
                const imageClassName = imageStyles[unitType];
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
                                        item.state === 'forming' ? 'animate-form-from-center opacity-0' : 'animate-bouncy-pop-in'
                                    }>
                                        <img 
                                            src={imageSrc} 
                                            alt={config.singular} 
                                            className={imageClassName} 
                                        />
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
