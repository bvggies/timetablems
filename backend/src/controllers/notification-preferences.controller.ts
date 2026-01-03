import { Request, Response } from 'express';
import prisma from '../config/database';

// Get user's notification preferences
export const getPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId,
        },
      });
    }

    res.json(preferences);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update notification preferences
export const updatePreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const {
      emailEnabled,
      smsEnabled,
      pushEnabled,
      timetableChanges,
      classReminders,
      announcements,
      digestFrequency,
    } = req.body;

    const preferences = await prisma.notificationPreference.upsert({
      where: { userId },
      update: {
        ...(emailEnabled !== undefined && { emailEnabled }),
        ...(smsEnabled !== undefined && { smsEnabled }),
        ...(pushEnabled !== undefined && { pushEnabled }),
        ...(timetableChanges !== undefined && { timetableChanges }),
        ...(classReminders !== undefined && { classReminders }),
        ...(announcements !== undefined && { announcements }),
        ...(digestFrequency && { digestFrequency }),
      },
      create: {
        userId,
        emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
        smsEnabled: smsEnabled !== undefined ? smsEnabled : false,
        pushEnabled: pushEnabled !== undefined ? pushEnabled : true,
        timetableChanges: timetableChanges !== undefined ? timetableChanges : true,
        classReminders: classReminders !== undefined ? classReminders : true,
        announcements: announcements !== undefined ? announcements : true,
        digestFrequency: digestFrequency || 'DAILY',
      },
    });

    res.json(preferences);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

