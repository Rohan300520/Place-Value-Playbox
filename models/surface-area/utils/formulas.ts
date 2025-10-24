import type { ShapeType, CalculationType, ShapeDimensions, CalculationResult } from '../../../types';

// Helper to format numbers to 2 decimal places
const format = (n: number) => parseFloat(n.toFixed(2));

// Type definition for a single dimension
type Dimension = {
    key: string;
    name: string;
    min: number;
    max: number;
    step: number;
};

// Type definition for a shape's data
type ShapeData = {
    name: string;
    iconUrl: string;
    dimensions: Dimension[];
    defaultDimensions: ShapeDimensions;
    lsaName: 'LSA' | 'CSA';
    lsaPartIds?: string | string[];
    formulas: {
        [key in CalculationType]?: (dims: ShapeDimensions) => CalculationResult;
    };
};

// --- FORMULA IMPLEMENTATIONS ---

export const SHAPE_DATA: Record<ShapeType, ShapeData> = {
    // --- Class 9 Shapes ---
    cuboid: {
        name: 'Cuboid',
        iconUrl: '/assets/shapes/cuboid.png',
        lsaName: 'LSA',
        lsaPartIds: ['front', 'back', 'left', 'right'],
        dimensions: [
            { key: 'l', name: 'Length (l)', min: 1, max: 10, step: 0.1 },
            { key: 'b', name: 'Breadth (b)', min: 1, max: 10, step: 0.1 },
            { key: 'h', name: 'Height (h)', min: 1, max: 10, step: 0.1 },
        ],
        defaultDimensions: { l: 5, b: 4, h: 3 },
        formulas: {
            volume: ({ l, b, h }) => ({
                value: format(l * b * h),
                formula: 'Volume = l × b × h',
                steps: [{ description: 'Substitute values', calculation: `${l} × ${b} × ${h}`, result: `${format(l * b * h)} units³` }]
            }),
            lsa: ({ l, b, h }) => ({
                value: format(2 * h * (l + b)),
                formula: 'LSA = 2h(l + b)',
                steps: [{ description: 'Substitute values', calculation: `2 × ${h} × (${l} + ${b})`, result: `${format(2 * h * (l + b))} units²` }]
            }),
            tsa: ({ l, b, h }) => ({
                value: format(2 * (l * b + b * h + h * l)),
                formula: 'TSA = 2(lb + bh + hl)',
                steps: [{ description: 'Substitute values', calculation: `2 × (${l}×${b} + ${b}×${h} + ${h}×${l})`, result: `${format(2 * (l * b + b * h + h * l))} units²` }]
            }),
        }
    },
    cube: {
        name: 'Cube',
        iconUrl: '/assets/shapes/cube.png',
        lsaName: 'LSA',
        lsaPartIds: ['front', 'back', 'left', 'right'],
        dimensions: [
            { key: 'a', name: 'Side (a)', min: 1, max: 10, step: 0.1 },
        ],
        defaultDimensions: { a: 4 },
        formulas: {
            volume: ({ a }) => ({
                value: format(a * a * a),
                formula: 'Volume = a³',
                steps: [{ description: 'Substitute values', calculation: `${a}³`, result: `${format(a**3)} units³` }]
            }),
            lsa: ({ a }) => ({
                value: format(4 * a * a),
                formula: 'LSA = 4a²',
                steps: [{ description: 'Substitute values', calculation: `4 × ${a}²`, result: `${format(4*a**2)} units²` }]
            }),
            tsa: ({ a }) => ({
                value: format(6 * a * a),
                formula: 'TSA = 6a²',
                steps: [{ description: 'Substitute values', calculation: `6 × ${a}²`, result: `${format(6*a**2)} units²` }]
            }),
        }
    },
    cylinder: {
        name: 'Cylinder',
        iconUrl: '/assets/shapes/cylinder.png',
        lsaName: 'CSA',
        lsaPartIds: 'body_rect',
        dimensions: [
            { key: 'r', name: 'Radius (r)', min: 1, max: 5, step: 0.1 },
            { key: 'h', name: 'Height (h)', min: 1, max: 10, step: 0.1 },
        ],
        defaultDimensions: { r: 2, h: 5 },
        formulas: {
            volume: ({ r, h }) => ({
                value: format(Math.PI * r * r * h),
                formula: 'Volume = πr²h',
                steps: [{ description: 'Substitute values', calculation: `π × ${r}² × ${h}`, result: `${format(Math.PI * r**2 * h)} units³` }]
            }),
            lsa: ({ r, h }) => ({
                value: format(2 * Math.PI * r * h),
                formula: 'CSA = 2πrh',
                steps: [{ description: 'Substitute values', calculation: `2 × π × ${r} × ${h}`, result: `${format(2 * Math.PI * r * h)} units²` }]
            }),
            tsa: ({ r, h }) => ({
                value: format(2 * Math.PI * r * (r + h)),
                formula: 'TSA = 2πr(r + h)',
                steps: [{ description: 'Substitute values', calculation: `2 × π × ${r} × (${r} + ${h})`, result: `${format(2 * Math.PI * r * (r + h))} units²` }]
            }),
        }
    },
    cone: {
        name: 'Cone',
        iconUrl: '/assets/shapes/cone.png',
        lsaName: 'CSA',
        lsaPartIds: 'body_main',
        dimensions: [
            { key: 'r', name: 'Radius (r)', min: 1, max: 5, step: 0.1 },
            { key: 'h', name: 'Height (h)', min: 1, max: 10, step: 0.1 },
        ],
        defaultDimensions: { r: 3, h: 4 },
        formulas: {
            volume: ({ r, h }) => ({
                value: format((1/3) * Math.PI * r * r * h),
                formula: 'Volume = (1/3)πr²h',
                steps: [{ description: 'Substitute values', calculation: `(1/3) × π × ${r}² × ${h}`, result: `${format((1/3) * Math.PI * r**2 * h)} units³` }]
            }),
            lsa: ({ r, h }) => {
                const l = Math.sqrt(r*r + h*h);
                return {
                    value: format(Math.PI * r * l),
                    formula: 'CSA = πrl, where l = √(r² + h²)',
                    steps: [
                        { description: 'Calculate slant height (l)', calculation: `√(${r}² + ${h}²)`, result: `${format(l)}` },
                        { description: 'Substitute values into CSA formula', calculation: `π × ${r} × ${format(l)}`, result: `${format(Math.PI * r * l)} units²` }
                    ]
                }
            },
            tsa: ({ r, h }) => {
                const l = Math.sqrt(r*r + h*h);
                return {
                    value: format(Math.PI * r * (l + r)),
                    formula: 'TSA = πr(l + r), where l = √(r² + h²)',
                     steps: [
                        { description: 'Calculate slant height (l)', calculation: `√(${r}² + ${h}²)`, result: `${format(l)}` },
                        { description: 'Substitute values into TSA formula', calculation: `π × ${r} × (${format(l)} + ${r})`, result: `${format(Math.PI * r * (l+r))} units²` }
                    ]
                }
            },
        }
    },
    sphere: {
        name: 'Sphere',
        iconUrl: '/assets/shapes/sphere.png',
        lsaName: 'CSA',
        dimensions: [
            { key: 'r', name: 'Radius (r)', min: 1, max: 5, step: 0.1 },
        ],
        defaultDimensions: { r: 3 },
        formulas: {
            volume: ({ r }) => ({
                value: format((4/3) * Math.PI * r**3),
                formula: 'Volume = (4/3)πr³',
                steps: [{ description: 'Substitute values', calculation: `(4/3) × π × ${r}³`, result: `${format((4/3) * Math.PI * r**3)} units³` }]
            }),
            tsa: ({ r }) => ({
                value: format(4 * Math.PI * r**2),
                formula: 'Surface Area = 4πr²',
                steps: [{ description: 'Substitute values', calculation: `4 × π × ${r}²`, result: `${format(4 * Math.PI * r**2)} units²` }]
            }),
        }
    },
    hemisphere: {
        name: 'Hemisphere',
        iconUrl: '/assets/shapes/hemisphere.png',
        lsaName: 'CSA',
        lsaPartIds: 'curved_surface',
        dimensions: [
            { key: 'r', name: 'Radius (r)', min: 1, max: 5, step: 0.1 },
        ],
        defaultDimensions: { r: 3 },
        formulas: {
            volume: ({ r }) => ({
                value: format((2/3) * Math.PI * r**3),
                formula: 'Volume = (2/3)πr³',
                steps: [{ description: 'Substitute values', calculation: `(2/3) × π × ${r}³`, result: `${format((2/3) * Math.PI * r**3)} units³` }]
            }),
            lsa: ({ r }) => ({
                value: format(2 * Math.PI * r**2),
                formula: 'CSA = 2πr²',
                steps: [{ description: 'Substitute values', calculation: `2 × π × ${r}²`, result: `${format(2 * Math.PI * r**2)} units²` }]
            }),
            tsa: ({ r }) => ({
                value: format(3 * Math.PI * r**2),
                formula: 'TSA = 3πr²',
                steps: [{ description: 'Substitute values', calculation: `3 × π × ${r}²`, result: `${format(3 * Math.PI * r**2)} units²` }]
            }),
        }
    },

    // --- Class 10 Shapes ---
    cone_on_hemisphere: {
        name: 'Cone on Hemisphere',
        iconUrl: '/assets/shapes/cone_on_hemisphere.png',
        lsaName: 'CSA',
        dimensions: [
            { key: 'r', name: 'Radius (r)', min: 1, max: 5, step: 0.1 },
            { key: 'h', name: 'Cone Height (h)', min: 1, max: 10, step: 0.1 },
        ],
        defaultDimensions: { r: 3, h: 4 },
        formulas: {
            volume: ({ r, h }) => {
                const volCone = (1/3) * Math.PI * r**2 * h;
                const volHemi = (2/3) * Math.PI * r**3;
                return {
                    value: format(volCone + volHemi),
                    formula: 'Volume = Vol(Cone) + Vol(Hemisphere)',
                    steps: [
                        { description: 'Volume of Cone', calculation: `(1/3)π(${r}² × ${h})`, result: `${format(volCone)}`},
                        { description: 'Volume of Hemisphere', calculation: `(2/3)π(${r}³)`, result: `${format(volHemi)}`},
                        { description: 'Total Volume', calculation: `${format(volCone)} + ${format(volHemi)}`, result: `${format(volCone + volHemi)} units³`}
                    ]
                }
            },
            tsa: ({ r, h }) => {
                 const l = Math.sqrt(r*r + h*h);
                 const csaCone = Math.PI * r * l;
                 const csaHemi = 2 * Math.PI * r**2;
                 return {
                    value: format(csaCone + csaHemi),
                    formula: 'TSA = CSA(Cone) + CSA(Hemisphere)',
                    steps: [
                        { description: 'Slant height (l) of Cone', calculation: `√(${r}² + ${h}²)`, result: `${format(l)}`},
                        { description: 'CSA of Cone', calculation: `π × ${r} × ${format(l)}`, result: `${format(csaCone)}`},
                        { description: 'CSA of Hemisphere', calculation: `2π × ${r}²`, result: `${format(csaHemi)}`},
                        { description: 'Total Surface Area', calculation: `${format(csaCone)} + ${format(csaHemi)}`, result: `${format(csaCone + csaHemi)} units²`}
                    ]
                 }
            },
        }
    },
    cylinder_with_hemispheres: {
        name: 'Capsule',
        iconUrl: '/assets/shapes/cylinder_with_hemispheres.png',
        lsaName: 'CSA',
        dimensions: [
            { key: 'r', name: 'Radius (r)', min: 1, max: 5, step: 0.1 },
            { key: 'h', name: 'Cylinder Height (h)', min: 1, max: 10, step: 0.1 },
        ],
        defaultDimensions: { r: 2, h: 5 },
        formulas: {
            volume: ({ r, h }) => {
                const volCyl = Math.PI * r**2 * h;
                const volSphere = (4/3) * Math.PI * r**3; // 2 hemispheres = 1 sphere
                return {
                    value: format(volCyl + volSphere),
                    formula: 'Volume = Vol(Cylinder) + Vol(Sphere)',
                    steps: [
                        { description: 'Volume of Cylinder', calculation: `π × ${r}² × ${h}`, result: `${format(volCyl)}`},
                        { description: 'Volume of 2 Hemispheres', calculation: `(4/3)π × ${r}³`, result: `${format(volSphere)}`},
                        { description: 'Total Volume', calculation: `${format(volCyl)} + ${format(volSphere)}`, result: `${format(volCyl + volSphere)} units³`}
                    ]
                }
            },
            tsa: ({ r, h }) => {
                const csaCyl = 2 * Math.PI * r * h;
                const saSphere = 4 * Math.PI * r**2; // 2 hemispheres = 1 sphere
                return {
                    value: format(csaCyl + saSphere),
                    formula: 'TSA = CSA(Cylinder) + SA(Sphere)',
                    steps: [
                        { description: 'CSA of Cylinder', calculation: `2π × ${r} × ${h}`, result: `${format(csaCyl)}`},
                        { description: 'Surface Area of 2 Hemispheres', calculation: `4π × ${r}²`, result: `${format(saSphere)}`},
                        { description: 'Total Surface Area', calculation: `${format(csaCyl)} + ${format(saSphere)}`, result: `${format(csaCyl + saSphere)} units²`}
                    ]
                }
            },
        }
    },
    cone_on_cylinder: {
        name: 'Tent',
        iconUrl: '/assets/shapes/cone_on_cylinder.png',
        lsaName: 'CSA',
        dimensions: [
            { key: 'r', name: 'Radius (r)', min: 1, max: 5, step: 0.1 },
            { key: 'hCyl', name: 'Cylinder Height', min: 1, max: 10, step: 0.1 },
            { key: 'hCone', name: 'Cone Height', min: 1, max: 10, step: 0.1 },
        ],
        defaultDimensions: { r: 3, hCyl: 4, hCone: 4 },
        formulas: {
            volume: ({ r, hCyl, hCone }) => {
                const volCyl = Math.PI * r**2 * hCyl;
                const volCone = (1/3) * Math.PI * r**2 * hCone;
                return {
                    value: format(volCyl + volCone),
                    formula: 'Volume = Vol(Cylinder) + Vol(Cone)',
                    steps: [
                        { description: 'Volume of Cylinder', calculation: `π × ${r}² × ${hCyl}`, result: `${format(volCyl)}` },
                        { description: 'Volume of Cone', calculation: `(1/3)π × ${r}² × ${hCone}`, result: `${format(volCone)}` },
                        { description: 'Total Volume', calculation: `${format(volCyl)} + ${format(volCone)}`, result: `${format(volCyl + volCone)} units³` }
                    ]
                }
            },
            tsa: ({ r, hCyl, hCone }) => {
                const l = Math.sqrt(r*r + hCone*hCone);
                const csaCone = Math.PI * r * l;
                const csaCyl = 2 * Math.PI * r * hCyl;
                const baseArea = Math.PI * r**2;
                return {
                    value: format(csaCone + csaCyl + baseArea),
                    formula: 'TSA = CSA(Cone) + CSA(Cylinder) + Area(Base)',
                    steps: [
                        { description: 'Slant height (l) of Cone', calculation: `√(${r}² + ${hCone}²)`, result: `${format(l)}` },
                        { description: 'CSA of Cone', calculation: `π × ${r} × ${format(l)}`, result: `${format(csaCone)}` },
                        { description: 'CSA of Cylinder', calculation: `2π × ${r} × ${hCyl}`, result: `${format(csaCyl)}` },
                        { description: 'Area of Base', calculation: `π × ${r}²`, result: `${format(baseArea)}` },
                        { description: 'Total Surface Area', calculation: `${format(csaCone)} + ${format(csaCyl)} + ${format(baseArea)}`, result: `${format(csaCone + csaCyl + baseArea)} units²` }
                    ]
                }
            },
        }
    },
    frustum: {
        name: 'Frustum of a Cone',
        iconUrl: '/assets/shapes/frustum.png',
        lsaName: 'CSA',
        dimensions: [
            { key: 'r1', name: 'Radius 1 (r₁)', min: 1, max: 8, step: 0.1 },
            { key: 'r2', name: 'Radius 2 (r₂)', min: 1, max: 8, step: 0.1 },
            { key: 'h', name: 'Height (h)', min: 1, max: 10, step: 0.1 },
        ],
        defaultDimensions: { r1: 4, r2: 2, h: 5 },
        formulas: {
            volume: ({ r1, r2, h }) => ({
                value: format((1/3) * Math.PI * h * (r1**2 + r2**2 + r1*r2)),
                formula: 'Volume = (1/3)πh(r₁² + r₂² + r₁r₂)',
                steps: [{ description: 'Substitute values', calculation: `(1/3)π × ${h} × (${r1}² + ${r2}² + ${r1}×${r2})`, result: `${format((1/3) * Math.PI * h * (r1**2 + r2**2 + r1*r2))} units³` }]
            }),
            lsa: ({ r1, r2, h }) => {
                const l = Math.sqrt(h**2 + (r1 - r2)**2);
                return {
                    value: format(Math.PI * (r1 + r2) * l),
                    formula: 'CSA = π(r₁ + r₂)l, where l = √(h² + (r₁ - r₂)²)',
                    steps: [
                        { description: 'Calculate slant height (l)', calculation: `√(${h}² + (${r1} - ${r2})²)`, result: `${format(l)}` },
                        { description: 'Substitute into CSA formula', calculation: `π × (${r1} + ${r2}) × ${format(l)}`, result: `${format(Math.PI * (r1 + r2) * l)} units²` }
                    ]
                }
            },
            tsa: ({ r1, r2, h }) => {
                const l = Math.sqrt(h**2 + (r1 - r2)**2);
                const csa = Math.PI * (r1 + r2) * l;
                const base1 = Math.PI * r1**2;
                const base2 = Math.PI * r2**2;
                return {
                    value: format(csa + base1 + base2),
                    formula: 'TSA = π(r₁ + r₂)l + πr₁² + πr₂²',
                    steps: [
                        { description: 'Calculate slant height (l)', calculation: `√(${h}² + (${r1} - ${r2})²)`, result: `${format(l)}` },
                        { description: 'Calculate CSA', calculation: `π × (${r1} + ${r2}) × ${format(l)}`, result: `${format(csa)}` },
                        { description: 'Calculate Area of Bases', calculation: `π(${r1}²) + π(${r2}²)`, result: `${format(base1 + base2)}` },
                        { description: 'Total Surface Area', calculation: `${format(csa)} + ${format(base1 + base2)}`, result: `${format(csa + base1 + base2)} units²` }
                    ]
                }
            },
        }
    },
};

export const CLASS_9_SHAPES: ShapeType[] = ['cuboid', 'cube', 'cylinder', 'cone', 'sphere', 'hemisphere'];
export const CLASS_10_SHAPES: ShapeType[] = ['cone_on_hemisphere', 'cylinder_with_hemispheres', 'cone_on_cylinder', 'frustum'];