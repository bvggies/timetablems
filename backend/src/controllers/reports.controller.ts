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
        Venue: true,
        Course: {
          include: {
            StudentCourseRegistration: {
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
      const venueName = session.Venue.name;
      const capacity = session.Venue.capacity;
      const registeredCount = session.Course.StudentCourseRegistration.length || session.Course.expectedSize;

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
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        Course: {
          select: {
            id: true,
            code: true,
            title: true,
            credits: true,
          },
        },
        Semester: true,
      },
    });

    // Count sessions per lecturer
    const sessions = await prisma.timetableSession.findMany({
      where: {
        ...(semesterId && { semesterId: semesterId as string }),
        status: 'PUBLISHED',
      },
      include: {
        User: true,
        Course: true,
      },
    });

    const lecturerWorkload: { [key: string]: any } = {};

    allocations.forEach((allocation) => {
      const lecturerId = allocation.lecturerId;
      const lecturer = allocation.User;

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
      lecturerWorkload[lecturerId].totalCredits += allocation.Course.credits;
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

// Feature #9: Advanced Analytics - Heatmap data
export const getVenueHeatmap = async (req: Request, res: Response): Promise<void> => {
  try {
    const { semesterId } = req.query;

    const sessions = await prisma.timetableSession.findMany({
      where: {
        ...(semesterId && { semesterId: semesterId as string }),
        status: 'PUBLISHED',
      },
      include: {
        Venue: true,
        Course: {
          include: {
            StudentCourseRegistration: {
              where: {
                ...(semesterId && { semesterId: semesterId as string }),
                droppedAt: null,
              },
            },
          },
        },
      },
    });

    // Create heatmap data: venue x dayOfWeek x hour
    const heatmap: { [key: string]: { [day: number]: { [hour: string]: number } } } = {};

    sessions.forEach((session) => {
      const venueId = session.Venue.id;
      const day = session.dayOfWeek;
      const [startHour] = session.startTime.split(':');
      const [endHour] = session.endTime.split(':');

      if (!heatmap[venueId]) {
        heatmap[venueId] = {};
      }
      if (!heatmap[venueId][day]) {
        heatmap[venueId][day] = {};
      }

      for (let hour = parseInt(startHour); hour < parseInt(endHour); hour++) {
        const hourKey = `${hour}:00`;
        heatmap[venueId][day][hourKey] = (heatmap[venueId][day][hourKey] || 0) + 1;
      }
    });

    res.json(heatmap);
  } catch (error: any) {
    logger.error('Get venue heatmap error', error);
    res.status(500).json({ error: 'Failed to generate heatmap' });
  }
};

// Feature #9: Advanced Analytics - Trends
export const getTrends = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '6months' } = req.query;
    const months = period === '6months' ? 6 : 12;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Registration trends
    const registrations = await prisma.studentCourseRegistration.findMany({
      where: {
        registeredAt: { gte: startDate },
      },
      orderBy: { registeredAt: 'asc' },
    });

    // Group by month
    const trends: { [key: string]: { registrations: number; sessions: number } } = {};

    registrations.forEach((reg) => {
      const month = reg.registeredAt.toISOString().substring(0, 7); // YYYY-MM
      if (!trends[month]) {
        trends[month] = { registrations: 0, sessions: 0 };
      }
      trends[month].registrations += 1;
    });

    // Session creation trends
    const sessions = await prisma.timetableSession.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    sessions.forEach((session) => {
      const month = session.createdAt.toISOString().substring(0, 7);
      if (!trends[month]) {
        trends[month] = { registrations: 0, sessions: 0 };
      }
      trends[month].sessions += 1;
    });

    res.json(trends);
  } catch (error: any) {
    logger.error('Get trends error', error);
    res.status(500).json({ error: 'Failed to get trends' });
  }
};

