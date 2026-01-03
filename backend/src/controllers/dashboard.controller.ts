import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

// Get dashboard analytics based on user role
export const getDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userId = req.user.userId;
    const userRole = req.user.role;

    // Get current active semester
    const currentSemester = await prisma.semester.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { startDate: 'desc' },
    });

    if (userRole === 'STUDENT') {
      // Student-specific analytics
      const registeredCourses = await prisma.studentCourseRegistration.count({
        where: {
          studentId: userId,
          droppedAt: null,
          ...(currentSemester && { semesterId: currentSemester.id }),
        },
      });

      // Get upcoming classes for this week
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const studentRegistrations = await prisma.studentCourseRegistration.findMany({
        where: {
          studentId: userId,
          droppedAt: null,
          ...(currentSemester && { semesterId: currentSemester.id }),
        },
        include: {
          Course: {
            include: {
              TimetableSession: {
                where: {
                  status: 'PUBLISHED',
                  ...(currentSemester && { semesterId: currentSemester.id }),
                },
              },
            },
          },
        },
      });

      const upcomingSessions = studentRegistrations.flatMap((reg) =>
        reg.Course.TimetableSession.filter((session) => {
          const sessionDay = new Date();
          sessionDay.setDate(today.getDate() + (session.dayOfWeek - today.getDay()));
          return sessionDay >= today && sessionDay <= endOfWeek;
        })
      );

      const unreadNotifications = await prisma.notification.count({
        where: {
          recipientId: userId,
          readAt: null,
        },
      });

      // Weekly schedule data
      const weeklySchedule = await getWeeklyScheduleData(userId, 'STUDENT', currentSemester?.id);

      // Course distribution (registered courses by department)
      const courseDistribution = await getStudentCourseDistribution(userId, currentSemester?.id);

      res.json({
        role: 'STUDENT',
        stats: {
          registeredCourses,
          upcomingClasses: upcomingSessions.length,
          unreadNotifications,
        },
        charts: {
          weeklySchedule,
          courseDistribution,
        },
      });
    } else if (userRole === 'LECTURER') {
      // Lecturer-specific analytics
      const assignedCourses = await prisma.courseAllocation.count({
        where: {
          lecturerId: userId,
          ...(currentSemester && { semesterId: currentSemester.id }),
        },
      });

      const totalSessions = await prisma.timetableSession.count({
        where: {
          lecturerId: userId,
          status: 'PUBLISHED',
          ...(currentSemester && { semesterId: currentSemester.id }),
        },
      });

      // Get upcoming sessions this week
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const upcomingSessions = await prisma.timetableSession.count({
        where: {
          lecturerId: userId,
          status: 'PUBLISHED',
          ...(currentSemester && { semesterId: currentSemester.id }),
        },
      });

      const unreadNotifications = await prisma.notification.count({
        where: {
          recipientId: userId,
          readAt: null,
        },
      });

      // Weekly schedule data
      const weeklySchedule = await getWeeklyScheduleData(userId, 'LECTURER', currentSemester?.id);

      // Workload distribution
      const workloadData = await getLecturerWorkloadData(userId, currentSemester?.id);

      res.json({
        role: 'LECTURER',
        stats: {
          assignedCourses,
          totalSessions,
          upcomingClasses: upcomingSessions,
          unreadNotifications,
        },
        charts: {
          weeklySchedule,
          workloadData,
        },
      });
    } else if (userRole === 'ADMIN') {
      // Admin-specific analytics - system-wide
      const totalStudents = await prisma.user.count({
        where: { role: 'STUDENT', status: 'ACTIVE' },
      });

      const totalLecturers = await prisma.user.count({
        where: { role: 'LECTURER', status: 'ACTIVE' },
      });

      const totalCourses = await prisma.course.count();
      const totalVenues = await prisma.venue.count();
      const totalSessions = await prisma.timetableSession.count({
        where: { status: 'PUBLISHED' },
      });
      const totalRegistrations = await prisma.studentCourseRegistration.count({
        where: { droppedAt: null },
      });

      const unreadNotifications = await prisma.notification.count({
        where: {
          recipientId: userId,
          readAt: null,
        },
      });

      // Weekly schedule data (all sessions)
      const weeklySchedule = await getWeeklyScheduleData(null, 'ADMIN', currentSemester?.id);

      // Course distribution (all courses)
      const courseDistribution = await getAdminCourseDistribution(currentSemester?.id);

      // Monthly activity (last 6 months)
      const monthlyActivity = await getMonthlyActivityData();

      res.json({
        role: 'ADMIN',
        stats: {
          totalStudents,
          totalLecturers,
          totalCourses,
          totalVenues,
          totalSessions,
          totalRegistrations,
          unreadNotifications,
        },
        charts: {
          weeklySchedule,
          courseDistribution,
          monthlyActivity,
        },
      });
    } else {
      res.status(403).json({ error: 'Invalid user role' });
    }
  } catch (error: any) {
    logger.error('Get dashboard analytics error', error);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
};

