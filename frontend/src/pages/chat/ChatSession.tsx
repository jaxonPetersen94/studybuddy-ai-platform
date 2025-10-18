import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import SidebarComponent from '../../components/layout/Sidebar';
import Drawer from '../../components/layout/Drawer';
import { useChatStore } from '../../stores/chat/ChatStore';
import SessionList from '../../components/chat/SessionList';

const ChatSession: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const navigate = useNavigate();

  const {
    currentSession,
    currentMessages,
    sessions,
    userText,
    isSending,
    isSidebarOpen,
    sendMessageStream,
    loadSession,
    loadSessions,
    setUserText,
    setSidebarOpen,
    handleCopyMessage,
    handleLikeMessage,
    handleDislikeMessage,
    handleRegenerateMessage,
  } = useChatStore();

  // Load session when component mounts or sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId).catch(() => {
        // If session doesn't exist, redirect to new chat
        navigate('/new-chat');
      });
    } else {
      navigate('/new-chat');
    }
  }, [sessionId, loadSession, navigate]);

  // Load sessions for sidebar
  useEffect(() => {
    loadSessions(true, 'chat');
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

  const handleSendMessage = async () => {
    if (!userText.trim() || isSending || !currentSession) return;

    try {
      await sendMessageStream({
        content: userText.trim(),
      });
      setUserText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleNewChat = () => {
    // Close drawer on mobile when creating new chat
    if (!isLargeScreen) {
      setSidebarOpen(false);
    }
    navigate('/new-chat');
  };

  const handleSessionClick = (sessionId: string) => {
    // Close drawer on mobile when navigating to a session
    if (!isLargeScreen) {
      setSidebarOpen(false);
    }
    navigate(`/chat/${sessionId}`);
  };

  const sessionListContent = (
    <SessionList
      sessions={sessions}
      currentSessionId={currentSession?.id}
      onCreateNew={handleNewChat}
      onSessionClick={handleSessionClick}
      sessionType="chat"
    />
  );

  // Show loading state while session is loading
  if (!currentSession && sessionId) {
    return (
      <div className="min-h-[calc(100vh-69px)] flex flex-col">
        {/* Sidebar for large screens */}
        {isLargeScreen && (
          <SidebarComponent
            title="Chat History"
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
            title="Chat History"
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

  return (
    <div className="flex flex-col min-h-[calc(100vh-69px)] relative">
      {/* Sidebar for large screens */}
      {isLargeScreen && (
        <SidebarComponent
          title="Chat History"
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
          title="Chat History"
        >
          {sessionListContent}
        </Drawer>
      )}

      {/* Main Content Area - Centered */}
      <div className="flex-1 flex flex-col items-center">
        {/* Chat Messages */}
        <div className="flex-1 w-full overflow-y-auto flex justify-center">
          <div className="w-full max-w-4xl px-6">
            <div className="space-y-4 py-6">
              {currentMessages.map((msg) => (
                <div key={msg.id} className="group">
                  <ChatBubble
                    message={msg.content}
                    role={msg.role}
                    timestamp={msg.created_at}
                    isTyping={msg.isTyping}
                    onCopy={
                      msg.role !== 'user'
                        ? () => handleCopyMessage(msg.content)
                        : undefined
                    }
                    onLike={
                      msg.role !== 'user'
                        ? () => handleLikeMessage(msg.id)
                        : undefined
                    }
                    onDislike={
                      msg.role !== 'user'
                        ? () => handleDislikeMessage(msg.id)
                        : undefined
                    }
                    onRegenerate={
                      msg.role !== 'user'
                        ? () => handleRegenerateMessage(msg.id)
                        : undefined
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-4xl px-6 pb-6">
            <ChatInput
              value={userText}
              onChange={setUserText}
              onSend={handleSendMessage}
              placeholder={
                currentSession?.subject
                  ? `Continue your ${currentSession.subject} conversation...`
                  : 'Type your message...'
              }
              disabled={isSending}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSession;
