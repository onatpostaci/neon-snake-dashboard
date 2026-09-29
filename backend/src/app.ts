import express from 'express';

import { errorHandler } from './middleware/errorHandler.js';
import { gameplayRouter } from './routes/gameplay.routes.js';

export const createApp = (): express.Express => {
  const app = express();

  app.use(express.json());
  app.get('/api/health', (_request, response) => {
    response.json({ ok: true });
  });
  app.use('/api', gameplayRouter);
  app.use(errorHandler);

  return app;
};
