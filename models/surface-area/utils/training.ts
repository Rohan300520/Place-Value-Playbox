import type { SurfaceAreaTrainingStep } from '../../../types';

export const trainingPlan9: SurfaceAreaTrainingStep[] = [
    { 
        step: 0, type: 'intro', text: 'Welcome to the Solid Shapes Explorer! I\'m Geo. I\'ll be your guide.', 
        duration: 4000, position: 'center' 
    },
    { 
        step: 1, type: 'action', text: 'Let\'s start by selecting a Cylinder. Click on its card below.', 
        requiredAction: 'select_shape', requiredValue: 'cylinder', 
        spotlightOn: 'shape-cylinder', position: 'shape-selector', arrow: 'down'
    },
    { 
        step: 2, type: 'feedback', text: 'Great choice! You can click and drag the shape to rotate it.', 
        duration: 4000, position: 'top-left'
    },
    { 
        step: 3, type: 'action', text: 'Now, let\'s change its size. Use the sliders on the right to adjust the cylinder\'s radius and height.', 
        requiredAction: 'change_dimension', spotlightOn: 'dimension', 
        position: 'input-panel', arrow: 'right' 
    },
    { 
        step: 4, type: 'feedback', text: 'See how the shape changes instantly? Perfect!', 
        duration: 3500, position: 'center'
    },
    { 
        step: 5, type: 'action', text: 'Let\'s calculate its Curved Surface Area (CSA). Click the "CSA" button.', 
        requiredAction: 'select_calc_type', requiredValue: 'lsa', 
        spotlightOn: 'calc_type-lsa', position: 'input-panel', arrow: 'right'
    },
    { 
        step: 6, type: 'action', text: 'Now click the "Calculate" button to see the magic.', 
        requiredAction: 'calculate', spotlightOn: 'calculate_button', 
        position: 'input-panel', arrow: 'right' 
    },
    { 
        step: 7, type: 'feedback', text: 'Excellent! The solution panel shows the exact formula and steps used.', 
        duration: 5000, position: 'input-panel', arrow: 'right' 
    },
    { 
        step: 8, type: 'action', text: 'One more cool trick! Click "Unfold Net" to see the shape\'s 2D surfaces.', 
        requiredAction: 'unfold', spotlightOn: 'unfold_button', 
        position: 'input-panel', arrow: 'right'
    },
    { 
        step: 9, type: 'feedback', text: 'This is the "net" of the cylinder. It\'s made of two circles and a rectangle!', 
        duration: 5000, position: 'top-left'
    },
    { 
        step: 10, type: 'action', text: 'You\'ve learned the basics! Click Continue to finish.', 
        requiredAction: 'continue', position: 'center'
    },
    { 
        step: 11, type: 'complete', text: 'Training Complete!', position: 'center'
    }
];

export const trainingPlan10: SurfaceAreaTrainingStep[] = [
    { 
        step: 0, type: 'intro', text: 'Welcome to the Combined Solids Workshop! I\'m Geo, your guide.', 
        duration: 4000, position: 'center' 
    },
    { 
        step: 1, type: 'action', text: 'Let\'s explore a combined shape. Select the "Capsule" from the menu.', 
        requiredAction: 'select_shape', requiredValue: 'cylinder_with_hemispheres', 
        spotlightOn: 'shape-cylinder_with_hemispheres', position: 'shape-selector', arrow: 'down'
    },
    { 
        step: 2, type: 'feedback', text: 'Nice! This capsule is a cylinder with a hemisphere at each end.', 
        duration: 4500, position: 'top-left'
    },
    { 
        step: 3, type: 'action', text: 'Try changing the dimensions using the sliders on the right.', 
        requiredAction: 'change_dimension', spotlightOn: 'dimension', 
        position: 'input-panel', arrow: 'right' 
    },
    { 
        step: 4, type: 'feedback', text: 'The total volume is the sum of the cylinder\'s volume and the two hemispheres\' volumes.', 
        duration: 5000, position: 'center'
    },
    { 
        step: 5, type: 'action', text: 'Let\'s prove it. Make sure "Volume" is selected and click "Calculate".', 
        requiredAction: 'calculate', spotlightOn: 'calculate_button', 
        position: 'input-panel', arrow: 'right' 
    },
    { 
        step: 6, type: 'feedback', text: 'See? The solution shows the calculation for each part before adding them up.', 
        duration: 5500, position: 'input-panel', arrow: 'right'
    },
    { 
        step: 7, type: 'action', text: 'You\'re a pro! Click Continue to finish.', 
        requiredAction: 'continue', position: 'center'
    },
    { 
        step: 8, type: 'complete', text: 'Training Complete!', position: 'center'
    }
];