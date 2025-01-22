import React from 'react';
import { WordStats } from './types';

interface ResultData {
  correctAnswers: number;
  words: Array<{ word: string; correct: boolean }>;
  hasIncorrectAnswers: boolean;
  total: number;
}

interface ResultProps {
  resultData: ResultData;
  wordStats: { [key: string]: WordStats };
  onRetryAll: () => void;
  onRetryMissed: () => void;
}

const Result: React.FC<ResultProps> = ({ 
  resultData: { correctAnswers, words, hasIncorrectAnswers, total },
  wordStats,
  onRetryAll,
  onRetryMissed
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
      <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
      <p className="text-xl mb-4">
        You got {correctAnswers} out of {total} correct!
      </p>
      
      <div className="border rounded-lg max-h-48 overflow-y-auto mb-4">
        <div className="divide-y">
          {words.map(({ word, correct }, index) => {
            const stats = wordStats[word];
            return (
              <div 
                key={index}
                className="p-2 flex justify-between items-center hover:bg-gray-50"
              >
                <div className="flex flex-col items-start">
                  <span className="text-lg">{word}</span>
                  {stats && (
                    <span className="text-xs text-gray-500">
                      All-time: {stats.correct}/{stats.attempts} correct
                    </span>
                  )}
                </div>
                <span className={correct ? 'text-green-500' : 'text-red-500'}>
                  {correct ? '✓' : '✗'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {hasIncorrectAnswers && (
          <button
            onClick={onRetryMissed}
            className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
          >
            Retry Missed Words
          </button>
        )}
        <button
          onClick={onRetryAll}
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          Try All Words Again
        </button>
      </div>
    </div>
  );
};

export default Result;
