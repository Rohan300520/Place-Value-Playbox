import type { ShapeType, ShapeDimensions, CalculationType, CalculationResult } from '../../../types';

export const SHAPE_DATA: Record<ShapeType, any> = {
    cuboid: {
        name: 'Cuboid',
        thumbnail: '/assets/shape-thumbnails/cuboid.svg',
        color: 0x27ae60,
        defaultDimensions: { length: 4, width: 3, height: 2 },
        dimensions: [
            { key: 'length', label: 'Length (l)', min: 1, max: 10, step: 0.1 },
            { key: 'width', label: 'Width (w)', min: 1, max: 10, step: 0.1 },
            { key: 'height', label: 'Height (h)', min: 1, max: 10, step: 0.1 },
        ],
        calculate: (dims: ShapeDimensions, type: CalculationType): CalculationResult => {
            const { length: l, width: w, height: h } = dims;
            if (type === 'volume') {
                return {
                    value: l * w * h,
                    formula: 'V = l × w × h',
                    steps: [
                        { description: 'Substitute values', calculation: `V = ${l} × ${w} × ${h}`, result: `${(l*w*h).toFixed(2)}` }
                    ]
                };
            }
            if (type === 'lsa') {
                return {
                    value: 2 * (l + w) * h,
                    formula: 'LSA = 2(l + w)h',
                    steps: [
                        { description: 'Substitute values', calculation: `LSA = 2(${l} + ${w}) × ${h}`, result: `${(2 * (l + w) * h).toFixed(2)}` }
                    ],
                    derivation: {
                        title: 'LSA is the sum of the areas of the 4 side faces.',
                        parts: [
                            { partName: 'Front/Back Faces', formula: '2 × l × h', meshId: ['front', 'back'] },
                            { partName: 'Left/Right Faces', formula: '2 × w × h', meshId: ['left', 'right'] },
                        ]
                    }
                };
            }
            // TSA
            return {
                value: 2 * (l*w + l*h + w*h),
                formula: 'TSA = 2(lw + lh + wh)',
                steps: [
                    { description: 'Substitute values', calculation: `TSA = 2((${l}×${w}) + (${l}×${h}) + (${w}×${h}))`, result: `${(2 * (l*w + l*h + w*h)).toFixed(2)}` }
                ],
                 derivation: {
                    title: 'TSA is the sum of the areas of all 6 faces.',
                    parts: [
                        { partName: 'Top/Bottom Faces (2)', formula: '2 × l × w', meshId: ['top', 'bottom'] },
                        { partName: 'Front/Back Faces (2)', formula: '2 × l × h', meshId: ['front', 'back'] },
                        { partName: 'Left/Right Faces (2)', formula: '2 × w × h', meshId: ['left', 'right'] },
                    ]
                }
            };
        }
    },
    cube: {
        name: 'Cube',
        thumbnail: '/assets/shape-thumbnails/cube.svg',
        color: 0x2980b9,
        defaultDimensions: { side: 3 },
        dimensions: [
            { key: 'side', label: 'Side (a)', min: 1, max: 10, step: 0.1 },
        ],
        calculate: (dims: ShapeDimensions, type: CalculationType): CalculationResult => {
            const { side: a } = dims;
            if (type === 'volume') {
                return { value: a*a*a, formula: 'V = a³', steps: [{ description: 'Substitute value', calculation: `V = ${a}³`, result: `${(a*a*a).toFixed(2)}` }] };
            }
            if (type === 'lsa') {
                return { 
                    value: 4*a*a, 
                    formula: 'LSA = 4a²', 
                    steps: [{ description: 'Substitute value', calculation: `LSA = 4 × ${a}²`, result: `${(4*a*a).toFixed(2)}` }],
                    derivation: {
                        title: 'LSA is the sum of the areas of the 4 side faces.',
                        parts: [ { partName: 'Area of 4 Faces', formula: '4 × a²', meshId: ['front', 'back', 'left', 'right'] } ]
                    }
                };
            }
            // TSA
            return {
                value: 6*a*a,
                formula: 'TSA = 6a²',
                steps: [{ description: 'Substitute value', calculation: `TSA = 6 × ${a}²`, result: `${(6*a*a).toFixed(2)}` }],
                derivation: {
                    title: 'TSA is the sum of the areas of the 6 equal faces.',
                    parts: [ { partName: 'Area of 6 Faces', formula: '6 × a²', meshId: ['front', 'back', 'top', 'bottom', 'left', 'right'] } ]
                }
            };
        }
    },
    cylinder: {
        name: 'Cylinder',
        thumbnail: '/assets/shape-thumbnails/cylinder.svg',
        color: 0xc0392b,
        defaultDimensions: { radius: 2, height: 4 },
        dimensions: [
            { key: 'radius', label: 'Radius (r)', min: 1, max: 5, step: 0.1 },
            { key: 'height', label: 'Height (h)', min: 1, max: 10, step: 0.1 },
        ],
         calculate: (dims: ShapeDimensions, type: CalculationType): CalculationResult => {
            const { radius: r, height: h } = dims;
            const PI = Math.PI;
            if (type === 'volume') {
                return { value: PI*r*r*h, formula: 'V = πr²h', steps: [{ description: 'Substitute values', calculation: `V = π × ${r}² × ${h}`, result: `${(PI*r*r*h).toFixed(2)}` }] };
            }
            if (type === 'lsa') {
                return { value: 2*PI*r*h, formula: 'LSA = 2πrh', steps: [{ description: 'Substitute values', calculation: `LSA = 2 × π × ${r} × ${h}`, result: `${(2*PI*r*h).toFixed(2)}` }],
                    derivation: { title: 'LSA is the area of the curved rectangular surface.', parts: [{ partName: 'Curved Surface', formula: '2πr × h', meshId: 'body' }] }
                };
            }
            // TSA
            return {
                value: 2*PI*r*(r+h),
                formula: 'TSA = 2πr(r+h)',
                steps: [{ description: 'Substitute values', calculation: `TSA = 2π × ${r}(${r}+${h})`, result: `${(2*PI*r*(r+h)).toFixed(2)}` }],
                derivation: { title: 'TSA = Area of curved surface + Area of 2 circular bases.', parts: [
                    { partName: 'Curved Surface', formula: '2πrh', meshId: 'body' },
                    { partName: 'Top/Bottom Bases (2)', formula: '2 × πr²', meshId: 'caps' }
                ]}
            };
        }
    },
    cone: {
        name: 'Cone',
        thumbnail: '/assets/shape-thumbnails/cone.svg',
        color: 0xf1c40f,
        defaultDimensions: { radius: 3, height: 4 },
        dimensions: [
            { key: 'radius', label: 'Radius (r)', min: 1, max: 5, step: 0.1 },
            { key: 'height', label: 'Height (h)', min: 1, max: 10, step: 0.1 },
        ],
        calculate: (dims: ShapeDimensions, type: CalculationType): CalculationResult => {
            const { radius: r, height: h } = dims;
            const PI = Math.PI;
            const l = Math.sqrt(r*r + h*h); // Slant height
            if (type === 'volume') {
                return { value: (1/3)*PI*r*r*h, formula: 'V = (1/3)πr²h', steps: [{ description: 'Substitute values', calculation: `V = (1/3) × π × ${r}² × ${h}`, result: `${((1/3)*PI*r*r*h).toFixed(2)}` }] };
            }
            if (type === 'lsa') {
                return { value: PI*r*l, formula: 'LSA = πrl', steps: [
                    { description: 'First, find slant height (l)', calculation: `l = √(${r}² + ${h}²)`, result: l.toFixed(2)},
                    { description: 'Substitute values', calculation: `LSA = π × ${r} × ${l.toFixed(2)}`, result: `${(PI*r*l).toFixed(2)}` }
                ],
                derivation: { title: 'LSA is the area of the curved sector.', parts: [{ partName: 'Curved Surface', formula: 'πrl', meshId: 'body' }] }
            };
            }
            // TSA
            return { value: PI*r*(r+l), formula: 'TSA = πr(r+l)', steps: [
                 { description: 'First, find slant height (l)', calculation: `l = √(${r}² + ${h}²)`, result: l.toFixed(2)},
                 { description: 'Substitute values', calculation: `TSA = π × ${r}(${r} + ${l.toFixed(2)})`, result: `${(PI*r*(r+l)).toFixed(2)}` }
            ],
            derivation: { title: 'TSA = Area of curved surface + Area of circular base.', parts: [
                { partName: 'Curved Surface', formula: 'πrl', meshId: 'body' },
                { partName: 'Circular Base', formula: 'πr²', meshId: 'cap' }
            ]}
        };
        }
    },
    sphere: {
        name: 'Sphere',
        thumbnail: '/assets/shape-thumbnails/sphere.svg',
        color: 0x8e44ad,
        defaultDimensions: { radius: 3 },
        dimensions: [
            { key: 'radius', label: 'Radius (r)', min: 1, max: 5, step: 0.1 },
        ],
         calculate: (dims: ShapeDimensions, type: CalculationType): CalculationResult => {
            const { radius: r } = dims;
            const PI = Math.PI;
            if (type === 'volume') {
                return { value: (4/3)*PI*r*r*r, formula: 'V = (4/3)πr³', steps: [{ description: 'Substitute value', calculation: `V = (4/3) × π × ${r}³`, result: `${((4/3)*PI*r*r*r).toFixed(2)}` }] };
            }
            // LSA and TSA are the same for a sphere
            return { 
                value: 4*PI*r*r, 
                formula: 'SA = 4πr²', 
                steps: [{ description: 'Substitute value', calculation: `SA = 4 × π × ${r}²`, result: `${(4*PI*r*r).toFixed(2)}` }],
                derivation: {
                    title: 'A sphere has only one continuous surface.',
                    parts: [{ partName: 'Surface Area', formula: '4πr²', meshId: 'body'}]
                }
            };
        }
    },
    hemisphere: {
        name: 'Hemisphere',
        thumbnail: '/assets/shape-thumbnails/hemisphere.svg',
        color: 0x1abc9c,
        defaultDimensions: { radius: 3 },
        dimensions: [
            { key: 'radius', label: 'Radius (r)', min: 1, max: 5, step: 0.1 },
        ],
        calculate: (dims: ShapeDimensions, type: CalculationType): CalculationResult => {
             const { radius: r } = dims;
            const PI = Math.PI;
            if (type === 'volume') {
                return { value: (2/3)*PI*r*r*r, formula: 'V = (2/3)πr³', steps: [{ description: 'Substitute value', calculation: `V = (2/3) × π × ${r}³`, result: `${((2/3)*PI*r*r*r).toFixed(2)}` }] };
            }
            if (type === 'lsa') { // Curved Surface Area
                return { 
                    value: 2*PI*r*r, 
                    formula: 'LSA = 2πr²', 
                    steps: [{ description: 'Substitute value', calculation: `LSA = 2 × π × ${r}²`, result: `${(2*PI*r*r).toFixed(2)}` }],
                    derivation: { title: 'LSA is the area of the curved surface.', parts: [{ partName: 'Curved Surface', formula: '2πr²', meshId: 'body' }] }
                };
            }
            // TSA
            return { 
                value: 3*PI*r*r, 
                formula: 'TSA = 3πr²', 
                steps: [{ description: 'Substitute value', calculation: `TSA = 3 × π × ${r}²`, result: `${(3*PI*r*r).toFixed(2)}` }],
                derivation: { title: 'TSA = Area of curved surface + Area of circular base.', parts: [
                    { partName: 'Curved Surface', formula: '2πr²', meshId: 'body' },
                    { partName: 'Circular Base', formula: 'πr²', meshId: 'base' }
                ]}
            };
        }
    },
    cone_on_hemisphere: {
        name: 'Cone on Hemisphere',
        thumbnail: '/assets/shape-thumbnails/cone_on_hemisphere.svg',
        color: 0xd35400,
        defaultDimensions: { radius: 3, coneHeight: 4 },
        dimensions: [
            { key: 'radius', label: 'Radius (r)', min: 1, max: 5, step: 0.1 },
            { key: 'coneHeight', label: 'Cone Height (h)', min: 1, max: 10, step: 0.1 },
        ],
        calculate: (dims: ShapeDimensions, type: CalculationType): CalculationResult => {
            return {
                value: 0,
                formula: 'Not Implemented',
                steps: [{ description: 'Calculation for this shape is not yet implemented.', calculation: '', result: 'N/A'}]
            };
        }
    },
    cylinder_with_hemispheres: {
        name: 'Cylinder with Hemispheres',
        thumbnail: '/assets/shape-thumbnails/cylinder_with_hemispheres.svg',
        color: 0x9b59b6,
        defaultDimensions: { radius: 2, cylinderHeight: 4 },
        dimensions: [
            { key: 'radius', label: 'Radius (r)', min: 1, max: 5, step: 0.1 },
            { key: 'cylinderHeight', label: 'Cylinder Height (h)', min: 1, max: 10, step: 0.1 },
        ],
        calculate: (dims: ShapeDimensions, type: CalculationType): CalculationResult => {
            return {
                value: 0,
                formula: 'Not Implemented',
                steps: [{ description: 'Calculation for this shape is not yet implemented.', calculation: '', result: 'N/A'}]
            };
        }
    },
    cone_on_cylinder: {
        name: 'Cone on Cylinder',
        thumbnail: '/assets/shape-thumbnails/cone_on_cylinder.svg',
        color: 0x2ecc71,
        defaultDimensions: { radius: 2, cylinderHeight: 3, coneHeight: 2 },
        dimensions: [
            { key: 'radius', label: 'Radius (r)', min: 1, max: 5, step: 0.1 },
            { key: 'cylinderHeight', label: 'Cylinder Height (hc)', min: 1, max: 10, step: 0.1 },
            { key: 'coneHeight', label: 'Cone Height (ho)', min: 1, max: 10, step: 0.1 },
        ],
        calculate: (dims: ShapeDimensions, type: CalculationType): CalculationResult => {
            return {
                value: 0,
                formula: 'Not Implemented',
                steps: [{ description: 'Calculation for this shape is not yet implemented.', calculation: '', result: 'N/A'}]
            };
        }
    },
    frustum: {
        name: 'Frustum',
        thumbnail: '/assets/shape-thumbnails/frustum.svg',
        color: 0x34495e,
        defaultDimensions: { topRadius: 2, bottomRadius: 3, height: 4 },
        dimensions: [
            { key: 'topRadius', label: 'Top Radius (r)', min: 1, max: 5, step: 0.1 },
            { key: 'bottomRadius', label: 'Bottom Radius (R)', min: 1, max: 5, step: 0.1 },
            { key: 'height', label: 'Height (h)', min: 1, max: 10, step: 0.1 },
        ],
        calculate: (dims: ShapeDimensions, type: CalculationType): CalculationResult => {
            return {
                value: 0,
                formula: 'Not Implemented',
                steps: [{ description: 'Calculation for this shape is not yet implemented.', calculation: '', result: 'N/A'}]
            };
        }
    }
};