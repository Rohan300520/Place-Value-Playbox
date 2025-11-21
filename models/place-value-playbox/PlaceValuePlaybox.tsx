import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { PlaceValueColumns, BlockValue, PlaceValueCategory, Block, PlaceValueState, TrainingStep, PlaceValueChallengeQuestion, Difficulty, UserInfo } from '../../types';
import { PlaceValueColumn } from '../../components/PlaceValueColumn';
import { BlockSource } from '../../components/BlockSource';
import { ResetButton } from '../../components/ResetButton';
import { ChallengePanel } from '../../components/ChallengePanel';
import { WelcomeScreen } from '../../components/WelcomeScreen';
import { ModeSelector } from '../../components/ModeSelector';
import { DifficultySelector } from '../../components/DifficultySelector';
import { TrainingGuide } from '../../components/TrainingGuide';
import { HelpModal } from '../../components/HelpModal';
import { NumberBlock } from '../../components/NumberBlock';
import { numberToWords } from '../../utils/numberToWords';
import { RocketAnimation } from '../../components/RocketAnimation';
import { Confetti } from '../../components/Confetti';
import { challengeQuestions } from '../../utils/challenges';
import { StemConnection } from '../../components/StemConnection';
import { CandyReward } from '../../components/CandyReward';
import { Header } from '../../components/Header';
import { ModelIntroScreen } from '../../components/ModelIntroScreen';
import { useAudio } from '../../contexts/AudioContext';
import { speak, cancelSpeech } from '../../utils/speech';
import { logEvent, syncAnalyticsData } from '../../utils/analytics';

