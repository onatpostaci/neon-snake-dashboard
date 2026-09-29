import type { NextFunction, Request, Response } from 'express';

export const asyncHandler =
  (handler: (request: Request, response: Response) => Promise<void>) =>
  (request: Request, response: Response, next: NextFunction): void => {
    handler(request, response).catch(next);
  };
