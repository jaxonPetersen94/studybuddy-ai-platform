import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import SidebarComponent from '../../components/layout/Sidebar';
import { useChatStore } from '../../stores/ChatStore';
import { formatTimestamp } from '../../utils/dateUtils';
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
    sendMessage,
    loadSession,
    loadSessions,
    setUserText,
    handleCopyMessage,
    handleLikeMessage,
    handleDislikeMessage,
    handleRegenerateMessage,
  } = useChatStore();

  const [sidebarOpen, setSidebarOpen] = React.useState(false);

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
    loadSessions();
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
    setSidebarOpen(false);
  };

  // Show loading state while session is loading
  if (!currentSession && sessionId) {
    return (
      <div className="min-h-[calc(100vh-69px)] flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-69px)] flex flex-col">
      {/* Sidebar */}
      <SidebarComponent
        title="Chat History"
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        headerHeight={69}
      >
        <SessionList
          sessions={sessions}
          currentSessionId={currentSession?.id}
          onNewChat={handleNewChat}
          onSessionClick={handleSessionClick}
        />
      </SidebarComponent>

      {/* Chat Header */}
      <div className="border-b border-base-300/50 bg-base-100/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleNewChat}
                className="btn btn-ghost btn-sm flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>New Chat</span>
              </button>
              {currentSession && (
                <div className="hidden sm:block">
                  <h1 className="font-semibold text-base-content truncate max-w-md">
                    {currentSession.title}
                  </h1>
                  <p className="text-xs text-base-content/60">
                    {formatTimestamp(currentSession.created_at)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
  );
};

export default ChatSession;
