import { ApiResponse } from './apiTypes';

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

export interface ChatMessage {
  id: string;
  sessionId: string;
  user_id: string;
  role: 'user' | 'assistant';
  status: 'pending' | 'completed' | 'failed' | 'streaming';
  message_type: 'text' | 'image' | 'file';
  content: string;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
  regenerated_at: string | null;
  attachments?: ChatAttachment[];
  function_calls: any[];
  tokens_used: number;
  parent_message_id: string | null;
  thread_id: string | null;
  feedback_score: number | null;
  feedback_text: string | null;
  is_pinned: boolean;
  is_hidden: boolean;
  model_name: string | null;
  generation_config: Record<string, any>;
  temperature: number | null;
  is_flagged: boolean;
  moderation_score: number | null;
  metadata?: ChatMessageMetadata;
  isTyping?: boolean;
}

export interface ChatSession {
  created_at: string;
  id: string;
  isStarred?: boolean;
  last_activity?: string;
  messageCount?: number;
  metadata?: ChatMessageMetadata;
  model_config?: {};
  title: string;
  updated_at: string;
  user_id?: string;
  lastMessage: string;
  subject?: string;
  quickAction?: string;
}

export interface ModelConfig {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  functions?: any[];
  tools?: any[];
}

export interface SendMessageRequest {
  content: string;
  sessionId?: string;
  subject?: string;
  quickAction?: string;
  attachments?: ChatAttachment[];
  modelConfig?: ModelConfig;
}

export interface SendMessageData {
  id: string;
  sessionId: string;
  user_id: string;
  role: 'user' | 'assistant';
  status: 'pending' | 'completed' | 'failed' | 'streaming';
  message_type: 'text' | 'image' | 'file';
  content: string;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
  regenerated_at: string | null;
  attachments?: ChatAttachment[];
  function_calls: any[];
  tokens_used: number;
  parent_message_id: string | null;
  thread_id: string | null;
  feedback_score: number | null;
  feedback_text: string | null;
  is_pinned: boolean;
  is_hidden: boolean;
  model_name: string | null;
  generation_config: Record<string, any>;
  temperature: number | null;
  is_flagged: boolean;
  moderation_score: number | null;
  metadata?: ChatMessageMetadata;
  isTyping?: boolean;
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
  created_at: string;
  updated_at: string;
  is_starred: boolean;
  message_count: number;
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
