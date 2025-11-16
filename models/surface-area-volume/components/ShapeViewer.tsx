import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { ShapeType, ShapeDimensions, RenderMode } from '../../../types';
import { SHAPE_DATA } from '../utils/shapeData';

// --- TWEENING/ANIMATION HELPERS (No external library) ---
let activeAnimations: any[] = [];
function animate(time: number) {
    activeAnimations.forEach(anim => anim.update(time));
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

function createAnimation(object: THREE.Object3D, target: { position: THREE.Vector3, quaternion: THREE.Quaternion }, duration: number) {
    const existing = activeAnimations.find(a => a.object === object);
    if (existing) {
        existing.stop();
    }

    const start = {
        position: object.position.clone(),
        quaternion: object.quaternion.clone()
    };
    const startTime = performance.now();

    const anim = {
        object,
        update: () => {
            const elapsed = performance.now() - startTime;
            let t = Math.min(elapsed / duration, 1.0);
            t = 0.5 - 0.5 * Math.cos(t * Math.PI); // Ease in-out

            object.position.lerpVectors(start.position, target.position, t);
            object.quaternion.slerpQuaternions(start.quaternion, target.quaternion, t);

            if (t >= 1.0) {
                anim.stop();
            }
        },
        stop: () => {
            activeAnimations = activeAnimations.filter(a => a !== anim);
        }
    };
    activeAnimations.push(anim);
}


// --- SHAPE CREATION HELPERS ---

function createDimensionLabel(text: string, size: number = 0.5) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return new THREE.Sprite(); // Return empty sprite

    const fontSize = 64;
    context.font = `bold ${fontSize}px "Roboto Mono", monospace`;
    
    // Measure text to size canvas correctly
    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    canvas.width = textWidth;
    canvas.height = fontSize;

    // Re-set font and draw text (some browsers need this)
    context.font = `bold ${fontSize}px "Roboto Mono", monospace`;
    context.fillStyle = '#fde047'; // yellow
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, textWidth / 2, fontSize / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        depthTest: false, // Render on top
        sizeAttenuation: true,
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    
    // Scale sprite to be a reasonable size in the scene
    const scale = size * 2;
    sprite.scale.set(scale * (textWidth / fontSize), scale, 1.0);
    
    return sprite;
}

const createPartMaterials = (color: number, material: THREE.Material) => {
    const baseMat = (material as THREE.MeshStandardMaterial).clone();
    baseMat.color.set(color);
    const highlightMat = baseMat.clone();
    highlightMat.emissive.set('#facc15');
    highlightMat.emissiveIntensity = 0.8;
    return { base: baseMat, highlight: highlightMat };
};

const setupMeshUserData = (mesh: THREE.Mesh, name: string, materials: { base: THREE.Material; highlight: THREE.Material; }) => {
    mesh.name = name;
    mesh.userData.originalMaterial = materials.base;
    mesh.userData.highlightMaterial = materials.highlight;
};

