// Notification entity
export interface Notification {
  id: string;
  user_id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  created_at: string;
  timestamp: Date; // Transformed from created_at
  isRead: boolean; // Transformed from is_read
  is_read: boolean; // Backend field
  read_at?: string | null;
  metadata?: NotificationMetadata;
}

// Metadata for notifications
export interface NotificationMetadata {
  actionUrl?: string;
  actionText?: string;
  relatedEntityId?: string;
  relatedEntityType?:
    | 'chat'
    | 'session'
    | 'assignment'
    | 'quiz'
    | 'course'
    | 'study_session';
  icon?: string;
  imageUrl?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: NotificationCategory;
  expiresAt?: string;
  dismissible?: boolean;
}

// Notification categories
export type NotificationCategory =
  | 'chat'
  | 'study'
  | 'assignment'
  | 'quiz'
  | 'achievement'
  | 'reminder'
  | 'system'
  | 'social'
  | 'updates';

// Request/Response types
export interface GetNotificationsRequest {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  category?: NotificationCategory;
  startDate?: string;
  endDate?: string;
}

export interface GetNotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  unreadCount: number;
}

// Notification preferences
export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;

  // Category-specific settings
  chat_notifications: boolean;
  study_notifications: boolean;
  assignment_notifications: boolean;
  quiz_notifications: boolean;
  achievement_notifications: boolean;
  reminder_notifications: boolean;
  system_notifications: boolean;
  social_notifications: boolean;
  updates_notifications: boolean;

  // Quiet hours
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string; // HH:MM format
  quiet_hours_end?: string; // HH:MM format

  // Frequency settings
  digest_enabled: boolean;
  digest_frequency?: 'daily' | 'weekly' | 'monthly';
  digest_time?: string; // HH:MM format

  created_at: string;
  updated_at: string;
}
