// Fix: Export BASE_MATERIAL to be used in other components like Canvas3D.
import * as THREE from 'three';
import type { ShapeType, ShapeDimensions } from '../../../types';

export const BASE_MATERIAL = new THREE.MeshStandardMaterial({
    color: 0x38bdf8, // sky-500
    metalness: 0.2,
    roughness: 0.6,
    side: THREE.DoubleSide,
});

const LINE_MATERIAL = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
const DASHED_LINE_MATERIAL = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.2, gapSize: 0.1 });

const createEdges = (geometry: THREE.BufferGeometry) => {
    const edges = new THREE.EdgesGeometry(geometry);
    return new THREE.LineSegments(edges, LINE_MATERIAL);
};

// --- NEW HELPERS FOR LABELS ---
function createTextSprite(text: string, options: { color?: string, fontSize?: number } = {}) {
    const { color = 'rgba(224, 242, 254, 1)', fontSize = 48 } = options;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    // Fix: The THREE.Sprite constructor requires a material argument.
    // Fix: Provide a default SpriteMaterial to the Sprite constructor.
    if (!context) return new THREE.Sprite(new THREE.SpriteMaterial());

    context.font = `Bold ${fontSize}px Arial`;
    const textMetrics = context.measureText(text);
    
    canvas.width = textMetrics.width + 20;
    canvas.height = fontSize + 20;
    
    context.font = `Bold ${fontSize}px Arial`;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    const aspect = canvas.width / canvas.height;
    sprite.scale.set(aspect * 1.5, 1.5, 1);

    return sprite;
}

function createLabelWithLine(p1: THREE.Vector3, p2: THREE.Vector3, text: string, textOffset: THREE.Vector3) {
    const group = new THREE.Group();
    const lineGeom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    const line = new THREE.Line(lineGeom, DASHED_LINE_MATERIAL);
    line.computeLineDistances();
    group.add(line);

    const textSprite = createTextSprite(text);
    
    // Position the text sprite at the midpoint of the line and apply the offset
    const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    textSprite.position.copy(midPoint).add(textOffset);

    group.add(textSprite);
    return group;
}


// --- MESH CREATION FUNCTIONS ---

const createCuboid = (dims: ShapeDimensions) => {
    const l = dims.l > 0 ? dims.l : 5;
    const b = dims.b > 0 ? dims.b : 4;
    const h = dims.h > 0 ? dims.h : 3;
    const group = new THREE.Group();
    
    // Geometry for each face
    const frontGeom = new THREE.PlaneGeometry(l, h);
    const sideGeom = new THREE.PlaneGeometry(b, h);
    const topGeom = new THREE.PlaneGeometry(l, b);

    // Create meshes with names
    const front = new THREE.Mesh(frontGeom, BASE_MATERIAL); front.name = 'front';
    front.position.set(0, 0, b / 2);
    
    const back = new THREE.Mesh(frontGeom, BASE_MATERIAL); back.name = 'back';
    back.position.set(0, 0, -b / 2);
    back.rotation.y = Math.PI;

    const left = new THREE.Mesh(sideGeom, BASE_MATERIAL); left.name = 'left';
    left.position.set(-l / 2, 0, 0);
    left.rotation.y = -Math.PI / 2;
    
    const right = new THREE.Mesh(sideGeom, BASE_MATERIAL); right.name = 'right';
    right.position.set(l / 2, 0, 0);
    right.rotation.y = Math.PI / 2;

    const top = new THREE.Mesh(topGeom, BASE_MATERIAL); top.name = 'top';
    top.position.set(0, h / 2, 0);
    top.rotation.x = -Math.PI / 2;

    const bottom = new THREE.Mesh(topGeom, BASE_MATERIAL); bottom.name = 'bottom';
    bottom.position.set(0, -h / 2, 0);
    bottom.rotation.x = Math.PI / 2;

    group.add(front, back, left, right, top, bottom);
    
    // Add edges for better visualization
    group.add(createEdges(new THREE.BoxGeometry(l, h, b)));
    
    return group;
};

const createCube = (dims: ShapeDimensions) => {
    const a = dims.a > 0 ? dims.a : 4;
    // Reuse the cuboid logic with equal sides
    return createCuboid({ l: a, b: a, h: a });
};

const createCylinder = (dims: ShapeDimensions) => {
    const r = dims.r > 0 ? dims.r : 2;
    const h = dims.h > 0 ? dims.h : 5;
    const group = new THREE.Group();

    const bodyGeom = new THREE.CylinderGeometry(r, r, h, 32);
    const body = new THREE.Mesh(bodyGeom, BASE_MATERIAL);
    body.name = 'body_rect';
    group.add(body);
    
    const capGeom = new THREE.CircleGeometry(r, 32);
    const topCap = new THREE.Mesh(capGeom, BASE_MATERIAL);
    topCap.name = 'top_circle';
    topCap.position.y = h/2;
    topCap.rotation.x = -Math.PI / 2;
    group.add(topCap);

    const bottomCap = new THREE.Mesh(capGeom, BASE_MATERIAL);
    bottomCap.name = 'bottom_circle';
    bottomCap.position.y = -h/2;
    bottomCap.rotation.x = Math.PI / 2;
    group.add(bottomCap);

    return group;
};

