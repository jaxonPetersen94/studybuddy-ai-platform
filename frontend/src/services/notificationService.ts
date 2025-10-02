import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/api';
import type {
  Notification,
  GetNotificationsRequest,
  GetNotificationsResponse,
  NotificationPreferences,
} from '../types/notificationTypes';
import type { ApiResponse } from '../types/apiTypes';
import { ApiError } from '../types/errorTypes';

export const notificationService = {
  // Get all notifications with pagination
  async getNotifications(
    request: GetNotificationsRequest,
    token: string,
  ): Promise<GetNotificationsResponse> {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = request;

      let endpoint = `${API_ENDPOINTS.NOTIFICATIONS.BASE}?page=${page}&limit=${limit}`;
      if (unreadOnly) {
        endpoint += '&unread_only=true';
      }

      const response = await apiClient.get<
        ApiResponse<GetNotificationsResponse>
      >(endpoint, token);

      // Transform timestamps to Date objects
      const notifications = response.data.notifications.map((notification) => ({
        ...notification,
        timestamp: new Date(notification.createdAt),
        isRead: notification.isRead,
      }));

      return {
        ...response.data,
        notifications,
      };
    } catch (error: any) {
      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to load notifications',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  // Get a single notification by ID
  async getNotification(
    notificationId: string,
    token: string,
  ): Promise<Notification> {
    try {
      const response = await apiClient.get<ApiResponse<Notification>>(
        API_ENDPOINTS.NOTIFICATIONS.BY_ID(notificationId),
        token,
      );

      return {
        ...response.data,
        isRead: response.data.isRead,
      };
    } catch (error: any) {
      if (error.status === 404) {
        const apiError: ApiError = {
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found',
          details: { status: 404 },
        };
        throw apiError;
      }

      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to load notification',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  // Mark a single notification as read
  async markAsRead(
    notificationId: string,
    token: string,
  ): Promise<Notification> {
    try {
      const response = await apiClient.patch<ApiResponse<Notification>>(
        API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId),
        {},
        token,
      );

      return {
        ...response.data,
        isRead: response.data.isRead,
      };
    } catch (error: any) {
      if (error.status === 404) {
        const apiError: ApiError = {
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found',
          details: { status: 404 },
        };
        throw apiError;
      }

      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to mark notification as read',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  // Mark multiple notifications as read
  async markMultipleAsRead(
    notificationIds: string[],
    token: string,
  ): Promise<void> {
    try {
      await apiClient.patch<ApiResponse<void>>(
        API_ENDPOINTS.NOTIFICATIONS.MARK_MULTIPLE_READ,
        { notification_ids: notificationIds },
        token,
      );
    } catch (error: any) {
      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to mark notifications as read',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  // Mark all notifications as read
  async markAllAsRead(token: string): Promise<void> {
    try {
      await apiClient.patch<ApiResponse<void>>(
        API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ,
        {},
        token,
      );
    } catch (error: any) {
      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to mark all notifications as read',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  // Delete/dismiss a notification
  async deleteNotification(
    notificationId: string,
    token: string,
  ): Promise<void> {
    try {
      await apiClient.delete<ApiResponse<void>>(
        API_ENDPOINTS.NOTIFICATIONS.BY_ID(notificationId),
        token,
      );
    } catch (error: any) {
      if (error.status === 404) {
        const apiError: ApiError = {
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found',
          details: { status: 404 },
        };
        throw apiError;
      }

      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to delete notification',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  // Delete multiple notifications
  async deleteMultiple(
    notificationIds: string[],
    token: string,
  ): Promise<void> {
    try {
      await apiClient.post<ApiResponse<void>>(
        API_ENDPOINTS.NOTIFICATIONS.DELETE_MULTIPLE,
        { notification_ids: notificationIds },
        token,
      );
    } catch (error: any) {
      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to delete notifications',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  // Delete all notifications
  async deleteAll(token: string): Promise<void> {
    try {
      await apiClient.delete<ApiResponse<void>>(
        API_ENDPOINTS.NOTIFICATIONS.DELETE_ALL,
        token,
      );
    } catch (error: any) {
      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to delete all notifications',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  // Get unread count
  async getUnreadCount(token: string): Promise<number> {
    try {
      const response = await apiClient.get<ApiResponse<{ count: number }>>(
        API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT,
        token,
      );

      return response.data.count;
    } catch (error: any) {
      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to get unread count',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  // Get notification preferences
  async getPreferences(token: string): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.get<
        ApiResponse<NotificationPreferences>
      >(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES, token);

      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to load notification preferences',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  // Update notification preferences
  async updatePreferences(
    preferences: Partial<NotificationPreferences>,
    token: string,
  ): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.patch<
        ApiResponse<NotificationPreferences>
      >(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES, preferences, token);

      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to update notification preferences',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  // WebSocket connection for real-time notifications
  connectWebSocket(
    token: string,
    onNotification: (notification: Notification) => void,
    onError?: (error: Event) => void,
    onClose?: (event: CloseEvent) => void,
  ): WebSocket {
    const wsUrl = `${
      import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
    }/ws/notifications?token=${token}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Notification WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle different message types
        if (data.type === 'notification') {
          const notification: Notification = {
            ...data.notification,
            timestamp: new Date(data.notification.created_at),
            isRead: data.notification.is_read,
          };
          onNotification(notification);
        } else if (data.type === 'ping') {
          // Respond to ping to keep connection alive
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Notification WebSocket error:', error);
      if (onError) {
        onError(error);
      }
    };

    ws.onclose = (event) => {
      console.log('Notification WebSocket closed:', event.code, event.reason);
      if (onClose) {
        onClose(event);
      }
    };

    return ws;
  },

  // Disconnect WebSocket
  disconnectWebSocket(ws: WebSocket): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close(1000, 'Client disconnecting');
    }
  },

  // Test notification (for development/testing)
  async sendTestNotification(token: string): Promise<Notification> {
    try {
      const response = await apiClient.post<ApiResponse<Notification>>(
        API_ENDPOINTS.NOTIFICATIONS.TEST,
        {},
        token,
      );

      return {
        ...response.data,
        isRead: response.data.isRead,
      };
    } catch (error: any) {
      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to send test notification',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },
};
