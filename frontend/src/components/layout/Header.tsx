import React from 'react';
import { GraduationCap } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import NotificationsDropdown from '../notifications/NotificationsDropdown';
import SessionInfoPill from './SessionInfoPill';
import { useChatStore } from '../../stores/chat/ChatStore';
import { useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const { currentSession } = useChatStore();
  const location = useLocation();
  const isOnChatPage = location.pathname.startsWith('/chat/');

  return (
    <div className="bg-base-200/60 backdrop-blur-lg border border-base-300/40 shadow-md rounded-box">
      <div className="flex items-center px-4 py-3">
        {/* Left Section - Logo and Title */}
        <div className="flex-1 flex justify-start">
          <button
            className="flex items-center space-x-3 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => (window.location.href = '/dashboard')}
          >
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-base-content tracking-tight font-mono">
                STUDYBUDDY_AI
              </h1>
              <p className="text-base-content/50 text-xs font-mono leading-tight">
                // DASHBOARD.V0.1
              </p>
            </div>
          </button>
        </div>

        {/* Center Section - Session Info Pill */}
        <div className="flex-1 flex justify-center">
          {currentSession && isOnChatPage && (
            <SessionInfoPill
              title={currentSession.title}
              createdAt={currentSession.created_at}
            />
          )}
        </div>

        {/* Right Section - Notifications, Profile */}
        <div className="flex-1 flex justify-end">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <NotificationsDropdown />
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
