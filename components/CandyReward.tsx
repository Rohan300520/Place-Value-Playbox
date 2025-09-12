import React, { useEffect } from 'react';

interface CandyRewardProps {
    onComplete: () => void;
}

export const CandyReward: React.FC<CandyRewardProps> = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 1500); // Match animation duration
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9998] animate-reward"
            aria-hidden="true"
        >
            <img src="/assets/candy.svg" alt="Candy Reward" className="w-32 h-32 sm:w-48 sm:h-48" />
        </div>
    );
};
