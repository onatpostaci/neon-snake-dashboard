import type { Request, Response } from 'express';

import { HttpError } from '../errors/httpError.js';
import { gameplayService } from '../services/gameplay.service.js';

const sessionLimit = (value: unknown): number => {
  const requestedLimit = Number(value ?? 100);
  if (!Number.isInteger(requestedLimit)) return 100;
  return Math.min(200, Math.max(1, requestedLimit));
};

const sessionsFrom = (value: unknown): number => {
  if (value === undefined) return 0;

  const from = Number(value);
  if (!Number.isInteger(from) || from < 0) {
    throw new HttpError(400, 'from must be a time in milliseconds.');
  }
  return from;
};

export const gameplayController = {
  async recordEvent(request: Request, response: Response): Promise<void> {
    const event = await gameplayService.recordEvent(request.body);
    response.status(201).json({ event });
  },

  async listSessions(request: Request, response: Response): Promise<void> {
    const sessions = await gameplayService.listSessions(
      sessionsFrom(request.query.from),
      sessionLimit(request.query.limit)
    );
    response.json({ sessions });
  },

  async getSession(request: Request, response: Response): Promise<void> {
    const session = await gameplayService.getSession(String(request.params.sessionId));
    response.json({ session });
  }
};
