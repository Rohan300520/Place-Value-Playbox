
import React, { useState, useEffect, useCallback, useId, useRef } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { speak } from '../utils/speech';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';


// --- TYPES ---
type Stage = 'intro' | 'build_epithelial' | 'build_blood' | 'build_muscle' | 'assemble_artery';
type CellType = 'epithelial' | 'rbc' | 'wbc' | 'platelet' | 'muscle';
type TissueType = 'epithelial' | 'blood' | 'muscle';
type DroppableArea = 'epithelial' | 'muscle' | 'blood' | 'adventitia';

interface Cell {
  id: string;
  type: CellType;
  style: React.CSSProperties;
  state: 'source' | 'placed' | 'regrouping';
}

interface LayerData {
  mesh: THREE.Mesh;
  isLayer: boolean;
}

const CELL_BUILD_REQUIREMENT = 8;

// --- CONFIGURATION ---
// Since image assets are missing, these colors are used as functional fallbacks for both UI and 3D models.
const FALLBACK_COLORS = {
  // Cells
  'epithelial': '#87CEEB', // Sky Blue
  'rbc': '#DC143C',       // Crimson
  'wbc': '#F0E68C',       // Khaki
  'platelet': '#DDA0DD',  // Plum
  'muscle': '#CD853F',     // Peru
  // Tissues (used for UI placeholders and 3D model layers)
  'epithelial-tissue': '#FFFAF0', // FloralWhite (inner layer)
  'muscle-tissue': '#E6A8A8',     // RosyBrown (middle layer)
  'adventitia-tissue': '#F5F5DC', // Beige (outer layer)
  'blood-tissue': '#DC143C',      // Crimson
};

const ASSET_INFO = {
  'epithelial': { name: 'Epithelial Cell' },
  'rbc': { name: 'Red Blood Cell' },
  'wbc': { name: 'White Blood Cell' },
  'platelet': { name: 'Platelet' },
  'muscle': { name: 'Muscle Cell' },
  'epithelial-tissue': { name: 'Epithelial Tissue' },
  'muscle-tissue': { name: 'Muscle Tissue' },
  'adventitia-tissue': { name: 'Connective Tissue' },
  'blood-tissue': { name: 'Blood Tissue' },
};