const createCuboidGroup = (dims: ShapeDimensions, material: THREE.Material, color: number) => {
    const { length: l, width: w, height: h } = dims;
    const group = new THREE.Group();
    
    const partMaterials = createPartMaterials(color, material);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });

    const faces = {
        bottom: new THREE.Mesh(new THREE.PlaneGeometry(l, w), partMaterials.base),
        top: new THREE.Mesh(new THREE.PlaneGeometry(l, w), partMaterials.base),
        front: new THREE.Mesh(new THREE.PlaneGeometry(l, h), partMaterials.base),
        back: new THREE.Mesh(new THREE.PlaneGeometry(l, h), partMaterials.base),
        left: new THREE.Mesh(new THREE.PlaneGeometry(w, h), partMaterials.base),
        right: new THREE.Mesh(new THREE.PlaneGeometry(w, h), partMaterials.base),
    };
    
    Object.entries(faces).forEach(([name, mesh]) => {
        setupMeshUserData(mesh, name, partMaterials);
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), edgeMaterial);
        mesh.add(edges);
        group.add(mesh);
    });

    // Folded State
    faces.bottom.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
    faces.top.position.set(0, h, 0);
    faces.top.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    faces.front.position.set(0, h / 2, w / 2);
    faces.back.position.set(0, h / 2, -w / 2);
    faces.back.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    faces.left.position.set(-l / 2, h / 2, 0);
    faces.left.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
    faces.right.position.set(l / 2, h / 2, 0);
    faces.right.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);

    Object.values(faces).forEach(mesh => {
        mesh.userData.folded = { position: mesh.position.clone(), quaternion: mesh.quaternion.clone() };
    });

    // Unfolded State (Cross Shape)
    faces.front.position.set(0, 0, 0);
    faces.front.quaternion.set(0, 0, 0, 1);
    
    faces.top.position.set(0, h/2 + w/2, 0);
    faces.top.quaternion.set(0, 0, 0, 1);
    
    faces.bottom.position.set(0, -(h/2 + w/2), 0);
    faces.bottom.quaternion.set(0, 0, 0, 1);
    
    faces.back.position.set(0, -(h/2 + w + h/2), 0);
    faces.back.quaternion.set(0, 0, 0, 1);
    
    faces.left.position.set(-(l/2 + w/2), 0, 0);
    faces.left.quaternion.set(0, 0, 0, 1);
    
    faces.right.position.set(l/2 + w/2, 0, 0);
    faces.right.quaternion.set(0, 0, 0, 1);

    Object.values(faces).forEach(mesh => {
        mesh.userData.unfolded = { position: mesh.position.clone(), quaternion: mesh.quaternion.clone() };
    });

    const measurementGroup = new THREE.Group();
    measurementGroup.visible = false;
    const offset = 0.5;
    const isCube = l === w && l === h;
    const labelL = isCube ? 'a' : 'l';
    const labelW = isCube ? 'a' : 'w';
    const labelH = isCube ? 'a' : 'h';
    
    measurementGroup.add(createDimensionLabel(labelL).translateX(0).translateY(-(h/2) - offset));
    measurementGroup.add(createDimensionLabel(labelH).translateX(l/2 + offset).translateY(0));
    measurementGroup.add(createDimensionLabel(labelW).translateX(l/2 + offset).translateY(h/2 + w/2));
    
    group.add(measurementGroup);
    group.userData.measurementGroup = measurementGroup;

    return group;
};

const createCylinderGroup = (dims: ShapeDimensions, material: THREE.Material, color: number) => {
    const { radius: r, height: h } = dims;
    const group = new THREE.Group();
    
    const capMaterials = createPartMaterials(new THREE.Color(color).multiplyScalar(0.7).getHex(), material);
    const bodyMaterials = createPartMaterials(color, material);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    
    const parts = {
        body: new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 32, 1, true), bodyMaterials.base),
        bottomCap: new THREE.Mesh(new THREE.CircleGeometry(r, 32), capMaterials.base),
        topCap: new THREE.Mesh(new THREE.CircleGeometry(r, 32), capMaterials.base),
    };
    
    setupMeshUserData(parts.body, 'body', bodyMaterials);
    setupMeshUserData(parts.bottomCap, 'caps', capMaterials);
    setupMeshUserData(parts.topCap, 'caps', capMaterials);
    
    parts.topCap.add(new THREE.LineSegments(new THREE.EdgesGeometry(parts.topCap.geometry), edgeMaterial));
    parts.bottomCap.add(new THREE.LineSegments(new THREE.EdgesGeometry(parts.bottomCap.geometry), edgeMaterial));
    Object.values(parts).forEach(mesh => group.add(mesh));
    
    parts.body.position.set(0, 0, 0);
    parts.bottomCap.position.set(0, -h/2, 0);
    parts.bottomCap.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
    parts.topCap.position.set(0, h/2, 0);
    parts.topCap.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    
    Object.values(parts).forEach(part => {
        part.userData.folded = { position: part.position.clone(), quaternion: part.quaternion.clone() };
    });
    
    const unfoldedBodyGeom = new THREE.PlaneGeometry(2 * Math.PI * r, h);
    parts.body.userData.foldedGeom = parts.body.geometry;
    parts.body.userData.unfoldedGeom = unfoldedBodyGeom;
    parts.body.userData.unfoldedEdges = new THREE.LineSegments(new THREE.EdgesGeometry(unfoldedBodyGeom), edgeMaterial);
    
    parts.body.position.set(0, 0, 0);
    parts.bottomCap.position.set(0, -(h/2 + r + 0.2), 0);
    parts.bottomCap.quaternion.set(0,0,0,1);
    parts.topCap.position.set(0, h/2 + r + 0.2, 0);
    parts.topCap.quaternion.set(0,0,0,1);
    
    Object.values(parts).forEach(part => {
        part.userData.unfolded = { position: part.position.clone(), quaternion: part.quaternion.clone() };
    });
    
    const measurementGroup = new THREE.Group();
    measurementGroup.visible = false;
    const offset = 0.5;
    const rectWidth = 2 * Math.PI * r;
    measurementGroup.add(createDimensionLabel('h').translateX(rectWidth/2 + offset).translateY(0));
    measurementGroup.add(createDimensionLabel('r').translateX(r/2).translateY(h/2 + r + 0.2 + offset));
    measurementGroup.add(createDimensionLabel('2πr').translateX(0).translateY(-h/2 - offset));

    group.add(measurementGroup);
    group.userData.measurementGroup = measurementGroup;
    
    return group;
};

