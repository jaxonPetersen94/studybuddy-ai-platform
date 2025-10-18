import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import SidebarComponent from '../../components/layout/Sidebar';
import SessionList from '../../components/chat/SessionList';
import FlashCard from '../../components/flashcards/FlashCard';
import { useChatStore } from '../../stores/chat/ChatStore';
import { Flashcard } from '../../types/chatTypes';

const FlashCardsSession: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [currentFlashcards, setCurrentFlashcards] = useState<Flashcard[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  const {
    sessions,
    isSidebarOpen,
    currentMessages,
    currentFlashcardIndex,
    isFlashcardsFlipped,
    loadSession,
    loadSessions,
    setSidebarOpen,
    setCurrentFlashcardIndex,
    setIsFlashcardsFlipped,
    resetFlashcardsState,
    setError,
  } = useChatStore();

  // Load session when sessionId changes
  useEffect(() => {
    if (!sessionId) {
      navigate('/new-flashcards');
      return;
    }

    loadSession(sessionId).catch(() => navigate('/new-flashcards'));
  }, [sessionId, loadSession, navigate]);

  // Parse flashcards when currentMessages updates
  useEffect(() => {
    if (!currentMessages || currentMessages.length < 2) {
      return;
    }

    try {
      let flashcardsData;
      const aiMessage = currentMessages
        .slice()
        .reverse()
        .find((msg) => msg.role === 'assistant');

      if (!aiMessage) {
        console.error('No AI message found in:', currentMessages);
        throw new Error('No AI response found');
      }

      try {
        flashcardsData = JSON.parse(aiMessage.content);
      } catch {
        const jsonMatch = aiMessage.content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          flashcardsData = JSON.parse(jsonMatch[1]);
        } else {
          console.error('Failed to parse AI content:', aiMessage.content);
          throw new Error('Invalid response format from AI');
        }
      }

      setCurrentFlashcards(flashcardsData.flashcards || []);
      setCurrentFlashcardIndex(0);
      setIsFlashcardsFlipped(false);
    } catch (error) {
      console.error('Failed to parse flashcards:', error);
      console.error('currentMessages:', currentMessages);
      setError('Failed to load flashcards from session');
    }
  }, [
    currentMessages,
    setError,
    setCurrentFlashcardIndex,
    setIsFlashcardsFlipped,
  ]);

  // Load sessions for sidebar
  useEffect(() => {
    loadSessions(true, 'flashcards');
  }, [loadSessions]);

  const currentCard = currentFlashcards[currentFlashcardIndex];

  const handleFlipCard = () => {
    if (!isTransitioning) {
      setIsFlashcardsFlipped(!isFlashcardsFlipped);
    }
  };

  const handleNextCard = () => {
    if (isTransitioning) return;

    if (!isFlashcardsFlipped) {
      // If the card is showing front, flip it first
      setIsFlashcardsFlipped(true);
    } else if (currentFlashcardIndex < currentFlashcards.length - 1) {
      // If already flipped, flip back first, then change card at midpoint
      setIsTransitioning(true);
      setIsFlashcardsFlipped(false);

      // Change card at midpoint of flip animation (300ms = half of 600ms)
      setTimeout(() => {
        setCurrentFlashcardIndex(currentFlashcardIndex + 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handlePrevCard = () => {
    if (isTransitioning || currentFlashcardIndex === 0) return;

    setIsTransitioning(true);

    // If showing back, flip to front first
    if (isFlashcardsFlipped) {
      setIsFlashcardsFlipped(false);
      setTimeout(() => {
        setCurrentFlashcardIndex(currentFlashcardIndex - 1);
        setIsTransitioning(false);
      }, 300);
    } else {
      // If showing front, just change card
      setCurrentFlashcardIndex(currentFlashcardIndex - 1);
      setIsTransitioning(false);
    }
  };

  const handleSessionClick = (sessionId: string) =>
    navigate(`/flashcards/${sessionId}`);

  const handleNewSet = () => {
    resetFlashcardsState();
    navigate('/new-flashcards');
  };

  // Show loading state if flashcards not loaded yet
  if (!currentCard) {
    return (
      <div className="min-h-[calc(100vh-69px)] flex flex-col">
        <SidebarComponent
          title="Flashcard History"
          isOpen={isSidebarOpen}
          onToggle={() => setSidebarOpen(!isSidebarOpen)}
          headerHeight={69}
        >
          <SessionList
            sessions={sessions}
            onCreateNew={handleNewSet}
            onSessionClick={handleSessionClick}
            sessionType="flashcards"
          />
        </SidebarComponent>

        <div className="flex-1 flex items-center justify-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-69px)] flex flex-col">
      <SidebarComponent
        title="Flashcard History"
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
        headerHeight={69}
      >
        <SessionList
          sessions={sessions}
          currentSessionId={sessionId}
          onCreateNew={handleNewSet}
          onSessionClick={handleSessionClick}
          sessionType="flashcards"
        />
      </SidebarComponent>

      <div className="flex-1 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center">
            <p className="text-sm text-base-content/60">
              Card {currentFlashcardIndex + 1} of {currentFlashcards.length}
            </p>
          </div>

          <FlashCard
            front={currentCard.front}
            back={currentCard.back}
            isFlipped={isFlashcardsFlipped}
            onClick={handleFlipCard}
          />

          <div className="flex justify-between items-center gap-4">
            <button
              className="btn btn-outline btn-primary"
              onClick={handlePrevCard}
              disabled={currentFlashcardIndex === 0 || isTransitioning}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <button
              className="btn btn-outline btn-secondary"
              onClick={handleFlipCard}
              disabled={isTransitioning}
            >
              <RotateCw className="w-5 h-5" />
              Flip
            </button>

            <button
              className="btn btn-outline btn-primary"
              onClick={handleNextCard}
              disabled={
                currentFlashcardIndex === currentFlashcards.length - 1 ||
                isTransitioning
              }
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCardsSession;
