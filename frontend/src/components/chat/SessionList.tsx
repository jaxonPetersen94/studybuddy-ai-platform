import React from 'react';
import { Clock, MessageSquare, Star } from 'lucide-react';
import { formatTimestamp } from '../../utils/dateUtils';

interface Session {
  id: string;
  title: string;
  lastMessage: string;
  updated_at: string;
  isStarred?: boolean;
}

interface SessionListProps {
  sessions: Session[];
  currentSessionId?: string;
  onCreateNew: () => void;
  onSessionClick: (sessionId: string) => void;
  isCreateButtonEnabled?: boolean;
  createButtonLabel?: string;
  sessionType?: 'chat' | 'flashcards' | 'quiz' | 'presentation' | 'podcast';
}

const SESSION_TYPE_CONFIG = {
  chat: { label: 'New Chat', icon: MessageSquare },
  flashcards: { label: 'New Flash Card', icon: MessageSquare },
  quiz: { label: 'New Quiz', icon: MessageSquare },
  presentation: { label: 'New Presentation', icon: MessageSquare },
  podcast: { label: 'New Podcast', icon: MessageSquare },
};

const SessionList: React.FC<SessionListProps> = ({
  sessions,
  currentSessionId,
  onCreateNew,
  onSessionClick,
  isCreateButtonEnabled = true,
  createButtonLabel,
  sessionType = 'chat',
}) => {
  const config = SESSION_TYPE_CONFIG[sessionType];
  const buttonLabel = createButtonLabel || config.label;
  const ButtonIcon = config.icon;

  return (
    <div className="p-4">
      <button
        className="w-full btn btn-primary mb-4 flex items-center justify-center space-x-2"
        onClick={onCreateNew}
        disabled={!isCreateButtonEnabled}
      >
        <ButtonIcon className="w-4 h-4" />
        <span>{buttonLabel}</span>
      </button>

      <div className="space-y-2">
        <div className="text-xs font-mono text-base-content/60 uppercase tracking-wide mb-2">
          Recent Sessions
        </div>
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`p-3 rounded-lg border transition-colors cursor-pointer group ${
              session.id === currentSessionId
                ? 'border-primary/50 bg-primary/10'
                : 'border-base-300/50 bg-base-100/50 hover:bg-base-200/50'
            }`}
            onClick={() => onSessionClick(session.id)}
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
              {formatTimestamp(session.updated_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionList;
