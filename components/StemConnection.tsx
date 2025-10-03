import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { speak } from '../utils/speech';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

// --- TYPES ---
type ArteryLayer = 'adventitia' | 'media' | 'intima' | 'lumen';

interface AnimationStep {
    cameraPosition: THREE.Vector3;
    cameraTarget: THREE.Vector3;
    layerToFade: ArteryLayer | null;
    title: string;
    description: string;
}

// --- ANIMATION CONFIGURATION ---
const ANIMATION_STEPS: AnimationStep[] = [
    {
        cameraPosition: new THREE.Vector3(0, 5, 12),
        cameraTarget: new THREE.Vector3(0, 0, 0),
        layerToFade: null,
        title: 'The Artery',
        description: 'This is a complete artery, a blood vessel that carries oxygen-rich blood away from the heart. Let\'s explore its layers from the outside in. Click "Next" to begin.',
    },
    {
        cameraPosition: new THREE.Vector3(0, 3, 8),
        cameraTarget: new THREE.Vector3(0, 0, -2),
        layerToFade: 'adventitia',
        title: 'Tunica Adventitia',
        description: 'The tough outer layer. It is made of connective tissue and provides structural support, preventing the artery from bursting under pressure.',
    },
    {
        cameraPosition: new THREE.Vector3(0, 2.5, 7),
        cameraTarget: new THREE.Vector3(0, 0, -1),
        layerToFade: 'media',
        title: 'Tunica Media',
        description: 'The thick middle layer, composed of smooth muscle and elastic fibers. This muscular wall contracts and relaxes to control blood flow and pressure.',
    },
    {
        cameraPosition: new THREE.Vector3(0, 2, 6),
        cameraTarget: new THREE.Vector3(0, 0, 0),
        layerToFade: 'intima',
        title: 'Tunica Intima',
        description: 'The smooth, innermost lining of the artery. It is made of endothelial cells that provide a frictionless surface for blood to flow easily.',
    },
    {
        cameraPosition: new THREE.Vector3(0, 0, 5),
        cameraTarget: new THREE.Vector3(0, 0, 2),
        layerToFade: 'lumen', // Special case to reveal blood
        title: 'The Lumen & Blood Flow',
        description: 'This is the hollow center, or lumen, where blood flows. It contains red blood cells, white blood cells, and platelets, all rushing to deliver oxygen to the body.',
    },
];

const useSimpleTween = (duration: number = 1.5) => {
    const activeTween = useRef<number | null>(null);

    const tween = useCallback((
        onUpdate: (progress: number) => void,
        onComplete?: () => void
    ) => {
        if (activeTween.current) {
            cancelAnimationFrame(activeTween.current);
        }
        
        let startTime: number | null = null;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / (duration * 1000), 1);
            
            // Ease-out quint function for smooth animation
            const easedProgress = 1 - Math.pow(1 - progress, 5);
            
            onUpdate(easedProgress);

            if (progress < 1) {
                activeTween.current = requestAnimationFrame(animate);
            } else {
                activeTween.current = null;
                if(onComplete) onComplete();
            }
        };
        activeTween.current = requestAnimationFrame(animate);

    }, [duration]);

    return tween;
};

