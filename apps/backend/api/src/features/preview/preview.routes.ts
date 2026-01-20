import { Router } from 'express';
import { TYPES } from '@/shared/types';
import { container } from '@/config/inversify';
import { IPreviewController } from './preview.controller';
import { IPlayController } from '@/features/play/play.controller';
import { validateRequest } from '@/shared/middlewares';
import { navigateSchema } from '@/features/play/play.validation';

const router = Router();
const previewController = container.get<IPreviewController>(TYPES.PreviewController);
const playController = container.get<IPlayController>(TYPES.PlayController);

router.post('/sessions', (req, res, next) => {
  previewController.startPreviewSession(req, res).catch(next);
});

router.post('/sessions/:sessionId/navigate', validateRequest(navigateSchema), (req, res, next) => {
  playController.navigate(req, res).catch(next);
});

export default router;
