import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { ShapeType, ShapeDimensions } from '../../../types';
import { createShapeMesh, createUnfoldedMesh } from '../utils/threeHelpers';

interface Canvas3DProps {
    shape: ShapeType;
    dimensions: ShapeDimensions;
    isUnfolded: boolean;
}

export const Canvas3D: React.FC<Canvas3DProps> = ({ shape, dimensions, isUnfolded }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const meshRef = useRef<THREE.Group | null>(null);
    const onNextFrameCallbackRef = useRef<(() => void) | null>(null);

    const [isLoading, setIsLoading] = useState(true);

    // One-time setup for scene, renderer, and animation loop
    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        // --- Core Scene Setup ---
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        rendererRef.current = renderer;
        currentMount.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        // --- Animation Loop ---
        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            if (controlsRef.current) controlsRef.current.update();
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
            if (onNextFrameCallbackRef.current) {
                onNextFrameCallbackRef.current();
                onNextFrameCallbackRef.current = null;
            }
        };
        animate();

        // --- Resize Handling (Robust) ---
        const resizeObserver = new ResizeObserver(entries => {
            const entry = entries[0];
            if (entry) {
                const { width, height } = entry.contentRect;

                if (width > 0 && height > 0) {
                     renderer.setSize(width, height);
                    
                    if (!cameraRef.current) {
                        // First-time camera and controls setup, only when we have a valid size
                        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
                        camera.position.set(0, 3, 10);
                        cameraRef.current = camera;

                        const controls = new OrbitControls(camera, renderer.domElement);
                        controls.enableDamping = true;
                        controlsRef.current = controls;
                    } else {
                        // Subsequent resizes
                        cameraRef.current.aspect = width / height;
                        cameraRef.current.updateProjectionMatrix();
                    }
                }
            }
        });
        resizeObserver.observe(currentMount);

        // --- Cleanup ---
        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            if (controlsRef.current) controlsRef.current.dispose();
            if (currentMount && rendererRef.current?.domElement) {
                if (currentMount.contains(rendererRef.current.domElement)) {
                    currentMount.removeChild(rendererRef.current.domElement);
                }
            }
            if (rendererRef.current) rendererRef.current.dispose();
        };
    }, []);

    // Effect to handle creating and updating the 3D mesh
    useEffect(() => {
        setIsLoading(true);

        const addMeshWhenReady = () => {
            const scene = sceneRef.current;
            // Wait for the ResizeObserver to create the camera
            if (!scene || !cameraRef.current) {
                setTimeout(addMeshWhenReady, 50); // Retry shortly
                return;
            }

            // Cleanup previous mesh
            if (meshRef.current) {
                scene.remove(meshRef.current);
                meshRef.current.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.dispose();
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else if (child.material) {
                            child.material.dispose();
                        }
                    }
                });
            }
            
            // Create new mesh
            const newMesh = isUnfolded
                ? createUnfoldedMesh(shape, dimensions)
                : createShapeMesh(shape, dimensions);
            
            meshRef.current = newMesh;
            scene.add(newMesh);

            // Hide loader on the next rendered frame
            onNextFrameCallbackRef.current = () => {
                setIsLoading(false);
            };
        };
        
        addMeshWhenReady();
        
    }, [shape, dimensions, isUnfolded]);

    return (
        <div className="w-full h-full bg-transparent rounded-lg relative">
            {isLoading && (
                 <div className="absolute inset-0 flex items-center justify-center bg-[var(--blueprint-panel-bg)]/50 rounded-lg" style={{ backdropFilter: 'blur(4px)', zIndex: 10 }}>
                    <div className="flex flex-col items-center gap-4 text-center">
                        <svg className="animate-spin h-12 w-12 text-[var(--blueprint-accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="font-bold text-lg" style={{ color: 'var(--blueprint-text-primary)' }}>Loading 3D Model...</p>
                    </div>
                </div>
            )}
            <div ref={mountRef} className="w-full h-full" style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s ease-in' }} />
        </div>
    );
};
