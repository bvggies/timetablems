import { Request, Response } from 'express';
import { prisma } from '../config/database';

// Create resource booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const { venueId, resourceType, startTime, endTime, purpose } = req.body;
    const userId = (req as any).user.id;

    // Check for conflicts
    const conflicts = await prisma.resourceBooking.findMany({
      where: {
        venueId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gte: new Date(startTime) } },
            ],
          },
          {
            AND: [
              { startTime: { lte: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } },
            ],
          },
          {
            AND: [
              { startTime: { gte: new Date(startTime) } },
              { endTime: { lte: new Date(endTime) } },
            ],
          },
        ],
      },
    });

    if (conflicts.length > 0) {
      return res.status(409).json({ error: 'Resource already booked for this time slot', conflicts });
    }

    const booking = await prisma.resourceBooking.create({
      data: {
        venueId,
        resourceType,
        bookedBy: userId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        purpose,
        status: 'CONFIRMED',
      },
      include: {
        Venue: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        Booker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get bookings
export const getBookings = async (req: Request, res: Response) => {
  try {
    const { venueId, startDate, endDate, status } = req.query;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const where: any = {};

    if (venueId) {
      where.venueId = venueId as string;
    }

    if (startDate && endDate) {
      where.OR = [
        {
          startTime: { gte: new Date(startDate as string), lte: new Date(endDate as string) },
        },
        {
          endTime: { gte: new Date(startDate as string), lte: new Date(endDate as string) },
        },
        {
          AND: [
            { startTime: { lte: new Date(startDate as string) } },
            { endTime: { gte: new Date(endDate as string) } },
          ],
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    // Non-admins can only see their own bookings
    if (userRole !== 'ADMIN') {
      where.bookedBy = userId;
    }

    const bookings = await prisma.resourceBooking.findMany({
      where,
      include: {
        Venue: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        Booker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update booking
export const updateBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, startTime, endTime, purpose } = req.body;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const booking = await prisma.resourceBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Only admin or booking owner can update
    if (userRole !== 'ADMIN' && booking.bookedBy !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.resourceBooking.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(purpose !== undefined && { purpose }),
      },
      include: {
        Venue: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        Booker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete booking
export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const booking = await prisma.resourceBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (userRole !== 'ADMIN' && booking.bookedBy !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.resourceBooking.delete({
      where: { id },
    });

    res.json({ message: 'Booking deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

