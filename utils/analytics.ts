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
 * This version is designed for diagnostics: it will not discard data on failure and will log detailed errors.
 */
export const syncAnalyticsData = async (): Promise<void> => {
    if (!navigator.onLine) {
        console.log("Analytics sync skipped: browser is offline.");
        return;
    }

    const eventsToProcess = getEventQueue();
    if (eventsToProcess.length === 0) {
        return;
    }

    // A simple regex to validate a UUID.
    const isUUID = (str: string) => 
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
    
    // Filter out any malformed events to ensure the batch is as clean as possible.
    const validEvents = eventsToProcess.filter(event => event.id && isUUID(event.id) && event.userInfo);
    
    if (validEvents.length === 0) {
        // If all events are malformed, clear the queue to prevent an infinite loop.
        if (eventsToProcess.length > 0) {
            console.warn("Clearing analytics queue: all events were malformed (missing ID or userInfo).");
            saveEventQueue([]);
        }
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
        model: 'place-value-playbox',
    }));

    const { error } = await supabase.from('usage_logs').insert(eventsToInsert);

    if (error) {
        // On failure, log a detailed error and KEEP the data in localStorage for the next attempt.
        console.error('ANALYTICS SYNC FAILED. Data remains in local storage. Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        });
        // For deep debugging, log the actual data that was sent.
        console.log('Failing data batch:', JSON.stringify(eventsToInsert, null, 2));
    } else {
        // On success, clear the local queue.
        console.log(`Successfully synced ${validEvents.length} analytics events. Clearing local queue.`);
        saveEventQueue([]);
    }
};


// --- Functions to fetch aggregated data for the dashboard ---

export const getGlobalStats = async (): Promise<GlobalStats | null> => {
    const { data, error } = await supabase.rpc('get_global_stats');
    if (error) {
        console.error('Error fetching global stats:', error);
        return null;
    }
    return data?.[0] || { total_users: 0, total_sessions: 0, total_challenge_attempts: 0, avg_success_rate: 0 };
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