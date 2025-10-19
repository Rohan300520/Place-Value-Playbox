import type { FractionChallengeQuestion } from '../../../types';

export const challenges: FractionChallengeQuestion[] = [
    // --- EASY ---
    {
        id: 1, level: 'easy', type: 'add',
        term1: { numerator: 1, denominator: 4 }, operator: '+', term2: { numerator: 1, denominator: 4 },
        answer: { numerator: 1, denominator: 2 }
    },
    {
        id: 2, level: 'easy', type: 'add',
        term1: { numerator: 1, denominator: 3 }, operator: '+', term2: { numerator: 1, denominator: 3 },
        answer: { numerator: 2, denominator: 3 }
    },
    {
        id: 3, level: 'easy', type: 'subtract',
        term1: { numerator: 3, denominator: 4 }, operator: '-', term2: { numerator: 1, denominator: 4 },
        answer: { numerator: 1, denominator: 2 }
    },
    {
        id: 4, level: 'easy', type: 'add',
        term1: { numerator: 1, denominator: 2 }, operator: '+', term2: { numerator: 1, denominator: 2 },
        answer: { numerator: 1, denominator: 1 },
    },
    {
        id: 5, level: 'easy', type: 'subtract',
        term1: { numerator: 1, denominator: 1 }, operator: '-', term2: { numerator: 1, denominator: 2 },
        answer: { numerator: 1, denominator: 2 }
    },
    
    // --- MEDIUM ---
    {
        id: 6, level: 'medium', type: 'add',
        term1: { numerator: 1, denominator: 2 }, operator: '+', term2: { numerator: 1, denominator: 4 },
        answer: { numerator: 3, denominator: 4 }
    },
    {
        id: 7, level: 'medium', type: 'add',
        term1: { numerator: 1, denominator: 3 }, operator: '+', term2: { numerator: 1, denominator: 6 },
        answer: { numerator: 1, denominator: 2 }
    },
    {
        id: 8, level: 'medium', type: 'subtract',
        term1: { numerator: 2, denominator: 3 }, operator: '-', term2: { numerator: 1, denominator: 6 },
        answer: { numerator: 1, denominator: 2 }
    },
    {
        id: 9, level: 'medium', type: 'add',
        term1: { numerator: 3, denominator: 8 }, operator: '+', term2: { numerator: 1, denominator: 8 },
        answer: { numerator: 1, denominator: 2 }
    },
    {
        id: 10, level: 'medium', type: 'subtract',
        term1: { numerator: 1, denominator: 2 }, operator: '-', term2: { numerator: 1, denominator: 4 },
        answer: { numerator: 1, denominator: 4 }
    },

    // --- HARD ---
    {
        id: 11, level: 'hard', type: 'add',
        term1: { numerator: 1, denominator: 2 }, operator: '+', term2: { numerator: 1, denominator: 3 },
        answer: { numerator: 5, denominator: 6 }
    },
    {
        id: 12, level: 'hard', type: 'add',
        term1: { numerator: 1, denominator: 3 }, operator: '+', term2: { numerator: 1, denominator: 4 },
        answer: { numerator: 7, denominator: 12 }
    },
    {
        id: 13, level: 'hard', type: 'subtract',
        term1: { numerator: 3, denominator: 4 }, operator: '-', term2: { numerator: 1, denominator: 3 },
        answer: { numerator: 5, denominator: 12 }
    },
    {
        id: 14, level: 'hard', type: 'add',
        term1: { numerator: 5, denominator: 8 }, operator: '+', term2: { numerator: 1, denominator: 4 },
        answer: { numerator: 7, denominator: 8 }
    },
    {
        id: 15, level: 'hard', type: 'subtract',
        term1: { numerator: 2, denominator: 3 }, operator: '-', term2: { numerator: 1, denominator: 2 },
        answer: { numerator: 1, denominator: 6 }
    }
];