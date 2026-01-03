import prisma from '../config/database';
import { logger } from '../utils/logger';

export interface GenerationOptions {
  semesterId: string;
  timeSlots: Array<{ start: string; end: string }>;
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
  sessionDuration: number; // in minutes
}

export interface Conflict {
  type: 'VENUE' | 'LECTURER' | 'STUDENT';
  message: string;
  sessionId?: string;
  conflictingSessionId?: string;
}

export interface GenerationResult {
  success: boolean;
  sessionsCreated: number;
  conflicts: Conflict[];
  errors: string[];
}

/**
 * Check for conflicts when creating/updating a timetable session
 */
export const checkConflicts = async (
  courseId: string,
  lecturerId: string,
  venueId: string,
  semesterId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  excludeSessionId?: string
): Promise<Conflict[]> => {
  const conflicts: Conflict[] = [];

  // Check venue conflicts
  const venueConflict = await prisma.timetableSession.findFirst({
    where: {
      venueId,
      semesterId,
      dayOfWeek,
      status: { in: ['DRAFT', 'PUBLISHED'] },
      id: excludeSessionId ? { not: excludeSessionId } : undefined,
      OR: [
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } },
          ],
        },
        {
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gte: endTime } },
          ],
        },
        {
          AND: [
            { startTime: { gte: startTime } },
            { endTime: { lte: endTime } },
          ],
        },
      ],
    },
    include: {
      Course: true,
      User: true,
    },
  });

  if (venueConflict) {
      conflicts.push({
        type: 'VENUE',
        message: `Venue is already booked by ${venueConflict.Course.code} (${venueConflict.User.firstName} ${venueConflict.User.lastName})`,
        conflictingSessionId: venueConflict.id,
      });
    }

  // Check lecturer conflicts
  const lecturerConflict = await prisma.timetableSession.findFirst({
    where: {
      lecturerId,
      semesterId,
      dayOfWeek,
      status: { in: ['DRAFT', 'PUBLISHED'] },
      id: excludeSessionId ? { not: excludeSessionId } : undefined,
      OR: [
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } },
          ],
        },
        {
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gte: endTime } },
          ],
        },
        {
          AND: [
            { startTime: { gte: startTime } },
            { endTime: { lte: endTime } },
          ],
        },
      ],
    },
    include: {
      Course: true,
      Venue: true,
    },
  });

  if (lecturerConflict) {
    conflicts.push({
      type: 'LECTURER',
      message: `Lecturer is already teaching ${lecturerConflict.Course.code} at ${lecturerConflict.Venue.name}`,
      conflictingSessionId: lecturerConflict.id,
    });
  }

  // Check student conflicts (students registered in multiple courses)
  const course = await prisma.course.findUnique({
    where: { id: courseId },
      include: {
        Department: true,
        Level: true,
      },
  });

  if (course) {
    // Find all students registered in this course
    const registrations = await prisma.studentCourseRegistration.findMany({
      where: {
        courseId,
        semesterId,
        droppedAt: null,
      },
      select: { studentId: true },
    });

    const studentIds = registrations.map((r) => r.studentId);

    if (studentIds.length > 0) {
      // Find other sessions at the same time that these students are registered for
      const studentConflicts = await prisma.timetableSession.findMany({
        where: {
          semesterId,
          dayOfWeek,
          status: { in: ['DRAFT', 'PUBLISHED'] },
          id: excludeSessionId ? { not: excludeSessionId } : undefined,
          OR: [
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: startTime } },
                { endTime: { lte: endTime } },
              ],
            },
          ],
        },
        include: {
          Course: {
            include: {
              StudentCourseRegistration: {
                where: {
                  studentId: { in: studentIds },
                  semesterId,
                  droppedAt: null,
                },
              },
            },
          },
        },
      });

      for (const conflict of studentConflicts) {
        const overlappingStudents = conflict.Course.StudentCourseRegistration.length;
        if (overlappingStudents > 0) {
          conflicts.push({
            type: 'STUDENT',
            message: `${overlappingStudents} student(s) are registered for both ${course.code} and ${conflict.Course.code}`,
            conflictingSessionId: conflict.id,
          });
        }
      }
    }
  }

  return conflicts;
};

/**
 * Auto-generate timetable sessions based on course allocations
 */
