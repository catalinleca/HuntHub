import express from 'express';
import { TYPES } from '@/types';
import { container } from '@/config/inversify';
import { IHuntController } from '@/controllers/hunt.controller';
import { validateRequest } from '@/middlewares/validation.middleware';
import { createHuntSchema } from '@/validation';

const huntRouter = express.Router();
const controller = container.get<IHuntController>(TYPES.HuntController);

huntRouter.post('/', validateRequest(createHuntSchema), (req, res, next) => {
  controller.createHunt(req, res).catch(next);
});

huntRouter.get('/', (req, res, next) => {
  controller.getAllUserHunts(req, res).catch(next);
});

huntRouter.get('/:id', (req, res, next) => {
  controller.getUserHuntById(req, res).catch(next);
});

export default huntRouter;
