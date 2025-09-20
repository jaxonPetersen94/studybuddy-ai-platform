import React, { useState } from 'react';
import {
  Brain,
  BookOpen,
  Target,
  Lightbulb,
  Code,
  FileText,
  Calculator,
  Microscope,
  Languages,
  TrendingUp,
  MessageSquare,
  Clock,
  Star,
} from 'lucide-react';
import SidebarComponent from '../../components/layout/Sidebar';
import ChatInput from '../../components/chat/ChatInput';
import SubjectCard from '../../components/ui/SubjectCard';
import PillButton from '../../components/ui/PillButton';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'study' | 'practice' | 'create' | 'analyze';
  prompt: string;
}

interface Subject {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isStarred: boolean;
}

const NewChat: React.FC = () => {
  const [userText, setUserText] = useState('');
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(
    null,
  );
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State for managing the abrupt transition
  const [hasStartedChat, setHasStartedChat] = useState(false);

  // Compute the full message by combining action prompt + user text
  const message = selectedAction
    ? selectedAction.prompt + ' ' + userText
    : userText;

  // Mock chat sessions for sidebar
  const chatSessions: ChatSession[] = [
    {
      id: '1',
      title: 'React Hooks Tutorial',
      lastMessage: 'Can you explain useEffect dependencies?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isStarred: true,
    },
    {
      id: '2',
      title: 'Calculus Study Guide',
      lastMessage: 'Create a derivatives practice quiz',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isStarred: false,
    },
    {
      id: '3',
      title: 'Spanish Conversation',
      lastMessage: "Let's practice ordering food in Spanish",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isStarred: false,
    },
  ];

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

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Immediately switch to chat mode and start typing
    setHasStartedChat(true);
    setIsTyping(true);

    // Stop typing animation after 2 seconds
    setTimeout(() => {
      setIsTyping(false);
    }, 2000);

    // Clear both user text and selected action
    setUserText('');
    setSelectedAction(null);
  };

  const handleQuickAction = (action: QuickAction) => {
    setSelectedAction(action);
  };

  const handleMessageChange = (newMessage: string) => {
    if (selectedAction) {
      // Extract user text by removing the action prompt prefix
      const promptWithSpace = selectedAction.prompt + ' ';
      if (newMessage.startsWith(promptWithSpace)) {
        setUserText(newMessage.substring(promptWithSpace.length));
      } else {
        // If user deleted part of the prompt, clear the action
        setSelectedAction(null);
        setUserText(newMessage);
      }
    } else {
      setUserText(newMessage);
    }
  };

  // Generate placeholder text based on selected subject or action
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

  return (
    <div className="min-h-[calc(100vh-69px)] flex flex-col">
      {/* Sidebar */}
      <SidebarComponent
        title="Chat History"
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        headerHeight={69}
      >
        <div className="p-4">
          <button className="w-full btn btn-primary mb-4 flex items-center justify-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          <div className="space-y-2">
            <div className="text-xs font-mono text-base-content/60 uppercase tracking-wide mb-2">
              Recent Sessions
            </div>
            {chatSessions.map((session) => (
              <div
                key={session.id}
                className="p-3 rounded-lg border border-base-300/50 bg-base-100/50 hover:bg-base-200/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm text-base-content truncate flex-1 mr-3">
                    {session.title}
                  </h4>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {session.isStarred && (
                      <Star className="w-3 h-3 text-warning fill-current" />
                    )}
                    <Clock className="w-3 h-3 text-base-content/40" />
                  </div>
                </div>
                <p className="text-xs text-base-content/60 truncate mb-2">
                  {session.lastMessage}
                </p>
                <div className="text-xs text-base-content/40">
                  {formatTimestamp(session.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SidebarComponent>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col ${
          hasStartedChat
            ? 'justify-end pb-6'
            : 'justify-center items-center py-12'
        }`}
      >
        {/* Centered content container - only when chat hasn't started */}
        {!hasStartedChat && (
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
          </div>
        )}

        {/* Chat Input Container - snaps from center to bottom */}
        <div className="w-full max-w-4xl mx-auto px-6">
          <ChatInput
            value={message}
            onChange={handleMessageChange}
            onSend={handleSendMessage}
            placeholder={getPlaceholder()}
            isTyping={isTyping}
          />
        </div>

        {/* Quick Actions - only when chat hasn't started */}
        {!hasStartedChat && (
          <div className="max-w-4xl w-full px-6 mt-8">
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
        )}
      </div>
    </div>
  );
};

export default NewChat;
