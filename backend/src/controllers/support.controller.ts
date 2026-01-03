import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export const getTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { status, category } = req.query;
    
    const where: any = {};
    
    // If not admin, only show user's own tickets
    if (req.user.role !== 'ADMIN') {
      where.userId = req.user.userId;
    }
    
    if (status) where.status = status;
    if (category) where.category = category;

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            pugId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(tickets);
  } catch (error: any) {
    logger.error('Get tickets error', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

export const getTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            pugId: true,
          },
        },
      },
    });

    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    // Check if user has access
    if (req.user.role !== 'ADMIN' && ticket.userId !== req.user.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json(ticket);
  } catch (error: any) {
    logger.error('Get ticket error', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
};

export const createTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { category, subject, message, screenshot } = req.body;

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.user.userId,
        category,
        subject,
        message,
        screenshot,
        status: 'OPEN',
        updatedAt: new Date(),
      },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(ticket);
  } catch (error: any) {
    logger.error('Create ticket error', error);
    res.status(400).json({ error: error.message || 'Failed to create ticket' });
  }
};

export const updateTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { status, adminNotes } = req.body;

    // Only admin can update status and admin notes
    if (req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (status === 'RESOLVED' || status === 'CLOSED') {
      updateData.resolvedAt = new Date();
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json(ticket);
  } catch (error: any) {
    logger.error('Update ticket error', error);
    res.status(400).json({ error: error.message || 'Failed to update ticket' });
  }
};

export const deleteTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { id } = req.params;
    await prisma.supportTicket.delete({ where: { id } });
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error: any) {
    logger.error('Delete ticket error', error);
    res.status(400).json({ error: error.message || 'Failed to delete ticket' });
  }
};

