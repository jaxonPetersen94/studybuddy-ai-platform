import React from 'react';
import { GraduationCap } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import NotificationsDropdown from '../notifications/NotificationsDropdown';

const Header: React.FC = () => {
  return (
    <div className="bg-base-200/60 backdrop-blur-lg border border-base-300/40 shadow-md rounded-box">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section - Logo and Title */}
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

        {/* Right Section - Notifications, Profile */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <NotificationsDropdown />
          <ProfileDropdown />
        </div>
      </div>
    </div>
  );
};

export default Header;
