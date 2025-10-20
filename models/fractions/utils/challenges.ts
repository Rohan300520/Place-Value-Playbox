import type { FractionChallengeQuestion } from '../../../types';

// Questions inspired by the progression of concepts in NCERT Class 6th Maths, Chapter 7: Fractions.
export const challenges: FractionChallengeQuestion[] = [
    // --- EASY ---
    // Concept: Addition and Subtraction of Like Fractions.
    {
        id: 1, level: 'easy', type: 'add',
        term1: { numerator: 1, denominator: 5 }, operator: '+', term2: { numerator: 2, denominator: 5 },
        answer: { numerator: 3, denominator: 5 }
    },
    {
        id: 2, level: 'easy', type: 'subtract',
        term1: { numerator: 7, denominator: 8 }, operator: '-', term2: { numerator: 3, denominator: 8 },
        answer: { numerator: 1, denominator: 2 } // Requires simplification
    },
    {
        id: 3, level: 'easy', type: 'add',
        term1: { numerator: 1, denominator: 6 }, operator: '+', term2: { numerator: 1, denominator: 6 },
        answer: { numerator: 1, denominator: 3 } // Requires simplification
    },
    // Concept: Adding unlike fractions where one denominator is a multiple of the other.
    {
        id: 4, level: 'easy', type: 'add',
        term1: { numerator: 1, denominator: 2 }, operator: '+', term2: { numerator: 1, denominator: 4 },
        answer: { numerator: 3, denominator: 4 },
    },
    {
        id: 5, level: 'easy', type: 'subtract',
        term1: { numerator: 1, denominator: 1 }, operator: '-', term2: { numerator: 3, denominator: 4 },
        answer: { numerator: 1, denominator: 4 }
    },
    
    // --- MEDIUM ---
    // Concept: Addition/Subtraction of Unlike Fractions.
    {
        id: 6, level: 'medium', type: 'add',
        term1: { numerator: 2, denominator: 3 }, operator: '+', term2: { numerator: 1, denominator: 6 },
        answer: { numerator: 5, denominator: 6 }
    },
    {
        id: 7, level: 'medium', type: 'subtract',
        term1: { numerator: 3, denominator: 4 }, operator: '-', term2: { numerator: 1, denominator: 8 },
        answer: { numerator: 5, denominator: 8 }
    },
    {
        id: 8, level: 'medium', type: 'add',
        term1: { numerator: 1, denominator: 2 }, operator: '+', term2: { numerator: 1, denominator: 3 },
        answer: { numerator: 5, denominator: 6 }
    },
    {
        id: 9, level: 'medium', type: 'subtract',
        term1: { numerator: 2, denominator: 3 }, operator: '-', term2: { numerator: 1, denominator: 3 },
        answer: { numerator: 1, denominator: 3 }
    },
    {
        id: 10, level: 'medium', type: 'add',
        term1: { numerator: 3, denominator: 8 }, operator: '+', term2: { numerator: 1, denominator: 4 },
        answer: { numerator: 5, denominator: 8 }
    },

    // --- HARD ---
    // Concept: More complex unlike fractions requiring LCM and simplification.
    {
        id: 11, level: 'hard', type: 'subtract',
        term1: { numerator: 5, denominator: 6 }, operator: '-', term2: { numerator: 1, denominator: 4 },
        answer: { numerator: 7, denominator: 12 }
    },
    {
        id: 12, level: 'hard', type: 'add',
        term1: { numerator: 2, denominator: 3 }, operator: '+', term2: { numerator: 3, denominator: 4 },
        answer: { numerator: 17, denominator: 12 } // Answer is an improper fraction
    },
    {
        id: 13, level: 'hard', type: 'subtract',
        term1: { numerator: 3, denominator: 4 }, operator: '-', term2: { numerator: 1, denominator: 3 },
        answer: { numerator: 5, denominator: 12 }
    },
    {
        id: 14, level: 'hard', type: 'add',
        term1: { numerator: 1, denominator: 3 }, operator: '+', term2: { numerator: 1, denominator: 4 },
        answer: { numerator: 7, denominator: 12 }
    },
    {
        id: 15, level: 'hard', type: 'subtract',
        term1: { numerator: 1, denominator: 1 }, operator: '-', term2: { numerator: 5, denominator: 8 },
        answer: { numerator: 3, denominator: 8 }
    }
];
