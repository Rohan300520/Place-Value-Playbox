import * as THREE from 'three';
import type { ShapeType, ShapeDimensions } from '../../../types';

const MATERIAL = new THREE.MeshStandardMaterial({
    color: 0x38bdf8, // sky-500
    metalness: 0.2,
    roughness: 0.6,
    side: THREE.DoubleSide,
});

const LINE_MATERIAL = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });

const createEdges = (geometry: THREE.BufferGeometry) => {
    const edges = new THREE.EdgesGeometry(geometry);
    return new THREE.LineSegments(edges, LINE_MATERIAL);
};

// --- MESH CREATION FUNCTIONS ---

const createCuboid = (dims: ShapeDimensions) => {
    const l = dims.l > 0 ? dims.l : 5;
    const b = dims.b > 0 ? dims.b : 4;
    const h = dims.h > 0 ? dims.h : 3;
    const geometry = new THREE.BoxGeometry(l, h, b);
    const mesh = new THREE.Mesh(geometry, MATERIAL);
    mesh.add(createEdges(geometry));
    const group = new THREE.Group();
    group.add(mesh);
    return group;
};

const createCube = (dims: ShapeDimensions) => {
    const a = dims.a > 0 ? dims.a : 4;
    const geometry = new THREE.BoxGeometry(a, a, a);
    const mesh = new THREE.Mesh(geometry, MATERIAL);
    mesh.add(createEdges(geometry));
    const group = new THREE.Group();
    group.add(mesh);
    return group;
};

const createCylinder = (dims: ShapeDimensions) => {
    const r = dims.r > 0 ? dims.r : 2;
    const h = dims.h > 0 ? dims.h : 5;
    const geometry = new THREE.CylinderGeometry(r, r, h, 32);
    const mesh = new THREE.Mesh(geometry, MATERIAL);
    mesh.add(createEdges(geometry));
    const group = new THREE.Group();
    group.add(mesh);
    return group;
};

const createCone = (dims: ShapeDimensions) => {
    const r = dims.r > 0 ? dims.r : 3;
    const h = dims.h > 0 ? dims.h : 4;
    const geometry = new THREE.ConeGeometry(r, h, 32);
    const mesh = new THREE.Mesh(geometry, MATERIAL);
    mesh.add(createEdges(geometry));
    const group = new THREE.Group();
    group.add(mesh);
    return group;
};

const createSphere = (dims: ShapeDimensions) => {
    const r = dims.r > 0 ? dims.r : 3;
    const geometry = new THREE.SphereGeometry(r, 32, 16);
    const mesh = new THREE.Mesh(geometry, MATERIAL);
    const group = new THREE.Group();
    group.add(mesh);
    return group;
};

const createHemisphere = (dims: ShapeDimensions) => {
    const r = dims.r > 0 ? dims.r : 3;
    const geometry = new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const mesh = new THREE.Mesh(geometry, MATERIAL);
    const cap = new THREE.Mesh(new THREE.CircleGeometry(r, 32), MATERIAL);
    cap.rotation.x = -Math.PI / 2;
    const group = new THREE.Group();
    group.add(mesh, cap);
    return group;
};

const createConeOnHemisphere = (dims: ShapeDimensions) => {
    const r = dims.r > 0 ? dims.r : 3;
    const h = dims.h > 0 ? dims.h : 4;
    const group = new THREE.Group();

    const hemiGeom = new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const hemiMesh = new THREE.Mesh(hemiGeom, MATERIAL);
    
    const coneGeom = new THREE.ConeGeometry(r, h, 32);
    const coneMesh = new THREE.Mesh(coneGeom, MATERIAL);
    coneMesh.position.y = h / 2;

    group.add(hemiMesh, coneMesh);
    group.position.y = -h/4;
    return group;
};

const createCapsule = (dims: ShapeDimensions) => {
    const r = dims.r > 0 ? dims.r : 2;
    const h = dims.h > 0 ? dims.h : 5;
    const group = new THREE.Group();

    const cylGeom = new THREE.CylinderGeometry(r, r, h, 32);
    const cylMesh = new THREE.Mesh(cylGeom, MATERIAL);

    const hemiGeom = new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const topHemi = new THREE.Mesh(hemiGeom, MATERIAL);
    topHemi.position.y = h / 2;
    const bottomHemi = new THREE.Mesh(hemiGeom, MATERIAL);
    bottomHemi.rotation.x = Math.PI;
    bottomHemi.position.y = -h / 2;
    
    group.add(cylMesh, topHemi, bottomHemi);
    return group;
};

const createConeOnCylinder = (dims: ShapeDimensions) => {
     const r = dims.r > 0 ? dims.r : 3;
     const hCyl = dims.hCyl > 0 ? dims.hCyl : 4;
     const hCone = dims.hCone > 0 ? dims.hCone : 4;
     const group = new THREE.Group();

     const cylGeom = new THREE.CylinderGeometry(r, r, hCyl, 32);
     const cylMesh = new THREE.Mesh(cylGeom, MATERIAL);

     const coneGeom = new THREE.ConeGeometry(r, hCone, 32);
     const coneMesh = new THREE.Mesh(coneGeom, MATERIAL);
     coneMesh.position.y = hCyl / 2 + hCone / 2;
     
     group.add(cylMesh, coneMesh);
     group.position.y = -hCone/2;
     return group;
};

