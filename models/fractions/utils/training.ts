import type { FractionTrainingStep } from '../../../types';

export const fractionTrainingPlan: FractionTrainingStep[] = [
  // --- Module 1: Meet the Fraction Chart ---
  {
    module: 1, step: 0, type: 'intro',
    text: "Welcome! This is your Fraction Chart. The top bar is one WHOLE.",
    spotlightOn: 'chart_row-1',
    duration: 5000,
  },
  {
    module: 1, step: 1, type: 'feedback',
    text: "Each row below is one whole, cut into equal parts. Look at the '1/4' row. The bottom number, the denominator, tells us it's cut into 4 equal parts.",
    spotlightOn: 'chart_row-4',
    duration: 8000,
  },
  {
    module: 1, step: 2, type: 'action',
    text: "Now, drag one of the '1/4' pieces to the workspace below.",
    requiredAction: 'drag_piece',
    requiredValue: { numerator: 1, denominator: 4 },
    spotlightOn: 'chart_row-4',
  },
  {
    module: 1, step: 3, type: 'feedback',
    text: "Great! You have selected 1 of the 4 parts. The top number, the numerator, tells us how many parts we have. This piece represents 1/4.",
    duration: 8000,
    clearWorkspaceAfter: true,
  },

  // --- Module 2: Types of Fractions ---
  {
    module: 2, step: 4, type: 'action', text: "Ready for the next concept?", requiredAction: 'continue', spotlightOn: 'continue_button'
  },
  {
    module: 2, step: 5, type: 'action',
    text: "Any fraction smaller than one WHOLE is a Proper Fraction. Drag 3 pieces of '1/8' into the workspace to build 3/8.",
    requiredAction: 'drag_piece',
    requiredValue: { numerator: 1, denominator: 8 },
    requiredCount: 3,
    spotlightOn: 'chart_row-8'
  },
  {
    module: 2, step: 6, type: 'feedback',
    text: "See how 3/8 is shorter than the WHOLE bar? It's a proper fraction.",
    duration: 6000,
    spotlightOn: 'whole_bar',
    clearWorkspaceAfter: true,
  },
  {
    module: 2, step: 7, type: 'action',
    text: "Now, let's make a fraction bigger than one WHOLE. Drag three '1/2' pieces into the workspace.",
    requiredAction: 'drag_piece',
    requiredValue: { numerator: 1, denominator: 2 },
    requiredCount: 3,
    spotlightOn: 'chart_row-2'
  },
  {
    module: 2, step: 8, type: 'feedback',
    text: "This is longer than one WHOLE! You have 3 halves (3/2). When the numerator is bigger, it's an Improper Fraction.",
    duration: 8000,
    spotlightOn: 'whole_bar'
  },
  {
    module: 2, step: 9, type: 'feedback',
    text: "Let's look at your 3/2 again. Two of the 1/2 pieces form one WHOLE, right? Watch them merge!",
    animation: 'merge',
    duration: 7000,
  },
  {
    module: 2, step: 10, type: 'feedback', text: "They merged to form 1 WHOLE! You now have a whole piece and a half piece.", duration: 6000
  },
  {
    module: 2, step: 11, type: 'feedback',
    text: "When we write 1 ½, it's called a Mixed Fraction. It's a mix of a whole number and a proper fraction.",
    duration: 8000,
  },
  {
    module: 2, step: 12, type: 'action', text: "Click Continue when you're ready to move on.", requiredAction: 'continue', spotlightOn: 'continue_button', clearWorkspaceAfter: true
  },

  // --- Module 3: Comparing Fractions ---
  {
    module: 3, step: 13, type: 'action', text: "Let's learn to compare fractions.", requiredAction: 'continue', spotlightOn: 'continue_button'
  },
  {
    module: 3, step: 14, type: 'action',
    text: "Let's compare 2/3 and 3/4. First, build a 2/3 bar (two 1/3 pieces) in the workspace.",
    requiredAction: 'drag_piece',
    requiredValue: { numerator: 1, denominator: 3 },
    requiredCount: 2,
    spotlightOn: 'chart_row-3'
  },
  {
    module: 3, step: 15, type: 'action',
    text: "Now build a 3/4 bar (three 1/4 pieces) below it.",
    requiredAction: 'drag_piece',
    requiredValue: { numerator: 1, denominator: 4 },
    requiredCount: 3,
    spotlightOn: 'chart_row-4'
  },
  {
    module: 3, step: 16, type: 'action',
    text: "Which bar is longer? Click on the group of pieces that represents the larger fraction.",
    requiredAction: 'click_bar',
    requiredValue: { numerator: 3, denominator: 4 }
  },
  {
    module: 3, step: 17, type: 'feedback',
    text: "Correct! You can see that 3/4 is greater than 2/3. The chart makes comparing easy!",
    duration: 7000,
    clearWorkspaceAfter: true,
  },
  
  // --- Module 4: Addition & Subtraction ---
  {
    module: 4, step: 18, type: 'action', text: "Now let's add and subtract.", requiredAction: 'continue', spotlightOn: 'continue_button'
  },
  {
    module: 4, step: 19, type: 'action',
    text: "Let's solve 1/3 + 1/6. Drag a 1/3 piece into the workspace.",
    requiredAction: 'drag_piece',
    requiredValue: { numerator: 1, denominator: 3 },
    requiredCount: 1,
    spotlightOn: 'chart_row-3',
  },
  {
    module: 4, step: 20, type: 'action',
    text: "And now the 1/6 piece.",
    requiredAction: 'drag_piece',
    requiredValue: { numerator: 1, denominator: 6 },
    requiredCount: 1,
    spotlightOn: 'chart_row-6',
  },
  {
    module: 4, step: 21, type: 'feedback',
    text: "The pieces are different sizes! To add them, we need to make them the same size.",
    duration: 6000
  },
  {
    module: 4, step: 22, type: 'action', text: "Let's find a common size using the chart.", requiredAction: 'continue', spotlightOn: 'continue_button'
  },
  {
    module: 4, step: 23, type: 'feedback',
    text: "Look at the 1/3 piece and the rows below it. The 1/6 pieces line up perfectly! Two 1/6 pieces are the same size as one 1/3 piece.",
    spotlightOn: 'chart_row-6',
    duration: 9000
  },
  {
    module: 4, step: 24, type: 'feedback',
    text: "The pieces are different sizes! Watch as we convert 1/3 into sixths to make them the same.",
    animation: 'split',
    animationTarget: { numerator: 1, denominator: 3 },
    animationSplitResult: { numerator: 1, denominator: 6 },
    duration: 7000
  },
  {
    module: 4, step: 25, type: 'feedback',
    text: "So, 1/3 is the same as 2/6. We are really adding 2/6 + 1/6, which equals 3/6.",
    duration: 8000
  },
  {
    module: 4, step: 26, type: 'feedback',
    text: "And 3/6 can be simplified to 1/2. Now let's see how mathematicians write this down.",
    duration: 7000
  },
  {
    module: 4, step: 27, type: 'action',
    text: "Click the 'Solve' button to see the formal steps.",
    requiredAction: 'solve',
    spotlightOn: 'solve_button',
  },
  {
    module: 4, step: 28, type: 'feedback',
    text: "Great job! Here is how mathematicians write down those steps using numbers.",
    duration: 12000,
  },
  
  // --- Module 4: Subtraction (revamped) ---
  {
    module: 4, step: 29, type: 'action', text: "Finally, let's try subtraction. It's just like addition, but backwards!", requiredAction: 'continue', spotlightOn: 'continue_button', clearWorkspaceAfter: true,
  },
  {
    module: 4, step: 30, type: 'action',
    text: "Let's solve 3/4 - 1/4. First, drag three 1/4 pieces into the workspace.",
    requiredAction: 'drag_piece',
    requiredValue: { numerator: 1, denominator: 4 },
    requiredCount: 3,
    spotlightOn: 'chart_row-4',
  },
  {
    module: 4, step: 31, type: 'feedback',
    text: "Great! You have 3 fourths. Now we need to subtract, or take away, 1 fourth.",
    duration: 7000,
  },
  {
    module: 4, step: 32, type: 'feedback',
    text: "Watch closely as one piece disappears! Poof!",
    animation: 'remove',
    animationTarget: { numerator: 1, denominator: 4 },
    duration: 5000,
  },
  {
    module: 4, step: 33, type: 'feedback',
    text: "We started with 3 pieces and took 1 away. How many are left? That's right, 2 pieces!",
    duration: 7000,
  },
  {
    module: 4, step: 34, type: 'feedback',
    text: "So, 3/4 minus 1/4 equals 2/4.",
    duration: 6000,
  },
  {
    module: 4, step: 35, type: 'feedback',
    text: "And look! Two 1/4 pieces are the same size as one 1/2 piece. So 2/4 is the same as 1/2.",
    duration: 8000,
  },
  {
    module: 4, step: 36, type: 'action',
    text: "Awesome! Let's try a trickier one.",
    requiredAction: 'continue',
    spotlightOn: 'continue_button',
    clearWorkspaceAfter: true,
  },

  // --- Subtraction with different denominators ---
  {
    module: 4, step: 37, type: 'action',
    text: "Let's solve 1/2 - 1/4. First, drag a 1/2 piece into the workspace.",
    requiredAction: 'drag_piece',
    requiredValue: { numerator: 1, denominator: 2 },
    requiredCount: 1,
    spotlightOn: 'chart_row-2',
  },
  {
    module: 4, step: 38, type: 'feedback',
    text: "Hmm, we have a 1/2 piece, but we need to subtract a 1/4 piece. They are different sizes!",
    duration: 7000,
  },
  {
    module: 4, step: 39, type: 'feedback',
    text: "We can't subtract until the pieces are the same size. We need a common denominator!",
    duration: 7000,
  },
  {
    module: 4, step: 40, type: 'feedback',
    text: "Let's change the 1/2 piece into smaller, equal pieces. Watch it split into two 1/4 pieces!",
    animation: 'split',
    animationTarget: { numerator: 1, denominator: 2 },
    animationSplitResult: { numerator: 1, denominator: 4 },
    duration: 7000,
  },
  {
    module: 4, step: 41, type: 'feedback',
    text: "Perfect! Now we have two 1/4 pieces. This is the same as 1/2.",
    duration: 6000,
  },
  {
    module: 4, step: 42, type: 'feedback',
    text: "Now we can take away one 1/4 piece. Ready? Here it goes!",
    animation: 'remove',
    animationTarget: { numerator: 1, denominator: 4 },
    duration: 5000,
  },
  {
    module: 4, step: 43, type: 'feedback',
    text: "What's left? Just one 1/4 piece!",
    duration: 6000,
  },
  {
    module: 4, step: 44, type: 'feedback',
    text: "So, 1/2 minus 1/4 equals 1/4. You did it!",
    duration: 8000,
    clearWorkspaceAfter: true
  },

  // --- Completion ---
  {
    module: 5, step: 45, type: 'complete',
    text: "Training Complete! You're ready to explore fractions on your own.",
  },
];
