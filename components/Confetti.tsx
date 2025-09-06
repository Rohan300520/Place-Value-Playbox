
import React, { useEffect, useMemo } from 'react';

const CONFETTI_COUNT = 100;
const DURATION = 5000;

const colors = ['#fde047', '#f97316', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'];

export const Confetti: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, DURATION);
        return () => clearTimeout(timer);
    }, [onComplete]);

    const confettiPieces = useMemo(() => {
        return Array.from({ length: CONFETTI_COUNT }).map((_, index) => {
            const style = {
                left: `${Math.random() * 100}%`,
                animationDelay: `${(Math.random() * DURATION) / 1000}s`,
                animationDuration: `${Math.random() * 2 + 3}s`,
                backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                transform: `rotate(${Math.random() * 360}deg)`,
            };
            return <div key={index} className="confetti-piece" style={style} />;
        });
    }, []);

    return <div className="fixed inset-0 w-full h-full pointer-events-none z-[9999]" aria-hidden="true">{confettiPieces}</div>;
};