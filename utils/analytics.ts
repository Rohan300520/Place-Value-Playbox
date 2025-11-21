import { supabase } from './supabaseClient';
import type { AnalyticsEvent, UserInfo, GlobalStats, SchoolSummary, SchoolUserDetails, UserChallengeHistory, DailyActivity, SchoolChallengeStats } from '../types';

const DB_NAME = 'SmartCAnalyticsDB';
const DB_VERSION = 1;
const STORE_NAME = 'events';

let dbPromise: Promise<IDBDatabase> | null = null;

const getDb = (): Promise<IDBDatabase> => {
    if (dbPromise) {
        return dbPromise;
    }
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(new Error('Failed to open IndexedDB.'));
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
    return dbPromise;
};

/**
 * Initializes the analytics service, including setting up event listeners for smart syncing.
 */
export const initAnalytics = () => {
    // Attempt to sync when the app comes back online
    window.addEventListener('online', syncAnalyticsData);
    
    // Attempt a final sync when the user is leaving the page
    // 'visibilitychange' is more reliable than 'beforeunload' on mobile
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            syncAnalyticsData();
        }
    });

    console.log("Analytics service initialized.");
};

/**
 * Logs a new analytics event to the IndexedDB queue.
 * @param eventName A string identifying the event (e.g., 'session_start').
 * @param userInfo The current user's information.
 * @param payload An optional object with additional event data.
 */
export const logEvent = async (
    eventName: string, 
    userInfo: UserInfo | null, 
    payload: Record<string, any> = {}
): Promise<void> => {
    if (!userInfo) {
        return;
    }
    const event: AnalyticsEvent = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        eventName,
        userInfo,
        payload,
    };

    try {
        const db = await getDb();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.add(event);
        await new Promise<void>((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (error) {
        console.error('Failed to log event to IndexedDB:', error);
    }
};

let isSyncing = false;
/**
 * Attempts to sync the locally stored analytics events with the Supabase backend.
 * This is a singleton process, preventing concurrent syncs.
 */
export const syncAnalyticsData = async (): Promise<void> => {
    if (!navigator.onLine || isSyncing) {
        return;
    }
    isSyncing = true;

    try {
        const db = await getDb();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const eventsToProcess: AnalyticsEvent[] = await new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        if (eventsToProcess.length === 0) {
            isSyncing = false;
            return;
        }

        console.log(`Attempting to sync ${eventsToProcess.length} events.`);

        const eventsToInsert = eventsToProcess.map(event => ({
            client_id: event.id,
            event_timestamp: new Date(event.timestamp).toISOString(),
            event_type: event.eventName,
            user_info: {
                name: event.userInfo.name,
                school: event.userInfo.school,
            },
            payload: event.payload,
            key_id: event.userInfo.keyId,
            model: event.payload.model || 'unknown',
        }));

        const { error } = await supabase.from('usage_logs').insert(eventsToInsert);

        if (error) {
            console.error('ANALYTICS SYNC FAILED. Data remains in local DB. Error:', error);

            // CRITICAL FIX: Handle Foreign Key Violation (Code 23503)
            // This means the Key ID in the logs no longer exists in the 'keys' table (it was deleted).
            // We must invalidate the user's session immediately.
            if (error.code === '23503') {
                console.warn("Sync failed due to missing Key ID. Invalidating session.");
                window.dispatchEvent(new CustomEvent('auth:session_invalidated'));
                
                // We also need to clear these events, otherwise they will block the queue forever.
                const deleteTx = db.transaction(STORE_NAME, 'readwrite');
                const deleteStore = deleteTx.objectStore(STORE_NAME);
                for (const event of eventsToProcess) {
                    deleteStore.delete(event.id);
                }
                await new Promise<void>((resolve, reject) => {
                    deleteTx.oncomplete = () => resolve();
                    deleteTx.onerror = () => reject(deleteTx.error);
                });
                return; // Exit early
            }
        } else {
            console.log(`Successfully synced ${eventsToProcess.length} analytics events.`);
            // On success, clear the synced events from IndexedDB
            const deleteTx = db.transaction(STORE_NAME, 'readwrite');
            const deleteStore = deleteTx.objectStore(STORE_NAME);
            for (const event of eventsToProcess) {
                deleteStore.delete(event.id);
            }
            await new Promise<void>((resolve, reject) => {
                deleteTx.oncomplete = () => resolve();
                deleteTx.onerror = () => reject(deleteTx.error);
            });
        }
    } catch (error) {
        console.error('An error occurred during the sync process:', error);
    } finally {
        isSyncing = false;
    }
};

// --- Functions to fetch aggregated data for the dashboard ---

export const getGlobalStats = async (model?: string): Promise<GlobalStats | null> => {
    const { data, error } = await supabase.rpc('get_global_stats', { p_model_name: model });
    if (error) {
        console.error('Error fetching global stats:', error);
        return null;
    }
    return data?.[0] || { total_users: 0, total_sessions: 0, total_challenge_attempts: 0, avg_success_rate: 0 };
};

export const getSchoolSummary = async (model?: string): Promise<SchoolSummary[]> => {
    const { data, error } = await supabase.rpc('get_school_summary', { p_model_name: model });
    if (error) {
        console.error('Error fetching school summary:', error);
        return [];
    }
    return data || [];
};

export const getSchoolDetails = async (schoolName: string, model?: string): Promise<SchoolUserDetails[]> => {
    const { data, error } = await supabase.rpc('get_school_details', { p_school_name: schoolName, p_model_name: model });
    if (error) {
        console.error('Error fetching school details:', error);
        return [];
    }
    return data || [];
};

export const getUserChallengeHistory = async (schoolName: string, userName: string, model?: string): Promise<UserChallengeHistory[]> => {
    const { data, error } = await supabase.rpc('get_user_challenge_history', { p_school_name: schoolName, p_user_name: userName, p_model_name: model });
    if (error) {
        console.error('Error fetching user challenge history:', error);
        return [];
    }
    return data || [];
};

export const getDailyActivity = async (model?: string): Promise<DailyActivity[]> => {
    const { data, error } = await supabase.rpc('get_daily_activity', { p_model_name: model });
    if (error) {
        console.error('Error fetching daily activity:', error);
        return [];
    }
    return data || [];
};

export const getSchoolChallengeStats = async (schoolName: string, model?: string): Promise<SchoolChallengeStats | null> => {
    const { data, error } = await supabase.rpc('get_school_challenge_stats', { p_school_name: schoolName, p_model_name: model });
    if (error) {
        console.error('Error fetching school challenge stats:', error);
        return null;
    }
    return data?.[0] || { correct_count: 0, incorrect_count: 0, timed_out_count: 0 };
};
