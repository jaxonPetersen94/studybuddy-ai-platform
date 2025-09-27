import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chatService } from '../services/chatService';
import { useUserStore } from './UserStore';
import type {
  ChatMessage,
  ChatSession,
  SendMessageRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  MessageFeedbackRequest,
  RegenerateMessageRequest,
} from '../types/chatTypes';
import { QuickAction } from '../types/uiTypes';

interface ChatStore {
  // Current session state
  currentSession: ChatSession | null;
  currentMessages: ChatMessage[];
  hasStartedChat: boolean;

  // Chat sessions management
  sessions: ChatSession[];
  sessionsLoading: boolean;
  sessionsError: string | null;

  // UI state
  isTyping: boolean;
  selectedSubject: string | null;
  selectedAction: QuickAction | null;
  userText: string;

  // Loading states
  isLoading: boolean;
  isSending: boolean;

  // Error state
  error: string | null;

  // Pagination state
  hasMoreMessages: boolean;
  hasMoreSessions: boolean;
  messagesPage: number;
  sessionsPage: number;

  // Session management actions
  createSession: (data?: CreateSessionRequest) => Promise<ChatSession>;
  loadSession: (sessionId: string) => Promise<void>;
  loadSessions: (refresh?: boolean) => Promise<void>;
  updateSession: (
    sessionId: string,
    data: UpdateSessionRequest,
  ) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  starSession: (sessionId: string) => Promise<void>;
  unstarSession: (sessionId: string) => Promise<void>;

  // Message management actions
  sendMessage: (data: SendMessageRequest) => Promise<ChatMessage>;
  loadMessages: (sessionId: string, refresh?: boolean) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  regenerateMessage: (data: RegenerateMessageRequest) => Promise<void>;
  submitMessageFeedback: (data: MessageFeedbackRequest) => Promise<void>;

  // Streaming support
  sendMessageStream: (
    data: SendMessageRequest,
    onToken?: (token: string) => void,
  ) => Promise<ChatMessage>;

  // Search functionality
  searchSessions: (query: string) => Promise<void>;
  searchMessages: (query: string) => Promise<void>;

  // UI actions
  startChat: () => void;
  resetChat: () => void;
  setUserText: (text: string) => void;
  setSelectedSubject: (subjectId: string | null) => void;
  setSelectedAction: (action: QuickAction | null) => void;
  setIsTyping: (typing: boolean) => void;

  // Message interaction handlers
  handleCopyMessage: (messageText: string) => Promise<void>;
  handleLikeMessage: (messageId: string) => Promise<void>;
  handleDislikeMessage: (messageId: string) => Promise<void>;
  handleRegenerateMessage: (messageId: string) => Promise<void>;

  // State management utilities
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Internal helper methods
  _getAuthToken: () => string;
  _handleApiError: (error: any, context: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      currentMessages: [],
      hasStartedChat: false,
      sessions: [],
      sessionsLoading: false,
      sessionsError: null,
      isTyping: false,
      selectedSubject: null,
      selectedAction: null,
      userText: '',
      isLoading: false,
      isSending: false,
      error: null,
      hasMoreMessages: true,
      hasMoreSessions: true,
      messagesPage: 1,
      sessionsPage: 1,

      // Helper function to get auth token
      _getAuthToken: () => {
        const userStore = useUserStore.getState();
        if (!userStore.isAuthenticated || !userStore.tokens?.accessToken) {
          throw new Error('Please log in to continue');
        }
        return userStore.tokens.accessToken;
      },

      // Helper function to handle API errors
      _handleApiError: async (error: any, context: string) => {
        let errorMessage: string;
        let shouldLogout = false;

        // Handle errors from the service layer
        if (
          error.code === 'SESSION_NOT_FOUND' ||
          error.code === 'MESSAGE_NOT_FOUND'
        ) {
          errorMessage = error.message;
        } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
          errorMessage = error.message;
        } else if (
          error.code === 'INVALID_SESSION_DATA' ||
          error.code === 'INVALID_MESSAGE_DATA'
        ) {
          errorMessage = error.message;
        } else if (
          error.details?.status === 401 ||
          error.message?.includes('unauthorized')
        ) {
          shouldLogout = true;
          errorMessage = 'Your session has expired. Please log in again.';
        } else {
          errorMessage = error.message || `Failed to ${context}`;
        }

        set({ error: errorMessage });

        // Show error toast
        const { useToastStore } = await import('./ToastStore');
        useToastStore.getState().error(errorMessage, {
          title: `${context.charAt(0).toUpperCase() + context.slice(1)} Failed`,
        });

        // Handle authentication errors
        if (shouldLogout) {
          const userStore = useUserStore.getState();
          await userStore.logout();
        }

        throw error;
      },

