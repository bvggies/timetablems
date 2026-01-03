import { Request, Response } from 'express';
import { prisma } from '../config/database';

// Create student group
export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, description, departmentId, levelId, semesterId, studentIds } = req.body;

    const group = await prisma.studentGroup.create({
      data: {
        name,
        description,
        departmentId: departmentId || null,
        levelId: levelId || null,
        semesterId,
        Members: {
          create: studentIds?.map((studentId: string) => ({
            studentId,
          })) || [],
        },
      },
      include: {
        Department: true,
        Level: true,
        Semester: true,
        Members: {
          include: {
            Student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                pugId: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(group);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get groups
export const getGroups = async (req: Request, res: Response) => {
  try {
    const { semesterId, departmentId, levelId } = req.query;

    const where: any = {};
    if (semesterId) where.semesterId = semesterId as string;
    if (departmentId) where.departmentId = departmentId as string;
    if (levelId) where.levelId = levelId as string;

    const groups = await prisma.studentGroup.findMany({
      where,
      include: {
        Department: true,
        Level: true,
        Semester: true,
        Members: {
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
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(groups);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Add member to group
export const addMember = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { studentId } = req.body;

    const member = await prisma.groupMember.create({
      data: {
        groupId,
        studentId,
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

    res.status(201).json(member);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Remove member from group
export const removeMember = async (req: Request, res: Response) => {
  try {
    const { groupId, studentId } = req.params;

    await prisma.groupMember.delete({
      where: {
        groupId_studentId: {
          groupId,
          studentId,
        },
      },
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get group timetable
export const getGroupTimetable = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { semesterId } = req.query;

    const group = await prisma.studentGroup.findUnique({
      where: { id: groupId },
      include: {
        Members: {
          include: {
            Student: {
              include: {
                StudentCourseRegistration: {
                  where: {
                    ...(semesterId && { semesterId: semesterId as string }),
                    droppedAt: null,
                  },
                  include: {
                    Course: {
                      include: {
                        TimetableSession: {
                          where: {
                            ...(semesterId && { semesterId: semesterId as string }),
                            status: 'PUBLISHED',
                          },
                          include: {
                            Course: true,
                            User: true,
                            Venue: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Aggregate timetable sessions from all group members
    const sessions = group.Members.flatMap((member) =>
      member.Student.StudentCourseRegistration.flatMap((reg) => reg.Course.TimetableSession)
    );

    // Remove duplicates
    const uniqueSessions = Array.from(
      new Map(sessions.map((s) => [s.id, s])).values()
    );

    res.json({
      group,
      timetable: uniqueSessions,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

