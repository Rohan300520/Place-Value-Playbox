import { supabase } from './supabaseClient';
import type { AnalyticsEvent, UserInfo, GlobalStats, SchoolSummary, SchoolUserDetails, UserChallengeHistory } from '../types';

const ANALYTICS_STORAGE_KEY = 'app_analytics_events';

// Function to get the event queue from localStorage
const getEventQueue = (): AnalyticsEvent[] => {
    try {
        const storedEvents = localStorage.getItem(ANALYTICS_STORAGE_KEY);
        return storedEvents ? JSON.parse(storedEvents) : [];
    } catch (e) {
        console.error("Could not read analytics events from localStorage.", e);
        localStorage.removeItem(ANALYTICS_STORAGE_KEY); // Clear corrupted data
        return [];
    }
};

// Function to save the event queue to localStorage
const saveEventQueue = (queue: AnalyticsEvent[]): void => {
    try {
        localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
        console.error("Could not save analytics events to localStorage. Error:", e);
    }
};

/**
 * Logs a new analytics event to a queue in localStorage.
 * @param eventName A string identifying the event (e.g., 'session_start').
 * @param userInfo The current user's information.
 * @param payload An optional object with additional event data.
 */
export const logEvent = (
    eventName: string, 
    userInfo: UserInfo | null, 
    payload: Record<string, any> = {}
): void => {
    if (!userInfo) {
        // Do not log events if there is no user context
        return;
    }
    const event: AnalyticsEvent = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        eventName,
        userInfo,
        payload,
    };

    const queue = getEventQueue();
    queue.push(event);
    saveEventQueue(queue);
};

/**
 * Attempts to sync the locally stored analytics events with the Supabase backend.
 * This function is designed to be resilient and will discard a failing batch to prevent the queue from getting stuck.
 */
export const syncAnalyticsData = async (): Promise<void> => {
    if (!navigator.onLine) {
        console.log("Analytics sync skipped: browser is offline.");
        return;
    }

    // Immediately grab the current queue and clear storage. This prevents a "stuck" queue.
    // If the sync fails, this batch of events will be discarded, but subsequent events will still be processed.
    const eventsToProcess = getEventQueue();
    if (eventsToProcess.length === 0) {
        return;
    }
    saveEventQueue([]); // Clear the queue optimistically.

    // A simple regex to validate a UUID.
    const isUUID = (str: string) => 
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);

    // Self-healing: Filter out any old, malformed events that don't have a valid UUID.
    const validEvents = eventsToProcess.filter(event => event.id && isUUID(event.id));
    
    if (validEvents.length !== eventsToProcess.length) {
        console.warn(`Discarded ${eventsToProcess.length - validEvents.length} malformed events from the analytics batch.`);
    }
    
    if (validEvents.length === 0) {
        console.log("No valid events in the batch to sync.");
        return;
    }

    const eventsToInsert = validEvents.map(event => ({
        client_id: event.id,
        event_timestamp: new Date(event.timestamp).toISOString(),
        event_type: event.eventName,
        user_info: {
            name: event.userInfo?.name || 'Unknown',
            school: event.userInfo?.school || 'Unknown',
        },
        payload: event.payload,
        key_id: event.userInfo?.keyId || null,
        model: 'place-value-playbox', // Hardcoded for now
    }));

    const { error } = await supabase.from('usage_logs').insert(eventsToInsert);

    if (error) {
        console.error('CRITICAL: Error syncing analytics data. This batch of events has been discarded to prevent a blockage.', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            count: eventsToInsert.length,
        });
        // Note: We do not requeue the events to avoid a permanent failure loop.
    } else {
        console.log(`Successfully synced ${validEvents.length} analytics events.`);
    }
};


// --- Functions to fetch aggregated data for the dashboard ---

export const getGlobalStats = async (): Promise<GlobalStats | null> => {
    const { data, error } = await supabase.rpc('get_global_stats');
    if (error) {
        console.error('Error fetching global stats:', error);
        return null;
    }
    return data?.[0] || null;
};

export const getSchoolSummary = async (): Promise<SchoolSummary[]> => {
    const { data, error } = await supabase.rpc('get_school_summary');
    if (error) {
        console.error('Error fetching school summary:', error);
        return [];
    }
    return data || [];
};

export const getSchoolDetails = async (schoolName: string): Promise<SchoolUserDetails[]> => {
    const { data, error } = await supabase.rpc('get_school_details', { p_school_name: schoolName });
    if (error) {
        console.error('Error fetching school details:', error);
        return [];
    }
    return data || [];
};

export const getUserChallengeHistory = async (schoolName: string, userName: string): Promise<UserChallengeHistory[]> => {
    const { data, error } = await supabase.rpc('get_user_challenge_history', { p_school_name: schoolName, p_user_name: userName });
    if (error) {
        console.error('Error fetching user challenge history:', error);
        return [];
    }
    return data || [];
};