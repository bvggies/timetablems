import { Request, Response } from 'express';
import prisma from '../config/database';

// Get system health
export const getSystemHealth = async (req: Request, res: Response) => {
  try {
    const dbStatus = await prisma.$queryRaw`SELECT 1 as healthy`.catch(() => null);

    const stats = {
      database: dbStatus ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get activity monitoring
export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const { limit = 100, entity, action } = req.query;

    const where: any = {};
    if (entity) where.entity = entity;
    if (action) where.action = action;

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit as string),
    });

    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get system statistics
export const getSystemStats = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalCourses,
      totalSessions,
      totalVenues,
      totalRegistrations,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.course.count(),
      prisma.timetableSession.count({ where: { status: 'PUBLISHED' } }),
      prisma.venue.count(),
      prisma.studentCourseRegistration.count({ where: { droppedAt: null } }),
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ]);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
      },
      academic: {
        courses: totalCourses,
        sessions: totalSessions,
        registrations: totalRegistrations,
      },
      resources: {
        venues: totalVenues,
      },
      activity: {
        last24Hours: recentActivity,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

