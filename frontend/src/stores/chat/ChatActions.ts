import { chatService } from '../../services/chatService';
import { getAuthToken, handleApiError } from '../chat/ChatHelpers';
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

// Type for the store's set function
type SetState = (partial: any) => void;
type GetState = () => any;

export const createSessionAction = async (
  data: CreateSessionRequest | undefined,
  set: SetState,
  get: GetState,
): Promise<ChatSession> => {
  set({ isLoading: true, error: null });

  try {
    const token = getAuthToken();
    const newSession = await chatService.createSession(data || {}, token);

    set((state: any) => ({
      currentSession: newSession,
      sessions: [newSession, ...state.sessions],
      hasStartedChat: false,
      currentMessages: [],
      isLoading: false,
    }));

    return newSession;
  } catch (error: any) {
    set({ isLoading: false });
    const errorMessage = await handleApiError(error, 'create session');
    set({ error: errorMessage });
    throw error;
  }
};

export const createSessionAndSendAction = async (
  data: SendMessageRequest & {
    title?: string;
    session_type?: SessionType;
    subject?: string;
    quickAction?: string;
  },
  set: SetState,
  get: GetState,
): Promise<ChatSession> => {
  set({ isSending: true, error: null });

  try {
    const token = getAuthToken();

    const newSession = await chatService.createSession(
      {
        title:
          data.title ||
          data.content.substring(0, 50) +
            (data.content.length > 50 ? '...' : ''),
        session_type: data.session_type || 'chat',
        subject: data.subject,
        quickAction: data.quickAction,
        initialMessage: data.content,
      },
      token,
    );

    set((state: any) => ({
      currentSession: newSession,
      sessions: [newSession, ...state.sessions],
      hasStartedChat: true,
      currentMessages: [],
      isLoading: false,
    }));

    // Send message in background
    get()
      .sendMessage(data)
      .catch((error: any) => {
        console.error('Error sending initial message:', error);
      });

    return newSession;
  } catch (error: any) {
    set({ isSending: false, isLoading: false });
    const errorMessage = await handleApiError(
      error,
      'create session and send message',
    );
    set({ error: errorMessage });
    throw error;
  }
};

export const loadSessionAction = async (
  sessionId: string,
  set: SetState,
  get: GetState,
): Promise<void> => {
  set({ isLoading: true, error: null });

  try {
    const token = getAuthToken();
    const session = await chatService.getSession(sessionId, token);

    const { currentSession, currentMessages } = get();

    const shouldLoadMessages =
      currentSession?.id !== sessionId || currentMessages.length === 0;

    set({
      currentSession: session,
      hasStartedChat: true,
      messagesPage: 1,
      hasMoreMessages: true,
      isLoading: false,
    });

    if (shouldLoadMessages) {
      set({ currentMessages: [] });
      await get().loadMessages(sessionId, true);
    }
  } catch (error: any) {
    set({ isLoading: false, currentSession: null });
    const errorMessage = await handleApiError(error, 'load session');
    set({ error: errorMessage });
    throw error;
  }
};

export const loadSessionsAction = async (
  refresh: boolean,
  set: SetState,
  get: GetState,
  sessionType?: SessionType,
): Promise<void> => {
  if (refresh) {
    set({ sessionsPage: 1, hasMoreSessions: true });
  }

  set({ sessionsLoading: true, sessionsError: null });

  try {
    const token = getAuthToken();
    const { sessionsPage } = get();

    const response = await chatService.getSessions(token, {
      page: sessionsPage,
      limit: 20,
      session_type: sessionType,
    });

    set((state: any) => {
      const allSessions = refresh
        ? response.sessions
        : [...state.sessions, ...response.sessions];

      const uniqueSessions = Array.from(
        new Map(allSessions.map((session) => [session.id, session])).values(),
      );

      return {
        sessions: uniqueSessions,
        hasMoreSessions: response.hasMore,
        sessionsPage: sessionsPage + 1,
        sessionsLoading: false,
      };
    });
  } catch (error: any) {
    set({ sessionsLoading: false });
    const errorMessage = await handleApiError(error, 'load sessions');
    set({ sessionsError: errorMessage });
  }
};

export const updateSessionAction = async (
  sessionId: string,
  data: UpdateSessionRequest,
  set: SetState,
  get: GetState,
): Promise<void> => {
  set({ isLoading: true, error: null });

  try {
    const token = getAuthToken();
    const updatedSession = await chatService.updateSession(
      sessionId,
      data,
      token,
    );

    set((state: any) => ({
      sessions: state.sessions.map((session: ChatSession) =>
        session.id === sessionId ? updatedSession : session,
      ),
      currentSession:
        state.currentSession?.id === sessionId
          ? updatedSession
          : state.currentSession,
      isLoading: false,
    }));

    const { useToastStore } = await import('../ToastStore');
    useToastStore.getState().success('Session updated successfully');
  } catch (error: any) {
    set({ isLoading: false });
    const errorMessage = await handleApiError(error, 'update session');
    set({ error: errorMessage });
    throw error;
  }
};

