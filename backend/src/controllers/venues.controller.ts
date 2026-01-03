import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export const getVenues = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, search } = req.query;
    
    const where: any = {};
    if (type) where.type = type as string;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { location: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const venues = await prisma.venue.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json(venues);
  } catch (error: any) {
    logger.error('Get venues error', error);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
};

export const createVenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const venue = await prisma.venue.create({
      data: req.body,
    });
    res.status(201).json(venue);
  } catch (error: any) {
    logger.error('Create venue error', error);
    res.status(400).json({ error: error.message || 'Failed to create venue' });
  }
};

export const updateVenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const venue = await prisma.venue.update({
      where: { id },
      data: req.body,
    });
    res.json(venue);
  } catch (error: any) {
    logger.error('Update venue error', error);
    res.status(400).json({ error: error.message || 'Failed to update venue' });
  }
};

export const deleteVenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.venue.delete({ where: { id } });
    res.json({ message: 'Venue deleted successfully' });
  } catch (error: any) {
    logger.error('Delete venue error', error);
    res.status(400).json({ error: error.message || 'Failed to delete venue' });
  }
};

