import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import SidebarComponent from '../../components/layout/Sidebar';
import SessionList from '../../components/chat/SessionList';
import { useChatStore } from '../../stores/chat/ChatStore';

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

const QuizSession: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    sessions,
    isSidebarOpen,
    currentMessages,
    loadSession,
    loadSessions,
    setSidebarOpen,
    setError,
  } = useChatStore();

  // Load session when sessionId changes
  useEffect(() => {
    if (!sessionId) {
      navigate('/new-quiz');
      return;
    }

    loadSession(sessionId).catch(() => navigate('/new-quiz'));
  }, [sessionId, loadSession, navigate]);

  // Parse quiz data from messages
  useEffect(() => {
    if (!currentMessages || currentMessages.length < 2) {
      return;
    }

    try {
      const aiMessage = currentMessages
        .slice()
        .reverse()
        .find((msg) => msg.role === 'assistant');

      if (!aiMessage) {
        throw new Error('No AI response found');
      }

      let parsedData;
      try {
        parsedData = JSON.parse(aiMessage.content);
      } catch {
        const jsonMatch = aiMessage.content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Invalid response format from AI');
        }
      }

      setQuizData(parsedData);
    } catch (error) {
      console.error('Failed to parse quiz data:', error);
      setError('Failed to load quiz from session');
    }
  }, [currentMessages, setError]);

  // Load sessions for sidebar
  useEffect(() => {
    loadSessions(true, 'quiz');
  }, [loadSessions]);

  const handleAnswerSelect = (answer: string) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestionIndex]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quizData?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate a brief delay for submission
    setTimeout(() => {
      setShowResults(true);
      setIsSubmitting(false);
    }, 500);
  };

  const calculateScore = () => {
    if (!quizData) return { correct: 0, total: 0, percentage: 0 };

    const correct = quizData.questions.filter(
      (q) =>
        userAnswers[q.id - 1]?.toLowerCase() === q.correctAnswer.toLowerCase(),
    ).length;

    const total = quizData.questions.length;
    const percentage = Math.round((correct / total) * 100);

    return { correct, total, percentage };
  };

  const handleSessionClick = (sessionId: string) => {
    navigate(`/quiz/${sessionId}`);
  };

  const handleNewQuiz = () => {
    navigate('/new-quiz');
  };

  // Show loading state if quiz not loaded yet
  if (!quizData) {
    return (
      <div className="min-h-[calc(100vh-69px)] flex flex-col">
        <SidebarComponent
          title="Quiz History"
          isOpen={isSidebarOpen}
          onToggle={() => setSidebarOpen(!isSidebarOpen)}
          headerHeight={69}
        >
          <SessionList
            sessions={sessions}
            onNewChat={handleNewQuiz}
            onSessionClick={handleSessionClick}
          />
        </SidebarComponent>

        <div className="flex-1 flex items-center justify-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const currentAnswer = userAnswers[currentQuestionIndex];
  const score = calculateScore();

  // Results View
  if (showResults) {
    return (
      <div className="min-h-[calc(100vh-69px)] flex flex-col">
        <SidebarComponent
          title="Quiz History"
          isOpen={isSidebarOpen}
          onToggle={() => setSidebarOpen(!isSidebarOpen)}
          headerHeight={69}
        >
          <SessionList
            sessions={sessions}
            currentSessionId={sessionId}
            onNewChat={handleNewQuiz}
            onSessionClick={handleSessionClick}
          />
        </SidebarComponent>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-3xl">
            <div className="bg-base-200 rounded-lg shadow-xl p-8 border border-base-300">
              <h1 className="text-3xl font-bold text-center mb-6">
                Quiz Results
              </h1>

              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-primary mb-2">
                  {score.percentage}%
                </div>
                <p className="text-lg text-base-content/70">
                  You got {score.correct} out of {score.total} questions correct
                </p>
              </div>

              <div className="space-y-4 mb-6">
                {quizData.questions.map((question, index) => {
                  const isCorrect =
                    userAnswers[index]?.toLowerCase() ===
                    question.correctAnswer.toLowerCase();
                  const wasAnswered = userAnswers[index] !== undefined;

                  return (
                    <div
                      key={question.id}
                      className={`p-4 rounded-lg border-2 ${
                        isCorrect
                          ? 'bg-success/10 border-success'
                          : wasAnswered
                          ? 'bg-error/10 border-error'
                          : 'bg-base-300 border-base-content/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {wasAnswered &&
                          (isCorrect ? (
                            <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                          ) : (
                            <XCircle className="w-6 h-6 text-error flex-shrink-0 mt-1" />
                          ))}
                        <div className="flex-1">
                          <p className="font-medium mb-2">
                            {index + 1}. {question.question}
                          </p>
                          {wasAnswered && (
                            <>
                              <p className="text-sm mb-1">
                                <span className="font-medium">
                                  Your answer:
                                </span>{' '}
                                <span
                                  className={
                                    isCorrect ? 'text-success' : 'text-error'
                                  }
                                >
                                  {userAnswers[index]}
                                </span>
                              </p>
                              {!isCorrect && (
                                <p className="text-sm mb-1">
                                  <span className="font-medium">
                                    Correct answer:
                                  </span>{' '}
                                  <span className="text-success">
                                    {question.correctAnswer}
                                  </span>
                                </p>
                              )}
                              {question.explanation && (
                                <p className="text-sm text-base-content/70 mt-2">
                                  {question.explanation}
                                </p>
                              )}
                            </>
                          )}
                          {!wasAnswered && (
                            <p className="text-sm text-base-content/50">
                              Not answered
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowResults(false);
                    setCurrentQuestionIndex(0);
                    setUserAnswers({});
                  }}
                  className="btn btn-outline btn-primary"
                >
                  Retake Quiz
                </button>
                <button onClick={handleNewQuiz} className="btn btn-primary">
                  New Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Taking View
  return (
    <div className="min-h-[calc(100vh-69px)] flex flex-col">
      <SidebarComponent
        title="Quiz History"
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
        headerHeight={69}
      >
        <SessionList
          sessions={sessions}
          currentSessionId={sessionId}
          onNewChat={handleNewQuiz}
          onSessionClick={handleSessionClick}
        />
      </SidebarComponent>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="bg-base-200 rounded-lg shadow-xl p-8 border border-base-300">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-base-content/60 mb-2">
                <span>
                  Question {currentQuestionIndex + 1} of{' '}
                  {quizData.questions.length}
                </span>
                <span>{Object.keys(userAnswers).length} answered</span>
              </div>
              <progress
                className="progress progress-primary w-full"
                value={currentQuestionIndex + 1}
                max={quizData.questions.length}
              ></progress>
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold mb-6">
              {currentQuestion.question}
            </h2>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.type === 'multipleChoice' &&
                currentQuestion.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      currentAnswer === option
                        ? 'border-primary bg-primary/10'
                        : 'border-base-content/20 hover:border-primary/50 hover:bg-base-100'
                    }`}
                  >
                    <span className="font-medium">
                      {String.fromCharCode(65 + index)}.
                    </span>{' '}
                    {option}
                  </button>
                ))}

              {currentQuestion.type === 'trueFalse' && (
                <>
                  <button
                    onClick={() => handleAnswerSelect('True')}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      currentAnswer === 'True'
                        ? 'border-primary bg-primary/10'
                        : 'border-base-content/20 hover:border-primary/50 hover:bg-base-100'
                    }`}
                  >
                    True
                  </button>
                  <button
                    onClick={() => handleAnswerSelect('False')}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      currentAnswer === 'False'
                        ? 'border-primary bg-primary/10'
                        : 'border-base-content/20 hover:border-primary/50 hover:bg-base-100'
                    }`}
                  >
                    False
                  </button>
                </>
              )}

              {currentQuestion.type === 'shortAnswer' && (
                <textarea
                  value={currentAnswer || ''}
                  onChange={(e) => handleAnswerSelect(e.target.value)}
                  placeholder="Type your answer here..."
                  className="textarea textarea-bordered w-full h-24 bg-base-100"
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="btn btn-outline"
              >
                Previous
              </button>

              <div className="flex gap-2">
                {quizData.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-8 h-8 rounded-full text-xs font-medium ${
                      index === currentQuestionIndex
                        ? 'bg-primary text-primary-content'
                        : userAnswers[index]
                        ? 'bg-success/20 text-success'
                        : 'bg-base-300 text-base-content/50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {currentQuestionIndex === quizData.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    'Submit Quiz'
                  )}
                </button>
              ) : (
                <button onClick={handleNext} className="btn btn-primary">
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSession;
