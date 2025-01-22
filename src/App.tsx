import React, { useState, useEffect, useMemo } from 'react';
import spellingWords from './spellingWords.json';
import Question from './Question.tsx';
import Result from './Result.tsx';
import { GameState } from './types.ts';  // Only import what we use directly

const STORAGE_KEY = 'spellingGameState';
const ERRORS_KEY = 'spellingErrors';

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const getInitialGameState = (): GameState => {
  const shuffledQuestions = shuffleArray(spellingWords.spellingQuestions);
  return {
    currentQuestionIndex: 0,
    results: [],
    selectedAnswer: null,
    randomizedAnswers: shuffledQuestions.map(question => 
      [...question.commonMispellings, question.spellingWord].sort(() => Math.random() - 0.5)
    ),
    wordStats: {},
    questionOrder: shuffledQuestions
  };
};

const App: React.FC = () => {
  const [showResults, setShowResults] = useState(false);
  const [viewErrors, setViewErrors] = useState(false);
  const [errors, setErrors] = useState<string[]>(() => {
    const savedErrors = localStorage.getItem(ERRORS_KEY);
    return savedErrors ? JSON.parse(savedErrors) : [];
  });
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      return JSON.parse(savedState);
    }
    return getInitialGameState();
  });

  const { currentQuestionIndex, results, selectedAnswer, randomizedAnswers, wordStats, questionOrder } = gameState;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    localStorage.setItem(ERRORS_KEY, JSON.stringify(errors));
  }, [errors]);

  const resultData = useMemo(() => {
    const correctAnswers = results.filter((result) => result).length;
    const words = results.map((_, index) => ({
      word: questionOrder[index].spellingWord,
      correct: results[index]
    }));
    const hasIncorrectAnswers = results.some(result => !result);

    return {
      correctAnswers,
      words,
      hasIncorrectAnswers,
      total: results.length
    };
  }, [results, questionOrder]);

  if (!questionOrder || !randomizedAnswers || !questionOrder[currentQuestionIndex]) {
    setGameState(getInitialGameState());
    return null;
  }

  const currentQuestion = questionOrder[currentQuestionIndex];
  const currentAnswers = randomizedAnswers[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    setGameState(prev => ({ ...prev, selectedAnswer: answer }));
  };

  const updateWordStats = (word: string, isCorrect: boolean) => {
    setGameState(prev => {
      const currentStats = prev.wordStats[word] || { word, attempts: 0, correct: 0 };
      return {
        ...prev,
        wordStats: {
          ...prev.wordStats,
          [word]: {
            ...currentStats,
            attempts: currentStats.attempts + 1,
            correct: currentStats.correct + (isCorrect ? 1 : 0)
          }
        }
      };
    });
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === currentQuestion.spellingWord;
    updateWordStats(currentQuestion.spellingWord, isCorrect);
    
    setGameState(prev => ({
      ...prev,
      results: [...prev.results, isCorrect],
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      selectedAnswer: null
    }));

    if (currentQuestionIndex >= questionOrder.length - 1) {
      setShowResults(true);
    }
  };

  const startNewGame = (missedWordsOnly: boolean = false) => {
    const wordsToUse = missedWordsOnly 
      ? questionOrder.filter((_, index) => !results[index])
      : shuffleArray([...questionOrder]);

    setGameState({
      currentQuestionIndex: 0,
      results: [],
      selectedAnswer: null,
      randomizedAnswers: wordsToUse.map(question => 
        [...question.commonMispellings, question.spellingWord].sort(() => Math.random() - 0.5)
      ),
      wordStats: gameState.wordStats, // Preserve statistics
      questionOrder: wordsToUse
    });
    setShowResults(false);
  };

  const resetAllProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ERRORS_KEY);
    setGameState(getInitialGameState());
    setErrors([]);
    setShowResults(false);
  };

  const markAsError = () => {
    setErrors(prev => [...prev, currentQuestion.spellingWord]);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <button
        onClick={resetAllProgress}
        className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
      >
        Reset Progress
      </button>
      <button
        onClick={() => setViewErrors(!viewErrors)}
        className="absolute top-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
      >
        {viewErrors ? 'Back to Quiz' : 'View Errors'}
      </button>
      
      {viewErrors ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Words with Problems</h2>
          <ul className="list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index} className="text-lg">{error}</li>
            ))}
          </ul>
        </div>
      ) : !showResults ? (
        <Question
          question={currentQuestion}
          answers={currentAnswers}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          onNext={handleNext}
        />
      ) : (
        <Result 
          resultData={resultData}
          wordStats={wordStats}
          onRetryAll={() => startNewGame(false)}
          onRetryMissed={() => startNewGame(true)}
        />
      )}

      {!viewErrors && !showResults && (
        <button
          onClick={markAsError}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Mark as Error
        </button>
      )}
    </div>
  );
};

export default App;
