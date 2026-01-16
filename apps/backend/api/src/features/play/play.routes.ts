import { Router } from 'express';
import { TYPES } from '@/shared/types';
import { container } from '@/config/inversify';
import { IPlayController } from './play.controller';
import { validateRequest, validateQuery, optionalAuthMiddleware } from '@/shared/middlewares';
import { startSessionSchema, validateAnswerSchema, hintRequestSchema, discoverQuerySchema } from './play.validation';

const router = Router();
const controller = container.get<IPlayController>(TYPES.PlayController);

// Discovery endpoint - development only
router.get(
  '/discover',
  (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ error: 'Not found' });
    }
    next();
  },
  validateQuery(discoverQuerySchema),
  (req, res, next) => {
    controller.discoverHunts(req, res).catch(next);
  },
);

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
