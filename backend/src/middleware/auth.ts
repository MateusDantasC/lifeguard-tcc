import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../auth/token.js';
import { HttpError } from '../lib/http-error.js';

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.header('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    next(new HttpError(401, 'Autenticação necessária.', 'AUTH_REQUIRED'));
    return;
  }

  try {
    req.auth = await verifyAccessToken(authorization.slice(7));
    next();
  } catch {
    next(new HttpError(401, 'Token inválido ou expirado.', 'INVALID_TOKEN'));
  }
}
