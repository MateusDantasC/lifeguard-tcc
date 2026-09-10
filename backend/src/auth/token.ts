import { SignJWT, jwtVerify } from 'jose';
import { env } from '../config/env.js';
import { UserType } from '../generated/prisma/enums.js';

const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function createAccessToken(userId: string, type: UserType, sessionVersion: number, sessionId?: string) {
  return new SignJWT({ type, sessionVersion, ...(sessionId ? { sid: sessionId } : {}) })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secret);

  if (!payload.sub || (payload.type !== UserType.ELDER && payload.type !== UserType.CAREGIVER)) {
    throw new Error('Token inválido');
  }

  const sessionVersion = typeof payload.sessionVersion === 'number' ? payload.sessionVersion : 0;
  const sessionId = typeof payload.sid === 'string' ? payload.sid : undefined;
  return { userId: payload.sub, type: payload.type, sessionVersion, sessionId };
}
