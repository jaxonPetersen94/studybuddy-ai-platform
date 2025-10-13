import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import SidebarComponent from '../../components/layout/Sidebar';
import { useChatStore } from '../../stores/chat/ChatStore';
import SessionList from '../../components/chat/SessionList';

const ChatSession: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const {
    currentSession,
    currentMessages,
    sessions,
    userText,
    isSending,
    isSidebarOpen,
    sendMessage,
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
        navigate('/new');
      });
    } else {
      navigate('/new');
    }
  }, [sessionId]);

  // Load sessions for sidebar
  useEffect(() => {
    loadSessions(true, 'chat');
  }, []);

  const handleSendMessage = async () => {
    if (!userText.trim() || isSending || !currentSession) return;

    try {
      await sendMessage({
        content: userText.trim(),
      });
      setUserText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleNewChat = () => {
    navigate('/new');
  };

  const handleSessionClick = (sessionId: string) => {
    navigate(`/chat/${sessionId}`);
  };

  // Show loading state while session is loading
  if (!currentSession && sessionId) {
    return (
      <div className="min-h-[calc(100vh-69px)] flex flex-col">
        <SidebarComponent
          title="Chat History"
          isOpen={isSidebarOpen}
          onToggle={() => setSidebarOpen(!isSidebarOpen)}
          headerHeight={69}
        >
          <SessionList
            sessions={sessions}
            onNewChat={handleNewChat}
            onSessionClick={handleSessionClick}
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
      {/* Sidebar */}
      <SidebarComponent
        title="Chat History"
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
        headerHeight={69}
      >
        <SessionList
          sessions={sessions}
          currentSessionId={currentSession?.id}
          onNewChat={handleNewChat}
          onSessionClick={handleSessionClick}
        />
      </SidebarComponent>

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
