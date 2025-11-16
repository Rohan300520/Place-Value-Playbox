import type { SurfaceAreaChallengeQuestion } from '../../../types';

// Easy questions map to "Class 9" concepts.
// Medium/Hard questions map to "Class 10" concepts.

export const challengeQuestions: SurfaceAreaChallengeQuestion[] = [
    // --- EASY (CLASS 9) ---
    {
        id: 1, level: 'easy', class: 9, shape: 'cuboid',
        question: "Find the volume of a cuboid with length 5cm, width 4cm, and height 3cm.",
        dimensions: { length: 5, width: 4, height: 3 },
        calculationType: 'volume', answer: 60, unit: 'cm³'
    },
    {
        id: 2, level: 'easy', class: 9, shape: 'cube',
        question: "Calculate the Total Surface Area (TSA) of a cube with a side of 4cm.",
        dimensions: { side: 4 },
        calculationType: 'tsa', answer: 96, unit: 'cm²'
    },
    {
        id: 3, level: 'easy', class: 9, shape: 'cylinder',
        question: "A cylinder has a radius of 7cm and a height of 10cm. What is its Lateral Surface Area (LSA)? Use π ≈ 22/7.",
        contextInfo: ["π ≈ 22/7"],
        dimensions: { radius: 7, height: 10 },
        calculationType: 'lsa', answer: 440, unit: 'cm²'
    },
    {
        id: 4, level: 'easy', class: 9, shape: 'cone',
        question: "Find the volume of a cone with a radius of 3cm and a height of 7cm. Use π ≈ 22/7.",
        contextInfo: ["π ≈ 22/7"],
        dimensions: { radius: 3, height: 7 },
        calculationType: 'volume', answer: 66, unit: 'cm³'
    },
    {
        id: 5, level: 'easy', class: 9, shape: 'sphere',
        question: "What is the surface area of a sphere with a radius of 10.5cm? Use π ≈ 22/7.",
        contextInfo: ["π ≈ 22/7"],
        dimensions: { radius: 10.5 },
        calculationType: 'tsa', answer: 1386, unit: 'cm²'
    },
    {
        id: 6, level: 'easy', class: 9, shape: 'hemisphere',
        question: "Calculate the volume of a hemisphere with a radius of 21cm. Use π ≈ 22/7.",
        contextInfo: ["π ≈ 22/7"],
        dimensions: { radius: 21 },
        calculationType: 'volume', answer: 19404, unit: 'cm³'
    },

    // --- MEDIUM (CLASS 10) ---
    {
        id: 7, level: 'medium', class: 10, shape: 'cone',
        question: "A cone has a radius of 7cm and a slant height of 25cm. What is its Total Surface Area (TSA)? Use π ≈ 22/7.",
        contextInfo: ["Slant height (l) is 25cm.", "π ≈ 22/7"],
        dimensions: { radius: 7, height: 24 }, // height is sqrt(25^2 - 7^2) = 24
        calculationType: 'tsa', answer: 704, unit: 'cm²'
    },
    {
        id: 8, level: 'medium', class: 10, shape: 'cube',
        question: "The volume of a cube is 125 cm³. What is its Lateral Surface Area (LSA)?",
        dimensions: { side: 5 },
        calculationType: 'lsa', answer: 100, unit: 'cm²'
    },
    {
        id: 9, level: 'medium', class: 10, shape: 'cylinder',
        question: "A cylindrical water tank is 1.4m in diameter and 2m high. How many litres of water can it hold? (1 m³ = 1000 litres)",
        contextInfo: ["Diameter = 1.4m, so Radius = 0.7m.", "1 m³ = 1000 litres.", "Use π ≈ 22/7"],
        dimensions: { radius: 0.7, height: 2 },
        calculationType: 'volume', answer: 3080, unit: 'litres',
        tolerance: 0.1,
    },
     {
        id: 10, level: 'medium', class: 10, shape: 'sphere',
        question: "The surface area of a sphere is 616 cm². What is its volume? Use π ≈ 22/7.",
        contextInfo: ["First find the radius from the surface area.", "π ≈ 22/7"],
        dimensions: { radius: 7 }, // Sqrt(616 / (4 * 22/7)) = 7
        calculationType: 'volume', answer: 1437.33, unit: 'cm³',
        tolerance: 0.1,
    },

    // --- HARD (CLASS 10) ---
    {
        id: 11, level: 'hard', class: 10, shape: 'cone_on_cylinder',
        question: "A toy is a cone on a cylinder of the same radius. The radius is 7cm, cylinder height is 10cm, and cone height is 24cm. Find the Total Surface Area of the toy. (π ≈ 22/7)",
        contextInfo: ["TSA = LSA of Cylinder + LSA of Cone + Area of bottom circle.", "π ≈ 22/7"],
        dimensions: { radius: 7, cylinderHeight: 10, coneHeight: 24 },
        calculationType: 'tsa', answer: 1144, unit: 'cm²'
    },
    {
        id: 12, level: 'hard', class: 10, shape: 'cylinder_with_hemispheres',
        question: "A capsule is a cylinder with hemispheres at each end. Total length is 14mm, diameter is 5mm. Find its surface area. (π ≈ 22/7)",
        contextInfo: ["Radius = 2.5mm", "Cylinder height = 14mm - 5mm = 9mm", "SA = LSA of Cylinder + SA of Sphere", "π ≈ 22/7"],
        dimensions: { radius: 2.5, cylinderHeight: 9 },
        calculationType: 'tsa', answer: 220, unit: 'mm²'
    },
    {
        id: 13, level: 'hard', class: 10, shape: 'frustum',
        question: "A drinking glass is a frustum of a cone with height 14cm. The diameters of its two circular ends are 4cm and 2cm. Find the volume of the glass. (π ≈ 22/7)",
        contextInfo: ["Radii are 2cm and 1cm.", "π ≈ 22/7"],
        dimensions: { topRadius: 1, bottomRadius: 2, height: 14 },
        calculationType: 'volume', answer: 102.67, unit: 'cm³',
        tolerance: 0.1,
    },
];
