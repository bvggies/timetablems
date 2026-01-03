import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { unreadOnly } = req.query;
    
    const where: any = {
      recipientId: req.user.userId,
    };

    if (unreadOnly === 'true') {
      where.readAt = null;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to 100 most recent
    });

    res.json(notifications);
  } catch (error: any) {
    logger.error('Get notifications error', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });

    res.json(notification);
  } catch (error: any) {
    logger.error('Mark notification as read error', error);
    res.status(400).json({ error: error.message || 'Failed to mark notification as read' });
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await prisma.notification.updateMany({
      where: {
        recipientId: req.user.userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    res.json({ message: 'All notifications marked as read', count: result.count });
  } catch (error: any) {
    logger.error('Mark all notifications as read error', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const count = await prisma.notification.count({
      where: {
        recipientId: req.user.userId,
        readAt: null,
      },
    });

    res.json({ count });
  } catch (error: any) {
    logger.error('Get unread count error', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

