import React, { useState, useEffect } from 'react';
import { Terminal, Bell } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import NotificationsDropdown from './notificationsDropdown/NotificationsDropdown';

const Header: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime12 = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg rounded-box">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section - Logo and Title */}
        <button
          className="flex items-center space-x-4 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => (window.location.href = '/dashboard')}
        >
          <div className="flex-shrink-0 relative">
            <div className="w-12 h-12 bg-base-200 border-2 border-primary/30 rounded-box flex items-center justify-center relative">
              <Terminal className="w-6 h-6 text-primary" />
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-box blur opacity-20 -z-10"></div>
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl lg:text-2xl font-bold text-base-content tracking-tight leading-tight">
              StudyBuddy AI
            </h1>
            <p className="text-base-content/60 text-xs lg:text-sm font-mono leading-tight">
              // Dashboard.v0.1
            </p>
          </div>
        </button>

        {/* Right Section - Time, Notifications, Profile */}
        <div className="flex items-center space-x-3 lg:space-x-4 flex-shrink-0">
          {/* Time Display - Hidden on mobile, shown on larger screens */}
          <div className="hidden md:block text-right">
            <div className="text-base-content font-mono text-sm leading-tight">
              {formatDate(currentTime)}
            </div>
            <div className="text-primary font-mono text-xs leading-tight">
              {formatTime12(currentTime)}
            </div>
          </div>

          {/* Notifications */}
          <div className="flex items-center">
            <NotificationsDropdown />
          </div>

          {/* User Profile */}
          <div className="flex items-center">
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