// --- Place Value Playbox Application Logic ---
const trainingPlan: TrainingStep[] = [
  // 1. Introduce all four blocks
  { step: 0, type: 'action', source: 1, column: 'ones', text: "First, let's learn the blocks. Drag a blue '1' block to the 'Ones' column." },
  { step: 1, type: 'feedback', text: "Great! That's a 'One' block.", duration: 3000, clearBoardAfter: false },
  { step: 2, type: 'action', source: 10, column: 'tens', text: "Now drag a green '10' block to the 'Tens' column." },
  { step: 3, type: 'feedback', text: "Awesome! That's a 'Ten' block.", duration: 3000, clearBoardAfter: false },
  { step: 4, type: 'action', source: 100, column: 'hundreds', text: "You're doing great! Drag a yellow '100' block to the 'Hundreds' column." },
  { step: 5, type: 'feedback', text: "Perfect! That's a 'Hundred' block.", duration: 3000, clearBoardAfter: false },
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

export const PlaceValuePlaybox: React.FC<{ onExit: () => void, currentUser: UserInfo | null }> = ({ onExit, currentUser }) => {
  const [columns, setColumns] = useState<PlaceValueColumns>({ ones: [], tens: [], hundreds: [], thousands: [] });
  const [total, setTotal] = useState(0);
  const [draggedValue, setDraggedValue] = useState<BlockValue | null>(null);
  const [draggedOrigin, setDraggedOrigin] = useState<{ category: PlaceValueCategory, id: string } | null>(null);
  const [gameState, setGameState] = useState<PlaceValueState>('welcome');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showRocket, setShowRocket] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCandy, setShowCandy] = useState(false);

  // Challenge Mode State
  const [challengeStatus, setChallengeStatus] = useState<'playing' | 'correct' | 'incorrect' | 'timed_out'>('playing');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [filteredQuestions, setFilteredQuestions] = useState<PlaceValueChallengeQuestion[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [timeLimit, setTimeLimit] = useState(45);
  const challengeStartTimeRef = useRef<number | null>(null);
  
  // Training Mode State
  const [trainingStep, setTrainingStep] = useState(0);
  const [trainingFeedback, setTrainingFeedback] = useState<string | null>(null);
  const [lastSuccessfulDrop, setLastSuccessfulDrop] = useState<{category: PlaceValueCategory, value: BlockValue} | null>(null);

  // Touch Drag state
  const [touchDragging, setTouchDragging] = useState<{ value: BlockValue, element: HTMLDivElement } | null>(null);
  const [touchTarget, setTouchTarget] = useState<PlaceValueCategory | null>(null);
  
  // Regrouping state flag
  const isRegroupingRef = useRef(false);

  const { isSpeechEnabled } = useAudio();
  
  const playDropSound = useSimpleSound(440, 0.1);
  const playRegroupSound = useSimpleSound(880, 0.2);
  const playErrorSound = useSimpleSound(220, 0.2);
  const playSuccessSound = useSimpleSound(1046, 0.2); // C6
  const playNextSound = useSimpleSound(659, 0.15); // E5

  const totalInWords = useMemo(() => {
    if (total === 0) return '';
    return numberToWords(total);
  }, [total]);

  const resetBoard = useCallback(async (isUserInitiated: boolean = false) => {
    setColumns({ ones: [], tens: [], hundreds: [], thousands: [] });
    if(isUserInitiated) {
      await logEvent('board_reset', currentUser, { model: 'place-value-playbox', gameState });
      syncAnalyticsData();
    }
  }, [currentUser, gameState]);

  useEffect(() => {
    const newTotal =
      columns.ones.length +
      columns.tens.length * 10 +
      columns.hundreds.length * 100 +
      columns.thousands.length * 1000;
    setTotal(newTotal);
  }, [columns]);
  
  useEffect(() => {
      const needsRegrouping = (cols: PlaceValueColumns) =>
          cols.ones.length >= 10 ||
          cols.tens.length >= 10 ||
          cols.hundreds.length >= 10;

      if (needsRegrouping(columns) && !isRegroupingRef.current) {
          isRegroupingRef.current = true;
          let source: PlaceValueCategory, dest: PlaceValueCategory, value: BlockValue;

          if (columns.ones.length >= 10) { source = 'ones'; dest = 'tens'; value = 10; } 
          else if (columns.tens.length >= 10) { source = 'tens'; dest = 'hundreds'; value = 100; } 
          else { source = 'hundreds'; dest = 'thousands'; value = 1000; }
          
          playRegroupSound();
          setColumns(prev => ({ ...prev, [source]: prev[source].map((b, i) => (i < 10 ? { ...b, isAnimating: true } : b)) }));

          setTimeout(() => {
              setColumns(prev => {
                  const newColumns = { ...prev };
                  newColumns[source] = newColumns[source].slice(10);
                  newColumns[dest] = [ ...newColumns[dest], { id: `block-${Date.now()}`, value: value, isNewlyRegrouped: true }];
                  return newColumns;
              });

              if (gameState === 'training') {
                  const currentStepConfig = trainingPlan.find(s => s.step === trainingStep);
                  if (currentStepConfig?.type === 'action_multi' && currentStepConfig.column === source) {
                      const nextStepConfig = trainingPlan.find(s => s.step === trainingStep + 1);
                      if (nextStepConfig?.type === 'magic_feedback') {
                          setTrainingFeedback(nextStepConfig.text);
                          if (isSpeechEnabled) speak(nextStepConfig.text, 'en-US');
                          setTimeout(() => {
                              setTrainingFeedback(null);
                              setTrainingStep(prev => prev + 2);
                              if (nextStepConfig.clearBoardAfter) resetBoard(false);
                              isRegroupingRef.current = false;
                          }, nextStepConfig.duration || 3000);
                      } else isRegroupingRef.current = false;
                  } else isRegroupingRef.current = false;
              } else isRegroupingRef.current = false;
          }, 600);
      }
  }, [columns, gameState, trainingStep, isSpeechEnabled, resetBoard, playRegroupSound]);

  const addBlock = useCallback((category: PlaceValueCategory, value: BlockValue) => {
    playDropSound();
    const newBlock = { id: `block-${Date.now()}-${Math.random()}`, value };
    setColumns(prevColumns => ({ ...prevColumns, [category]: [...prevColumns[category], newBlock] }));
    if (gameState === 'training') setLastSuccessfulDrop({ category, value });
  }, [gameState, playDropSound]);
  
  useEffect(() => {
    if (gameState !== 'training' || !lastSuccessfulDrop) return;
    const { category } = lastSuccessfulDrop;
    const currentStepConfig = trainingPlan.find(s => s.step === trainingStep);
    if (!currentStepConfig) return;

    const advanceAndShowFeedback = () => {
        const nextStepConfig = trainingPlan.find(s => s.step === trainingStep + 1);
        if (!nextStepConfig) return;
        setTrainingFeedback(nextStepConfig.text);
        if (isSpeechEnabled) { cancelSpeech(); speak(nextStepConfig.text, 'en-US'); }
        setTimeout(() => {
            setTrainingFeedback(null);
            setTrainingStep(prev => prev + 2);
            if ((nextStepConfig.type === 'feedback' || nextStepConfig.type === 'magic_feedback') && nextStepConfig.clearBoardAfter) {
                resetBoard(false);
            }
        }, (nextStepConfig.type === 'feedback' || nextStepConfig.type === 'magic_feedback') ? nextStepConfig.duration : 3000);
    };

    if (currentStepConfig.type === 'action' && currentStepConfig.column === category) {
        advanceAndShowFeedback();
    } else if (currentStepConfig.type === 'action_multi' && currentStepConfig.column === category) {
        if (columns[category].length === currentStepConfig.count) {
            const nextStepConfig = trainingPlan.find(s => s.step === trainingStep + 1);
            if (nextStepConfig && nextStepConfig.type !== 'magic_feedback') advanceAndShowFeedback();
        }
    }
    setLastSuccessfulDrop(null);
  }, [lastSuccessfulDrop, gameState, trainingStep, columns, isSpeechEnabled, resetBoard]);

  const removeBlock = useCallback((category: PlaceValueCategory, id: string) => {
    playDropSound();
    setColumns(prev => ({ ...prev, [category]: prev[category].filter(b => b.id !== id) }));
  }, [playDropSound]);

  const currentStepConfig = gameState === 'training' ? trainingPlan.find(s => s.step === trainingStep) : null;

  useEffect(() => {
    if (gameState === 'training' && isSpeechEnabled && !trainingFeedback) {
      const currentStepConfig = trainingPlan.find(s => s.step === trainingStep);
      if (currentStepConfig && (currentStepConfig.type === 'action' || currentStepConfig.type === 'action_multi')) {
        speak(currentStepConfig.text, 'en-US');
      }
    }
  }, [gameState, trainingStep, isSpeechEnabled, trainingFeedback]);

  const isDropAllowedForValue = (category: PlaceValueCategory, value: BlockValue | null) => {
    if (!value) return false;
    if (category === 'thousands' && columns.thousands.length >= 20) return false;
    if (gameState === 'training') {
        if (currentStepConfig && (currentStepConfig.type === 'action' || currentStepConfig.type === 'action_multi')) {
            return currentStepConfig.source === value && currentStepConfig.column === category;
        }
        return false;
    }
    return (
        (category === 'ones' && value === 1) || (category === 'tens' && value === 10) ||
        (category === 'hundreds' && value === 100) || (category === 'thousands' && value === 1000)
    );
  };
  
  const handleClickToAddBlock = (value: BlockValue) => {
    const categoryMap: Record<BlockValue, PlaceValueCategory> = { 1: 'ones', 10: 'tens', 100: 'hundreds', 1000: 'thousands' };
    const category = categoryMap[value];
    if (isDropAllowedForValue(category, value)) addBlock(category, value);
    else playErrorSound();
  };

  const handleDrop = (category: PlaceValueCategory) => {
    if (isDropAllowedForValue(category, draggedValue)) {
      if (draggedOrigin) removeBlock(draggedOrigin.category, draggedOrigin.id);
      addBlock(category, draggedValue!);
    } else playErrorSound();
    setDraggedValue(null); setDraggedOrigin(null);
  };

  const handleDragStart = (value: BlockValue, origin?: { category: PlaceValueCategory, id: string }) => {
    setDraggedValue(value); setDraggedOrigin(origin || null);
  };
  
  const handleGenericDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();
  
  const handleDropOnBackground = () => {
    if ((gameState === 'playground' || gameState === 'challenge') && draggedOrigin) removeBlock(draggedOrigin.category, draggedOrigin.id);
    setDraggedValue(null); setDraggedOrigin(null);
  };

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
    if (dropTarget) setTouchTarget(dropTarget.getAttribute('data-droptarget') as PlaceValueCategory);
    else setTouchTarget(null);
  }, [touchDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!touchDragging) return;
    if (touchTarget) handleDrop(touchTarget);
    else handleDropOnBackground();
    document.body.removeChild(touchDragging.element);
    setTouchDragging(null); setTouchTarget(null); setDraggedValue(null);
  }, [touchDragging, touchTarget]);

  useEffect(() => {
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  const startChallenge = useCallback((selectedDifficulty: Difficulty) => {
    const questions = challengeQuestions.filter(q => q.level === (selectedDifficulty === 'easy' ? 1 : selectedDifficulty === 'medium' ? 2 : 3));
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    setDifficulty(selectedDifficulty);
    setFilteredQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setScore(0);
    resetBoard(false);
    setChallengeStatus('playing');
    setGameState('challenge');
    setTimeLimit(DURATION_MAP[selectedDifficulty]);
    challengeStartTimeRef.current = Date.now();
  }, [resetBoard]);
  
  const handleSelectDifficulty = (difficulty: Difficulty) => startChallenge(difficulty);

  const handleCheckAnswer = async () => {
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    const durationSeconds = challengeStartTimeRef.current ? (Date.now() - challengeStartTimeRef.current) / 1000 : 0;
    const isCorrect = total === currentQuestion.answer;

    await logEvent('challenge_attempt', currentUser, {
        model: 'place-value-playbox',
        questionId: currentQuestion.id,
        questionText: currentQuestion.question,
        level: difficulty,
        status: isCorrect ? 'correct' : 'incorrect',
        durationSeconds,
        userAnswer: total,
        correctAnswer: currentQuestion.answer,
    });
    syncAnalyticsData();
    
    if (isCorrect) {
      playSuccessSound();
      setChallengeStatus('correct');
      setScore(prev => prev + 10);
      setShowRocket(true);
      setShowConfetti(true);
    } else {
      playErrorSound();
      setChallengeStatus('incorrect');
      setCorrectAnswer(currentQuestion.answer);
    }
  };
  
  const goBackToMenu = useCallback(() => {
      resetBoard(false);
      setGameState('mode_selection');
  }, [resetBoard]);

  const handleNextChallenge = () => {
    playNextSound();
    resetBoard(false);
    setChallengeStatus('playing');
    setCorrectAnswer(null);
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      challengeStartTimeRef.current = Date.now();
    } else {
      goBackToMenu();
    }
  };

  const handleTimeOut = async () => {
      const currentQuestion = filteredQuestions[currentQuestionIndex];
      if (!currentQuestion) return;
      
      const durationSeconds = challengeStartTimeRef.current ? (Date.now() - challengeStartTimeRef.current) / 1000 : timeLimit;
      await logEvent('challenge_attempt', currentUser, {
          model: 'place-value-playbox',
          questionId: currentQuestion.id,
          questionText: currentQuestion.question,
          level: difficulty,
          status: 'timed_out',
          durationSeconds,
          userAnswer: total,
          correctAnswer: currentQuestion.answer,
      });
      syncAnalyticsData();

      playErrorSound();
      setChallengeStatus('timed_out');
      setCorrectAnswer(currentQuestion.answer);
  }

  const handleModeSelection = async (mode: PlaceValueState) => {
    resetBoard(false);
    setGameState(mode);
    await logEvent('mode_start', currentUser, { model: 'place-value-playbox', mode });
    syncAnalyticsData();
    if (mode === 'challenge') setGameState('challenge_difficulty_selection');
    else if (mode === 'training') setTrainingStep(0);
  };
  
  const renderGameState = () => {
    switch (gameState) {
      case 'welcome':
        return <WelcomeScreen onStart={() => setGameState('model_intro')} />;
      case 'model_intro':
        return <ModelIntroScreen onContinue={() => setGameState('mode_selection')} />;
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
            {gameState === 'training' && (
              <TrainingGuide
                currentStepConfig={currentStepConfig}
                columnCounts={{ ones: columns.ones.length, tens: columns.tens.length, hundreds: columns.hundreds.length, thousands: columns.thousands.length }}
                onComplete={goBackToMenu}
                feedback={trainingFeedback}
              />)}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 w-full">
              <PlaceValueColumn title="Thousands" category="thousands" blocks={columns.thousands} onDrop={handleDrop} onDragOver={handleGenericDragOver} onDragStart={handleDragStart} isRegroupingDestination={false} isDropAllowed={isDropAllowedForValue('thousands', draggedValue)} isDragging={!!draggedValue} color="purple" isTouchTarget={touchTarget === 'thousands'} appState={gameState} isSpotlighted={currentStepConfig && (currentStepConfig.type === 'action' || currentStepConfig.type === 'action_multi') && currentStepConfig.column === 'thousands'} />
              <PlaceValueColumn title="Hundreds" category="hundreds" blocks={columns.hundreds} onDrop={handleDrop} onDragOver={handleGenericDragOver} onDragStart={handleDragStart} isRegroupingDestination={columns.tens.length >= 10} isDropAllowed={isDropAllowedForValue('hundreds', draggedValue)} isDragging={!!draggedValue} color="yellow" isTouchTarget={touchTarget === 'hundreds'} appState={gameState} isSpotlighted={currentStepConfig && (currentStepConfig.type === 'action' || currentStepConfig.type === 'action_multi') && currentStepConfig.column === 'hundreds'}/>
              <PlaceValueColumn title="Tens" category="tens" blocks={columns.tens} onDrop={handleDrop} onDragOver={handleGenericDragOver} onDragStart={handleDragStart} isRegroupingDestination={columns.ones.length >= 10} isDropAllowed={isDropAllowedForValue('tens', draggedValue)} isDragging={!!draggedValue} color="green" isTouchTarget={touchTarget === 'tens'} appState={gameState} isSpotlighted={currentStepConfig && (currentStepConfig.type === 'action' || currentStepConfig.type === 'action_multi') && currentStepConfig.column === 'tens'} />
              <PlaceValueColumn title="Ones" category="ones" blocks={columns.ones} onDrop={handleDrop} onDragOver={handleGenericDragOver} onDragStart={handleDragStart} isRegroupingDestination={false} isDropAllowed={isDropAllowedForValue('ones', draggedValue)} isDragging={!!draggedValue} color="blue" isTouchTarget={touchTarget === 'ones'} appState={gameState} isSpotlighted={currentStepConfig && (currentStepConfig.type === 'action' || currentStepConfig.type === 'action_multi') && currentStepConfig.column === 'ones'} />
            </div>
            <div className="mt-2 flex flex-col sm:flex-row items-center justify-between w-full gap-2 sm:gap-4">
              <div className="flex-1">
                {(gameState === 'playground' || gameState === 'challenge') && <ResetButton onClick={() => resetBoard(true)} />}
              </div>
              <div className="flex-1">
                <BlockSource onDragStart={handleDragStart} onTouchStart={handleTouchStart} onBlockClick={handleClickToAddBlock} isTraining={gameState === 'training'} spotlightOn={currentStepConfig && (currentStepConfig.type === 'action' || currentStepConfig.type === 'action_multi') ? currentStepConfig.source : undefined}/>
              </div>
              <div className="flex-1"></div>
            </div>
          </div>
        );
      default:
        return <div>Unknown game state</div>;
    }
  };
  
  const isFinalChallenge = gameState === 'challenge' && currentQuestionIndex >= filteredQuestions.length - 1;

  const getSubtitle = () => {
    switch (gameState) {
      case 'training': return 'Training Mode';
      case 'challenge': return 'Challenge Mode';
      case 'playground': return 'Playground';
      case 'stem_connection': return 'STEM Connection';
      case 'mode_selection':
      case 'model_intro': return 'Choose Your Adventure!';
      case 'challenge_difficulty_selection': return 'Select Difficulty';
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
        <Header 
            onHelpClick={() => setShowHelpModal(true)}
            currentUser={currentUser}
            onExit={onExit}
            onBackToModelMenu={['welcome', 'model_intro', 'mode_selection'].includes(gameState) ? undefined : goBackToMenu}
            modelTitle="Place Value Playbox"
            modelSubtitle={getSubtitle() ?? undefined}
            showScore={['playground', 'challenge', 'training'].includes(gameState)}
            score={total}
            scoreInWords={totalInWords}
        />
        <main className="flex-grow w-full flex items-center justify-center py-4 px-2 sm:px-4" onDrop={handleDropOnBackground} onDragOver={handleGenericDragOver}>
            {renderGameState()}
        </main>
        
        {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
        {showRocket && <RocketAnimation onComplete={() => setShowRocket(false)} />}
        {showConfetti && <Confetti onComplete={() => {
            setShowConfetti(false);
            if (isFinalChallenge) {
                goBackToMenu();
            }
        }} />}
        {showCandy && <CandyReward onComplete={() => setShowCandy(false)} />}
    </div>
  );
};
