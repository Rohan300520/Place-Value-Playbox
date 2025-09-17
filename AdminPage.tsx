import React, { useState, useEffect, useCallback } from 'react';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { fetchKeys, createKeyInDB, deleteKeyFromDB, GeneratedKey } from './utils/license';
import { BackgroundManager } from './components/Starfield';
import { supabase } from './utils/supabaseClient';

export const AdminPage: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [generatedKeys, setGeneratedKeys] = useState<GeneratedKey[]>([]);

    const loadKeys = useCallback(async () => {
        const keys = await fetchKeys();
        setGeneratedKeys(keys);
    }, []);

    useEffect(() => {
        try {
            if (sessionStorage.getItem('isAdminAuthenticated') === 'true') {
                setIsAuthenticated(true);
            }
        } catch (e) {
            console.error("Could not access sessionStorage.", e);
        }

        loadKeys().finally(() => setIsLoading(false));

        // --- Supabase Realtime Subscription ---
        const handleRealtimeUpdate = (payload: any) => {
            console.log('Realtime update received!', payload);
            const { eventType, new: newRecord, old: oldRecord } = payload;
            
            if (eventType === 'INSERT') {
                setGeneratedKeys(currentKeys => [newRecord, ...currentKeys]);
            } else if (eventType === 'UPDATE') {
                setGeneratedKeys(currentKeys =>
                    currentKeys.map(key => key.id === newRecord.id ? newRecord : key)
                );
            } else if (eventType === 'DELETE') {
                // Supabase returns the primary key in `old` for DELETE events
                setGeneratedKeys(currentKeys =>
                    currentKeys.filter(key => key.id !== oldRecord.id)
                );
            }
        };
        
        const channel = supabase.channel('keys-realtime-admin')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'keys' },
                handleRealtimeUpdate
            )
            .subscribe();
        
        return () => {
            supabase.removeChannel(channel);
        };

    }, [loadKeys]);

    const handleLogin = (user: string, pass: string): boolean => {
        if (user === 'admin' && pass === 'admin') {
            try {
                sessionStorage.setItem('isAdminAuthenticated', 'true');
            } catch (e) {
                console.error("Could not write to sessionStorage.", e);
            }
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const generateRandomKey = useCallback(async (): Promise<string> => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let key: string;
        let isUnique = false;
        
        // This loop is a safeguard. With 36^8 possibilities, collisions are astronomically rare.
        while(!isUnique) {
            const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
            const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
            key = `SMARTC-${part1}-${part2}`;
            
            // Check for uniqueness against the database
            const { data, error } = await supabase.from('keys').select('key').eq('key', key);
            if (!error && data.length === 0) {
                isUnique = true;
            }
        }
        
        return key!;
    }, []);

    const handleGenerateKey = async (details: {
        schoolName: string;
        usageLimit: number;
        validityDays: number;
        validityHours: number;
        validityMinutes: number;
    }) => {
        const { schoolName, usageLimit, validityDays, validityHours, validityMinutes } = details;

        const validityInMs = 
            (validityDays * 24 * 60 * 60 * 1000) + 
            (validityHours * 60 * 60 * 1000) +
            (validityMinutes * 60 * 1000);

        const newKeyString = await generateRandomKey();

        const newKey = await createKeyInDB({
            schoolName,
            usageLimit,
            validityInMs,
            key: newKeyString,
        });
        
        if (!newKey) {
            alert('Error: Could not save the new key to the database.');
        }
        // State will be updated by the realtime subscription, no manual update needed.
    };

    const handleDeleteKey = async (keyId: string) => {
        if (!window.confirm('Are you sure you want to permanently delete this key? This action cannot be undone.')) {
            return;
        }
    
        // --- Optimistic UI Update ---
        // Keep a copy of the current state in case we need to revert.
        const originalKeys = [...generatedKeys];
        // Immediately remove the key from the UI.
        setGeneratedKeys(currentKeys => currentKeys.filter(key => key.id !== keyId));
    
        // Call the database function to delete the key.
        const success = await deleteKeyFromDB(keyId);
    
        if (!success) {
            // If the database deletion fails, show an error and revert the UI change.
            alert('Error: Could not delete the key from the database. Reverting change.');
            setGeneratedKeys(originalKeys);
        }
        // If successful, the UI is already correct. The realtime event will update other clients.
    };


    if (isLoading) {
        return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen">
             <BackgroundManager />
             <div className="relative z-10 p-4 sm:p-8">
                {isAuthenticated ? (
                    <AdminDashboard
                        generatedKeys={generatedKeys}
                        onGenerateKey={handleGenerateKey}
                        onDeleteKey={handleDeleteKey}
                    />
                ) : (
                    <AdminLogin onLogin={handleLogin} />
                )}
             </div>
        </div>
    );
};