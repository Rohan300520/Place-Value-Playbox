
import React from 'react';

interface ChallengePanelProps {
  target: number;
  score: number;
  status: 'playing' | 'correct' | 'incorrect';
  onCheck: () => void;
  onNext: () => void;
}

export const ChallengePanel: React.FC<ChallengePanelProps> = ({ target, score, status, onCheck, onNext }) => {
    
    let statusClasses = 'bg-white/80';
    if(status === 'correct') statusClasses = 'bg-green-200 animate-celebrate';
    if(status === 'incorrect') statusClasses = 'bg-red-200 animate-shake';

    return (
        <div className={`backdrop-blur-sm rounded-2xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-center w-full transition-colors duration-300 ${statusClasses}`}>
            <div className="flex items-center gap-4 sm:gap-6">
                <div>
                    <span className="text-lg sm:text-xl font-bold text-gray-600">Target</span>
                    <div className="text-4xl sm:text-5xl font-black text-amber-600 sm:mt-1 tabular-nums tracking-tighter">
                        {target}
                    </div>
                </div>
                <div>
                    <span className="text-lg sm:text-xl font-bold text-gray-600">Score</span>
                    <div className="text-4xl sm:text-5xl font-black text-emerald-600 sm:mt-1 tabular-nums tracking-tighter">
                        {score}
                    </div>
                </div>
            </div>

            <div className="mt-3 sm:mt-0">
                {status === 'correct' ? (
                     <button onClick={onNext} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all text-base sm:text-lg">
                        Next Challenge!
                     </button>
                ) : (
                    <button onClick={onCheck} disabled={status === 'incorrect'} className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all text-base sm:text-lg">
                        Check Answer
                    </button>
                )}
            </div>
        </div>
    );
};
