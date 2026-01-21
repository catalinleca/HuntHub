import express from 'express';
import { GenerateHuntRequest } from '@hunthub/shared/schemas';
import { TYPES } from '@/shared/types';
import { container } from '@/config/inversify';
import { IAIHuntGenerationController } from './ai-hunt-generation.controller';
import { validateRequest, aiGenerationLimiter } from '@/shared/middlewares';

const aiHuntGenerationRouter = express.Router();
const controller = container.get<IAIHuntGenerationController>(TYPES.AIHuntGenerationController);

aiHuntGenerationRouter.post(
  '/generate',
  aiGenerationLimiter,
  validateRequest(GenerateHuntRequest),
  (req, res, next) => {
    controller.generateHunt(req, res).catch(next);
  },
);

export default aiHuntGenerationRouter;
