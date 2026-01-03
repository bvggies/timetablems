import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export const getOccupancyReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { semesterId } = req.query;

    const sessions = await prisma.timetableSession.findMany({
      where: {
        ...(semesterId && { semesterId: semesterId as string }),
        status: 'PUBLISHED',
      },
      include: {
        venue: true,
        course: {
          include: {
            registrations: {
              where: {
                ...(semesterId && { semesterId: semesterId as string }),
                droppedAt: null,
              },
            },
          },
        },
      },
    });

    // Calculate occupancy by venue
    const venueOccupancy: { [key: string]: any } = {};

    sessions.forEach((session) => {
      const venueId = session.venueId;
      const venueName = session.venue.name;
      const capacity = session.venue.capacity;
      const registeredCount = session.course.registrations.length || session.course.expectedSize;

      if (!venueOccupancy[venueId]) {
        venueOccupancy[venueId] = {
          venueId,
          venueName,
          capacity,
          totalSessions: 0,
          totalStudents: 0,
          utilizationRate: 0,
        };
      }

      venueOccupancy[venueId].totalSessions += 1;
      venueOccupancy[venueId].totalStudents += registeredCount;
    });

    // Calculate utilization rate
    Object.values(venueOccupancy).forEach((venue: any) => {
      venue.utilizationRate = venue.capacity > 0
        ? (venue.totalStudents / (venue.capacity * venue.totalSessions)) * 100
        : 0;
    });

    res.json(Object.values(venueOccupancy));
  } catch (error: any) {
    logger.error('Get occupancy report error', error);
    res.status(500).json({ error: 'Failed to generate occupancy report' });
  }
};

export const getWorkloadReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { semesterId } = req.query;

    const allocations = await prisma.courseAllocation.findMany({
      where: {
        ...(semesterId && { semesterId: semesterId as string }),
      },
      include: {
        lecturer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            code: true,
            title: true,
            credits: true,
          },
        },
        semester: true,
      },
    });

    // Count sessions per lecturer
    const sessions = await prisma.timetableSession.findMany({
      where: {
        ...(semesterId && { semesterId: semesterId as string }),
        status: 'PUBLISHED',
      },
      include: {
        lecturer: true,
        course: true,
      },
    });

    const lecturerWorkload: { [key: string]: any } = {};

    allocations.forEach((allocation) => {
      const lecturerId = allocation.lecturerId;
      const lecturer = allocation.lecturer;

      if (!lecturerWorkload[lecturerId]) {
        lecturerWorkload[lecturerId] = {
          lecturerId,
          lecturerName: `${lecturer.firstName} ${lecturer.lastName}`,
          lecturerEmail: lecturer.email,
          totalCourses: 0,
          totalCredits: 0,
          totalSessions: 0,
          sessionsPerWeek: 0,
        };
      }

      lecturerWorkload[lecturerId].totalCourses += 1;
      lecturerWorkload[lecturerId].totalCredits += allocation.course.credits;
    });

    // Count sessions
    sessions.forEach((session) => {
      const lecturerId = session.lecturerId;
      if (lecturerWorkload[lecturerId]) {
        lecturerWorkload[lecturerId].totalSessions += 1;
      }
    });

    // Calculate sessions per week (assuming 15-week semester)
    Object.values(lecturerWorkload).forEach((workload: any) => {
      workload.sessionsPerWeek = (workload.totalSessions / 15).toFixed(1);
    });

    res.json(Object.values(lecturerWorkload));
  } catch (error: any) {
    logger.error('Get workload report error', error);
    res.status(500).json({ error: 'Failed to generate workload report' });
  }
};

export const getUsageAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    // This would typically track page views, API calls, etc.
    // For now, return basic statistics
    const stats = {
      totalUsers: await prisma.user.count(),
      activeUsers: await prisma.user.count({ where: { status: 'ACTIVE' } }),
      totalCourses: await prisma.course.count(),
      totalSessions: await prisma.timetableSession.count({ where: { status: 'PUBLISHED' } }),
      totalVenues: await prisma.venue.count(),
      totalRegistrations: await prisma.studentCourseRegistration.count({ where: { droppedAt: null } }),
    };

    res.json(stats);
  } catch (error: any) {
    logger.error('Get usage analytics error', error);
    res.status(500).json({ error: 'Failed to get usage analytics' });
  }
};

