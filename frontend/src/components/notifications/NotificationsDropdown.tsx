import React, { useState, useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import NotificationCard from './NotificationCard';
import { useNotificationStore } from '../../stores/NotificationStore';

const NotificationsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get notifications from store
  const notifications = useNotificationStore((state) => state.notifications);
  const isLoading = useNotificationStore((state) => state.isLoading);
  const fetchNotifications = useNotificationStore(
    (state) => state.fetchNotifications,
  );
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const dismiss = useNotificationStore((state) => state.dismiss);
  const getUnreadCount = useNotificationStore((state) => state.getUnreadCount);

  const unreadCount = getUnreadCount();

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle click outside to close dropdown
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
            {isLoading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="loading loading-spinner loading-md"></div>
              </div>
            ) : notifications.length > 0 ? (
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
                    onMarkAsRead={markAsRead}
                    onDismiss={dismiss}
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
