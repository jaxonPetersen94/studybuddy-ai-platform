import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Brain,
  Calculator,
  Code,
  FileText,
  Languages,
  Lightbulb,
  Microscope,
  Target,
  TrendingUp,
} from 'lucide-react';
import ChatInput from '../../components/chat/ChatInput';
import SidebarComponent from '../../components/layout/Sidebar';
import PillButton from '../../components/ui/PillButton';
import SubjectCard from '../../components/ui/SubjectCard';
import { useChatStore } from '../../stores/chat/ChatStore';
import { QuickAction, Subject } from '../../types/uiTypes';
import SessionList from '../../components/chat/SessionList';

const NewChat: React.FC = () => {
  const navigate = useNavigate();

  const {
    sessions,
    selectedSubject,
    selectedAction,
    userText,
    isSending,
    isSidebarOpen,
    loadSessions,
    setUserText,
    setSelectedSubject,
    setSelectedAction,
    setSidebarOpen,
    createSessionAndSend,
  } = useChatStore();

  useEffect(() => {
    loadSessions();
  }, []);

  // Learning-focused subjects
  const subjects: Subject[] = [
    {
      id: 'programming',
      name: 'Programming',
      icon: <Code className="w-5 h-5" />,
      color: 'text-primary',
      description: 'Code, algorithms, debugging help',
    },
    {
      id: 'mathematics',
      name: 'Mathematics',
      icon: <Calculator className="w-5 h-5" />,
      color: 'text-secondary',
      description: 'Calculus, algebra, statistics, proofs',
    },
    {
      id: 'science',
      name: 'Science',
      icon: <Microscope className="w-5 h-5" />,
      color: 'text-accent',
      description: 'Physics, chemistry, biology concepts',
    },
    {
      id: 'languages',
      name: 'Languages',
      icon: <Languages className="w-5 h-5" />,
      color: 'text-info',
      description: 'Grammar, vocabulary, conversation',
    },
    {
      id: 'writing',
      name: 'Writing',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-success',
      description: 'Essays, reports, creative writing',
    },
    {
      id: 'business',
      name: 'Business',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-warning',
      description: 'Strategy, finance, management',
    },
  ];

  // AI-powered learning actions
  const quickActions: QuickAction[] = [
    {
      id: 'explain',
      title: 'Explain This',
      description: 'Break down complex topics simply',
      icon: <Lightbulb className="w-4 h-4" />,
      category: 'study',
      prompt: 'Please explain this concept in simple terms with examples:',
    },
    {
      id: 'quiz',
      title: 'Generate Quiz',
      description: 'Create practice questions instantly',
      icon: <Target className="w-4 h-4" />,
      category: 'practice',
      prompt: 'Create a quiz with 5 questions about:',
    },
    {
      id: 'study-guide',
      title: 'Study Guide',
      description: 'Comprehensive learning outline',
      icon: <BookOpen className="w-4 h-4" />,
      category: 'create',
      prompt: 'Create a detailed study guide for:',
    },
    {
      id: 'solve-step',
      title: 'Solve Step-by-Step',
      description: 'Walk through problem solutions',
      icon: <Calculator className="w-4 h-4" />,
      category: 'analyze',
      prompt: 'Please solve this step-by-step with explanations:',
    },
    {
      id: 'code-review',
      title: 'Code Review',
      description: 'Analyze and improve your code',
      icon: <Code className="w-4 h-4" />,
      category: 'analyze',
      prompt: 'Please review this code and suggest improvements:',
    },
    {
      id: 'flashcards',
      title: 'Create Flashcards',
      description: 'Generate memorization cards',
      icon: <Brain className="w-4 h-4" />,
      category: 'create',
      prompt: 'Create flashcards for studying:',
    },
  ];

  // Compute the full message by combining action prompt + user text
  const message = selectedAction
    ? selectedAction.prompt + ' ' + userText
    : userText;

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    try {
      // Create new session and send message
      const newSession = await createSessionAndSend({
        content: message.trim(),
        title:
          message.trim().substring(0, 50) +
          (message.trim().length > 50 ? '...' : ''),
        subject: selectedSubject || undefined,
        quickAction: selectedAction?.id || undefined,
      });

      // Clear the input
      setUserText('');

      // Navigate immediately - the user message is already in the store
      navigate(`/chat/${newSession.id}`);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    setSelectedAction(selectedAction?.id === action.id ? null : action);
  };

  const handleMessageChange = (newMessage: string) => {
    if (selectedAction) {
      const promptWithSpace = selectedAction.prompt + ' ';
      if (newMessage.startsWith(promptWithSpace)) {
        setUserText(newMessage.substring(promptWithSpace.length));
      } else {
        setSelectedAction(null);
        setUserText(newMessage);
      }
    } else {
      setUserText(newMessage);
    }
  };

  const getPlaceholder = () => {
    if (selectedAction) {
      return `${selectedAction.description}...`;
    }
    if (selectedSubject) {
      const subject = subjects.find((s) => s.id === selectedSubject);
      return `Ask me anything about ${subject?.name.toLowerCase()}...`;
    }
    return 'Ask me anything, upload a file, or describe what you want to study...';
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
            setSelectedSubject(null);
            setSelectedAction(null);
            setUserText('');
            setSidebarOpen(false);
          }}
          onSessionClick={handleSessionClick}
          newChatButtonEnabled={false}
        />
      </SidebarComponent>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center py-12">
        <div className="max-w-4xl w-full px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-base-content mb-4 tracking-tight">
              What would you like to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                study
              </span>
              ?
            </h1>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto leading-relaxed">
              StudyBuddy adapts to your learning style, creates personalized
              study materials, and helps you master any subject through
              intelligent practice and real-time feedback.
            </p>
          </div>

          {/* Subject Selection */}
          <div className="w-full mb-8">
            <div className="text-sm font-mono text-base-content/60 uppercase tracking-wide mb-4 text-center">
              Choose A Subject (Optional)
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  id={subject.id}
                  name={subject.name}
                  icon={subject.icon}
                  color={subject.color}
                  description={subject.description}
                  isSelected={selectedSubject === subject.id}
                  onClick={(id) =>
                    setSelectedSubject(selectedSubject === id ? null : id)
                  }
                />
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <div className="w-full mb-8">
            <ChatInput
              value={message}
              onChange={handleMessageChange}
              onSend={handleSendMessage}
              placeholder={getPlaceholder()}
              disabled={isSending}
            />
          </div>

          {/* Quick Actions */}
          <div className="w-full">
            <div className="text-sm font-mono text-base-content/60 uppercase tracking-wide mb-4 text-center">
              Quick Actions
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {quickActions.map((action) => (
                <PillButton
                  key={action.id}
                  icon={action.icon}
                  label={action.title}
                  onClick={() => handleQuickAction(action)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChat;
