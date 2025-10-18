import React from 'react';
import { GraduationCap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';
import NotificationsDropdown from '../notifications/NotificationsDropdown';
import SessionInfoPill from './SessionInfoPill';
import { useChatStore } from '../../stores/chat/ChatStore';

const LOGO_TEXT = 'STUDYBUDDY_AI';
const VERSION_TEXT = '// DASHBOARD.V0.1';

const Header: React.FC = React.memo(() => {
  const { currentSession } = useChatStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isOnChatPage = location.pathname.startsWith('/chat/');

  return (
    <div className="sticky top-0 z-75 bg-base-200/60 backdrop-blur-lg border border-base-300/40 shadow-md rounded-box">
      <div className="flex items-center px-4 py-3">
        {/* Left Section - Logo and Title */}
        <div className="flex-1 flex justify-start">
          <button
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/dashboard')}
            aria-label="Go to dashboard"
          >
            <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-base-content tracking-tight font-mono">
                {LOGO_TEXT}
              </h1>
              <p className="text-base-content/50 text-xs font-mono leading-tight">
                {VERSION_TEXT}
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
          <div className="flex items-center space-x-2">
            <NotificationsDropdown />
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </div>
  );
});

export default Header;
