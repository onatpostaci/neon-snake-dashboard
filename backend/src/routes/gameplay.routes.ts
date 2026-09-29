import { Router } from 'express';

import { gameplayController } from '../controllers/gameplay.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const gameplayRouter = Router();

gameplayRouter.post('/events', asyncHandler(gameplayController.recordEvent));
gameplayRouter.get('/sessions', asyncHandler(gameplayController.listSessions));
gameplayRouter.get('/sessions/:sessionId', asyncHandler(gameplayController.getSession));
