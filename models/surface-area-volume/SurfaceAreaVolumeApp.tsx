import React, { useState, useCallback } from 'react';
import type { UserInfo, SurfaceAreaState, Difficulty, SurfaceAreaChallengeQuestion } from '../../types';
import { Header } from '../../components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ObjectivesScreen } from './components/ObjectivesScreen';
import { ModeSelector } from './components/ModeSelector';
import { HelpModal } from './components/HelpModal';
import { ExploreView } from './ExploreView';
import { TrainingView } from './TrainingView';
import { ChallengeView } from './ChallengeView';
import { DifficultySelector } from '../../components/DifficultySelector';
import { challengeQuestions } from './utils/challenges';
import { logEvent, syncAnalyticsData } from '../../utils/analytics';
import { cancelSpeech } from '../../utils/speech';

export const SurfaceAreaVolumeApp: React.FC<{ onExit: () => void; currentUser: UserInfo | null; }> = ({ onExit, currentUser }) => {
    const [gameState, setGameState] = useState<SurfaceAreaState>('welcome');
    const [showHelp, setShowHelp] = useState(false);
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [questions, setQuestions] = useState<SurfaceAreaChallengeQuestion[]>([]);
    
    const handleModeSelection = async (mode: SurfaceAreaState) => {
        setGameState(mode);
        await logEvent('mode_start', currentUser, { model: 'surface_area_volume', mode });
        syncAnalyticsData();
        if (mode === 'challenge') {
            setGameState('challenge_difficulty_selection');
        }
    };
    
    const goBackToMenu = useCallback(() => {
        setGameState('mode_selection');
        cancelSpeech();
    }, []);

    const startChallenge = useCallback((selectedDifficulty: Difficulty) => {
        const classLevel = selectedDifficulty === 'easy' ? 9 : 10;
        const filtered = challengeQuestions.filter(q => q.class === classLevel);
        setQuestions([...filtered].sort(() => Math.random() - 0.5));
        setDifficulty(selectedDifficulty);
        setGameState('challenge');
    }, []);

    const getSubtitle = () => {
        switch (gameState) {
            case 'training': return 'Training Mode';
            case 'explore': return 'Explore Mode';
            case 'challenge': return `Challenge Mode (${difficulty})`;
            case 'mode_selection': return 'Choose a Mode';
            case 'objectives': return 'Learning Objectives';
            case 'challenge_difficulty_selection': return 'Choose Difficulty';
            default: return null;
        }
    };

    const renderContent = () => {
        switch (gameState) {
            case 'welcome':
                return <WelcomeScreen onStart={() => setGameState('objectives')} />;
            case 'objectives':
                return <ObjectivesScreen onContinue={() => setGameState('mode_selection')} />;
            case 'mode_selection':
                return <ModeSelector onSelectMode={handleModeSelection} />;
            case 'explore':
                return <ExploreView currentUser={currentUser} />;
            case 'training':
                return <TrainingView currentUser={currentUser} onComplete={goBackToMenu} />;
            case 'challenge_difficulty_selection':
                return <DifficultySelector onSelectDifficulty={startChallenge} onBack={goBackToMenu} />;
            case 'challenge':
                return <ChallengeView 
                            currentUser={currentUser} 
                            questions={questions} 
                            difficulty={difficulty}
                            onComplete={goBackToMenu} 
                        />;
            default:
                return <div className="text-white text-2xl">Coming Soon</div>;
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-900 text-white">
            <Header
                onHelpClick={() => setShowHelp(true)}
                currentUser={currentUser}
                onExit={onExit}
                onBackToModelMenu={['welcome', 'objectives', 'mode_selection'].includes(gameState) ? undefined : goBackToMenu}
                modelTitle="3D Shapes Lab"
                modelSubtitle={getSubtitle() ?? undefined}
            />
            <main className="flex-grow flex flex-col items-center justify-start p-2 sm:p-4">
                {renderContent()}
            </main>
            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        </div>
    );
};
