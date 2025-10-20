import type { SurfaceAreaChallengeQuestion } from '../../../types';

export const challenges: SurfaceAreaChallengeQuestion[] = [
    // --- CLASS 9 ---
    {
        id: 901, level: 'easy', class: 9, shape: 'cuboid',
        question: 'A cuboid is 8m long, 4m broad and 3m high. Find its total surface area.',
        dimensions: { l: 8, b: 4, h: 3 },
        calculationType: 'tsa',
        answer: 136,
        tolerance: 0.01,
        unit: 'm',
    },
    {
        id: 902, level: 'easy', class: 9, shape: 'cube',
        question: 'Find the lateral surface area of a cube with an edge of 5 cm.',
        dimensions: { a: 5 },
        calculationType: 'lsa',
        answer: 100,
        tolerance: 0.01,
        unit: 'cm',
    },
    {
        id: 903, level: 'medium', class: 9, shape: 'cylinder',
        question: 'A cylindrical pillar has a diameter of 50cm and a height of 3.5m. To paint it, you\'ll need to find its Curved Surface Area (CSA) in m². Note: You may need to convert units.',
        contextInfo: ['Rate of painting: ₹12.50 per m².'],
        dimensions: { r: 0.25, h: 3.5 },
        calculationType: 'lsa',
        answer: 5.5,
        tolerance: 0.01,
        unit: 'm',
        followUp: {
            prompt: 'Now, using the CSA you found, calculate the total cost of painting the pillar.',
            answer: 68.75, // 5.5 * 12.5
            unit: '₹'
        }
    },
     {
        id: 904, level: 'medium', class: 9, shape: 'cone',
        question: 'The height of a cone is 16 cm and its base radius is 12 cm. Find the curved surface area. (Use π = 3.14)',
        dimensions: { r: 12, h: 16 },
        calculationType: 'lsa',
        answer: 753.6,
        tolerance: 0.1,
        unit: 'cm',
    },
     {
        id: 905, level: 'hard', class: 9, shape: 'sphere',
        question: 'Find the volume of a sphere whose radius is 7 cm.',
        dimensions: { r: 7 },
        calculationType: 'volume',
        answer: 1437.33,
        tolerance: 0.1,
        unit: 'cm',
    },
    {
        id: 906, level: 'hard', class: 9, shape: 'hemisphere',
        question: 'A hemispherical bowl has a radius of 3.5 cm. What would be the volume of water it would contain?',
        dimensions: { r: 3.5 },
        calculationType: 'volume',
        answer: 89.83,
        tolerance: 0.1,
        unit: 'cm',
    },


    // --- CLASS 10 ---
    {
        id: 1001, level: 'medium', class: 10, shape: 'cone_on_hemisphere',
        question: 'A toy is a cone (height 12cm) mounted on a hemisphere. Both have a radius of 3.5cm. Find the total surface area of the toy.',
        dimensions: { r: 3.5, h: 12 },
        calculationType: 'tsa',
        answer: 214.5,
        tolerance: 0.1,
        unit: 'cm',
    },
    {
        id: 1002, level: 'hard', class: 10, shape: 'frustum',
        question: 'A drinking glass is a frustum of a cone of height 14cm. The diameters of its two circular ends are 4cm and 2cm. Find the capacity (volume) of the glass.',
        dimensions: { h: 14, r1: 2, r2: 1 },
        calculationType: 'volume',
        answer: 102.67,
        tolerance: 0.1,
        unit: 'cm',
    },
    {
        id: 1003, level: 'hard', class: 10, shape: 'cylinder_with_hemispheres',
        question: 'A medicine capsule is a cylinder with two hemispheres stuck to each of its ends. The length of the entire capsule is 14 mm and the diameter is 5 mm. Find its surface area.',
        dimensions: { r: 2.5, h: 9 }, // h = 14 - 2.5 - 2.5
        calculationType: 'tsa',
        answer: 220,
        tolerance: 0.1,
        unit: 'mm',
    }
];