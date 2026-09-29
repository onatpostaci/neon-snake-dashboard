import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '../errors/httpError.js';

export const errorHandler = (error: unknown, _request: Request, response: Response, _next: NextFunction): void => {
  if (error instanceof HttpError) {
    response.status(error.status).json({ error: error.message });
    return;
  }

  console.error(error);
  response.status(500).json({ error: 'The event could not be saved.' });
};
