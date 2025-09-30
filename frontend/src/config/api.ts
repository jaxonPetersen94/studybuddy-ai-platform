export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001';

const API_PREFIX = '/api';
const API_VERSION = '/v1';
const API_BASE_PATH = `${API_PREFIX}${API_VERSION}`;

const buildPath = (resource: string, action?: string): string =>
  `${API_BASE_PATH}/${resource}${action ? `/${action}` : ''}`;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: buildPath('users', 'login'),
    REGISTER: buildPath('users', 'register'),
    LOGOUT: buildPath('users', 'logout'),
    REFRESH: buildPath('users', 'refresh'),
    RESEND_VERIFICATION: buildPath('users', 'resend-verification'),
    FORGOT_PASSWORD: buildPath('users', 'forgot-password'),
    RESET_PASSWORD: buildPath('users', 'reset-password'),
    DELETE_ACCOUNT: buildPath('users', 'account'),
  },
  USER: {
    PROFILE: buildPath('users', 'profile'),
    PREFERENCES: buildPath('users', 'preferences'),
    CHANGE_PASSWORD: buildPath('users', 'change-password'),
  },
  NOTIFICATIONS: {
    BASE: buildPath('users', 'notifications'),
    BY_ID: (id: string) => `${buildPath('users', 'notifications')}/${id}`,
    UNREAD_COUNT: buildPath('users', 'notifications/unread-count'),

    // Read actions
    MARK_READ: (id: string) =>
      `${buildPath('users', 'notifications')}/${id}/read`,
    MARK_MULTIPLE_READ: buildPath('users', 'notifications/read-multiple'),
    MARK_ALL_READ: buildPath('users', 'notifications/read-all'),

    // Delete actions
    DELETE_MULTIPLE: buildPath('users', 'notifications/delete-multiple'),
    DELETE_ALL: buildPath('users', 'notifications/delete-all'),

    // Other
    PREFERENCES: buildPath('users', 'notifications/preferences'),
    TEST: buildPath('users', 'notifications/test'),
  },
  CHAT: {
    // Session management
    SESSIONS: buildPath('chats', 'sessions'),
    SESSION_BY_ID: (sessionId: string) =>
      `${buildPath('chats', 'sessions')}/${sessionId}`,
    STAR_SESSION: (sessionId: string) =>
      `${buildPath('chats', 'sessions')}/${sessionId}/star`,
    UNSTAR_SESSION: (sessionId: string) =>
      `${buildPath('chats', 'sessions')}/${sessionId}/unstar`,
    SESSION_ANALYTICS: (sessionId: string) =>
      `${buildPath('chats', 'sessions')}/${sessionId}/analytics`,
    SEARCH_SESSIONS: buildPath('chats', 'sessions/search'),
    BULK_DELETE_SESSIONS: buildPath('chats', 'sessions/bulk-delete'),

    // Message management
    MESSAGES: buildPath('chats', 'messages'),
    SESSION_MESSAGES: (sessionId: string) =>
      `${buildPath('chats', 'sessions')}/${sessionId}/messages`,
    MESSAGE_BY_ID: (messageId: string) =>
      `${buildPath('chats', 'messages')}/${messageId}`,
    STREAM_MESSAGE: buildPath('chats', 'messages/stream'),
    REGENERATE_MESSAGE: (messageId: string) =>
      `${buildPath('chats', 'messages')}/${messageId}/regenerate`,
    MESSAGE_FEEDBACK: (messageId: string) =>
      `${buildPath('chats', 'messages')}/${messageId}/feedback`,
    SEARCH_MESSAGES: (sessionId: string) =>
      `${buildPath('chats', 'sessions')}/${sessionId}/messages/search`,
    BULK_DELETE_MESSAGES: buildPath('chats', 'messages/bulk-delete'),

    // File attachments
    ATTACHMENTS: buildPath('chats', 'attachments'),
    ATTACHMENT_BY_ID: (attachmentId: string) =>
      `${buildPath('chats', 'attachments')}/${attachmentId}`,

    // Analytics/Usage
    USER_CHAT_STATS: buildPath('chats', 'stats'),
  },
} as const;

export const buildApiUrl = (endpoint: string): string =>
  `${API_BASE_URL}${endpoint}`;

export type ApiEndpoints = typeof API_ENDPOINTS;
export type AuthEndpoints = typeof API_ENDPOINTS.AUTH;
export type UserEndpoints = typeof API_ENDPOINTS.USER;
export type ChatEndpoints = typeof API_ENDPOINTS.CHAT;
export type NotificationEndpoints = typeof API_ENDPOINTS.NOTIFICATIONS;
