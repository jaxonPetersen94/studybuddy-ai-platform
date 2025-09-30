import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { notificationService } from '../services/notificationService';
import type {
  Notification,
  NotificationPreferences,
} from '../types/notificationTypes';

interface NotificationStore {
  // State
  notifications: Notification[];
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: Date | null;
  webSocket: WebSocket | null;

  // Pagination state
  currentPage: number;
  totalPages: number;
  hasMore: boolean;

  // Actions
  fetchNotifications: (page?: number, unreadOnly?: boolean) => Promise<void>;
  fetchMoreNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
  dismissAll: () => Promise<void>;
  clearAll: () => void;

  // Preferences
  fetchPreferences: () => Promise<void>;
  updatePreferences: (
    preferences: Partial<NotificationPreferences>,
  ) => Promise<void>;

  // WebSocket
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;

  // Selectors
  getUnreadCount: () => number;
  getUnreadNotifications: () => Notification[];
  getNotificationsByType: (type: Notification['type']) => Notification[];
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      notifications: [],
      preferences: null,
      isLoading: false,
      error: null,
      lastFetchedAt: null,
      webSocket: null,
      currentPage: 1,
      totalPages: 1,
      hasMore: false,

      // Fetch notifications from API
      fetchNotifications: async (page = 1, unreadOnly = false) => {
        set({ isLoading: true, error: null });

        try {
          const { useUserStore } = await import('./UserStore');
          const token = useUserStore.getState().tokens?.accessToken;

          if (!token) {
            throw new Error('Not authenticated');
          }

          const response = await notificationService.getNotifications(
            { page, limit: 20, unreadOnly },
            token,
          );

          set({
            notifications: response.notifications,
            currentPage: response.page,
            totalPages: response.totalPages,
            hasMore: response.hasMore,
            isLoading: false,
            lastFetchedAt: new Date(),
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch notifications';
          set({ error: errorMessage, isLoading: false });
          console.error('Fetch notifications error:', error);
        }
      },

      // Fetch more notifications (pagination)
      fetchMoreNotifications: async () => {
        const { hasMore, isLoading, currentPage } = get();

        if (!hasMore || isLoading) return;

        set({ isLoading: true, error: null });

        try {
          const { useUserStore } = await import('./UserStore');
          const token = useUserStore.getState().tokens?.accessToken;

          if (!token) {
            throw new Error('Not authenticated');
          }

          const nextPage = currentPage + 1;
          const response = await notificationService.getNotifications(
            { page: nextPage, limit: 20 },
            token,
          );

          set((state) => ({
            notifications: [...state.notifications, ...response.notifications],
            currentPage: response.page,
            totalPages: response.totalPages,
            hasMore: response.hasMore,
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch more notifications';
          set({ error: errorMessage, isLoading: false });
          console.error('Fetch more notifications error:', error);
        }
      },

      // Add a new notification (for real-time updates)
      addNotification: (notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
        }));

        // Show toast notification if toast store is available
        import('./ToastStore').then(({ useToastStore }) => {
          const toastStore = useToastStore.getState();

          // Show different toast based on notification type
          switch (notification.type) {
            case 'success':
              toastStore.success(notification.message, {
                title: notification.title,
              });
              break;
            case 'warning':
              toastStore.warning(notification.message, {
                title: notification.title,
              });
              break;
            case 'error':
              toastStore.error(notification.message, {
                title: notification.title,
              });
              break;
            default:
              toastStore.info(notification.message, {
                title: notification.title,
              });
          }
        });
      },

      // Mark a single notification as read
      markAsRead: async (id: string) => {
        // Optimistic update
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true, is_read: true } : n,
          ),
        }));

        try {
          const { useUserStore } = await import('./UserStore');
          const token = useUserStore.getState().tokens?.accessToken;

          if (!token) {
            throw new Error('Not authenticated');
          }

          await notificationService.markAsRead(id, token);
        } catch (error) {
          console.error('Mark as read error:', error);
          // Revert optimistic update on error
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, isRead: false, is_read: false } : n,
            ),
          }));
        }
      },

      // Mark all notifications as read
      markAllAsRead: async () => {
        const unreadNotifications = get().notifications.filter(
          (n) => !n.isRead,
        );

        if (unreadNotifications.length === 0) return;

        // Optimistic update
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            isRead: true,
            is_read: true,
          })),
        }));

        try {
          const { useUserStore } = await import('./UserStore');
          const token = useUserStore.getState().tokens?.accessToken;

          if (!token) {
            throw new Error('Not authenticated');
          }

          await notificationService.markAllAsRead(token);

          // Show success toast
          const { useToastStore } = await import('./ToastStore');
          useToastStore.getState().success('All notifications marked as read', {
            title: 'Notifications Updated',
          });
        } catch (error) {
          console.error('Mark all as read error:', error);

          // Revert optimistic update on error
          set((state) => ({
            notifications: state.notifications.map((n) => {
              const wasUnread = unreadNotifications.some(
                (un) => un.id === n.id,
              );
              return wasUnread ? { ...n, isRead: false, is_read: false } : n;
            }),
          }));

          // Show error toast
          const { useToastStore } = await import('./ToastStore');
          useToastStore
            .getState()
            .error('Failed to mark all notifications as read');
        }
      },

      // Dismiss/delete a notification
      dismiss: async (id: string) => {
        // Optimistic update
        const notificationToRemove = get().notifications.find(
          (n) => n.id === id,
        );
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));

        try {
          const { useUserStore } = await import('./UserStore');
          const token = useUserStore.getState().tokens?.accessToken;

          if (!token) {
            throw new Error('Not authenticated');
          }

          await notificationService.deleteNotification(id, token);
        } catch (error) {
          console.error('Dismiss notification error:', error);

          // Revert optimistic update on error
          if (notificationToRemove) {
            set((state) => ({
              notifications: [notificationToRemove, ...state.notifications],
            }));
          }
        }
      },

      // Dismiss all notifications
      dismissAll: async () => {
        const notificationsBackup = get().notifications;

        // Optimistic update
        set({ notifications: [] });

        try {
          const { useUserStore } = await import('./UserStore');
          const token = useUserStore.getState().tokens?.accessToken;

          if (!token) {
            throw new Error('Not authenticated');
          }

          await notificationService.deleteAll(token);

          // Show success toast
          const { useToastStore } = await import('./ToastStore');
          useToastStore.getState().success('All notifications cleared', {
            title: 'Notifications Cleared',
          });
        } catch (error) {
          console.error('Dismiss all notifications error:', error);

          // Revert optimistic update on error
          set({ notifications: notificationsBackup });

          // Show error toast
          const { useToastStore } = await import('./ToastStore');
          useToastStore.getState().error('Failed to clear notifications');
        }
      },

      // Clear all notifications (local only, usually on logout)
      clearAll: () => {
        set({
          notifications: [],
          lastFetchedAt: null,
          currentPage: 1,
          totalPages: 1,
          hasMore: false,
        });
      },

      // Fetch notification preferences
      fetchPreferences: async () => {
        try {
          const { useUserStore } = await import('./UserStore');
          const token = useUserStore.getState().tokens?.accessToken;

          if (!token) {
            throw new Error('Not authenticated');
          }

          const preferences = await notificationService.getPreferences(token);
          set({ preferences });
        } catch (error) {
          console.error('Fetch preferences error:', error);
        }
      },

      // Update notification preferences
      updatePreferences: async (preferences) => {
        const previousPreferences = get().preferences;

        // Optimistic update
        set((state) => ({
          preferences: state.preferences
            ? { ...state.preferences, ...preferences }
            : null,
        }));

        try {
          const { useUserStore } = await import('./UserStore');
          const token = useUserStore.getState().tokens?.accessToken;

          if (!token) {
            throw new Error('Not authenticated');
          }

          const updated = await notificationService.updatePreferences(
            preferences,
            token,
          );

          set({ preferences: updated });

          // Show success toast
          const { useToastStore } = await import('./ToastStore');
          useToastStore.getState().success('Notification preferences updated', {
            title: 'Preferences Updated',
          });
        } catch (error) {
          console.error('Update preferences error:', error);

          // Revert optimistic update on error
          set({ preferences: previousPreferences });

          // Show error toast
          const { useToastStore } = await import('./ToastStore');
          useToastStore.getState().error('Failed to update preferences');
        }
      },

      // Connect to WebSocket for real-time notifications
      connectWebSocket: async () => {
        const existingWs = get().webSocket;
        if (existingWs && existingWs.readyState === WebSocket.OPEN) {
          console.log('WebSocket already connected');
          return;
        }

        const { useUserStore } = await import('./UserStore');
        const token = useUserStore.getState().tokens?.accessToken;

        if (!token) {
          console.warn('Cannot connect WebSocket: Not authenticated');
          return;
        }

        const ws = notificationService.connectWebSocket(
          token,
          (notification) => {
            get().addNotification(notification);
          },
          (error) => {
            console.error('WebSocket error:', error);
            set({ webSocket: null });
          },
          (event) => {
            console.log('WebSocket closed:', event.code, event.reason);
            set({ webSocket: null });

            // Attempt to reconnect after 5 seconds if not a normal closure
            if (event.code !== 1000) {
              setTimeout(() => {
                get().connectWebSocket();
              }, 5000);
            }
          },
        );

        set({ webSocket: ws });
      },

      // Disconnect WebSocket
      disconnectWebSocket: () => {
        const ws = get().webSocket;
        if (ws) {
          notificationService.disconnectWebSocket(ws);
          set({ webSocket: null });
        }
      },

      // Get count of unread notifications
      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.isRead).length;
      },

      // Get only unread notifications
      getUnreadNotifications: () => {
        return get().notifications.filter((n) => !n.isRead);
      },

      // Get notifications by type
      getNotificationsByType: (type) => {
        return get().notifications.filter((n) => n.type === type);
      },
    }),
    {
      name: 'StudyBuddy-Notification-Store',
      partialize: (state) => ({
        notifications: state.notifications,
        lastFetchedAt: state.lastFetchedAt,
      }),
    },
  ),
);
