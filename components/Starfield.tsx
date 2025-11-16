import React, { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { AppState } from '../types';

interface BackgroundManagerProps {
    activeState: AppState;
}

// These models provide their own opaque, full-screen background,
// so the global animated background is not needed.
const MODELS_WITH_OWN_BACKGROUND: AppState[] = ['surface_area_volume'];

export const BackgroundManager: React.FC<BackgroundManagerProps> = ({ activeState }) => {
    const { theme } = useTheme();

    // Do not render if the active model has its own background theme.
    if (MODELS_WITH_OWN_BACKGROUND.includes(activeState)) {
        return null;
    }

    const backgroundElements = useMemo(() => {
        if (theme === 'light') {
            // Clouds for light theme
            return Array.from({ length: 20 }).map((_, i) => {
                const size = Math.random() * 150 + 50; // Cloud size
                const style = {
                    width: `${size * 2}px`,
                    height: `${size}px`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 30}s`,
                    animationDuration: `${Math.random() * 50 + 30}s`
                };
                return <div key={i} className="cloud" style={style} />;
            });
        }
        
        // Stars for dark theme
        return Array.from({ length: 150 }).map((_, i) => {
            const size = Math.random() * 2 + 1;
            const style = {
                width: `${size}px`,
                height: `${size}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 5 + 3}s`
            };
            return <div key={i} className="star" style={style} />;
        });
    }, [theme]);

    return <div className="background-container" aria-hidden="true">{backgroundElements}</div>;
};