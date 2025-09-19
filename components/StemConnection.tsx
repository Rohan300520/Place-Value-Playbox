import React, { useState, useEffect, useCallback, useId } from 'react';

// --- Configuration for STEM Examples ---
// NOTE: Please add the following images to the `public/assets/` directory:
// - muscle-cell.jpg
// - muscle-tissue.jpg
// - muscle-organ.jpg (e.g., an image of the heart muscle)
const EXAMPLES = {
  epithelial: {
    title: 'Epithelial Example',
    description: "See how flat, protective epithelial cells group together to form tissue, which in turn lines organs like the stomach.",
    images: {
      cell: '/assets/epithelial-cell.jpg',
      tissue: '/assets/epithelial-tissue.jpg',
      organ: '/assets/stomach-organ.jpg',
    },
    placeValueMap: {
      cell: { name: 'Ones', plural: 'Epithelial Cells', singular: 'Epithelial Cell' },
      tissue: { name: 'Tens', plural: 'Epithelial Tissues', singular: 'Epithelial Tissue' },
      organ: { name: 'Hundreds', plural: 'Organs (Stomach)', singular: 'Organ (Stomach)' },
    }
  },
  muscle: {
    title: 'Muscle Example',
    description: "Discover how long, powerful muscle cells bundle to create muscle tissue, forming essential organs like the heart.",
    images: {
      cell: '/assets/muscle-cell.jpg',
      tissue: '/assets/muscle-tissue.jpg',
      organ: '/assets/muscle-organ.jpg',
    },
    placeValueMap: {
      cell: { name: 'Ones', plural: 'Muscle Cells', singular: 'Muscle Cell' },
      tissue: { name: 'Tens', plural: 'Muscle Tissues', singular: 'Muscle Tissue' },
      organ: { name: 'Hundreds', plural: 'Organs (Heart)', singular: 'Organ (Heart)' },
    }
  }
};

type ExampleType = keyof typeof EXAMPLES;
type BioUnit = 'cell' | 'tissue' | 'organ';

const imageStyles: Record<BioUnit, string> = {
    cell: 'w-14 h-14 rounded-full object-cover border-2 border-purple-300/50 shadow-lg',
    tissue: 'w-20 h-20 rounded-lg object-cover border-2 border-red-300/50 shadow-lg',
    organ: 'w-24 h-24 rounded-xl object-cover border-2 border-yellow-300/50 shadow-lg',
};

interface Item {
  id: string;
  type: BioUnit;
  state: 'visible' | 'regrouping' | 'forming';
  top: string;
  left: string;
}

const HIERARCHY: BioUnit[] = ['cell', 'tissue', 'organ'];
const PLACE_VALUE_COLORS: Record<BioUnit, 'blue' | 'green' | 'yellow'> = {
  cell: 'blue',
  tissue: 'green',
  organ: 'yellow',
};


export const StemConnection: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [regroupingMessage, setRegroupingMessage] = useState<string | null>(null);
  const [currentExample, setCurrentExample] = useState<ExampleType>('epithelial');
  const baseId = useId();

  const activeExample = EXAMPLES[currentExample];

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

  const handleExampleChange = (example: ExampleType) => {
      setCurrentExample(example);
      handleReset();
  }

  useEffect(() => {
    const checkAndRegroup = (
      sourceType: BioUnit,
      targetType: BioUnit,
    ) => {
      const sourceItems = items.filter(item => item.type === sourceType && item.state === 'visible');
      
      if (sourceItems.length >= 10) {
        setRegroupingMessage(`10 ${activeExample.placeValueMap[sourceType].plural} become 1 ${activeExample.placeValueMap[targetType].singular}!`);
        
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
        if (checkAndRegroup(HIERARCHY[i], HIERARCHY[i+1] as BioUnit)) {
            break;
        }
    }

  }, [items, activeExample.placeValueMap]);
  
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
                Just like with numbers, amazing things are built by grouping smaller pieces. Choose an example to see how this works in biology!
            </p>

            {/* Example Selector */}
            <div className="mt-4 flex justify-center items-center gap-4 border-b-2 pb-4" style={{ borderColor: 'var(--border-primary)'}}>
                {(Object.keys(EXAMPLES) as ExampleType[]).map(exampleKey => (
                    <button
                        key={exampleKey}
                        onClick={() => handleExampleChange(exampleKey)}
                        className={`font-bold text-xl py-2 px-6 rounded-lg transition-all border-b-4  ${currentExample === exampleKey ? 'bg-indigo-500 text-white border-indigo-700 scale-105' : 'bg-white/50 text-indigo-800 border-indigo-300 hover:bg-white/80'}`}
                    >
                        {EXAMPLES[exampleKey].title}
                    </button>
                ))}
            </div>

            <p className="mt-4 text-md sm:text-lg max-w-3xl mx-auto font-semibold min-h-[4.5rem] flex items-center justify-center" style={{ color: 'var(--text-secondary)'}}>
                {activeExample.description}
            </p>

            <div className="mt-6 flex justify-center items-center gap-4 flex-wrap">
                <button
                    onClick={() => handleAddItem('cell')}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xl py-3 px-8 rounded-xl shadow-lg shadow-sky-500/40 transform hover:scale-105 transition-all border-b-4 border-sky-700 active:border-b-2 font-display wobble-on-hover"
                >
                    + Add Cell
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

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-7xl">
            {HIERARCHY.map(unitType => {
                const config = activeExample.placeValueMap[unitType];
                const color = PLACE_VALUE_COLORS[unitType];
                const unitItems = items.filter(item => item.type === unitType);
                const imageSrc = activeExample.images[unitType];
                const imageClassName = imageStyles[unitType];
                return (
                    <div key={unitType} className={`flex flex-col rounded-2xl shadow-xl`} style={{ backgroundColor: `var(--col-${color}-bg)`}}>
                        <div className={`text-center p-3 border-b-4`} style={{ borderColor: `var(--col-${color}-border)`}}>
                            <h2 className={`font-display text-2xl font-black`} style={{ color: `var(--col-${color}-text)`}}>
                                {config.plural}
                            </h2>
                            <p className={`font-bold`} style={{ color: `var(--col-${color}-text)`}}>({config.name} Place)</p>
                        </div>
                        <div className="flex-grow min-h-[250px] p-2 relative">
                            <div className={`absolute -top-2 right-2 text-white text-3xl font-black rounded-full h-14 w-14 flex items-center justify-center border-4 border-white/80 shadow-lg font-display`} style={{ backgroundColor: `var(--col-${color}-border)`}}>
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