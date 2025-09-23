import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

  // Session management actions
  createSession: (data?: CreateSessionRequest) => Promise<ChatSession>;
  loadSession: (sessionId: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  updateSession: (
    sessionId: string,
    data: UpdateSessionRequest,
  ) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  starSession: (sessionId: string) => Promise<void>;
  unstarSession: (sessionId: string) => Promise<void>;

  // Message management actions
  sendMessage: (data: SendMessageRequest) => Promise<ChatMessage>;
  loadMessages: (sessionId: string, page?: number) => Promise<void>;
  regenerateMessage: (data: RegenerateMessageRequest) => Promise<void>;
  submitMessageFeedback: (data: MessageFeedbackRequest) => Promise<void>;

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

      // Session management actions
      createSession: async (data?: CreateSessionRequest) => {
        set({ isLoading: true, error: null });

        try {
          // This will be replaced with actual API call
          const newSession: ChatSession = {
            id: Date.now().toString(),
            title: data?.title || 'New Chat',
            lastMessage: data?.initialMessage || '',
            timestamp: new Date(),
            isStarred: false,
            messageCount: 0,
            subject: data?.subject,
            quickAction: data?.quickAction,
          };

          set((state) => ({
            currentSession: newSession,
            sessions: [newSession, ...state.sessions],
            hasStartedChat: false,
            currentMessages: [],
            isLoading: false,
          }));

          // Show success toast
          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore.getState().success('New chat session created');

          return newSession;
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to create chat session';
          set({ error: errorMessage, isLoading: false });

          // Show error toast
          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore.getState().error(errorMessage, {
            title: 'Session Creation Failed',
          });
          throw error;
        }
      },

      loadSession: async (sessionId: string) => {
        set({ isLoading: true, error: null });

        try {
          // This will be replaced with actual API calls
          const session = get().sessions.find((s) => s.id === sessionId);
          if (!session) {
            throw new Error('Session not found');
          }

          // Mock loading messages - replace with actual API call
          const messages: ChatMessage[] = [];

          set({
            currentSession: session,
            currentMessages: messages,
            hasStartedChat: messages.length > 0,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to load session';
          set({ error: errorMessage, isLoading: false });

          // Show error toast
          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore.getState().error(errorMessage, {
            title: 'Session Load Failed',
          });
          throw error;
        }
      },

      loadSessions: async () => {
        set({ sessionsLoading: true, sessionsError: null });

        try {
          // This will be replaced with actual API call
          // Mock data for now
          const mockSessions: ChatSession[] = [
            {
              id: '1',
              title: 'React Hooks Tutorial',
              lastMessage: 'Can you explain useEffect dependencies?',
              timestamp: new Date(Date.now() - 1000 * 60 * 30),
              isStarred: true,
              messageCount: 12,
            },
            {
              id: '2',
              title: 'Calculus Study Guide',
              lastMessage: 'Create a derivatives practice quiz',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
              isStarred: false,
              messageCount: 8,
            },
          ];

          set({
            sessions: mockSessions,
            sessionsLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to load sessions';
          set({
            sessionsError: errorMessage,
            sessionsLoading: false,
          });

          // Show error toast
          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore.getState().error(errorMessage, {
            title: 'Failed to Load Sessions',
          });
        }
      },

      updateSession: async (sessionId: string, data: UpdateSessionRequest) => {
        set({ isLoading: true, error: null });

        try {
          // This will be replaced with actual API call
          set((state) => ({
            sessions: state.sessions.map((session) =>
              session.id === sessionId
                ? { ...session, ...data, timestamp: new Date() }
                : session,
            ),
            currentSession:
              state.currentSession?.id === sessionId
                ? { ...state.currentSession, ...data }
                : state.currentSession,
            isLoading: false,
          }));

          // Show success toast
          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore.getState().success('Session updated successfully');
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to update session';
          set({ error: errorMessage, isLoading: false });

          // Show error toast
          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore.getState().error(errorMessage, {
            title: 'Update Failed',
          });
          throw error;
        }
      },

      deleteSession: async (sessionId: string) => {
        set({ isLoading: true, error: null });

        try {
          // This will be replaced with actual API call
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
          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore.getState().success('Session deleted');
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to delete session';
          set({ error: errorMessage, isLoading: false });

          // Show error toast
          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore.getState().error(errorMessage, {
            title: 'Delete Failed',
          });
          throw error;
        }
      },

      starSession: async (sessionId: string) => {
        await get().updateSession(sessionId, { isStarred: true });
      },

      unstarSession: async (sessionId: string) => {
        await get().updateSession(sessionId, { isStarred: false });
      },

      // Message management actions
      sendMessage: async (data: SendMessageRequest) => {
        set({ isSending: true, error: null });

        try {
          // Ensure we have a current session
          let { currentSession } = get();
          if (!currentSession) {
            currentSession = await get().createSession({
              title: data.message.substring(0, 50) + '...',
              subject: data.subject,
              quickAction: data.quickAction,
              initialMessage: data.message,
            });
          }

          // Add user message immediately
          const userMessage: ChatMessage = {
            id: Date.now().toString(),
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

          // Add typing indicator
          const typingMessage: ChatMessage = {
            id: 'typing',
            message: '',
            isUser: false,
            timestamp: new Date(),
            isTyping: true,
          };

          set((state) => ({
            currentMessages: [...state.currentMessages, typingMessage],
          }));

          // This will be replaced with actual API call
          // Mock response for now
          setTimeout(async () => {
            const botResponse: ChatMessage = {
              id: (Date.now() + 1).toString(),
              message: `I understand you'd like help with: "${data.message}". Let me assist you with that!`,
              isUser: false,
              timestamp: new Date(),
            };

            set((state) => ({
              currentMessages: [
                ...state.currentMessages.filter((msg) => msg.id !== 'typing'),
                botResponse,
              ],
              isTyping: false,
              isSending: false,
            }));

            // Update session with latest message
            await get().updateSession(currentSession!.id, {
              title:
                currentSession!.messageCount === 0
                  ? data.message.substring(0, 50) +
                    (data.message.length > 50 ? '...' : '')
                  : currentSession!.title,
            });
          }, 2000);

          return userMessage;
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to send message';
          set({
            error: errorMessage,
            isSending: false,
            isTyping: false,
          });

          // Remove typing indicator on error
          set((state) => ({
            currentMessages: state.currentMessages.filter(
              (msg) => msg.id !== 'typing',
            ),
          }));

          // Show error toast
          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore.getState().error(errorMessage, {
            title: 'Message Failed',
          });
          throw error;
        }
      },

      loadMessages: async (sessionId: string, page = 1) => {
        set({ isLoading: true, error: null });

        try {
          // This will be replaced with actual API call
          // Mock implementation
          set({ isLoading: false });
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to load messages';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      regenerateMessage: async (data: RegenerateMessageRequest) => {
        set({ isTyping: true, error: null });

        try {
          // This will be replaced with actual API call
          // Mock implementation
          setTimeout(() => {
            set((state) => ({
              currentMessages: state.currentMessages.map((msg) =>
                msg.id === data.messageId
                  ? {
                      ...msg,
                      message: `Regenerated: ${msg.message}`,
                      metadata: {
                        ...msg.metadata,
                        regenerationCount:
                          (msg.metadata?.regenerationCount || 0) + 1,
                      },
                    }
                  : msg,
              ),
              isTyping: false,
            }));
          }, 2000);
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to regenerate message';
          set({ error: errorMessage, isTyping: false });

          // Show error toast
          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore.getState().error(errorMessage, {
            title: 'Regeneration Failed',
          });
          throw error;
        }
      },

      submitMessageFeedback: async (data: MessageFeedbackRequest) => {
        try {
          // This will be replaced with actual API call
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
          const errorMessage = error.message || 'Failed to submit feedback';
          set({ error: errorMessage });
          throw error;
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
          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore.getState().success('Message copied to clipboard');
        } catch (error) {
          // Show error toast
          const { useToastStore } = await import('../stores/ToastStore');
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
          const { useToastStore } = await import('../stores/ToastStore');
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
          const { useToastStore } = await import('../stores/ToastStore');
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
