import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createNotification } from '../services/notification.service';

// Create announcement (Admin only)
export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, message, scope, departmentId, levelId } = req.body;
    const userId = (req as any).user.id;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        message,
        scope,
        departmentId: departmentId || null,
        levelId: levelId || null,
        createdById: userId,
      },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        Department: true,
        Level: true,
      },
    });

    // Send notifications to relevant users
    let recipientIds: string[] = [];

    if (scope === 'ALL') {
      const users = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
      });
      recipientIds = users.map((u) => u.id);
    } else if (scope === 'DEPARTMENT' && departmentId) {
      const users = await prisma.user.findMany({
        where: {
          departmentId,
          status: 'ACTIVE',
        },
        select: { id: true },
      });
      recipientIds = users.map((u) => u.id);
    } else if (scope === 'LEVEL' && levelId) {
      const users = await prisma.user.findMany({
        where: {
          levelId,
          status: 'ACTIVE',
        },
        select: { id: true },
      });
      recipientIds = users.map((u) => u.id);
    }

    // Create notifications for all recipients
    for (const recipientId of recipientIds) {
      await createNotification({
        recipientId,
        title: `Announcement: ${title}`,
        message,
        type: 'ANNOUNCEMENT',
        sendEmail: true,
      });
    }

    res.status(201).json(announcement);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get announcements
export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const { scope, departmentId, levelId } = req.query;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    // Get user's department and level
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { departmentId: true, levelId: true },
    });

    const where: any = {};

    if (scope) {
      where.scope = scope;
    }

    if (departmentId) {
      where.departmentId = departmentId as string;
    } else if (userRole === 'STUDENT' && user?.departmentId) {
      // Students see department and all-scope announcements
      where.OR = [
        { scope: 'ALL' },
        { departmentId: user.departmentId },
      ];
    }

    if (levelId) {
      where.levelId = levelId as string;
    } else if (userRole === 'STUDENT' && user?.levelId) {
      // Students see level and all-scope announcements
      where.OR = [
        ...(where.OR || []),
        { levelId: user.levelId },
      ];
    }

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        Department: true,
        Level: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(announcements);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update announcement
export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, message, scope, departmentId, levelId } = req.body;

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(message && { message }),
        ...(scope && { scope }),
        ...(departmentId !== undefined && { departmentId }),
        ...(levelId !== undefined && { levelId }),
      },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        Department: true,
        Level: true,
      },
    });

    res.json(announcement);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete announcement
export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.announcement.delete({
      where: { id },
    });

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

