import { Request, Response } from 'express';
import prisma from '../config/database';

// Get calendar events
export const getCalendarEvents = async (req: Request, res: Response) => {
  try {
    const { semesterId, startDate, endDate, type } = req.query;

    const where: any = {};

    if (semesterId) {
      where.semesterId = semesterId as string;
    }

    if (startDate && endDate) {
      where.OR = [
        {
          startDate: { gte: new Date(startDate as string), lte: new Date(endDate as string) },
        },
        {
          endDate: { gte: new Date(startDate as string), lte: new Date(endDate as string) },
        },
        {
          AND: [
            { startDate: { lte: new Date(startDate as string) } },
            { endDate: { gte: new Date(endDate as string) } },
          ],
        },
      ];
    }

    if (type) {
      where.type = type;
    }

    const events = await prisma.academicCalendarEvent.findMany({
      where,
      include: {
        Semester: {
          select: {
            id: true,
            year: true,
            term: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create calendar event (Admin only)
export const createCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { title, description, startDate, endDate, type, isHoliday, semesterId } = req.body;

    const event = await prisma.academicCalendarEvent.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type: type || 'OTHER',
        isHoliday: isHoliday || false,
        semesterId: semesterId || null,
      },
      include: {
        Semester: {
          select: {
            id: true,
            year: true,
            term: true,
          },
        },
      },
    });

    res.status(201).json(event);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update calendar event
export const updateCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, type, isHoliday, semesterId } = req.body;

    const event = await prisma.academicCalendarEvent.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(type && { type }),
        ...(isHoliday !== undefined && { isHoliday }),
        ...(semesterId !== undefined && { semesterId }),
      },
      include: {
        Semester: {
          select: {
            id: true,
            year: true,
            term: true,
          },
        },
      },
    });

    res.json(event);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete calendar event
export const deleteCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.academicCalendarEvent.delete({
      where: { id },
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

