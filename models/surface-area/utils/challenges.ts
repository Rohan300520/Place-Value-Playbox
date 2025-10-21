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
    {
        id: 907, level: 'easy', class: 9, shape: 'cuboid',
        question: 'A cuboidal water tank is 6m long, 5m wide and 4.5m deep. Calculate its volume in cubic meters.',
        dimensions: { l: 6, b: 5, h: 4.5 },
        calculationType: 'volume',
        answer: 135,
        unit: 'm',
        followUp: { 
            prompt: "Now, knowing that 1 m³ = 1000 litres, how many litres of water can the tank hold?", 
            answer: 135000, 
            unit: 'litres' 
        }
    },
    {
        id: 908, level: 'medium', class: 9, shape: 'cone',
        question: "The height of a cone is 8 cm and the radius of its base is 6 cm. Find its total surface area.",
        dimensions: { r: 6, h: 8 },
        calculationType: 'tsa',
        answer: 301.59,
        tolerance: 0.1,
        unit: 'cm',
    },
    {
        id: 909, level: 'hard', class: 9, shape: 'cone',
        question: "A corn cob shaped like a cone has a radius of 2.1 cm and height of 20 cm. First, calculate its Curved Surface Area (CSA).",
        dimensions: { r: 2.1, h: 20 },
        calculationType: 'lsa',
        answer: 132.73,
        tolerance: 0.1,
        unit: 'cm',
        followUp: { 
            prompt: "If each 1 cm² of the cob's surface holds 4 grains, how many grains are on the entire cob (rounded to the nearest whole number)?", 
            answer: 531 
        }
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
    },
    {
        id: 1004, level: 'medium', class: 10, shape: 'cone_on_hemisphere',
        question: "A solid toy is a cone standing on a hemisphere. The radius of both is 1 cm, and the cone's height is also 1 cm. Find the volume of the solid.",
        dimensions: { r: 1, h: 1 },
        calculationType: 'volume',
        answer: 3.14,
        tolerance: 0.01,
        unit: 'cm'
    },
    {
        id: 1005, level: 'hard', class: 10, shape: 'frustum',
        question: "A container shaped like a frustum of a cone has a height of 16 cm and radii of its lower and upper ends are 8 cm and 20 cm. Calculate its volume in cm³.",
        dimensions: { h: 16, r1: 20, r2: 8 },
        calculationType: 'volume',
        answer: 10459.4,
        tolerance: 0.1,
        unit: 'cm',
        followUp: { 
            prompt: "If milk costs ₹20 per litre, find the cost to fill the container. (1 litre = 1000 cm³)", 
            answer: 209.19 
        }
    },
    {
        id: 1006, level: 'hard', class: 10, shape: 'cylinder_with_hemispheres',
        question: "A gulab jamun is shaped like a cylinder with hemispherical ends. Its total length is 5 cm and diameter is 2.8 cm. First, calculate the volume of one gulab jamun.",
        dimensions: { r: 1.4, h: 2.2 },
        calculationType: 'volume',
        answer: 25.05,
        tolerance: 0.1,
        unit: 'cm',
        followUp: { 
            prompt: "If it contains syrup up to 30% of its volume, find the approximate volume of syrup in 45 such gulab jamuns.", 
            answer: 338.18
        }
    }
];
