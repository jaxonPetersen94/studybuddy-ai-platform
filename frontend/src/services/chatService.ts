import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/api';
import type {
  ChatSession,
  ChatMessage,
  SendMessageRequest,
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
        created_at: response.data.created_at,
        updated_at: response.data.updated_at,
        isStarred: response.data.is_starred,
        messageCount: response.data.message_count,
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
        timestamp: new Date(session.updated_at),
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

      return response.data;
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

      return response.data;
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

  // Message Management - Streaming Only
  async sendMessageStream(
    data: SendMessageRequest,
    token: string,
    onToken: (token: string) => void,
    onComplete: (message: ChatMessage) => void,
    onError: (error: Error) => void,
  ): Promise<void> {
    try {
      // Build request matching backend's StreamMessageRequest schema
      const requestData: Record<string, any> = {
        content: data.content, // Backend expects 'content', not 'message'
      };

      // Only include sessionId if it exists (use camelCase for Pydantic alias)
      if (data.sessionId) {
        requestData.sessionId = data.sessionId;
      }

      // Include attachments if provided
      if (data.attachments && data.attachments.length > 0) {
        requestData.attachments = data.attachments;
      }

      // Include model config if provided
      if (data.modelConfig) {
        requestData.model_config = data.modelConfig;
      }

      await apiClient.stream(
        API_ENDPOINTS.CHAT.STREAM_MESSAGE,
        requestData,
        token,
        (parsed) => {
          // Handle different event types
          if (parsed.type === 'content_delta') {
            onToken(parsed.content);
          } else if (parsed.type === 'ai_message_completed') {
            const message: ChatMessage = {
              id: parsed.message.id,
              sessionId: parsed.message.session_id,
              user_id: parsed.message.user_id,
              role: parsed.message.role,
              status: parsed.message.status,
              message_type: parsed.message.message_type || 'text',
              content: parsed.message.content,
              created_at: parsed.message.created_at,
              updated_at: parsed.message.updated_at,
              completed_at: parsed.message.completed_at,
              regenerated_at: parsed.message.regenerated_at,
              attachments: parsed.message.attachments || [],
              function_calls: parsed.message.function_calls || [],
              tokens_used: parsed.message.tokens_used || 0,
              parent_message_id: parsed.message.parent_message_id,
              thread_id: parsed.message.thread_id,
              feedback_score: parsed.message.feedback_score,
              feedback_text: parsed.message.feedback_text,
              is_pinned: parsed.message.is_pinned || false,
              is_hidden: parsed.message.is_hidden || false,
              model_name: parsed.message.model_name,
              generation_config: parsed.message.generation_config || {},
              temperature: parsed.message.temperature,
              is_flagged: parsed.message.is_flagged || false,
              moderation_score: parsed.message.moderation_score,
              metadata: parsed.message.metadata || {},
            };
            onComplete(message);
          } else if (parsed.type === 'error') {
            throw new Error(parsed.error || 'Stream error occurred');
          }
        },
      );
    } catch (error) {
      onError(error as Error);
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
        timestamp: new Date(message.created_at),
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

      return response.data;
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

  // File upload helper
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

  // Search functionality
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

      return response.data;
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

      return response.data;
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
