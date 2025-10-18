import React, { useState, useEffect } from 'react';
import { SquareStack } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatInput from '../../components/chat/ChatInput';
import SidebarComponent from '../../components/layout/Sidebar';
import Drawer from '../../components/layout/Drawer';
import SessionList from '../../components/chat/SessionList';
import FlashCard from '../../components/flashcards/FlashCard';
import { useChatStore } from '../../stores/chat/ChatStore';

const NewFlashCards: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const navigate = useNavigate();

  const {
    sessions,
    isSidebarOpen,
    loadSessions,
    setSidebarOpen,
    setError,
    createSessionAndSendMessage,
    flashcardsInput,
    setFlashcardsInput,
  } = useChatStore();

  useEffect(() => {
    loadSessions(true, 'flashcards');
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

  const handleGenerateFlashcards = async () => {
    if (!flashcardsInput.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const { session } = await createSessionAndSendMessage({
        content: flashcardsInput,
        title: `${flashcardsInput.slice(0, 50)}${
          flashcardsInput.length > 50 ? '...' : ''
        }`,
        session_type: 'flashcards',
        subject: 'flashcards',
        quickAction: 'flashcards',
        responseFormat: 'json',
        systemPrompt: `
You are a flashcard generator. The user will provide a topic in their message. Respond ONLY with a valid JSON object matching this structure:
{
  "flashcards": [
    { "front": "question or term", "back": "answer or definition" }
  ]
}

Rules:
- Do NOT include any text before or after the JSON.
- Do NOT include Markdown formatting, code blocks, or explanations.
- Generate 8–12 concise, educational flashcards about the EXACT topic the user specifies in their message.
- The flashcards MUST be directly related to what the user asked for.
`,
      });

      setFlashcardsInput('');
      navigate(`/flashcards/${session.id}`);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to generate flashcards',
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
    navigate(`/flashcards/${sessionId}`);
  };

  const sessionListContent = (
    <SessionList
      sessions={sessions}
      onCreateNew={() => setFlashcardsInput('')}
      onSessionClick={handleSessionClick}
      sessionType="flashcards"
      isCreateButtonEnabled={false}
    />
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-69px)]">
      {/* Sidebar for large screens */}
      {isLargeScreen && (
        <SidebarComponent
          title="Flashcard History"
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
          title="Flash Card History"
        >
          {sessionListContent}
        </Drawer>
      )}

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <FlashCard className="mb-5" showLinedBackground>
            <div className="flex justify-center">
              <SquareStack className="w-16 h-16 text-secondary" />
            </div>

            {isLoading ? (
              <>
                <div className="flex flex-col items-center justify-center mt-4">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                  <p className="text-base-content/70 mt-4">
                    Creating your flash cards...
                  </p>
                </div>

                <br></br>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-3xl sm:text-4xl font-bold text-base-content mb-3 tracking-tight select-text">
                    Create Your Flash Cards
                  </h1>

                  <p className="text-sm sm:text-base text-center text-base-content/70 max-w-2xl mx-auto select-text">
                    Describe what you'd like to study and we'll generate
                    personalized flashcards powered by AI.
                  </p>
                </div>

                <ChatInput
                  value={flashcardsInput}
                  onChange={setFlashcardsInput}
                  onSend={handleGenerateFlashcards}
                  placeholder="What topic should we create flash cards for?"
                  disabled={isLoading}
                />
              </>
            )}
          </FlashCard>
        </div>
      </div>
    </div>
  );
};

export default NewFlashCards;
