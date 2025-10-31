import React from 'react';

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredCount: number;
}

const QuizProgress: React.FC<QuizProgressProps> = ({
  currentQuestion,
  totalQuestions,
  answeredCount,
}) => {
  return (
    <div className="mb-6 flex-shrink-0">
      <div className="flex justify-between text-sm text-base-content/60 mb-2">
        <span>
          Question {currentQuestion + 1} of {totalQuestions}
        </span>
        <span>{answeredCount} answered</span>
      </div>
      <progress
        className="progress progress-primary w-full"
        value={currentQuestion + 1}
        max={totalQuestions}
      ></progress>
    </div>
  );
};

export default QuizProgress;
