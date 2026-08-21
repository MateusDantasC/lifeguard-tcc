import { SignJWT, jwtVerify } from 'jose';
import { env } from '../config/env.js';
import { UserType } from '../generated/prisma/enums.js';

const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function createAccessToken(userId: string, type: UserType) {
  return new SignJWT({ type })
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

  return { userId: payload.sub, type: payload.type };
}
