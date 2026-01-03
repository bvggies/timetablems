import { Request, Response } from 'express';
import prisma from '../config/database';

// Mark attendance for a session
export const markAttendance = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { sessionId } = req.params;
    const { studentId, status, notes } = req.body;
    const userId = req.user.userId;

    // Verify lecturer has access to this session
    const session = await prisma.timetableSession.findUnique({
      where: { id: sessionId },
      include: { Course: true },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if lecturer is assigned to this course
    const allocation = await prisma.courseAllocation.findFirst({
      where: {
        courseId: session.courseId,
        lecturerId: userId,
      },
    });

    if (!allocation && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to mark attendance' });
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId,
        },
      },
      update: {
        status,
        notes,
        markedBy: userId,
        markedAt: new Date(),
      },
      create: {
        sessionId,
        studentId,
        status: status || 'PRESENT',
        notes,
        markedBy: userId,
      },
      include: {
        Student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            pugId: true,
          },
        },
      },
    });

    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get students registered for a session (for marking attendance)
export const getSessionStudents = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { sessionId } = req.params;

    // Get session details
    const session = await prisma.timetableSession.findUnique({
      where: { id: sessionId },
      include: {
        Course: true,
        Semester: true,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Verify lecturer has access
    if (req.user.role === 'LECTURER') {
      const allocation = await prisma.courseAllocation.findFirst({
        where: {
          courseId: session.courseId,
          lecturerId: req.user.userId,
          semesterId: session.semesterId,
        },
      });

      if (!allocation) {
        return res.status(403).json({ error: 'Not authorized for this session' });
      }
    }

    // Get all students registered for this course in this semester
    const registrations = await prisma.studentCourseRegistration.findMany({
      where: {
        courseId: session.courseId,
        semesterId: session.semesterId,
        droppedAt: null,
      },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            pugId: true,
            email: true,
          },
        },
      },
      orderBy: {
        User: {
          lastName: 'asc',
        },
      },
    });

    // Get existing attendance records
    const existingAttendance = await prisma.attendance.findMany({
      where: { sessionId },
    });

    const attendanceMap = new Map(
      existingAttendance.map(a => [a.studentId, a])
    );

    // Combine registration data with existing attendance
    const studentsWithAttendance = registrations.map(reg => {
      const existing = attendanceMap.get(reg.studentId);
      return {
        studentId: reg.User.id,
        firstName: reg.User.firstName,
        lastName: reg.User.lastName,
        pugId: reg.User.pugId,
        email: reg.User.email,
        attendance: existing ? {
          id: existing.id,
          status: existing.status,
          notes: existing.notes,
          markedAt: existing.markedAt,
        } : null,
      };
    });

    res.json({
      session: {
        id: session.id,
        course: session.Course,
        semester: session.Semester,
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: session.endTime,
      },
      students: studentsWithAttendance,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get attendance for a session
export const getSessionAttendance = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const attendance = await prisma.attendance.findMany({
      where: { sessionId },
      include: {
        Student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            pugId: true,
          },
        },
        Marker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        Student: {
          lastName: 'asc',
        },
      },
    });

    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get student's attendance records
