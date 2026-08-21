import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../lib/http-error.js';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.', codigo: 'NOT_FOUND' });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      erro: 'Dados inválidos.',
      codigo: 'VALIDATION_ERROR',
      campos: error.flatten().fieldErrors,
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({ erro: error.message, codigo: error.code });
    return;
  }

  console.error(error);
  res.status(500).json({ erro: 'Erro interno do servidor.', codigo: 'INTERNAL_ERROR' });
};
