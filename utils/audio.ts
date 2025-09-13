// A simple utility to play audio files with error handling.
export const playAudio = (path: string) => {
    try {
        const audio = new Audio(path);
        audio.play().catch(error => {
            // Autoplay can be blocked by the browser, we log this gracefully.
            console.warn("Audio playback was prevented:", error);
        });
    } catch (error) {
        console.error("Failed to create or play audio object:", error);
    }
};
