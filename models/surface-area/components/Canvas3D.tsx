import React, { useEffect, useRef } from 'react';
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

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        // --- Basic Setup ---
        sceneRef.current = new THREE.Scene();
        sceneRef.current.background = new THREE.Color(0x283a4b); // Match theme background

        const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.set(0, 3, 10);
        camera.lookAt(0, 0, 0);

        rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(rendererRef.current.domElement);
        
        const controls = new OrbitControls(camera, rendererRef.current.domElement);
        controls.enableDamping = true;

        // --- Lighting ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        sceneRef.current.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
        directionalLight.position.set(5, 10, 7.5);
        sceneRef.current.add(directionalLight);
        
        // --- Animation Loop ---
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            rendererRef.current?.render(sceneRef.current!, camera);
        };
        animate();

        // --- Resize Handler ---
        const handleResize = () => {
            if (!rendererRef.current) return;
            const width = currentMount.clientWidth;
            const height = currentMount.clientHeight;
            rendererRef.current.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        // --- Cleanup ---
        return () => {
            window.removeEventListener('resize', handleResize);
            if (rendererRef.current) {
                 currentMount.removeChild(rendererRef.current.domElement);
            }
            // Dispose of geometries and materials if needed
            sceneRef.current = null;
            rendererRef.current = null;
        };
    }, []);

    // --- Update Mesh on Prop Change ---
    useEffect(() => {
        if (!sceneRef.current) return;
        
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

    }, [shape, dimensions, isUnfolded]);

    return <div ref={mountRef} className="w-full h-full bg-[var(--blueprint-bg)] rounded-lg" />;
};
