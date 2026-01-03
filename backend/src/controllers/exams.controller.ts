import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export const getExams = async (req: Request, res: Response): Promise<void> => {
  try {
    const { semesterId, date, venueId } = req.query;
    
    const where: any = {};
    if (semesterId) where.semesterId = semesterId as string;
    if (date) where.date = new Date(date as string);
    if (venueId) where.venueId = venueId as string;

    const exams = await prisma.examSession.findMany({
      where,
      include: {
        course: {
          include: {
            department: true,
            level: true,
          },
        },
        venue: true,
        semester: true,
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });

    res.json(exams);
  } catch (error: any) {
    logger.error('Get exams error', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
};

export const createExam = async (req: Request, res: Response): Promise<void> => {
  try {
    const exam = await prisma.examSession.create({
      data: req.body,
      include: {
        course: true,
        venue: true,
      },
    });
    res.status(201).json(exam);
  } catch (error: any) {
    logger.error('Create exam error', error);
    res.status(400).json({ error: error.message || 'Failed to create exam' });
  }
};

export const updateExam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const exam = await prisma.examSession.update({
      where: { id },
      data: req.body,
      include: {
        course: true,
        venue: true,
      },
    });
    res.json(exam);
  } catch (error: any) {
    logger.error('Update exam error', error);
    res.status(400).json({ error: error.message || 'Failed to update exam' });
  }
};

export const deleteExam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.examSession.delete({ where: { id } });
    res.json({ message: 'Exam deleted successfully' });
  } catch (error: any) {
    logger.error('Delete exam error', error);
    res.status(400).json({ error: error.message || 'Failed to delete exam' });
  }
};

export const checkExamConflicts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { venueId, date, startTime, endTime, excludeExamId } = req.body;

    // Check venue conflicts
    const venueConflict = await prisma.examSession.findFirst({
      where: {
        venueId,
        date: new Date(date),
        id: excludeExamId ? { not: excludeExamId } : undefined,
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
        course: true,
      },
    });

    const conflicts: any[] = [];
    if (venueConflict) {
      conflicts.push({
        type: 'VENUE',
        message: `Venue is already booked for ${venueConflict.course.code} exam`,
        conflictingExamId: venueConflict.id,
      });
    }

    res.json({ conflicts });
  } catch (error: any) {
    logger.error('Check exam conflicts error', error);
    res.status(500).json({ error: error.message || 'Failed to check conflicts' });
  }
};

