import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/api';
import type {
  ChatSession,
  ChatMessage,
  SendMessageRequest,
  SendMessageResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  GetSessionsResponse,
  GetMessagesRequest,
  GetMessagesResponse,
  UpdateSessionRequest,
  RegenerateMessageRequest,
  MessageFeedbackRequest,
} from '../types/chatTypes';
import type { ApiResponse } from '../types/apiTypes';
import { ApiError } from '../types/errorTypes';

export const chatService = {
  // Session Management
  async createSession(
    data: CreateSessionRequest,
    token: string,
  ): Promise<ChatSession> {
    try {
      const response = await apiClient.post<ApiResponse<CreateSessionResponse>>(
        API_ENDPOINTS.CHAT.SESSIONS,
        data,
        token,
      );

      return {
        id: response.data.id,
        title: response.data.title,
        lastMessage: data.initialMessage || '',
        timestamp: new Date(response.timestamp),
        isStarred: false,
        messageCount: 0,
        subject: data.subject,
        quickAction: data.quickAction,
      };
    } catch (error: any) {
      if (error.status === 400) {
        const apiError: ApiError = {
          code: 'INVALID_SESSION_DATA',
          message:
            error.message || 'Invalid session data. Please check your input.',
          details: { status: 400 },
        };
        throw apiError;
      }

      if (error.status === 429) {
        const apiError: ApiError = {
          code: 'RATE_LIMIT_EXCEEDED',
          message:
            'Too many session creation attempts. Please try again later.',
          details: { status: 429 },
        };
        throw apiError;
      }

      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to create chat session',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  async getSessions(
    token: string,
    page = 1,
    limit = 20,
  ): Promise<GetSessionsResponse> {
    try {
      const response = await apiClient.get<ApiResponse<GetSessionsResponse>>(
        `${API_ENDPOINTS.CHAT.SESSIONS}?page=${page}&limit=${limit}`,
        token,
      );

      // Transform timestamps to Date objects
      const sessions = response.data.sessions.map((session) => ({
        ...session,
        timestamp: new Date(session.timestamp),
      }));

      return {
        ...response.data,
        sessions,
      };
    } catch (error: any) {
      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to load sessions',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  async getSession(sessionId: string, token: string): Promise<ChatSession> {
    try {
      const response = await apiClient.get<ApiResponse<ChatSession>>(
        API_ENDPOINTS.CHAT.SESSION_BY_ID(sessionId),
        token,
      );

      return {
        ...response.data,
        timestamp: new Date(response.timestamp),
      };
    } catch (error: any) {
      if (error.status === 404) {
        const apiError: ApiError = {
          code: 'SESSION_NOT_FOUND',
          message: 'Chat session not found',
          details: { status: 404 },
        };
        throw apiError;
      }

      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to load session',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  async updateSession(
    sessionId: string,
    data: UpdateSessionRequest,
    token: string,
  ): Promise<ChatSession> {
    try {
      const response = await apiClient.patch<ApiResponse<ChatSession>>(
        API_ENDPOINTS.CHAT.SESSION_BY_ID(sessionId),
        data,
        token,
      );

      return {
        ...response.data,
        timestamp: new Date(response.timestamp),
      };
    } catch (error: any) {
      if (error.status === 404) {
        const apiError: ApiError = {
          code: 'SESSION_NOT_FOUND',
          message: 'Chat session not found',
          details: { status: 404 },
        };
        throw apiError;
      }

      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to update session',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  async deleteSession(sessionId: string, token: string): Promise<void> {
    try {
      await apiClient.delete<ApiResponse<void>>(
        API_ENDPOINTS.CHAT.SESSION_BY_ID(sessionId),
        token,
      );
    } catch (error: any) {
      if (error.status === 404) {
        const apiError: ApiError = {
          code: 'SESSION_NOT_FOUND',
          message: 'Chat session not found',
          details: { status: 404 },
        };
        throw apiError;
      }

      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to delete session',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  async starSession(sessionId: string, token: string): Promise<ChatSession> {
    return this.updateSession(sessionId, { isStarred: true }, token);
  },

  async unstarSession(sessionId: string, token: string): Promise<ChatSession> {
    return this.updateSession(sessionId, { isStarred: false }, token);
  },

  // Message Management
  async sendMessage(
    data: SendMessageRequest,
    token: string,
  ): Promise<ChatMessage> {
    try {
      const requestData = {
        ...data,
        metadata: {
          ...data.metadata,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
      };

      const response = await apiClient.post<SendMessageResponse>(
        API_ENDPOINTS.CHAT.MESSAGES,
        requestData,
        token,
      );

      return {
        id: response.data.id,
        content: response.data.content,
        isUser: true,
        timestamp: new Date(response.timestamp),
        attachments: data.attachments,
        metadata: response.data.metadata,
      };
    } catch (error: any) {
      if (error.status === 400) {
        const apiError: ApiError = {
          code: 'INVALID_MESSAGE_DATA',
          message:
            error.message || 'Invalid message data. Please check your input.',
          details: { status: 400 },
        };
        throw apiError;
      }

      if (error.status === 429) {
        const apiError: ApiError = {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many messages sent. Please slow down.',
          details: { status: 429 },
        };
        throw apiError;
      }

      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to send message',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  async getMessages(
    request: GetMessagesRequest,
    token: string,
  ): Promise<GetMessagesResponse> {
    try {
      const { sessionId, page = 1, limit = 50, before } = request;

      let endpoint =
        API_ENDPOINTS.CHAT.SESSION_MESSAGES(sessionId) +
        `?page=${page}&limit=${limit}`;
      if (before) {
        endpoint += `&before=${before}`;
      }

      const response = await apiClient.get<ApiResponse<GetMessagesResponse>>(
        endpoint,
        token,
      );

      // Transform timestamps to Date objects
      const messages = response.data.messages.map((message) => ({
        ...message,
        timestamp: new Date(message.timestamp),
      }));

      return {
        ...response.data,
        messages,
      };
    } catch (error: any) {
      if (error.status === 404) {
        const apiError: ApiError = {
          code: 'SESSION_NOT_FOUND',
          message: 'Chat session not found',
          details: { status: 404 },
        };
        throw apiError;
      }

      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to load messages',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  async regenerateMessage(
    data: RegenerateMessageRequest,
    token: string,
  ): Promise<ChatMessage> {
    try {
      const response = await apiClient.post<ApiResponse<ChatMessage>>(
        API_ENDPOINTS.CHAT.REGENERATE_MESSAGE(data.messageId),
        { sessionId: data.sessionId },
        token,
      );

      return {
        ...response.data,
        timestamp: new Date(response.timestamp),
      };
    } catch (error: any) {
      if (error.status === 404) {
        const apiError: ApiError = {
          code: 'MESSAGE_NOT_FOUND',
          message: 'Message not found',
          details: { status: 404 },
        };
        throw apiError;
      }

      if (error.status === 429) {
        const apiError: ApiError = {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many regeneration attempts. Please try again later.',
          details: { status: 429 },
        };
        throw apiError;
      }

      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to regenerate message',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  async submitMessageFeedback(
    data: MessageFeedbackRequest,
    token: string,
  ): Promise<void> {
    try {
      await apiClient.post<ApiResponse<void>>(
        API_ENDPOINTS.CHAT.MESSAGE_FEEDBACK(data.messageId),
        {
          sessionId: data.sessionId,
          type: data.type,
          feedback: data.feedback,
        },
        token,
      );
    } catch (error: any) {
      if (error.status === 404) {
        const apiError: ApiError = {
          code: 'MESSAGE_NOT_FOUND',
          message: 'Message not found',
          details: { status: 404 },
        };
        throw apiError;
      }

      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to submit feedback',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  // Utility methods for stream handling (if your API supports streaming)
  async sendMessageStream(
    data: SendMessageRequest,
    token: string,
    onToken: (token: string) => void,
    onComplete: (message: ChatMessage) => void,
    onError: (error: Error) => void,
  ): Promise<void> {
    try {
      const requestData = {
        ...data,
        stream: true,
        metadata: {
          ...data.metadata,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${API_ENDPOINTS.CHAT.STREAM_MESSAGE}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'token') {
                onToken(parsed.content);
              } else if (parsed.type === 'complete') {
                const message: ChatMessage = {
                  ...parsed.message,
                  timestamp: new Date(parsed.message.timestamp),
                };
                onComplete(message);
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', data);
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  },

  // File upload helper (if your API supports file attachments)
  async uploadAttachment(
    file: File,
    token: string,
  ): Promise<{ id: string; url: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${API_ENDPOINTS.CHAT.ATTACHMENTS}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error: any) {
      if (error.status === 413) {
        const apiError: ApiError = {
          code: 'FILE_TOO_LARGE',
          message: 'File is too large. Please choose a smaller file.',
          details: { status: 413 },
        };
        throw apiError;
      }

      if (error.status === 415) {
        const apiError: ApiError = {
          code: 'UNSUPPORTED_FILE_TYPE',
          message: 'File type is not supported.',
          details: { status: 415 },
        };
        throw apiError;
      }

      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to upload attachment',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  // Search functionality (if supported by your API)
  async searchSessions(
    query: string,
    token: string,
    page = 1,
    limit = 10,
  ): Promise<GetSessionsResponse> {
    try {
      const response = await apiClient.get<ApiResponse<GetSessionsResponse>>(
        API_ENDPOINTS.CHAT.SEARCH_SESSIONS +
          `?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
        token,
      );

      const sessions = response.data.sessions.map((session) => ({
        ...session,
        timestamp: new Date(session.timestamp),
      }));

      return {
        ...response.data,
        sessions,
      };
    } catch (error: any) {
      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to search sessions',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  async searchMessages(
    sessionId: string,
    query: string,
    token: string,
    page = 1,
    limit = 20,
  ): Promise<GetMessagesResponse> {
    try {
      const response = await apiClient.get<ApiResponse<GetMessagesResponse>>(
        API_ENDPOINTS.CHAT.SEARCH_MESSAGES(sessionId) +
          `?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
        token,
      );

      const messages = response.data.messages.map((message) => ({
        ...message,
        timestamp: new Date(message.timestamp),
      }));

      return {
        ...response.data,
        messages,
      };
    } catch (error: any) {
      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to search messages',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },
};
