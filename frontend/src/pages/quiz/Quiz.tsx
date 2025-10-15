import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import ChatInput from '../../components/chat/ChatInput';
import SidebarComponent from '../../components/layout/Sidebar';
import SessionList from '../../components/chat/SessionList';
import { useChatStore } from '../../stores/chat/ChatStore';

const Quiz: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [isPercentage, setIsPercentage] = useState(true);
  const [questionTypes, setQuestionTypes] = useState({
    multipleChoice: { enabled: true, value: 100 },
    trueFalse: { enabled: false, value: 0 },
    shortAnswer: { enabled: false, value: 0 },
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    sessions,
    isSidebarOpen,
    loadSessions,
    setSidebarOpen,
    createSessionAndSendMessageStream,
    setError,
  } = useChatStore();

  useEffect(() => {
    loadSessions(true, 'quiz');
  }, [loadSessions]);

  const toggleQuestionType = (type: keyof typeof questionTypes) => {
    setQuestionTypes((prev) => ({
      ...prev,
      [type]: { ...prev[type], enabled: !prev[type].enabled },
    }));
  };

  const updateQuestionTypeValue = (
    type: keyof typeof questionTypes,
    value: number,
  ) => {
    setQuestionTypes((prev) => ({
      ...prev,
      [type]: { ...prev[type], value },
    }));
  };

  const toggleValueType = () => {
    setIsPercentage((prev) => !prev);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);

    try {
      // Create session and send message with quiz context
      const session = await createSessionAndSendMessageStream({
        content: inputValue,
        title: `Quiz: ${inputValue.slice(0, 50)}${
          inputValue.length > 50 ? '...' : ''
        }`,
        session_type: 'quiz',
        subject: 'quiz',
        quickAction: 'quiz',
      });

      // Clear input
      setInputValue('');

      // Navigate to the chat session
      navigate(`/chat/${session.id}`);
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
    navigate(`/chat/${sessionId}`);
  };

  return (
    <div className="min-h-[calc(100vh-69px)] flex flex-col">
      {/* Sidebar */}
      <SidebarComponent
        title="Chat History"
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
        headerHeight={69}
      >
        <SessionList
          sessions={sessions}
          onNewChat={() => {
            setInputValue('');
            setSidebarOpen(false);
          }}
          onSessionClick={handleSessionClick}
          newChatButtonEnabled={false}
        />
      </SidebarComponent>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        {/* Paper-like Quiz Card */}
        <div className="w-full max-w-xl">
          <div
            className="relative bg-base-200 rounded-lg shadow-2xl p-8 md:p-12 border border-base-300 flex flex-col"
            style={{ aspectRatio: '8.5 / 11' }}
          >
            {/* Wide Ruled Paper Lines */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              {/* Vertical margin line (red line on left) */}
              <div className="absolute top-0 bottom-0 w-px bg-red-400 left-6" />
              {/* Horizontal ruled lines - starting from line 3 to leave space at top */}
              {[...Array(18)].map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 h-px bg-primary/30"
                  style={{ top: `${(i + 3) * 5}%` }}
                />
              ))}
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Icon Header - stays at top */}
              <div className="flex justify-center flex-shrink-0">
                <FileText className="w-16 h-16 text-primary" />
              </div>

              {/* Spacer */}
              <div className="flex-grow select-none" />

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-center text-base-content mb-2 tracking-tight flex-shrink-0 select-text">
                Create Your Quiz
              </h1>

              {/* Description */}
              <p className="text-base text-center text-base-content/70 mb-0 max-w-md mx-auto flex-shrink-0 select-text">
                Set your preferences below and enter a topic to generate a
                personalized quiz.
              </p>

              {/* Spacer */}
              <div className="flex-grow select-none" />

              {/* Configuration Section */}
              <div className="bg-base-100/30 backdrop-blur-sm rounded-lg p-5 mb-0 space-y-4 flex-shrink-0 border border-base-content/5">
                <div className="grid grid-cols-2 gap-3">
                  {/* Number of Questions */}
                  <div>
                    <label className="block text-xs font-medium text-base-content/60 mb-1.5">
                      <span className="select-text cursor-text">
                        Number of Questions
                      </span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="input input-bordered input-sm w-full bg-base-100 border-base-content/10 focus:border-primary/50 focus:outline-none"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Difficulty Level */}
                  <div>
                    <label className="block text-xs font-medium text-base-content/60 mb-1.5">
                      <span className="select-text cursor-text">
                        Difficulty Level
                      </span>
                    </label>
                    <select
                      className="select select-bordered select-sm w-full bg-base-100 border-base-content/10 focus:border-primary/50 focus:outline-none"
                      disabled={isLoading}
                    >
                      <option>Kindergarten</option>
                      <option>1st Grade</option>
                      <option>2nd Grade</option>
                      <option>3rd Grade</option>
                      <option>4th Grade</option>
                      <option>5th Grade</option>
                      <option>6th Grade</option>
                      <option>7th Grade</option>
                      <option selected>8th Grade</option>
                      <option>Freshman (9th)</option>
                      <option>Sophomore (10th)</option>
                      <option>Junior (11th)</option>
                      <option>Senior (12th)</option>
                      <option>Undergraduate</option>
                      <option>Graduate</option>
                    </select>
                  </div>
                </div>

                {/* Question Types */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-base-content/60">
                      <span className="select-text cursor-text">
                        Question Types
                      </span>
                    </label>
                    <button
                      onClick={toggleValueType}
                      className="btn btn-xs btn-ghost min-h-0 h-6 px-2 text-xs hover:bg-base-content/10"
                      disabled={isLoading}
                    >
                      {isPercentage ? 'Percentage' : 'Count'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {/* Multiple Choice */}
                    <div
                      onClick={() =>
                        !isLoading && toggleQuestionType('multipleChoice')
                      }
                      className={`flex items-center gap-3 p-2.5 rounded-lg bg-base-100/40 border border-base-content/5 transition-all hover:bg-base-100/60 hover:border-base-content/10 ${
                        isLoading
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer'
                      } select-none`}
                    >
                      <input
                        type="checkbox"
                        checked={questionTypes.multipleChoice.enabled}
                        onChange={() => {}}
                        className="checkbox checkbox-sm checkbox-primary pointer-events-none flex-shrink-0"
                      />
                      <span className="text-sm flex-1 text-base-content">
                        Multiple Choice
                      </span>
                      <div className="flex items-center justify-end gap-2 w-[5.5rem] h-7">
                        {questionTypes.multipleChoice.enabled && (
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={questionTypes.multipleChoice.value}
                              onChange={(e) =>
                                updateQuestionTypeValue(
                                  'multipleChoice',
                                  Number(e.target.value),
                                )
                              }
                              className="input input-bordered input-sm w-16 h-7 bg-base-100 border-base-content/20 text-center focus:border-primary focus:outline-none tabular-nums px-2 py-0"
                              disabled={isLoading}
                            />
                            <span className="text-sm text-base-content/50 font-medium w-4">
                              {isPercentage ? '%' : '#'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* True/False */}
                    <div
                      onClick={() =>
                        !isLoading && toggleQuestionType('trueFalse')
                      }
                      className={`flex items-center gap-3 p-2.5 rounded-lg bg-base-100/40 border border-base-content/5 transition-all hover:bg-base-100/60 hover:border-base-content/10 ${
                        isLoading
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer'
                      } select-none`}
                    >
                      <input
                        type="checkbox"
                        checked={questionTypes.trueFalse.enabled}
                        onChange={() => {}}
                        className="checkbox checkbox-sm checkbox-primary pointer-events-none flex-shrink-0"
                      />
                      <span className="text-sm flex-1 text-base-content">
                        True/False
                      </span>
                      <div className="flex items-center justify-end gap-2 w-[5.5rem] h-7">
                        {questionTypes.trueFalse.enabled && (
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={questionTypes.trueFalse.value}
                              onChange={(e) =>
                                updateQuestionTypeValue(
                                  'trueFalse',
                                  Number(e.target.value),
                                )
                              }
                              className="input input-bordered input-sm w-16 h-7 bg-base-100 border-base-content/20 text-center focus:border-primary focus:outline-none tabular-nums px-2 py-0"
                              disabled={isLoading}
                            />
                            <span className="text-sm text-base-content/50 font-medium w-4">
                              {isPercentage ? '%' : '#'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Short Answer */}
                    <div
                      onClick={() =>
                        !isLoading && toggleQuestionType('shortAnswer')
                      }
                      className={`flex items-center gap-3 p-2.5 rounded-lg bg-base-100/40 border border-base-content/5 transition-all hover:bg-base-100/60 hover:border-base-content/10 ${
                        isLoading
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer'
                      } select-none`}
                    >
                      <input
                        type="checkbox"
                        checked={questionTypes.shortAnswer.enabled}
                        onChange={() => {}}
                        className="checkbox checkbox-sm checkbox-primary pointer-events-none flex-shrink-0"
                      />
                      <span className="text-sm flex-1 text-base-content">
                        Short Answer
                      </span>
                      <div className="flex items-center justify-end gap-2 w-[5.5rem] h-7">
                        {questionTypes.shortAnswer.enabled && (
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={questionTypes.shortAnswer.value}
                              onChange={(e) =>
                                updateQuestionTypeValue(
                                  'shortAnswer',
                                  Number(e.target.value),
                                )
                              }
                              className="input input-bordered input-sm w-16 h-7 bg-base-100 border-base-content/20 text-center focus:border-primary focus:outline-none tabular-nums px-2 py-0"
                              disabled={isLoading}
                            />
                            <span className="text-sm text-base-content/50 font-medium w-4">
                              {isPercentage ? '%' : '#'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spacer */}
              <div className="flex-grow select-none" />

              {/* Chat Input - stays at bottom */}
              <div className="flex-shrink-0">
                <ChatInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={handleSend}
                  placeholder="What topic should we create a quiz for?"
                  disabled={isLoading}
                />
              </div>

              {/* Loading Indicator */}
              {isLoading && (
                <div className="mt-4 text-center">
                  <span className="loading loading-spinner loading-md text-primary"></span>
                  <p className="text-sm text-base-content/60 mt-2">
                    Creating your quiz...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
