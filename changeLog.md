# Smart Digital Lab - Changelog

## Version 1.2.0 - Polish & Enhancements (Latest)
- **New Feature:** Re-introduced the Model Introduction screen, which displays a photo of the physical model and its learning objectives before mode selection.
- **Training Mode:** Increased the display duration for feedback messages to give users more time to read and process instructions.
- **Challenge Mode:** Enhanced the reward for correct answers by adding a confetti celebration alongside the rocket launch animation, making success more exciting.
- **Playground Mode:** Increased the limit for the 'Thousands' column to 20 blocks to allow for building larger numbers.

## Version 1.1.0 - Major Bug Fixes & Stability
- **Training Mode Overhaul:**
    - Completely resolved a persistent bug that blocked users from dragging and dropping blocks during training steps. The interaction logic is now stable and reliable.
    - Rewrote the training plan to follow a more intuitive four-step sequence: block introduction, then regrouping for Ones, Tens, and Hundreds.
    - Fixed synchronization issues where audio instructions would not match the on-screen visual guide.
    - Corrected the training sequence to ensure steps proceed in the correct order (1s, 10s, 100s, 1000s).
    - Fixed a critical bug where regrouping 10 blocks would incorrectly create multiple new blocks instead of one.
- **Audio Engine:** Improved audio cue management to prevent instructions from being cut off.
- **Playground Mode:** Restored the "return drag" feature, allowing blocks to be removed by dropping them outside the columns.
- **Code Cleanup:** Removed the unused visual overlay from the training guide and streamlined state management for better performance.
