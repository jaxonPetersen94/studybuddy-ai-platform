import React from 'react';

interface QuizQuestion {
  id: number;
  type: 'multipleChoice' | 'trueFalse' | 'shortAnswer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

interface QuizQuestionProps {
  question: QuizQuestion;
  currentAnswer?: string;
  onAnswerSelect: (answer: string) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  currentAnswer,
  onAnswerSelect,
}) => {
  const getButtonClass = (isSelected: boolean) =>
    `w-full text-left p-4 rounded-lg border-2 transition-all cursor-pointer ${
      isSelected
        ? 'border-primary bg-primary/10'
        : 'border-base-content/20 hover:border-primary/50 hover:bg-base-100'
    }`;

  const renderOptions = () => {
    switch (question.type) {
      case 'multipleChoice':
        return question.options?.map((option, index) => (
          <button
            key={option}
            onClick={() => onAnswerSelect(option)}
            className={getButtonClass(currentAnswer === option)}
          >
            <span className="font-medium">
              {String.fromCharCode(65 + index)}.
            </span>{' '}
            {option}
          </button>
        ));

      case 'trueFalse':
        return ['True', 'False'].map((option) => (
          <button
            key={option}
            onClick={() => onAnswerSelect(option)}
            className={getButtonClass(currentAnswer === option)}
          >
            {option}
          </button>
        ));

      case 'shortAnswer':
        return (
          <textarea
            value={currentAnswer || ''}
            onChange={(e) => onAnswerSelect(e.target.value)}
            placeholder="Type your answer here..."
            className="textarea textarea-bordered w-full h-24 bg-base-100"
          />
        );
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 flex-shrink-0">
        {question.question}
      </h2>

      <div className="flex-1 overflow-y-auto mb-6 min-h-0">
        <div className="space-y-3">{renderOptions()}</div>
      </div>
    </>
  );
};

export default QuizQuestion;
