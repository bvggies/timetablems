import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export const getSemesters = async (req: Request, res: Response): Promise<void> => {
  try {
    const semesters = await prisma.semester.findMany({
      orderBy: [
        { year: 'desc' },
        { term: 'asc' },
      ],
    });
    res.json(semesters);
  } catch (error: any) {
    logger.error('Get semesters error', error);
    res.status(500).json({ error: 'Failed to fetch semesters' });
  }
};

export const createSemester = async (req: Request, res: Response): Promise<void> => {
  try {
    const semester = await prisma.semester.create({
      data: req.body,
    });
    res.status(201).json(semester);
  } catch (error: any) {
    logger.error('Create semester error', error);
    res.status(400).json({ error: error.message || 'Failed to create semester' });
  }
};

export const updateSemester = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const semester = await prisma.semester.update({
      where: { id },
      data: req.body,
    });
    res.json(semester);
  } catch (error: any) {
    logger.error('Update semester error', error);
    res.status(400).json({ error: error.message || 'Failed to update semester' });
  }
};

export const deleteSemester = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.semester.delete({ where: { id } });
    res.json({ message: 'Semester deleted successfully' });
  } catch (error: any) {
    logger.error('Delete semester error', error);
    res.status(400).json({ error: error.message || 'Failed to delete semester' });
  }
};

