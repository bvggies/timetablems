import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export const getRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const registrations = await prisma.studentCourseRegistration.findMany({
      where: {
        studentId: req.user.userId,
        droppedAt: null,
      },
      include: {
        course: {
          include: {
            department: true,
            level: true,
          },
        },
        semester: true,
      },
      orderBy: { registeredAt: 'desc' },
    });

    res.json(registrations);
  } catch (error: any) {
    logger.error('Get registrations error', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

export const registerCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { courseId, semesterId } = req.body;

    // Check if already registered
    const existing = await prisma.studentCourseRegistration.findFirst({
      where: {
        studentId: req.user.userId,
        courseId,
        semesterId,
        droppedAt: null,
      },
    });

    if (existing) {
      res.status(400).json({ error: 'Already registered for this course' });
      return;
    }

    const registration = await prisma.studentCourseRegistration.create({
      data: {
        studentId: req.user.userId,
        courseId,
        semesterId,
      },
      include: {
        course: true,
        semester: true,
      },
    });

    res.status(201).json(registration);
  } catch (error: any) {
    logger.error('Register course error', error);
    res.status(400).json({ error: error.message || 'Failed to register for course' });
  }
};

export const dropCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const registration = await prisma.studentCourseRegistration.findUnique({
      where: { id },
    });

    if (!registration || registration.studentId !== req.user.userId) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }

    if (registration.droppedAt) {
      res.status(400).json({ error: 'Course already dropped' });
      return;
    }

    await prisma.studentCourseRegistration.update({
      where: { id },
      data: {
        droppedAt: new Date(),
      },
    });

    res.json({ message: 'Course dropped successfully' });
  } catch (error: any) {
    logger.error('Drop course error', error);
    res.status(400).json({ error: error.message || 'Failed to drop course' });
  }
};

