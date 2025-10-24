import type { SurfaceAreaTrainingStep, ShapeType } from '../../../types';

export const trainingPlans9: Record<ShapeType, SurfaceAreaTrainingStep[]> = {
    cuboid: [
        { step: 0, type: 'intro', title: 'Training: Cuboid', text: 'A cuboid is a 3D shape with 6 rectangular faces. Let\'s explore its formulas.', duration: 6000 },
        { step: 1, type: 'action', text: 'To find the Total Surface Area (TSA), we need the area of all 6 faces. Click "Unfold Net" to see them all.', requiredAction: 'unfold', spotlightOn: 'unfold_button' },
        { step: 2, type: 'feedback', text: 'The net shows the 6 faces, which consist of 3 pairs of identical rectangles.', duration: 5000 },
        { step: 3, type: 'action', text: 'Let\'s calculate the TSA. Select "TSA" from the calculation options.', requiredAction: 'select_calc_type', requiredValue: 'tsa', spotlightOn: 'calc_type-tsa' },
        { step: 4, type: 'action', text: 'Now click "Calculate" to see the formula breakdown.', requiredAction: 'calculate', spotlightOn: 'calculate_button' },
        { step: 5, type: 'feedback', text: 'TSA is the sum of all 6 faces. Hover over the formula parts in the Solution Panel to see how they correspond to the net.', duration: 8000, highlightPartId: ['top', 'bottom', 'front', 'back', 'left', 'right'] },
        { step: 6, type: 'feedback', text: 'The TSA formula is 2(lb + bh + hl), representing the three pairs of faces.', duration: 7000, highlightPartId: null },
        
        { step: 7, type: 'action', text: 'Now for LSA (Lateral Surface Area). This is the area of the 4 side faces only, excluding the top and bottom. Select "LSA".', requiredAction: 'select_calc_type', requiredValue: 'lsa', spotlightOn: 'calc_type-lsa' },
        { step: 8, type: 'action', text: 'Click "Calculate" again.', requiredAction: 'calculate', spotlightOn: 'calculate_button' },
        { step: 9, type: 'feedback', text: 'LSA = Area(Front) + Area(Back) + Area(Left) + Area(Right). Hover over the formula parts to see them highlighted.', duration: 8000, highlightPartId: ['front', 'back', 'left', 'right'] },
        { step: 10, type: 'feedback', text: 'This gives us (l×h) + (l×h) + (b×h) + (b×h), which simplifies to 2h(l+b).', duration: 8000 },

        { step: 11, type: 'action', text: 'Now for volume. Click "Fold Shape" to return to the 3D view.', requiredAction: 'unfold', spotlightOn: 'unfold_button' },
        { step: 12, type: 'action', text: 'Select "Volume" to see its formula.', requiredAction: 'select_calc_type', requiredValue: 'volume', spotlightOn: 'calc_type-volume' },
        { step: 13, type: 'action', text: 'Click "Calculate" to see the calculation.', requiredAction: 'calculate', spotlightOn: 'calculate_button' },
        { step: 14, type: 'feedback', text: 'Volume is the space inside. We find it by calculating the area of the base first.', duration: 6000, highlightPartId: 'bottom' },
        { step: 15, type: 'feedback', text: 'The base area is Length × Breadth (l × b). Then, we multiply this by the Height (h).', duration: 7000 },
        { step: 16, type: 'feedback', text: 'So, Volume = (Base Area) × Height = l × b × h.', duration: 7000 },
        { step: 17, type: 'complete', text: 'Cuboid training complete! You\'ve mastered its formulas.' }
    ],
    cube: [
        { step: 0, type: 'intro', title: 'Training: Cube', text: 'A cube is a special cuboid where all 6 faces are identical squares.', duration: 6000 },
        { step: 1, type: 'action', text: 'A cube has one dimension: the side length \'a\'. Try changing it with the slider.', requiredAction: 'change_dimension', spotlightOn: 'dimension-a' },
        { step: 2, type: 'action', text: 'Let\'s unfold the cube to see its 6 faces. Click "Unfold Net".', requiredAction: 'unfold', spotlightOn: 'unfold_button' },
        { step: 3, type: 'action', text: 'The area of one square face is a × a, or a². Select "TSA" and click "Calculate".', requiredAction: 'select_calc_type', requiredValue: 'tsa', spotlightOn: 'calc_type-tsa' },
        { step: 4, type: 'action', text: 'Now click "Calculate".', requiredAction: 'calculate', spotlightOn: 'calculate_button' },
        { step: 5, type: 'feedback', text: 'Since there are 6 identical faces, the TSA is 6 × a². Hover over the formula parts to see all faces highlighted.', duration: 8000, highlightPartId: ['top', 'bottom', 'left', 'right', 'front', 'back'] },
        
        { step: 6, type: 'action', text: 'The Lateral Surface Area (LSA) excludes the top and bottom. Select "LSA" and Calculate.', requiredAction: 'select_calc_type', requiredValue: 'lsa', spotlightOn: 'calc_type-lsa' },
        { step: 7, type: 'action', text: 'Click "Calculate".', requiredAction: 'calculate', spotlightOn: 'calculate_button' },
        { step: 8, type: 'feedback', text: 'Exactly. We are left with 4 side faces, so the LSA is 4 × a².', duration: 6000, highlightPartId: ['left', 'right', 'front', 'back'] },

        { step: 9, type: 'action', text: 'Now for volume. Fold the shape back, then select "Volume".', requiredAction: 'unfold', spotlightOn: 'unfold_button' },
        { step: 10, type: 'action', text: 'Select "Volume".', requiredAction: 'select_calc_type', requiredValue: 'volume', spotlightOn: 'calc_type-volume' },
        { step: 11, type: 'action', text: 'Now, click "Calculate".', requiredAction: 'calculate', spotlightOn: 'calculate_button' },
        { step: 12, type: 'feedback', text: 'Just like a cuboid, volume is Base Area × Height. For a cube, the base area is a².', duration: 7000, highlightPartId: 'bottom' },
        { step: 13, type: 'feedback', text: 'We multiply the base area by the height, which is also \'a\'. So, Volume = a² × a = a³.', duration: 7000 },
        { step: 14, type: 'complete', text: 'Cube training complete! You understand its simple formulas.' }
    ],
    cylinder: [
        { step: 0, type: 'intro', title: 'Training: Cylinder', text: 'A cylinder has two circular bases and a curved side. Let\'s derive its surface area.', duration: 6000 },
        { step: 1, type: 'action', text: 'To understand its surface area, let\'s see its parts. Click "Unfold Net".', requiredAction: 'unfold', spotlightOn: 'unfold_button' },
        { step: 2, type: 'feedback', text: 'The net shows the cylinder is made of two circles and one rectangle.', duration: 5000 },
        { step: 3, type: 'action', text: 'Let\'s find the Total Surface Area (TSA). Select "TSA" and click "Calculate".', requiredAction: 'select_calc_type', requiredValue: 'tsa', spotlightOn: 'calc_type-tsa' },
        { step: 4, type: 'action', text: 'Click "Calculate".', requiredAction: 'calculate', spotlightOn: 'calculate_button' },
        { step: 5, type: 'feedback', text: 'TSA is the sum of all parts: the top circle (πr²), the bottom circle (πr²), and the rectangle (2πrh). Hover over the formula parts to see them.', duration: 9000, highlightPartId: ['top_circle', 'bottom_circle', 'body_rect'] },

        { step: 6, type: 'action', text: 'The Curved Surface Area (CSA) is just the area of the rectangle. Select "CSA" and Calculate.', requiredAction: 'select_calc_type', requiredValue: 'lsa', spotlightOn: 'calc_type-lsa' },
        { step: 7, type: 'action', text: 'Click "Calculate".', requiredAction: 'calculate', spotlightOn: 'calculate_button' },
        { step: 8, type: 'feedback', text: 'The CSA is 2πrh. This is because the rectangle\'s width is the circumference of the base (2πr).', duration: 8000, highlightPartId: 'body_rect' },

        { step: 9, type: 'action', text: 'Now, click "Fold Shape" to learn about volume.', requiredAction: 'unfold', spotlightOn: 'unfold_button' },
        { step: 10, type: 'action', text: 'Select "Volume".', requiredAction: 'select_calc_type', requiredValue: 'volume', spotlightOn: 'calc_type-volume' },
        { step: 11, type: 'action', text: 'Click "Calculate" to see the result.', requiredAction: 'calculate', spotlightOn: 'calculate_button' },
        { step: 12, type: 'feedback', text: 'The volume is the area of the base (πr²) multiplied by the height (h).', duration: 8000, highlightPartId: 'bottom_circle' },
        { step: 13, type: 'feedback', text: 'Therefore, the formula for a cylinder\'s volume is πr²h.', duration: 6000 },
        { step: 14, type: 'complete', text: 'Cylinder training complete! You\'ve mastered its formulas.' }
    ],
    cone: [
        { step: 0, type: 'intro', title: 'Training: Cone', text: 'A cone has a circular base and a curved surface that tapers to a point.', duration: 6000 },
        { step: 1, type: 'feedback', text: 'First, notice the "slant height" (l). It\'s the diagonal distance from the tip to the base edge, found using Pythagoras: l = √(r² + h²).', duration: 9000 },
        { step: 2, type: 'action', text: 'To see how the area formula is derived, click "Unfold Net".', requiredAction: 'unfold', spotlightOn: 'unfold_button' },
        { step: 3, type: 'feedback', text: 'The net consists of its circular base and a sector of a larger circle.', duration: 6000 },
        { step: 4, type: 'action', text: 'Select "CSA" (Curved Surface Area) and click "Calculate".', requiredAction: 'select_calc_type', requiredValue: 'lsa', spotlightOn: 'calc_type-lsa' },
        { step: 5, type: 'action', text: 'Click "Calculate".', requiredAction: 'calculate', spotlightOn: 'calculate_button' },
        { step: 6, type: 'feedback', text: 'The area of this curved sector is given by the formula πrl. Hover over the formula part to see the sector highlighted.', duration: 9000, highlightPartId: 'body_main' },
        { step: 7, type: 'action', text: 'Now, select "TSA". This will include the base area as well.', requiredAction: 'select_calc_type', requiredValue: 'tsa', spotlightOn: 'calc_type-tsa' },
        { step: 8, type: 'feedback', text: 'TSA is the CSA (πrl) plus the area of the circular base (πr²).', duration: 8000, highlightPartId: ['body_main', 'base_circle'] },
        
        { step: 9, type: 'action', text: 'Now for volume. Click "Fold Shape".', requiredAction: 'unfold', spotlightOn: 'unfold_button' },
        { step: 10, type: 'action', text: 'Select "Volume".', requiredAction: 'select_calc_type', requiredValue: 'volume', spotlightOn: 'calc_type-volume' },
        { step: 11, type: 'feedback', text: 'A cone\'s volume is related to a cylinder\'s. Let\'s see how.', duration: 5000 },
        { step: 12, type: 'action', text: 'Click the "Compare Cone & Cylinder" button to bring in a cylinder with the same base and height.', requiredAction: 'toggle_comparison', spotlightOn: 'comparison_button' },
        { step: 13, type: 'feedback', text: 'Notice the volumes. The cone\'s volume is exactly ONE-THIRD of the cylinder\'s volume!', duration: 8000 },
        { step: 14, type: 'feedback', text: 'Since a cylinder\'s volume is πr²h, a cone\'s volume must be (1/3)πr²h.', duration: 7000 },
        { step: 15, type: 'complete', text: 'Cone training complete! You now know where its formulas come from.' }
    ],
    sphere: [
        { step: 0, type: 'intro', title: 'Training: Sphere', text: 'A sphere is a perfectly round 3D object where every surface point is equidistant from the center.', duration: 7000 },
        { step: 1, type: 'action', text: 'The only dimension a sphere has is its radius (r). Try changing it with the slider.', requiredAction: 'change_dimension', spotlightOn: 'dimension-r' },
        { step: 2, type: 'action', text: 'Let\'s calculate the Surface Area. Select "TSA".', requiredAction: 'select_calc_type', requiredValue: 'tsa', spotlightOn: 'calc_type-tsa' },
        { step: 3, type: 'action', text: 'Now click "Calculate" to see the formula.', requiredAction: 'calculate', spotlightOn: 'calculate_button' },
        { step: 4, type: 'feedback', text: 'An amazing fact is that a sphere\'s surface area is 4 times the area of a circle with the same radius.', duration: 8000 },
        { step: 5, type: 'feedback', text: 'Since a circle\'s area is πr², the sphere\'s surface area is 4πr². For a sphere, CSA and TSA are the same.', duration: 8000 },
        { step: 6, type: 'action', text: 'Now for the volume. Select "Volume".', requiredAction: 'select_calc_type', requiredValue: 'volume', spotlightOn: 'calc_type-volume' },
        { step: 7, type: 'action', text: 'Click "Calculate" to see the volume formula.', requiredAction: 'calculate', spotlightOn: 'calculate_button' },
        { step: 8, type: 'feedback', text: 'The formula for the volume of a sphere is (4/3)πr³. It is derived using advanced mathematics.', duration: 8000 },
        { step: 9, type: 'complete', text: 'Sphere training complete! You\'ve learned its fundamental formulas.' }
    ],
    hemisphere: [
        { step: 0, type: 'intro', title: 'Training: Hemisphere', text: 'A hemisphere is exactly half of a sphere. Let\'s break down its formulas.', duration: 6000 },
        { step: 1, type: 'action', text: 'First, the volume. Select "Volume".', requiredAction: 'select_calc_type', requiredValue: 'volume', spotlightOn: 'calc_type-volume' },
        { step: 2, type: 'action', text: 'Click "Calculate" to see the volume breakdown.', requiredAction: 'calculate', spotlightOn: 'calculate_button' },
        { step: 3, type: 'feedback', text: 'The logic is simple: the volume is half the volume of a full sphere.', duration: 6000 },
        { step: 4, type: 'feedback', text: 'Volume = (1/2) × Sphere\'s Volume = (1/2) × (4/3)πr³ = (2/3)πr³.', duration: 8000 },
        { step: 5, type: 'action', text: 'Now for the Curved Surface Area. Select "CSA".', requiredAction: 'select_calc_type', requiredValue: 'lsa', spotlightOn: 'calc_type-lsa' },
        { step: 6, type: 'action', text: 'Click "Calculate".', requiredAction: 'calculate', spotlightOn: 'calculate_button' },
        { step: 7, type: 'feedback', text: 'The curved part is half of a full sphere\'s surface. So, CSA = (1/2) × 4πr² = 2πr². Hover on the formula part to see it.', duration: 9000, highlightPartId: 'curved_surface' },
        { step: 8, type: 'action', text: 'But for TSA, we must also include the flat circular base. Select "TSA".', requiredAction: 'select_calc_type', requiredValue: 'tsa', spotlightOn: 'calc_type-tsa' },
        { step: 9, type: 'action', text: 'Click "Calculate" to see the full TSA breakdown.', requiredAction: 'calculate', spotlightOn: 'calculate_button' },
        { step: 10, type: 'feedback', text: 'The base is a circle with area πr². Hover on the base formula part to see it.', duration: 7000, highlightPartId: 'base_circle' },
        { step: 11, type: 'feedback', text: 'So, TSA = CSA + Area of Base = 2πr² + πr², which equals 3πr².', duration: 8000, highlightPartId: null },
        { step: 12, type: 'complete', text: 'Hemisphere training complete! Remember the key difference between CSA and TSA.' }
    ],
    // Empty placeholders for Class 10 shapes not trained in this module
    cone_on_hemisphere: [],
    cylinder_with_hemispheres: [],
    cone_on_cylinder: [],
    frustum: [],
};

