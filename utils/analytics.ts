import { supabase } from './supabaseClient';
import type { AnalyticsEvent, UserInfo } from '../types';

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
    // Prevent syncing if the browser is offline
    if (!navigator.onLine) {
        console.log("Analytics sync skipped: browser is offline.");
        return;
    }

    const queue = getEventQueue();
    if (queue.length === 0) {
        return; // Nothing to sync
    }

    // Transform the event structure to match the expected database schema
    const eventsToInsert = queue.map(event => ({
        event_id: event.id,
        timestamp: new Date(event.timestamp).toISOString(),
        event_name: event.eventName,
        user_name: event.userInfo?.name || 'N/A',
        school_name: event.userInfo?.school || 'N/A',
        key_id: event.userInfo?.keyId || 'N/A',
        payload: event.payload,
    }));

    const { error } = await supabase.from('analytics').insert(eventsToInsert);

    if (error) {
        console.error('Error syncing analytics data:', error.message);
        // We don't clear the queue if the sync fails, so we can retry later.
    } else {
        console.log(`Successfully synced ${queue.length} analytics events.`);
        // Clear the queue after successful sync
        saveEventQueue([]);
    }
};
