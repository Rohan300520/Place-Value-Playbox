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
    const meshRef = useRef<THREE.Group | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount || rendererRef.current) return;

        // --- Basic Setup ---
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0x283a4b); // Match theme background

        const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.set(0, 3, 10);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current = renderer;
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(renderer.domElement);
        
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // --- Lighting ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);
        
        // --- Animation Loop ---
        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // --- Resize Handler ---
        const handleResize = () => {
            if (!mountRef.current) return;
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(currentMount);
        handleResize(); // Initial call

        setIsInitialized(true);

        // --- Cleanup ---
        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            if (currentMount.contains(renderer.domElement)) {
                 currentMount.removeChild(renderer.domElement);
            }
            renderer.dispose();
            rendererRef.current = null;
            sceneRef.current = null;
            setIsInitialized(false);
        };
    }, []);

    // --- Update Mesh on Prop Change ---
    useEffect(() => {
        if (!isInitialized || !sceneRef.current) return;
        
        // Remove old mesh
        if (meshRef.current) {
            sceneRef.current.remove(meshRef.current);
            // Properly dispose of old geometry and material to free up memory
            meshRef.current.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    if(Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
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
        sceneRef.current.add(meshRef.current);

    }, [shape, dimensions, isUnfolded, isInitialized]);

    return <div ref={mountRef} className="w-full h-full bg-[var(--blueprint-bg)] rounded-lg" />;
};