const createCone = (dims: ShapeDimensions) => {
    const r = dims.r > 0 ? dims.r : 3;
    const h = dims.h > 0 ? dims.h : 4;
    const group = new THREE.Group();

    const bodyGeom = new THREE.ConeGeometry(r, h, 32);
    const body = new THREE.Mesh(bodyGeom, BASE_MATERIAL);
    body.name = 'body_main';
    body.position.y = h/2;
    group.add(body);

    const baseGeom = new THREE.CircleGeometry(r, 32);
    const base = new THREE.Mesh(baseGeom, BASE_MATERIAL);
    base.name = 'base_circle';
    base.rotation.x = -Math.PI/2;
    group.add(base);

    group.position.y = -h/2;
    return group;
};

const createSphere = (dims: ShapeDimensions) => {
    const r = dims.r > 0 ? dims.r : 3;
    const geometry = new THREE.SphereGeometry(r, 32, 16);
    const mesh = new THREE.Mesh(geometry, BASE_MATERIAL);
    mesh.name = 'sphere_surface';
    const group = new THREE.Group();
    group.add(mesh);
    return group;
};

const createHemisphere = (dims: ShapeDimensions) => {
    const r = dims.r > 0 ? dims.r : 3;
    const group = new THREE.Group();

    const curvedSurfaceGeom = new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const curvedSurface = new THREE.Mesh(curvedSurfaceGeom, BASE_MATERIAL);
    curvedSurface.name = 'curved_surface';
    group.add(curvedSurface);

    const cap = new THREE.Mesh(new THREE.CircleGeometry(r, 32), BASE_MATERIAL);
    cap.name = 'base_circle';
    cap.rotation.x = -Math.PI / 2;
    group.add(cap);
    
    return group;
};

const createConeOnHemisphere = (dims: ShapeDimensions) => {
    const r = dims.r > 0 ? dims.r : 3;
    const h = dims.h > 0 ? dims.h : 4;
    const group = new THREE.Group();

    const hemiGeom = new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const hemiMesh = new THREE.Mesh(hemiGeom, BASE_MATERIAL);
    hemiMesh.name = 'hemisphere_surface';
    
    const coneGeom = new THREE.ConeGeometry(r, h, 32);
    const coneMesh = new THREE.Mesh(coneGeom, BASE_MATERIAL);
    coneMesh.name = 'cone_surface';
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
    const cylMesh = new THREE.Mesh(cylGeom, BASE_MATERIAL);
    cylMesh.name = 'cylinder_body';

    const hemiGeom = new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    
    const topHemi = new THREE.Mesh(hemiGeom, BASE_MATERIAL);
    topHemi.name = 'top_hemisphere';
    topHemi.position.y = h / 2;

    const bottomHemi = new THREE.Mesh(hemiGeom, BASE_MATERIAL);
    bottomHemi.name = 'bottom_hemisphere';
    bottomHemi.position.y = -h / 2;
    bottomHemi.rotation.x = Math.PI;

    group.add(cylMesh, topHemi, bottomHemi);
    return group;
};

// Fix: Add missing mesh creation function
const createConeOnCylinder = (dims: ShapeDimensions) => {
    const r = dims.r > 0 ? dims.r : 3;
    const hCyl = dims.hCyl > 0 ? dims.hCyl : 4;
    const hCone = dims.hCone > 0 ? dims.hCone : 4;
    const group = new THREE.Group();

    const cylGeom = new THREE.CylinderGeometry(r, r, hCyl, 32);
    const cylMesh = new THREE.Mesh(cylGeom, BASE_MATERIAL);
    cylMesh.name = 'cylinder_body';
    cylMesh.position.y = hCyl / 2;

    const coneGeom = new THREE.ConeGeometry(r, hCone, 32);
    const coneMesh = new THREE.Mesh(coneGeom, BASE_MATERIAL);
    coneMesh.name = 'cone_top';
    coneMesh.position.y = hCyl + hCone / 2;
    
    const base = new THREE.Mesh(new THREE.CircleGeometry(r, 32), BASE_MATERIAL);
    base.name = 'base_circle';
    base.rotation.x = -Math.PI/2;

    group.add(cylMesh, coneMesh, base);
    group.position.y = -hCyl / 2;
    return group;
};

