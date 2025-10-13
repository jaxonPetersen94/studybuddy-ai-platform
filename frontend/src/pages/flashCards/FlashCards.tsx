import React, { useState, useEffect } from 'react';
import { SquareStack } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatInput from '../../components/chat/ChatInput';
import SidebarComponent from '../../components/layout/Sidebar';
import SessionList from '../../components/chat/SessionList';
import { useChatStore } from '../../stores/chat/ChatStore';

const FlashCards = () => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    sessions,
    isSidebarOpen,
    loadSessions,
    setSidebarOpen,
    createSessionAndSend,
    setError,
  } = useChatStore();

  useEffect(() => {
    loadSessions(true, 'flashcards');
  }, [loadSessions]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);

    try {
      // Create session and send message with flashcard context
      const session = await createSessionAndSend({
        content: inputValue,
        title: `Flash Cards: ${inputValue.slice(0, 50)}${
          inputValue.length > 50 ? '...' : ''
        }`,
        session_type: 'flashcards',
        subject: 'flashcards',
        quickAction: 'flashcards',
      });

      // Clear input
      setInputValue('');

      // Navigate to the chat session
      navigate(`/chat/${session.id}`);
    } catch (error) {
      console.error('Error creating flashcard session:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to create flash cards',
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
        {/* Centered Flash Card */}
        <div className="w-full max-w-2xl">
          <div className="relative bg-base-200 rounded-box shadow-2xl p-8 md:p-12 border border-base-300">
            {/* Horizontal Lines Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
              {/* Top pink line */}
              <div
                className="absolute left-0 right-0 h-px bg-pink-400"
                style={{ top: '16.66%' }}
              />
              {/* Remaining lines */}
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 h-px bg-primary/20"
                  style={{ top: `${(i + 3) * 8.33}%` }}
                />
              ))}
            </div>

            {/* Original Content */}
            <div className="relative z-10">
              {/* Icon Header */}
              <div className="flex justify-center mb-4">
                <SquareStack className="w-16 h-16 text-secondary" />
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-center text-base-content mb-3 tracking-tight select-text">
                Create Your Flash Cards
              </h1>

              {/* Description */}
              <p className="text-base text-center text-base-content/70 mb-8 max-w-2xl mx-auto select-text">
                Describe what you'd like to study and we'll generate
                personalized flashcards powered by AI. Perfect for memorization
                and quick review sessions.
              </p>

              {/* Chat Input */}
              <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend}
                placeholder="What topic should we create flash cards for?"
                disabled={isLoading}
              />

              {/* Loading Indicator */}
              {isLoading && (
                <div className="mt-4 text-center">
                  <span className="loading loading-spinner loading-md text-primary"></span>
                  <p className="text-sm text-base-content/60 mt-2">
                    Creating your flash cards...
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

export default FlashCards;