const createFrustum = (dims: ShapeDimensions) => {
    const r1 = dims.r1 > 0 ? dims.r1 : 4;
    const r2 = dims.r2 > 0 ? dims.r2 : 2;
    const h = dims.h > 0 ? dims.h : 5;
    const geometry = new THREE.CylinderGeometry(r2, r1, h, 32);
    const mesh = new THREE.Mesh(geometry, MATERIAL);
    mesh.add(createEdges(geometry));
    const group = new THREE.Group();
    group.add(mesh);
    return group;
};


// --- UNFOLDED MESH CREATION FUNCTIONS ---

const createUnfoldedCuboid = (dims: ShapeDimensions) => {
    const l = dims.l > 0 ? dims.l : 5;
    const b = dims.b > 0 ? dims.b : 4;
    const h = dims.h > 0 ? dims.h : 3;
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.PlaneGeometry(l, b), MATERIAL);
    const top = base.clone();
    top.position.y = b + h;
    const front = new THREE.Mesh(new THREE.PlaneGeometry(l, h), MATERIAL);
    front.position.y = b/2 + h/2;
    const back = front.clone();
    back.position.y = -b/2 - h/2;
    const left = new THREE.Mesh(new THREE.PlaneGeometry(b, h), MATERIAL);
    left.position.set(-l/2 - b/2, 0, 0);
    left.rotation.y = Math.PI / 2;
    const right = left.clone();
    right.position.x = l/2 + b/2;

    group.add(base, top, front, back, left, right);
    group.rotation.x = -Math.PI / 2;
    return group;
};

const createUnfoldedCylinder = (dims: ShapeDimensions) => {
    const r = dims.r > 0 ? dims.r : 2;
    const h = dims.h > 0 ? dims.h : 5;
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.PlaneGeometry(2 * Math.PI * r, h), MATERIAL);
    const top = new THREE.Mesh(new THREE.CircleGeometry(r, 32), MATERIAL);
    top.position.y = h/2 + r;
    const bottom = top.clone();
    bottom.position.y = -h/2 - r;
    group.add(body, top, bottom);
    group.rotation.x = -Math.PI / 2;
    return group;
};

const createUnfoldedCone = (dims: ShapeDimensions) => {
    const r = dims.r > 0 ? dims.r : 3;
    const h = dims.h > 0 ? dims.h : 4;
    const l = Math.sqrt(r * r + h * h);
    const angle = l > 0 ? (2 * Math.PI * r) / l : 0;

    const group = new THREE.Group();
    
    const base = new THREE.Mesh(new THREE.CircleGeometry(r, 32), MATERIAL);
    base.position.y = -l/2;
    
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(0, 0);
    bodyShape.arc(0, 0, l, -angle/2, angle/2, false);
    bodyShape.lineTo(0, 0);
    const body = new THREE.Mesh(new THREE.ShapeGeometry(bodyShape), MATERIAL);
    body.position.y = l/2 - l/2;

    group.add(base, body);
    group.rotation.x = -Math.PI / 2;
    return group;
};


// --- MAIN EXPORTED FUNCTIONS ---

export const createShapeMesh = (shape: ShapeType, dimensions: ShapeDimensions): THREE.Group => {
    switch (shape) {
        case 'cuboid': return createCuboid(dimensions);
        case 'cube': return createCube(dimensions);
        case 'cylinder': return createCylinder(dimensions);
        case 'cone': return createCone(dimensions);
        case 'sphere': return createSphere(dimensions);
        case 'hemisphere': return createHemisphere(dimensions);
        case 'cone_on_hemisphere': return createConeOnHemisphere(dimensions);
        case 'cylinder_with_hemispheres': return createCapsule(dimensions);
        case 'cone_on_cylinder': return createConeOnCylinder(dimensions);
        case 'frustum': return createFrustum(dimensions);
        default: return new THREE.Group();
    }
};

export const createUnfoldedMesh = (shape: ShapeType, dimensions: ShapeDimensions): THREE.Group => {
    switch (shape) {
        case 'cuboid': return createUnfoldedCuboid(dimensions);
        case 'cube': {
            const a = dimensions.a > 0 ? dimensions.a : 4;
            return createUnfoldedCuboid({ l: a, b: a, h: a });
        }
        case 'cylinder': return createUnfoldedCylinder(dimensions);
        case 'cone': return createUnfoldedCone(dimensions);
        // Sphere and Hemisphere cannot be perfectly unfolded into 2D shapes
        case 'sphere': return createSphere(dimensions);
        case 'hemisphere': return createHemisphere(dimensions);
        default: return createShapeMesh(shape, dimensions); // Fallback for non-unfoldable shapes
    }
};