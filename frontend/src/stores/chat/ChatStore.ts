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
import * as actions from './ChatActions';

interface ChatStore {
  /** -------------------- State -------------------- */
  // Sessions
  sessions: ChatSession[];
  currentSession: ChatSession | null;

  // Flashcards
  flashcardsInput: string;
  isFlashcardsFlipped: boolean;
  currentFlashcardIndex: number;

  // Chat
  userText: string;
  isTyping: boolean;
  hasStartedChat: boolean;
  currentMessages: ChatMessage[];

  // Pagination
  hasMoreMessages: boolean;
  hasMoreSessions: boolean;
  messagesPage: number;
  sessionsPage: number;

  // UI
  isSidebarOpen: boolean;

  // Loading/Error
  isLoading: boolean;
  isSending: boolean;
  error: string | null;

  /** -------------------- Session Actions -------------------- */
  createSession: (data?: CreateSessionRequest) => Promise<ChatSession>;
  createSessionAndSendMessage: (
    data: SendMessageRequest & {
      title?: string;
      session_type?: SessionType;
      subject?: string;
      quickAction?: string;
      responseFormat?: 'json' | 'text';
      systemPrompt?: string;
    },
  ) => Promise<{ session: ChatSession; message: ChatMessage }>;
  createSessionAndSendMessageStream: (
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

  /** -------------------- Flashcard Actions -------------------- */
  setFlashcardsInput: (text: string) => void;
  setCurrentFlashcardIndex: (index: number) => void;
  setIsFlashcardsFlipped: (flipped: boolean) => void;
  resetFlashcardsState: () => void;

  /** -------------------- Message Actions -------------------- */
  sendMessage: (
    data: SendMessageRequest & {
      sessionId: string;
      responseFormat?: 'json' | 'text';
      systemPrompt?: string;
    },
  ) => Promise<ChatMessage>;
  sendMessageStream: (
    data: SendMessageRequest,
    onToken?: (token: string) => void,
  ) => Promise<ChatMessage>;
  loadMessages: (sessionId: string, refresh?: boolean) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  regenerateMessage: (data: RegenerateMessageRequest) => Promise<void>;
  submitMessageFeedback: (data: MessageFeedbackRequest) => Promise<void>;

  /** -------------------- Search Actions -------------------- */
  searchSessions: (query: string) => Promise<void>;
  searchMessages: (query: string) => Promise<void>;

  /** -------------------- UI Actions -------------------- */
  startChat: () => void;
  resetChat: () => void;
  setUserText: (text: string) => void;
  setIsTyping: (typing: boolean) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;

  /** -------------------- Message Interaction -------------------- */
  handleCopyMessage: (messageText: string) => Promise<void>;
  handleLikeMessage: (messageId: string) => Promise<void>;
  handleDislikeMessage: (messageId: string) => Promise<void>;
  handleRegenerateMessage: (messageId: string) => Promise<void>;

  /** -------------------- Utilities -------------------- */
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      /** -------------------- Initial State -------------------- */
      sessions: [],
      currentSession: null,
      flashcardsInput: '',
      isFlashcardsFlipped: false,
      currentFlashcardIndex: 0,
      currentFlashcards: [],
      userText: '',
      isTyping: false,
      hasStartedChat: false,
      currentMessages: [],
      hasMoreMessages: true,
      hasMoreSessions: true,
      messagesPage: 1,
      sessionsPage: 1,
      isSidebarOpen: false,
      isLoading: false,
      isSending: false,
      error: null,

      /** -------------------- Session Actions -------------------- */
      createSession: (data) => actions.createSessionAction(data, set, get),
      createSessionAndSendMessage: (data) =>
        actions.createSessionAndSendMessageAction(data, set, get),
      createSessionAndSendMessageStream: (data) =>
        actions.createSessionAndSendMessageStreamAction(data, set, get),
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

      /** -------------------- Flashcard Actions -------------------- */
      setFlashcardsInput: (text) => set({ flashcardsInput: text }),
      setIsFlashcardsFlipped: (flipped) =>
        set({ isFlashcardsFlipped: flipped }),
      setCurrentFlashcardIndex: (index) =>
        set({ currentFlashcardIndex: index }),
      resetFlashcardsState: () =>
        set({
          flashcardsInput: '',
          currentFlashcardIndex: 0,
          isFlashcardsFlipped: false,
        }),

      /** -------------------- Message Actions -------------------- */
      sendMessage: (data) => actions.sendMessageAction(data, set, get),
      sendMessageStream: (data, onToken) =>
        actions.sendMessageStreamAction(data, onToken, set, get),
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

      /** -------------------- Search Actions -------------------- */
      searchSessions: (query) => actions.searchSessionsAction(query, set, get),
      searchMessages: (query) => actions.searchMessagesAction(query, set, get),

      /** -------------------- UI Actions -------------------- */
      startChat: () => set({ hasStartedChat: true }),
      resetChat: () =>
        set({
          currentSession: null,
          currentMessages: [],
          hasStartedChat: false,
          userText: '',
          isTyping: false,
          error: null,
          messagesPage: 1,
          hasMoreMessages: true,
        }),
      setUserText: (text) => set({ userText: text }),
      setIsTyping: (typing) => set({ isTyping: typing }),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      /** -------------------- Message Interaction -------------------- */
      handleCopyMessage: (messageText) =>
        actions.handleCopyMessageAction(messageText),
      handleLikeMessage: (messageId) =>
        actions.handleLikeMessageAction(messageId, get),
      handleDislikeMessage: (messageId) =>
        actions.handleDislikeMessageAction(messageId, get),
      handleRegenerateMessage: (messageId) =>
        actions.handleRegenerateMessageAction(messageId, get),

      /** -------------------- Utilities -------------------- */
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'StudyBuddy-Chat-Store',
      partialize: (state) => ({
        sessions: state.sessions,
        currentSession: state.currentSession,
        isSidebarOpen: state.isSidebarOpen,
      }),
    },
  ),
);
