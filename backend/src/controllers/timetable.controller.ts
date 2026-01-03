import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { checkConflicts, generateTimetable, GenerationOptions } from '../services/timetable.service';
import { addDays } from 'date-fns';

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
        res.json([]);
        return;
      }
    } else if (user.role === 'LECTURER') {
      where.lecturerId = user.userId;
    }

    const sessions = await prisma.timetableSession.findMany({
      where: {
        ...where,
        status: 'PUBLISHED',
      },
      include: {
        Course: {
          include: {
            Department: true,
            Level: true,
          },
        },
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        Venue: true,
        Semester: true,
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
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      courseId,
      lecturerId,
      venueId,
      semesterId,
      dayOfWeek,
      startTime,
      endTime,
    } = req.body;

    const user = req.user;
    const finalLecturerId = lecturerId || user.userId;

    // If lecturer, verify they're assigned to this course
    if (user.role === 'LECTURER') {
      const allocation = await prisma.courseAllocation.findFirst({
        where: {
          courseId,
          lecturerId: user.userId,
          ...(semesterId && { semesterId }),
        },
      });

      if (!allocation) {
        res.status(403).json({ error: 'Not authorized to create sessions for this course' });
        return;
      }

      // Ensure lecturerId matches the logged-in lecturer
      if (finalLecturerId !== user.userId) {
        res.status(403).json({ error: 'Cannot create sessions for other lecturers' });
        return;
      }
    }

    const conflicts = await checkConflicts(
      courseId,
      finalLecturerId,
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
        lecturerId: finalLecturerId,
        venueId,
        semesterId,
        dayOfWeek,
        startTime,
        endTime,
        status: 'DRAFT',
        version: 1,
        updatedAt: new Date(),
      },
      include: {
        Course: true,
        User: true,
        Venue: true,
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
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

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

    const user = req.user;

    // Check if session exists and verify permissions
    const existingSession = await prisma.timetableSession.findUnique({
      where: { id },
      include: { Course: true },
    });

    if (!existingSession) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // If lecturer, verify they own this session or are assigned to the course
    if (user.role === 'LECTURER') {
      if (existingSession.lecturerId !== user.userId) {
        res.status(403).json({ error: 'Not authorized to update this session' });
        return;
      }

      // If courseId is being changed, verify lecturer is assigned to new course
      if (courseId && courseId !== existingSession.courseId) {
        const allocation = await prisma.courseAllocation.findFirst({
          where: {
            courseId,
            lecturerId: user.userId,
            ...(semesterId && { semesterId }),
          },
        });

        if (!allocation) {
          res.status(403).json({ error: 'Not authorized for this course' });
          return;
        }
      }
    }

    const finalLecturerId = lecturerId || existingSession.lecturerId;

    const conflicts = await checkConflicts(
      courseId || existingSession.courseId,
      finalLecturerId,
      venueId || existingSession.venueId,
      semesterId || existingSession.semesterId,
      dayOfWeek !== undefined ? dayOfWeek : existingSession.dayOfWeek,
      startTime || existingSession.startTime,
      endTime || existingSession.endTime,
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
        ...(courseId && { courseId }),
        ...(lecturerId && { lecturerId: finalLecturerId }),
        ...(venueId && { venueId }),
        ...(semesterId && { semesterId }),
        ...(dayOfWeek !== undefined && { dayOfWeek }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        updatedAt: new Date(),
      },
      include: {
        Course: true,
        User: true,
        Venue: true,
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
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const user = req.user;

    // Check if session exists and verify permissions
    const session = await prisma.timetableSession.findUnique({
      where: { id },
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // If lecturer, verify they own this session
    if (user.role === 'LECTURER' && session.lecturerId !== user.userId) {
      res.status(403).json({ error: 'Not authorized to delete this session' });
      return;
    }

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
    const { semesterId, notes } = req.body;
    const userId = (req as any).user.id;

    if (!semesterId) {
      res.status(400).json({ error: 'Semester ID is required' });
      return;
    }

    // Get current max version for this semester
    const maxVersion = await prisma.timetableVersion.findFirst({
      where: { semesterId },
      orderBy: { version: 'desc' },
    });

    const newVersion = (maxVersion?.version || 0) + 1;

    // Update all DRAFT sessions to PUBLISHED with new version
    const result = await prisma.timetableSession.updateMany({
      where: {
        semesterId,
        status: 'DRAFT',
      },
      data: {
        status: 'PUBLISHED',
        version: newVersion,
      },
    });

    // Create version record
    await prisma.timetableVersion.create({
      data: {
        semesterId,
        version: newVersion,
        publishedAt: new Date(),
        publishedBy: userId,
        notes: notes || null,
      },
    });

    res.json({
      message: 'Timetable published successfully',
      sessionsPublished: result.count,
      version: newVersion,
    });
  } catch (error: any) {
    logger.error('Publish timetable error', error);
    res.status(500).json({ error: error.message || 'Failed to publish timetable' });
  }
};

// Get timetable versions
export const getTimetableVersions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { semesterId } = req.query;

    if (!semesterId) {
      res.status(400).json({ error: 'Semester ID is required' });
      return;
    }

    const versions = await prisma.timetableVersion.findMany({
      where: { semesterId: semesterId as string },
      orderBy: { version: 'desc' },
    });

    res.json(versions);
  } catch (error: any) {
    logger.error('Get versions error', error);
    res.status(500).json({ error: error.message || 'Failed to get versions' });
  }
};

// Rollback to a version
export const rollbackTimetable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { semesterId, version } = req.body;

    if (!semesterId || !version) {
      res.status(400).json({ error: 'Semester ID and version are required' });
      return;
    }

    // Get the version to rollback to
    const targetVersion = await prisma.timetableVersion.findUnique({
      where: {
        semesterId_version: {
          semesterId,
          version: parseInt(version),
        },
      },
    });

    if (!targetVersion) {
      res.status(404).json({ error: 'Version not found' });
      return;
    }

    // Archive current sessions and restore from version
    // This is a simplified implementation - in production, you'd want to store session snapshots
    const sessions = await prisma.timetableSession.findMany({
      where: {
        semesterId,
        version: parseInt(version),
      },
    });

    // Update all current sessions to DRAFT
    await prisma.timetableSession.updateMany({
      where: {
        semesterId,
        status: 'PUBLISHED',
      },
      data: {
        status: 'DRAFT',
      },
    });

    // Restore sessions from the version
    await prisma.timetableSession.updateMany({
      where: {
        semesterId,
        version: parseInt(version),
      },
      data: {
        status: 'PUBLISHED',
      },
    });

    res.json({
      message: `Timetable rolled back to version ${version}`,
      sessionsRestored: sessions.length,
    });
  } catch (error: any) {
    logger.error('Rollback timetable error', error);
    res.status(500).json({ error: error.message || 'Failed to rollback timetable' });
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

export const getNextClass = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userId = req.user.userId;
    const userRole = req.user.role;

    const currentSemester = await prisma.semester.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { startDate: 'desc' },
    });

    if (!currentSemester) {
      res.json(null);
      return;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let nextSession: any = null;

    if (userRole === 'STUDENT') {
      const registrations = await prisma.studentCourseRegistration.findMany({
        where: {
          studentId: userId,
          droppedAt: null,
          semesterId: currentSemester.id,
        },
        include: {
          Course: {
            include: {
              TimetableSession: {
                where: {
                  status: 'PUBLISHED',
                  semesterId: currentSemester.id,
                },
                include: {
                  Venue: true,
                  User: true,
                },
              },
            },
          },
        },
      });

      const allSessions = registrations.flatMap((reg) => reg.Course.TimetableSession);

      for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
        const checkDate = addDays(today, dayOffset);
        const checkDayOfWeek = checkDate.getDay();

        const sessionsOnDay = allSessions.filter((s) => s.dayOfWeek === checkDayOfWeek);

        if (sessionsOnDay.length > 0) {
          sessionsOnDay.sort((a, b) => {
            const [aHours, aMins] = a.startTime.split(':').map(Number);
            const [bHours, bMins] = b.startTime.split(':').map(Number);
            return aHours * 60 + aMins - (bHours * 60 + bMins);
          });

          if (dayOffset === 0) {
            const [nowHours, nowMins] = [now.getHours(), now.getMinutes()];
            const futureSessions = sessionsOnDay.filter((s) => {
              const [sHours, sMins] = s.startTime.split(':').map(Number);
              return sHours * 60 + sMins > nowHours * 60 + nowMins;
            });
            if (futureSessions.length > 0) {
              nextSession = futureSessions[0];
              break;
            }
          } else {
            nextSession = sessionsOnDay[0];
            break;
          }
        }
      }
    } else if (userRole === 'LECTURER') {
      const sessions = await prisma.timetableSession.findMany({
        where: {
          lecturerId: userId,
          status: 'PUBLISHED',
          semesterId: currentSemester.id,
        },
        include: {
          Course: true,
          Venue: true,
          User: true,
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' },
        ],
      });

      for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
        const checkDate = addDays(today, dayOffset);
        const checkDayOfWeek = checkDate.getDay();

        const sessionsOnDay = sessions.filter((s) => s.dayOfWeek === checkDayOfWeek);

        if (sessionsOnDay.length > 0) {
          if (dayOffset === 0) {
            const [nowHours, nowMins] = [now.getHours(), now.getMinutes()];
            const futureSessions = sessionsOnDay.filter((s) => {
              const [sHours, sMins] = s.startTime.split(':').map(Number);
              return sHours * 60 + sMins > nowHours * 60 + nowMins;
            });
            if (futureSessions.length > 0) {
              nextSession = futureSessions[0];
              break;
            }
          } else {
            nextSession = sessionsOnDay[0];
            break;
          }
        }
      }
    }

    res.json(nextSession);
  } catch (error: any) {
    logger.error('Get next class error', error);
    res.status(500).json({ error: 'Failed to get next class' });
  }
};
