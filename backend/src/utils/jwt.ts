import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const secret = env.JWT_SECRET;
  if (!secret || secret === 'default-secret-change-in-production') {
    throw new Error('JWT_SECRET is not configured');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, secret, { expiresIn: env.JWT_EXPIRES_IN } as any);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret = env.JWT_REFRESH_SECRET;
  if (!secret || secret === 'default-refresh-secret-change-in-production') {
    throw new Error('JWT_REFRESH_SECRET is not configured');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, secret, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as any);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  const secret = env.JWT_SECRET;
  if (!secret || secret === 'default-secret-change-in-production') {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.verify(token, secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  const secret = env.JWT_REFRESH_SECRET;
  if (!secret || secret === 'default-refresh-secret-change-in-production') {
    throw new Error('JWT_REFRESH_SECRET is not configured');
  }
  return jwt.verify(token, secret) as TokenPayload;
};
