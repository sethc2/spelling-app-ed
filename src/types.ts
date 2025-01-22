export interface WordStats {
  word: string;
  attempts: number;
  correct: number;
}

export interface GameState {
  currentQuestionIndex: number;
  results: boolean[];
  selectedAnswer: string | null;
  randomizedAnswers: string[][];
  wordStats: { [key: string]: WordStats };
  questionOrder: Array<{
    spellingWord: string;
    commonMispellings: string[];
  }>;
}
