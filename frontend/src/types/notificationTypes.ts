// Notification entity
export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  readAt?: string | null;
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
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;

  // Category-specific settings
  chatNotifications: boolean;
  studyNotifications: boolean;
  assignmentNotifications: boolean;
  quizNotifications: boolean;
  achievementNotifications: boolean;
  reminderNotifications: boolean;
  systemNotifications: boolean;
  socialNotifications: boolean;
  updatesNotifications: boolean;

  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // HH:MM format
  quietHoursEnd?: string; // HH:MM format

  // Frequency settings
  digestEnabled: boolean;
  digestFrequency?: 'daily' | 'weekly' | 'monthly';
  digestTime?: string; // HH:MM format

  createdAt: string;
  updatedAt: string;
}
