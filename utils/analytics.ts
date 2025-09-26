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
        return [];
    }
};

// Function to save the event queue to localStorage
const saveEventQueue = (queue: AnalyticsEvent[]): void => {
    try {
        localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
        console.error("Could not save analytics events to localStorage.", e);
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
    const event: AnalyticsEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
 * Clears the local queue on successful sync.
 */
export const syncAnalyticsData = async (): Promise<void> => {
    if (!navigator.onLine) {
        console.log("Analytics sync skipped: browser is offline.");
        return;
    }

    const queue = getEventQueue();
    if (queue.length === 0) {
        return;
    }

    const eventsToInsert = queue.map(event => ({
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
        console.error('Error syncing analytics data:', error.message);
    } else {
        console.log(`Successfully synced ${queue.length} analytics events.`);
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
    return data[0] || null;
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
