import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import QuizPaper from './QuizPaper';

interface QuizQuestion {
  id: number;
  type: 'multipleChoice' | 'trueFalse' | 'shortAnswer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

interface QuizData {
  questions: QuizQuestion[];
  title: string;
  difficulty: string;
}

interface QuizResultsProps {
  quizData: QuizData;
  userAnswers: Record<number, string>;
  onRetake: () => void;
  onNewQuiz: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  quizData,
  userAnswers,
  onRetake,
  onNewQuiz,
}) => {
  const calculateScore = () => {
    const correct = quizData.questions.filter(
      (q) =>
        userAnswers[q.id - 1]?.toLowerCase() === q.correctAnswer.toLowerCase(),
    ).length;

    const total = quizData.questions.length;
    const percentage = Math.round((correct / total) * 100);

    return { correct, total, percentage };
  };

  const score = calculateScore();

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <QuizPaper>
        {/* Header - fixed at top */}
        <div className="flex-shrink-0 text-center mb-6">
          <h1 className="text-3xl font-bold mb-4">Quiz Results</h1>
          <div className="text-6xl font-bold text-primary mb-2">
            {score.percentage}%
          </div>
          <p className="text-base text-base-content/70">
            You got {score.correct} out of {score.total} questions correct
          </p>
        </div>

        {/* Results list - scrollable */}
        <div className="flex-1 overflow-y-auto mb-6 min-h-0">
          <div className="space-y-3">
            {quizData.questions.map((question, index) => {
              const isCorrect =
                userAnswers[index]?.toLowerCase() ===
                question.correctAnswer.toLowerCase();
              const wasAnswered = userAnswers[index] !== undefined;

              return (
                <div
                  key={question.id}
                  className={`p-3 rounded-lg border-2 ${
                    isCorrect
                      ? 'bg-success/10 border-success'
                      : wasAnswered
                      ? 'bg-error/10 border-error'
                      : 'bg-base-300 border-base-content/20'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {wasAnswered &&
                      (isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                      ))}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm mb-2">
                        {index + 1}. {question.question}
                      </p>
                      {wasAnswered && (
                        <>
                          <p className="text-xs mb-1">
                            <span className="font-medium">Your answer:</span>{' '}
                            <span
                              className={
                                isCorrect ? 'text-success' : 'text-error'
                              }
                            >
                              {userAnswers[index]}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="text-xs mb-1">
                              <span className="font-medium">
                                Correct answer:
                              </span>{' '}
                              <span className="text-success">
                                {question.correctAnswer}
                              </span>
                            </p>
                          )}
                          {question.explanation && (
                            <p className="text-xs text-base-content/70 mt-2">
                              {question.explanation}
                            </p>
                          )}
                        </>
                      )}
                      {!wasAnswered && (
                        <p className="text-xs text-base-content/50">
                          Not answered
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons - fixed at bottom */}
        <div className="flex-shrink-0 flex gap-3 justify-center">
          <button
            onClick={onRetake}
            className="btn btn-outline btn-primary btn-sm"
          >
            Retake Quiz
          </button>
          <button onClick={onNewQuiz} className="btn btn-primary btn-sm">
            New Quiz
          </button>
        </div>
      </QuizPaper>
    </div>
  );
};

export default QuizResults;
