import { Router } from 'express';
import { TYPES } from '@/shared/types';
import { container } from '@/config/inversify';
import { IPlayController } from './play.controller';
import { validateRequest, optionalAuthMiddleware } from '@/shared/middlewares';
import { startSessionSchema, validateAnswerSchema, hintRequestSchema } from './play.validation';

const router = Router();
const controller = container.get<IPlayController>(TYPES.PlayController);

// Public discovery endpoint - no auth needed
router.get('/discover', (req, res, next) => {
  controller.discoverHunts(req, res).catch(next);
});

router.post('/:huntId/start', optionalAuthMiddleware, validateRequest(startSessionSchema), (req, res, next) => {
  controller.startSession(req, res).catch(next);
});

router.get('/sessions/:sessionId', (req, res, next) => {
  controller.getSession(req, res).catch(next);
});

router.get('/sessions/:sessionId/step/:stepId', (req, res, next) => {
  controller.getStep(req, res).catch(next);
});

router.post('/sessions/:sessionId/validate', validateRequest(validateAnswerSchema), (req, res, next) => {
  controller.validateAnswer(req, res).catch(next);
});

router.post('/sessions/:sessionId/hint', validateRequest(hintRequestSchema), (req, res, next) => {
  controller.requestHint(req, res).catch(next);
});

export default router;
