import type { FractionChallengeQuestion } from '../../../types';

export const challenges: FractionChallengeQuestion[] = [
    // --- EASY ---
    {
        id: 1, level: 'easy', type: 'add',
        questionText: 'Solve this: 1/5 + 2/5 = ?',
        fractions: [{ numerator: 1, denominator: 5 }, { numerator: 2, denominator: 5 }],
        operator: '+',
        answer: { numerator: 3, denominator: 5 }
    },
    {
        id: 2, level: 'easy', type: 'subtract',
        questionText: 'What is 7/8 - 3/8 = ?',
        fractions: [{ numerator: 7, denominator: 8 }, { numerator: 3, denominator: 8 }],
        operator: '-',
        answer: { numerator: 4, denominator: 8 } // simplified is 1/2
    },
    {
        id: 3, level: 'easy', type: 'compare',
        questionText: 'Which fraction is greater?',
        fractions: [{ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 4 }],
        answer: 0 // Index of the greater fraction
    },
    {
        id: 4, level: 'easy', type: 'order',
        questionText: 'Arrange these fractions in ascending (smallest to largest) order.',
        fractions: [{ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 8 }, { numerator: 1, denominator: 4 }],
        order: 'ascending',
        answer: [{ numerator: 1, denominator: 8 }, { numerator: 1, denominator: 4 }, { numerator: 1, denominator: 2 }]
    },
    {
        id: 5, level: 'easy', type: 'add',
        questionText: 'Calculate: 1/6 + 3/6 = ?',
        fractions: [{ numerator: 1, denominator: 6 }, { numerator: 3, denominator: 6 }],
        operator: '+',
        answer: { numerator: 4, denominator: 6 } // simplified is 2/3
    },

    // --- MEDIUM ---
    {
        id: 6, level: 'medium', type: 'add',
        questionText: 'Find the sum: 1/2 + 1/3 = ?',
        fractions: [{ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 3 }],
        operator: '+',
        answer: { numerator: 5, denominator: 6 }
    },
    {
        id: 7, level: 'medium', type: 'subtract',
        questionText: 'Solve: 3/4 - 1/8 = ?',
        fractions: [{ numerator: 3, denominator: 4 }, { numerator: 1, denominator: 8 }],
        operator: '-',
        answer: { numerator: 5, denominator: 8 }
    },
    {
        id: 8, level: 'medium', type: 'compare',
        questionText: 'Which fraction is greater?',
        fractions: [{ numerator: 2, denominator: 3 }, { numerator: 3, denominator: 5 }],
        answer: 0 // 2/3 (0.66) > 3/5 (0.6)
    },
    {
        id: 9, level: 'medium', type: 'order',
        questionText: 'Arrange these in descending (largest to smallest) order.',
        fractions: [{ numerator: 5, denominator: 6 }, { numerator: 1, denominator: 3 }, { numerator: 1, denominator: 2 }],
        order: 'descending',
        answer: [{ numerator: 5, denominator: 6 }, { numerator: 1, denominator: 2 }, { numerator: 1, denominator: 3 }]
    },
    {
        id: 10, level: 'medium', type: 'add',
        questionText: 'What is 2/5 + 1/10 = ?',
        fractions: [{ numerator: 2, denominator: 5 }, { numerator: 1, denominator: 10 }],
        operator: '+',
        answer: { numerator: 5, denominator: 10 } // simplified 1/2
    },

    // --- HARD ---
    {
        id: 11, level: 'hard', type: 'subtract',
        questionText: 'Calculate the difference: 5/6 - 1/4 = ?',
        fractions: [{ numerator: 5, denominator: 6 }, { numerator: 1, denominator: 4 }],
        operator: '-',
        answer: { numerator: 7, denominator: 12 },
        displayType: 'mcq',
        mcqOptions: [ { numerator: 4, denominator: 2 }, { numerator: 7, denominator: 12 }, { numerator: 1, denominator: 2 } ]
    },
    {
        id: 12, level: 'hard', type: 'add',
        questionText: 'What is 2/3 + 3/4 = ? Your answer will be an improper fraction.',
        fractions: [{ numerator: 2, denominator: 3 }, { numerator: 3, denominator: 4 }],
        operator: '+',
        answer: { numerator: 17, denominator: 12 },
        displayType: 'mcq',
        mcqOptions: [ { numerator: 17, denominator: 6 }, { numerator: 5, denominator: 12 }, { numerator: 17, denominator: 12 } ]
    },
    {
        id: 13, level: 'hard', type: 'compare',
        questionText: 'Which fraction is greater?',
        fractions: [{ numerator: 5, denominator: 8 }, { numerator: 4, denominator: 7 }],
        answer: 0 // 5/8 (0.625) > 4/7 (~0.57)
    },
    {
        id: 14, level: 'hard', type: 'order',
        questionText: 'Put these in ascending order: 3/4, 2/3, 5/6, 1/2',
        fractions: [{ numerator: 3, denominator: 4 }, { numerator: 2, denominator: 3 }, { numerator: 5, denominator: 6 }, { numerator: 1, denominator: 2 }],
        order: 'ascending',
        answer: [{ numerator: 1, denominator: 2 }, { numerator: 2, denominator: 3 }, { numerator: 3, denominator: 4 }, { numerator: 5, denominator: 6 }]
    },
    {
        id: 15, level: 'hard', type: 'subtract',
        questionText: 'A whole pizza is cut into 8 slices. If 3/8 of it is left, how much was eaten? Select the eaten slices.',
        fractions: [{ numerator: 1, denominator: 1 }, { numerator: 3, denominator: 8 }],
        operator: '-',
        answer: { numerator: 5, denominator: 8 },
        displayType: 'pizza',
    }
];