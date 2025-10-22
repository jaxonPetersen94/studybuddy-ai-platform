import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import SidebarComponent from '../../components/layout/Sidebar';
import Drawer from '../../components/layout/Drawer';
import SessionList from '../../components/chat/SessionList';
import QuizPaper from '../../components/quiz/QuizPaper';
import QuizForm from '../../components/quiz/QuizForm';
import { useChatStore } from '../../stores/chat/ChatStore';

const NewQuiz: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('8th Grade');
  const [isPercentage, setIsPercentage] = useState(false);
  const [questionTypes, setQuestionTypes] = useState({
    multipleChoice: { enabled: true, value: 10 },
    trueFalse: { enabled: false, value: 0 },
    shortAnswer: { enabled: false, value: 0 },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const navigate = useNavigate();

  const {
    sessions,
    isSidebarOpen,
    loadSessions,
    setSidebarOpen,
    createSessionAndSendMessage,
    setError,
  } = useChatStore();

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

  const toggleQuestionType = (type: keyof typeof questionTypes) => {
    setQuestionTypes((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        enabled: !prev[type].enabled,
        value: !prev[type].enabled ? prev[type].value : 0,
      },
    }));
  };

  const updateQuestionTypeValue = (
    type: keyof typeof questionTypes,
    value: number,
  ) => {
    if (!isPercentage) {
      const otherTypesTotal = Object.entries(questionTypes)
        .filter(([key, config]) => key !== type && config.enabled)
        .reduce((sum, [_, config]) => sum + config.value, 0);

      const newTotal = otherTypesTotal + value;

      if (newTotal > questionCount) {
        return;
      }
    }

    setQuestionTypes((prev) => ({
      ...prev,
      [type]: { ...prev[type], value },
    }));
  };

  const toggleValueType = () => {
    setIsPercentage((prev) => !prev);
  };

  const calculateQuestionDistribution = () => {
    const enabled = Object.entries(questionTypes).filter(
      ([_, config]) => config.enabled,
    );

    if (enabled.length === 0) return [];

    if (isPercentage) {
      // Calculate counts based on percentages
      const distribution = enabled.map(([type, config]) => ({
        type,
        count: Math.round((config.value / 100) * questionCount),
      }));

      // Adjust for rounding errors to ensure total equals questionCount
      const total = distribution.reduce((sum, item) => sum + item.count, 0);
      if (total !== questionCount && distribution.length > 0) {
        distribution[0].count += questionCount - total;
      }

      return distribution;
    } else {
      // Direct count mode
      return enabled.map(([type, config]) => ({
        type,
        count: config.value,
      }));
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const distribution = calculateQuestionDistribution();
    const totalQuestions = distribution.reduce(
      (sum, item) => sum + item.count,
      0,
    );

    if (totalQuestions === 0) {
      setError('Please select at least one question type');
      return;
    }

    setIsLoading(true);

    try {
      // Build question type instructions
      const typeInstructions = distribution
        .filter((d) => d.count > 0)
        .map((d) => {
          const typeName =
            d.type === 'multipleChoice'
              ? 'Multiple Choice'
              : d.type === 'trueFalse'
              ? 'True/False'
              : 'Short Answer';
          return `${d.count} ${typeName}`;
        })
        .join(', ');

      const { session } = await createSessionAndSendMessage({
        content: inputValue,
        title: `Quiz: ${inputValue.slice(0, 50)}${
          inputValue.length > 50 ? '...' : ''
        }`,
        session_type: 'quiz',
        subject: 'quiz',
        quickAction: 'quiz',
        responseFormat: 'json',
        systemPrompt: `
You are a quiz generator. The user will provide a topic in their message. Respond ONLY with a valid JSON object matching this structure:
{
  "questions": [
    {
      "id": 1,
      "type": "multipleChoice" | "trueFalse" | "shortAnswer",
      "question": "question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "correct answer text",
      "explanation": "optional explanation of the answer"
    }
  ],
  "title": "Quiz about [topic]",
  "difficulty": "${difficulty}"
}

Rules:
- Do NOT include any text before or after the JSON.
- Do NOT include Markdown formatting, code blocks, or explanations.
- Generate exactly ${totalQuestions} questions about: "${inputValue}"
- Question distribution: ${typeInstructions}
- Difficulty level: ${difficulty}
- For multipleChoice questions:
  * Provide exactly 4 options in the "options" array
  * The correctAnswer must match one of the options exactly
- For trueFalse questions:
  * Do NOT include an "options" field
  * The correctAnswer must be exactly "True" or "False"
- For shortAnswer questions:
  * Do NOT include an "options" field
  * The correctAnswer should be a concise, clear answer
- Each question must have a unique id starting from 1
- All questions must be directly related to the topic provided
- Questions should be appropriate for ${difficulty} level
- Include helpful explanations for each answer
`,
      });

      setInputValue('');
      navigate(`/quiz/${session.id}`);
    } catch (error) {
      console.error('Error creating quiz session:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to create quiz',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    // Close drawer on mobile when navigating to a session
    if (!isLargeScreen) {
      setSidebarOpen(false);
    }
    navigate(`/quiz/${sessionId}`);
  };

  const sessionListContent = (
    <SessionList
      sessions={sessions}
      onCreateNew={() => {
        setInputValue('');
        setSidebarOpen(false);
      }}
      onSessionClick={handleSessionClick}
      sessionType="quiz"
      isCreateButtonEnabled={false}
    />
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-69px)]">
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

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <QuizPaper>
          {/* Icon Header - stays at top */}
          <div className="flex justify-center flex-shrink-0">
            <FileText className="w-16 h-16 text-primary" />
          </div>

          {/* Spacer */}
          <div className="flex-grow select-none" />

          {isLoading ? (
            <>
              <div className="flex flex-col items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="text-base-content/70 mt-4">
                  Creating your quiz...
                </p>
              </div>
            </>
          ) : (
            <QuizForm
              inputValue={inputValue}
              questionCount={questionCount}
              difficulty={difficulty}
              isPercentage={isPercentage}
              questionTypes={questionTypes}
              isLoading={isLoading}
              onInputChange={setInputValue}
              onQuestionCountChange={setQuestionCount}
              onDifficultyChange={setDifficulty}
              onToggleValueType={toggleValueType}
              onToggleQuestionType={toggleQuestionType}
              onUpdateQuestionTypeValue={updateQuestionTypeValue}
              onSend={handleSend}
            />
          )}
        </QuizPaper>
      </div>
    </div>
  );
};

export default NewQuiz;
