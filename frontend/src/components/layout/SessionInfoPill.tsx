import React from 'react';
import { Activity } from 'lucide-react';
import { formatTimestamp } from '../../utils/dateUtils';
import { useChatStore } from '../../stores/chat/ChatStore';

interface SessionInfoPillProps {
  title: string;
  createdAt: string;
}

const SessionInfoPill: React.FC<SessionInfoPillProps> = ({
  title,
  createdAt,
}) => {
  const { isSidebarOpen } = useChatStore();

  return (
    <div
      className="flex items-center gap-2.5 px-3 py-1.5 bg-base-300/50 backdrop-blur-sm border border-primary/25 rounded shadow-md"
      style={{
        marginLeft: isSidebarOpen ? '143px' : '0',
        transition: 'margin-left 500ms ease-in-out',
      }}
    >
      {/* Left indicator line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/60 to-transparent" />

      {/* Pulsing activity dot */}
      <div className="relative flex-shrink-0">
        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
        <div className="absolute inset-0 w-1.5 h-1.5 bg-primary/50 rounded-full animate-ping" />
      </div>

      {/* Content */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex flex-col min-w-0">
          <h2 className="text-xs font-medium text-base-content/85 truncate max-w-xs font-mono leading-tight">
            {title}
          </h2>
          <p className="text-[10px] text-base-content/50 font-mono tracking-wider leading-tight">
            {formatTimestamp(createdAt).toUpperCase()}
          </p>
        </div>

        {/* Subtle divider */}
        <div className="w-px h-5 bg-base-content/20" />

        {/* Activity indicator */}
        <Activity className="w-3.5 h-3.5 text-primary/50" />
      </div>
    </div>
  );
};

export default SessionInfoPill;
