import { Router } from 'express';
import { TYPES } from '@/shared/types';
import { container } from '@/config/inversify';
import { IPublishingController } from './publishing.controller';
import { validateRequest } from '@/shared/middlewares';
import { releaseHuntSchema, takeOfflineSchema } from './publishing.validation';

const router = Router();
const controller = container.get<IPublishingController>(TYPES.PublishingController);

router.post('/:id/publish', (req, res, next) => {
  controller.publishHunt(req, res).catch(next);
});

router.put('/:id/release', validateRequest(releaseHuntSchema), (req, res, next) => {
  controller.releaseHunt(req, res).catch(next);
});

router.delete('/:id/release', validateRequest(takeOfflineSchema), (req, res, next) => {
  controller.takeOffline(req, res).catch(next);
});

router.get('/:id/versions', (req, res, next) => {
  controller.getVersionHistory(req, res).catch(next);
});

export default router;