export const trainingPlan10: SurfaceAreaTrainingStep[] = [
    { 
        step: 0, type: 'intro', title: 'Training: Combined Solids', text: 'Welcome to the Combined Solids Workshop!', 
        duration: 4000, 
    },
    { 
        step: 1, type: 'action', text: 'Let\'s explore a combined shape. Select the "Capsule" from the menu.', 
        requiredAction: 'select_shape', requiredValue: 'cylinder_with_hemispheres', 
        spotlightOn: 'shape-cylinder_with_hemispheres', 
    },
    { 
        step: 2, type: 'feedback', text: 'This capsule is a cylinder with a hemisphere at each end.', 
        duration: 4500, 
    },
    { 
        step: 3, type: 'action', text: 'Try changing the dimensions using the sliders on the right.', 
        requiredAction: 'change_dimension', spotlightOn: 'dimension', 
    },
    { 
        step: 4, type: 'feedback', text: 'The total volume is the sum of the cylinder\'s volume and the two hemispheres\' volumes.', 
        duration: 5000, 
    },
    { 
        step: 5, type: 'action', text: 'Let\'s prove it. Make sure "Volume" is selected and click "Calculate".', 
        requiredAction: 'calculate', spotlightOn: 'calculate_button', 
    },
    { 
        step: 6, type: 'feedback', text: 'See? The solution shows the calculation for each part before adding them up.', 
        duration: 5500, 
    },
    { 
        step: 7, type: 'action', text: 'You\'re a pro! Click Continue to finish.', 
        requiredAction: 'continue', 
    },
    { 
        step: 8, type: 'complete', text: 'Training Complete!'
    }
];