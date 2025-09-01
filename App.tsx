
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { PlaceValueColumns, BlockValue, PlaceValueCategory, Block, AppState, TrainingStep } from './types';
import { PlaceValueColumn } from './components/PlaceValueColumn';
import { BlockSource } from './components/BlockSource';
import { Header } from './components/Header';
import { ResetButton } from './components/ResetButton';
import { ChallengePanel } from './components/ChallengePanel';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ModeSelector } from './components/ModeSelector';
import { TrainingGuide } from './components/TrainingGuide';

const trainingPlan: TrainingStep[] = [
  // Step 1: Add one '1' block
  { step: 0, type: 'action', source: 1, column: 'ones', text: "Let's start! Drag a blue '1' block to the 'Ones' column." },
  { step: 1, type: 'feedback', text: "Great Job! ✨", duration: 2000, clearBoardAfter: true },
  
  // Step 2: Add three '1' blocks to practice multiple adds
  { step: 2, type: 'action_multi', source: 1, column: 'ones', count: 3, text: "Good! Now, let's add a few more. Add 3 blue blocks to the 'Ones' column." },
  { step: 3, type: 'feedback', text: "Perfect! You added 3. 🚀", duration: 2000, clearBoardAfter: true },

  // Step 3: Add one '10' block
  { step: 4, type: 'action', source: 10, column: 'tens', text: "Awesome! Now drag a green '10' block to the 'Tens' column." },
  { step: 5, type: 'feedback', text: "You got it! 👍", duration: 2000, clearBoardAfter: true },
  
  // Step 4: Add one '100' block
  { step: 6, type: 'action', source: 100, column: 'hundreds', text: "You're a pro! Drag a yellow '100' block to the 'Hundreds' column." },
  { step: 7, type: 'feedback', text: "Fantastic! 🌟", duration: 2000, clearBoardAfter: true },

  // Step 5: Regroup ones to tens
  { step: 8, type: 'action_multi', source: 1, column: 'ones', count: 10, text: "Time for some magic! ✨ Add 10 blue blocks to see what happens." },
  { step: 9, type: 'magic_feedback', text: "Poof! 10 'Ones' became 1 'Ten'. That's regrouping!", duration: 4000, clearBoardAfter: true },

  // Step 6: Regroup tens to hundreds
  { step: 10, type: 'action_multi', source: 10, column: 'tens', count: 10, text: "Let's do it again! Add 10 green blocks to the 'Tens' column." },
  { step: 11, type: 'magic_feedback', text: "Amazing! 🪄 10 'Tens' make 1 'Hundred' block!", duration: 4000, clearBoardAfter: true },
  
  // Step 7: Complete
  { step: 12, type: 'complete', text: "Training Complete! You're ready to play!" },
];

const useSimpleSound = (freq: number, duration: number) => {
  return () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + duration);
    } catch (e) {
      console.error("Could not play sound:", e);
    }
  };
};

const generateTargetNumber = () => Math.floor(Math.random() * 900) + 99;

