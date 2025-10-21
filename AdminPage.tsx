import React, { useState, useEffect, useCallback } from 'react';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { fetchKeys, createKeyInDB, deleteKeyFromDB, updateKeyInDB, GeneratedKey } from './utils/license';
import { BackgroundManager } from './components/Starfield';

// A simple utility to generate the random part of a key.
const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Formats the key into the SMARTC-XXXX-XXXX structure.
const formatNewKey = (): string => `SMARTC-${generateRandomString(4)}-${generateRandomString(4)}`;

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [keys, setKeys] = useState<GeneratedKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch keys from the database when the component mounts and the user is authenticated.
  useEffect(() => {
    if (isAuthenticated) {
      const loadKeys = async () => {
        setIsLoading(true);
        const fetchedKeys = await fetchKeys();
        setKeys(fetchedKeys);
        setIsLoading(false);
      };
      loadKeys();
    }
  }, [isAuthenticated]);

  // Handle login logic. For this example, we use environment variables.
  // In a real application, this should be a secure authentication flow.
  const handleLogin = (user: string, pass: string): boolean => {
    // Fix: Cast import.meta to any to access Vite environment variables, matching the pattern in supabaseClient.ts.
    const adminUser = (import.meta as any).env.VITE_ADMIN_USER;
    const adminPass = (import.meta as any).env.VITE_ADMIN_PASS;

    if (user === adminUser && pass === adminPass) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  // Handle key generation.
  const handleGenerateKey = useCallback(async (details: {
    schoolName: string;
    usageLimit: number;
    validityDays: number;
    validityHours: number;
    validityMinutes: number;
  }) => {
    const { schoolName, usageLimit, validityDays, validityHours, validityMinutes } = details;
    
    // Convert validity period to milliseconds
    const validityInMs = (validityDays * 24 * 60 * 60 * 1000) + 
                         (validityHours * 60 * 60 * 1000) + 
                         (validityMinutes * 60 * 1000);

    if (validityInMs <= 0) {
        alert("The validity period must be greater than zero.");
        return;
    }

    const newKeyString = formatNewKey();
    const newKeyData = {
      schoolName,
      usageLimit,
      validityInMs,
      key: newKeyString,
    };

    const createdKey = await createKeyInDB(newKeyData);
    if (createdKey) {
      setKeys(prevKeys => [createdKey, ...prevKeys]);
    } else {
      alert('Failed to create the key. Please check the console for errors.');
    }
  }, []);

  // Handle key deletion.
  const handleDeleteKey = useCallback(async (keyId: string) => {
    if (window.confirm('Are you sure you want to delete this key? This action cannot be undone.')) {
      const success = await deleteKeyFromDB(keyId);
      if (success) {
        setKeys(prevKeys => prevKeys.filter(key => key.id !== keyId));
      } else {
        alert('Failed to delete the key. Please check the console for errors.');
      }
    }
  }, []);
  
  // Handle key updates.
  const handleUpdateKey = useCallback(async (keyId: string, updates: { usageLimit: number; validityInMs: number }) => {
    const updatedKey = await updateKeyInDB(keyId, {
      usage_limit: updates.usageLimit,
      validity_in_ms: updates.validityInMs,
    });
    if (updatedKey) {
      setKeys(prevKeys => prevKeys.map(k => (k.id === keyId ? updatedKey : k)));
      return true; // Indicate success
    }
    alert('Failed to update the key. Please check the console for errors.');
    return false; // Indicate failure
  }, []);

  return (
    <div className="h-screen font-sans relative flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0">
        <BackgroundManager />
      </div>

      <div className="relative z-10 flex flex-col flex-1 min-h-0">
        {!isAuthenticated ? (
          <div className="flex-grow flex items-center justify-center p-4">
            <AdminLogin onLogin={handleLogin} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
            {isLoading ? (
              <div className="text-xl font-bold mt-8">Loading Key Data...</div>
            ) : (
              <AdminDashboard
                generatedKeys={keys}
                onGenerateKey={handleGenerateKey}
                onDeleteKey={handleDeleteKey}
                onUpdateKey={handleUpdateKey}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};