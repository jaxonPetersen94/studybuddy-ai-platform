import { AppDataSource } from '../config/database';
import { Notification } from '../entities/Notification';
import { NotificationPreferences } from '../entities/NotificationPreferences';
import { User } from '../entities/User';
import {
  CreateNotificationData,
  NotificationPreferencesUpdate,
  GetUserNotificationsResult,
} from '../types/notificationTypes';

class NotificationService {
  private notificationRepository = AppDataSource.getRepository(Notification);
  private notificationPreferencesRepository = AppDataSource.getRepository(
    NotificationPreferences,
  );
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Create a new notification
   */
  async createNotification(
    data: CreateNotificationData,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata || {},
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.notificationRepository.save(notification);
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false,
  ): Promise<GetUserNotificationsResult> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (unreadOnly) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead: false });
    }

    const [notifications, total] = await queryBuilder.getManyAndCount();

    // Get unread count
    const unreadCount = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return {
      notifications,
      total,
      page,
      limit,
      totalPages,
      hasMore,
      unreadCount,
    };
  }

  /**
   * Get single notification by ID
   */
  async getNotificationById(
    notificationId: string,
    userId: string,
  ): Promise<Notification | null> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    return notification;
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<Notification | null> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      return null;
    }

    notification.isRead = true;
    notification.readAt = new Date();
    notification.updatedAt = new Date();

    return await this.notificationRepository.save(notification);
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(
    notificationIds: string[],
    userId: string,
  ): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      })
      .where('id IN (:...ids)', { ids: notificationIds })
      .andWhere('userId = :userId', { userId })
      .execute();
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      })
      .where('userId = :userId', { userId })
      .andWhere('isRead = :isRead', { isRead: false })
      .execute();
  }

  /**
   * Delete a notification
   */
  async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.notificationRepository.delete({
      id: notificationId,
      userId,
    });

    return (result.affected ?? 0) > 0;
  }

  /**
   * Delete multiple notifications
   */
  async deleteMultiple(
    notificationIds: string[],
    userId: string,
  ): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where('id IN (:...ids)', { ids: notificationIds })
      .andWhere('userId = :userId', { userId })
      .execute();
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAll(userId: string): Promise<void> {
    await this.notificationRepository.delete({ userId });
  }

  /**
   * Get notification preferences for user
   */
  async getNotificationPreferences(
    userId: string,
  ): Promise<NotificationPreferences> {
    let preferences = await this.notificationPreferencesRepository.findOne({
      where: { userId },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await this.createDefaultPreferences(userId);
    }

    return preferences;
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    updates: NotificationPreferencesUpdate,
  ): Promise<NotificationPreferences> {
    let preferences = await this.notificationPreferencesRepository.findOne({
      where: { userId },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await this.createDefaultPreferences(userId);
    }

    // Update preferences
    Object.assign(preferences, updates);
    preferences.updatedAt = new Date();

    return await this.notificationPreferencesRepository.save(preferences);
  }

  /**
   * Create default notification preferences for a user
   */
  private async createDefaultPreferences(
    userId: string,
  ): Promise<NotificationPreferences> {
    const preferences = this.notificationPreferencesRepository.create({
      userId,
      emailEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      chatNotifications: true,
      studyNotifications: true,
      assignmentNotifications: true,
      quizNotifications: true,
      achievementNotifications: true,
      reminderNotifications: true,
      systemNotifications: true,
      socialNotifications: true,
      updatesNotifications: true,
      quietHoursEnabled: false,
      digestEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.notificationPreferencesRepository.save(preferences);
  }

  /**
   * Create welcome notification for new user
   */
  async createWelcomeNotification(userId: string): Promise<Notification> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    const firstName = user?.firstName || 'there';

    return await this.createNotification({
      user_id: userId,
      type: 'success',
      title: 'Welcome to StudyBuddy!',
      message: `Hi ${firstName}, we're excited to have you here. Start your learning journey by exploring our AI-powered study tools.`,
      metadata: {
        category: 'system',
        dismissible: true,
      },
    });
  }

  /**
   * Clean up old read notifications (should be called periodically)
   */
  async cleanupOldNotifications(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where('isRead = :isRead', { isRead: true })
      .andWhere('readAt < :cutoffDate', { cutoffDate })
      .execute();
  }
}

export const notificationService = new NotificationService();
