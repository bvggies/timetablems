import { Request, Response } from 'express';
import prisma from '../config/database';
import { hashPassword } from '../utils/bcrypt';
import { logger } from '../utils/logger';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, departmentId, status, search } = req.query;
    
    const where: any = {};
    if (role) where.role = role;
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { pugId: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        pugId: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        departmentId: true,
        levelId: true,
        department: {
          select: { id: true, code: true, name: true },
        },
        level: {
          select: { id: true, code: true, name: true },
        },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error: any) {
    logger.error('Get users error', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        pugId: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        profilePhoto: true,
        role: true,
        status: true,
        departmentId: true,
        levelId: true,
        department: {
          select: { id: true, code: true, name: true },
        },
        level: {
          select: { id: true, code: true, name: true },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error: any) {
    logger.error('Get user error', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password, ...userData } = req.body;
    
    if (!password) {
      res.status(400).json({ error: 'Password is required' });
      return;
    }

    const passwordHash = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: {
        ...userData,
        passwordHash,
      },
      select: {
        id: true,
        pugId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    res.status(201).json(user);
  } catch (error: any) {
    logger.error('Create user error', error);
    res.status(400).json({ error: error.message || 'Failed to create user' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { password, ...updateData } = req.body;

    const data: any = { ...updateData };
    if (password) {
      data.passwordHash = await hashPassword(password);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        pugId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    res.json(user);
  } catch (error: any) {
    logger.error('Update user error', error);
    res.status(400).json({ error: error.message || 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    logger.error('Delete user error', error);
    res.status(400).json({ error: error.message || 'Failed to delete user' });
  }
};