const createConeGroup = (dims: ShapeDimensions, material: THREE.Material, color: number) => {
    const { radius: r, height: h } = dims;
    const group = new THREE.Group();

    const capMaterials = createPartMaterials(new THREE.Color(color).multiplyScalar(0.7).getHex(), material);
    const bodyMaterials = createPartMaterials(color, material);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });

    const parts = {
        body: new THREE.Mesh(new THREE.ConeGeometry(r, h, 32, 1, true), bodyMaterials.base),
        cap: new THREE.Mesh(new THREE.CircleGeometry(r, 32), capMaterials.base),
    };
    
    setupMeshUserData(parts.body, 'body', bodyMaterials);
    setupMeshUserData(parts.cap, 'cap', capMaterials);
    
    parts.cap.add(new THREE.LineSegments(new THREE.EdgesGeometry(parts.cap.geometry), edgeMaterial));
    Object.values(parts).forEach(mesh => group.add(mesh));

    // Folded State
    parts.body.position.y = h/2;
    parts.cap.position.y = 0;
    parts.cap.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
    
    Object.values(parts).forEach(p => p.userData.folded = { position: p.position.clone(), quaternion: p.quaternion.clone() });
    
    // Unfolded State
    const l = Math.sqrt(r*r + h*h); // Slant height
    const theta = (2 * Math.PI * r) / l; // Angle of sector in radians

    const unfoldedBodyGeom = new THREE.CircleGeometry(l, 64, -theta/2, theta);
    parts.body.userData.foldedGeom = parts.body.geometry;
    parts.body.userData.unfoldedGeom = unfoldedBodyGeom;
    parts.body.userData.unfoldedEdges = new THREE.LineSegments(new THREE.EdgesGeometry(unfoldedBodyGeom), edgeMaterial);
    
    parts.body.position.set(0, l / 2 + 0.2, 0);
    parts.body.quaternion.set(0, 0, 0, 1);
    
    parts.cap.position.set(0, -(r + 0.2), 0);
    parts.cap.quaternion.set(0, 0, 0, 1);
    
    Object.values(parts).forEach(p => p.userData.unfolded = { position: p.position.clone(), quaternion: p.quaternion.clone() });
    
    // Annotations for the unfolded view to show r, h, l relationship
    const unfoldedAnnotations = new THREE.Group();
    unfoldedAnnotations.visible = false;
    const triLineMaterial = new THREE.LineDashedMaterial({ color: 0xfde047, linewidth: 2, dashSize: 0.2, gapSize: 0.1, depthTest: false });

    // Position the triangle to the right of the unfolded shape
    const triX = r + 2; 
    const triY = -h / 2;

    const rPoints = [new THREE.Vector3(triX, triY, 0), new THREE.Vector3(triX + r, triY, 0)];
    const rGeom = new THREE.BufferGeometry().setFromPoints(rPoints);
    const rLine = new THREE.Line(rGeom, triLineMaterial);
    rLine.computeLineDistances();
    const rLabel = createDimensionLabel('r', 0.4);
    rLabel.position.set(triX + r / 2, triY - 0.5, 0);

    const hPoints = [new THREE.Vector3(triX + r, triY, 0), new THREE.Vector3(triX + r, triY + h, 0)];
    const hGeom = new THREE.BufferGeometry().setFromPoints(hPoints);
    const hLine = new THREE.Line(hGeom, triLineMaterial.clone());
    hLine.computeLineDistances();
    const hLabel = createDimensionLabel('h', 0.4);
    hLabel.position.set(triX + r + 0.5, triY + h / 2, 0);

    const lPoints = [new THREE.Vector3(triX, triY, 0), new THREE.Vector3(triX + r, triY + h, 0)];
    const lGeom = new THREE.BufferGeometry().setFromPoints(lPoints);
    const lLine = new THREE.Line(lGeom, triLineMaterial.clone());
    (lLine.material as THREE.LineDashedMaterial).color.set(0x60a5fa); // blue for slant height
    lLine.computeLineDistances();
    const lLabel = createDimensionLabel('l', 0.4);
    lLabel.position.set(triX + r / 2 - 0.3, triY + h / 2 + 0.3, 0);
    lLabel.material.rotation = Math.atan(h/r);

    unfoldedAnnotations.add(rLine, rLabel, hLine, hLabel, lLine, lLabel);
    group.add(unfoldedAnnotations);
    group.userData.unfoldedAnnotations = unfoldedAnnotations;

    // Dimension annotations for training (folded state)
    const dimensionAnnotations = new THREE.Group();
    dimensionAnnotations.visible = false;
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xfde047, linewidth: 3, depthTest: false });

    const hPointsFolded = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, h, 0)];
    const hGeomFolded = new THREE.BufferGeometry().setFromPoints(hPointsFolded);
    const hLineFolded = new THREE.Line(hGeomFolded, lineMaterial);
    const hLabelFolded = createDimensionLabel('h', 0.4);
    hLabelFolded.position.set(0.3, h / 2, 0);

    const rPointsFolded = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(r, 0, 0)];
    const rGeomFolded = new THREE.BufferGeometry().setFromPoints(rPointsFolded);
    const rLineFolded = new THREE.Line(rGeomFolded, lineMaterial);
    const rLabelFolded = createDimensionLabel('r', 0.4);
    rLabelFolded.position.set(r / 2, 0, -0.3);

    dimensionAnnotations.add(hLineFolded, hLabelFolded, rLineFolded, rLabelFolded);
    group.add(dimensionAnnotations);
    group.userData.dimensionAnnotations = dimensionAnnotations;

    return group;
};

