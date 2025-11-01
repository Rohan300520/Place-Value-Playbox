// A utility for handling browser-based speech synthesis.

const synth = window.speechSynthesis;

// This is a workaround for a Chrome bug where the speech synthesis engine can go silent.
// Periodically "pinging" it with resume() keeps it active.
if (synth) {
    const resumeInterval = setInterval(() => {
        if (synth.paused) {
            synth.resume();
        }
    }, 5000); // Ping every 5 seconds

    // It's good practice to clear the interval if the window unloads
    window.addEventListener('beforeunload', () => {
        clearInterval(resumeInterval);
    });
}

let voices: SpeechSynthesisVoice[] = [];

/**
 * Asynchronously retrieves the list of available speech synthesis voices.
 * It handles the case where voices are loaded asynchronously by the browser.
 * @returns A promise that resolves to an array of SpeechSynthesisVoice objects.
 */
function getVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const currentVoices = synth.getVoices();
    if (currentVoices.length) {
      voices = currentVoices;
      resolve(voices);
      return;
    }
    
    const onVoicesChanged = () => {
      voices = synth.getVoices();
      if (voices.length) {
        console.log("Speech synthesis voices loaded:", voices.map(v => ({ name: v.name, lang: v.lang, default: v.default })));
        synth.onvoiceschanged = null; // Prevent multiple triggers
        resolve(voices);
      }
    };
    synth.onvoiceschanged = onVoicesChanged;
  });
}

const voicesPromise = synth ? getVoices() : Promise.resolve([]);

// Keep a reference to the utterances to prevent garbage collection, a common issue.
const utteranceQueue: SpeechSynthesisUtterance[] = [];

/**
 * Finds the most suitable voice from the available list, prioritizing a sweet female voice.
 * This function is "offline-first": it will always prefer a local voice if one is available.
 * @param lang The desired language code (e.g., 'en-US').
 * @param availableVoices The list of all available voices.
 * @returns The best matching SpeechSynthesisVoice or null if none are found.
 */
const findBestVoice = (lang: string, availableVoices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    const langBase = lang.split('-')[0];
    const voicesForLang = availableVoices.filter(v => v.lang.startsWith(langBase));
    if (!voicesForLang.length) return null;

    const lowerCaseIncludes = (name: string, keyword: string) => name.toLowerCase().includes(keyword);

    const femaleVoiceChecks = [
        (v: SpeechSynthesisVoice) => lowerCaseIncludes(v.name, 'female') && lowerCaseIncludes(v.name, 'google'),
        (v: SpeechSynthesisVoice) => lowerCaseIncludes(v.name, 'female'),
        (v: SpeechSynthesisVoice) => ['zira', 'samantha', 'susan', 'serena', 'karen', 'tessa', 'fiona', 'moira', 'veena'].some(name => lowerCaseIncludes(v.name, name)),
        (v: SpeechSynthesisVoice) => lowerCaseIncludes(v.name, 'google') && !lowerCaseIncludes(v.name, 'male'),
        (v: SpeechSynthesisVoice) => !lowerCaseIncludes(v.name, 'male'),
    ];

    // Create prioritized lists of voices
    const localVoices = voicesForLang.filter(v => v.localService);
    const remoteVoices = voicesForLang.filter(v => !v.localService);

    // Search function to find a voice in a list based on checks
    const findVoice = (voiceList: SpeechSynthesisVoice[]) => {
        for (const check of femaleVoiceChecks) {
            const voice = voiceList.find(check);
            if (voice) return voice;
        }
        return null; // No female voice found from checks
    };

    // 1. Find best local female voice
    let bestVoice = findVoice(localVoices);
    if (bestVoice) {
        console.log("Selected best local female voice:", { name: bestVoice.name, lang: bestVoice.lang });
        return bestVoice;
    }

    // 2. If online, find best remote female voice
    bestVoice = findVoice(remoteVoices);
    if (bestVoice) {
        console.log("Selected best remote female voice:", { name: bestVoice.name, lang: bestVoice.lang });
        return bestVoice;
    }
    
    // 3. Fallback to first available local voice to ensure offline works
    if (localVoices.length > 0) {
        console.log("Using fallback local voice:", { name: localVoices[0].name, lang: localVoices[0].lang });
        return localVoices[0];
    }
    
    // 4. Absolute fallback: first available voice for the language (might be remote)
    if (voicesForLang.length > 0) {
        console.log("Using absolute fallback voice:", { name: voicesForLang[0].name, lang: voicesForLang[0].lang });
        return voicesForLang[0];
    }

    return null;
};


/**
 * Speaks the given text using the Web Speech API.
 * This function includes workarounds for common browser bugs.
 * @param text The text to be spoken.
 * @param lang The BCP 47 language code for the desired voice (e.g., 'en-US').
 * @returns A promise that resolves when speech is complete, or rejects on error.
 */
export const speak = (text: string, lang = 'en-US'): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    if (!synth) {
      console.warn('Speech Synthesis is not supported by this browser.');
      return resolve();
    }

    const availableVoices = await voicesPromise;
    if (!availableVoices.length) {
        console.warn('No speech synthesis voices available to speak.');
        return resolve();
    }

    // Fix: Removed unconditional `cancelSpeech()` to allow browser's native speech queue to work.
    // Interruptions are now handled explicitly in the component logic where needed.

    const utterance = new SpeechSynthesisUtterance(text);

    // Store a reference to the utterance to prevent it from being garbage collected.
    utteranceQueue.push(utterance);
    
    const removeFromQueue = () => {
        const index = utteranceQueue.indexOf(utterance);
        if (index > -1) utteranceQueue.splice(index, 1);
    };

    utterance.onend = () => {
        removeFromQueue();
        resolve();
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      removeFromQueue();
      // The 'interrupted' error is not a true error in our app's context. 
      // It happens when we intentionally cancel speech to start a new one.
      // We can safely ignore it by resolving the promise.
      if (event.error === 'interrupted' || event.error === 'canceled') {
          resolve();
          return;
      }
      
      // Log other, actual errors.
      console.error(`An error occurred during speech synthesis: ${event.error}`);
      reject(new Error(event.error));
    };
    
    const voice = findBestVoice(lang, availableVoices);
    const fallbackVoice = availableVoices.find(v => v.lang.startsWith('en-'));
                  
    if (voice) {
        utterance.voice = voice;
    } else if (fallbackVoice) {
        utterance.voice = fallbackVoice;
    }
    
    utterance.lang = lang;
    utterance.pitch = 1.2; // Increase pitch for a sweeter, more kid-friendly voice
    utterance.rate = 1; // Set rate to normal for clarity
    utterance.volume = 1;

    // Another workaround: if the synth is paused, resume it before speaking.
    if (synth.paused) {
        synth.resume();
    }

    synth.speak(utterance);
  });
};

/**
 * Immediately stops any speech that is currently in progress and clears the queue.
 */
export const cancelSpeech = (): void => {
    utteranceQueue.length = 0; // Clear our internal reference queue.
    if (synth && (synth.speaking || synth.pending)) {
        synth.cancel();
    }
};