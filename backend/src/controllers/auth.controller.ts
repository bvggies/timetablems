import { Request, Response } from 'express';
import { registerUser, loginUser, getUserById } from '../services/auth.service';
import { verifyRefreshToken, generateAccessToken } from '../utils/jwt';
import { logger } from '../utils/logger';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (error: any) {
    logger.error('Registration error', error);
    res.status(400).json({
      error: error.message || 'Registration failed',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (error: any) {
    logger.error('Login error', error);
    res.status(401).json({
      error: error.message || 'Login failed',
    });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const payload = verifyRefreshToken(refreshToken);
    
    // Generate new access token
    const accessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    res.json({ accessToken });
  } catch (error: any) {
    logger.error('Token refresh error', error);
    res.status(401).json({
      error: 'Invalid or expired refresh token',
    });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await getUserById(req.user.userId);
    res.json(user);
  } catch (error: any) {
    logger.error('Get user error', error);
    res.status(404).json({
      error: error.message || 'User not found',
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  // With JWT, logout is handled client-side by removing tokens
  // In a more advanced setup, you could maintain a token blacklist
  res.json({ message: 'Logged out successfully' });
};

