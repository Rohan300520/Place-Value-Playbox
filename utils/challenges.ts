// Fix: Corrected import path for types
import type { ChallengeQuestion } from '../types';

// A comprehensive and balanced list of questions covering various concepts.
const allChallengeQuestions: ChallengeQuestion[] = [
    // --- LEVEL 1 (EASY) ---
    // Place Value & Number Words
    { id: 1, level: 1, question: "What number is 6 hundreds, 2 tens, and 7 ones?", answer: 627, type: 'build', concept: 'place_value' },
    { id: 2, level: 1, question: "Build the number three hundred sixty-four.", answer: 364, type: 'build', concept: 'number_word' },
    { id: 3, level: 1, question: "Build the largest 3-digit number you can make with the digits 8, 1, and 5.", answer: 851, type: 'build', concept: 'place_value' },
    { id: 4, level: 1, question: "What is the value of the digit 7 in the number 572? Build it.", answer: 70, type: 'interpret', concept: 'place_value' },
    { id: 5, level: 1, question: "Build the number nine hundred seventy-five.", answer: 975, type: 'build', concept: 'number_word' },
    // Addition & Subtraction (no regrouping)
    { id: 6, level: 1, question: "What is 245 + 32? Build the answer.", answer: 277, type: 'build', concept: 'addition' },
    { id: 7, level: 1, question: "What is 568 - 44? Build the answer.", answer: 524, type: 'build', concept: 'subtraction' },
    { id: 8, level: 1, question: "Find the sum of 610 and 58. Build it.", answer: 668, type: 'build', concept: 'addition' },
    { id: 9, level: 1, question: "Find the difference between 899 and 150. Build it.", answer: 749, type: 'build', concept: 'subtraction' },

    // --- LEVEL 2 (MEDIUM) ---
    // Place Value & Number Words
    { id: 10, level: 2, question: "What number do you get if you have 15 tens?", answer: 150, type: 'build', concept: 'place_value' },
    { id: 11, level: 2, question: "What is the value of the digit 5 in 5,482? Build it.", answer: 5000, type: 'interpret', concept: 'place_value' },
    { id: 12, level: 2, question: "What number is 9 thousands, 0 hundreds, 5 tens, and 8 ones?", answer: 9058, type: 'build', concept: 'place_value' },
    { id: 13, level: 2, question: "Build the number one thousand, two hundred ten.", answer: 1210, type: 'build', concept: 'number_word' },
    // Addition & Subtraction (with regrouping)
    { id: 14, level: 2, question: "What is 358 + 127? Build the answer.", answer: 485, type: 'build', concept: 'addition' },
    { id: 15, level: 2, question: "What is 734 - 219? Build the answer.", answer: 515, type: 'build', concept: 'subtraction' },
    { id: 16, level: 2, question: "There are 1,250 fish in a lake. 300 more are added. Build the new total.", answer: 1550, type: 'build', concept: 'addition' },
    { id: 17, level: 2, question: "A library has 2,468 books. 250 are checked out. How many are left? Build it.", answer: 2218, type: 'build', concept: 'subtraction' },
    { id: 18, level: 2, question: "Build four thousand, six hundred seven.", answer: 4607, type: 'build', concept: 'number_word' },
    
    // --- LEVEL 3 (HARD) ---
    // Place Value & Number Words
    { id: 19, level: 3, question: "I have 4 hundreds, 12 tens, and 5 ones. What number am I? Build it.", answer: 525, type: 'build', concept: 'place_value' },
    { id: 20, level: 3, question: "What is 7000 + 200 + 6? Build the answer.", answer: 7206, type: 'build', concept: 'place_value' },
    { id: 21, level: 3, question: "Build the number that comes just before 10,000.", answer: 9999, type: 'build', concept: 'place_value' },
    { id: 26, level: 3, question: "Build the number five thousand, fifteen.", answer: 5015, type: 'build', concept: 'number_word' },
    { id: 27, level: 3, question: "If you have 13 hundreds and 13 tens, what number do you have?", answer: 1430, type: 'build', concept: 'place_value' },
    // Addition & Subtraction (complex)
    { id: 22, level: 3, question: "A school has 478 boys and 535 girls. How many students in total? Build the answer.", answer: 1013, type: 'build', concept: 'addition' },
    { id: 23, level: 3, question: "What is 3000 - 545? Build the answer.", answer: 2455, type: 'build', concept: 'subtraction' },
    { id: 24, level: 3, question: "A farmer has 1250 apples. He sells 380. How many are left? Build the answer.", answer: 870, type: 'build', concept: 'subtraction' },
    { id: 25, level: 3, question: "What is 1250 + 345 + 205? Build the answer.", answer: 1800, type: 'build', concept: 'addition' },
];

// Filter out any questions that might exceed the app's current display limit of 4 columns.
export const challengeQuestions: ChallengeQuestion[] = allChallengeQuestions.filter(q => q.answer < 10000);
