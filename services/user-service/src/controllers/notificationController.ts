import { Request, Response } from 'express';
import { notificationService } from '../services/notificationService';
import { AuthErrorCodes } from '../types/apiTypes';
import { asyncHandler } from '../utils/asyncHandler';
import { NotificationQueryParams } from '../types/notificationTypes';

/**
 * GET /notifications
 */
export const getNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw {
        message: 'Authentication required',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    const query = req.query as NotificationQueryParams;

    const page = parseInt(query.page ?? '1') || 1;
    const limit = parseInt(query.limit ?? '20') || 20;
    const unreadOnly = query.unread_only === 'true';

    const result = await notificationService.getUserNotifications(
      req.user.id,
      page,
      limit,
      unreadOnly,
    );

    res.json({
      message: 'Notifications retrieved successfully',
      data: result,
    });
  },
);

/**
 * GET /notifications/:id
 */
export const getNotification = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      throw {
        message: 'Authentication required',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    const { id } = req.params;

    if (!id) {
      throw {
        message: 'Notification ID is required',
        code: 'MISSING_FIELDS',
        statusCode: 400,
      };
    }

    const notification = await notificationService.getNotificationById(
      id,
      req.user.id,
    );

    if (!notification) {
      throw {
        message: 'Notification not found',
        code: 'NOTIFICATION_NOT_FOUND',
        statusCode: 404,
      };
    }

    res.json({
      message: 'Notification retrieved successfully',
      data: notification,
    });
  },
);

/**
 * GET /notifications/unread-count
 */
export const getUnreadCount = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw {
        message: 'Authentication required',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    const count = await notificationService.getUnreadCount(req.user.id);

    res.json({
      message: 'Unread count retrieved successfully',
      data: { count },
    });
  },
);

/**
 * PATCH /notifications/:id/read
 */
export const markNotificationAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw {
        message: 'Authentication required',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    const { id } = req.params;

    if (!id) {
      throw {
        message: 'Notification ID is required',
        code: 'MISSING_FIELDS',
        statusCode: 400,
      };
    }

    const notification = await notificationService.markAsRead(id, req.user.id);

    if (!notification) {
      throw {
        message: 'Notification not found',
        code: 'NOTIFICATION_NOT_FOUND',
        statusCode: 404,
      };
    }

    res.json({
      message: 'Notification marked as read successfully',
      data: notification,
    });
  },
);

/**
 * PATCH /notifications/read-multiple
 */
export const markMultipleAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw {
        message: 'Authentication required',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    const { notification_ids } = req.body;

    if (!notification_ids || !Array.isArray(notification_ids)) {
      throw {
        message: 'notification_ids array is required',
        code: AuthErrorCodes.MISSING_FIELDS,
        statusCode: 400,
      };
    }

    await notificationService.markMultipleAsRead(notification_ids, req.user.id);

    res.json({ message: 'Notifications marked as read successfully' });
  },
);

/**
 * PATCH /notifications/read-all
 */
export const markAllAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw {
        message: 'Authentication required',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    await notificationService.markAllAsRead(req.user.id);

    res.json({ message: 'All notifications marked as read successfully' });
  },
);

/**
 * DELETE /notifications/:id
 */
export const deleteNotification = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      throw {
        message: 'Authentication required',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    const { id } = req.params;

    if (!id) {
      throw {
        message: 'Notification ID is required',
        code: 'MISSING_FIELDS',
        statusCode: 400,
      };
    }

    const deleted = await notificationService.deleteNotification(
      id,
      req.user.id,
    );

    if (!deleted) {
      throw {
        message: 'Notification not found',
        code: 'NOTIFICATION_NOT_FOUND',
        statusCode: 404,
      };
    }

    res.json({ message: 'Notification deleted successfully' });
  },
);

/**
 * POST /notifications/delete-multiple
 */
export const deleteMultipleNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw {
        message: 'Authentication required',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    const { notification_ids } = req.body;

    if (!notification_ids || !Array.isArray(notification_ids)) {
      throw {
        message: 'notification_ids array is required',
        code: AuthErrorCodes.MISSING_FIELDS,
        statusCode: 400,
      };
    }

    await notificationService.deleteMultiple(notification_ids, req.user.id);

    res.json({ message: 'Notifications deleted successfully' });
  },
);

/**
 * DELETE /notifications/delete-all
 */
export const deleteAllNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw {
        message: 'Authentication required',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    await notificationService.deleteAll(req.user.id);

    res.json({ message: 'All notifications deleted successfully' });
  },
);

/**
 * GET /notifications/preferences
 */
export const getNotificationPreferences = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw {
        message: 'Authentication required',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    const preferences = await notificationService.getNotificationPreferences(
      req.user.id,
    );

    res.json({
      message: 'Notification preferences retrieved successfully',
      data: preferences,
    });
  },
);

/**
 * PATCH /notifications/preferences
 */
export const updateNotificationPreferences = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw {
        message: 'Authentication required',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    const updates = req.body;

    if (Object.keys(updates).length === 0) {
      throw {
        message: 'No valid fields to update',
        code: AuthErrorCodes.NO_UPDATE_FIELDS,
        statusCode: 400,
      };
    }

    const updatedPreferences =
      await notificationService.updateNotificationPreferences(
        req.user.id,
        updates,
      );

    res.json({
      message: 'Notification preferences updated successfully',
      data: updatedPreferences,
    });
  },
);

/**
 * POST /notifications/test
 */
export const sendTestNotification = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw {
        message: 'Authentication required',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    const notification = await notificationService.createNotification({
      user_id: req.user.id,
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test notification from StudyBuddy.',
      metadata: {
        category: 'system',
        dismissible: true,
      },
    });

    res.json({
      message: 'Test notification sent successfully',
      data: notification,
    });
  },
);
