import React from 'react';
import { ChevronRight } from 'lucide-react';

interface QuizNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  userAnswers: Record<number, string>;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onQuestionJump: (index: number) => void;
  isSubmitting: boolean;
  allQuestionsAnswered: boolean;
}

const QuizNavigation: React.FC<QuizNavigationProps> = ({
  currentIndex,
  totalQuestions,
  userAnswers,
  onPrevious,
  onNext,
  onSubmit,
  onQuestionJump,
  isSubmitting,
  allQuestionsAnswered,
}) => {
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="flex-shrink-0">
      <div className="flex justify-between items-center gap-4 mb-4">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="btn btn-outline btn-sm"
        >
          Previous
        </button>

        <div className="flex gap-2 flex-wrap justify-center">
          {Array.from({ length: totalQuestions }, (_, index) => (
            <button
              key={index}
              onClick={() => onQuestionJump(index)}
              className={`w-8 h-8 rounded-full text-xs font-medium cursor-pointer ${
                index === currentIndex
                  ? 'bg-primary text-primary-content'
                  : userAnswers[index]
                  ? 'bg-success/20 text-success'
                  : 'bg-base-300 text-base-content/50'
              }`}
            >
              <span className="select-none">{index + 1}</span>
            </button>
          ))}
        </div>

        {isLastQuestion ? (
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !allQuestionsAnswered}
            className="btn btn-primary btn-sm"
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              'Submit'
            )}
          </button>
        ) : (
          <button onClick={onNext} className="btn btn-primary btn-sm">
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizNavigation;
