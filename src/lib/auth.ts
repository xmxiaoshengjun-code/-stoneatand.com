import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import type { NextRequest } from 'next/server';

/** JWT secret key encoded as Uint8Array for jose library. Must be set via JWT_SECRET env var in production. */
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'DEV-ONLY-DO-NOT-USE-IN-PRODUCTION'
);

/** JWT token expiration time. */
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/** Cookie name for storing the admin JWT token. */
export const ADMIN_COOKIE_NAME = 'admin_token';

/** Payload structure embedded in the JWT token. */
export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Signs a JWT token containing user identity information.
 *
 * @param payload - The user data to embed in the token.
 * @returns A signed JWT string valid for 7 days.
 */
export async function signToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT token and returns the decoded payload.
 *
 * @param token - The JWT token string to verify.
 * @returns The decoded token payload, or null if verification fails.
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: Number(payload.userId),
      email: String(payload.email),
      role: String(payload.role),
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

/**
 * Hashes a plaintext password using bcrypt.
 *
 * @param password - The plaintext password to hash.
 * @returns A bcrypt-hashed password string.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compares a plaintext password against a bcrypt hash.
 *
 * @param password - The plaintext password to check.
 * @param hash - The bcrypt hash to compare against.
 * @returns True if the password matches the hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Cookie options for setting the admin token in httpOnly cookie.
 */
export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

/**
 * Checks whether the incoming request has a valid admin JWT token.
 *
 * Reads the token from the httpOnly cookie set during login and verifies
 * it with jose. Returns true only if the token is present and valid.
 *
 * @param request - The incoming NextRequest.
 * @returns true if the request is from an authenticated admin user.
 */
export async function requireAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload !== null;
}