export const getStudentAttendance = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { studentId } = req.params;
    const userId = req.user.userId;

    // Students can only view their own attendance
    if (userId !== studentId && req.user.role !== 'ADMIN' && req.user.role !== 'LECTURER') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const attendance = await prisma.attendance.findMany({
      where: { studentId },
      include: {
        TimetableSession: {
          include: {
            Course: {
              select: {
                code: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        markedAt: 'desc',
      },
    });

    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Bulk mark attendance
export const bulkMarkAttendance = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { sessionId } = req.params;
    const { attendanceList } = req.body; // Array of { studentId, status, notes }
    const userId = req.user.userId;

    // Verify lecturer has access to this session
    const session = await prisma.timetableSession.findUnique({
      where: { id: sessionId },
      include: { Course: true, Semester: true },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (req.user.role === 'LECTURER') {
      const allocation = await prisma.courseAllocation.findFirst({
        where: {
          courseId: session.courseId,
          lecturerId: userId,
          semesterId: session.semesterId,
        },
      });

      if (!allocation) {
        return res.status(403).json({ error: 'Not authorized to mark attendance' });
      }
    }

    const results = await Promise.all(
      attendanceList.map((item: any) =>
        prisma.attendance.upsert({
          where: {
            sessionId_studentId: {
              sessionId,
              studentId: item.studentId,
            },
          },
          update: {
            status: item.status || 'PRESENT',
            notes: item.notes,
            markedBy: userId,
            markedAt: new Date(),
          },
          create: {
            sessionId,
            studentId: item.studentId,
            status: item.status || 'PRESENT',
            notes: item.notes,
            markedBy: userId,
          },
        })
      )
    );

    res.json({ count: results.length, attendance: results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get attendance history (all for admin, only lecturer's for lecturer)
export const getAttendanceHistory = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { courseId, semesterId, startDate, endDate, studentId } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const where: any = {};

    // Lecturers only see attendance they marked
    if (userRole === 'LECTURER') {
      where.markedBy = userId;
    }

    if (courseId) {
      where.TimetableSession = {
        courseId: courseId as string,
      };
    }

    if (semesterId) {
      where.TimetableSession = {
        ...where.TimetableSession,
        semesterId: semesterId as string,
      };
    }

    if (studentId) {
      where.studentId = studentId as string;
    }

    if (startDate || endDate) {
      where.markedAt = {};
      if (startDate) {
        where.markedAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.markedAt.lte = new Date(endDate as string);
      }
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        Student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            pugId: true,
          },
        },
        Marker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        TimetableSession: {
          include: {
            Course: {
              select: {
                id: true,
                code: true,
                title: true,
              },
            },
            Semester: {
              select: {
                id: true,
                year: true,
                term: true,
              },
            },
            Venue: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        markedAt: 'desc',
      },
    });

    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update attendance (Admin only)
export const updateAttendance = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Only admins can update attendance' });
      return;
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    const attendance = await prisma.attendance.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        markedAt: new Date(),
      },
      include: {
        Student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            pugId: true,
          },
        },
        Marker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        TimetableSession: {
          include: {
            Course: {
              select: {
                code: true,
                title: true,
              },
            },
          },
        },
      },
    });

    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get attendance analytics
export const getAttendanceAnalytics = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { courseId, semesterId, startDate, endDate } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const where: any = {};

    // Lecturers only see analytics for attendance they marked
    if (userRole === 'LECTURER') {
      where.markedBy = userId;
    }

    if (courseId) {
      where.TimetableSession = {
        courseId: courseId as string,
      };
    }

    if (semesterId) {
      where.TimetableSession = {
        ...where.TimetableSession,
        semesterId: semesterId as string,
      };
    }

    if (startDate || endDate) {
      where.markedAt = {};
      if (startDate) {
        where.markedAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.markedAt.lte = new Date(endDate as string);
      }
    }

    // Get total attendance records
    const totalRecords = await prisma.attendance.count({ where });

    // Get status breakdown
    const statusBreakdown = await prisma.attendance.groupBy({
      by: ['status'],
      where,
      _count: {
        status: true,
      },
    });

    // Get attendance by course
    const attendanceByCourse = await prisma.attendance.findMany({
      where,
      include: {
        TimetableSession: {
          include: {
            Course: {
              select: {
                id: true,
                code: true,
                title: true,
              },
            },
          },
        },
      },
    });

    const courseStats: any = {};
    attendanceByCourse.forEach((att) => {
      const courseId = att.TimetableSession.Course.id;
      if (!courseStats[courseId]) {
        courseStats[courseId] = {
          course: att.TimetableSession.Course,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        };
      }
      courseStats[courseId].total++;
      courseStats[courseId][att.status.toLowerCase()]++;
    });

    // Get attendance trends (by date)
    const attendanceByDate = await prisma.attendance.groupBy({
      by: ['markedAt'],
      where,
      _count: {
        id: true,
      },
    });

    // Calculate attendance rate
    const presentCount = statusBreakdown.find((s) => s.status === 'PRESENT')?._count.status || 0;
    const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

    res.json({
      totalRecords,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      statusBreakdown: statusBreakdown.map((s) => ({
        status: s.status,
        count: s._count.status,
        percentage: totalRecords > 0 ? Math.round((s._count.status / totalRecords) * 10000) / 100 : 0,
      })),
      courseStats: Object.values(courseStats),
      trends: attendanceByDate.map((d) => ({
        date: d.markedAt.toISOString().split('T')[0],
        count: d._count.id,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

