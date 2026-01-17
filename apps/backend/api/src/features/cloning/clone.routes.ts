import { Router } from 'express';
import { TYPES } from '@/shared/types';
import { container } from '@/config/inversify';
import { ICloneController } from './clone.controller';
import { validateRequest } from '@/shared/middlewares';
import { cloneHuntSchema } from './clone.validation';

const router = Router();
const controller = container.get<ICloneController>(TYPES.CloneController);

router.post('/:id/clone', validateRequest(cloneHuntSchema), (req, res, next) => {
  controller.cloneHunt(req, res).catch(next);
});

export default router;
