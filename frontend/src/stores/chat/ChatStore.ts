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
  SessionType,
} from '../../types/chatTypes';
import { QuickAction } from '../../types/uiTypes';
import * as actions from './ChatActions';

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
  isSidebarOpen: boolean;

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
  createSessionAndSend: (
    data: SendMessageRequest & {
      title?: string;
      session_type?: SessionType;
      subject?: string;
      quickAction?: string;
    },
  ) => Promise<ChatSession>;
  loadSession: (sessionId: string) => Promise<void>;
  loadSessions: (refresh?: boolean, sessionType?: SessionType) => Promise<void>;
  updateSession: (
    sessionId: string,
    data: UpdateSessionRequest,
  ) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  starSession: (sessionId: string) => Promise<void>;
  unstarSession: (sessionId: string) => Promise<void>;

  // Message management actions
  sendMessage: (
    data: SendMessageRequest,
    onToken?: (token: string) => void,
  ) => Promise<ChatMessage>;
  loadMessages: (sessionId: string, refresh?: boolean) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  regenerateMessage: (data: RegenerateMessageRequest) => Promise<void>;
  submitMessageFeedback: (data: MessageFeedbackRequest) => Promise<void>;

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
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;

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
      isSidebarOpen: false,
      isLoading: false,
      isSending: false,
      error: null,
      hasMoreMessages: true,
      hasMoreSessions: true,
      messagesPage: 1,
      sessionsPage: 1,

      // Session management actions
      createSession: (data) => actions.createSessionAction(data, set, get),
      createSessionAndSend: (data) =>
        actions.createSessionAndSendAction(data, set, get),
      loadSession: (sessionId) =>
        actions.loadSessionAction(sessionId, set, get),
      loadSessions: (refresh = false, sessionType) =>
        actions.loadSessionsAction(refresh, set, get, sessionType),
      updateSession: (sessionId, data) =>
        actions.updateSessionAction(sessionId, data, set, get),
      deleteSession: (sessionId) =>
        actions.deleteSessionAction(sessionId, set, get),
      starSession: (sessionId) =>
        actions.starSessionAction(sessionId, set, get),
      unstarSession: (sessionId) =>
        actions.unstarSessionAction(sessionId, set, get),

      // Message management actions
      sendMessage: (data, onToken) =>
        actions.sendMessageAction(data, onToken, set, get),
      loadMessages: (sessionId, refresh = false) =>
        actions.loadMessagesAction(sessionId, refresh, set, get),
      loadMoreMessages: async () => {
        const { currentSession, hasMoreMessages, isLoading } = get();
        if (!currentSession || !hasMoreMessages || isLoading) return;
        await get().loadMessages(currentSession.id, false);
      },
      regenerateMessage: (data) =>
        actions.regenerateMessageAction(data, set, get),
      submitMessageFeedback: (data) =>
        actions.submitMessageFeedbackAction(data, set, get),

      // Search functionality
      searchSessions: (query) => actions.searchSessionsAction(query, set, get),
      searchMessages: (query) => actions.searchMessagesAction(query, set, get),

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
      setUserText: (text) => set({ userText: text }),
      setSelectedSubject: (subjectId) => set({ selectedSubject: subjectId }),
      setSelectedAction: (action) => set({ selectedAction: action }),
      setIsTyping: (typing) => set({ isTyping: typing }),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      // Message interaction handlers
      handleCopyMessage: (messageText) =>
        actions.handleCopyMessageAction(messageText),
      handleLikeMessage: (messageId) =>
        actions.handleLikeMessageAction(messageId, get),
      handleDislikeMessage: (messageId) =>
        actions.handleDislikeMessageAction(messageId, get),
      handleRegenerateMessage: (messageId) =>
        actions.handleRegenerateMessageAction(messageId, get),

      // State management utilities
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'StudyBuddy-Chat-Store',
      partialize: (state) => ({
        sessions: state.sessions,
        currentSession: state.currentSession,
        selectedSubject: state.selectedSubject,
        selectedAction: state.selectedAction,
        isSidebarOpen: state.isSidebarOpen,
      }),
    },
  ),
);
