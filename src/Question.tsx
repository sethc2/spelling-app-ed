import React, { useState, useEffect } from "react";

const LETTER_HIGHLIGHT_DELAY = 400;

interface QuestionProps {
  question: {
    spellingWord: string;
    commonMispellings: string[];
  };
  answers: string[];
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  onNext: () => void;
}

const Question: React.FC<QuestionProps> = ({
  question,
  answers,
  selectedAnswer,
  onAnswerSelect,
  onNext,
}) => {
  const [highlightedLetterIndex, setHighlightedLetterIndex] =
    useState<number>(-1);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    if (selectedAnswer) {
      setHighlightedLetterIndex(0);
      setIsAnimationComplete(false);
      const wordLength = question.spellingWord.length;

      const interval = setInterval(() => {
        setHighlightedLetterIndex((prev) => {
          if (prev >= wordLength - 1) {
            clearInterval(interval);
            // Wait one more delay, then clear the highlighting
            setTimeout(() => {
              setHighlightedLetterIndex(-1);
              setIsAnimationComplete(true);
            }, LETTER_HIGHLIGHT_DELAY);
            return prev;
          }
          return prev + 1;
        });
      }, LETTER_HIGHLIGHT_DELAY);

      return () => clearInterval(interval);
    } else {
      setHighlightedLetterIndex(-1);
      setIsAnimationComplete(false);
    }
  }, [selectedAnswer, question.spellingWord]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Select the correct spelling:</h2>
      <div
        className={`text-center mb-6 ${
          selectedAnswer ? "visible" : "invisible"
        }`}
        style={{
          display: "inline-block", // Ensure the word behaves as a single unit
          whiteSpace: "nowrap",
          textAlign: "center",
          minHeight: "5em",
          fontSize: "2em", // Set a fixed font size
          lineHeight: 1.2,
          overflow: "hidden",
          height: "3em" // Set a fixed height to prevent resizing
        }}
      >
        {question.spellingWord.split("").map((letter, index) => (
          <span
            key={index}
            className={`inline-block ${
              index === highlightedLetterIndex && !isAnimationComplete
                ? "bg-yellow-200 px-1 mx-0.5 rounded border border-yellow-400"
                : letter === " "
                ? "px-1 mx-1"
                : "px-1"
            }`}
          >
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {answers.map((answer) => (
          <button
            key={answer}
            onClick={() => !selectedAnswer && onAnswerSelect(answer)}
            disabled={selectedAnswer !== null}
            className={`p-2 rounded-lg border ${
              selectedAnswer !== null
                ? answer === question.spellingWord
                  ? "bg-green-500 text-white"
                  : answer === selectedAnswer
                  ? "bg-red-500 text-white"
                  : "bg-gray-200"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {answer}
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <button
          onClick={onNext}
          disabled={selectedAnswer === null}
          className={`bg-blue-500 text-white px-4 py-2 rounded-lg ${
            selectedAnswer === null
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-blue-600"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Question;
