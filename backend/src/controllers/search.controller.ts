import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

// Feature #5: Advanced Search & Filters
export const globalSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string' || q.length < 2) {
      res.json({ courses: [], venues: [], users: [], sessions: [] });
      return;
    }

    const searchTerm = `%${q.toLowerCase()}%`;

    const [courses, venues, users, sessions] = await Promise.all([
      prisma.course.findMany({
        where: {
          OR: [
            { code: { contains: q, mode: 'insensitive' } },
            { title: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
        include: {
          Department: true,
          Level: true,
        },
      }),
      prisma.venue.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { location: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      prisma.user.findMany({
        where: {
          role: 'LECTURER',
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      }),
      prisma.timetableSession.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { Course: { code: { contains: q, mode: 'insensitive' } } },
            { Course: { title: { contains: q, mode: 'insensitive' } } },
            { Venue: { name: { contains: q, mode: 'insensitive' } } },
            { User: { firstName: { contains: q, mode: 'insensitive' } } },
            { User: { lastName: { contains: q, mode: 'insensitive' } } },
          ],
        },
        take: 10,
        include: {
          Course: true,
          Venue: true,
          User: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    res.json({ courses, venues, users, sessions });
  } catch (error: any) {
    logger.error('Global search error', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
};

