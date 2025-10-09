import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import ChatInput from '../../components/chat/ChatInput';
import SidebarComponent from '../../components/layout/Sidebar';
import { useChatStore } from '../../stores/chat/ChatStore';
import SessionList from '../../components/chat/SessionList';

const NewChat: React.FC = () => {
  const navigate = useNavigate();

  const {
    sessions,
    userText,
    isSending,
    isSidebarOpen,
    loadSessions,
    setUserText,
    setSidebarOpen,
    createSessionAndSend,
  } = useChatStore();

  useEffect(() => {
    loadSessions();
  }, []);

  const handleSendMessage = async () => {
    if (!userText.trim() || isSending) return;

    try {
      // Create new session and send message
      const newSession = await createSessionAndSend({
        content: userText.trim(),
        title:
          userText.trim().substring(0, 50) +
          (userText.trim().length > 50 ? '...' : ''),
      });

      // Clear the input
      setUserText('');

      // Navigate immediately - the user message is already in the store
      navigate(`/chat/${newSession.id}`);
    } catch (error) {
      console.error('Failed to create chat:', error);
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
            setUserText('');
            setSidebarOpen(false);
          }}
          onSessionClick={handleSessionClick}
          newChatButtonEnabled={false}
        />
      </SidebarComponent>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center py-12 -mt-20">
        <div className="max-w-4xl w-full px-6">
          {/* Header */}
          <div className="text-center mb-10">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <MessageSquare className="w-16 h-16 text-warning" />
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-base-content mb-3 tracking-tight">
              Chat with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                StudyBuddy_AI
              </span>
            </h1>
            <p className="text-base text-base-content/70 max-w-2xl mx-auto">
              Ask questions, get detailed explanations, work through problems
              step-by-step, or upload files for personalized help.
            </p>
          </div>

          {/* Chat Input */}
          <div className="w-full">
            <ChatInput
              value={userText}
              onChange={setUserText}
              onSend={handleSendMessage}
              placeholder="Ask me anything, upload a file, or describe what you want to study..."
              disabled={isSending}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChat;
