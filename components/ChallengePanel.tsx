
import React from 'react';

interface ChallengePanelProps {
  target: number;
  score: number;
  status: 'playing' | 'correct' | 'incorrect';
  onCheck: () => void;
  onNext: () => void;
}

export const ChallengePanel: React.FC<ChallengePanelProps> = ({ target, score, status, onCheck, onNext }) => {
    
    let statusClasses = 'border-sky-400/30 shadow-sky-500/20';
    if(status === 'correct') statusClasses = 'border-green-400 shadow-green-400/40 animate-celebrate';
    if(status === 'incorrect') statusClasses = 'border-red-400 shadow-red-400/40 animate-shake';

    return (
        <div className={`bg-slate-800/50 backdrop-blur-md rounded-2xl border ${statusClasses} shadow-lg p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-center w-full transition-all duration-500`}>
            <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-center">
                    <span className="text-lg sm:text-xl font-bold text-sky-300 uppercase tracking-wider">Target</span>
                    <div className="text-4xl sm:text-5xl font-black text-amber-400 sm:mt-1 tabular-nums tracking-tighter" style={{ textShadow: '0 0 10px #f59e0b' }}>
                        {target}
                    </div>
                </div>
                <div className="text-center">
                    <span className="text-lg sm:text-xl font-bold text-sky-300 uppercase tracking-wider">Score</span>
                    <div className="text-4xl sm:text-5xl font-black text-emerald-400 sm:mt-1 tabular-nums tracking-tighter" style={{ textShadow: '0 0 10px #34d399' }}>
                        {score}
                    </div>
                </div>
            </div>

            <div className="mt-3 sm:mt-0">
                {status === 'correct' ? (
                     <button onClick={onNext} className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-xl shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-all text-base sm:text-lg">
                        Next Challenge!
                     </button>
                ) : (
                    <button onClick={onCheck} disabled={status === 'incorrect'} className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 disabled:shadow-none text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-xl shadow-lg shadow-emerald-500/30 transform hover:scale-105 transition-all text-base sm:text-lg">
                        Check Answer
                    </button>
                )}
            </div>
        </div>
    );
};
