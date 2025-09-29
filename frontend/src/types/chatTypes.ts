import { ApiResponse } from './apiTypes';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
  attachments?: ChatAttachment[];
  metadata?: ChatMessageMetadata;
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  data?: string;
}

export interface ChatMessageMetadata {
  regenerationCount?: number;
  liked?: boolean;
  disliked?: boolean;
  copied?: boolean;
  tokens?: number;
  processingTime?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isStarred: boolean;
  messageCount: number;
  subject?: string;
  quickAction?: string;
}

export interface SendMessageRequest {
  content: string;
  sessionId?: string;
  subject?: string;
  quickAction?: string;
  attachments?: ChatAttachment[];
  metadata?: {
    userAgent?: string;
    timestamp: string;
  };
}

export interface SendMessageData {
  id: string;
  content: string;
  timestamp: string;
  sessionId: string;
  metadata?: ChatMessageMetadata;
}

export type SendMessageResponse = ApiResponse<SendMessageData>;

export interface CreateSessionRequest {
  title?: string;
  subject?: string;
  quickAction?: string;
  initialMessage?: string;
}

export interface CreateSessionResponse {
  id: string;
  title: string;
  timestamp: string;
}

export interface GetSessionsResponse {
  sessions: ChatSession[];
  totalCount: number;
  hasMore: boolean;
}

export interface GetMessagesRequest {
  sessionId: string;
  page?: number;
  limit?: number;
  before?: string;
}

export interface GetMessagesResponse {
  messages: ChatMessage[];
  hasMore: boolean;
  totalCount: number;
}

export interface UpdateSessionRequest {
  title?: string;
  isStarred?: boolean;
}

export interface RegenerateMessageRequest {
  messageId: string;
  sessionId: string;
}

export interface MessageFeedbackRequest {
  messageId: string;
  sessionId: string;
  type: 'like' | 'dislike';
  feedback?: string;
}
