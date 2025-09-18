import React, { useState, useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import NotificationCard from './NotificationCard';

const NotificationsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock notifications data
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'success' as const,
      title: 'Study Session Complete!',
      message:
        'Great job completing your 45-minute Machine Learning study session.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      isRead: false,
    },
    {
      id: '2',
      type: 'info' as const,
      title: 'New Assignment Available',
      message:
        'Your instructor has posted a new assignment for Data Structures.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: false,
    },
    {
      id: '3',
      type: 'warning' as const,
      title: 'Deadline Reminder',
      message: "Your Python project is due in 2 days. Don't forget to submit!",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      isRead: true,
    },
    {
      id: '4',
      type: 'error' as const,
      title: 'Quiz Attempt Failed',
      message:
        'Your last quiz attempt was not saved properly. Please try again.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      isRead: true,
    },
    {
      id: '5',
      type: 'info' as const,
      title: 'Weekly Progress Report',
      message: 'Your study progress for this week is available to review.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isRead: true,
    },
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif,
      ),
    );
  };

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5 text-primary" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-error text-error-content text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-base-100 border border-base-300/50 rounded-box shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-300/30">
            <h3 className="font-semibold text-base-content">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-square btn-ghost btn-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-base-300/30">
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    id={notification.id}
                    type={notification.type}
                    title={notification.title}
                    message={notification.message}
                    timestamp={notification.timestamp}
                    isRead={notification.isRead}
                    onMarkAsRead={handleMarkAsRead}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>
            ) : (
              <div className="p-4">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 bg-base-300/30 rounded-full flex items-center justify-center mb-3">
                    <Bell className="w-6 h-6 text-base-content/40" />
                  </div>
                  <p className="text-base-content/60 text-sm font-medium">
                    No Notifications
                  </p>
                  <p className="text-base-content/40 text-xs mt-1">
                    You're all caught up! New notifications will appear here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
