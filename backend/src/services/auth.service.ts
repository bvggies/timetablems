import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { logger } from '../utils/logger';

export interface RegisterData {
  pugId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'STUDENT' | 'LECTURER' | 'ADMIN';
  departmentId?: string;
  levelId?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterData) => {
  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email },
        { pugId: data.pugId },
      ],
    },
  });

  if (existingUser) {
    throw new Error('User with this email or PUG ID already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      pugId: data.pugId,
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role || 'STUDENT',
      departmentId: data.departmentId,
      levelId: data.levelId,
    },
    select: {
      id: true,
      pugId: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      departmentId: true,
      levelId: true,
    },
  });

  return user;
};

export const loginUser = async (data: LoginData) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check status
  if (user.status !== 'ACTIVE') {
    throw new Error('Account is not active');
  }

  // Verify password
  const isValid = await comparePassword(data.password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Generate tokens
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: {
      id: user.id,
      pugId: user.pugId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      departmentId: user.departmentId,
      levelId: user.levelId,
    },
    accessToken,
    refreshToken,
  };
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      level: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

