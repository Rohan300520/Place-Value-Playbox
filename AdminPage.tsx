import React, { useState, useEffect, useCallback } from 'react';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { getKeysFromStorage, saveKeysToStorage, GeneratedKey, STORAGE_KEY } from './utils/license';
import { BackgroundManager } from './components/Starfield';

export const AdminPage: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [generatedKeys, setGeneratedKeys] = useState<GeneratedKey[]>([]);

    useEffect(() => {
        // Check session storage for authentication status
        try {
            if (sessionStorage.getItem('isAdminAuthenticated') === 'true') {
                setIsAuthenticated(true);
            }
        } catch (e) {
            console.error("Could not access sessionStorage.", e);
        }

        // Function to load keys from storage
        const loadKeys = () => {
            setGeneratedKeys(getKeysFromStorage());
        };

        // Initial load
        loadKeys();
        setIsLoading(false);

        // Listen for changes to the keys in other tabs/windows to keep the dashboard live
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === STORAGE_KEY) {
                loadKeys();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []); // Runs once on mount

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

    const generateRandomKey = useCallback((): string => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let key: string;
        let isUnique = false;
        
        // Read the latest keys directly from storage to ensure uniqueness across tabs
        const currentKeys = getKeysFromStorage();
        
        while(!isUnique) {
            const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
            const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
            key = `SMARTC-${part1}-${part2}`;
            if (!currentKeys.some(k => k.key === key)) {
                isUnique = true;
            }
        }
        
        return key!;

    }, []); // No dependency needed as it reads directly from storage

    const handleGenerateKey = (details: {
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

        const newKey: GeneratedKey = {
            id: `key-${Date.now()}`,
            schoolName,
            key: generateRandomKey(),
            usageLimit,
            validityInMs,
            currentUsage: 0,
            createdAt: Date.now(),
        };
        
        // Read latest keys from storage before updating to prevent race conditions
        const currentKeys = getKeysFromStorage();
        const updatedKeys = [...currentKeys, newKey];
        
        // Optimistically update the UI for responsiveness
        setGeneratedKeys(updatedKeys);

        // Attempt to save to storage and handle potential failure
        const isSaveSuccessful = saveKeysToStorage(updatedKeys);
        if (!isSaveSuccessful) {
            alert('Error: Could not save the new key. Your browser storage may be full. Please clear some space and try again.');
            // Revert the UI state if the save fails
            setGeneratedKeys(currentKeys);
        }
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
                    />
                ) : (
                    <AdminLogin onLogin={handleLogin} />
                )}
             </div>
        </div>
    );
};