function App() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [columns, setColumns] = useState<PlaceValueColumns>({ ones: [], tens: [], hundreds: [] });
  const [draggedValue, setDraggedValue] = useState<BlockValue | null>(null);
  const [regrouping, setRegrouping] = useState<{ from: PlaceValueCategory, to: PlaceValueCategory } | null>(null);
  
  // Challenge Mode State
  const [targetNumber, setTargetNumber] = useState(generateTargetNumber());
  const [score, setScore] = useState(0);
  const [challengeStatus, setChallengeStatus] = useState<'playing' | 'correct' | 'incorrect'>('playing');

  // Training Mode State
  const [trainingStep, setTrainingStep] = useState(0);
  const [trainingFeedback, setTrainingFeedback] = useState<string | null>(null);

  const playDropSound = useSimpleSound(440, 0.1);
  const playRegroupSound = useSimpleSound(880, 0.2);
  const playSuccessSound = useSimpleSound(1200, 0.4);
  const playErrorSound = useSimpleSound(220, 0.2);
  const playStepCompleteSound = useSimpleSound(660, 0.15);

  const total = useMemo(() => {
    const onesValue = columns.ones.filter(b => !b.isAnimating).length * 1;
    const tensValue = columns.tens.filter(b => !b.isAnimating).length * 10;
    const hundredsValue = columns.hundreds.filter(b => !b.isAnimating).length * 100;
    return hundredsValue + tensValue + onesValue;
  }, [columns]);
  
  const handleReset = useCallback(() => {
    setColumns({ ones: [], tens: [], hundreds: [] });
    setRegrouping(null);
    if(appState === 'challenge') {
        setTargetNumber(generateTargetNumber());
        setChallengeStatus('playing');
    }
  }, [appState]);
  
  const currentTrainingStepConfig = useMemo(() => {
     if (appState !== 'training') return null;
     return trainingPlan.find(s => s.step === trainingStep) || null;
  }, [appState, trainingStep]);

  const isDropAllowed = useCallback((category: PlaceValueCategory) => {
    if (!draggedValue) return false;

    if (appState === 'training') {
        if (currentTrainingStepConfig && (currentTrainingStepConfig.type === 'action' || currentTrainingStepConfig.type === 'action_multi')) {
            return draggedValue === currentTrainingStepConfig.source && category === currentTrainingStepConfig.column;
        }
        return false;
    }

    return (
      (draggedValue === 1 && category === 'ones') ||
      (draggedValue === 10 && category === 'tens') ||
      (draggedValue === 100 && category === 'hundreds')
    );
  }, [draggedValue, appState, currentTrainingStepConfig]);

  const handleDragStart = useCallback((value: BlockValue) => {
    setDraggedValue(value);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>, category: PlaceValueCategory) => {
    event.preventDefault();
    if (isDropAllowed(category)) {
      event.dataTransfer.dropEffect = "copy";
    } else {
      event.dataTransfer.dropEffect = "none";
    }
  }, [isDropAllowed]);

  const handleDrop = useCallback((category: PlaceValueCategory) => {
    if (isDropAllowed(category) && draggedValue) {
      const newBlock: Block = { id: `block-${Date.now()}-${Math.random()}`, value: draggedValue };
      setColumns(prev => ({ ...prev, [category]: [...prev[category], newBlock] }));
      
      if(appState !== 'training') {
          playDropSound();
          if (challengeStatus !== 'playing') setChallengeStatus('playing');
      }
    }
    setDraggedValue(null);
  }, [draggedValue, isDropAllowed, appState, challengeStatus, playDropSound]);

  const checkAnswer = () => {
    if (total === targetNumber) {
      setChallengeStatus('correct');
      setScore(s => s + 10);
      playSuccessSound();
    } else {
      setChallengeStatus('incorrect');
      playErrorSound();
      setTimeout(() => setChallengeStatus('playing'), 1000);
    }
  };
  
  const nextChallenge = () => { handleReset(); }

  const handleModeSelection = (mode: AppState) => {
    handleReset();
    setScore(0);
    setTrainingStep(0);
    setAppState(mode);
  }

  // Effect to handle advancing training steps from ACTION steps based on player actions
  useEffect(() => {
    if (appState !== 'training' || !currentTrainingStepConfig) {
      return;
    }

    const { type, column, count } = currentTrainingStepConfig;

    // This hook only deals with advancing from action steps
    if (type !== 'action' && type !== 'action_multi') {
        return;
    }

    let shouldAdvance = false;

    if (type === 'action' && column && columns[column].length >= 1) {
      shouldAdvance = true;
    } else if (type === 'action_multi' && column && count) {
      if (count >= 10) { // Regrouping step
        if (regrouping?.from === column) {
          shouldAdvance = true;
        }
      } else { // Simple count step
        if (columns[column].length >= count) {
          shouldAdvance = true;
        }
      }
    }

    if (shouldAdvance) {
      setTrainingStep(prev => prev + 1);
    }
  }, [appState, columns, regrouping, currentTrainingStepConfig]);

  // Effect to handle FEEDBACK steps: display message and advance after a delay
  useEffect(() => {
    if (appState !== 'training' || !currentTrainingStepConfig) return;

    const { type, text, duration, clearBoardAfter } = currentTrainingStepConfig;

    if ((type === 'feedback' || type === 'magic_feedback') && text && duration) {
      playStepCompleteSound();
      setTrainingFeedback(text);

      const timer = setTimeout(() => {
        if (clearBoardAfter) {
          handleReset();
        }
        setTrainingStep(prev => prev + 1);
        setTrainingFeedback(null);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [appState, currentTrainingStepConfig, handleReset, playStepCompleteSound]);


  // Regrouping Effects
  useEffect(() => {
    const isTrainingRegroupStep = appState === 'training' && 
      currentTrainingStepConfig?.type === 'action_multi' && 
      (currentTrainingStepConfig?.count ?? 0) >= 10;
      
    const isReadyForRegroup = appState === 'playground' || appState === 'challenge' || isTrainingRegroupStep;

    // Ones to Tens
    if (isReadyForRegroup && columns.ones.filter(b => !b.isAnimating).length >= 10 && !regrouping) {
        setRegrouping({ from: 'ones', to: 'tens' });
        playRegroupSound();
        setColumns(prev => ({
            ...prev,
            ones: prev.ones.slice(0, -10).concat(prev.ones.slice(-10).map(b => ({ ...b, isAnimating: true })))
        }));
        setTimeout(() => {
            setColumns(prev => ({
                ...prev,
                ones: prev.ones.filter(b => !b.isAnimating),
                tens: [...prev.tens, { id: `block-${Date.now()}`, value: 10 }],
            }));
            setRegrouping(null);
        }, 500);
    }
    
    // Tens to Hundreds
    if (isReadyForRegroup && columns.tens.filter(b => !b.isAnimating).length >= 10 && !regrouping) {
        setRegrouping({ from: 'tens', to: 'hundreds' });
        playRegroupSound();
        setColumns(prev => ({
            ...prev,
            tens: prev.tens.slice(0, -10).concat(prev.tens.slice(-10).map(b => ({ ...b, isAnimating: true })))
        }));
        setTimeout(() => {
            setColumns(prev => ({
                ...prev,
                tens: prev.tens.filter(b => !b.isAnimating),
                hundreds: [...prev.hundreds, { id: `block-${Date.now()}`, value: 100 }],
            }));
            setRegrouping(null);
        }, 500);
    }
  }, [columns, regrouping, appState, playRegroupSound, currentTrainingStepConfig]);

  if (appState === 'welcome') {
    return <WelcomeScreen onStart={() => setAppState('mode_selection')} />;
  }
  
  if (appState === 'mode_selection') {
    return <ModeSelector onSelectMode={handleModeSelection} />;
  }

  return (
    <div className="min-h-screen bg-sky-100 text-gray-800 flex flex-col items-center p-4 sm:p-8 overflow-hidden relative">
      {appState === 'training' && 
        <TrainingGuide 
            currentStepConfig={currentTrainingStepConfig}
            columnCounts={{
                ones: columns.ones.length,
                tens: columns.tens.length,
                hundreds: columns.hundreds.length
            }}
            onComplete={() => setAppState('mode_selection')}
            feedback={trainingFeedback}
        />
      }
      <div className="w-full max-w-7xl mx-auto">
        <Header appState={appState} total={total} onBack={() => setAppState('mode_selection')} />
        <main className="mt-6">
          {appState === 'challenge' && (
            <ChallengePanel 
              target={targetNumber} 
              score={score}
              status={challengeStatus}
              onCheck={checkAnswer}
              onNext={nextChallenge}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            <PlaceValueColumn
              title="Hundreds" category="hundreds" blocks={columns.hundreds} onDrop={handleDrop}
              onDragOver={handleDragOver} isRegroupingDestination={regrouping?.to === 'hundreds'}
              isDropAllowed={isDropAllowed('hundreds')} isDragging={!!draggedValue} color="yellow"
              isSpotlighted={currentTrainingStepConfig?.column === 'hundreds'}
            />
            <PlaceValueColumn
              title="Tens" category="tens" blocks={columns.tens} onDrop={handleDrop}
              onDragOver={handleDragOver} isRegroupingDestination={regrouping?.to === 'tens'}
              isDropAllowed={isDropAllowed('tens')} isDragging={!!draggedValue} color="green"
              isSpotlighted={currentTrainingStepConfig?.column === 'tens'}
            />
            <PlaceValueColumn
              title="Ones" category="ones" blocks={columns.ones} onDrop={handleDrop}
              onDragOver={handleDragOver} isRegroupingDestination={false}
              isDropAllowed={isDropAllowed('ones')} isDragging={!!draggedValue} color="blue"
              isSpotlighted={currentTrainingStepConfig?.column === 'ones'}
            />
          </div>
          
          <div className={`mt-8 p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-center gap-6 transition-all duration-300 ${currentTrainingStepConfig ? 'relative z-20' : ''}`}>
            <BlockSource 
              onDragStart={handleDragStart} 
              isTraining={appState === 'training'}
              spotlightOn={currentTrainingStepConfig?.source}
            />
            {appState !== 'training' && <ResetButton onClick={handleReset} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
