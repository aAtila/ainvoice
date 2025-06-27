import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { User } from '@/lib/types';

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const COOKIE_NAME = 'ainvoice-auth';

export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Set authentication cookie
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Get authentication cookie
 */
export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

/**
 * Clear authentication cookie
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Get current user from authentication cookie
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = await getAuthCookie();
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    return user;
  } catch {
    return null;
  }
}

/**
 * Check if a user exists by email
 */
export async function userExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return !!user;
}

/**
 * Create a new user
 */
export async function createUser(data: {
  email: string;
  password: string;
  companyName?: string;
}): Promise<User> {
  const hashedPassword = await hashPassword(data.password);
  
  return prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      companyName: data.companyName,
    },
  });
}

/**
 * Authenticate a user with email and password
 */
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return null;

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return null;

  return user;
}

/**
 * Generate and set authentication cookie for a user
 */
export async function loginUser(user: User): Promise<string> {
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  await setAuthCookie(token);
  return token;
}