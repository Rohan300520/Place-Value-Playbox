// This file handles all interactions with the Supabase backend for key verification and management.

import { supabase } from './supabaseClient';

export interface GeneratedKey {
  id: string; // UUID from Supabase
  school_name: string;
  key: string;
  usage_limit: number;
  current_usage: number;
  validity_in_ms: number;
  created_at: string; // ISO timestamp string from Supabase
}

/**
 * Fetches all generated keys from the Supabase database.
 * @returns A promise that resolves to an array of GeneratedKey objects.
 */
export const fetchKeys = async (): Promise<GeneratedKey[]> => {
  const { data, error } = await supabase
    .from('keys')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching keys:', error);
    return [];
  }
  return data || [];
};

/**
 * Deletes a specific key from the Supabase database.
 * @param keyId The UUID of the key to delete.
 * @returns A promise that resolves to a boolean indicating success.
 */
export const deleteKeyFromDB = async (keyId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('keys')
        .delete()
        .eq('id', keyId);

    if (error) {
        console.error('Error deleting key:', error);
        return false;
    }
    return true;
};

/**
 * Creates a new key in the Supabase database.
 * @param details An object containing the new key's properties.
 * @returns A promise that resolves to the newly created key or null on failure.
 */
export const createKeyInDB = async (details: {
  schoolName: string;
  usageLimit: number;
  validityInMs: number;
  key: string;
}): Promise<GeneratedKey | null> => {
  const { schoolName, usageLimit, validityInMs, key } = details;
  const { data, error } = await supabase
    .from('keys')
    .insert({
      school_name: schoolName,
      usage_limit: usageLimit,
      validity_in_ms: validityInMs,
      key: key,
      current_usage: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating key:', error);
    return null;
  }
  return data;
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
 * Verifies a license key against the Supabase database.
 * @param key The license key entered by the user.
 * @returns A promise that resolves to an object indicating success or failure,
 *          with a message and the key's validity period on success.
 */
export const verifyKeyOnServer = (
  key: string
): Promise<{ success: boolean; message: string; validityInMs?: number; school?: string; keyId?: string; }> => {
  return new Promise(async (resolve) => {
    // Simulate network latency of 0.5 to 1.5 seconds for UX
    const delay = 500 + Math.random() * 1000;

    // Fetch the key from Supabase
    const { data: keyDetails, error: fetchError } = await supabase
      .from('keys')
      .select('*')
      .eq('key', key)
      .single();

    if (fetchError || !keyDetails) {
      setTimeout(() => {
        const keyRegex = /^SMARTC-([A-Z0-9]{4})-([A-Z0-9]{4})$/;
        if (!keyRegex.test(key)) {
          resolve({ success: false, message: 'Invalid key format. Please check the key and try again.' });
        } else {
          resolve({ success: false, message: 'The key you entered is not valid.' });
        }
      }, delay);
      return;
    }
    
    // Check if the usage limit has been reached
    if (keyDetails.current_usage >= keyDetails.usage_limit) {
      setTimeout(() => {
        resolve({ success: false, message: 'This key has reached its maximum number of uses.' });
      }, delay);
      return;
    }
      
    // If valid, increment the usage count in Supabase.
    // NOTE: For a high-traffic app, an RPC function in Supabase would be better to avoid race conditions.
    // For this use case, a direct update is sufficient.
    const { error: updateError } = await supabase
      .from('keys')
      .update({ current_usage: keyDetails.current_usage + 1 })
      .eq('id', keyDetails.id);

    if (updateError) {
      setTimeout(() => {
        resolve({ success: false, message: 'Error: Could not update key status. Please try again.' });
      }, delay);
      return;
    }

    setTimeout(() => {
      resolve({ 
        success: true, 
        message: 'Key successfully validated.', 
        validityInMs: keyDetails.validity_in_ms,
        school: keyDetails.school_name,
        keyId: keyDetails.id
      });
    }, delay);
  });
};