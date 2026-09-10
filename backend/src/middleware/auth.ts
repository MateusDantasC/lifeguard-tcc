import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../auth/token.js';
import { HttpError } from '../lib/http-error.js';
import { prisma } from '../lib/prisma.js';

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.header('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    next(new HttpError(401, 'Autenticação necessária.', 'AUTH_REQUIRED'));
    return;
  }

  try {
    const token = await verifyAccessToken(authorization.slice(7));
    const user = await prisma.user.findUnique({
      where: { id: token.userId },
      select: { type: true, sessionVersion: true },
    });
    if (!user || user.type !== token.type || user.sessionVersion !== token.sessionVersion) {
      throw new Error('Sessão revogada');
    }
    req.auth = token;
    next();
  } catch {
    next(new HttpError(401, 'Token inválido ou expirado.', 'INVALID_TOKEN'));
  }
}
