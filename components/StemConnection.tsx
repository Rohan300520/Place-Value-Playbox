




import React, { useState, useEffect, useCallback, useId, useMemo, useRef } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { speak } from '../utils/speech';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


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
  'muscle': '/assets/muscle-cell.png',
  // Using more realistic textures for the assembler
  'epithelial-tissue': '/assets/epithelial-tissue-glossy.png',
  'muscle-tissue': '/assets/muscle-tissue-fibrous.jpeg',
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
    const baseId = useId();
    const tissueType = title.split(' ')[1].toLowerCase() as TissueType;
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
            
            if (isSpeechEnabled) {
                speak(`${title} ${description}`, 'en-US');
            }
            
            setTimeout(() => setCells(prev => prev.map(c => ({...c, state: 'regrouping'}))), 500);
            
            setTimeout(() => {
                onComplete();
                setFeedbackMessage(null);
            }, 4000);
        }
    }, [cells, onComplete, isRegrouping, tissueType, isSpeechEnabled]);


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
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 animate-pop-in z-10 rounded-2xl">
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
    const [highlightedLayer, setHighlightedLayer] = useState<DroppableArea | null>(null);

    const mountRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const pointer = useMemo(() => new THREE.Vector2(), []);
    const layersRef = useRef<Record<DroppableArea, THREE.Mesh>>({} as Record<DroppableArea, THREE.Mesh>);
    const particlesRef = useRef<THREE.Points | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;
        const currentMount = mountRef.current;

        // Scene, Camera, Renderer
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.set(0, 5, 12);
        cameraRef.current = camera;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.minDistance = 8;
        controls.maxDistance = 25;
        controls.target.set(0, 0, 0);
        controls.update();
        controlsRef.current = controls;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        // Artery Layers
        const textureLoader = new THREE.TextureLoader();
        const muscleTexture = textureLoader.load(ASSETS['muscle-tissue']);
        const epithelialTexture = textureLoader.load(ASSETS['epithelial-tissue']);
        muscleTexture.wrapS = muscleTexture.wrapT = THREE.RepeatWrapping;
        epithelialTexture.wrapS = epithelialTexture.wrapT = THREE.RepeatWrapping;
        muscleTexture.repeat.set(3, 1);
        epithelialTexture.repeat.set(4, 1);
        
        const arteryGroup = new THREE.Group();
        arteryGroup.rotation.x = -Math.PI / 6;

        const path = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, -5, 0),
            new THREE.Vector3(0, 5, 0),
        ]);

        const muscleGeo = new THREE.TubeGeometry(path, 20, 4.0, 12, false);
        const muscleMat = new THREE.MeshStandardMaterial({ map: muscleTexture, side: THREE.DoubleSide, transparent: true, opacity: 0.1 });
        const muscleMesh = new THREE.Mesh(muscleGeo, muscleMat);
        muscleMesh.name = 'muscle';
        arteryGroup.add(muscleMesh);
        layersRef.current.muscle = muscleMesh;

        const epithelialGeo = new THREE.TubeGeometry(path, 20, 3.0, 12, false);
        const epithelialMat = new THREE.MeshStandardMaterial({ map: epithelialTexture, side: THREE.DoubleSide, transparent: true, opacity: 0.1 });
        const epithelialMesh = new THREE.Mesh(epithelialGeo, epithelialMat);
        epithelialMesh.name = 'epithelial';
        arteryGroup.add(epithelialMesh);
        layersRef.current.epithelial = epithelialMesh;
        
        const bloodGeo = new THREE.CylinderGeometry(2.5, 2.5, 10, 32);
        const bloodMat = new THREE.MeshBasicMaterial({ color: 0x880808, transparent: true, opacity: 0 });
        const bloodMesh = new THREE.Mesh(bloodGeo, bloodMat);
        bloodMesh.name = 'blood';
        arteryGroup.add(bloodMesh);
        layersRef.current.blood = bloodMesh;

        scene.add(arteryGroup);

        // Blood Particles
        const particleCount = 500;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 4;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
        }
        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({ color: 0xff0000, size: 0.2, transparent: true, opacity: 0 });
        const particles = new THREE.Points(particleGeo, particleMat);
        particlesRef.current = particles;
        arteryGroup.add(particles);

        // Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);
            // Animate particles
            const p = particlesRef.current;
            if (p && p.material.opacity > 0) {
                const positions = p.geometry.attributes.position.array as Float32Array;
                for (let i = 0; i < particleCount; i++) {
                    positions[i * 3 + 1] += 0.05; // Move along Y axis
                    if (positions[i * 3 + 1] > 5) {
                        positions[i * 3 + 1] = -5;
                    }
                }
                p.geometry.attributes.position.needsUpdate = true;
            }
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Resize handler
        const handleResize = () => {
            if (!currentMount) return;
            const width = currentMount.clientWidth;
            const height = currentMount.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (currentMount && renderer.domElement) {
                currentMount.removeChild(renderer.domElement);
            }
            scene.traverse(object => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        };
    }, []);

    // Update visuals based on state
    useEffect(() => {
        Object.entries(layersRef.current).forEach(([name, mesh]) => {
            const isPlaced = placedTissues.includes(name as DroppableArea);
            const isHighlighted = highlightedLayer === name;
            
            // Fix: Properly handle cases where material can be an array to satisfy TypeScript types.
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            
            for (const material of materials) {
                material.opacity = isPlaced ? (name === 'blood' ? 0.5 : 1.0) : 0.1;
                
                if (material instanceof THREE.MeshStandardMaterial) {
                     material.emissive.setHex(isHighlighted ? 0xff8800 : 0x000000);
                }
            }
            
            if (name === 'blood' && particlesRef.current) {
                (particlesRef.current.material as THREE.PointsMaterial).opacity = isPlaced ? 0.8 : 0;
            }
        });
    }, [placedTissues, highlightedLayer]);
    
    useEffect(() => {
        if (placedTissues.length === builtTissues.length && builtTissues.length > 0) {
            setTimeout(onComplete, 4000);
        }
    }, [placedTissues, onComplete, builtTissues]);

    const getIntersectedLayer = (event: React.MouseEvent<HTMLDivElement>): DroppableArea | null => {
        if (!mountRef.current || !cameraRef.current) return null;
        const rect = mountRef.current.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, cameraRef.current);
        const intersects = raycaster.intersectObjects(Object.values(layersRef.current));
        if (intersects.length > 0) {
            return intersects[0].object.name as DroppableArea;
        }
        return null;
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const layer = getIntersectedLayer(e);
        if (layer !== highlightedLayer) {
            setHighlightedLayer(layer);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const layer = getIntersectedLayer(e);
        if (draggedTissue && layer === draggedTissue && !placedTissues.includes(layer)) {
            setPlacedTissues(prev => [...prev, layer]);
        }
        setDraggedTissue(null);
        setHighlightedLayer(null);
    };

    const handleClickToPlaceTissue = (tissueType: TissueType) => {
        if (!placedTissues.includes(tissueType)) {
            setPlacedTissues(prev => [...prev, tissueType]);
        }
    };

    return (
        <div className="w-full flex flex-col items-center gap-8">
            <h2 className="text-3xl font-bold font-display">Assemble the Artery</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full">
                {/* 3D View */}
                <div
                    className="w-full md:w-2/3 h-[400px] cursor-grab active:cursor-grabbing rounded-lg border-2 border-dashed"
                    style={{ borderColor: 'var(--border-primary)'}}
                    ref={mountRef}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragLeave={() => setHighlightedLayer(null)}
                />
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
