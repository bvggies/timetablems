import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { checkConflicts, generateTimetable, GenerationOptions } from '../services/timetable.service';

export const getTimetable = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { semesterId, dayOfWeek, lecturerId, courseId } = req.query;
    const user = req.user;

    let where: any = {};
    
    if (semesterId) where.semesterId = semesterId as string;
    if (dayOfWeek !== undefined) where.dayOfWeek = parseInt(dayOfWeek as string);
    if (lecturerId) where.lecturerId = lecturerId as string;
    if (courseId) where.courseId = courseId as string;

    // Role-based filtering
    if (user.role === 'STUDENT') {
      // Get student's registered courses
      const registrations = await prisma.studentCourseRegistration.findMany({
        where: {
          studentId: user.userId,
          ...(semesterId && { semesterId: semesterId as string }),
        },
        select: { courseId: true },
      });
      
      const courseIds = registrations.map(r => r.courseId);
      if (courseIds.length > 0) {
        where.courseId = { in: courseIds };
      } else {
        // No registered courses, return empty
        res.json([]);
        return;
      }
    } else if (user.role === 'LECTURER') {
      where.lecturerId = user.userId;
    }
    // Admin sees all

    const sessions = await prisma.timetableSession.findMany({
      where: {
        ...where,
        status: 'PUBLISHED',
      },
      include: {
        course: {
          include: {
            department: true,
            level: true,
          },
        },
        lecturer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        venue: true,
        semester: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    res.json(sessions);
  } catch (error: any) {
    logger.error('Get timetable error', error);
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
};

export const createSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      courseId,
      lecturerId,
      venueId,
      semesterId,
      dayOfWeek,
      startTime,
      endTime,
    } = req.body;

    // Check for conflicts
    const conflicts = await checkConflicts(
      courseId,
      lecturerId,
      venueId,
      semesterId,
      dayOfWeek,
      startTime,
      endTime
    );

    if (conflicts.length > 0) {
      res.status(400).json({
        error: 'Conflicts detected',
        conflicts,
      });
      return;
    }

    const session = await prisma.timetableSession.create({
      data: {
        courseId,
        lecturerId,
        venueId,
        semesterId,
        dayOfWeek,
        startTime,
        endTime,
        status: 'DRAFT',
        version: 1,
      },
      include: {
        course: true,
        lecturer: true,
        venue: true,
      },
    });
    res.status(201).json(session);
  } catch (error: any) {
    logger.error('Create session error', error);
    res.status(400).json({ error: error.message || 'Failed to create session' });
  }
};

export const updateSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      courseId,
      lecturerId,
      venueId,
      semesterId,
      dayOfWeek,
      startTime,
      endTime,
    } = req.body;

    // Check for conflicts (excluding current session)
    const conflicts = await checkConflicts(
      courseId,
      lecturerId,
      venueId,
      semesterId,
      dayOfWeek,
      startTime,
      endTime,
      id
    );

    if (conflicts.length > 0) {
      res.status(400).json({
        error: 'Conflicts detected',
        conflicts,
      });
      return;
    }

    const session = await prisma.timetableSession.update({
      where: { id },
      data: {
        courseId,
        lecturerId,
        venueId,
        semesterId,
        dayOfWeek,
        startTime,
        endTime,
      },
      include: {
        course: true,
        lecturer: true,
        venue: true,
      },
    });
    res.json(session);
  } catch (error: any) {
    logger.error('Update session error', error);
    res.status(400).json({ error: error.message || 'Failed to update session' });
  }
};

export const deleteSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.timetableSession.delete({ where: { id } });
    res.json({ message: 'Session deleted successfully' });
  } catch (error: any) {
    logger.error('Delete session error', error);
    res.status(400).json({ error: error.message || 'Failed to delete session' });
  }
};

export const generateTimetableHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const options: GenerationOptions = req.body;
    
    // Validate options
    if (!options.semesterId || !options.timeSlots || !options.daysOfWeek) {
      res.status(400).json({ error: 'Missing required generation options' });
      return;
    }

    const result = await generateTimetable(options);
    res.json(result);
  } catch (error: any) {
    logger.error('Generate timetable error', error);
    res.status(500).json({ error: error.message || 'Failed to generate timetable' });
  }
};

export const publishTimetable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { semesterId } = req.body;

    if (!semesterId) {
      res.status(400).json({ error: 'Semester ID is required' });
      return;
    }

    // Update all DRAFT sessions to PUBLISHED
    const result = await prisma.timetableSession.updateMany({
      where: {
        semesterId,
        status: 'DRAFT',
      },
      data: {
        status: 'PUBLISHED',
      },
    });

    res.json({
      message: 'Timetable published successfully',
      sessionsPublished: result.count,
    });
  } catch (error: any) {
    logger.error('Publish timetable error', error);
    res.status(500).json({ error: error.message || 'Failed to publish timetable' });
  }
};

export const checkSessionConflicts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      courseId,
      lecturerId,
      venueId,
      semesterId,
      dayOfWeek,
      startTime,
      endTime,
      excludeSessionId,
    } = req.body;

    const conflicts = await checkConflicts(
      courseId,
      lecturerId,
      venueId,
      semesterId,
      dayOfWeek,
      startTime,
      endTime,
      excludeSessionId
    );

    res.json({ conflicts });
  } catch (error: any) {
    logger.error('Check conflicts error', error);
    res.status(500).json({ error: error.message || 'Failed to check conflicts' });
  }
};
