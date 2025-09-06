
import React, { useEffect, useRef } from 'react';

interface RocketAnimationProps {
    onComplete: () => void;
}

export const RocketAnimation: React.FC<RocketAnimationProps> = ({ onComplete }) => {
    const rocketRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const node = rocketRef.current;
        const handleAnimationEnd = () => {
            onComplete();
        };

        if (node) {
            node.addEventListener('animationend', handleAnimationEnd);
        }
        
        return () => {
            if (node) {
                node.removeEventListener('animationend', handleAnimationEnd);
            }
        };
    }, [onComplete]);

    return (
        <div 
            ref={rocketRef}
            className="fixed left-1/2 z-50 animate-launch-rocket"
            style={{ width: '100px', height: '200px' }}
            aria-hidden="true"
        >
            <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                    <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor: '#d1d5db', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#9ca3af', stopOpacity: 1}} />
                    </linearGradient>
                    <linearGradient id="rocketFlame" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#fde047', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#f97316', stopOpacity: 1}} />
                    </linearGradient>
                </defs>
                <path d="M40 200 L60 200 L50 170 Z" fill="url(#rocketFlame)" />
                <path d="M35 200 L65 200 L50 160 Z" fill="url(#rocketFlame)" style={{transform: 'scale(0.8)', transformOrigin: '50px 200px', filter: 'blur(2px)'}}/>
                <path d="M40 50 L40 180 L60 180 L60 50 Z" fill="url(#rocketBody)" />
                <path d="M40 50 C40 20, 60 20, 60 50 Z" fill="#ef4444" />
                <path d="M25 120 L40 150 L40 120 Z" fill="#3b82f6" />
                <path d="M75 120 L60 150 L60 120 Z" fill="#3b82f6" />
                <circle cx="50" cy="80" r="8" fill="#a5f3fc" stroke="#083344" strokeWidth="2" />
            </svg>
        </div>
    );
};