// --- MAIN COMPONENT ---
export const StemConnection: React.FC = () => {
    const [animationStep, setAnimationStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showBlood, setShowBlood] = useState(false);

    const { isSpeechEnabled } = useAudio();
    const mountRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const clockRef = useRef<THREE.Clock | null>(null);

    const layersRef = useRef<Record<ArteryLayer, THREE.Mesh>>({} as Record<ArteryLayer, THREE.Mesh>);
    const curveRef = useRef<THREE.CatmullRomCurve3 | null>(null);
    const particlesGroupRef = useRef<THREE.Group | null>(null);
    const rbcDataRef = useRef<any[]>([]);
    
    const tween = useSimpleTween(1.5);

    const createTexture = useCallback((size: number, drawCallback: (ctx: CanvasRenderingContext2D) => void) => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) drawCallback(ctx);
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }, []);

    const textures = useMemo(() => ({
        background: createTexture(512, ctx => {
            ctx.fillStyle = '#C86464';
            ctx.fillRect(0, 0, 512, 512);
        }),
        adventitia: createTexture(512, ctx => {
            ctx.fillStyle = '#B04848';
            ctx.fillRect(0, 0, 512, 512);
        }),
        media: createTexture(256, ctx => {
            ctx.fillStyle = '#6E2626';
            ctx.fillRect(0, 0, 256, 256);
        }),
        intima: createTexture(256, ctx => {
            ctx.fillStyle = '#F0EAD6';
            ctx.fillRect(0, 0, 256, 256);
        }),
        rbc: createTexture(64, ctx => {
            const cx = 32, cy = 32, r_out = 30, r_in = 15;
            const g_glow = ctx.createRadialGradient(cx, cy, r_in, cx, cy, r_out);
            g_glow.addColorStop(0, 'rgba(255,100,100,1)');
            g_glow.addColorStop(0.7, 'rgba(200,0,0,1)');
            g_glow.addColorStop(1, 'rgba(150,0,0,0)');
            ctx.fillStyle = g_glow;
            ctx.fillRect(0, 0, 64, 64);
        })
    }), [createTexture]);

    useEffect(() => {
        if (!mountRef.current) return;
        const currentMount = mountRef.current;

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.copy(ANIMATION_STEPS[0].cameraPosition);
        cameraRef.current = camera;
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        currentMount.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.copy(ANIMATION_STEPS[0].cameraTarget);
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.enableRotate = false;
        controlsRef.current = controls;

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x888888, 1.5);
        scene.add(hemiLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 4.5);
        dirLight.position.set(-10, 15, 10);
        dirLight.castShadow = true;
        scene.add(dirLight);

        const arteryGroup = new THREE.Group();
        const length = 10;
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, -length),
            new THREE.Vector3(0.5, 0.2, -length / 2),
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(-0.5, -0.2, length / 2),
            new THREE.Vector3(0, 0, length)
        ]);
        curveRef.current = curve;
        const extrudeSettings = { steps: 200, bevelEnabled: false, extrudePath: curve };

        const createLayer = (innerRadius: number, outerRadius: number, name: ArteryLayer) => {
            const material = new THREE.MeshStandardMaterial({
                side: THREE.DoubleSide,
                transparent: true,
                roughness: 0.7
            });
            if (name === 'adventitia') material.map = textures.adventitia;
            if (name === 'media') material.color.set(0x6E2626);
            if (name === 'intima') material.color.set(0xF0EAD6);
            
            const shape = new THREE.Shape().absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
            const hole = new THREE.Path().absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
            shape.holes.push(hole);
            const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            const mesh = new THREE.Mesh(geo, material);
            mesh.castShadow = true;
            layersRef.current[name] = mesh;
            arteryGroup.add(mesh);
        };
        
        createLayer(2.9, 3.3, 'adventitia');
        createLayer(1.9, 2.8, 'media');
        createLayer(1.5, 1.8, 'intima');

        const lumenGeo = new THREE.TubeGeometry(curve, 100, 1.5, 32, false);
        const lumenMesh = new THREE.Mesh(lumenGeo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
        layersRef.current.lumen = lumenMesh;
        arteryGroup.add(lumenMesh);
        
        particlesGroupRef.current = new THREE.Group();
        const particleSystem = new THREE.Points(
            new THREE.BufferGeometry(),
            new THREE.PointsMaterial({
                size: 0.3, map: textures.rbc, blending: THREE.AdditiveBlending,
                depthWrite: false, transparent: true, opacity: 1,
            })
        );
        const positions = new Float32Array(5000 * 3);
        for (let i = 0; i < 5000; i++) {
            rbcDataRef.current.push({
                t: Math.random(),
                radius: Math.random() * 1.45,
                angle: Math.random() * Math.PI * 2,
                speed: (0.02 + Math.random() * 0.01) * 2.5,
            });
        }
        particleSystem.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGroupRef.current.add(particleSystem);
        particlesGroupRef.current.visible = false;
        arteryGroup.add(particlesGroupRef.current);

        scene.add(arteryGroup);
        
        clockRef.current = new THREE.Clock();
        const animate = () => {
            const animationId = requestAnimationFrame(animate);
            if (!rendererRef.current || !cameraRef.current || !clockRef.current || !sceneRef.current) {
                cancelAnimationFrame(animationId);
                return;
            }

            const deltaTime = clockRef.current.getDelta();
            const time = clockRef.current.getElapsedTime();
            const pulse = 1.0 + 0.8 * Math.sin(time * Math.PI * 4); // Faster pulse

            if (particlesGroupRef.current?.visible) {
                const system = particlesGroupRef.current.children[0] as THREE.Points;
                const positions = system.geometry.getAttribute('position').array as Float32Array;
                for (let i = 0; i < rbcDataRef.current.length; i++) {
                    const p = rbcDataRef.current[i];
                    p.t += p.speed * pulse * deltaTime;
                    if (p.t > 1) p.t -= 1;
                    const pointOnCurve = curve.getPointAt(p.t);
                    positions.set([pointOnCurve.x, pointOnCurve.y, pointOnCurve.z], i * 3);
                }
                system.geometry.getAttribute('position').needsUpdate = true;
            }
            
            controlsRef.current?.update();
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        };
        animate();

        const handleResize = () => {
            if (!currentMount || !rendererRef.current || !cameraRef.current) return;
            cameraRef.current.aspect = currentMount.clientWidth / currentMount.clientHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (currentMount && rendererRef.current?.domElement) {
                currentMount.removeChild(rendererRef.current.domElement);
            }
            scene.traverse(object => {
                 if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
                    object.geometry?.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach(mat => mat.dispose());
                    } else {
                        object.material?.dispose();
                    }
                }
            });
            Object.values(textures).forEach(tex => tex.dispose());
            rendererRef.current?.dispose();
        };
    }, [textures]);

    const handleNext = () => {
        if (isAnimating || animationStep >= ANIMATION_STEPS.length - 1) return;
        
        const nextStepIndex = animationStep + 1;
        const currentStepConfig = ANIMATION_STEPS[animationStep];
        const nextStepConfig = ANIMATION_STEPS[nextStepIndex];

        if (isSpeechEnabled) speak(nextStepConfig.description, 'en-US');
        setIsAnimating(true);
        
        const startCamPos = cameraRef.current!.position.clone();
        const startCamTarget = controlsRef.current!.target.clone();
        
        tween(
            (progress) => {
                cameraRef.current?.position.lerpVectors(startCamPos, nextStepConfig.cameraPosition, progress);
                controlsRef.current?.target.lerpVectors(startCamTarget, nextStepConfig.cameraTarget, progress);
                
                if (nextStepConfig.layerToFade && nextStepConfig.layerToFade !== 'lumen') {
                    const layer = layersRef.current[nextStepConfig.layerToFade];
                    if (layer) {
                       (layer.material as THREE.Material).opacity = 1 - progress;
                    }
                }
            },
            () => {
                if (nextStepConfig.layerToFade === 'lumen') {
                    setShowBlood(true);
                    if (particlesGroupRef.current) particlesGroupRef.current.visible = true;
                }
                setIsAnimating(false);
                setAnimationStep(nextStepIndex);
            }
        );
    };

    const handleRestart = () => {
        if (isAnimating) return;
        setAnimationStep(0);
        setShowBlood(false);
        if (particlesGroupRef.current) particlesGroupRef.current.visible = false;
        
        if (isSpeechEnabled) speak(ANIMATION_STEPS[0].description, 'en-US');

        Object.values(layersRef.current).forEach(layer => {
            if (layer.name !== 'lumen') {
                (layer.material as THREE.Material).opacity = 1;
            }
        });

        const startCamPos = cameraRef.current!.position.clone();
        const startCamTarget = controlsRef.current!.target.clone();
        
        setIsAnimating(true);
        tween(
             (progress) => {
                cameraRef.current?.position.lerpVectors(startCamPos, ANIMATION_STEPS[0].cameraPosition, progress);
                controlsRef.current?.target.lerpVectors(startCamTarget, ANIMATION_STEPS[0].cameraTarget, progress);
            },
            () => setIsAnimating(false)
        );
    };

    const currentStepInfo = ANIMATION_STEPS[animationStep];
    const isFinished = animationStep === ANIMATION_STEPS.length - 1;

    return (
        <div className="w-full max-w-6xl mx-auto p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-center min-h-[70vh] gap-4" style={{ backgroundColor: 'var(--backdrop-bg)'}}>
            <div
                className="relative w-full md:w-2/3 h-[400px] md:h-[500px] rounded-lg border-2 border-dashed"
                style={{ borderColor: 'var(--border-primary)'}}
            >
                <div ref={mountRef} className="w-full h-full" />
                 <div className="absolute inset-x-0 bottom-2 text-center text-white/70 text-xs">
                    This is a simplified 3D model for educational purposes.
                </div>
            </div>
            <div className="w-full md:w-1/3 p-6 rounded-2xl shadow-lg h-full flex flex-col justify-between" style={{ backgroundColor: 'var(--panel-bg)'}}>
                <div className="animate-pop-in" key={animationStep}>
                    <h2 className="text-3xl font-bold font-display text-orange-400 mb-2">{currentStepInfo.title}</h2>
                    <p className="text-lg" style={{ color: 'var(--text-secondary)'}}>{currentStepInfo.description}</p>
                </div>
                <button
                    onClick={isFinished ? handleRestart : handleNext}
                    disabled={isAnimating}
                    className={`w-full mt-6 font-bold text-xl py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all border-b-4 active:border-b-2 font-display disabled:opacity-50 disabled:cursor-wait ${isFinished ? 'bg-indigo-500 hover:bg-indigo-600 border-indigo-700' : 'bg-green-500 hover:bg-green-600 border-green-700'}`}
                >
                    {isFinished ? 'Restart Tour' : 'Next'}
                </button>
            </div>
        </div>
    );
};