const createHemisphereGroup = (dims: ShapeDimensions, material: THREE.Material, color: number) => {
    const { radius: r } = dims;
    const group = new THREE.Group();

    const baseMaterials = createPartMaterials(new THREE.Color(color).multiplyScalar(0.7).getHex(), material);
    const bodyMaterials = createPartMaterials(color, material);
    
    const parts = {
        body: new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), bodyMaterials.base),
        base: new THREE.Mesh(new THREE.CircleGeometry(r, 32), baseMaterials.base),
    };

    setupMeshUserData(parts.body, 'body', bodyMaterials);
    setupMeshUserData(parts.base, 'base', baseMaterials);

    Object.values(parts).forEach(mesh => group.add(mesh));

    parts.base.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
    Object.values(parts).forEach(p => p.userData.folded = { position: p.position.clone(), quaternion: p.quaternion.clone() });
    
    parts.body.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    parts.base.position.y = -r - 0.2;
    parts.base.quaternion.set(0,0,0,1);
    Object.values(parts).forEach(p => p.userData.unfolded = { position: p.position.clone(), quaternion: p.quaternion.clone() });

    return group;
}

const createSingleMeshGroup = (shapeType: ShapeType, dims: ShapeDimensions, material: THREE.Material, color: number) => {
    const group = new THREE.Group();
    const geometry = new THREE.SphereGeometry(dims.radius, 32, 16);
    
    const partMaterials = createPartMaterials(color, material);
    const mesh = new THREE.Mesh(geometry, partMaterials.base);
    
    setupMeshUserData(mesh, 'body', partMaterials);
    
    group.add(mesh);
    return group;
}


