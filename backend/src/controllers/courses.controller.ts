import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { departmentId, levelId, search } = req.query;
    
    const where: any = {};
    if (departmentId) where.departmentId = departmentId as string;
    if (levelId) where.levelId = levelId as string;
    if (search) {
      where.OR = [
        { code: { contains: search as string, mode: 'insensitive' } },
        { title: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        Department: {
          select: { id: true, code: true, name: true },
        },
        Level: {
          select: { id: true, code: true, name: true },
        },
      },
      orderBy: { code: 'asc' },
    });

    res.json(courses);
  } catch (error: any) {
    logger.error('Get courses error', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await prisma.course.create({
      data: req.body,
      include: {
        Department: true,
        Level: true,
      },
    });
    res.status(201).json(course);
  } catch (error: any) {
    logger.error('Create course error', error);
    res.status(400).json({ error: error.message || 'Failed to create course' });
  }
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const course = await prisma.course.update({
      where: { id },
      data: req.body,
      include: {
        Department: true,
        Level: true,
      },
    });
    res.json(course);
  } catch (error: any) {
    logger.error('Update course error', error);
    res.status(400).json({ error: error.message || 'Failed to update course' });
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.course.delete({ where: { id } });
    res.json({ message: 'Course deleted successfully' });
  } catch (error: any) {
    logger.error('Delete course error', error);
    res.status(400).json({ error: error.message || 'Failed to delete course' });
  }
};

