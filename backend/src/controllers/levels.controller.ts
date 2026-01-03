import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export const getLevels = async (req: Request, res: Response): Promise<void> => {
  try {
    const levels = await prisma.level.findMany({
      orderBy: { code: 'asc' },
    });
    res.json(levels);
  } catch (error: any) {
    logger.error('Get levels error', error);
    res.status(500).json({ error: 'Failed to fetch levels' });
  }
};

export const createLevel = async (req: Request, res: Response): Promise<void> => {
  try {
    const level = await prisma.level.create({
      data: req.body,
    });
    res.status(201).json(level);
  } catch (error: any) {
    logger.error('Create level error', error);
    res.status(400).json({ error: error.message || 'Failed to create level' });
  }
};

export const updateLevel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const level = await prisma.level.update({
      where: { id },
      data: req.body,
    });
    res.json(level);
  } catch (error: any) {
    logger.error('Update level error', error);
    res.status(400).json({ error: error.message || 'Failed to update level' });
  }
};

export const deleteLevel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.level.delete({ where: { id } });
    res.json({ message: 'Level deleted successfully' });
  } catch (error: any) {
    logger.error('Delete level error', error);
    res.status(400).json({ error: error.message || 'Failed to delete level' });
  }
};