const createShapeGroup = (shapeType: ShapeType, dimensions: ShapeDimensions, material: THREE.Material) => {
    const color = SHAPE_DATA[shapeType].color;
    switch(shapeType) {
        case 'cube':
            return createCuboidGroup({ side: dimensions.side, length: dimensions.side, width: dimensions.side, height: dimensions.side }, material, color);
        case 'cuboid':
            return createCuboidGroup(dimensions, material, color);
        case 'cylinder':
            return createCylinderGroup(dimensions, material, color);
        case 'cone':
             return createConeGroup(dimensions, material, color);
        case 'hemisphere':
            return createHemisphereGroup(dimensions, material, color);
        case 'sphere': 
        default:
            return createSingleMeshGroup(shapeType, dimensions, material, color);
    }
}


// --- REACT COMPONENT ---
interface ShapeViewerProps {
    shapeType: ShapeType;
    dimensions: ShapeDimensions;
    isUnfolded: boolean;
    renderMode: RenderMode;
    highlightPartId: string | string[] | null;
    isTraining?: boolean;
}

export const ShapeViewer: React.FC<ShapeViewerProps> = ({ shapeType, dimensions, isUnfolded, renderMode, highlightPartId, isTraining }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const stateRef = useRef({
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(),
        renderer: new THREE.WebGLRenderer({ antialias: true, alpha: true }),
        controls: null as OrbitControls | null,
        shapeGroup: new THREE.Group(),
    }).current;

    const material = React.useMemo(() => new THREE.MeshStandardMaterial({
        color: SHAPE_DATA[shapeType].color,
        side: THREE.DoubleSide,
        wireframe: renderMode === 'wireframe',
        transparent: true,
    }), [shapeType, renderMode]);

    // One-time scene setup
    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        stateRef.scene.background = null;
        stateRef.camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        stateRef.camera.position.z = 10;
        
        stateRef.renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        currentMount.appendChild(stateRef.renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        stateRef.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        stateRef.scene.add(directionalLight);

        const controls = new OrbitControls(stateRef.camera, stateRef.renderer.domElement);
        controls.enableDamping = true;
        stateRef.controls = controls;

        stateRef.scene.add(stateRef.shapeGroup);

        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            controls.update();
            stateRef.renderer.render(stateRef.scene, stateRef.camera);
        };
        animate();

        const resizeObserver = new ResizeObserver(entries => {
            if (!entries || entries.length === 0) return;
            const { width, height } = entries[0].contentRect;
            stateRef.renderer.setSize(width, height);
            stateRef.camera.aspect = width / height;
            stateRef.camera.updateProjectionMatrix();
        });

        resizeObserver.observe(currentMount);

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameId);
            if (currentMount.contains(stateRef.renderer.domElement)) {
                currentMount.removeChild(stateRef.renderer.domElement);
            }
        };
    }, [stateRef]);

    // Rebuild shape and apply highlights when dependencies change
    useEffect(() => {
        while(stateRef.shapeGroup.children.length > 0) {
            stateRef.shapeGroup.remove(stateRef.shapeGroup.children[0]);
        }

        const newGroup = createShapeGroup(shapeType, dimensions, material);
        stateRef.shapeGroup.add(newGroup);
        stateRef.shapeGroup.userData.measurementGroup = newGroup.userData.measurementGroup;
        stateRef.shapeGroup.userData.dimensionAnnotations = newGroup.userData.dimensionAnnotations;
        stateRef.shapeGroup.userData.unfoldedAnnotations = newGroup.userData.unfoldedAnnotations;

        // Immediately set to correct fold state without animation
        newGroup.children.forEach(child => {
            if (child.userData.unfoldedGeom) {
                const mesh = child as THREE.Mesh;
                mesh.geometry.dispose();
                mesh.geometry = isUnfolded ? mesh.userData.unfoldedGeom : mesh.userData.foldedGeom;

                const edgesToRemove = mesh.children.filter(c => c.type === 'LineSegments');
                edgesToRemove.forEach(edge => mesh.remove(edge));
                if (isUnfolded && mesh.userData.unfoldedEdges) {
                    mesh.add(mesh.userData.unfoldedEdges);
                }
            }

            const targetState = isUnfolded ? child.userData.unfolded : child.userData.folded;
            if (targetState) {
                child.position.copy(targetState.position);
                child.quaternion.copy(targetState.quaternion);
            }
        });
        
        if (newGroup.userData.measurementGroup) {
            newGroup.userData.measurementGroup.visible = isUnfolded;
        }
        
        if (newGroup.userData.unfoldedAnnotations) {
            newGroup.userData.unfoldedAnnotations.visible = isUnfolded;
        }
        
        const annotations = stateRef.shapeGroup.userData.dimensionAnnotations;
        if (annotations) {
            annotations.visible = isTraining && shapeType === 'cone' && !isUnfolded;
        }

        // Apply highlights to the newly created shape
        stateRef.shapeGroup.traverse((object) => {
            if (object.type === 'Mesh') {
                const mesh = object as THREE.Mesh;
                if (mesh.userData.originalMaterial && mesh.userData.highlightMaterial) {
                    const isHighlighted = highlightPartId === mesh.name || (Array.isArray(highlightPartId) && highlightPartId.includes(mesh.name));
                    mesh.material = isHighlighted ? mesh.userData.highlightMaterial : mesh.userData.originalMaterial;
                }
            }
        });
        
    }, [shapeType, dimensions, material, isUnfolded, highlightPartId, isTraining, stateRef.shapeGroup]);
    
    // Animate fold/unfold when `isUnfolded` changes
    useEffect(() => {
        stateRef.shapeGroup.children.forEach(group => {
            if (group.userData.unfoldedAnnotations) {
                // Make it appear halfway through the animation
                setTimeout(() => {
                    if (group.userData.unfoldedAnnotations) { // check again in case state changed
                       group.userData.unfoldedAnnotations.visible = isUnfolded;
                    }
                }, 250);
            }
            if (group.userData.measurementGroup) {
                group.userData.measurementGroup.visible = isUnfolded;
            }
            if (group.userData.dimensionAnnotations) {
                group.userData.dimensionAnnotations.visible = isTraining && shapeType === 'cone' && !isUnfolded;
            }
            group.children.forEach(child => {
                if (child.userData.unfoldedGeom) {
                    const mesh = child as THREE.Mesh;
                    setTimeout(() => {
                        if (!mesh.geometry) return;
                        mesh.geometry.dispose();
                        mesh.geometry = isUnfolded ? mesh.userData.unfoldedGeom : mesh.userData.foldedGeom;

                        const edgesToRemove = mesh.children.filter(c => c.type === 'LineSegments');
                        edgesToRemove.forEach(edge => mesh.remove(edge));
                        if (isUnfolded && mesh.userData.unfoldedEdges) {
                             mesh.add(mesh.userData.unfoldedEdges);
                        }
                    }, 250); 
                }
                const targetState = isUnfolded ? child.userData.unfolded : child.userData.folded;
                if(targetState) {
                    createAnimation(child, targetState, 500);
                }
            })
        });
    }, [isUnfolded, shapeType, isTraining, stateRef.shapeGroup]);

    // Autofit camera when shape changes
    useEffect(() => {
        const fitCameraToObject = () => {
            if (!stateRef.shapeGroup.children.length || !stateRef.controls) return;

            const box = new THREE.Box3().setFromObject(stateRef.shapeGroup);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = stateRef.camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
            
            cameraZ *= 1.6; // add some padding
            
            if (stateRef.camera.aspect < 1) { // Adjust for portrait aspect ratios
                cameraZ /= stateRef.camera.aspect;
            }

            const newPosition = new THREE.Vector3(center.x, center.y, center.z + Math.max(cameraZ, 8));

            stateRef.camera.position.copy(newPosition);
            stateRef.controls.target.copy(center);
            stateRef.controls.update();
        };
        
        const timer = setTimeout(fitCameraToObject, 550); // Wait for fold/unfold animation
        return () => clearTimeout(timer);

    }, [shapeType, dimensions, isUnfolded, stateRef]);

    return <div ref={mountRef} className="w-full h-full" />;
};
