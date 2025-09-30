export interface CreateNotificationData {
  user_id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  metadata?: any;
}

export interface NotificationPreferencesUpdate {
  email_enabled?: boolean;
  push_enabled?: boolean;
  in_app_enabled?: boolean;
  chat_notifications?: boolean;
  study_notifications?: boolean;
  assignment_notifications?: boolean;
  quiz_notifications?: boolean;
  achievement_notifications?: boolean;
  reminder_notifications?: boolean;
  system_notifications?: boolean;
  social_notifications?: boolean;
  updates_notifications?: boolean;
  quiet_hours_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  digest_enabled?: boolean;
  digest_frequency?: 'daily' | 'weekly' | 'monthly';
  digest_time?: string;
}

export interface GetUserNotificationsResult {
  notifications: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  unreadCount: number;
}

export interface NotificationQueryParams {
  page?: string;
  limit?: string;
  unread_only?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
}
