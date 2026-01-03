import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { departmentId, levelId, search } = req.query;
    
    const where: any = {};
    if (departmentId) where.departmentId = departmentId as string;
    if (levelId) where.levelId = levelId as string;
    if (search) {
      where.OR = [
        { code: { contains: search as string, mode: 'insensitive' } },
        { title: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        Department: {
          select: { id: true, code: true, name: true },
        },
        Level: {
          select: { id: true, code: true, name: true },
        },
      },
      orderBy: { code: 'asc' },
    });

    res.json(courses);
  } catch (error: any) {
    logger.error('Get courses error', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await prisma.course.create({
      data: req.body,
      include: {
        Department: true,
        Level: true,
      },
    });
    res.status(201).json(course);
  } catch (error: any) {
    logger.error('Create course error', error);
    res.status(400).json({ error: error.message || 'Failed to create course' });
  }
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const course = await prisma.course.update({
      where: { id },
      data: req.body,
      include: {
        Department: true,
        Level: true,
      },
    });
    res.json(course);
  } catch (error: any) {
    logger.error('Update course error', error);
    res.status(400).json({ error: error.message || 'Failed to update course' });
  }
};

// Get students for lecturer's courses
export const getLecturerCourseStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const lecturerId = req.user.userId;
    const { courseId, semesterId } = req.query;

    // Get courses assigned to this lecturer
    const allocations = await prisma.courseAllocation.findMany({
      where: {
        lecturerId,
        ...(courseId && { courseId: courseId as string }),
        ...(semesterId && { semesterId: semesterId as string }),
      },
      include: {
        Course: {
          include: {
            Department: true,
            Level: true,
          },
        },
        Semester: true,
      },
    });

    const courseIds = allocations.map(a => a.courseId);

    if (courseIds.length === 0) {
      res.json([]);
      return;
    }

    // Get all students registered for these courses
    const registrations = await prisma.studentCourseRegistration.findMany({
      where: {
        courseId: { in: courseIds },
        droppedAt: null,
        ...(semesterId && { semesterId: semesterId as string }),
      },
      include: {
        Course: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
        User: {
          select: {
            id: true,
            pugId: true,
            firstName: true,
            lastName: true,
            email: true,
            Department: {
              select: {
                id: true,
                name: true,
              },
            },
            Level: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        Semester: {
          select: {
            id: true,
            year: true,
            term: true,
          },
        },
      },
      orderBy: [
        { Course: { code: 'asc' } },
        { User: { lastName: 'asc' } },
      ],
    });

    // Group by course
    const groupedByCourse: any = {};
    registrations.forEach(reg => {
      const courseCode = reg.Course.code;
      if (!groupedByCourse[courseCode]) {
        groupedByCourse[courseCode] = {
          course: reg.Course,
          students: [],
        };
      }
      groupedByCourse[courseCode].students.push({
        id: reg.User.id,
        pugId: reg.User.pugId,
        firstName: reg.User.firstName,
        lastName: reg.User.lastName,
        email: reg.User.email,
        department: reg.User.Department?.name,
        level: reg.User.Level?.name,
        semester: reg.Semester,
        registeredAt: reg.registeredAt,
      });
    });

    res.json(Object.values(groupedByCourse));
  } catch (error: any) {
    logger.error('Get lecturer course students error', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.course.delete({ where: { id } });
    res.json({ message: 'Course deleted successfully' });
  } catch (error: any) {
    logger.error('Delete course error', error);
    res.status(400).json({ error: error.message || 'Failed to delete course' });
  }
};

