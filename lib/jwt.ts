import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { NextRequest } from 'next/server';

export interface AuthPayload extends JWTPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'gidalink-secret-change-in-production-min32chars!!'
);

export async function signJWT(payload: Omit<AuthPayload, keyof JWTPayload>): Promise<string> {
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyJWT(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as AuthPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const cookie = request.cookies.get('token')?.value;
  if (cookie) return cookie;
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}
