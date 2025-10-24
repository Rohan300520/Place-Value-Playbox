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
    // FIX: Provide a default material to the Sprite constructor. Some versions of Three.js might require an argument.
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
    cylMesh.name = 'cylinder_surface';

    const hemiGeom = new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const topHemi = new THREE.Mesh(hemiGeom, BASE_MATERIAL);
    topHemi.name = 'top_hemisphere_surface';
    topHemi.position.y = h / 2;

    const bottomHemi = new THREE.Mesh(hemiGeom, BASE_MATERIAL);
    bottomHemi.name = 'bottom_hemisphere_surface';
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
     const cylMesh = new THREE.Mesh(cylGeom, BASE_MATERIAL);
     cylMesh.name = 'cylinder_surface';
     
     const baseGeom = new THREE.CircleGeometry(r, 32);
     const baseMesh = new THREE.Mesh(baseGeom, BASE_MATERIAL);
     baseMesh.name = 'base_circle';
     baseMesh.rotation.x = -Math.PI / 2;
     baseMesh.position.y = -hCyl / 2;

     const coneGeom = new THREE.ConeGeometry(r, hCone, 32);
     const coneMesh = new THREE.Mesh(coneGeom, BASE_MATERIAL);
     coneMesh.name = 'cone_surface';
     coneMesh.position.y = hCyl / 2 + hCone / 2;
     
     group.add(cylMesh, coneMesh, baseMesh);
     group.position.y = -hCone/2;
     return group;
};

const createFrustum = (dims: ShapeDimensions) => {
    const r1 = dims.r1 > 0 ? dims.r1 : 4; // bottom
    const r2 = dims.r2 > 0 ? dims.r2 : 2; // top
    const h = dims.h > 0 ? dims.h : 5;
    const group = new THREE.Group();

    const bodyGeom = new THREE.CylinderGeometry(r2, r1, h, 32);
    const body = new THREE.Mesh(bodyGeom, BASE_MATERIAL);
    body.name = 'curved_surface';
    group.add(body);
    
    const topGeom = new THREE.CircleGeometry(r2, 32);
    const top = new THREE.Mesh(topGeom, BASE_MATERIAL);
    top.name = 'top_circle';
    top.rotation.x = -Math.PI/2;
    top.position.y = h/2;
    group.add(top);

    const bottomGeom = new THREE.CircleGeometry(r1, 32);
    const bottom = new THREE.Mesh(bottomGeom, BASE_MATERIAL);
    bottom.name = 'bottom_circle';
    bottom.rotation.x = -Math.PI/2;
    bottom.position.y = -h/2;
    group.add(bottom);
    
    return group;
};


// --- UNFOLDED MESH CREATION FUNCTIONS ---

const createUnfoldedCuboid = (dims: ShapeDimensions) => {
    const l = dims.l > 0 ? dims.l : 5;
    const b = dims.b > 0 ? dims.b : 4;
    const h = dims.h > 0 ? dims.h : 3;
    const group = new THREE.Group();

    // Meshes
    const bottom = new THREE.Mesh(new THREE.PlaneGeometry(l, b), BASE_MATERIAL); bottom.name = 'bottom';
    const top = bottom.clone(); top.name = 'top';
    top.position.y = b + h;
    const front = new THREE.Mesh(new THREE.PlaneGeometry(l, h), BASE_MATERIAL); front.name = 'front';
    front.position.y = b/2 + h/2;
    const back = front.clone(); back.name = 'back';
    back.position.y = -b/2 - h/2;
    const left = new THREE.Mesh(new THREE.PlaneGeometry(b, h), BASE_MATERIAL); left.name = 'left';
    left.position.x = -l/2 - b/2;
    const right = left.clone(); right.name = 'right';
    right.position.x = l/2 + b/2;

    group.add(bottom, top, front, back, left, right);
    
    // Labels with lines
    const labelL = createLabelWithLine(new THREE.Vector3(-l/2, -b/2, 0), new THREE.Vector3(l/2, -b/2, 0), 'l', new THREE.Vector3(0, -1, 0));
    const labelB = createLabelWithLine(new THREE.Vector3(-l/2, -b/2, 0), new THREE.Vector3(-l/2, b/2, 0), 'b', new THREE.Vector3(-1, 0, 0));
    const frontPosY = b/2 + h/2;
    const labelH = createLabelWithLine(new THREE.Vector3(l/2, frontPosY - h/2, 0), new THREE.Vector3(l/2, frontPosY + h/2, 0), 'h', new THREE.Vector3(1, 0, 0));
    group.add(labelL, labelB, labelH);

    group.rotation.x = -Math.PI / 2;
    return group;
};