      // Session management actions
      createSession: async (data?: CreateSessionRequest) => {
        set({ isLoading: true, error: null });

        try {
          const token = get()._getAuthToken();
          const newSession = await chatService.createSession(data || {}, token);

          set((state) => ({
            currentSession: newSession,
            sessions: [newSession, ...state.sessions],
            hasStartedChat: false,
            currentMessages: [],
            isLoading: false,
          }));

          return newSession;
        } catch (error: any) {
          set({ isLoading: false });
          await get()._handleApiError(error, 'create session');
          throw error;
        }
      },

      loadSession: async (sessionId: string) => {
        set({ isLoading: true, error: null });

        try {
          const token = get()._getAuthToken();
          const session = await chatService.getSession(sessionId, token);

          set({
            currentSession: session,
            currentMessages: [],
            hasStartedChat: false,
            messagesPage: 1,
            hasMoreMessages: true,
            isLoading: false,
          });

          // Load messages for this session
          await get().loadMessages(sessionId, true);
        } catch (error: any) {
          set({ isLoading: false });
          await get()._handleApiError(error, 'load session');
          throw error;
        }
      },

      loadSessions: async (refresh = false) => {
        if (refresh) {
          set({ sessionsPage: 1, hasMoreSessions: true });
        }

        set({ sessionsLoading: true, sessionsError: null });

        try {
          const token = get()._getAuthToken();
          const { sessionsPage } = get();

          const response = await chatService.getSessions(
            token,
            sessionsPage,
            20,
          );

          set((state) => ({
            sessions: refresh
              ? response.sessions
              : [...state.sessions, ...response.sessions],
            hasMoreSessions: response.hasMore,
            sessionsPage: sessionsPage + 1,
            sessionsLoading: false,
          }));
        } catch (error: any) {
          set({ sessionsLoading: false });
          await get()._handleApiError(error, 'load sessions');
        }
      },

      updateSession: async (sessionId: string, data: UpdateSessionRequest) => {
        set({ isLoading: true, error: null });

        try {
          const token = get()._getAuthToken();
          const updatedSession = await chatService.updateSession(
            sessionId,
            data,
            token,
          );

          set((state) => ({
            sessions: state.sessions.map((session) =>
              session.id === sessionId ? updatedSession : session,
            ),
            currentSession:
              state.currentSession?.id === sessionId
                ? updatedSession
                : state.currentSession,
            isLoading: false,
          }));

          // Show success toast
          const { useToastStore } = await import('./ToastStore');
          useToastStore.getState().success('Session updated successfully');
        } catch (error: any) {
          set({ isLoading: false });
          await get()._handleApiError(error, 'update session');
          throw error;
        }
      },

      deleteSession: async (sessionId: string) => {
        set({ isLoading: true, error: null });

        try {
          const token = get()._getAuthToken();
          await chatService.deleteSession(sessionId, token);

          set((state) => ({
            sessions: state.sessions.filter(
              (session) => session.id !== sessionId,
            ),
            currentSession:
              state.currentSession?.id === sessionId
                ? null
                : state.currentSession,
            currentMessages:
              state.currentSession?.id === sessionId
                ? []
                : state.currentMessages,
            isLoading: false,
          }));

          // Show success toast
          const { useToastStore } = await import('./ToastStore');
          useToastStore.getState().success('Session deleted');
        } catch (error: any) {
          set({ isLoading: false });
          await get()._handleApiError(error, 'delete session');
          throw error;
        }
      },

      starSession: async (sessionId: string) => {
        try {
          const token = get()._getAuthToken();
          await chatService.starSession(sessionId, token);
          await get().updateSession(sessionId, { isStarred: true });
        } catch (error: any) {
          await get()._handleApiError(error, 'star session');
          throw error;
        }
      },

      unstarSession: async (sessionId: string) => {
        try {
          const token = get()._getAuthToken();
          await chatService.unstarSession(sessionId, token);
          await get().updateSession(sessionId, { isStarred: false });
        } catch (error: any) {
          await get()._handleApiError(error, 'unstar session');
          throw error;
        }
      },

