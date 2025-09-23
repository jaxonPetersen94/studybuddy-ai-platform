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
    LOGOUT: buildPath('users', 'logout'),
    REFRESH: buildPath('users', 'refresh'),
    REGISTER: buildPath('users', 'register'),
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
  CHAT: {
    // Session management
    SESSIONS: buildPath('chats', 'sessions'),
    SESSION_BY_ID: (sessionId: string) =>
      `${buildPath('chats', 'sessions')}/${sessionId}`,

    // Message management
    MESSAGES: buildPath('chats', 'messages'),
    SESSION_MESSAGES: (sessionId: string) =>
      `${buildPath('chats', 'sessions')}/${sessionId}/messages`,
    MESSAGE_BY_ID: (messageId: string) =>
      `${buildPath('chats', 'messages')}/${messageId}`,
    REGENERATE_MESSAGE: (messageId: string) =>
      `${buildPath('chats', 'messages')}/${messageId}/regenerate`,
    MESSAGE_FEEDBACK: (messageId: string) =>
      `${buildPath('chats', 'messages')}/${messageId}/feedback`,

    // Streaming
    STREAM_MESSAGE: buildPath('chats', 'messages/stream'),

    // File attachments
    ATTACHMENTS: buildPath('chats', 'attachments'),
    ATTACHMENT_BY_ID: (attachmentId: string) =>
      `${buildPath('chats', 'attachments')}/${attachmentId}`,

    // Search functionality
    SEARCH_SESSIONS: buildPath('chats', 'sessions/search'),
    SEARCH_MESSAGES: (sessionId: string) =>
      `${buildPath('chats', 'sessions')}/${sessionId}/messages/search`,

    // Session actions
    STAR_SESSION: (sessionId: string) =>
      `${buildPath('chats', 'sessions')}/${sessionId}/star`,
    UNSTAR_SESSION: (sessionId: string) =>
      `${buildPath('chats', 'sessions')}/${sessionId}/unstar`,

    // Bulk operations (if needed)
    BULK_DELETE_SESSIONS: buildPath('chats', 'sessions/bulk-delete'),
    BULK_DELETE_MESSAGES: buildPath('chats', 'messages/bulk-delete'),

    // Analytics/Usage (if you plan to track usage)
    SESSION_ANALYTICS: (sessionId: string) =>
      `${buildPath('chats', 'sessions')}/${sessionId}/analytics`,
    USER_CHAT_STATS: buildPath('chats', 'stats'),
  },
} as const;

export const buildApiUrl = (endpoint: string): string =>
  `${API_BASE_URL}${endpoint}`;

export type ApiEndpoints = typeof API_ENDPOINTS;
export type AuthEndpoints = typeof API_ENDPOINTS.AUTH;
export type UserEndpoints = typeof API_ENDPOINTS.USER;
export type ChatEndpoints = typeof API_ENDPOINTS.CHAT;
