import React, { useState, useEffect } from 'react';
import { BackgroundManager } from './components/Starfield';
import { LicenseScreen } from './components/LicenseScreen';
import { verifyKeyOnServer } from './utils/license';
import { AdminPage } from './AdminPage';
import { ModelSelectionScreen } from './components/ModelSelectionScreen';
import { PlaceValuePlaybox } from './models/place-value-playbox/PlaceValuePlaybox';
import { FractionsApp } from './models/fractions/FractionsApp';
import { SurfaceArea9App } from './models/surface-area/SurfaceArea9App';
import { SurfaceArea10App } from './models/surface-area/SurfaceArea10App';
import type { UserInfo, AppState } from './types';
import { initAnalytics, logEvent, syncAnalyticsData } from './utils/analytics';

// --- Main App Component (Router) ---
const App: React.FC = () => {
  // Top-level state management
  const [appState, setAppState] = useState<AppState>('model_selection');
  const [licenseStatus, setLicenseStatus] = useState<'loading' | 'valid' | 'locked' | 'expired' | 'tampered'>('loading');
  const [expiredDuration, setExpiredDuration] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Check license and user info on initial load
    try {
      const licenseData = localStorage.getItem('app_license');
      const lastCheck = localStorage.getItem('app_last_check');
      const userInfo = localStorage.getItem('app_user_info');
      const now = Date.now();

      if (lastCheck && now < parseInt(lastCheck, 10)) {
        setLicenseStatus('tampered');
        return;
      }
      
      localStorage.setItem('app_last_check', now.toString());
      
      if (!licenseData) {
        setLicenseStatus('locked');
        return;
      }
      
      const { expiryTime, duration } = JSON.parse(licenseData);
      
      if (now >= expiryTime) {
        setLicenseStatus('expired');
        setExpiredDuration(duration);
        localStorage.removeItem('app_user_info'); // Clear user info on expiry
        return;
      }

      if(userInfo) {
        const parsedUser = JSON.parse(userInfo);
        setCurrentUser(parsedUser);
      }
      setLicenseStatus('valid');

      const timeToExpire = expiryTime - now;
      if (timeToExpire > 0) {
        const timerId = setTimeout(() => {
          setLicenseStatus('expired');
          setExpiredDuration(duration);
        }, timeToExpire);
        return () => clearTimeout(timerId);
      }

    } catch (e) {
      console.error("Could not access localStorage.", e);
      setLicenseStatus('locked');
    }
  }, []);

  // Analytics session start and sync setup
  useEffect(() => {
      if (licenseStatus === 'valid' && currentUser) {
          initAnalytics(); // Initialize listeners for online/offline, etc.
          logEvent('session_start', currentUser, { model: 'platform' }).then(() => {
            syncAnalyticsData(); // Attempt sync after logging session start
          });
      }
  }, [licenseStatus, currentUser]);

  const handleKeyVerification = async (key: string, name: string) => {
    const result = await verifyKeyOnServer(key);
    if (result.success && result.validityInMs && result.school && result.keyId) {
      const now = Date.now();
      const license = {
        activationTime: now,
        expiryTime: now + result.validityInMs,
        duration: result.validityInMs,
      };
      const userInfo: UserInfo = {
        name,
        school: result.school,
        keyId: result.keyId,
      };
      try {
        localStorage.setItem('app_license', JSON.stringify(license));
        localStorage.setItem('app_user_info', JSON.stringify(userInfo));
        localStorage.setItem('app_last_check', now.toString());
        window.location.replace(window.location.href);
      } catch (e) {
        console.error("Could not save to localStorage.", e);
        return { success: false, message: "Could not save license. Storage may be full." };
      }
    }
    return result;
  };

  const handleSelectModel = (model: AppState) => {
    logEvent('model_selected', currentUser, { model });
    syncAnalyticsData();
    setAppState(model);
  };
  
  // Render based on admin path
  if (window.location.pathname.startsWith('/admin')) {
    return <AdminPage />;
  }
  
  // Render based on license status
  if (licenseStatus !== 'valid') {
    return <LicenseScreen status={licenseStatus as 'locked' | 'expired' | 'tampered'} onVerify={handleKeyVerification} expiredDuration={expiredDuration} />;
  }

  const renderContent = () => {
    switch (appState) {
      case 'place_value_playbox':
        return <PlaceValuePlaybox onExit={() => setAppState('model_selection')} currentUser={currentUser} />;
      case 'fractions':
        return <FractionsApp onExit={() => setAppState('model_selection')} currentUser={currentUser} />;
      case 'surface_area_9':
        return <SurfaceArea9App onExit={() => setAppState('model_selection')} currentUser={currentUser} />;
      case 'surface_area_10':
        return <SurfaceArea10App onExit={() => setAppState('model_selection')} currentUser={currentUser} />;
      case 'model_selection':
      default:
        return <ModelSelectionScreen onSelectModel={handleSelectModel} currentUser={currentUser} />;
    }
  };

  return (
    <div className="h-screen font-sans relative flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0">
          <BackgroundManager />
      </div>
      <div className="relative z-10 flex flex-col flex-1 min-h-0">
          {renderContent()}
      </div>
    </div>
  );
};

export default App;