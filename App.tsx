import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { PlaceValueColumns, BlockValue, PlaceValueCategory, Block, AppState as GameState, TrainingStep, ChallengeQuestion, Difficulty } from './types';
import { PlaceValueColumn } from './components/PlaceValueColumn';
import { BlockSource } from './components/BlockSource';
import { ResetButton } from './components/ResetButton';
import { ChallengePanel } from './components/ChallengePanel';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ModeSelector } from './components/ModeSelector';
import { DifficultySelector } from './components/DifficultySelector';
import { TrainingGuide } from './components/TrainingGuide';
import { HelpModal } from './components/HelpModal';
import { NumberBlock } from './components/NumberBlock';
import { numberToWords } from './utils/numberToWords';
import { BackgroundManager } from './components/Starfield';
import { RocketAnimation } from './components/RocketAnimation';
import { Confetti } from './components/Confetti';
import { challengeQuestions } from './utils/challenges';
import { StemConnection } from './components/StemConnection';
import { CandyReward } from './components/CandyReward';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { ModelIntroScreen } from './components/ModelIntroScreen';

// --- Game-specific Header (previously components/Header.tsx) ---
const GameHeader: React.FC<{
  total: number;
  appState: GameState;
  onBack?: () => void;
  totalInWords: string;
}> = ({ total, appState, onBack, totalInWords }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevTotalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (prevTotalRef.current !== undefined && prevTotalRef.current !== total) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
    prevTotalRef.current = total;
  }, [total]);

  const showBackButton = onBack && (appState === 'playground' || appState === 'challenge' || appState === 'training' || appState === 'stem_connection' || appState === 'challenge_difficulty_selection');

  const getSubTitle = () => {
    switch (appState) {
      case 'training': return 'Training Mode';
      case 'challenge': return 'Challenge Mode';
      case 'playground': return 'Playground';
      case 'stem_connection': return 'STEM Connection';
      case 'mode_selection': return 'Choose Your Adventure!';
      case 'challenge_difficulty_selection': return 'Select Difficulty';
      default: return null;
    }
  }

  const subTitle = getSubTitle();
  const showScore = appState === 'playground' || appState === 'challenge' || appState === 'training';

  return (
    <header className="rounded-2xl shadow-lg p-2 sm:p-4 flex justify-between items-center w-full" style={{
        backgroundColor: 'var(--backdrop-bg)',
        border: '1px solid var(--border-primary)',
        backdropFilter: 'blur(10px)',
    }}>
      <div className="flex-1">
        {showBackButton && (
          <button
            onClick={onBack}
            className="text-white font-bold rounded-full h-8 w-8 sm:h-12 sm:w-12 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform z-10 border-b-4 active:border-b-2"
            style={{ 
                backgroundColor: 'var(--btn-help-bg)', 
                borderColor: 'var(--btn-help-border)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-help-hover)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-help-bg)'}
            aria-label="Go back to mode selection"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-display" style={{ color: 'var(--text-primary)' }}>Place Value Playbox</h1>
        {subTitle && (
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight -mt-1 sm:-mt-2" style={{ color: 'var(--text-accent)'}}>
                {subTitle}
            </h2>
        )}
      </div>
      <div className="flex-1 flex justify-end items-center gap-2 sm:gap-4">
        {showScore && (
          <div className={`text-center rounded-2xl px-3 sm:px-6 py-1 sm:py-2 shadow-inner ${isAnimating ? 'animate-tada' : ''}`} style={{
              backgroundColor: 'var(--panel-bg)',
              border: '1px solid var(--border-primary)',
          }}>
            <div className="text-4xl sm:text-6xl font-black text-green-600 tabular-nums tracking-tighter" style={{ textShadow: '0 0 10px rgba(22, 163, 74, 0.3)' }}>
              {new Intl.NumberFormat().format(total)}
            </div>
            <div className="text-xs sm:text-lg font-bold capitalize min-h-[1.25rem] sm:min-h-[1.75rem] flex items-center justify-center" style={{ color: 'var(--text-secondary)'}}>
                {total > 0 ? totalInWords : '\u00A0'}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};


// --- Place Value Playbox Application Logic ---
const trainingPlan: TrainingStep[] = [
  { step: 0, type: 'action', source: 1, column: 'ones', text: "Let's start! Drag a blue '1' block to the 'Ones' column." },
  { step: 1, type: 'feedback', text: "Great Job! ✨", duration: 2000, clearBoardAfter: true },
  { step: 2, type: 'action_multi', source: 1, column: 'ones', count: 3, text: "Good! Now, add 3 blue blocks to the 'Ones' column." },
  { step: 3, type: 'feedback', text: "Perfect! You added 3. 🚀", duration: 2000, clearBoardAfter: true },
  { step: 4, type: 'action', source: 10, column: 'tens', text: "Awesome! Now drag a green '10' block to the 'Tens' column." },
  { step: 5, type: 'feedback', text: "You got it! 👍", duration: 2000, clearBoardAfter: true },
  { step: 6, type: 'action', source: 100, column: 'hundreds', text: "You're a pro! Drag a yellow '100' block to the 'Hundreds' column." },
  { step: 7, type: 'feedback', text: "Fantastic! 🌟", duration: 2000, clearBoardAfter: true },
  { step: 8, type: 'action', source: 1000, column: 'thousands', text: "Incredible! Drag a purple '1000' block to the 'Thousands' column." },
  { step: 9, type: 'feedback', text: "Amazing! You're reaching for the stars! 🚀", duration: 2000, clearBoardAfter: true },
  { step: 10, type: 'action_multi', source: 1, column: 'ones', count: 10, text: "Time for some magic! ✨ Add 10 blue blocks to see what happens." },
  { step: 11, type: 'magic_feedback', text: "Poof! 10 'Ones' became 1 'Ten'. That's regrouping!", duration: 4000, clearBoardAfter: true, targetColumn: 'tens' },
  { step: 12, type: 'action_multi', source: 10, column: 'tens', count: 10, text: "Let's do it again! Add 10 green blocks to the 'Tens' column." },
  { step: 13, type: 'magic_feedback', text: "Amazing! 🪄 10 'Tens' make 1 'Hundred' block!", duration: 4000, clearBoardAfter: true, targetColumn: 'hundreds' },
  { step: 14, type: 'action_multi', source: 100, column: 'hundreds', count: 10, text: "One last magic trick! Add 10 yellow blocks to the 'Hundreds' column." },
  { step: 15, type: 'magic_feedback', text: "Wow! 10 'Hundreds' make 1 'Thousand'. You're a place value wizard! 🧙‍♂️", duration: 4000, clearBoardAfter: true, targetColumn: 'thousands' },
  { step: 16, type: 'complete', text: "Training Complete! You're ready for anything!" },
];

const useSimpleSound = (freq: number, duration: number) => {
  return useCallback(() => {
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
  }, [freq, duration]);
};

const DURATION_MAP: Record<Difficulty, number> = { easy: 45, medium: 30, hard: 20 };
const DIFFICULTY_LEVEL_MAP: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 };

const PlaceValuePlayboxApp: React.FC = () => {
  const [appState, setAppState] = useState<GameState>('welcome');
  const [columns, setColumns] = useState<PlaceValueColumns>({ ones: [], tens: [], hundreds: [], thousands: [] });
  const [dragInfo, setDragInfo] = useState<{ value: BlockValue, origin?: { category: PlaceValueCategory, id: string } } | null>(null);
  const dragInfoRef = useRef<{ value: BlockValue, origin?: { category: PlaceValueCategory, id: string } } | null>(null);
  const [regrouping, setRegrouping] = useState<{ from: PlaceValueCategory, to: PlaceValueCategory } | null>(null);
  const [questions, setQuestions] = useState<ChallengeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [challengeStatus, setChallengeStatus] = useState<'playing' | 'correct' | 'incorrect' | 'timed_out'>('playing');
  const [challengeDifficulty, setChallengeDifficulty] = useState<Difficulty>('medium');
  const [showRocket, setShowRocket] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCandy, setShowCandy] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [trainingStep, setTrainingStep] = useState(0);
  const [trainingFeedback, setTrainingFeedback] = useState<string | null>(null);
  const [touchDrag, setTouchDrag] = useState<{ value: BlockValue | null; x: number; y: number; }>({ value: null, x: 0, y: 0 });
  const [activeTouchTarget, setActiveTouchTarget] = useState<PlaceValueCategory | null>(null);
  const activeTouchTargetRef = useRef<PlaceValueCategory | null>(null);

  const playDragSound = useSimpleSound(300, 0.05);
  const playDropSound = useSimpleSound(440, 0.1);
  const playRemoveSound = useSimpleSound(200, 0.1);
  const playRegroupSound = useSimpleSound(880, 0.2);
  const playSparkleSound = useSimpleSound(1400, 0.2);
  const playSuccessSound = useSimpleSound(1200, 0.4);
  const playConfettiSound = useSimpleSound(1600, 0.5);
  const playErrorSound = useSimpleSound(220, 0.2);
  const playFeedbackSound = useSimpleSound(1046, 0.3);
  const playMagicFeedbackSound = useSimpleSound(1318, 0.4);
  const playRocketSound = useSimpleSound(150, 2);
  const playCandySound = useSimpleSound(1800, 0.3);

  useEffect(() => {
    try {
        const savedDifficulty = localStorage.getItem('placeValueDifficulty') as Difficulty | null;
        if (savedDifficulty && ['easy', 'medium', 'hard'].includes(savedDifficulty)) {
            setChallengeDifficulty(savedDifficulty);
        }
    } catch (e) {
        console.error("Could not read from localStorage:", e);
    }
  }, []);

  const total = useMemo(() => {
    const onesValue = columns.ones.filter(b => !b.isAnimating).length * 1;
    const tensValue = columns.tens.filter(b => !b.isAnimating).length * 10;
    const hundredsValue = columns.hundreds.filter(b => !b.isAnimating).length * 100;
    const thousandsValue = columns.thousands.filter(b => !b.isAnimating).length * 1000;
    return thousandsValue + hundredsValue + tensValue + onesValue;
  }, [columns]);

  const totalInWords = useMemo(() => numberToWords(total), [total]);
  
  const handleReset = useCallback(() => {
    setColumns({ ones: [], tens: [], hundreds: [], thousands: [] });
    setRegrouping(null);
    setCorrectAnswer(null);
    if(appState === 'challenge') {
        setChallengeStatus('playing');
    }
  }, [appState]);
  
  const currentTrainingStepConfig = useMemo(() => {
     if (appState !== 'training') return null;
     return trainingPlan.find(s => s.step === trainingStep) || null;
  }, [appState, trainingStep]);

  const isDropAllowed = useCallback((category: PlaceValueCategory) => {
    const currentDragInfo = dragInfoRef.current;
    if (!currentDragInfo) return false;

    if (appState === 'training') {
        if (currentTrainingStepConfig && (currentTrainingStepConfig.type === 'action' || currentTrainingStepConfig.type === 'action_multi')) {
            return currentDragInfo.value === currentTrainingStepConfig.source && category === currentTrainingStepConfig.column;
        }
        return false;
    }

    return (
      (currentDragInfo.value === 1 && category === 'ones') ||
      (currentDragInfo.value === 10 && category === 'tens') ||
      (currentDragInfo.value === 100 && category === 'hundreds') ||
      (currentDragInfo.value === 1000 && category === 'thousands')
    );
  }, [appState, currentTrainingStepConfig]);

  const handleDragStart = useCallback((value: BlockValue, origin?: { category: PlaceValueCategory, id: string }) => {
    const info = { value, origin };
    dragInfoRef.current = info;
    setDragInfo(info);
    playDragSound();
  }, [playDragSound]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>, category?: PlaceValueCategory) => {
    event.preventDefault();
    const currentDragInfo = dragInfoRef.current;
    if (category && isDropAllowed(category)) {
      event.dataTransfer.dropEffect = "copy";
    } else if (!category && currentDragInfo?.origin) {
      event.dataTransfer.dropEffect = "move";
    } else {
      event.dataTransfer.dropEffect = "none";
    }
  }, [isDropAllowed]);

  const handleDrop = useCallback((category: PlaceValueCategory) => {
    const currentDragInfo = dragInfoRef.current;
    if (isDropAllowed(category) && currentDragInfo) {
      if(currentDragInfo.origin) {
         setColumns(prev => ({
            ...prev,
            [currentDragInfo.origin!.category]: prev[currentDragInfo.origin!.category].filter(b => b.id !== currentDragInfo.origin!.id)
         }));
      }

      const newBlock: Block = { id: `block-${Date.now()}-${Math.random()}`, value: currentDragInfo.value };
      setColumns(prev => ({ ...prev, [category]: [...prev[category], newBlock] }));
      playDropSound();
      
      if(appState === 'challenge' && challengeStatus !== 'playing') {
          setChallengeStatus('playing');
          setCorrectAnswer(null);
      }
    }
    dragInfoRef.current = null;
    setDragInfo(null);
  }, [isDropAllowed, appState, challengeStatus, playDropSound]);
  
  const handleDropToRemove = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    if (target.closest('[data-droptarget]')) {
        return;
    }

    const currentDragInfo = dragInfoRef.current;
    if (appState === 'playground' && currentDragInfo?.origin) {
        const { category, id } = currentDragInfo.origin;
        const blockToRemove = columns[category].find(b => b.id === id);
        if (blockToRemove) {
            setColumns(prev => ({
                ...prev,
                [category]: prev[category].map(b => b.id === id ? { ...b, isAnimating: false } : b)
            }));
            playRemoveSound();
            setTimeout(() => {
                setColumns(prev => ({
                    ...prev,
                    [category]: prev[category].filter(b => b.id !== id)
                }));
            }, 300);
        }
    }
    dragInfoRef.current = null;
    setDragInfo(null);
  }, [appState, columns, playRemoveSound]);

  const handleTouchStart = useCallback((value: BlockValue, event: React.TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      const info = { value };
      dragInfoRef.current = info;
      setDragInfo(info);
      setTouchDrag({ value, x: touch.clientX, y: touch.clientY });
      playDragSound();
  }, [playDragSound]);
  
  useEffect(() => {
    if (touchDrag.value === null) {
      setActiveTouchTarget(null);
      return;
    }

    const handleMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      setTouchDrag(prev => ({...prev, x: touch.clientX, y: touch.clientY}));

      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropTarget = element?.closest('[data-droptarget]');
      let targetCategory: PlaceValueCategory | null = null;
      if (dropTarget) {
        const category = dropTarget.getAttribute('data-droptarget') as PlaceValueCategory;
        if (isDropAllowed(category)) {
          targetCategory = category;
        }
      }
      activeTouchTargetRef.current = targetCategory;
      setActiveTouchTarget(current => current === targetCategory ? current : targetCategory);
    };

    const handleEnd = () => {
      if (activeTouchTargetRef.current) {
        handleDrop(activeTouchTargetRef.current);
      } else {
        dragInfoRef.current = null;
        setDragInfo(null);
      }
      setTouchDrag({ value: null, x: 0, y: 0 });
      activeTouchTargetRef.current = null;
    };

    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);

    return () => {
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [touchDrag.value, isDropAllowed, handleDrop]);

  const currentQuestion = questions[currentQuestionIndex] || null;

  const checkAnswer = () => {
    if (!currentQuestion) return;

    if (total === currentQuestion.answer) {
      setChallengeStatus('correct');
      setScore(s => s + 10 * currentQuestion.level);
      playSuccessSound();
      setShowRocket(true);
      playRocketSound();
      setShowConfetti(true);
      playConfettiSound();
      setShowCandy(true);
      playCandySound();
    } else {
      setChallengeStatus('incorrect');
      setCorrectAnswer(currentQuestion.answer);
      playErrorSound();
    }
  };

  const handleTimeOut = () => {
      if (!currentQuestion) return;
      setChallengeStatus('timed_out');
      setCorrectAnswer(currentQuestion.answer);
      playErrorSound();
  }
  
  const nextChallenge = () => {
    handleReset();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      setQuestions(prev => [...prev].sort(() => 0.5 - Math.random()));
      setCurrentQuestionIndex(0);
    }
  };

  const handleModeSelection = (mode: GameState) => {
    handleReset();
    setScore(0);
    setTrainingStep(0);
    if(mode === 'challenge') {
        setAppState('challenge_difficulty_selection');
    } else {
        setAppState(mode);
    }
  }

  const handleStartChallenge = (difficulty: Difficulty) => {
    setChallengeDifficulty(difficulty);
    try {
        localStorage.setItem('placeValueDifficulty', difficulty);
    } catch(e) {
        console.error("Could not write to localStorage:", e);
    }
    const difficultyLevel = DIFFICULTY_LEVEL_MAP[difficulty];
    const filteredQuestions = challengeQuestions.filter(q => q.level === difficultyLevel);
    setQuestions(filteredQuestions.sort(() => 0.5 - Math.random()));
    setCurrentQuestionIndex(0);
    handleReset();
    setAppState('challenge');
  };

  useEffect(() => {
    if (appState !== 'training' || !currentTrainingStepConfig) return;
    const { type, column, count } = currentTrainingStepConfig;
    if (type !== 'action' && type !== 'action_multi') return;

    let shouldAdvance = false;
    if (type === 'action' && column && columns[column].length >= 1) {
      shouldAdvance = true;
    } else if (type === 'action_multi' && column && count) {
      if (count >= 10) { 
        if (regrouping?.from === column) shouldAdvance = true;
      } else { 
        if (columns[column].length >= count) shouldAdvance = true;
      }
    }
    if (shouldAdvance) setTrainingStep(prev => prev + 1);
  }, [appState, columns, regrouping, currentTrainingStepConfig]);

  useEffect(() => {
    if (appState !== 'training' || !currentTrainingStepConfig) return;
    const { type, text, duration, clearBoardAfter } = currentTrainingStepConfig;

    if (type === 'feedback' || type === 'magic_feedback') {
        type === 'feedback' ? playFeedbackSound() : playMagicFeedbackSound();
        if (type === 'feedback') setTrainingFeedback(text);

        const timer = setTimeout(() => {
            if (clearBoardAfter) handleReset();
            setTrainingStep(prev => prev + 1);
            if (type === 'feedback') setTrainingFeedback(null);
        }, duration);
        return () => clearTimeout(timer);
    }
  }, [appState, currentTrainingStepConfig, handleReset, playFeedbackSound, playMagicFeedbackSound]);

  useEffect(() => {
    const isReadyForRegroup = appState === 'playground' || appState === 'challenge' || (appState === 'training' && (currentTrainingStepConfig?.count ?? 0) >= 10);

    const performRegroup = (from: PlaceValueCategory, to: PlaceValueCategory, toValue: BlockValue) => {
        if (isReadyForRegroup && columns[from].filter(b => !b.isAnimating).length >= 10 && !regrouping) {
            setRegrouping({ from, to });
            playRegroupSound();
            setColumns(prev => ({ ...prev, [from]: prev[from].slice(0, -10).concat(prev[from].slice(-10).map(b => ({ ...b, isAnimating: true }))) }));
            setTimeout(() => {
                playSparkleSound();
                setColumns(prev => ({ ...prev, [from]: prev[from].filter(b => !b.isAnimating), [to]: [...prev[to], { id: `block-${Date.now()}`, value: toValue, isNewlyRegrouped: true }] }));
                setRegrouping(null);
            }, 600);
            return true;
        }
        return false;
    };
    
    if (performRegroup('ones', 'tens', 10)) return;
    if (performRegroup('tens', 'hundreds', 100)) return;
    if (performRegroup('hundreds', 'thousands', 1000)) return;

  }, [columns, regrouping, appState, playRegroupSound, playSparkleSound, currentTrainingStepConfig]);

    useEffect(() => {
        const hasNewlyRegrouped = columns.tens.some(b => b.isNewlyRegrouped) || columns.hundreds.some(b => b.isNewlyRegrouped) || columns.thousands.some(b => b.isNewlyRegrouped);
        if (hasNewlyRegrouped) {
            const timer = setTimeout(() => {
                setColumns(prev => ({
                    ...prev,
                    tens: prev.tens.map(b => ({ ...b, isNewlyRegrouped: false })),
                    hundreds: prev.hundreds.map(b => ({ ...b, isNewlyRegrouped: false })),
                    thousands: prev.thousands.map(b => ({ ...b, isNewlyRegrouped: false })),
                }));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [columns]);
    
  const renderMainContent = () => {
    switch (appState) {
        case 'welcome':
            return <WelcomeScreen onStart={() => setAppState('mode_selection')} />;
        case 'mode_selection':
            return <ModeSelector onSelectMode={handleModeSelection} />;
        case 'challenge_difficulty_selection':
            return <DifficultySelector onSelectDifficulty={handleStartChallenge} onBack={() => setAppState('mode_selection')} />;
        case 'stem_connection':
            return <StemConnection />;
        case 'training':
        case 'playground':
        case 'challenge':
            return (
                <main className="mt-4 sm:mt-6 w-full" onDragStart={(e) => {
                    const target = e.target as HTMLElement;
                    const numberBlock = target.closest('[draggable="true"]');
                    if (numberBlock) {
                        const id = numberBlock.getAttribute('data-id');
                        const category = numberBlock.getAttribute('data-category') as PlaceValueCategory;
                        const value = parseInt(numberBlock.getAttribute('data-value') || '0', 10) as BlockValue;
                        if(id && category && appState === 'playground') {
                            handleDragStart(value, {id, category});
                        }
                    }
                }}>
                  {appState === 'challenge' && (
                    <ChallengePanel question={currentQuestion} score={score} status={challengeStatus} onCheck={checkAnswer} onNext={nextChallenge} onTimeOut={handleTimeOut} correctAnswer={correctAnswer} timeLimit={DURATION_MAP[challengeDifficulty]}/>
                  )}
        
                  <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-4">
                    <PlaceValueColumn title="Thousands" category="thousands" blocks={columns.thousands} onDrop={handleDrop} onDragOver={handleDragOver} isRegroupingDestination={regrouping?.to === 'thousands'} isDropAllowed={isDropAllowed('thousands')} isDragging={!!dragInfo} color="purple" isSpotlighted={currentTrainingStepConfig?.column === 'thousands'} isTouchTarget={activeTouchTarget === 'thousands'} appState={appState} />
                    <PlaceValueColumn title="Hundreds" category="hundreds" blocks={columns.hundreds} onDrop={handleDrop} onDragOver={handleDragOver} isRegroupingDestination={regrouping?.to === 'hundreds'} isDropAllowed={isDropAllowed('hundreds')} isDragging={!!dragInfo} color="yellow" isSpotlighted={currentTrainingStepConfig?.column === 'hundreds'} isTouchTarget={activeTouchTarget === 'hundreds'} appState={appState} />
                    <PlaceValueColumn title="Tens" category="tens" blocks={columns.tens} onDrop={handleDrop} onDragOver={handleDragOver} isRegroupingDestination={regrouping?.to === 'tens'} isDropAllowed={isDropAllowed('tens')} isDragging={!!dragInfo} color="green" isSpotlighted={currentTrainingStepConfig?.column === 'tens'} isTouchTarget={activeTouchTarget === 'tens'} appState={appState} />
                    <PlaceValueColumn title="Ones" category="ones" blocks={columns.ones} onDrop={handleDrop} onDragOver={handleDragOver} isRegroupingDestination={false} isDropAllowed={isDropAllowed('ones')} isDragging={!!dragInfo} color="blue" isSpotlighted={currentTrainingStepConfig?.column === 'ones'} isTouchTarget={activeTouchTarget === 'ones'} appState={appState} />
                  </div>
                  
                  <div className={`mt-4 sm:mt-8 p-2 sm:p-6 backdrop-blur-sm border rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-center gap-2 sm:gap-6 transition-all duration-300 ${currentTrainingStepConfig ? 'relative z-20' : ''}`} style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-primary)'}}>
                    <BlockSource onDragStart={handleDragStart} onTouchStart={handleTouchStart} isTraining={appState === 'training'} spotlightOn={currentTrainingStepConfig?.source} />
                    {appState !== 'training' && <ResetButton onClick={handleReset} />}
                  </div>
                </main>
            );
        default:
            return null;
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center relative" onDragOver={(e) => handleDragOver(e)} onDrop={handleDropToRemove}>
      {showRocket && <RocketAnimation onComplete={() => setShowRocket(false)} />}
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
      {showCandy && <CandyReward onComplete={() => setShowCandy(false)} />}
      
      {touchDrag.value && (
        <div style={{ position: 'fixed', top: touchDrag.y, left: touchDrag.x, transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 9999 }}>
            <NumberBlock value={touchDrag.value} isDraggable={false} />
        </div>
      )}
      
      {appState === 'training' && 
        <TrainingGuide currentStepConfig={currentTrainingStepConfig} columnCounts={{ ones: columns.ones.length, tens: columns.tens.length, hundreds: columns.hundreds.length, thousands: columns.thousands.length }} onComplete={() => setAppState('mode_selection')} feedback={trainingFeedback} />
      }
      <div className={`w-full max-w-7xl mx-auto flex-grow flex flex-col ${appState === 'training' ? 'relative z-20' : ''}`}>
        <GameHeader 
            appState={appState} 
            total={total} 
            totalInWords={totalInWords} 
            onBack={() => setAppState('mode_selection')}
        />
        {renderMainContent()}
      </div>
    </div>
  );
};


// --- Main Application Shell ---
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [showModelIntro, setShowModelIntro] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ color: 'var(--text-primary)'}}>
      <BackgroundManager />
      <Header onMenuClick={() => setIsSidebarOpen(true)} onHelpClick={() => setIsHelpModalOpen(true)} />
      <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          onSelectModel={(model) => {
              setActiveModel(model);
              setShowModelIntro(true);
          }}
      />
      <main className="flex-grow flex flex-col items-center justify-center p-1 sm:p-2 md:p-4 relative">
          {showModelIntro && activeModel === 'place-value-playbox' ? (
              <ModelIntroScreen onContinue={() => setShowModelIntro(false)} />
          ) : activeModel === 'place-value-playbox' ? (
              <PlaceValuePlayboxApp />
          ) : (
              <div className="text-center p-8 rounded-2xl border shadow-xl animate-pop-in" style={{ 
                  backgroundColor: 'var(--backdrop-bg)', 
                  borderColor: 'var(--border-primary)',
                  backdropFilter: 'blur(10px)',
                }}>
                  <h1 className="text-4xl font-bold font-display" style={{ color: 'var(--text-accent)'}}>Welcome to SMART C Digital Labs</h1>
                  <p className="mt-4 text-xl" style={{ color: 'var(--text-secondary)'}}>Please select a math model from the sidebar to get started.</p>
              </div>
          )}
      </main>
      <Footer />
      {isHelpModalOpen && <HelpModal onClose={() => setIsHelpModalOpen(false)} />}
    </div>
  );
}

export default App;