export const deleteSessionAction = async (
  sessionId: string,
  set: SetState,
  get: GetState,
): Promise<void> => {
  set({ isLoading: true, error: null });

  try {
    const token = getAuthToken();
    await chatService.deleteSession(sessionId, token);

    set((state: any) => ({
      sessions: state.sessions.filter(
        (session: ChatSession) => session.id !== sessionId,
      ),
      currentSession:
        state.currentSession?.id === sessionId ? null : state.currentSession,
      currentMessages:
        state.currentSession?.id === sessionId ? [] : state.currentMessages,
      isLoading: false,
    }));

    const { useToastStore } = await import('../ToastStore');
    useToastStore.getState().success('Session deleted');
  } catch (error: any) {
    set({ isLoading: false });
    const errorMessage = await handleApiError(error, 'delete session');
    set({ error: errorMessage });
    throw error;
  }
};

export const starSessionAction = async (
  sessionId: string,
  set: SetState,
  get: GetState,
): Promise<void> => {
  try {
    const token = getAuthToken();
    await chatService.starSession(sessionId, token);
    await get().updateSession(sessionId, { isStarred: true });
  } catch (error: any) {
    const errorMessage = await handleApiError(error, 'star session');
    set({ error: errorMessage });
    throw error;
  }
};

export const unstarSessionAction = async (
  sessionId: string,
  set: SetState,
  get: GetState,
): Promise<void> => {
  try {
    const token = getAuthToken();
    await chatService.unstarSession(sessionId, token);
    await get().updateSession(sessionId, { isStarred: false });
  } catch (error: any) {
    const errorMessage = await handleApiError(error, 'unstar session');
    set({ error: errorMessage });
    throw error;
  }
};

