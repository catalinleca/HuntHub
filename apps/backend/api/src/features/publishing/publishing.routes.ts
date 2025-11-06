import { Router } from 'express';
import { TYPES } from '@/shared/types';
import { container } from '@/config/inversify';
import { IPublishingController } from './publishing.controller';

const router = Router();
const controller = container.get<IPublishingController>(TYPES.PublishingController);

// TODO: zod schemas

router.post('/:id/publish', (req, res, next) => {
  controller.publishHunt(req, res).catch(next);
});

router.put('/:id/release', (req, res, next) => {
  controller.releaseHunt(req, res).catch(next);
});

router.delete('/:id/release', (req, res, next) => {
  controller.takeOffline(req, res).catch(next);
});

export default router;
