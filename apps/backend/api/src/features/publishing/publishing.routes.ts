import { Router } from 'express';
import { TYPES } from '@/shared/types';
import { container } from '@/config/inversify';
import { IPublishingController } from './publishing.controller';

const router = Router();
const controller = container.get<IPublishingController>(TYPES.PublishingController);

router.post('/:id/publish', (req, res, next) => {
  controller.publishHunt(req, res).catch(next);
});

export default router;
