import { Request, Response } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

// Mark attendance for a session
export const markAttendance = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { studentId, status, notes } = req.body;
    const userId = (req as any).user.id;

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

    if (!allocation && (req as any).user.role !== 'ADMIN') {
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
    const { studentId } = req.params;
    const userId = (req as any).user.id;

    // Students can only view their own attendance
    if (userId !== studentId && (req as any).user.role !== 'ADMIN' && (req as any).user.role !== 'LECTURER') {
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
    const { sessionId } = req.params;
    const { attendanceList } = req.body; // Array of { studentId, status, notes }
    const userId = (req as any).user.id;

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

