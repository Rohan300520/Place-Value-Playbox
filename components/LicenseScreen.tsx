import React, { useState } from 'react';
import { formatDuration } from '../utils/license';

interface LicenseScreenProps {
  status: 'locked' | 'expired' | 'tampered';
  onVerify: (key: string, name: string) => Promise<{ success: boolean; message: string }>;
  expiredDuration: number | null;
}

export const LicenseScreen: React.FC<LicenseScreenProps> = ({ status, onVerify, expiredDuration }) => {
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getTitle = () => {
    switch (status) {
      case 'expired':
        return 'Access Expired';
      case 'tampered':
        return 'System Error';
      case 'locked':
      default:
        return 'Application Locked';
    }
  };

  const getDescription = () => {
    switch (status) {
      case 'expired':
        const durationText = expiredDuration ? formatDuration(expiredDuration) : 'The previous';
        return `Your ${durationText} access period has ended. Please enter your name and a new key to continue.`;
      case 'tampered':
        return 'An invalid system time has been detected. Please correct your device clock and restart the application.';
      case 'locked':
      default:
        return 'This application is for authorized institutional use only. Please enter your name and provided access key.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedKey = key.trim();
    const trimmedName = name.trim();
    if (!trimmedKey || !trimmedName) {
      setError('Please enter your name and a key.');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await onVerify(trimmedKey, trimmedName);
      if (!result.success) {
        setError(result.message);
      }
      // On success, the parent component will handle reloading the application.
    } catch (e) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center p-4" style={{ color: 'var(--text-primary)' }}>
      <div
        className="w-full max-w-lg p-8 rounded-3xl shadow-2xl animate-pop-in text-center"
        style={{
          backgroundColor: 'var(--backdrop-bg)',
          borderColor: 'var(--border-primary)',
          borderWidth: '1px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <img src="/assets/logo.svg" alt="SMART C Logo" className="h-16 mx-auto mb-4" />
        <h1 className="text-4xl font-black font-display mb-2" style={{ color: 'var(--text-accent)' }}>
          {getTitle()}
        </h1>
        <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
          {getDescription()}
        </p>
        
        {status !== 'tampered' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full p-4 text-xl text-center rounded-lg border-2 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition disabled:opacity-50"
              style={{
                backgroundColor: 'var(--panel-bg)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
              aria-label="Your Name Input"
              autoComplete="name"
              disabled={isLoading}
            />
             <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              placeholder="SMARTC-XXXX-XXXX"
              className="w-full p-4 text-xl text-center font-mono tracking-widest rounded-lg border-2 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition disabled:opacity-50"
              style={{
                backgroundColor: 'var(--panel-bg)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
              aria-label="Access Key Input"
              autoComplete="off"
              disabled={isLoading}
            />
            {error && <p className="text-red-500 font-bold">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-bold text-2xl py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 border-b-4 active:border-b-2 font-display disabled:bg-slate-500 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                backgroundColor: 'var(--btn-action-bg)',
                borderColor: 'var(--btn-action-border)',
                boxShadow: '0 8px 15px -3px var(--shadow-color)',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--btn-action-hover)')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--btn-action-bg)')}
            >
              {isLoading ? 'Verifying...' : 'Unlock Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};