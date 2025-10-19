import type { FractionTrainingStep } from '../../../types';

export const fractionTrainingPlan: FractionTrainingStep[] = [
  // --- Part 1: Building an Equation ---
  {
    step: 0,
    type: 'intro',
    text: "Welcome! Let's learn to add fractions by building an equation.",
    duration: 3000,
  },
  {
    step: 1,
    type: 'action',
    text: "First, click the '1/2' bar on the Fraction Wall above.",
    requiredAction: 'select_term1',
    requiredValue: { numerator: 1, denominator: 2 },
    spotlightOn: { numerator: 1, denominator: 2 },
  },
  {
    step: 2,
    type: 'feedback',
    text: "Great! You've added the first number to our equation.",
    duration: 3000,
  },
  {
    step: 3,
    type: 'action',
    text: "Now, click the '+' button in the control panel.",
    requiredAction: 'select_operator',
    requiredValue: '+',
    spotlightOn: '+',
  },
  {
    step: 4,
    type: 'feedback',
    text: "Perfect! We're ready for the second number.",
    duration: 3000,
  },
  {
    step: 5,
    type: 'action',
    text: "Let's add 1/4. Click the '1/4' bar on the Fraction Wall.",
    requiredAction: 'select_term2',
    requiredValue: { numerator: 1, denominator: 4 },
    spotlightOn: { numerator: 1, denominator: 4 },
  },
  {
    step: 6,
    type: 'feedback',
    text: "Awesome! Our equation is 1/2 + 1/4.",
    duration: 3000,
  },

  // --- Part 2: Solving and Understanding ---
  {
    step: 7,
    type: 'action',
    text: "The pieces are different sizes, so we can't add them yet. Click 'Solve' to see the magic of 'common denominators'!",
    requiredAction: 'solve',
    spotlightOn: 'solve',
  },
  {
    step: 8,
    type: 'feedback',
    text: "Watch! To add them, the 1/2 bar changes into two 1/4 bars. This gives them a common size!",
    duration: 5000, // Timed to match the first part of the solve animation
  },
  {
    step: 9,
    type: 'feedback',
    text: "Now that the pieces are the same size, we can add them! 2 fourths plus 1 fourth equals 3 fourths.",
    duration: 5000, // Timed to match the second part
    clearBoardAfter: true,
  },

  // --- Completion ---
  {
    step: 10,
    type: 'complete',
    text: "You've learned how to add fractions! You're ready to explore.",
  },
];
