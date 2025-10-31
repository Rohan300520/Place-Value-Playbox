import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { ShapeType, ShapeDimensions, RenderMode } from '../../../types';
import { createShapeMesh, createUnfoldedMesh, BASE_MATERIAL } from '../utils/threeHelpers';

interface Canvas3DProps {
    shape: ShapeType;
    dimensions: ShapeDimensions;
    isUnfolded: boolean;
    highlightedPartId: string | string[] | null;
    renderMode?: RenderMode;
    comparisonData?: {
        shape: ShapeType;
        dimensions: ShapeDimensions;
    }
}

const HIGHLIGHT_MATERIAL = new THREE.MeshStandardMaterial({
    color: 0xfab005, // amber-400
    emissive: 0xfab005,
    emissiveIntensity: 0.6,
    metalness: 0.2,
    roughness: 0.6,
    side: THREE.DoubleSide,
});

export const Canvas3D: React.FC<Canvas3DProps> = ({ shape, dimensions, isUnfolded, highlightedPartId, renderMode = 'solid', comparisonData }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const groupRef = useRef<THREE.Group | null>(null); // Main group for all content
    // Fix: Corrected useRef typing. useRef without an initial value will be undefined, so the type must allow for it.
    const animationFrameIdRef = useRef<number | undefined>();
    const onNextFrameCallbackRef = useRef<(() => void) | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    
    // Create camera, controls, and renderer on mount
    useLayoutEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;
        
        const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.set(0, 3, 15);
        cameraRef.current = camera;
        
        const controls = new OrbitControls(camera, currentMount);
        controls.enableDamping = true;
        controlsRef.current = controls;

        // Fix: Ensure renderer is created only once with correct arguments.
        if (!rendererRef.current) {
            rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        }
    }, []);


    const cleanupScene = useCallback(() => {
        const scene = sceneRef.current;
        if (groupRef.current) {
            scene?.remove(groupRef.current);
            groupRef.current.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                }
            });
            groupRef.current = null;
        }
    }, []);

    // One-time setup for scene, renderer, and animation loop
    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount || !rendererRef.current || !cameraRef.current || !controlsRef.current) return;
        
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        // Fix: Use the renderer instance created in useLayoutEffect, avoiding redundant initialization.
        const renderer = rendererRef.current;
        currentMount.appendChild(renderer.domElement);
        
        const { width, height } = currentMount.getBoundingClientRect();
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        scene.add(new THREE.AmbientLight(0xffffff, 0.8));
        scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        const animate = () => {
            animationFrameIdRef.current = requestAnimationFrame(animate);
            controlsRef.current?.update();
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
            if (onNextFrameCallbackRef.current) {
                onNextFrameCallbackRef.current();
                onNextFrameCallbackRef.current = null;
            }
        };
        animate();

        const resizeObserver = new ResizeObserver(entries => {
            const entry = entries[0];
            if (entry) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0 && rendererRef.current && cameraRef.current) {
                     rendererRef.current.setSize(width, height);
                     cameraRef.current.aspect = width / height;
                     cameraRef.current.updateProjectionMatrix();
                }
            }
        });
        resizeObserver.observe(currentMount);

        return () => {
            if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
            resizeObserver.disconnect();
            controlsRef.current?.dispose();
            if (currentMount && rendererRef.current?.domElement) {
                currentMount.removeChild(rendererRef.current.domElement);
            }
            rendererRef.current?.dispose();
            cleanupScene();
        };
    }, [cleanupScene]);

    // Main effect to handle creating and updating all 3D content
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene || !cameraRef.current) return;
        
        setIsLoading(true);
        cleanupScene();
        
        const group = new THREE.Group();
        groupRef.current = group;
        scene.add(group);
        
        const mainMesh = isUnfolded ? createUnfoldedMesh(shape, dimensions) : createShapeMesh(shape, dimensions);
        mainMesh.position.x = comparisonData ? -4 : 0;
        group.add(mainMesh);
        
        if (comparisonData) {
            const comparisonMesh = createShapeMesh(comparisonData.shape, comparisonData.dimensions);
            comparisonMesh.position.x = 4;
            group.add(comparisonMesh);
        }
        
        onNextFrameCallbackRef.current = () => setIsLoading(false);
        
    }, [shape, dimensions, isUnfolded, comparisonData, cleanupScene]);

    // Effect to handle highlighting and render mode
    useEffect(() => {
        if (!groupRef.current) return;

        const solidMaterial = BASE_MATERIAL.clone();
        solidMaterial.wireframe = false;

        const wireframeMaterial = BASE_MATERIAL.clone();
        wireframeMaterial.wireframe = true;
        
        groupRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                let baseMat = renderMode === 'wireframe' ? wireframeMaterial : solidMaterial;
                
                let isHighlighted = false;
                if (highlightedPartId) {
                    if (Array.isArray(highlightedPartId)) {
                        isHighlighted = highlightedPartId.includes(child.name);
                    } else {
                        isHighlighted = child.name === highlightedPartId;
                    }
                }

                if (!highlightedPartId) {
                    child.material = baseMat;
                } else {
                    const fadedMat = baseMat.clone();
                    fadedMat.transparent = true;
                    fadedMat.opacity = 0.2;
                    child.material = isHighlighted ? HIGHLIGHT_MATERIAL : fadedMat;
                }
            }
        });
    }, [highlightedPartId, renderMode]);

    return (
        <div className="w-full h-full bg-transparent rounded-lg relative">
            {isLoading && (
                 <div className="absolute inset-0 flex items-center justify-center bg-[var(--blueprint-panel-bg)]/50 rounded-lg" style={{ backdropFilter: 'blur(4px)', zIndex: 10 }}>
                    <div className="flex flex-col items-center gap-4 text-center">
                        <svg className="animate-spin h-12 w-12 text-[var(--blueprint-accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="font-bold text-lg" style={{ color: 'var(--blueprint-text-primary)' }}>Constructing Model...</p>
                    </div>
                </div>
            )}
            <div ref={mountRef} className="w-full h-full" style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s ease-in' }} />
        </div>
    );
};