const createUnfoldedCube = (dims: ShapeDimensions) => {
    const a = dims.a > 0 ? dims.a : 4;
    const group = new THREE.Group();
    const geom = new THREE.PlaneGeometry(a, a);
    
    // Meshes
    const bottom = new THREE.Mesh(geom, BASE_MATERIAL); bottom.name = 'bottom';
    const top = bottom.clone(); top.name = 'top';
    top.position.y = a + a;
    const front = new THREE.Mesh(geom, BASE_MATERIAL); front.name = 'front';
    front.position.y = a/2 + a/2;
    const back = front.clone(); back.name = 'back';
    back.position.y = -a/2 - a/2;
    const left = new THREE.Mesh(geom, BASE_MATERIAL); left.name = 'left';
    left.position.x = -a/2 - a/2;
    const right = left.clone(); right.name = 'right';
    right.position.x = a/2 + a/2;
    
    group.add(bottom, top, front, back, left, right);
    
    // Labels with lines
    const labelSide1 = createLabelWithLine(new THREE.Vector3(-a/2, -a/2, 0), new THREE.Vector3(a/2, -a/2, 0), 'a', new THREE.Vector3(0, -1, 0));
    const labelSide2 = createLabelWithLine(new THREE.Vector3(-a/2, -a/2, 0), new THREE.Vector3(-a/2, a/2, 0), 'a', new THREE.Vector3(-1, 0, 0));
    const frontPosY = a/2 + a/2;
    const labelSide3 = createLabelWithLine(new THREE.Vector3(a/2, frontPosY - a/2, 0), new THREE.Vector3(a/2, frontPosY + a/2, 0), 'a', new THREE.Vector3(1, 0, 0));
    group.add(labelSide1, labelSide2, labelSide3);

    group.rotation.x = -Math.PI / 2;
    return group;
};

const createUnfoldedCylinder = (dims: ShapeDimensions) => {
    const r = dims.r > 0 ? dims.r : 2;
    const h = dims.h > 0 ? dims.h : 5;
    const group = new THREE.Group();
    
    // Meshes
    const rectWidth = 2 * Math.PI * r;
    const body = new THREE.Mesh(new THREE.PlaneGeometry(rectWidth, h), BASE_MATERIAL);
    body.name = 'body_rect';
    
    const top = new THREE.Mesh(new THREE.CircleGeometry(r, 32), BASE_MATERIAL);
    top.name = 'top_circle';
    top.position.y = h/2 + r + 0.5;
    
    const bottom = top.clone();
    bottom.name = 'bottom_circle';
    bottom.position.y = -(h/2 + r + 0.5);

    group.add(body, top, bottom);

    // Labels with lines
    const labelH = createLabelWithLine(new THREE.Vector3(rectWidth/2, -h/2, 0), new THREE.Vector3(rectWidth/2, h/2, 0), 'h', new THREE.Vector3(1, 0, 0));
    const labelCircumference = createLabelWithLine(new THREE.Vector3(-rectWidth/2, h/2, 0), new THREE.Vector3(rectWidth/2, h/2, 0), '2πr', new THREE.Vector3(0, 1, 0));
    const topRadiusLabel = createLabelWithLine(
        new THREE.Vector3(0, top.position.y, 0),
        new THREE.Vector3(r, top.position.y, 0),
        'r',
        new THREE.Vector3(0, 0.8, 0)
    );
    group.add(labelH, labelCircumference, topRadiusLabel);

    group.rotation.x = -Math.PI / 2;
    return group;
};

const createUnfoldedCone = (dims: ShapeDimensions) => {
    const r = dims.r > 0 ? dims.r : 3;
    const h = dims.h > 0 ? dims.h : 4;
    const l = Math.sqrt(r * r + h * h);
    const angle = l > 0 ? (2 * Math.PI * r) / l : 0;

    const group = new THREE.Group();
    
    const base = new THREE.Mesh(new THREE.CircleGeometry(r, 32), BASE_MATERIAL);
    base.name = 'base_circle';
    base.position.y = -l/2 - r - 0.5;
    
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(0, 0);
    bodyShape.arc(0, 0, l, -angle/2, angle/2, false);
    bodyShape.lineTo(0, 0);
    const body = new THREE.Mesh(new THREE.ShapeGeometry(bodyShape), BASE_MATERIAL);
    body.name = 'body_main';

    group.add(base, body);
    
    // Labels
    const radiusLabel = createLabelWithLine(
        new THREE.Vector3(0, base.position.y, 0),
        new THREE.Vector3(r, base.position.y, 0),
        'r',
        new THREE.Vector3(0, 0.8, 0)
    );
    group.add(radiusLabel);

    const slantHeightLabel = createLabelWithLine(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(l * Math.cos(0), l * Math.sin(0), 0),
        'l',
        new THREE.Vector3(0.5, 0.5, 0)
    );
    group.add(slantHeightLabel);

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
        case 'cube': return createUnfoldedCube(dimensions);
        case 'cylinder': return createUnfoldedCylinder(dimensions);
        case 'cone': return createUnfoldedCone(dimensions);
        // Sphere and Hemisphere cannot be perfectly unfolded into 2D shapes
        case 'sphere': return createSphere(dimensions);
        case 'hemisphere': return createHemisphere(dimensions);
        default: return createShapeMesh(shape, dimensions); // Fallback for non-unfoldable shapes
    }
};