export const generateTimetable = async (
  options: GenerationOptions
): Promise<GenerationResult> => {
  const result: GenerationResult = {
    success: false,
    sessionsCreated: 0,
    conflicts: [],
    errors: [],
  };

  try {
    // Get all course allocations for the semester
    const allocations = await prisma.courseAllocation.findMany({
      where: {
        semesterId: options.semesterId,
      },
      include: {
        Course: {
          include: {
            Department: true,
            Level: true,
            StudentCourseRegistration: {
              where: {
                semesterId: options.semesterId,
                droppedAt: null,
              },
            },
          },
        },
        User: {
          include: {
            LecturerAvailability: true,
          },
        },
      },
    });

    if (allocations.length === 0) {
      result.errors.push('No course allocations found for this semester');
      return result;
    }

    // Get all available venues
    const venues = await prisma.venue.findMany({
      orderBy: { capacity: 'desc' },
    });

    if (venues.length === 0) {
      result.errors.push('No venues available');
      return result;
    }

    // Get existing sessions to avoid duplicates
    const existingSessions = await prisma.timetableSession.findMany({
      where: {
        semesterId: options.semesterId,
        status: 'PUBLISHED',
      },
    });

    const sessionsToCreate: Array<{
      courseId: string;
      lecturerId: string;
      venueId: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }> = [];

    // Generate sessions for each allocation
    for (const allocation of allocations) {
      const course = allocation.Course;
      const lecturer = allocation.User;
      const expectedSize = course.StudentCourseRegistration.length || course.expectedSize;

      // Find suitable venue
      const suitableVenue = venues.find((v) => v.capacity >= expectedSize);
      if (!suitableVenue) {
        result.errors.push(
          `No suitable venue for ${course.code} (requires capacity >= ${expectedSize})`
        );
        continue;
      }

      // Check lecturer availability
      const lecturerAvailabilities = lecturer.LecturerAvailability.filter(
        (avail: { dayOfWeek: number }) => options.daysOfWeek.includes(avail.dayOfWeek)
      );

      if (lecturerAvailabilities.length === 0) {
        result.errors.push(
          `Lecturer ${lecturer.firstName} ${lecturer.lastName} has no availability for selected days`
        );
        continue;
      }

      // Try to find a slot
      let sessionCreated = false;
      for (const availability of lecturerAvailabilities) {
        for (const timeSlot of options.timeSlots) {
          // Check if time slot is within lecturer availability
          if (
            timeSlot.start >= availability.startTime &&
            timeSlot.end <= availability.endTime
          ) {
            // Check for conflicts
            const conflicts = await checkConflicts(
              course.id,
              lecturer.id,
              suitableVenue.id,
              options.semesterId,
              availability.dayOfWeek,
              timeSlot.start,
              timeSlot.end
            );

            if (conflicts.length === 0) {
              // Check if session already exists
              const exists = existingSessions.some(
                (s) =>
                  s.courseId === course.id &&
                  s.lecturerId === lecturer.id &&
                  s.dayOfWeek === availability.dayOfWeek &&
                  s.startTime === timeSlot.start
              );

              if (!exists) {
                sessionsToCreate.push({
                  courseId: course.id,
                  lecturerId: lecturer.id,
                  venueId: suitableVenue.id,
                  dayOfWeek: availability.dayOfWeek,
                  startTime: timeSlot.start,
                  endTime: timeSlot.end,
                });
                sessionCreated = true;
                break;
              }
            } else {
              result.conflicts.push(...conflicts);
            }
          }
        }
        if (sessionCreated) break;
      }

      if (!sessionCreated) {
        result.errors.push(
          `Could not find available slot for ${course.code}`
        );
      }
    }

    // Create all sessions
    if (sessionsToCreate.length > 0) {
      await prisma.timetableSession.createMany({
        data: sessionsToCreate.map((s) => ({
          ...s,
          semesterId: options.semesterId,
          status: 'DRAFT',
          version: 1,
          updatedAt: new Date(),
        })),
      });
      result.sessionsCreated = sessionsToCreate.length;
    }

    result.success = result.errors.length === 0;
    return result;
  } catch (error: any) {
    logger.error('Timetable generation error', error);
    result.errors.push(error.message || 'Failed to generate timetable');
    return result;
  }
};