// Helper function to get weekly schedule data
async function getWeeklyScheduleData(
  userId: string | null,
  role: string,
  semesterId: string | undefined
) {
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const scheduleData = days.map((day) => ({ name: day, classes: 0, registrations: 0 }));

  let sessions: any[] = [];

  if (role === 'STUDENT' && userId) {
    const registrations = await prisma.studentCourseRegistration.findMany({
      where: {
        studentId: userId,
        droppedAt: null,
        ...(semesterId && { semesterId }),
      },
      include: {
        Course: {
          include: {
            TimetableSession: {
              where: {
                status: 'PUBLISHED',
                ...(semesterId && { semesterId }),
              },
            },
          },
        },
      },
    });

    sessions = registrations.flatMap((reg) => reg.Course.TimetableSession);
  } else if (role === 'LECTURER' && userId) {
    sessions = await prisma.timetableSession.findMany({
      where: {
        lecturerId: userId,
        status: 'PUBLISHED',
        ...(semesterId && { semesterId }),
      },
    });
  } else if (role === 'ADMIN') {
    sessions = await prisma.timetableSession.findMany({
      where: {
        status: 'PUBLISHED',
        ...(semesterId && { semesterId }),
      },
    });
  }

  sessions.forEach((session) => {
    const dayIndex = session.dayOfWeek;
    if (dayIndex >= 0 && dayIndex < 7) {
      scheduleData[dayIndex].classes += 1;
    }
  });

  // For registrations (admin only)
  if (role === 'ADMIN') {
    const registrations = await prisma.studentCourseRegistration.findMany({
      where: {
        droppedAt: null,
        ...(semesterId && { semesterId }),
      },
      include: {
        Course: {
          include: {
            TimetableSession: {
              where: {
                status: 'PUBLISHED',
                ...(semesterId && { semesterId }),
              },
            },
          },
        },
      },
    });

    registrations.forEach((reg) => {
      reg.Course.TimetableSession.forEach((session) => {
        const dayIndex = session.dayOfWeek;
        if (dayIndex >= 0 && dayIndex < 7) {
          scheduleData[dayIndex].registrations += 1;
        }
      });
    });
  }

  return scheduleData;
}

// Helper function to get student course distribution
async function getStudentCourseDistribution(
  userId: string,
  semesterId: string | undefined
) {
  const registrations = await prisma.studentCourseRegistration.findMany({
    where: {
      studentId: userId,
      droppedAt: null,
      ...(semesterId && { semesterId }),
    },
    include: {
      Course: {
        include: {
          Department: true,
        },
      },
    },
  });

  const distribution: { [key: string]: number } = {};
  registrations.forEach((reg) => {
    const deptName = reg.Course.Department?.name || 'Other';
    distribution[deptName] = (distribution[deptName] || 0) + 1;
  });

  return Object.entries(distribution).map(([name, value]) => ({
    name,
    value,
    color: getColorForIndex(Object.keys(distribution).indexOf(name)),
  }));
}

// Helper function to get admin course distribution
async function getAdminCourseDistribution(semesterId: string | undefined) {
  const courses = await prisma.course.findMany({
    include: {
      Department: true,
      TimetableSession: {
        where: {
          status: 'PUBLISHED',
          ...(semesterId && { semesterId }),
        },
      },
    },
  });

  const active = courses.filter((c) => c.TimetableSession.length > 0).length;
  const pending = courses.filter((c) => c.TimetableSession.length === 0).length;

  return [
    { name: 'Active', value: active, color: '#10b981' },
    { name: 'Pending', value: pending, color: '#ef4444' },
  ];
}

// Helper function to get lecturer workload data
async function getLecturerWorkloadData(userId: string, semesterId: string | undefined) {
  const allocations = await prisma.courseAllocation.findMany({
    where: {
      lecturerId: userId,
      ...(semesterId && { semesterId }),
    },
    include: {
      Course: {
        include: {
          Department: true,
        },
      },
    },
  });

  const distribution: { [key: string]: number } = {};
  allocations.forEach((alloc) => {
    const course = alloc.Course as any;
    const deptName = course.Department?.name || 'Other';
    distribution[deptName] = (distribution[deptName] || 0) + 1;
  });

  return Object.entries(distribution).map(([name, value]) => ({
    name,
    value,
    color: getColorForIndex(Object.keys(distribution).indexOf(name)),
  }));
}

// Helper function to get monthly activity data
async function getMonthlyActivityData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const activityData = months.map((name) => ({ name, value: 0 }));

  // Get sessions created in the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const sessions = await prisma.timetableSession.findMany({
    where: {
      createdAt: {
        gte: sixMonthsAgo,
      },
      status: 'PUBLISHED',
    },
    select: {
      createdAt: true,
    },
  });

  sessions.forEach((session) => {
    const monthIndex = session.createdAt.getMonth();
    if (monthIndex >= 0 && monthIndex < 6) {
      activityData[monthIndex].value += 1;
    }
  });

  return activityData;
}

// Helper function to get color for chart
function getColorForIndex(index: number): string {
  const colors = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];
  return colors[index % colors.length];
}

