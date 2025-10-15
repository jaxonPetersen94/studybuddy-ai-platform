import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clapperboard,
  FileText,
  MessageSquare,
  Podcast,
  SquareStack,
} from 'lucide-react';
import StudyMethodCard from '../../components/dashboard/StudyMethodCard';

interface StudyMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Study methods
  const studyMethods: StudyMethod[] = [
    {
      id: 'flashcards',
      name: 'Flash Cards',
      icon: <SquareStack className="w-8 h-8" />,
      color: 'text-secondary',
      description: 'Interactive memorization cards',
    },
    {
      id: 'quiz',
      name: 'Quiz',
      icon: <FileText className="w-8 h-8" />,
      color: 'text-primary',
      description: 'Test your knowledge',
    },
    {
      id: 'chat',
      name: 'Chat',
      icon: <MessageSquare className="w-8 h-8" />,
      color: 'text-warning',
      description: 'Interactive conversation',
    },
    {
      id: 'presentation',
      name: 'Presentation',
      icon: <Clapperboard className="w-8 h-8" />,
      color: 'text-error',
      description: 'Visual learning slides',
    },
    {
      id: 'podcast',
      name: 'Podcast',
      icon: <Podcast className="w-8 h-8" />,
      color: 'text-success',
      description: 'Audio learning experience',
    },
  ];

  const handleStudyMethodClick = (methodId: string) => {
    if (methodId === 'chat') {
      navigate('/new-chat');
    } else if (methodId === 'flashcards') {
      navigate('/new-flashcards');
    } else if (methodId === 'quiz') {
      navigate('/quiz');
    } else if (methodId === 'presentation') {
      navigate('/presentation');
    } else if (methodId === 'podcast') {
      navigate('/podcast');
    }
    // Add routing logic for other methods as needed
  };

  return (
    <div className="min-h-[calc(100vh-69px)] flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center py-12">
        <div className="max-w-5xl w-full px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-base-content mb-4 tracking-tight">
              How would you like to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                study
              </span>
              ?
            </h1>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto leading-relaxed">
              Choose your preferred learning method and let StudyBuddy create
              personalized content tailored to how you learn best—from
              interactive flashcards to engaging podcasts.
            </p>
          </div>

          {/* Study Methods Grid */}
          <div className="w-full mb-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {studyMethods.map((method) => (
                <StudyMethodCard
                  key={method.id}
                  id={method.id}
                  name={method.name}
                  icon={method.icon}
                  color={method.color}
                  description={method.description}
                  onClick={handleStudyMethodClick}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
