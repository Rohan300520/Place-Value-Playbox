import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useAudio } from '../../../contexts/AudioContext';
import { speak, cancelSpeech } from '../../../utils/speech';

type ExperimentType = 'cone-cylinder' | 'sphere-cylinder';

const GLASS_MATERIAL = new THREE.MeshPhysicalMaterial({
    color: 0xa5f3fc,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.6,
    thickness: 1.0,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
});

const LIQUID_COLORS = [0xfacc15, 0xf472b6, 0x22d3ee]; // Yellow, Pink, Cyan

const STREAM_MATERIAL = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
});

const DerivationPanel: React.FC<{ type: ExperimentType }> = ({ type }) => {
    return (
        <div className="w-full max-w-2xl mt-4 p-6 rounded-2xl bg-slate-800/90 border border-indigo-500/50 shadow-xl animate-pop-in text-left">
            <h3 className="text-2xl font-bold text-indigo-400 mb-4 font-display flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                How do we get the formula?
            </h3>
            
            {type === 'cone-cylinder' ? (
                <div className="space-y-3 text-lg text-slate-200">
                    <p>
                        <span className="font-bold text-yellow-400">1.</span> We observed that it takes exactly <span className="font-bold text-white">3 cones</span> to fill <span className="font-bold text-white">1 cylinder</span> with the same radius (<span className="italic font-serif">r</span>) and height (<span className="italic font-serif">h</span>).
                    </p>
                    <p>
                        <span className="font-bold text-yellow-400">2.</span> We know the volume of a cylinder is the area of its base times its height:
                        <br/>
                        <span className="font-mono text-indigo-300 ml-6 bg-black/30 px-2 py-1 rounded">V_cylinder = &pi;r²h</span>
                    </p>
                    <p>
                        <span className="font-bold text-yellow-400">3.</span> Since a cone is one-third of the cylinder, its volume formula is:
                    </p>
                    <div className="p-3 bg-indigo-900/30 rounded-lg text-center border border-indigo-500/30">
                        <span className="font-mono text-2xl font-bold text-white">V_cone = <span className="text-yellow-400">1/3</span> &pi;r²h</span>
                    </div>
                </div>
            ) : (
                <div className="space-y-3 text-lg text-slate-200">
                    <p>
                        <span className="font-bold text-yellow-400">1.</span> We used a cylinder with height equal to its diameter (<span className="italic font-serif">h = 2r</span>).
                    </p>
                    <p>
                        <span className="font-bold text-yellow-400">2.</span> The volume of this specific cylinder is:
                        <br/>
                        <span className="font-mono text-indigo-300 ml-6 bg-black/30 px-2 py-1 rounded">V_cylinder = &pi;r²(2r) = 2&pi;r³</span>
                    </p>
                    <p>
                        <span className="font-bold text-yellow-400">3.</span> We observed that <span className="font-bold text-white">1 sphere</span> fills exactly <span className="font-bold text-white">2/3</span> of this cylinder.
                    </p>
                    <p>
                        <span className="font-bold text-yellow-400">4.</span> Therefore, the volume of the sphere is:
                        <br/>
                        <span className="font-mono text-indigo-300 ml-6">V_sphere = 2/3 &times; (2&pi;r³)</span>
                    </p>
                    <div className="p-3 bg-indigo-900/30 rounded-lg text-center border border-indigo-500/30">
                        <span className="font-mono text-2xl font-bold text-white">V_sphere = <span className="text-yellow-400">4/3</span> &pi;r³</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export const VolumeComparisonView: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const { isSpeechEnabled } = useAudio();
    
    const [activeExperiment, setActiveExperiment] = useState<ExperimentType>('cone-cylinder');
    const [fillCount, setFillCount] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    
    // Refs
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const cylinderLayersRef = useRef<THREE.Mesh[]>([]); 
    const sourceGroupsRef = useRef<THREE.Group[]>([]); 
    const streamRef = useRef<THREE.Mesh | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    
    const stateRef = useRef({
        fillCount: 0,
        filledSources: [true, true, true],
        experiment: 'cone-cylinder' as ExperimentType
    });

    // Animation Controller
    const animationRef = useRef<{
        active: boolean;
        sourceIndex: number;
        startTime: number;
        phase: 'move_to_center' | 'rotate' | 'pour' | 'rotate_back' | 'return_home';
        startPos: THREE.Vector3;
        startRot: THREE.Quaternion;
    } | null>(null);

    // Sync State Ref
    useEffect(() => {
        stateRef.current.experiment = activeExperiment;
    }, [activeExperiment]);

    // --- Audio Logic ---
    useEffect(() => {
        if (!isSpeechEnabled) return;
        const playAudio = async () => {
            if (isAnimating) return; 

            if (fillCount === 0) {
               if (activeExperiment === 'cone-cylinder') {
                   await speak("Here are three cones and one cylinder. They have the same base radius and height. Click a cone to pour!", 'en-US');
               } else if (activeExperiment === 'sphere-cylinder') {
                   await speak("Here is a sphere and a cylinder. The cylinder's height is equal to its diameter. Click the sphere to see how much volume it takes up!", 'en-US');
               }
            } else {
                // Post-fill logic
                if (activeExperiment === 'cone-cylinder') {
                    if (fillCount === 1) await speak("One third full.", 'en-US');
                    if (fillCount === 2) await speak("Two thirds full.", 'en-US');
                    if (fillCount === 3) await speak("Completely full! This proves the cone's volume is one third of the cylinder.", 'en-US');
                } else if (activeExperiment === 'sphere-cylinder') {
                    if (fillCount === 1) await speak("The sphere fills exactly two-thirds of the cylinder!", 'en-US');
                }
            }
        };
        cancelSpeech();
        playAudio();
    }, [activeExperiment, fillCount, isSpeechEnabled, isAnimating]);

    // --- Scene Setup ---
    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        // Cleanup previous scene
        while (currentMount.firstChild) {
            currentMount.removeChild(currentMount.firstChild);
        }

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        
        const width = currentMount.clientWidth;
        const height = currentMount.clientHeight;
        
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 5, 22); 
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        currentMount.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(5, 10, 5);
        scene.add(dirLight);
        const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
        backLight.position.set(-5, 5, -10);
        scene.add(backLight);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.target.set(0, -1, 0); 
        controlsRef.current = controls;

        // --- Build Scene Objects based on Experiment ---
        const targetGroup = new THREE.Group();
        targetGroup.position.set(0, -3, 0);
        
        cylinderLayersRef.current = [];
        sourceGroupsRef.current = [];

        const cylRadius = 2.5; // r = 2.5
        // If sphere, h = 2r = 5. If cone, h can be taller for aesthetics, say 6.
        const cylHeight = activeExperiment === 'sphere-cylinder' ? 5 : 6;
        
        // 1. Target Cylinder
        const cylMesh = new THREE.Mesh(new THREE.CylinderGeometry(cylRadius, cylRadius, cylHeight, 32, 1, true), GLASS_MATERIAL);
        const cylBase = new THREE.Mesh(new THREE.CircleGeometry(cylRadius, 32), GLASS_MATERIAL);
        cylBase.rotation.x = -Math.PI / 2;
        cylBase.position.y = -cylHeight / 2;
        
        targetGroup.add(cylMesh);
        targetGroup.add(cylBase);

        // Markers
        const ringGeo = new THREE.TorusGeometry(cylRadius, 0.05, 16, 64);
        ringGeo.rotateX(Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });
        
        if (activeExperiment === 'cone-cylinder') {
            const layerHeight = cylHeight / 3;
            // 1/3 and 2/3 markers
            const r1 = new THREE.Mesh(ringGeo, ringMat); r1.position.y = -cylHeight/2 + layerHeight;
            const r2 = new THREE.Mesh(ringGeo, ringMat); r2.position.y = -cylHeight/2 + layerHeight*2;
            targetGroup.add(r1, r2);

            // 3 Layers
            LIQUID_COLORS.forEach((color, i) => {
                const layerGeo = new THREE.CylinderGeometry(cylRadius - 0.1, cylRadius - 0.1, layerHeight, 32);
                layerGeo.translate(0, layerHeight/2, 0);
                const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.2, metalness: 0.1 });
                const mesh = new THREE.Mesh(layerGeo, mat);
                mesh.position.y = -cylHeight/2 + (i * layerHeight);
                mesh.scale.y = 0;
                cylinderLayersRef.current.push(mesh);
                targetGroup.add(mesh);
            });
        } else {
            // Sphere-Cylinder (2/3 marker only)
            const r1 = new THREE.Mesh(ringGeo, ringMat); 
            r1.position.y = -cylHeight/2 + (cylHeight * 0.666);
            targetGroup.add(r1);

            // 1 Big Layer (fills to 2/3)
            const fillHeight = cylHeight * 0.666;
            const layerGeo = new THREE.CylinderGeometry(cylRadius - 0.1, cylRadius - 0.1, fillHeight, 32);
            layerGeo.translate(0, fillHeight/2, 0);
            const mat = new THREE.MeshStandardMaterial({ color: LIQUID_COLORS[2], roughness: 0.2, metalness: 0.1 });
            const mesh = new THREE.Mesh(layerGeo, mat);
            mesh.position.y = -cylHeight/2;
            mesh.scale.y = 0;
            cylinderLayersRef.current.push(mesh);
            targetGroup.add(mesh);
        }
        
        scene.add(targetGroup);

        // 2. Source Objects
        if (activeExperiment === 'sphere-cylinder') {
            // ONE SPHERE
            const group = new THREE.Group();
            group.position.set(-6, -1, 0); // Start position
            
            const r = cylRadius; // Sphere radius = Cylinder radius
            const sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), GLASS_MATERIAL);
            const liquidMesh = new THREE.Mesh(new THREE.SphereGeometry(r - 0.1, 32, 32), new THREE.MeshStandardMaterial({ color: LIQUID_COLORS[2] }));
            
            const userData = { isSource: true, index: 0, color: LIQUID_COLORS[2] };
            sphereMesh.userData = userData;
            
            group.add(sphereMesh);
            group.add(liquidMesh);
            group.userData = { liquidMesh, startPos: group.position.clone(), color: LIQUID_COLORS[2] };
            
            scene.add(group);
            sourceGroupsRef.current.push(group);

        } else {
            // 3 CONES
            const positions = [
                new THREE.Vector3(-7, -3, 0),
                new THREE.Vector3(0, -3, 7),
                new THREE.Vector3(7, -3, 0)
            ];

            positions.forEach((pos, index) => {
                const group = new THREE.Group();
                group.position.copy(pos);
                
                const coneGeo = new THREE.ConeGeometry(cylRadius, cylHeight, 32, 1, true);
                coneGeo.translate(0, cylHeight/2, 0);
                const shell = new THREE.Mesh(coneGeo, GLASS_MATERIAL);
                // Cap
                const cap = new THREE.Mesh(new THREE.CircleGeometry(cylRadius, 32), GLASS_MATERIAL);
                cap.rotation.x = Math.PI/2;
                group.add(cap);

                const liquidGeo = new THREE.ConeGeometry(cylRadius - 0.1, cylHeight - 0.1, 32);
                liquidGeo.translate(0, cylHeight/2, 0);
                const liquid = new THREE.Mesh(liquidGeo, new THREE.MeshStandardMaterial({ color: LIQUID_COLORS[index] }));

                const userData = { isSource: true, index: index };
                shell.userData = userData;
                liquid.userData = userData; // Allow clicking liquid too

                group.add(shell);
                group.add(liquid);
                group.userData = { liquidMesh: liquid, startPos: pos.clone(), color: LIQUID_COLORS[index] };
                scene.add(group);
                sourceGroupsRef.current.push(group);
            });
        }

        // Stream
        const streamGeo = new THREE.CylinderGeometry(0.15, 0.15, 1, 8);
        streamGeo.translate(0, -0.5, 0);
        const stream = new THREE.Mesh(streamGeo, STREAM_MATERIAL.clone());
        stream.visible = false;
        scene.add(stream);
        streamRef.current = stream;

        // Animation Loop
        const clock = new THREE.Clock();
        let frameId: number;

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();

            // Idle Hover
            sourceGroupsRef.current.forEach((group, i) => {
                if (stateRef.current.filledSources[i] && (!animationRef.current || animationRef.current.sourceIndex !== i)) {
                    // Only hover if not selected
                    group.position.y = group.userData.startPos.y + Math.sin(time * 2 + i) * 0.15;
                }
            });

            if (animationRef.current && animationRef.current.active) {
                const anim = animationRef.current;
                const group = sourceGroupsRef.current[anim.sourceIndex];
                const liquid = group.userData.liquidMesh as THREE.Mesh;
                const elapsed = (Date.now() - anim.startTime) / 1000;
                
                const centerPos = new THREE.Vector3(0, 4.5, 0);

                // --- PHASE 1: Move ---
                if (anim.phase === 'move_to_center') {
                    const duration = 1.0;
                    const t = Math.min(elapsed / duration, 1);
                    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                    group.position.lerpVectors(anim.startPos, centerPos, ease);
                    if (t >= 1) {
                        anim.phase = 'rotate';
                        anim.startTime = Date.now();
                    }
                }
                // --- PHASE 2: Rotate ---
                else if (anim.phase === 'rotate') {
                    const duration = 0.6;
                    const t = Math.min(elapsed / duration, 1);
                    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                    const targetQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI + 0.2);
                    group.quaternion.slerpQuaternions(anim.startRot, targetQ, ease);
                    if (t >= 1) {
                        anim.phase = 'pour';
                        anim.startTime = Date.now();
                        if (streamRef.current) {
                            streamRef.current.visible = true;
                            (streamRef.current.material as THREE.MeshBasicMaterial).color.setHex(group.userData.color);
                        }
                    }
                }
                // --- PHASE 3: Pour ---
                else if (anim.phase === 'pour') {
                    const duration = 2.0;
                    const t = Math.min(elapsed / duration, 1);
                    
                    // Empty Source
                    liquid.scale.setScalar(1 - t);

                    // Fill Target
                    const exp = stateRef.current.experiment;
                    if (exp === 'sphere-cylinder') {
                        // Sphere fills 1 big layer
                        if (cylinderLayersRef.current[0]) {
                            cylinderLayersRef.current[0].scale.y = t;
                        }
                    } else {
                        // Cones/Pyramids fill respective layer
                        const layerIndex = stateRef.current.fillCount;
                        if (cylinderLayersRef.current[layerIndex]) {
                            cylinderLayersRef.current[layerIndex].scale.y = t;
                        }
                    }

                    // Stream Logic
                    if (streamRef.current) {
                        streamRef.current.position.copy(group.position);
                        streamRef.current.position.y -= 0.5;
                        // Approx liquid top
                        let liquidTopY = -3; // Base
                        if (exp === 'sphere-cylinder') {
                            const h = 5 * 0.666; // 2/3 height of 5
                            liquidTopY += h * t;
                        } else {
                            const layerH = 6 / 3;
                            const currentIdx = stateRef.current.fillCount;
                            liquidTopY += (currentIdx * layerH) + (t * layerH);
                        }
                        
                        const dist = Math.max(0, streamRef.current.position.y - liquidTopY);
                        streamRef.current.scale.y = dist;
                    }

                    if (t >= 1) {
                        anim.phase = 'rotate_back';
                        anim.startTime = Date.now();
                        if (streamRef.current) streamRef.current.visible = false;
                        
                        stateRef.current.fillCount++;
                        setFillCount(c => c + 1);
                        stateRef.current.filledSources[anim.sourceIndex] = false;
                    }
                }
                // --- PHASE 4: Rotate Back ---
                else if (anim.phase === 'rotate_back') {
                    const duration = 0.6;
                    const t = Math.min(elapsed / duration, 1);
                    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                    const targetQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI + 0.2);
                    const homeQ = new THREE.Quaternion().identity();
                    group.quaternion.slerpQuaternions(targetQ, homeQ, ease);
                    if (t >= 1) {
                        anim.phase = 'return_home';
                        anim.startTime = Date.now();
                    }
                }
                // --- PHASE 5: Return ---
                else if (anim.phase === 'return_home') {
                    const duration = 1.0;
                    const t = Math.min(elapsed / duration, 1);
                    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                    group.position.lerpVectors(centerPos, anim.startPos, ease);
                    if (t >= 1) {
                        animationRef.current = null;
                        setIsAnimating(false);
                    }
                }
            }

            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Raycaster
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        
        const handlePointerDown = (event: MouseEvent) => {
            if (animationRef.current) return;
            const rect = renderer.domElement.getBoundingClientRect();
            pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);
            
            for (let i = 0; i < intersects.length; i++) {
                const obj = intersects[i].object;
                if (obj.userData.isSource) {
                    const idx = obj.userData.index;
                    if (stateRef.current.filledSources[idx]) {
                        startAnimation(idx);
                        break;
                    }
                }
            }
        };
        renderer.domElement.addEventListener('pointerdown', handlePointerDown);

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    camera.aspect = width / height;
                    camera.updateProjectionMatrix();
                    renderer.setSize(width, height);
                }
            }
        });
        resizeObserver.observe(currentMount);

        return () => {
            cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
            if (renderer.domElement && currentMount) {
                renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
                if (currentMount.contains(renderer.domElement)) currentMount.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };

    }, [activeExperiment]); // Re-run when experiment changes

    const startAnimation = (index: number) => {
        setIsAnimating(true);
        const group = sourceGroupsRef.current[index];
        animationRef.current = {
            active: true,
            coneIndex: index, // reusing property name but means sourceIndex
            sourceIndex: index,
            startTime: Date.now(),
            phase: 'move_to_center',
            startPos: group.userData.startPos.clone(),
            startRot: group.quaternion.clone(),
        };
        
        if (isSpeechEnabled) {
            cancelSpeech();
            speak("Pouring...", 'en-US');
        }
    };

    const handleReset = () => {
        setFillCount(0);
        stateRef.current.fillCount = 0;
        stateRef.current.filledSources = [true, true, true];
        setIsAnimating(false);
        animationRef.current = null;
        
        cylinderLayersRef.current.forEach(layer => layer.scale.y = 0);
        sourceGroupsRef.current.forEach(group => {
            const liq = group.userData.liquidMesh;
            if (liq) liq.scale.setScalar(1);
            group.position.copy(group.userData.startPos);
            group.quaternion.identity();
        });
        
        if (isSpeechEnabled) {
            cancelSpeech();
            speak("Reset.", 'en-US');
        }
    };

    const handleSwitchExperiment = (type: ExperimentType) => {
        setActiveExperiment(type);
        handleReset(); // Ensure clean state
    };

    const isComplete = (activeExperiment === 'sphere-cylinder' && fillCount === 1) || fillCount === 3;

    return (
        <div className="w-full flex-grow flex flex-col items-center gap-4 animate-pop-in p-4 relative min-h-0">
            {/* Nav Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-2">
                <button 
                    onClick={() => handleSwitchExperiment('cone-cylinder')} 
                    className={`px-4 py-2 rounded-full font-bold transition-all ${activeExperiment === 'cone-cylinder' ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                    Cone & Cylinder
                </button>
                <button 
                    onClick={() => handleSwitchExperiment('sphere-cylinder')} 
                    className={`px-4 py-2 rounded-full font-bold transition-all ${activeExperiment === 'sphere-cylinder' ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                    Sphere & Cylinder
                </button>
            </div>

            <div className="w-full min-h-[400px] flex-1 rounded-2xl shadow-lg border relative overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900" style={{ borderColor: 'var(--border-primary)' }}>
                <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-pointer z-0" />
                
                <div className="absolute top-4 left-0 right-0 pointer-events-none text-center z-10 px-4">
                    <h2 className="text-3xl font-black font-display text-white drop-shadow-md">
                        {activeExperiment === 'cone-cylinder' && 'Cone vs. Cylinder (1:3)'}
                        {activeExperiment === 'sphere-cylinder' && 'Sphere vs. Cylinder (2:3)'}
                    </h2>
                    <p className="text-xl font-bold text-sky-300 drop-shadow-sm mt-1">
                        {isComplete ? "Relationship Proven!" : "Click a shape to pour it!"}
                    </p>
                </div>
            </div>

            <div className="w-full max-w-2xl p-4 rounded-2xl shadow-lg border flex flex-col items-center gap-4" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)' }}>
                {activeExperiment !== 'sphere-cylinder' && (
                    <div className="w-full bg-gray-700/50 rounded-full h-8 relative overflow-hidden border border-gray-600 flex">
                        {[0, 1, 2].map(i => (
                            <div 
                                key={i}
                                className="h-full transition-all duration-1000 ease-in-out border-r border-black/10 last:border-0"
                                style={{ 
                                    width: '33.33%', 
                                    backgroundColor: i < fillCount ? `#${LIQUID_COLORS[i].toString(16)}` : 'transparent',
                                    opacity: i < fillCount ? 1 : 0
                                }}
                            />
                        ))}
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-white shadow-sm z-10 mix-blend-difference">
                            {fillCount} / 3 Poured
                        </div>
                    </div>
                )}
                
                <button
                    onClick={handleReset}
                    className="px-8 py-3 font-bold text-xl rounded-xl shadow-lg transition-transform transform hover:scale-105 active:scale-95 bg-red-600 hover:bg-red-700 text-white border-b-4 border-red-800 active:border-b-2"
                >
                    Reset Experiment
                </button>
            </div>

            {isComplete && <DerivationPanel type={activeExperiment} />}
        </div>
    );
};