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
    const isInitialized = useRef(false);

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        // --- Basic Setup ---
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.set(0, 3, 10);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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
        
        isInitialized.current = true;
        
        // --- Animation Loop ---
        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            // Robust resize handling inside the loop
            if (mountRef.current) {
                const { clientWidth, clientHeight } = mountRef.current;
                const canvas = renderer.domElement;
                if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
                    renderer.setSize(clientWidth, clientHeight, false);
                    camera.aspect = clientWidth / clientHeight;
                    camera.updateProjectionMatrix();
                }
            }

            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // --- Cleanup ---
        return () => {
            isInitialized.current = false;
            cancelAnimationFrame(animationFrameId);
            if (currentMount.contains(renderer.domElement)) {
                 currentMount.removeChild(renderer.domElement);
            }
            renderer.dispose();
            sceneRef.current = null;
        };
    }, []);

    // --- Update Mesh on Prop Change ---
    useEffect(() => {
        if (!isInitialized.current || !sceneRef.current) return;
        
        // Remove old mesh
        if (meshRef.current) {
            sceneRef.current.remove(meshRef.current);
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

    return <div ref={mountRef} className="w-full h-full bg-transparent rounded-lg" />;
};