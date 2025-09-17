// This file simulates a secure, server-side key verification process by using localStorage
// as a persistent database for dynamically generated keys.

export interface GeneratedKey {
  id: string;
  schoolName: string;
  key: string;
  usageLimit: number;
  currentUsage: number;
  validityInMs: number;
  createdAt: number; // timestamp
}

export const STORAGE_KEY = 'generatedAccessKeys';

/**
 * Retrieves the list of all generated keys from localStorage.
 * @returns An array of GeneratedKey objects.
 */
export const getKeysFromStorage = (): GeneratedKey[] => {
  try {
    const keysJson = localStorage.getItem(STORAGE_KEY);
    return keysJson ? JSON.parse(keysJson) : [];
  } catch (e) {
    console.error('Failed to read keys from localStorage', e);
    return [];
  }
};

/**
 * Saves a list of generated keys to localStorage.
 * @param keys The array of GeneratedKey objects to save.
 * @returns `true` if the save was successful, `false` otherwise.
 */
export const saveKeysToStorage = (keys: GeneratedKey[]): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    return true;
  } catch (e) {
    console.error('Failed to save keys to localStorage. Storage might be full.', e);
    return false;
  }
};

/**
 * Formats a duration in milliseconds into a human-readable string (e.g., "15 days, 4 hours").
 * @param ms The duration in milliseconds.
 * @returns A formatted string.
 */
export const formatDuration = (ms: number): string => {
    if (ms <= 0) return '0 minutes';
    const totalMinutes = Math.floor(ms / 60000);
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);

    const remainingHours = totalHours % 24;
    const remainingMinutes = totalMinutes % 60;

    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (remainingHours > 0) parts.push(`${remainingHours} hour${remainingHours > 1 ? 's' : ''}`);
    if (remainingMinutes > 0) parts.push(`${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`);

    return parts.length > 0 ? parts.join(', ') : '0 minutes';
}


/**
 * Simulates an asynchronous call to a server to verify a license key.
 * @param key The license key entered by the user.
 * @returns A promise that resolves to an object indicating success or failure,
 *          with a message and the key's validity period on success.
 */
export const verifyKeyOnServer = (
  key: string
): Promise<{ success: boolean; message: string; validityInMs?: number }> => {
  return new Promise((resolve) => {
    // Simulate network latency of 0.5 to 1.5 seconds
    const delay = 500 + Math.random() * 1000;

    setTimeout(() => {
      const allKeys = getKeysFromStorage();
      const keyIndex = allKeys.findIndex((k) => k.key === key);

      // 1. Check if the key exists in our database
      if (keyIndex === -1) {
        const keyRegex = /^SMARTC-([A-Z0-9]{4})-([A-Z0-9]{4})$/;
        if (!keyRegex.test(key)) {
          resolve({ success: false, message: 'Invalid key format. Please check the key and try again.' });
        } else {
          resolve({ success: false, message: 'The key you entered is not valid.' });
        }
        return;
      }

      const keyDetails = allKeys[keyIndex];

      // 2. Check if the usage limit has been reached
      if (keyDetails.currentUsage >= keyDetails.usageLimit) {
        resolve({ success: false, message: 'This key has reached its maximum number of uses.' });
        return;
      }
      
      // 3. If all checks pass, the key is valid.
      // Increment the usage count and save back to storage using an immutable update.
      const updatedKeys = allKeys.map((k, index) => {
          if (index === keyIndex) {
              return { ...k, currentUsage: k.currentUsage + 1 };
          }
          return k;
      });
      
      const isSaveSuccessful = saveKeysToStorage(updatedKeys);
      
      if (!isSaveSuccessful) {
        // If we couldn't save the new usage count, we must abort the activation.
        resolve({ success: false, message: 'Error: Could not update key status. Storage may be full.' });
        return;
      }
      
      resolve({ 
        success: true, 
        message: 'Key successfully validated.', 
        validityInMs: keyDetails.validityInMs 
      });

    }, delay);
  });
};