      // Message management actions
      sendMessage: async (data: SendMessageRequest) => {
        set({ isSending: true, error: null });

        try {
          const token = get()._getAuthToken();
          let { currentSession } = get();

          // Ensure we have a current session
          if (!currentSession) {
            currentSession = await get().createSession({
              title:
                data.message.substring(0, 50) +
                (data.message.length > 50 ? '...' : ''),
              subject: data.subject,
              quickAction: data.quickAction,
              initialMessage: data.message,
            });
          }

          // Add user message immediately
          const userMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            message: data.message,
            isUser: true,
            timestamp: new Date(),
            attachments: data.attachments,
          };

          set((state) => ({
            currentMessages: [...state.currentMessages, userMessage],
            hasStartedChat: true,
            isTyping: true,
          }));

          // Send message to API
          const sentMessage = await chatService.sendMessage(
            {
              ...data,
              sessionId: currentSession.id,
            },
            token,
          );

          // Replace temporary message with actual sent message
          set((state) => ({
            currentMessages: state.currentMessages.map((msg) =>
              msg.id === userMessage.id ? sentMessage : msg,
            ),
            isSending: false,
            isTyping: false,
          }));

          return sentMessage;
        } catch (error: any) {
          set({ isSending: false, isTyping: false });

          // Remove temporary message on error
          set((state) => ({
            currentMessages: state.currentMessages.filter(
              (msg) => !msg.id.startsWith('temp-'),
            ),
          }));

          await get()._handleApiError(error, 'send message');
          throw error;
        }
      },

      sendMessageStream: async (
        data: SendMessageRequest,
        onToken?: (token: string) => void,
      ) => {
        set({ isSending: true, error: null });

        try {
          const token = get()._getAuthToken();
          let { currentSession } = get();

          // Ensure we have a current session
          if (!currentSession) {
            currentSession = await get().createSession({
              title:
                data.message.substring(0, 50) +
                (data.message.length > 50 ? '...' : ''),
              subject: data.subject,
              quickAction: data.quickAction,
              initialMessage: data.message,
            });
          }

          // Add user message immediately
          const userMessage: ChatMessage = {
            id: `temp-user-${Date.now()}`,
            message: data.message,
            isUser: true,
            timestamp: new Date(),
            attachments: data.attachments,
          };

          // Add streaming response placeholder
          const streamingMessage: ChatMessage = {
            id: `temp-assistant-${Date.now()}`,
            message: '',
            isUser: false,
            timestamp: new Date(),
            isTyping: true,
          };

          set((state) => ({
            currentMessages: [
              ...state.currentMessages,
              userMessage,
              streamingMessage,
            ],
            hasStartedChat: true,
            isTyping: true,
          }));

          let completeMessage: ChatMessage | null = null;

          await chatService.sendMessageStream(
            { ...data, sessionId: currentSession.id },
            token,
            (tokenText: string) => {
              // Update streaming message with new token
              set((state) => ({
                currentMessages: state.currentMessages.map((msg) =>
                  msg.id === streamingMessage.id
                    ? { ...msg, message: msg.message + tokenText }
                    : msg,
                ),
              }));
              onToken?.(tokenText);
            },
            (message: ChatMessage) => {
              completeMessage = message;
              // Replace streaming message with complete message
              set((state) => ({
                currentMessages: state.currentMessages.map((msg) => {
                  if (msg.id === streamingMessage.id) {
                    return { ...message, isTyping: false };
                  }
                  if (msg.id === userMessage.id) {
                    return { ...msg, id: message.id }; // Update with real ID if provided
                  }
                  return msg;
                }),
                isTyping: false,
                isSending: false,
              }));
            },
            (error: Error) => {
              set({ isSending: false, isTyping: false });
              // Remove temporary messages on error
              set((state) => ({
                currentMessages: state.currentMessages.filter(
                  (msg) =>
                    ![userMessage.id, streamingMessage.id].includes(msg.id),
                ),
              }));
              throw error;
            },
          );

          return completeMessage || userMessage;
        } catch (error: any) {
          await get()._handleApiError(error, 'send message');
          throw error;
        }
      },

      loadMessages: async (sessionId: string, refresh = false) => {
        if (refresh) {
          set({ messagesPage: 1, hasMoreMessages: true });
        }

        set({ isLoading: true, error: null });

        try {
          const token = get()._getAuthToken();
          const { messagesPage } = get();

          const response = await chatService.getMessages(
            { sessionId, page: messagesPage, limit: 50 },
            token,
          );

          set((state) => ({
            currentMessages: refresh
              ? response.messages
              : [...response.messages, ...state.currentMessages],
            hasMoreMessages: response.hasMore,
            messagesPage: messagesPage + 1,
            hasStartedChat: response.messages.length > 0,
            isLoading: false,
          }));
        } catch (error: any) {
          set({ isLoading: false });
          await get()._handleApiError(error, 'load messages');
        }
      },

      loadMoreMessages: async () => {
        const { currentSession, hasMoreMessages, isLoading } = get();
        if (!currentSession || !hasMoreMessages || isLoading) return;

        await get().loadMessages(currentSession.id, false);
      },

      regenerateMessage: async (data: RegenerateMessageRequest) => {
        set({ isTyping: true, error: null });

        try {
          const token = get()._getAuthToken();
          const regeneratedMessage = await chatService.regenerateMessage(
            data,
            token,
          );

          set((state) => ({
            currentMessages: state.currentMessages.map((msg) =>
              msg.id === data.messageId ? regeneratedMessage : msg,
            ),
            isTyping: false,
          }));
        } catch (error: any) {
          set({ isTyping: false });
          await get()._handleApiError(error, 'regenerate message');
          throw error;
        }
      },

      submitMessageFeedback: async (data: MessageFeedbackRequest) => {
        try {
          const token = get()._getAuthToken();
          await chatService.submitMessageFeedback(data, token);

          set((state) => ({
            currentMessages: state.currentMessages.map((msg) =>
              msg.id === data.messageId
                ? {
                    ...msg,
                    metadata: {
                      ...msg.metadata,
                      liked: data.type === 'like' ? true : msg.metadata?.liked,
                      disliked:
                        data.type === 'dislike' ? true : msg.metadata?.disliked,
                    },
                  }
                : msg,
            ),
          }));
        } catch (error: any) {
          await get()._handleApiError(error, 'submit feedback');
          throw error;
        }
      },

      // Search functionality
      searchSessions: async (query: string) => {
        set({ sessionsLoading: true, sessionsError: null });

        try {
          const token = get()._getAuthToken();
          const response = await chatService.searchSessions(query, token);

          set({
            sessions: response.sessions,
            hasMoreSessions: response.hasMore,
            sessionsLoading: false,
          });
        } catch (error: any) {
          set({ sessionsLoading: false });
          await get()._handleApiError(error, 'search sessions');
        }
      },

      searchMessages: async (query: string) => {
        const { currentSession } = get();
        if (!currentSession) return;

        set({ isLoading: true, error: null });

        try {
          const token = get()._getAuthToken();
          const response = await chatService.searchMessages(
            currentSession.id,
            query,
            token,
          );

          set({
            currentMessages: response.messages,
            hasMoreMessages: response.hasMore,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          await get()._handleApiError(error, 'search messages');
        }
      },

      // UI actions
      startChat: () => set({ hasStartedChat: true }),

      resetChat: () =>
        set({
          currentSession: null,
          currentMessages: [],
          hasStartedChat: false,
          selectedSubject: null,
          selectedAction: null,
          userText: '',
          isTyping: false,
          error: null,
          messagesPage: 1,
          hasMoreMessages: true,
        }),

      setUserText: (text: string) => set({ userText: text }),

      setSelectedSubject: (subjectId: string | null) =>
        set({ selectedSubject: subjectId }),

      setSelectedAction: (action: QuickAction | null) =>
        set({ selectedAction: action }),

      setIsTyping: (typing: boolean) => set({ isTyping: typing }),

      // Message interaction handlers
      handleCopyMessage: async (messageText: string) => {
        try {
          await navigator.clipboard.writeText(messageText);

          // Show success toast
          const { useToastStore } = await import('./ToastStore');
          useToastStore.getState().success('Message copied to clipboard');
        } catch (error) {
          // Show error toast
          const { useToastStore } = await import('./ToastStore');
          useToastStore.getState().error('Failed to copy message');
        }
      },

      handleLikeMessage: async (messageId: string) => {
        const { currentSession } = get();
        if (!currentSession) return;

        try {
          await get().submitMessageFeedback({
            messageId,
            sessionId: currentSession.id,
            type: 'like',
          });

          // Show success toast
          const { useToastStore } = await import('./ToastStore');
          useToastStore.getState().success('Thank you for your feedback!');
        } catch (error) {
          // Error handling is done in submitMessageFeedback
        }
      },

      handleDislikeMessage: async (messageId: string) => {
        const { currentSession } = get();
        if (!currentSession) return;

        try {
          await get().submitMessageFeedback({
            messageId,
            sessionId: currentSession.id,
            type: 'dislike',
          });

          // Show success toast
          const { useToastStore } = await import('./ToastStore');
          useToastStore.getState().success('Thank you for your feedback!');
        } catch (error) {
          // Error handling is done in submitMessageFeedback
        }
      },

      handleRegenerateMessage: async (messageId: string) => {
        const { currentSession } = get();
        if (!currentSession) return;

        try {
          await get().regenerateMessage({
            messageId,
            sessionId: currentSession.id,
          });
        } catch (error) {
          // Error handling is done in regenerateMessage
        }
      },

      // State management utilities
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'StudyBuddy-Chat-Store',
      partialize: (state) => ({
        sessions: state.sessions,
        currentSession: state.currentSession,
        selectedSubject: state.selectedSubject,
        selectedAction: state.selectedAction,
      }),
    },
  ),
);
