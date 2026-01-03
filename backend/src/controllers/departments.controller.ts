import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export const getDepartments = async (req: Request, res: Response): Promise<void> => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { code: 'asc' },
    });
    res.json(departments);
  } catch (error: any) {
    logger.error('Get departments error', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
};

export const createDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const department = await prisma.department.create({
      data: req.body,
    });
    res.status(201).json(department);
  } catch (error: any) {
    logger.error('Create department error', error);
    res.status(400).json({ error: error.message || 'Failed to create department' });
  }
};

export const updateDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const department = await prisma.department.update({
      where: { id },
      data: req.body,
    });
    res.json(department);
  } catch (error: any) {
    logger.error('Update department error', error);
    res.status(400).json({ error: error.message || 'Failed to update department' });
  }
};

export const deleteDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.department.delete({ where: { id } });
    res.json({ message: 'Department deleted successfully' });
  } catch (error: any) {
    logger.error('Delete department error', error);
    res.status(400).json({ error: error.message || 'Failed to delete department' });
  }
};