export const sendMessageAction = async (
  data: SendMessageRequest,
  onToken: ((token: string) => void) | undefined,
  set: SetState,
  get: GetState,
): Promise<ChatMessage> => {
  set({ isSending: true, error: null });

  try {
    const token = getAuthToken();
    const { currentSession } = get();

    if (!currentSession) {
      throw new Error('No active session found');
    }

    const userMessage: ChatMessage = {
      id: `temp-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId: currentSession.id,
      user_id: '',
      content: data.content,
      role: 'user',
      status: 'pending',
      message_type: 'text',
      created_at: new Date().toISOString(),
      updated_at: null,
      completed_at: null,
      regenerated_at: null,
      attachments: data.attachments || [],
      function_calls: [],
      tokens_used: 0,
      parent_message_id: null,
      thread_id: null,
      feedback_score: null,
      feedback_text: null,
      is_pinned: false,
      is_hidden: false,
      model_name: null,
      generation_config: {},
      temperature: null,
      is_flagged: false,
      moderation_score: null,
      metadata: {},
    };

    const streamingMessage: ChatMessage = {
      id: `temp-assistant-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      sessionId: currentSession.id,
      user_id: '',
      content: '',
      role: 'assistant',
      status: 'streaming',
      message_type: 'text',
      created_at: new Date().toISOString(),
      updated_at: null,
      completed_at: null,
      regenerated_at: null,
      attachments: [],
      function_calls: [],
      tokens_used: 0,
      parent_message_id: null,
      thread_id: null,
      feedback_score: null,
      feedback_text: null,
      is_pinned: false,
      is_hidden: false,
      model_name: null,
      generation_config: {},
      temperature: null,
      is_flagged: false,
      moderation_score: null,
      metadata: {},
      isTyping: true,
    };

    set((state: any) => ({
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
        set((state: any) => ({
          currentMessages: state.currentMessages.map((msg: ChatMessage) =>
            msg.id === streamingMessage.id
              ? {
                  ...msg,
                  content: msg.content + tokenText,
                  isTyping: false,
                }
              : msg,
          ),
        }));
        onToken?.(tokenText);
      },
      (message: ChatMessage) => {
        completeMessage = message;
        set((state: any) => ({
          currentMessages: state.currentMessages.map((msg: ChatMessage) => {
            if (msg.id === streamingMessage.id) {
              return { ...message, isTyping: false };
            }
            if (msg.id === userMessage.id) {
              return { ...msg, status: 'completed' };
            }
            return msg;
          }),
          isTyping: false,
          isSending: false,
        }));
      },
      (error: Error) => {
        set({ isSending: false, isTyping: false });
        set((state: any) => ({
          currentMessages: state.currentMessages.filter(
            (msg: ChatMessage) =>
              ![userMessage.id, streamingMessage.id].includes(msg.id),
          ),
        }));
        throw error;
      },
    );

    return completeMessage || userMessage;
  } catch (error: any) {
    const errorMessage = await handleApiError(error, 'send message');
    set({ error: errorMessage });
    throw error;
  }
};

export const loadMessagesAction = async (
  sessionId: string,
  refresh: boolean,
  set: SetState,
  get: GetState,
): Promise<void> => {
  if (refresh) {
    set({ messagesPage: 1, hasMoreMessages: true });
  }

  set({ isLoading: true, error: null });

  try {
    const token = getAuthToken();
    const { messagesPage } = get();

    const response = await chatService.getMessages(
      { sessionId, page: messagesPage, limit: 50 },
      token,
    );

    set((state: any) => ({
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
    const errorMessage = await handleApiError(error, 'load messages');
    set({ error: errorMessage });
  }
};

export const regenerateMessageAction = async (
  data: RegenerateMessageRequest,
  set: SetState,
  get: GetState,
): Promise<void> => {
  set({ isTyping: true, error: null });

  try {
    const token = getAuthToken();
    const regeneratedMessage = await chatService.regenerateMessage(data, token);

    set((state: any) => ({
      currentMessages: state.currentMessages.map((msg: ChatMessage) =>
        msg.id === data.messageId ? regeneratedMessage : msg,
      ),
      isTyping: false,
    }));
  } catch (error: any) {
    set({ isTyping: false });
    const errorMessage = await handleApiError(error, 'regenerate message');
    set({ error: errorMessage });
    throw error;
  }
};

export const submitMessageFeedbackAction = async (
  data: MessageFeedbackRequest,
  set: SetState,
  get: GetState,
): Promise<void> => {
  try {
    const token = getAuthToken();
    await chatService.submitMessageFeedback(data, token);

    set((state: any) => ({
      currentMessages: state.currentMessages.map((msg: ChatMessage) =>
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
    const errorMessage = await handleApiError(error, 'submit feedback');
    set({ error: errorMessage });
    throw error;
  }
};

export const searchSessionsAction = async (
  query: string,
  set: SetState,
  get: GetState,
): Promise<void> => {
  set({ sessionsLoading: true, sessionsError: null });

  try {
    const token = getAuthToken();
    const response = await chatService.searchSessions(query, token);

    set({
      sessions: response.sessions,
      hasMoreSessions: response.hasMore,
      sessionsLoading: false,
    });
  } catch (error: any) {
    set({ sessionsLoading: false });
    const errorMessage = await handleApiError(error, 'search sessions');
    set({ sessionsError: errorMessage });
  }
};

export const searchMessagesAction = async (
  query: string,
  set: SetState,
  get: GetState,
): Promise<void> => {
  const { currentSession } = get();
  if (!currentSession) return;

  set({ isLoading: true, error: null });

  try {
    const token = getAuthToken();
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
    const errorMessage = await handleApiError(error, 'search messages');
    set({ error: errorMessage });
  }
};

export const handleCopyMessageAction = async (
  messageText: string,
): Promise<void> => {
  try {
    await navigator.clipboard.writeText(messageText);
    const { useToastStore } = await import('../ToastStore');
    useToastStore.getState().success('Message copied to clipboard');
  } catch (error) {
    const { useToastStore } = await import('../ToastStore');
    useToastStore.getState().error('Failed to copy message');
  }
};

export const handleLikeMessageAction = async (
  messageId: string,
  get: GetState,
): Promise<void> => {
  const { currentSession } = get();
  if (!currentSession) return;

  try {
    await get().submitMessageFeedback({
      messageId,
      sessionId: currentSession.id,
      type: 'like',
    });

    const { useToastStore } = await import('../ToastStore');
    useToastStore.getState().success('Thank you for your feedback!');
  } catch (error) {
    // Error handling is done in submitMessageFeedback
  }
};

export const handleDislikeMessageAction = async (
  messageId: string,
  get: GetState,
): Promise<void> => {
  const { currentSession } = get();
  if (!currentSession) return;

  try {
    await get().submitMessageFeedback({
      messageId,
      sessionId: currentSession.id,
      type: 'dislike',
    });

    const { useToastStore } = await import('../ToastStore');
    useToastStore.getState().success('Thank you for your feedback!');
  } catch (error) {
    // Error handling is done in submitMessageFeedback
  }
};

export const handleRegenerateMessageAction = async (
  messageId: string,
  get: GetState,
): Promise<void> => {
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
};
