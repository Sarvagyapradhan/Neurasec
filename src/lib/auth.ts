import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export interface JWTPayload {
  userId: string | number;
  email: string;
  username: string;
}

export const generateToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

export const verifyToken = async (token: string): Promise<JWTPayload> => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const getUserById = async (userId: string | number) => {
  // Parse userId to number if it's a string
  const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;
  
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return user;
};

export const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      password: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return user;
};

export const validateUser = async (email: string, password: string) => {
  const user = await getUserByEmail(email);
  
  if (!user) {
    return { success: false, message: 'User not found' };
  }

  const isValidPassword = await comparePasswords(password, user.password);
  
  if (!isValidPassword) {
    return { success: false, message: 'Invalid password' };
  }

  // Check if 2FA is required for this user
  const requiresOTP = user.role === 'ADMIN' || process.env.FORCE_2FA === 'true';

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    },
    requiresOTP
  };
}; 