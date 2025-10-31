import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SidebarComponent from '../../components/layout/Sidebar';
import Drawer from '../../components/layout/Drawer';
import SessionList from '../../components/chat/SessionList';
import QuizPaper from '../../components/quiz/QuizPaper';
import QuizProgress from '../../components/quiz/QuizProgress';
import QuizQuestion from '../../components/quiz/QuizQuestion';
import QuizNavigation from '../../components/quiz/QuizNavigation';
import QuizResults from '../../components/quiz/QuizResults';
import { useChatStore } from '../../stores/chat/ChatStore';

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
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

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

      // Validate the parsed data has the required structure
      if (!parsedData || !Array.isArray(parsedData.questions)) {
        throw new Error('Invalid quiz data structure');
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

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      const large = window.innerWidth >= 1024;
      setIsLargeScreen(large);
      // Close sidebar on mobile when transitioning from large to small screen
      if (!large && isSidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen, setSidebarOpen]);

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

  const handleRetake = () => {
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
  };

  const handleNewQuiz = () => {
    navigate('/new-quiz');
  };

  const handleSessionClick = (sessionId: string) => {
    // Close drawer on mobile when navigating to a session
    if (!isLargeScreen) {
      setSidebarOpen(false);
    }
    navigate(`/quiz/${sessionId}`);
  };

  const allQuestionsAnswered = quizData?.questions?.length
    ? Object.keys(userAnswers).length === quizData.questions.length
    : false;

  const sessionListContent = (
    <SessionList
      sessions={sessions}
      currentSessionId={sessionId}
      onCreateNew={handleNewQuiz}
      onSessionClick={handleSessionClick}
      sessionType="quiz"
    />
  );

  // Show loading state if quiz not loaded yet
  if (!quizData) {
    return (
      <div className="min-h-[calc(100vh-69px)] flex flex-col">
        {/* Sidebar for large screens */}
        {isLargeScreen && (
          <SidebarComponent
            title="Quiz History"
            isOpen={isSidebarOpen}
            onToggle={() => setSidebarOpen(!isSidebarOpen)}
            headerHeight={69}
          >
            {sessionListContent}
          </SidebarComponent>
        )}

        {/* Drawer for small screens */}
        {!isLargeScreen && (
          <Drawer
            isOpen={isSidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onOpen={() => setSidebarOpen(true)}
            headerHeight={69}
            title="Quiz History"
          >
            {sessionListContent}
          </Drawer>
        )}

        <div className="flex-1 flex items-center justify-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const currentAnswer = userAnswers[currentQuestionIndex];

  // Results View
  if (showResults) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-69px)] relative">
        {/* Sidebar for large screens */}
        {isLargeScreen && (
          <SidebarComponent
            title="Quiz History"
            isOpen={isSidebarOpen}
            onToggle={() => setSidebarOpen(!isSidebarOpen)}
            headerHeight={69}
          >
            {sessionListContent}
          </SidebarComponent>
        )}

        {/* Drawer for small screens */}
        {!isLargeScreen && (
          <Drawer
            isOpen={isSidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onOpen={() => setSidebarOpen(true)}
            headerHeight={69}
            title="Quiz History"
          >
            {sessionListContent}
          </Drawer>
        )}

        <QuizResults
          quizData={quizData}
          userAnswers={userAnswers}
          onRetake={handleRetake}
          onNewQuiz={handleNewQuiz}
        />
      </div>
    );
  }

  // Quiz Taking View
  return (
    <div className="flex flex-col min-h-[calc(100vh-69px)] relative">
      {/* Sidebar for large screens */}
      {isLargeScreen && (
        <SidebarComponent
          title="Quiz History"
          isOpen={isSidebarOpen}
          onToggle={() => setSidebarOpen(!isSidebarOpen)}
          headerHeight={69}
        >
          {sessionListContent}
        </SidebarComponent>
      )}

      {/* Drawer for small screens */}
      {!isLargeScreen && (
        <Drawer
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpen={() => setSidebarOpen(true)}
          headerHeight={69}
          title="Quiz History"
        >
          {sessionListContent}
        </Drawer>
      )}

      <div className="flex-1 flex items-center justify-center p-6">
        <QuizPaper>
          <QuizProgress
            currentQuestion={currentQuestionIndex}
            totalQuestions={quizData.questions.length}
            answeredCount={Object.keys(userAnswers).length}
          />

          <QuizQuestion
            question={currentQuestion}
            currentAnswer={currentAnswer}
            onAnswerSelect={handleAnswerSelect}
          />

          <QuizNavigation
            currentIndex={currentQuestionIndex}
            totalQuestions={quizData.questions.length}
            userAnswers={userAnswers}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit}
            onQuestionJump={setCurrentQuestionIndex}
            isSubmitting={isSubmitting}
            allQuestionsAnswered={allQuestionsAnswered}
          />
        </QuizPaper>
      </div>
    </div>
  );
};

export default QuizSession;
