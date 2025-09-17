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
import { useAudio } from './contexts/AudioContext';
import { speak, cancelSpeech } from './utils/speech';
import { LicenseScreen } from './components/LicenseScreen';
import { verifyKeyOnServer } from './utils/license';
import { AdminPage } from './AdminPage';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { SpeechToggle } from './components/SpeechToggle';

// --- Game-specific Header (previously components/Header.tsx) ---
const GameHeader: React.FC<{
  total: number;
  appState: GameState;
  onBack?: () => void;
  totalInWords: string;
  onHelpClick: () => void;
}> = ({ total, appState, onBack, totalInWords, onHelpClick }) => {
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
        <div className="flex items-center gap-1 sm:gap-2">
            <SpeechToggle />
            <ThemeSwitcher />
            <button
                onClick={onHelpClick}
                className="p-2 rounded-full transition-colors duration-300"
                style={{
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--panel-bg)',
                }}
                aria-label="Open help and instructions"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
        </div>
      </div>
    </header>
  );
};


// --- Place Value Playbox Application Logic ---
const trainingPlan: TrainingStep[] = [
  // 1. Introduce all four blocks
  { step: 0, type: 'action', source: 1, column: 'ones', text: "First, let's learn the blocks. Drag a blue '1' block to the 'Ones' column." },
  { step: 1, type: 'feedback', text: "Great! That's a 'One' block.", duration: 2000, clearBoardAfter: false },
  { step: 2, type: 'action', source: 10, column: 'tens', text: "Now drag a green '10' block to the 'Tens' column." },
  { step: 3, type: 'feedback', text: "Awesome! That's a 'Ten' block.", duration: 2000, clearBoardAfter: false },
  { step: 4, type: 'action', source: 100, column: 'hundreds', text: "You're doing great! Drag a yellow '100' block to the 'Hundreds' column." },
  { step: 5, type: 'feedback', text: "Perfect! That's a 'Hundred' block.", duration: 2000, clearBoardAfter: false },
  { step: 6, type: 'action', source: 1000, column: 'thousands', text: "Amazing! Finally, drag a purple '1000' block to the 'Thousands' column." },
  { step: 7, type: 'feedback', text: "Incredible! You've learned all the blocks. Now, let's see some magic! ✨", duration: 3000, clearBoardAfter: true },

  // 2. Regrouping Ones to Tens
  { step: 8, type: 'action_multi', source: 1, column: 'ones', count: 10, text: "Add 10 blue '1' blocks to the 'Ones' column to see what happens." },
  { step: 9, type: 'magic_feedback', text: "Poof! 10 'Ones' became 1 'Ten'. That's regrouping!", duration: 4000, clearBoardAfter: true, targetColumn: 'tens' },

  // 3. Regrouping Tens to Hundreds
  { step: 10, type: 'action_multi', source: 10, column: 'tens', count: 10, text: "Let's do it again! Add 10 green '10' blocks to the 'Tens' column." },
  { step: 11, type: 'magic_feedback', text: "Amazing! 🪄 10 'Tens' make 1 'Hundred' block!", duration: 4000, clearBoardAfter: true, targetColumn: 'hundreds' },

  // 4. Regrouping Hundreds to Thousands
  { step: 12, type: 'action_multi', source: 100, column: 'hundreds', count: 10, text: "One last magic trick! Add 10 yellow '100' blocks to the 'Hundreds' column." },
  { step: 13, type: 'magic_feedback', text: "Wow! 10 'Hundreds' make 1 'Thousand'. You're a place value wizard! 🧙‍♂️", duration: 4000, clearBoardAfter: true, targetColumn: 'thousands' },
  
  // 5. Completion
  { step: 14, type: 'complete', text: "Training Complete! You're ready for anything!" },
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

const AppContent: React.FC = () => {
  const [columns, setColumns] = useState<PlaceValueColumns>({ ones: [], tens: [], hundreds: [], thousands: [] });
  const [total, setTotal] = useState(0);
  const [draggedValue, setDraggedValue] = useState<BlockValue | null>(null);
  const [draggedOrigin, setDraggedOrigin] = useState<{ category: PlaceValueCategory, id: string } | null>(null);
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [currentModel, setCurrentModel] = useState<string>('place-value-playbox');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showRocket, setShowRocket] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCandy, setShowCandy] = useState(false);

  // Challenge Mode State
  const [challengeStatus, setChallengeStatus] = useState<'playing' | 'correct' | 'incorrect' | 'timed_out'>('playing');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [filteredQuestions, setFilteredQuestions] = useState<ChallengeQuestion[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [timeLimit, setTimeLimit] = useState(45);
  
  // Training Mode State
  const [trainingStep, setTrainingStep] = useState(0);
  const [trainingFeedback, setTrainingFeedback] = useState<string | null>(null);
  const [lastSuccessfulDrop, setLastSuccessfulDrop] = useState<{category: PlaceValueCategory, value: BlockValue} | null>(null);

  // Touch Drag state
  const [touchDragging, setTouchDragging] = useState<{ value: BlockValue, element: HTMLDivElement } | null>(null);
  const [touchTarget, setTouchTarget] = useState<PlaceValueCategory | null>(null);

  // Licensing state
  const [licenseStatus, setLicenseStatus] = useState<'loading' | 'valid' | 'locked' | 'expired' | 'tampered'>('loading');
  const [expiredDuration, setExpiredDuration] = useState<number | null>(null);
  
  // Regrouping state flag
  const isRegroupingRef = useRef(false);

  const { isSpeechEnabled } = useAudio();
  
  const playDropSound = useSimpleSound(440, 0.1);
  const playRegroupSound = useSimpleSound(880, 0.2);
  const playErrorSound = useSimpleSound(220, 0.2);
  const playSuccessSound = useSimpleSound(1046, 0.2); // C6
  const playNextSound = useSimpleSound(659, 0.15); // E5

  useEffect(() => {
    // Check license on initial load
    try {
      const licenseData = localStorage.getItem('app_license');
      const lastCheck = localStorage.getItem('app_last_check');
      const now = Date.now();

      if (lastCheck && now < parseInt(lastCheck, 10)) {
        setLicenseStatus('tampered'); // Clock has been set back
        return;
      }
      
      localStorage.setItem('app_last_check', now.toString());
      
      if (!licenseData) {
        setLicenseStatus('locked');
        return;
      }
      
      const { activationTime, expiryTime, duration } = JSON.parse(licenseData);
      
      if (now >= expiryTime) {
        setLicenseStatus('expired');
        setExpiredDuration(duration);
        return;
      }

      setLicenseStatus('valid');

      // Set a timer to lock the app when the license expires, even during an active session.
      const timeToExpire = expiryTime - now;
      if (timeToExpire > 0) {
        const timerId = setTimeout(() => {
          setLicenseStatus('expired');
          setExpiredDuration(duration);
        }, timeToExpire);
        return () => clearTimeout(timerId); // Clean up the timer
      }

    } catch (e) {
      console.error("Could not access localStorage for license check.", e);
      setLicenseStatus('locked'); // Fail-safe to locked state
    }
  }, []);

  const handleKeyVerification = async (key: string) => {
    const result = await verifyKeyOnServer(key);
    if (result.success && result.validityInMs) {
      const now = Date.now();
      const license = {
        activationTime: now,
        expiryTime: now + result.validityInMs,
        duration: result.validityInMs,
      };
      try {
        localStorage.setItem('app_license', JSON.stringify(license));
        localStorage.setItem('app_last_check', now.toString());
        // Reload the page to apply the new license state and clear game state.
        window.location.replace(window.location.href);
      } catch (e) {
        console.error("Could not save license to localStorage.", e);
        return { success: false, message: "Could not save license. Storage may be full." };
      }
    }
    return result;
  };

  const totalInWords = useMemo(() => {
    if (total === 0) return '';
    return numberToWords(total);
  }, [total]);

  const resetBoard = useCallback(() => {
    setColumns({ ones: [], tens: [], hundreds: [], thousands: [] });
  }, []);

  useEffect(() => {
    const newTotal =
      columns.ones.length +
      columns.tens.length * 10 +
      columns.hundreds.length * 100 +
      columns.thousands.length * 1000;
    setTotal(newTotal);
  }, [columns]);
  
  // Rewritten regrouping logic to be atomic and prevent race conditions.
  useEffect(() => {
      const needsRegrouping = (cols: PlaceValueColumns) =>
          cols.ones.length >= 10 ||
          cols.tens.length >= 10 ||
          cols.hundreds.length >= 10;

      if (needsRegrouping(columns) && !isRegroupingRef.current) {
          isRegroupingRef.current = true;

          let source: PlaceValueCategory;
          let dest: PlaceValueCategory;
          let value: BlockValue;

          if (columns.ones.length >= 10) {
              source = 'ones';
              dest = 'tens';
              value = 10;
          } else if (columns.tens.length >= 10) {
              source = 'tens';
              dest = 'hundreds';
              value = 100;
          } else { // hundreds must be >= 10
              source = 'hundreds';
              dest = 'thousands';
              value = 1000;
          }
          
          playRegroupSound();

          // Step 1: Trigger the animation on the source blocks
          setColumns(prev => ({
              ...prev,
              [source]: prev[source].map((b, i) => (i < 10 ? { ...b, isAnimating: true } : b)),
          }));

          // Step 2: After animation, perform the actual state change for regrouping
          setTimeout(() => {
              setColumns(prev => {
                  const newColumns = { ...prev };
                  newColumns[source] = newColumns[source].slice(10);
                  newColumns[dest] = [
                      ...newColumns[dest],
                      { id: `block-${Date.now()}`, value: value, isNewlyRegrouped: true },
                  ];
                  return newColumns;
              });

              // Step 3: Handle training mode advancement
              if (gameState === 'training') {
                  const currentStep = trainingPlan.find(s => s.step === trainingStep);
                  if (currentStep?.type === 'action_multi' && currentStep.column === source) {
                      const nextStepConfig = trainingPlan.find(s => s.step === trainingStep + 1);
                      if (nextStepConfig?.type === 'magic_feedback') {
                          setTrainingFeedback(nextStepConfig.text);
                          if (isSpeechEnabled) speak(nextStepConfig.text, 'en-US');

                          setTimeout(() => {
                              setTrainingFeedback(null);
                              setTrainingStep(prev => prev + 2);
                              if (nextStepConfig.clearBoardAfter) {
                                  resetBoard();
                              }
                              isRegroupingRef.current = false;
                          }, nextStepConfig.duration || 3000);
                      } else {
                          isRegroupingRef.current = false;
                      }
                  } else {
                      isRegroupingRef.current = false;
                  }
              } else {
                  isRegroupingRef.current = false;
              }
          }, 600); // This delay should match the animation duration
      }
  }, [columns, gameState, trainingStep, isSpeechEnabled, resetBoard, playRegroupSound]);


  const addBlock = useCallback((category: PlaceValueCategory, value: BlockValue) => {
    playDropSound();
    const newBlock = { id: `block-${Date.now()}-${Math.random()}`, value };
    
    setColumns(prevColumns => ({ ...prevColumns, [category]: [...prevColumns[category], newBlock] }));
    
    if (gameState === 'training') {
      setLastSuccessfulDrop({ category, value });
    }
  }, [gameState, playDropSound]);
  
  // Effect to handle training step advancement, preventing stale state issues.
  useEffect(() => {
    if (gameState !== 'training' || !lastSuccessfulDrop) return;

    const { category } = lastSuccessfulDrop;
    const currentStepConfig = trainingPlan.find(s => s.step === trainingStep);
    if (!currentStepConfig) return;

    const advanceAndShowFeedback = () => {
        const nextStepConfig = trainingPlan.find(s => s.step === trainingStep + 1);
        if (!nextStepConfig) return;

        setTrainingFeedback(nextStepConfig.text);
        if (isSpeechEnabled) speak(nextStepConfig.text, 'en-US');

        setTimeout(() => {
            setTrainingFeedback(null);
            setTrainingStep(prev => prev + 2);
            if (nextStepConfig.clearBoardAfter) {
                resetBoard();
            }
        }, nextStepConfig.duration || 2000);
    };

    if (currentStepConfig.type === 'action' && currentStepConfig.column === category) {
        advanceAndShowFeedback();
    } else if (currentStepConfig.type === 'action_multi' && currentStepConfig.column === category) {
        // This check runs after `columns` state has been updated.
        if (columns[category].length === currentStepConfig.count) {
            const nextStepConfig = trainingPlan.find(s => s.step === trainingStep + 1);
            if (nextStepConfig && nextStepConfig.type !== 'magic_feedback') {
                advanceAndShowFeedback();
            }
        }
    }

    // Reset the drop trigger to prevent re-running this effect.
    setLastSuccessfulDrop(null);

  }, [lastSuccessfulDrop, gameState, trainingStep, columns, isSpeechEnabled, resetBoard]);

  const removeBlock = useCallback((category: PlaceValueCategory, id: string) => {
    playDropSound();
    setColumns(prev => {
        const newCategoryBlocks = prev[category].filter(b => b.id !== id);
        return {
            ...prev,
            [category]: newCategoryBlocks
        };
    });
  }, [playDropSound]);

  const currentStepConfig = gameState === 'training' ? trainingPlan.find(s => s.step === trainingStep) : null;

  // This effect handles speaking the instructions for the current training step to prevent sync issues.
  useEffect(() => {
    if (gameState === 'training' && isSpeechEnabled) {
      const currentStepConfig = trainingPlan.find(s => s.step === trainingStep);
      
      // Only speak for action steps to avoid re-speaking feedback messages.
      if (currentStepConfig && (currentStepConfig.type === 'action' || currentStepConfig.type === 'action_multi')) {
        // The speak utility cancels previous speech, ensuring instructions don't overlap.
        speak(currentStepConfig.text, 'en-US');
      }
    }
  }, [gameState, trainingStep, isSpeechEnabled]);

  const isDropAllowedForValue = (category: PlaceValueCategory, value: BlockValue | null) => {
    if (!value) return false;

    if (gameState === 'training') {
        if (currentStepConfig && currentStepConfig.type.startsWith('action')) {
            return currentStepConfig.source === value && currentStepConfig.column === category;
        }
        return false;
    }

    return (
        (category === 'ones' && value === 1) ||
        (category === 'tens' && value === 10) ||
        (category === 'hundreds' && value === 100) ||
        (category === 'thousands' && value === 1000)
    );
  };
  
  const handleDrop = (category: PlaceValueCategory) => {
    if (isDropAllowedForValue(category, draggedValue)) {
      if (draggedOrigin) {
        removeBlock(draggedOrigin.category, draggedOrigin.id);
      }
      addBlock(category, draggedValue!);
    } else {
      playErrorSound();
    }
    setDraggedValue(null);
    setDraggedOrigin(null);
  };

  const handleDragStart = (value: BlockValue, origin?: { category: PlaceValueCategory, id: string }) => {
    setDraggedValue(value);
    setDraggedOrigin(origin || null);
  };
  
  const handleGenericDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  
  const handleDropOnBackground = () => {
    // This allows removing blocks by dropping them outside the columns in playground mode.
    if (gameState === 'playground' && draggedOrigin) {
        removeBlock(draggedOrigin.category, draggedOrigin.id);
    }
    setDraggedValue(null);
    setDraggedOrigin(null);
  };

  // Touch Drag Handlers
  const handleTouchStart = (value: BlockValue, event: React.TouchEvent) => {
    if (touchDragging) return;
    const touch = event.touches[0];
    
    const ghost = document.createElement('div');
    ghost.style.position = 'fixed';
    ghost.style.left = `${touch.clientX - 25}px`;
    ghost.style.top = `${touch.clientY - 25}px`;
    ghost.style.zIndex = '1000';
    ghost.style.pointerEvents = 'none';
    ghost.innerHTML = event.currentTarget.outerHTML;
    document.body.appendChild(ghost);
    
    setTouchDragging({ value, element: ghost });
    setDraggedValue(value);
  };

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!touchDragging) return;
    const touch = event.touches[0];
    touchDragging.element.style.left = `${touch.clientX - 25}px`;
    touchDragging.element.style.top = `${touch.clientY - 25}px`;

    const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropTarget = elementUnderTouch?.closest('[data-droptarget]');
    if (dropTarget) {
      setTouchTarget(dropTarget.getAttribute('data-droptarget') as PlaceValueCategory);
    } else {
      setTouchTarget(null);
    }
  }, [touchDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!touchDragging) return;
    
    if (touchTarget) {
      handleDrop(touchTarget);
    } else {
        // Handle dropping outside for touch devices
        handleDropOnBackground();
    }
    
    document.body.removeChild(touchDragging.element);
    setTouchDragging(null);
    setTouchTarget(null);
    setDraggedValue(null);
  }, [touchDragging, touchTarget, handleDrop, handleDropOnBackground]);

  useEffect(() => {
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  // Game Mode Logic
  const startChallenge = useCallback((selectedDifficulty: Difficulty) => {
    const questions = challengeQuestions.filter(q => q.level === (selectedDifficulty === 'easy' ? 1 : selectedDifficulty === 'medium' ? 2 : 3));
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    
    setDifficulty(selectedDifficulty);
    setFilteredQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setScore(0);
    resetBoard();
    setChallengeStatus('playing');
    setGameState('challenge');
    setTimeLimit(DURATION_MAP[selectedDifficulty]);
  }, [resetBoard]);
  
  const handleSelectDifficulty = (difficulty: Difficulty) => {
      startChallenge(difficulty);
  }

  const handleCheckAnswer = () => {
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    if (total === currentQuestion.answer) {
      playSuccessSound();
      setChallengeStatus('correct');
      setScore(prev => prev + 10);
      setShowRocket(true);
    } else {
      playErrorSound();
      setChallengeStatus('incorrect');
      setCorrectAnswer(currentQuestion.answer);
    }
  };

  const handleNextChallenge = () => {
    playNextSound();
    resetBoard();
    setChallengeStatus('playing');
    setCorrectAnswer(null);
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // This case is now handled by the rocket onComplete -> confetti flow
      // for the final question. We just need to trigger the final celebration.
      // The rocket animation would have already played from handleCheckAnswer.
      // We will now trigger confetti directly from the rocket animation's onComplete.
      goBackToMenu(); // Failsafe if confetti doesn't trigger
    }
  };

  const handleTimeOut = () => {
      playErrorSound();
      setChallengeStatus('timed_out');
      setCorrectAnswer(filteredQuestions[currentQuestionIndex].answer);
  }

  const handleModeSelection = (mode: GameState) => {
    resetBoard();
    setGameState(mode);
    if (mode === 'challenge') {
        setGameState('challenge_difficulty_selection');
    } else if (mode === 'training') {
        setTrainingStep(0);
    }
  };
  
  const goBackToMenu = () => {
      resetBoard();
      setGameState('mode_selection');
  };

  if (licenseStatus !== 'valid') {
    return <LicenseScreen status={licenseStatus as 'locked' | 'expired' | 'tampered'} onVerify={handleKeyVerification} expiredDuration={expiredDuration} />;
  }
  
  if (currentModel !== 'place-value-playbox') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header onMenuClick={() => setIsSidebarOpen(true)} onHelpClick={() => setShowHelpModal(true)} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onSelectModel={setCurrentModel} />
        <main className="flex-grow flex items-center justify-center p-4">
          <p>Selected model: {currentModel}</p>
        </main>
        <Footer />
      </div>
    );
  }
  
  const renderGameState = () => {
    switch (gameState) {
      case 'welcome':
        return <WelcomeScreen onStart={() => setGameState('mode_selection')} />;
      case 'mode_selection':
        return <ModeSelector onSelectMode={handleModeSelection} />;
      case 'challenge_difficulty_selection':
          return <DifficultySelector onSelectDifficulty={handleSelectDifficulty} onBack={goBackToMenu} />;
      case 'stem_connection':
          return <StemConnection />;
      case 'training':
      case 'playground':
      case 'challenge':
        const currentQuestion = filteredQuestions[currentQuestionIndex];
        return (
          <div className="flex flex-col items-center w-full max-w-7xl animate-pop-in">
            {gameState === 'challenge' && (
              <ChallengePanel 
                question={currentQuestion} 
                score={score} 
                status={challengeStatus}
                onCheck={handleCheckAnswer}
                onNext={handleNextChallenge}
                onTimeOut={handleTimeOut}
                correctAnswer={correctAnswer}
                timeLimit={timeLimit}
              />
            )}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full">
              <PlaceValueColumn title="Thousands" category="thousands" blocks={columns.thousands} onDrop={handleDrop} onDragOver={handleGenericDragOver} onDragStart={handleDragStart} isRegroupingDestination={false} isDropAllowed={isDropAllowedForValue('thousands', draggedValue)} isDragging={!!draggedValue} color="purple" isTouchTarget={touchTarget === 'thousands'} appState={gameState} isSpotlighted={currentStepConfig?.column === 'thousands'} />
              <PlaceValueColumn title="Hundreds" category="hundreds" blocks={columns.hundreds} onDrop={handleDrop} onDragOver={handleGenericDragOver} onDragStart={handleDragStart} isRegroupingDestination={columns.tens.length >= 10} isDropAllowed={isDropAllowedForValue('hundreds', draggedValue)} isDragging={!!draggedValue} color="yellow" isTouchTarget={touchTarget === 'hundreds'} appState={gameState} isSpotlighted={currentStepConfig?.column === 'hundreds'}/>
              <PlaceValueColumn title="Tens" category="tens" blocks={columns.tens} onDrop={handleDrop} onDragOver={handleGenericDragOver} onDragStart={handleDragStart} isRegroupingDestination={columns.ones.length >= 10} isDropAllowed={isDropAllowedForValue('tens', draggedValue)} isDragging={!!draggedValue} color="green" isTouchTarget={touchTarget === 'tens'} appState={gameState} isSpotlighted={currentStepConfig?.column === 'tens'} />
              <PlaceValueColumn title="Ones" category="ones" blocks={columns.ones} onDrop={handleDrop} onDragOver={handleGenericDragOver} onDragStart={handleDragStart} isRegroupingDestination={false} isDropAllowed={isDropAllowedForValue('ones', draggedValue)} isDragging={!!draggedValue} color="blue" isTouchTarget={touchTarget === 'ones'} appState={gameState} isSpotlighted={currentStepConfig?.column === 'ones'} />
            </div>
            <div className="mt-4 sm:mt-8 flex flex-col sm:flex-row items-center justify-between w-full gap-4">
              <div className="flex-1">
                <ResetButton onClick={resetBoard} />
              </div>
              <div className="flex-1">
                <BlockSource onDragStart={handleDragStart} onTouchStart={handleTouchStart} isTraining={gameState === 'training'} spotlightOn={currentStepConfig?.source}/>
              </div>
              <div className="flex-1"></div>
            </div>
            {gameState === 'training' && <TrainingGuide currentStepConfig={currentStepConfig} columnCounts={{ ones: columns.ones.length, tens: columns.tens.length, hundreds: columns.hundreds.length, thousands: columns.thousands.length }} onComplete={goBackToMenu} feedback={trainingFeedback} />}
          </div>
        );
      default:
        return <div>Unknown game state</div>;
    }
  };
  
  const isFinalChallenge = gameState === 'challenge' && currentQuestionIndex >= filteredQuestions.length - 1;

  return (
    <div className="min-h-screen flex flex-col font-sans">
        <BackgroundManager />
        <div className="relative z-10 p-2 sm:p-4 w-full max-w-8xl mx-auto flex flex-col flex-grow items-center">
            <GameHeader total={total} appState={gameState} onBack={goBackToMenu} totalInWords={totalInWords} onHelpClick={() => setShowHelpModal(true)}/>
            <main className="flex-grow w-full flex items-center justify-center py-4" onDrop={handleDropOnBackground} onDragOver={handleGenericDragOver}>
                {renderGameState()}
            </main>
        </div>
        
        {/* Modals and Overlays */}
        {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
        {showRocket && <RocketAnimation onComplete={() => {
            setShowRocket(false);
            if (isFinalChallenge) {
                setShowConfetti(true);
            }
        }} />}
        {showConfetti && <Confetti onComplete={() => {
            setShowConfetti(false);
            goBackToMenu(); // Go back to menu after final celebration
        }} />}
        {showCandy && <CandyReward onComplete={() => setShowCandy(false)} />}
    </div>
  );
};

// --- Main App Component (Router) ---
const App: React.FC = () => {
  if (window.location.pathname.startsWith('/admin')) {
    return <AdminPage />;
  }

  return <AppContent />;
};

export default App;