// Fix: Add missing mesh creation function
const createFrustum = (dims: ShapeDimensions) => {
    const r1 = dims.r1 > 0 ? dims.r1 : 4;
    const r2 = dims.r2 > 0 ? dims.r2 : 2;
    const h = dims.h > 0 ? dims.h : 5;
    const group = new THREE.Group();

    const geom = new THREE.CylinderGeometry(r1, r2, h, 32);
    const mesh = new THREE.Mesh(geom, BASE_MATERIAL);
    mesh.name = 'frustum_body';
    mesh.position.y = h/2;
    group.add(mesh);
    
    const topCap = new THREE.Mesh(new THREE.CircleGeometry(r2, 32), BASE_MATERIAL);
    topCap.name = 'top_circle';
    topCap.position.y = h;
    topCap.rotation.x = -Math.PI / 2;
    group.add(topCap);
    
    const bottomCap = new THREE.Mesh(new THREE.CircleGeometry(r1, 32), BASE_MATERIAL);
    bottomCap.name = 'bottom_circle';
    bottomCap.rotation.x = -Math.PI / 2;
    group.add(bottomCap);

    group.position.y = -h/2;
    return group;
};


// --- UNFOLDED MESH CREATION FUNCTIONS ---

const createUnfoldedCuboid = (dims: ShapeDimensions) => {
    const l = dims.l > 0 ? dims.l : 5;
    const b = dims.b > 0 ? dims.b : 4;
    const h = dims.h > 0 ? dims.h : 3;
    const group = new THREE.Group();

    const frontGeom = new THREE.PlaneGeometry(l, h);
    const sideGeom = new THREE.PlaneGeometry(b, h);
    const topGeom = new THREE.PlaneGeometry(l, b);

    const front = new THREE.Mesh(frontGeom, BASE_MATERIAL); front.name = 'front';
    const back = new THREE.Mesh(frontGeom, BASE_MATERIAL); back.name = 'back';
    const left = new THREE.Mesh(sideGeom, BASE_MATERIAL); left.name = 'left';
    const right = new THREE.Mesh(sideGeom, BASE_MATERIAL); right.name = 'right';
    const top = new THREE.Mesh(topGeom, BASE_MATERIAL); top.name = 'top';
    const bottom = new THREE.Mesh(topGeom, BASE_MATERIAL); bottom.name = 'bottom';
    
    // Position them in a cross shape
    bottom.position.set(0, 0, 0);
    front.position.set(0, b/2 + h/2, 0);
    back.position.set(0, -b/2 - h/2, 0);
    left.position.set(-l/2 - b/2, 0, 0);
    right.position.set(l/2 + b/2, 0, 0);
    top.position.set(0, b/2 + h + b/2, 0);
    
    group.add(front, back, left, right, top, bottom);
    return group;
};

const createUnfoldedCube = (dims: ShapeDimensions) => {
    const a = dims.a > 0 ? dims.a : 4;
    return createUnfoldedCuboid({ l: a, b: a, h: a });
};

const createUnfoldedCylinder = (dims: ShapeDimensions) => {
    const r = dims.r > 0 ? dims.r : 2;
    const h = dims.h > 0 ? dims.h : 5;
    const group = new THREE.Group();

    const bodyGeom = new THREE.PlaneGeometry(2 * Math.PI * r, h);
    const body = new THREE.Mesh(bodyGeom, BASE_MATERIAL);
    body.name = 'body_rect';
    
    const capGeom = new THREE.CircleGeometry(r, 32);
    const topCap = new THREE.Mesh(capGeom, BASE_MATERIAL);
    topCap.name = 'top_circle';
    topCap.position.y = h/2 + r;

    const bottomCap = new THREE.Mesh(capGeom, BASE_MATERIAL);
    bottomCap.name = 'bottom_circle';
    bottomCap.position.y = -h/2 - r;

    group.add(body, topCap, bottomCap);
    return group;
};

const createUnfoldedCone = (dims: ShapeDimensions) => {
    const r = dims.r > 0 ? dims.r : 3;
    const h = dims.h > 0 ? dims.h : 4;
    const l = Math.sqrt(h * h + r * r);
    const group = new THREE.Group();
    
    const angle = (2 * Math.PI * r) / l;

    const sectorShape = new THREE.Shape();
    sectorShape.moveTo(0, 0);
    sectorShape.arc(0, 0, l, -angle/2, angle/2, false);
    sectorShape.lineTo(0, 0);
    
    const bodyGeom = new THREE.ShapeGeometry(sectorShape);
    const body = new THREE.Mesh(bodyGeom, BASE_MATERIAL);
    body.name = 'body_main';
    
    const baseGeom = new THREE.CircleGeometry(r, 32);
    const base = new THREE.Mesh(baseGeom, BASE_MATERIAL);
    base.name = 'base_circle';
    base.position.y = -l - r;
    
    group.add(body, base);
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
        case 'cube': return createUnfoldedCube(dimensions);
        case 'cylinder': return createUnfoldedCylinder(dimensions);
        case 'cone': return createUnfoldedCone(dimensions);
        // Fallback for shapes that don't have a simple 2D net
        default: return createShapeMesh(shape, dimensions);
    }
};