const LAYER_INFO = {
  epithelial: { name: 'Epithelium Tissue (Tunica Intima)', description: 'The smooth inner layer. It helps blood flow without getting stuck!' },
  muscle: { name: 'Smooth Muscle (Tunica Media)', description: 'The strong, muscular middle layer. It squeezes and relaxes to pump blood around your body.' },
  adventitia: { name: 'Connective Tissue (Tunica Adventitia)', description: 'The tough, protective outer layer. It gives the artery its strength and structure.' },
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
          className="w-16 h-16 rounded-full cursor-grab transition-transform hover:scale-110 flex items-center justify-center text-white font-bold text-xs p-1 text-center shadow-md"
          style={{ backgroundColor: FALLBACK_COLORS[type] }}
          aria-label={ASSET_INFO[type].name}
        >
            {ASSET_INFO[type].name.split(' ')[0]}
        </div>
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
                className="w-28 h-28 rounded-lg shadow-lg" 
                style={{ backgroundColor: FALLBACK_COLORS[`${type}-tissue`] }}
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
          const rect = dishRef.current?.getBoundingClientRect() || { width: 500, height: 400, left: 0, top: 0 };
          const radius = Math.min(rect.width, rect.height) / 3.5; 
          const angle = (cells.length / (CELL_BUILD_REQUIREMENT -1)) * 2 * Math.PI;
          const x = rect.width / 2 + radius * Math.cos(angle);
          const y = rect.height / 2 + radius * Math.sin(angle);
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
            
            if (isSpeechEnabled) speak(`${title} ${description}`, 'en-US');
            
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
                            <div 
                                className="w-64 h-64 rounded-lg shadow-2xl" 
                                style={{ backgroundColor: FALLBACK_COLORS[`${tissueType}-tissue`] }}
                                aria-label={ASSET_INFO[`${tissueType}-tissue`].name}
                            />
                        </div>
                    ) : (
                        cells.map(cell => (
                            <div
                                key={cell.id}
                                className={`w-16 h-16 rounded-full pointer-events-none shadow-sm ${cell.state === 'regrouping' ? 'animate-regroup-to-center' : 'animate-form-from-center opacity-0'}`}
                                style={{ ...cell.style, backgroundColor: FALLBACK_COLORS[cell.type] }}
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

const ArteryAssembler: React.FC<{ builtTissues: TissueType[], onRestart: () => void }> = ({ builtTissues, onRestart }) => {
    const [placedTissues, setPlacedTissues] = useState<DroppableArea[]>([]);
    const [draggedTissue, setDraggedTissue] = useState<TissueType | null>(null);
    const [highlightedLayer, setHighlightedLayer] = useState<DroppableArea | null>(null);
    const [hoveredLayerInfo, setHoveredLayerInfo] = useState<{ name: string; description: string } | null>(null);
    const [isComplete, setIsComplete] = useState(false);

    const mountRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const labelRendererRef = useRef<CSS2DRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const raycaster = useRef(new THREE.Raycaster()).current;
    const pointer = useRef(new THREE.Vector2()).current;
    const layersRef = useRef<Record<string, LayerData>>({} as Record<string, LayerData>);
    const particlesRef = useRef<THREE.Points | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;
        const currentMount = mountRef.current;

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.set(0, 4, 9);
        cameraRef.current = camera;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(renderer.domElement);
        rendererRef.current = renderer;
        
        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px';
        labelRenderer.domElement.style.pointerEvents = 'none';
        currentMount.appendChild(labelRenderer.domElement);
        labelRendererRef.current = labelRenderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.minDistance = 5;
        controls.maxDistance = 20;
        controls.target.set(0, 0, 0);
        controls.update();
        controlsRef.current = controls;

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);
        
        const arteryGroup = new THREE.Group();
        arteryGroup.rotation.x = -Math.PI / 10;
        
        const ARTERY_LENGTH = 10;
        const CUTAWAY_ANGLE = Math.PI * 1.6;
        const LUMEN_RADIUS = 3.2;
        const EPITHELIUM_OUTER_RADIUS = 3.3;
        const MUSCLE_OUTER_RADIUS = 4.0;
        const ADVENTITIA_OUTER_RADIUS = 4.2;

        const adventitiaGeo = new THREE.CylinderGeometry(ADVENTITIA_OUTER_RADIUS, ADVENTITIA_OUTER_RADIUS, ARTERY_LENGTH * 0.5, 64, 1, false, 0, CUTAWAY_ANGLE);
        const adventitiaMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(FALLBACK_COLORS['adventitia-tissue']), side: THREE.DoubleSide, roughness: 0.8, metalness: 0.1 });
        const adventitiaMesh = new THREE.Mesh(adventitiaGeo, adventitiaMat);
        adventitiaMesh.position.y = -(ARTERY_LENGTH * 0.25);
        adventitiaMesh.name = 'adventitia';
        arteryGroup.add(adventitiaMesh);
        layersRef.current.adventitia = { mesh: adventitiaMesh, isLayer: true };

        const muscleGeo = new THREE.CylinderGeometry(MUSCLE_OUTER_RADIUS, MUSCLE_OUTER_RADIUS, ARTERY_LENGTH * 0.75, 64, 1, false, 0, CUTAWAY_ANGLE);
        const muscleMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(FALLBACK_COLORS['muscle-tissue']), side: THREE.DoubleSide, roughness: 0.6, metalness: 0.2 });
        const muscleMesh = new THREE.Mesh(muscleGeo, muscleMat);
        muscleMesh.position.y = -(ARTERY_LENGTH * 0.125);
        muscleMesh.name = 'muscle';
        arteryGroup.add(muscleMesh);
        layersRef.current.muscle = { mesh: muscleMesh, isLayer: true };

        const epithelialGeo = new THREE.CylinderGeometry(EPITHELIUM_OUTER_RADIUS, EPITHELIUM_OUTER_RADIUS, ARTERY_LENGTH, 64, 1, false, 0, CUTAWAY_ANGLE);
        const epithelialMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(FALLBACK_COLORS['epithelial-tissue']), side: THREE.DoubleSide, roughness: 0.4, metalness: 0.1 });
        const epithelialMesh = new THREE.Mesh(epithelialGeo, epithelialMat);
        epithelialMesh.name = 'epithelial';
        arteryGroup.add(epithelialMesh);
        layersRef.current.epithelial = { mesh: epithelialMesh, isLayer: true };
        
        const bloodGeo = new THREE.CylinderGeometry(LUMEN_RADIUS, LUMEN_RADIUS, ARTERY_LENGTH, 32);
        const bloodMat = new THREE.MeshBasicMaterial({ visible: false });
        const bloodMesh = new THREE.Mesh(bloodGeo, bloodMat);
        bloodMesh.name = 'blood';
        arteryGroup.add(bloodMesh);
        layersRef.current.blood = { mesh: bloodMesh, isLayer: false };

        scene.add(arteryGroup);

        const createLabel = (text: string, className = 'artery-label') => {
            const div = document.createElement('div');
            div.className = className;
            div.textContent = text;
            return new CSS2DObject(div);
        };

        arteryGroup.add(createLabel('Epithelium').translateY(0.5).translateX(EPITHELIUM_OUTER_RADIUS + 0.1));
        arteryGroup.add(createLabel('Smooth Muscle').translateY(1.5).translateX(MUSCLE_OUTER_RADIUS - 0.5));
        arteryGroup.add(createLabel('Connective Tissue').translateY(-1).translateX(ADVENTITIA_OUTER_RADIUS + 0.1));

        const particleCount = 500;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const r = Math.sqrt(Math.random()) * LUMEN_RADIUS * 0.95;
            const theta = Math.random() * 2 * Math.PI;
            positions[i * 3 + 0] = r * Math.cos(theta);
            positions[i * 3 + 1] = (Math.random() - 0.5) * ARTERY_LENGTH;
            positions[i * 3 + 2] = r * Math.sin(theta);
        }
        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({ color: 0xDC143C, size: 0.1, transparent: true, opacity: 0 });
        const particles = new THREE.Points(particleGeo, particleMat);
        particlesRef.current = particles;
        arteryGroup.add(particles);
        
        const bloodFlowLabel = createLabel('Blood flow', 'artery-label text-yellow-300');
        bloodFlowLabel.position.set(0, 1.5, 0);
        arteryGroup.add(bloodFlowLabel);

        const animate = () => {
            requestAnimationFrame(animate);
            const p = particlesRef.current;
            if (p && !Array.isArray(p.material) && p.material.opacity > 0) {
                const positions = p.geometry.attributes.position.array as Float32Array;
                for (let i = 0; i < particleCount; i++) {
                    positions[i * 3 + 1] += 0.08;
                    if (positions[i * 3 + 1] > ARTERY_LENGTH / 2) {
                        positions[i * 3 + 1] = -ARTERY_LENGTH / 2;
                    }
                }
                p.geometry.attributes.position.needsUpdate = true;
            }
            controls.update();
            renderer.render(scene, camera);
            if(labelRendererRef.current) labelRendererRef.current.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!currentMount) return;
            const width = currentMount.clientWidth;
            const height = currentMount.clientHeight;
            renderer.setSize(width, height);
            if(labelRendererRef.current) labelRendererRef.current.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        const handlePointerMove = (event: PointerEvent) => {
            if (!mountRef.current || !cameraRef.current || draggedTissue) {
                setHighlightedLayer(null); setHoveredLayerInfo(null); return;
            }
            const rect = mountRef.current.getBoundingClientRect();
            pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(pointer, cameraRef.current);
            const intersects = raycaster.intersectObjects(Object.values(layersRef.current).map(ld => ld.mesh));
            
            if (intersects.length > 0) {
                const name = intersects[0].object.name as keyof typeof LAYER_INFO;
                if (LAYER_INFO[name]) {
                    setHighlightedLayer(name); setHoveredLayerInfo(LAYER_INFO[name]);
                }
            } else {
                setHighlightedLayer(null); setHoveredLayerInfo(null);
            }
        };

        window.addEventListener('resize', handleResize);
        currentMount.addEventListener('pointermove', handlePointerMove);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (currentMount) {
                currentMount.removeEventListener('pointermove', handlePointerMove);
                if(renderer.domElement) currentMount.removeChild(renderer.domElement);
                if(labelRendererRef.current?.domElement) currentMount.removeChild(labelRendererRef.current.domElement);
            }
        };
    }, []);

    useEffect(() => {
        Object.entries(layersRef.current).forEach(([name, layerData]) => {
            if (!layerData.isLayer) return;
            const { mesh } = layerData;
            const material = mesh.material as THREE.MeshStandardMaterial;

            let isPlaced = placedTissues.includes(name as DroppableArea);
            let isHighlighted = highlightedLayer === name;
            
            if (material.emissive) {
                material.emissive.setHex(isHighlighted && !isPlaced ? 0xffaa33 : 0x000000);
            }

            material.transparent = !isPlaced;
            material.opacity = isPlaced ? 1.0 : 0.3;
            material.needsUpdate = true;
        });

        const isBloodPlaced = placedTissues.includes('blood');
        if (particlesRef.current) {
            const material = particlesRef.current.material;
            if (!Array.isArray(material)) {
                material.opacity = isBloodPlaced ? 0.8 : 0;
            }
        }
    }, [placedTissues, highlightedLayer]);
    
    useEffect(() => {
        if (placedTissues.length >= 4) { // 3 layers + blood
            const timer = setTimeout(() => setIsComplete(true), 2000);
            return () => clearTimeout(timer);
        }
    }, [placedTissues]);

    const getIntersectedLayer = (event: React.MouseEvent<HTMLDivElement>): DroppableArea | null => {
        if (!mountRef.current || !cameraRef.current) return null;
        const rect = mountRef.current.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, cameraRef.current);
        const intersects = raycaster.intersectObjects(Object.values(layersRef.current).map(ld => ld.mesh));
        if (intersects.length > 0) {
            return intersects[0].object.name as DroppableArea;
        }
        return null;
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const layer = getIntersectedLayer(e);
        if (layer !== highlightedLayer) setHighlightedLayer(layer);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const layer = getIntersectedLayer(e);
        if (draggedTissue === 'muscle' && (layer === 'muscle' || layer === 'adventitia') && !placedTissues.includes('muscle')) {
            setPlacedTissues(prev => [...prev, 'muscle', 'adventitia']);
        } else if (draggedTissue && layer === draggedTissue && !placedTissues.includes(layer as DroppableArea)) {
            setPlacedTissues(prev => [...prev, layer as DroppableArea]);
        }
        setDraggedTissue(null);
        setHighlightedLayer(null);
    };

    const handleClickToPlaceTissue = (tissueType: TissueType) => {
        if (tissueType === 'muscle' && !placedTissues.includes('muscle')) {
            setPlacedTissues(prev => [...prev, 'muscle', 'adventitia']);
        } else if (!placedTissues.includes(tissueType)) {
            setPlacedTissues(prev => [...prev, tissueType]);
        }
    };

    return (
        <div className="w-full flex flex-col items-center gap-8">
            {isComplete ? (
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
            ) : (
                <>
                    <h2 className="text-3xl font-bold font-display">Assemble the Artery</h2>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full">
                        <div className="w-full md:w-2/3 h-[400px] md:h-[500px] rounded-lg border-2 border-dashed relative" style={{ borderColor: 'var(--border-primary)'}}>
                            <div
                                className="w-full h-full cursor-grab active:cursor-grabbing"
                                ref={mountRef}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onDragLeave={() => { setHighlightedLayer(null); setHoveredLayerInfo(null); }}
                            />
                            {!draggedTissue && hoveredLayerInfo && (
                                <div className="absolute top-2 left-2 p-4 bg-black/60 backdrop-blur-sm rounded-lg text-white max-w-xs animate-pop-in pointer-events-none z-10">
                                    <h4 className="text-xl font-bold font-display text-orange-400">{hoveredLayerInfo.name}</h4>
                                    <p className="mt-1">{hoveredLayerInfo.description}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex-shrink-0 flex flex-col gap-4 items-center">
                             {builtTissues.map(tissue => (
                                <DraggableTissue 
                                    key={tissue} 
                                    type={tissue} 
                                    onDragStart={setDraggedTissue} 
                                    onDragEnd={() => setDraggedTissue(null)}
                                    onClick={handleClickToPlaceTissue}
                                    isPlaced={placedTissues.includes(tissue) || (tissue === 'muscle' && placedTissues.includes('adventitia'))}
                                />
                             ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

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
    
    const handleRestart = () => {
        setBuiltTissues([]);
        setStage('intro');
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
                return <ArteryAssembler builtTissues={['epithelial', 'blood', 'muscle']} onRestart={handleRestart} />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full max-w-7xl animate-pop-in flex flex-col items-center p-4 sm:p-6 rounded-2xl shadow-xl" style={{ backgroundColor: 'var(--backdrop-bg)'}}>
             <style>{`
                .artery-label {
                    color: #ffffff;
                    background: rgba(0, 0, 0, 0.75);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 14px;
                    font-weight: bold;
                    text-shadow: 1px 1px 2px black;
                    white-space: nowrap;
                }
            `}</style>
            {renderStage()}
        </div>
    );
};
