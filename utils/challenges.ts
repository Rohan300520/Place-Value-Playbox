import type { ChallengeQuestion } from '../types';

// FIX: Define all questions and explicitly type the array.
// This ensures that all objects conform to the ChallengeQuestion interface,
// including the literal type for the 'type' property, before filtering.
const allChallengeQuestions: ChallengeQuestion[] = [
    { id: 1, level: 1, question: "Build the largest 3-digit number using: 4, 7, 2.", answer: 742, type: 'build' },
    { id: 2, level: 1, question: "Build the smallest 3-digit number using: 4, 7, 2.", answer: 247, type: 'build' },
    { id: 3, level: 1, question: "In the number 572, what is the value of the digit 7? Build it.", answer: 70, type: 'interpret' },
    { id: 4, level: 1, question: "What number is 6 hundreds, 2 tens, and 7 ones?", answer: 627, type: 'build' },
    { id: 5, level: 1, question: "Build the number three hundred sixty-four.", answer: 364, type: 'build' },
    { id: 6, level: 1, question: "Build the number seven hundred, forty-eight.", answer: 748, type: 'build' },
    { id: 7, level: 1, question: "Which digit is in the hundreds place in 4,309? Build its value.", answer: 300, type: 'interpret' },
    { id: 8, level: 1, question: "Write the number 842 in expanded form? Build the value of the tens place.", answer: 40, type: 'interpret' },
    { id: 9, level: 1, question: "Write in numbers: Nine hundred seventy-five. Build it.", answer: 975, type: 'build' },

    { id: 10, level: 2, question: "What number do you get if you have 15 tens?", answer: 150, type: 'build' },
    { id: 11, level: 2, question: "What is the value of the digit 5 in 5,482? Build it.", answer: 5000, type: 'interpret' },
    { id: 12, level: 2, question: "In 4,798, what is the value of the 7? Build it.", answer: 700, type: 'interpret' },
    { id: 13, level: 2, question: "What number is 9 thousands, 0 hundreds, 5 tens, and 8 ones?", answer: 9058, type: 'build' },
    { id: 14, level: 2, question: "Build ninety-five thousand, two hundred ten.", answer: 95210, type: 'build' }, // Note: app currently only supports to 9999
    { id: 15, level: 2, question: "A magic box shows: 2 thousands, 3 hundreds, 4 tens, 7 ones. Build the number.", answer: 2347, type: 'build' },
    { id: 16, level: 2, question: "Use exactly 12 tens and 8 ones. What number do you get?", answer: 128, type: 'build' },
    { id: 17, level: 2, question: "Which digit is in the thousands place in 8,214? Build its value.", answer: 8000, type: 'interpret' },
    { id: 18, level: 2, question: "Write 4,607 in words. Build the number.", answer: 4607, type: 'build' },
    
    { id: 19, level: 3, question: "What is 300 + 20 + 8? Build the answer.", answer: 328, type: 'build' },
    { id: 20, level: 3, question: "What is 7000 + 200 + 6? Build the answer.", answer: 7206, type: 'build' },
    { id: 21, level: 3, question: "Build 278 and 287. Which number is greater? Build the greater number.", answer: 287, type: 'build' },
    { id: 22, level: 3, question: "Build the number that comes just before 10,000.", answer: 9999, type: 'build' },
    { id: 23, level: 3, question: "A number has 6 in the tens place and 3 in the thousands place. The hundreds digit is double the thousands digit (3x2=6). The ones digit is 5. What is the number?", answer: 3665, type: 'build' },
    { id: 24, level: 3, question: "What is 5482 - 482? Build the answer.", answer: 5000, type: 'build' },
    { id: 25, level: 3, question: "What is 1000 + 400 + 80 + 2? Build the answer.", answer: 1482, type: 'build' },
];

export const challengeQuestions: ChallengeQuestion[] = allChallengeQuestions.filter(q => q.answer < 10000); // Filter out questions that go beyond the thousands place for now
