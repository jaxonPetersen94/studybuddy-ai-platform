import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useUserStore } from '../../stores/UserStore';

interface ProfileDropdownProps {
  className?: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout, isLoggingOut } = useUserStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeDropdown = () => setIsOpen(false);

  const handleUserSettings = () => {
    navigate('/user-settings');
    closeDropdown();
  };

  const handleLogout = async () => {
    try {
      closeDropdown();
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Maybe we show a toast notification here?
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        className={`btn btn-square btn-ghost transition-all duration-200 ${
          isOpen ? 'bg-base-300/50 border border-primary/30' : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoggingOut}
      >
        <User className="w-5 h-5 text-base-content/60" />
        <ChevronDown
          className={`w-4 h-4 text-base-content/80 absolute bottom-0 right-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-base-200/95 backdrop-blur-xl border border-base-300/50 rounded-box shadow-lg z-50 py-2">
          <button
            onClick={handleUserSettings}
            className="flex items-center space-x-3 w-full px-4 py-2 text-left text-sm font-mono text-base-content hover:bg-base-300/50 transition-colors cursor-pointer"
            disabled={isLoggingOut}
          >
            <Settings className="w-4 h-4 text-base-content/60" />
            <span>USER_SETTINGS</span>
          </button>

          <div className="border-t border-base-300/30 my-1" />

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-2 text-left text-sm font-mono text-error hover:bg-error/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoggingOut}
          >
            <LogOut className="w-4 h-4 text-error/80" />
            <span>{isLoggingOut ? 'LOGGING OUT...' : 'LOGOUT'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
